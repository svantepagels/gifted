#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter
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

# Create card with gradient
card = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(card)
draw.rounded_rectangle([0, 0, card_w - 1, card_h - 1], radius=30, fill=(248, 248, 248, 255))

# Gradient overlay using numpy
card_np = np.array(card).astype(np.float32)
Yc, Xc = np.mgrid[0:card_h, 0:card_w]
grad = 1.0 - 0.06 * (Xc / card_w * 0.4 + Yc / card_h * 0.6)
dx = (Xc - card_w * 0.25) / card_w
dy = (Yc - card_h * 0.2) / card_h
dist_hl = np.sqrt(dx**2 + dy**2)
highlight = np.where(dist_hl < 0.5, 0.08 * (1 - dist_hl / 0.5), 0)
mask = card_np[:,:,3] > 0
for c in range(3):
    card_np[:,:,c] = np.where(mask, np.clip(card_np[:,:,c] * grad + highlight * 255, 0, 255), card_np[:,:,c])
card = Image.fromarray(card_np.astype(np.uint8))

# Draw "Uber" text with OPTICAL centering
font_size = int(card_h * 0.35)
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
text = "Uber"
txt_layer = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
txt_draw = ImageDraw.Draw(txt_layer)
bbox = txt_draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
print(f"Text size: {tw}x{th}, {th/card_h*100:.1f}% of card height")

# Optical centering: shift down by 3% of card height for text without descenders
optical_shift_y = 0  # no shift - keep mathematical center
tx = (card_w - tw) / 2 - bbox[0]
ty = (card_h - th) / 2 - bbox[1] + optical_shift_y
txt_draw.text((tx, ty), text, fill=(0, 0, 0, 255), font=font)
card = Image.alpha_composite(card, txt_layer)

# More aggressive perspective transform
def find_coeffs(src, dst):
    matrix = []
    for s, t in zip(src, dst):
        matrix.append([t[0], t[1], 1, 0, 0, 0, -s[0]*t[0], -s[0]*t[1]])
        matrix.append([0, 0, 0, t[0], t[1], 1, -s[1]*t[0], -s[1]*t[1]])
    A = np.array(matrix, dtype=np.float64)
    B = np.array([s for pair in src for s in pair], dtype=np.float64)
    return np.linalg.lstsq(A, B, rcond=None)[0].tolist()

# Stronger 3D tilt
margin = 120
out_w, out_h = card_w + margin * 2, card_h + margin * 2

# Source corners (flat card in padded space)
src = [(margin, margin), (margin + card_w, margin), 
       (margin + card_w, margin + card_h), (margin, margin + card_h)]

# Destination: simulate rotateY(-10deg) rotateX(5deg)
# Right side compressed, top slightly compressed
# Very aggressive perspective for convincing 3D
# Simulate looking at card from slight upper-left angle
# Right side narrower (foreshortening), slight rotation
shrink_r = int(card_h * 0.12)  # right edge 12% shorter
shift_top = int(card_w * 0.03)  # top tilts back
dst = [
    (margin + shift_top, margin + int(shrink_r * 0.3)),             # top-left
    (margin + card_w - shift_top, margin),                           # top-right  
    (margin + card_w, margin + card_h - shrink_r),                   # bottom-right (compressed)
    (margin, margin + card_h),                                        # bottom-left (full)
]

coeffs = find_coeffs(dst, src)

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
shadow_persp = shadow_persp.filter(ImageFilter.GaussianBlur(radius=65))

# Composite
paste_x = (W - out_w) // 2
paste_y = (H - out_h) // 2

# Shadow (offset for depth)
bg_img.paste(Image.new('RGB', shadow_persp.size, (0, 0, 0)), 
             (paste_x + 12, paste_y + 45), shadow_persp)
# Card
bg_img.paste(card_persp, (paste_x, paste_y), card_persp)

# Subtle surface reflection below
refl = Image.new('RGBA', (W, 80), (0,0,0,0))
rd = ImageDraw.Draw(refl)
for y in range(80):
    alpha = int(12 * (1 - y/80))
    rd.line([(paste_x + margin + 50, y), (paste_x + margin + card_w - 50, y)], 
            fill=(200, 200, 200, alpha))
refl = refl.filter(ImageFilter.GaussianBlur(radius=15))
bg_img.paste(refl, (0, paste_y + out_h - 40), refl)

out_path = '/Users/administrator/.openclaw/workspace/gifted-project/test-product-images/uber-gift-card-v1-iter8.png'
bg_img.save(out_path)
print(f"Saved to {out_path}")
