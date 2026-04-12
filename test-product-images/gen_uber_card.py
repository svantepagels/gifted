#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

W, H = 2400, 1600

# Create dark background with radial gradient
bg = Image.new('RGB', (W, H), (0, 0, 0))
draw_bg = ImageDraw.Draw(bg)
cx, cy = W // 2, int(H * 0.45)
max_r = int(W * 0.65)
for r in range(max_r, 0, -2):
    t = r / max_r
    v = int(22 * (1 - t * t))
    color = (v, v, v)
    draw_bg.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)

# Create card (flat, will be perspective-transformed later)
card_w = int(W * 0.75)  # slightly smaller for perspective room
card_h = int(card_w / 1.586)
card = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
draw_card = ImageDraw.Draw(card)

# Draw rounded rectangle
radius = 28
draw_card.rounded_rectangle([0, 0, card_w - 1, card_h - 1], radius=radius, fill=(245, 245, 245, 255))

# Add gradient overlay on card
for y in range(card_h):
    for x in range(0, card_w, 1):
        # Skip non-card pixels
        if card.getpixel((x, y))[3] == 0:
            continue
        # Gradient: brighter top-left, darker bottom-right
        tx = x / card_w
        ty = y / card_h
        brightness = 1.0 - 0.07 * (tx * 0.4 + ty * 0.6)
        # Radial highlight from upper-left
        dx = (x - card_w * 0.25) / card_w
        dy = (y - card_h * 0.2) / card_h
        dist = math.sqrt(dx * dx + dy * dy)
        highlight = max(0, 0.06 * (1 - dist / 0.6)) if dist < 0.6 else 0
        
        r, g, b, a = card.getpixel((x, y))
        r = min(255, int(r * brightness + highlight * 255))
        g = min(255, int(g * brightness + highlight * 255))
        b = min(255, int(b * brightness + highlight * 255))
        card.putpixel((x, y), (r, g, b, a))

# Draw "Uber" text centered
target_text_h = int(card_h * 0.22)  # 22% of card height
# Try system fonts
font = None
for fname in ['/System/Library/Fonts/Helvetica.ttc', '/System/Library/Fonts/SFNSDisplay.ttf', 
              '/Library/Fonts/Arial Bold.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf']:
    try:
        font = ImageFont.truetype(fname, target_text_h)
        break
    except:
        pass
if font is None:
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', target_text_h)

# Measure text for perfect centering
text = "Uber"
bbox = draw_card.textbbox((0, 0), text, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]
# Center position accounting for bbox offset
text_x = (card_w - text_w) / 2 - bbox[0]
text_y = (card_h - text_h) / 2 - bbox[1]
draw_card.text((text_x, text_y), text, fill=(0, 0, 0, 255), font=font)

# Apply perspective transform (3D tilt)
# Define source corners (flat card) and destination corners (tilted)
def perspective_transform(img, coeffs):
    return img.transform(img.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)

# Create larger canvas for perspective card
persp_w, persp_h = int(W * 0.9), int(H * 0.85)
# Perspective coefficients: slight rotation
# Map from tilted card to flat - we need to find coefficients
# Simulating rotateY(-7deg) rotateX(3deg)
# Source corners of card
sw, sh = card_w, card_h
# Approximate 3D perspective: right side slightly compressed, top slightly narrower
tilt = 0.04  # amount of horizontal perspective
vtilt = 0.02  # vertical
src = [(0, 0), (sw, 0), (sw, sh), (0, sh)]
dst = [
    (int(sw * tilt), int(sh * vtilt)),         # top-left: shifted right and down
    (int(sw * (1 - tilt * 0.5)), 0),            # top-right: shifted left slightly
    (sw, int(sh * (1 - vtilt * 0.5))),           # bottom-right
    (0, sh),                                      # bottom-left
]

# Use PIL perspective transform via finding coefficients
import numpy as np
def find_coeffs(source_coords, target_coords):
    matrix = []
    for s, t in zip(source_coords, target_coords):
        matrix.append([t[0], t[1], 1, 0, 0, 0, -s[0]*t[0], -s[0]*t[1]])
        matrix.append([0, 0, 0, t[0], t[1], 1, -s[1]*t[0], -s[1]*t[1]])
    A = np.matrix(matrix, dtype=np.float64)
    B = np.array([s for pair in source_coords for s in pair]).reshape(8)
    res = np.dot(np.linalg.inv(A.T * A) * A.T, B)
    return np.array(res).reshape(8)

coeffs = find_coeffs(dst, src)
card_persp = card.transform((card_w, card_h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)

# Create shadow
shadow = Image.new('RGBA', (card_w + 200, card_h + 200), (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow)
shadow_draw.rounded_rectangle([100, 100, card_w + 99, card_h + 99], radius=radius, fill=(0, 0, 0, 180))
# Apply same perspective to shadow
shadow_persp = shadow.transform(shadow.size, Image.PERSPECTIVE, 
    find_coeffs([(d[0]+100, d[1]+100) for d in dst] if False else
                [(dst[0][0]+100, dst[0][1]+100), (dst[1][0]+100, dst[1][1]+100),
                 (dst[2][0]+100, dst[2][1]+100), (dst[3][0]+100, dst[3][1]+100)],
                [(100, 100), (card_w+99, 100), (card_w+99, card_h+99), (100, card_h+99)]),
    Image.BICUBIC)
shadow_persp = shadow_persp.filter(ImageFilter.GaussianBlur(radius=60))

# Composite onto background
# Center card on background
paste_x = (W - card_w) // 2
paste_y = (H - card_h) // 2

# Paste shadow (offset down and right)
shadow_x = paste_x - 100 + 15
shadow_y = paste_y - 100 + 40
bg.paste(Image.new('RGB', shadow_persp.size, (0,0,0)), (shadow_x, shadow_y), shadow_persp)

# Paste card
bg.paste(card_persp, (paste_x, paste_y), card_persp)

bg.save('/Users/administrator/.openclaw/workspace/gifted-project/test-product-images/uber-gift-card-v1-iter6.png')
print("Done")
