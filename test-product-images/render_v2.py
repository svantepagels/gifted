#!/usr/bin/env python3
"""
High-quality Netflix gift card 3D render using PIL + numpy.
Uses vectorized numpy operations for speed and quality.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np
import math

W, H = 2400, 1600
CARD_W, CARD_H = 1000, 630

def radial_gradient_bg(w, h):
    """Create premium dark radial gradient background."""
    y_coords, x_coords = np.mgrid[0:h, 0:w]
    cx, cy = w * 0.48, h * 0.45
    dist = np.sqrt((x_coords - cx)**2 + (y_coords - cy)**2)
    max_dist = np.sqrt(cx**2 + cy**2)
    norm_dist = dist / max_dist
    
    # Center: warm dark grey ~(45,43,48), edge: near black ~(8,8,10)
    center = np.array([45, 43, 48], dtype=float)
    edge = np.array([8, 8, 10], dtype=float)
    
    pixels = np.zeros((h, w, 3), dtype=np.uint8)
    for c in range(3):
        pixels[:, :, c] = (center[c] + (edge[c] - center[c]) * np.clip(norm_dist, 0, 1)).astype(np.uint8)
    
    return Image.fromarray(pixels)

def rounded_rect_mask(w, h, r):
    """Create a rounded rectangle alpha mask."""
    mask = Image.new('L', (w, h), 255)
    draw = ImageDraw.Draw(mask)
    # Draw black corners, then invert approach: draw white rounded rect on black
    mask2 = Image.new('L', (w, h), 0)
    d2 = ImageDraw.Draw(mask2)
    d2.rounded_rectangle([0, 0, w-1, h-1], radius=r, fill=255)
    return mask2

def create_card_face():
    """Create the Netflix gift card face - high quality."""
    card = Image.new('RGBA', (CARD_W, CARD_H), (0, 0, 0, 0))
    
    # Create gradient background for card
    y_coords = np.arange(CARD_H).reshape(-1, 1)
    x_coords = np.arange(CARD_W).reshape(1, -1)
    
    # Diagonal gradient: dark top-left to slightly lighter bottom-right
    grad = (y_coords / CARD_H * 0.6 + x_coords / CARD_W * 0.4)
    
    r_ch = (18 + grad * 12).astype(np.uint8)
    g_ch = (16 + grad * 10).astype(np.uint8)
    b_ch = (18 + grad * 10).astype(np.uint8)
    a_ch = np.full((CARD_H, CARD_W), 255, dtype=np.uint8)
    
    card_array = np.stack([r_ch, g_ch, b_ch, a_ch], axis=2)
    card = Image.fromarray(card_array)
    
    # Apply rounded rectangle mask
    mask = rounded_rect_mask(CARD_W, CARD_H, 35)
    card.putalpha(mask)
    
    draw = ImageDraw.Draw(card)
    
    # --- Netflix red N logo (precise construction) ---
    n_x, n_y = 70, 80
    n_h = 130
    n_w = 95
    bar_w = 22
    netflix_red = (229, 9, 20, 255)
    netflix_red_shadow = (180, 5, 15, 255)
    
    # Left vertical bar with subtle gradient
    draw.rectangle([n_x, n_y, n_x + bar_w, n_y + n_h], fill=netflix_red)
    
    # Right vertical bar
    draw.rectangle([n_x + n_w - bar_w, n_y, n_x + n_w, n_y + n_h], fill=netflix_red)
    
    # Diagonal stripe (drawn as a polygon)
    draw.polygon([
        (n_x, n_y),
        (n_x + bar_w, n_y),
        (n_x + n_w, n_y + n_h),
        (n_x + n_w - bar_w, n_y + n_h)
    ], fill=netflix_red)
    
    # Shadow on left bar from diagonal
    draw.polygon([
        (n_x, n_y + n_h * 0.3),
        (n_x + bar_w, n_y + n_h * 0.3),
        (n_x + bar_w, n_y + n_h),
        (n_x, n_y + n_h)
    ], fill=netflix_red_shadow)
    # Redraw left bar top portion
    draw.rectangle([n_x, n_y, n_x + bar_w, n_y + int(n_h * 0.3)], fill=netflix_red)
    
    # --- Typography ---
    try:
        # Try to find good fonts
        font_paths = [
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/SFNSDisplay.ttf",
            "/Library/Fonts/Arial.ttf",
        ]
        font_path = None
        for fp in font_paths:
            try:
                ImageFont.truetype(fp, 12)
                font_path = fp
                break
            except:
                continue
        
        if font_path:
            font_brand = ImageFont.truetype(font_path, 54)
            font_sub = ImageFont.truetype(font_path, 26)
            font_amount = ImageFont.truetype(font_path, 82)
            font_amount_small = ImageFont.truetype(font_path, 36)
            font_tiny = ImageFont.truetype(font_path, 16)
        else:
            raise Exception("No font found")
    except:
        font_brand = ImageFont.load_default()
        font_sub = font_brand
        font_amount = font_brand
        font_amount_small = font_brand
        font_tiny = font_brand
    
    # "NETFLIX" wordmark
    draw.text((185, 115), "NETFLIX", fill=(229, 9, 20, 255), font=font_brand)
    
    # "Gift Card" subtitle
    draw.text((72, 250), "Gift Card", fill=(160, 160, 165, 255), font=font_sub)
    
    # Large amount
    draw.text((72, 420), "$50", fill=(255, 255, 255, 255), font=font_amount)
    
    # Decorative line
    draw.line([(72, 410), (350, 410)], fill=(60, 60, 65, 255), width=1)
    
    # Small text at bottom
    draw.text((72, 560), "Stream Movies & TV Shows", fill=(80, 80, 85, 255), font=font_tiny)
    
    # Card number dots (decorative)
    for i in range(4):
        for j in range(4):
            x = 600 + i * 90 + j * 18
            y = 560
            draw.ellipse([x, y, x+8, y+8], fill=(50, 50, 55, 255))
    
    # --- Subtle glossy shine overlay ---
    shine = Image.new('RGBA', (CARD_W, CARD_H), (0, 0, 0, 0))
    shine_array = np.zeros((CARD_H, CARD_W, 4), dtype=np.uint8)
    
    y_c, x_c = np.mgrid[0:CARD_H, 0:CARD_W]
    # Diagonal shine from upper-left
    shine_val = np.clip(50 - np.abs(x_c * 0.7 + y_c - 250) * 0.12, 0, 40).astype(np.uint8)
    shine_array[:, :, 0] = 255
    shine_array[:, :, 1] = 255
    shine_array[:, :, 2] = 255
    shine_array[:, :, 3] = shine_val
    
    shine = Image.fromarray(shine_array)
    # Apply card mask to shine too
    shine.putalpha(ImageDraw.Draw(Image.new('L', (CARD_W, CARD_H), 0)).rounded_rectangle([0, 0, CARD_W-1, CARD_H-1], radius=35, fill=255) or rounded_rect_mask(CARD_W, CARD_H, 35))
    # Composite shine alpha with original shine alpha
    shine_mask = rounded_rect_mask(CARD_W, CARD_H, 35)
    shine_a = np.minimum(np.array(shine)[:,:,3], np.array(shine_mask))
    shine_arr = np.array(shine)
    shine_arr[:,:,3] = shine_a
    shine = Image.fromarray(shine_arr)
    
    card = Image.alpha_composite(card, shine)
    
    # --- Edge highlight ---
    edge = Image.new('RGBA', (CARD_W, CARD_H), (0, 0, 0, 0))
    edge_draw = ImageDraw.Draw(edge)
    edge_draw.rounded_rectangle([0, 0, CARD_W-1, CARD_H-1], radius=35, outline=(70, 70, 75, 120), width=2)
    # Top edge brighter (light from above)
    edge_draw.rounded_rectangle([1, 1, CARD_W-2, 3], radius=2, fill=(90, 90, 95, 60))
    
    card = Image.alpha_composite(card, edge)
    
    return card

def perspective_warp(img, canvas_w, canvas_h):
    """Apply perspective transformation to simulate 3D tilt."""
    src_w, src_h = img.size
    
    # Create large work canvas
    pad = 600
    work_w = canvas_w + pad * 2
    work_h = canvas_h + pad * 2
    
    work = Image.new('RGBA', (work_w, work_h), (0, 0, 0, 0))
    # Place card centered
    ox = (work_w - src_w) // 2
    oy = (work_h - src_h) // 2
    work.paste(img, (ox, oy), img)
    
    # Define perspective: card tilted right ~20deg with vertical foreshortening
    # Source corners
    src_pts = np.float32([
        [ox, oy],
        [ox + src_w, oy],
        [ox + src_w, oy + src_h],
        [ox, oy + src_h]
    ])
    
    # Destination: right side compressed (receding), left side larger (closer)
    shrink_r = 0.78  # Right side is 78% of left
    shift_r = 50     # Right side shifted right
    tilt_v = 40      # Vertical shift for tilt
    
    dst_pts = np.float32([
        [ox - 30, oy + tilt_v],                                    # top-left
        [ox + src_w + shift_r, oy + int(src_h * (1 - shrink_r) / 2)],  # top-right (compressed)
        [ox + src_w + shift_r, oy + src_h - int(src_h * (1 - shrink_r) / 2)],  # bottom-right
        [ox - 30, oy + src_h - tilt_v],                            # bottom-left
    ])
    
    # Compute perspective transform using numpy
    # We need to find the 3x3 matrix M such that dst = M * src (homogeneous)
    A = []
    B = []
    for i in range(4):
        sx, sy = src_pts[i]
        dx, dy = dst_pts[i]
        A.append([dx, dy, 1, 0, 0, 0, -sx*dx, -sx*dy])
        A.append([0, 0, 0, dx, dy, 1, -sy*dx, -sy*dy])
        B.append(sx)
        B.append(sy)
    
    A = np.array(A, dtype=float)
    B = np.array(B, dtype=float)
    coeffs = np.linalg.lstsq(A, B, rcond=None)[0]
    
    result = work.transform((work_w, work_h), Image.PERSPECTIVE, coeffs.tolist(), Image.BICUBIC)
    
    # Crop to canvas size
    cx = (work_w - canvas_w) // 2
    cy = (work_h - canvas_h) // 2
    result = result.crop((cx, cy, cx + canvas_w, cy + canvas_h))
    
    return result

def create_shadow(card_canvas, blur_radius=70):
    """Create realistic soft shadow."""
    # Extract alpha as shadow base
    alpha = np.array(card_canvas)[:, :, 3].astype(float)
    
    # Offset shadow down-right
    shadow_img = Image.new('L', (W, H), 0)
    shadow_arr = np.zeros((H, W), dtype=np.uint8)
    
    offset_x, offset_y = 40, 50
    h, w = alpha.shape
    
    # Place offset alpha
    y_start = max(0, offset_y)
    x_start = max(0, offset_x)
    y_end = min(H, h + offset_y)
    x_end = min(W, w + offset_x)
    
    src_y_start = max(0, -offset_y)
    src_x_start = max(0, -offset_x)
    src_y_end = src_y_start + (y_end - y_start)
    src_x_end = src_x_start + (x_end - x_start)
    
    shadow_arr[y_start:y_end, x_start:x_end] = (alpha[src_y_start:src_y_end, src_x_start:src_x_end] * 0.85).astype(np.uint8)
    
    shadow_img = Image.fromarray(shadow_arr)
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(blur_radius))
    
    # Create shadow RGBA
    shadow_rgba = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shadow_rgba = Image.merge('RGBA', (
        Image.new('L', (W, H), 0),
        Image.new('L', (W, H), 0),
        Image.new('L', (W, H), 0),
        shadow_img
    ))
    
    return shadow_rgba

def create_reflection(card_canvas):
    """Create subtle floor reflection."""
    arr = np.array(card_canvas)
    
    # Flip vertically
    flipped = arr[::-1, :, :].copy()
    
    # Fade out from top (which was bottom of card)
    h = flipped.shape[0]
    for y in range(h):
        fade = max(0, 1.0 - y / (h * 0.25))
        flipped[y, :, 3] = (flipped[y, :, 3].astype(float) * fade * 0.12).astype(np.uint8)
    
    reflection = Image.fromarray(flipped)
    
    # Shift down
    shifted = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    shifted.paste(reflection, (0, 200))
    
    return shifted

def add_vignette(img):
    """Add cinematic vignette."""
    arr = np.array(img).astype(float)
    h, w = arr.shape[:2]
    
    y_c, x_c = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h / 2
    dist = np.sqrt((x_c - cx)**2 + (y_c - cy)**2)
    max_dist = np.sqrt(cx**2 + cy**2)
    
    vignette = np.clip(1.0 - (dist / max_dist - 0.4) * 1.2, 0.3, 1.0)
    
    for c in range(3):
        arr[:, :, c] *= vignette
    
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def add_light_effects(img):
    """Add subtle studio light highlights."""
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    w, h = img.size
    
    # Key light glow - upper right (warm)
    for r in range(400, 0, -2):
        alpha = max(0, int(4 * (1 - r / 400)))
        if alpha > 0:
            cx, cy = int(w * 0.72), int(h * 0.18)
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 245, 230, alpha))
    
    # Fill light - lower left (cool, subtle)
    for r in range(250, 0, -2):
        alpha = max(0, int(2 * (1 - r / 250)))
        if alpha > 0:
            cx, cy = int(w * 0.15), int(h * 0.75)
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(200, 210, 240, alpha))
    
    result = Image.alpha_composite(img.convert('RGBA'), overlay)
    return result

def main():
    print("1/6 Creating background...")
    bg = radial_gradient_bg(W, H)
    
    print("2/6 Creating card face...")
    card = create_card_face()
    
    print("3/6 Applying 3D perspective...")
    card_3d = perspective_warp(card, W, H)
    
    print("4/6 Creating shadow...")
    shadow = create_shadow(card_3d)
    
    print("5/6 Creating reflection...")
    reflection = create_reflection(card_3d)
    
    print("6/6 Compositing final image...")
    # Composite layers
    result = bg.convert('RGBA')
    result = Image.alpha_composite(result, shadow)
    result = Image.alpha_composite(result, reflection)
    result = Image.alpha_composite(result, card_3d)
    
    # Add lighting
    result = add_light_effects(result)
    
    # Convert to RGB and add vignette
    result = result.convert('RGB')
    result = add_vignette(result)
    
    # Slight contrast boost
    enhancer = ImageEnhance.Contrast(result)
    result = enhancer.enhance(1.1)
    
    out_path = '/Users/administrator/.openclaw/workspace/gifted-project/test-product-images/netflix-gift-card-v2.png'
    result.save(out_path, 'PNG')
    print(f"Saved: {out_path} ({result.size[0]}x{result.size[1]})")

if __name__ == '__main__':
    main()
