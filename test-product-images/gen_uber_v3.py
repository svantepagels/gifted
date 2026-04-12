#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import math

W, H = 2400, 1600

# Dark background with radial gradient
bg = np.zeros((H, W, 3), dtype=np.uint8)
Y, X = np.mgrid[0:H, 0:W]
cx, cy = W // 2, int(H * 0.45)
dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
max_r = W * 0.65
intensity = np.clip(24 * (1 - (dist / max_r)**2), 0, 24).astype(np.uint8)
bg[:,:,0] = bg[:,:,1] = bg[:,:,2] = intensity
bg_img = Image.fromarray(bg)

# Card dimensions
card_w = int(W * 0.78)
card_h = int(card_w / 1.586)

# Create card with gradient
card = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(card)
draw.rounded_rectangle([0, 0, card_w - 1, card_h - 1], radius=30, fill=(248, 248, 248, 255))

# Gradient overlay
card_np = np.array(card).astype(np.float32)
Yc, Xc = np.mgrid[0:card_h, 0:card_w]
grad = 1.0 - 0.07 * (Xc / card_w * 0.3 + Yc / card_h * 0.7)
dx = (Xc - card_w * 0.3) / card_w
dy = (Yc - card_h * 0.2) / card_h
dist_hl = np.sqrt(dx**2 + dy**2)
highlight = np.where(dist_hl < 0.5, 0.1 * (1 - dist_hl / 0.5), 0)
mask = card_np[:,:,3] > 0
for c in range(3):
    card_np[:,:,c] = np.where(mask, np.clip(card_np[:,:,c] * grad + highlight * 255, 0, 255), card_np[:,:,c])
card = Image.fromarray(card_np.astype(np.uint8))

# Draw centered "Uber" text
font_size = int(card_h * 0.35)
font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
text = "Uber"
txt_layer = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
txt_draw = ImageDraw.Draw(txt_layer)
bbox = txt_draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
tx = (card_w - tw) / 2 - bbox[0]
ty = (card_h - th) / 2 - bbox[1]
txt_draw.text((tx, ty), text, fill=(0, 0, 0, 255), font=font)
card = Image.alpha_composite(card, txt_layer)

# Apply perspective: use SYMMETRIC transformation to preserve centering
# Strategy: make the TOP edge shorter than BOTTOM (simulating looking from slightly above)
# and RIGHT edge shorter than LEFT (simulating looking from slightly left)
def find_coeffs(src, dst):
    matrix = []
    for s, t in zip(src, dst):
        matrix.append([t[0], t[1], 1, 0, 0, 0, -s[0]*t[0], -s[0]*t[1]])
        matrix.append([0, 0, 0, t[0], t[1], 1, -s[1]*t[0], -s[1]*t[1]])
    A = np.array(matrix, dtype=np.float64)
    B = np.array([s for pair in src for s in pair], dtype=np.float64)
    return np.linalg.lstsq(A, B, rcond=None)[0].tolist()

margin = 150
out_w, out_h = card_w + margin * 2, card_h + margin * 2

# Source: card rectangle
src = [(margin, margin), (margin + card_w, margin),
       (margin + card_w, margin + card_h), (margin, margin + card_h)]

# Perspective destination: 
# Compress right side by 10% and top by 4%
# But OFFSET the card center so the visual center of the quad matches image center
right_shrink = int(card_h * 0.10)
top_shrink = int(card_w * 0.035)

dst = [
    (margin + top_shrink, margin + int(right_shrink * 0.5)),   # TL
    (margin + card_w - top_shrink, margin),                     # TR
    (margin + card_w, margin + card_h - right_shrink),          # BR  
    (margin, margin + card_h),                                   # BL
]

# Compute centroid of destination quad
dst_cx = sum(p[0] for p in dst) / 4
dst_cy = sum(p[1] for p in dst) / 4
# Compute centroid of source
src_cx = margin + card_w / 2
src_cy = margin + card_h / 2
# Shift dst so centroid matches src centroid (keeps text visually centered)
dx_shift = src_cx - dst_cx
dy_shift = src_cy - dst_cy
dst = [(p[0] + dx_shift, p[1] + dy_shift) for p in dst]

coeffs = find_coeffs(dst, src)

# Apply perspective to card
card_padded = Image.new('RGBA', (out_w, out_h), (0, 0, 0, 0))
card_padded.paste(card, (margin, margin))
card_persp = card_padded.transform((out_w, out_h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)

# Shadow
shadow_base = Image.new('RGBA', (out_w, out_h), (0, 0, 0, 0))
sd = ImageDraw.Draw(shadow_base)
sd.rounded_rectangle([margin, margin, margin + card_w - 1, margin + card_h - 1],
                      radius=30, fill=(0, 0, 0, 220))
shadow_persp = shadow_base.transform((out_w, out_h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
shadow_persp = shadow_persp.filter(ImageFilter.GaussianBlur(radius=70))

# Composite
paste_x = (W - out_w) // 2
paste_y = (H - out_h) // 2

bg_img.paste(Image.new('RGB', shadow_persp.size, (0, 0, 0)),
             (paste_x + 15, paste_y + 50), shadow_persp)
bg_img.paste(card_persp, (paste_x, paste_y), card_persp)

out_path = '/Users/administrator/.openclaw/workspace/gifted-project/test-product-images/uber-gift-card-v1.png'
bg_img.save(out_path)
print(f"Done! Saved to {out_path}")
print(f"Text: {tw}x{th} = {th/card_h*100:.1f}% of card height")
print(f"Centroid shift: dx={dx_shift:.1f}, dy={dy_shift:.1f}")
