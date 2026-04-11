#!/usr/bin/env python3
"""High-quality Netflix gift card 3D render."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

W, H = 2400, 1600
CARD_W, CARD_H = 1000, 630

def radial_gradient_bg(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(float)
    cx, cy = w * 0.48, h * 0.45
    dist = np.sqrt((x - cx)**2 + (y - cy)**2)
    t = np.clip(dist / np.sqrt(cx**2 + cy**2), 0, 1)
    center = np.array([45, 43, 48])
    edge = np.array([8, 8, 10])
    pixels = np.zeros((h, w, 3), dtype=np.uint8)
    for c in range(3):
        pixels[:,:,c] = (center[c] + (edge[c] - center[c]) * t).astype(np.uint8)
    return Image.fromarray(pixels)

def create_card_face():
    card = Image.new('RGBA', (CARD_W, CARD_H), (20, 18, 22, 255))
    draw = ImageDraw.Draw(card)
    
    # Dark gradient fill
    for y in range(CARD_H):
        t = y / CARD_H
        r = int(22 + t * 8)
        g = int(18 + t * 6)
        b = int(22 + t * 8)
        draw.line([(0, y), (CARD_W, y)], fill=(r, g, b, 255))
    
    # Rounded corners mask
    mask = Image.new('L', (CARD_W, CARD_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, CARD_W-1, CARD_H-1], radius=35, fill=255)
    card.putalpha(mask)
    
    draw = ImageDraw.Draw(card)
    
    # Netflix N logo
    nx, ny = 70, 70
    nh, nw, bw = 140, 100, 24
    red = (229, 9, 20, 255)
    dark_red = (180, 5, 15, 255)
    
    # Left bar
    draw.rectangle([nx, ny, nx+bw, ny+nh], fill=red)
    # Right bar  
    draw.rectangle([nx+nw-bw, ny, nx+nw, ny+nh], fill=red)
    # Diagonal
    draw.polygon([(nx, ny), (nx+bw, ny), (nx+nw, ny+nh), (nx+nw-bw, ny+nh)], fill=red)
    # Shadow on left bar lower part
    draw.polygon([(nx, ny+int(nh*0.35)), (nx+bw, ny+int(nh*0.35)), (nx+bw, ny+nh), (nx, ny+nh)], fill=dark_red)
    
    # Fonts
    try:
        fp = "/System/Library/Fonts/Helvetica.ttc"
        f_brand = ImageFont.truetype(fp, 56)
        f_sub = ImageFont.truetype(fp, 28)
        f_amt = ImageFont.truetype(fp, 88)
        f_tiny = ImageFont.truetype(fp, 17)
    except:
        f_brand = f_sub = f_amt = f_tiny = ImageFont.load_default()
    
    draw.text((190, 110), "NETFLIX", fill=red, font=f_brand)
    draw.line([(72, 420), (320, 420)], fill=(55, 55, 60, 255), width=1)
    draw.text((72, 430), "$50", fill=(255, 255, 255, 255), font=f_amt)
    draw.text((72, 570), "Stream Movies & TV Shows", fill=(75, 75, 80, 255), font=f_tiny)
    
    # Dots for card number
    for grp in range(4):
        for dot in range(4):
            x = 580 + grp * 95 + dot * 18
            draw.ellipse([x, 570, x+8, 578], fill=(50, 50, 55, 255))
    
    # Subtle shine overlay
    shine = Image.new('RGBA', (CARD_W, CARD_H), (0, 0, 0, 0))
    yc, xc = np.mgrid[0:CARD_H, 0:CARD_W].astype(float)
    shine_val = np.clip(35 - np.abs(xc * 0.6 + yc - 200) * 0.1, 0, 30).astype(np.uint8)
    mask_arr = np.array(mask)
    shine_val = np.minimum(shine_val, mask_arr)
    shine_arr = np.zeros((CARD_H, CARD_W, 4), dtype=np.uint8)
    shine_arr[:,:,0] = 255; shine_arr[:,:,1] = 255; shine_arr[:,:,2] = 255
    shine_arr[:,:,3] = shine_val
    card = Image.alpha_composite(card, Image.fromarray(shine_arr))
    
    # Edge highlight
    edge_draw = ImageDraw.Draw(card)
    edge_draw.rounded_rectangle([0, 0, CARD_W-1, CARD_H-1], radius=35, outline=(75, 75, 80, 100), width=1)
    
    return card

def perspective_warp(img, cw, ch):
    src_w, src_h = img.size
    pad = 500
    ww, wh = cw + pad*2, ch + pad*2
    work = Image.new('RGBA', (ww, wh), (0,0,0,0))
    ox = (ww - src_w) // 2
    oy = (wh - src_h) // 2
    work.paste(img, (ox, oy), img)
    
    # Perspective coefficients for rightward tilt
    # Map destination quadrilateral to source quadrilateral
    src = [(ox, oy), (ox+src_w, oy), (ox+src_w, oy+src_h), (ox, oy+src_h)]
    
    # Card tilted: left side closer (larger), right side further (smaller)
    compress = 0.75
    vshift = 45
    hshift = 60
    dst = [
        (ox - hshift, oy + vshift),
        (ox + src_w + 30, oy + int(src_h*(1-compress)/2)),
        (ox + src_w + 30, oy + src_h - int(src_h*(1-compress)/2)),
        (ox - hshift, oy + src_h - vshift),
    ]
    
    # Build matrix: map dst->src for PIL perspective
    A = []
    B = []
    for (dx, dy), (sx, sy) in zip(dst, src):
        A.append([dx, dy, 1, 0, 0, 0, -sx*dx, -sx*dy])
        A.append([0, 0, 0, dx, dy, 1, -sy*dx, -sy*dy])
        B.extend([sx, sy])
    
    coeffs = np.linalg.lstsq(np.array(A, dtype=float), np.array(B, dtype=float), rcond=None)[0]
    
    result = work.transform((ww, wh), Image.PERSPECTIVE, coeffs.tolist(), Image.BICUBIC)
    
    # Crop to target
    cx, cy = (ww - cw) // 2, (wh - ch) // 2
    return result.crop((cx, cy, cx+cw, cy+ch))

def main():
    print("Background...")
    bg = radial_gradient_bg(W, H)
    
    print("Card face...")
    card = create_card_face()
    card.save('/tmp/debug_card.png')
    
    print("3D perspective...")
    card3d = perspective_warp(card, W, H)
    
    print("Shadow...")
    alpha = np.array(card3d)[:,:,3].astype(float)
    shadow_arr = np.zeros((H, W), dtype=np.uint8)
    ox, oy = 45, 55
    ys, xs = max(0,oy), max(0,ox)
    ye, xe = min(H, H+oy), min(W, W+ox)
    ssy, ssx = max(0,-oy), max(0,-ox)
    shadow_arr[ys:ye, xs:xe] = np.clip(alpha[ssy:ssy+(ye-ys), ssx:ssx+(xe-xs)] * 0.8, 0, 255).astype(np.uint8)
    shadow_l = Image.fromarray(shadow_arr).filter(ImageFilter.GaussianBlur(65))
    shadow = Image.merge('RGBA', (Image.new('L',(W,H),0), Image.new('L',(W,H),0), Image.new('L',(W,H),0), shadow_l))
    
    print("Reflection...")
    refl_arr = np.array(card3d)[::-1,:,:].copy()
    for y in range(H):
        fade = max(0, 1.0 - y/(H*0.22))
        refl_arr[y,:,3] = (refl_arr[y,:,3].astype(float) * fade * 0.1).astype(np.uint8)
    refl = Image.new('RGBA', (W,H), (0,0,0,0))
    refl_img = Image.fromarray(refl_arr)
    refl.paste(refl_img, (0, 220))
    
    print("Compositing...")
    result = bg.convert('RGBA')
    result = Image.alpha_composite(result, shadow)
    result = Image.alpha_composite(result, refl)
    result = Image.alpha_composite(result, card3d)
    
    # Light effects
    light = Image.new('RGBA', (W,H), (0,0,0,0))
    ld = ImageDraw.Draw(light)
    for r in range(350, 0, -2):
        a = max(0, int(3.5 * (1 - r/350)))
        if a > 0:
            cx, cy = int(W*0.7), int(H*0.15)
            ld.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(255,248,235,a))
    for r in range(200, 0, -2):
        a = max(0, int(2 * (1 - r/200)))
        if a > 0:
            cx, cy = int(W*0.18), int(H*0.78)
            ld.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(200,210,240,a))
    result = Image.alpha_composite(result, light)
    
    # Vignette
    result = result.convert('RGB')
    arr = np.array(result).astype(float)
    yc, xc = np.mgrid[0:H, 0:W].astype(float)
    dist = np.sqrt((xc - W/2)**2 + (yc - H/2)**2) / np.sqrt((W/2)**2 + (H/2)**2)
    vig = np.clip(1.0 - (dist - 0.35) * 1.1, 0.25, 1.0)
    for c in range(3):
        arr[:,:,c] *= vig
    result = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    
    # Contrast
    result = ImageEnhance.Contrast(result).enhance(1.08)
    
    out = '/Users/administrator/.openclaw/workspace/gifted-project/test-product-images/netflix-gift-card-v2.png'
    result.save(out, 'PNG')
    print(f"Done: {out} ({result.size})")

if __name__ == '__main__':
    main()
