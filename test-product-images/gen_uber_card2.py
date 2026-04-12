#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import numpy as np

W, H = 2400, 1600

# Dark background with radial gradient
bg = np.zeros((H, W, 3), dtype=np.uint8)
Y, X = np.mgrid[0:H, 0:W]
cx, cy = W // 2, int(H * 0.45)
dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
max_r = W * 0.65
intensity = np.clip(22 * (1 - (dist / max_r)**2), 0, 22).astype(np.uint8)
bg[:,:,0] = bg[:,:,1] = bg[:,:,2] = intensity
bg_img = Image.fromarray(bg)

# Card dimensions
card_w = int(W * 0.78)
card_h = int(card_w / 1.586)

# Create card
card = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(card)
draw.rounded_rectangle([0, 0, card_w - 1, card_h - 1], radius=30, fill=(248, 248, 248, 255))

# Add gradient via numpy
card_np = np.array(card).astype(np.float32)
Yc, Xc = np.mgrid[0:card_h, 0:card_w]
# Brightness gradient: brighter upper-left
grad = 1.0 - 0.06 * (Xc / card_w * 0.4 + Yc / card_h * 0.6)
# Upper-left highlight
dx = (Xc - card_w * 0.25) / card_w
dy = (Yc - card_h * 0.2) / card_h
dist_hl = np.sqrt(dx**2 + dy**2)
highlight = np.where(dist_hl < 0.5, 0.08 * (1 - dist_hl / 0.5), 0)
for c in range(3):
    card_np[:,:,c] = np.clip(card_np[:,:,c] * grad + highlight * 255, 0, 255)
card = Image.fromarray(card_np.astype(np.uint8))

# Draw "Uber" text - perfectly centered
target_h = int(card_h * 0.35)  # oversized font to get 22% actual cap height
font = None
for fname in ['/System/Library/Fonts/Helvetica.ttc', '/System/Library/Fonts/Supplemental/Arial Bold.ttf']:
    try:
        font = ImageFont.truetype(fname, target_h)
        break
    except:
        pass
if font is None:
    raise RuntimeError("No font found")

# Create text layer for precise centering
txt_layer = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
txt_draw = ImageDraw.Draw(txt_layer)
text = "Uber"
bbox = txt_draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
tx = (card_w - tw) / 2 - bbox[0]
ty = (card_h - th) / 2 - bbox[1]
txt_draw.text((tx, ty), text, fill=(0, 0, 0, 255), font=font)
card = Image.alpha_composite(card, txt_layer)

# Perspective transform
def find_coeffs(src, dst):
    matrix = []
    for s, t in zip(src, dst):
        matrix.append([t[0], t[1], 1, 0, 0, 0, -s[0]*t[0], -s[0]*t[1]])
        matrix.append([0, 0, 0, t[0], t[1], 1, -s[1]*t[0], -s[1]*t[1]])
    A = np.array(matrix, dtype=np.float64)
    B = np.array([s for pair in src for s in pair], dtype=np.float64)
    res = np.linalg.lstsq(A, B, rcond=None)[0]
    return res.tolist()

# 3D perspective: slight tilt
margin = 80
out_w, out_h = card_w + margin * 2, card_h + margin * 2
# Source: rectangle in output space
src_pts = [(margin, margin), (margin + card_w, margin), 
           (margin + card_w, margin + card_h), (margin, margin + card_h)]
# Destination: tilted - right side slightly compressed, top slightly shifted
compress_r = 0.04  # right side compression
compress_t = 0.025  # top compression
dst_pts = [
    (margin + int(card_w * compress_t * 0.5), margin + int(card_h * compress_r * 0.3)),
    (margin + card_w - int(card_w * compress_t * 0.5), margin),
    (margin + card_w, margin + card_h - int(card_h * compress_r * 0.3)),
    (margin, margin + card_h),
]
coeffs = find_coeffs(dst_pts, src_pts)

# Expand card onto padded canvas
card_padded = Image.new('RGBA', (out_w, out_h), (0, 0, 0, 0))
card_padded.paste(card, (margin, margin))
card_persp = card_padded.transform((out_w, out_h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)

# Shadow
shadow_base = Image.new('RGBA', (out_w, out_h), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow_base)
sd.rounded_rectangle([margin, margin, margin + card_w - 1, margin + card_h - 1], 
                      radius=30, fill=(0, 0, 0, 200))
shadow_persp = shadow_base.transform((out_w, out_h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
shadow_persp = shadow_persp.filter(ImageFilter.GaussianBlur(radius=50))

# Composite
paste_x = (W - out_w) // 2
paste_y = (H - out_h) // 2

# Shadow offset
bg_img.paste(Image.new('RGB', shadow_persp.size, (0, 0, 0)), 
             (paste_x + 10, paste_y + 35), shadow_persp)
# Card
bg_img.paste(card_persp, (paste_x, paste_y), card_persp)

bg_img.save('/Users/administrator/.openclaw/workspace/gifted-project/test-product-images/uber-gift-card-v1-iter6.png')
print(f"Done. Card: {card_w}x{card_h}, text target h: {target_h}, actual bbox: {tw}x{th}")
