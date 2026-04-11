#!/usr/bin/env python3
"""
Professional Netflix gift card 3D render with perspective, lighting, shadows, and reflections.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import math

W, H = 2400, 1600

def make_gradient_bg(w, h):
    """Dark cinematic gradient background."""
    img = Image.new('RGB', (w, h))
    pixels = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        for x in range(w):
            # Radial gradient: lighter in center, dark at edges
            cx, cy = w / 2, h / 2
            dist = math.sqrt((x - cx)**2 + (y - cy)**2) / math.sqrt(cx**2 + cy**2)
            # Center: ~50,50,55  Edge: ~10,10,12
            v = int(55 * (1 - dist * 0.82))
            pixels[y, x] = [v, v, int(v * 1.05)]
    return Image.fromarray(pixels)

def perspective_transform(img, coeffs):
    """Apply perspective transform."""
    return img.transform(img.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)

def compute_perspective_coeffs(src, dst):
    """Compute perspective transform coefficients from 4 point pairs."""
    matrix = []
    for s, d in zip(src, dst):
        matrix.append([d[0], d[1], 1, 0, 0, 0, -s[0]*d[0], -s[0]*d[1]])
        matrix.append([0, 0, 0, d[0], d[1], 1, -s[1]*d[0], -s[1]*d[1]])
    A = np.matrix(matrix, dtype=float)
    B = np.array([s for pair in src for s in pair], dtype=float)
    res = np.dot(np.linalg.inv(A.T * A) * A.T, B)
    return np.array(res).flatten().tolist()

def create_netflix_card(card_w=900, card_h=570):
    """Create the flat Netflix gift card face."""
    # Card with rounded corners
    card = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    
    # Rounded rectangle background - dark with subtle gradient
    r = 30
    # Base card color
    for y in range(card_h):
        ratio = y / card_h
        # Top: #1a1a1a, Bottom: #0d0d0d with slight red tint
        rv = int(26 - ratio * 13)
        gv = int(22 - ratio * 12)
        bv = int(22 - ratio * 12)
        for x in range(card_w):
            # Check if inside rounded rect
            in_rect = True
            if x < r and y < r:
                in_rect = math.sqrt((x - r)**2 + (y - r)**2) <= r
            elif x > card_w - r and y < r:
                in_rect = math.sqrt((x - card_w + r)**2 + (y - r)**2) <= r
            elif x < r and y > card_h - r:
                in_rect = math.sqrt((x - r)**2 + (y - card_h + r)**2) <= r
            elif x > card_w - r and y > card_h - r:
                in_rect = math.sqrt((x - card_w + r)**2 + (y - card_h + r)**2) <= r
            if in_rect:
                card.putpixel((x, y), (rv, gv, bv, 255))
    
    # Netflix red accent stripe at top
    stripe_h = 6
    for y in range(stripe_h):
        for x in range(r, card_w - r):
            card.putpixel((x, y), (229, 9, 20, 255))
    
    # Netflix "N" logo - large, iconic
    draw = ImageDraw.Draw(card)
    
    # Draw the Netflix N
    n_x, n_y = 60, 80
    n_w, n_h = 80, 110
    bar_w = 18
    
    # Left vertical bar
    for y in range(n_y, n_y + n_h):
        for x in range(n_x, n_x + bar_w):
            card.putpixel((x, y), (229, 9, 20, 255))
    
    # Right vertical bar
    for y in range(n_y, n_y + n_h):
        for x in range(n_x + n_w - bar_w, n_x + n_w):
            card.putpixel((x, y), (229, 9, 20, 255))
    
    # Diagonal
    for i in range(n_h + 20):
        t = i / (n_h + 20)
        cx = n_x + int(t * (n_w - bar_w))
        cy = n_y + int(t * n_h) - 10
        for dx in range(-bar_w//2, bar_w//2 + 4):
            px, py = cx + dx, cy
            if 0 <= px < card_w and 0 <= py < card_h:
                card.putpixel((px, py), (229, 9, 20, 255))
    
    # "NETFLIX" text
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
        font_amount = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
    except:
        font_large = ImageFont.load_default()
        font_medium = font_large
        font_small = font_large
        font_amount = font_large
    
    draw.text((160, 105), "NETFLIX", fill=(229, 9, 20, 255), font=font_large)
    
    # Gift Card text
    draw.text((60, 220), "Gift Card", fill=(180, 180, 180, 255), font=font_medium)
    
    # Amount
    draw.text((60, 380), "$50", fill=(255, 255, 255, 255), font=font_amount)
    draw.text((215, 410), ".00", fill=(180, 180, 180, 255), font=font_medium)
    
    # Card number area (fake)
    draw.text((60, 490), "XXXX  XXXX  XXXX  XXXX", fill=(100, 100, 100, 255), font=font_small)
    
    # Subtle shine/gloss effect overlay
    shine = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
    shine_draw = ImageDraw.Draw(shine)
    for y in range(card_h):
        for x in range(card_w):
            # Diagonal shine from top-left
            shine_val = max(0, 40 - int(abs(x + y * 0.5 - 300) * 0.15))
            if shine_val > 0 and card.getpixel((x, y))[3] > 0:
                shine.putpixel((x, y), (255, 255, 255, shine_val))
    
    card = Image.alpha_composite(card, shine)
    
    # Edge highlight (subtle border glow)
    edge = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
    edge_draw = ImageDraw.Draw(edge)
    edge_draw.rounded_rectangle([0, 0, card_w-1, card_h-1], radius=r, outline=(80, 80, 80, 100), width=1)
    card = Image.alpha_composite(card, edge)
    
    return card

def apply_3d_perspective(card_img, canvas_size):
    """Apply perspective to make the card look 3D and tilted."""
    cw, ch = card_img.size
    W, H = canvas_size
    
    # Place card in a larger canvas for transformation
    big = max(W, H) * 2
    canvas = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    ox, oy = (big - cw) // 2, (big - ch) // 2
    canvas.paste(card_img, (ox, oy))
    
    # Source corners (flat card)
    src = [(ox, oy), (ox + cw, oy), (ox + cw, oy + ch), (ox, oy + ch)]
    
    # Destination corners (3D perspective - tilted right, slight top tilt)
    # Card tilted ~25 degrees to the right with slight vertical perspective
    margin = 200
    dst = [
        (ox + 120, oy + 60),       # top-left moves right and down
        (ox + cw + 40, oy - 20),    # top-right moves right and up
        (ox + cw + 40, oy + ch + 20),  # bottom-right
        (ox + 120, oy + ch - 60),   # bottom-left moves right and up
    ]
    
    coeffs = compute_perspective_coeffs(dst, src)
    result = canvas.transform((big, big), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    
    # Crop to canvas size, centered
    cx, cy = (big - W) // 2, (big - H) // 2
    result = result.crop((cx - 100, cy - 50, cx + W - 100, cy + H - 50))
    
    return result

def add_shadow(card_on_canvas, bg, offset=(30, 40), blur=50, opacity=180):
    """Add a realistic drop shadow."""
    # Create shadow from card alpha
    shadow_base = Image.new('RGBA', card_on_canvas.size, (0, 0, 0, 0))
    # Get alpha channel
    alpha = card_on_canvas.split()[3]
    shadow = Image.new('RGBA', card_on_canvas.size, (0, 0, 0, 0))
    
    # Offset the alpha for shadow
    shadow_alpha = Image.new('L', card_on_canvas.size, 0)
    shadow_alpha.paste(alpha, offset)
    
    # Blur shadow
    shadow_alpha = shadow_alpha.filter(ImageFilter.GaussianBlur(blur))
    
    # Apply opacity
    shadow_array = np.array(shadow_alpha, dtype=float) * (opacity / 255.0)
    shadow_alpha = Image.fromarray(shadow_array.astype(np.uint8))
    
    # Create shadow image
    shadow = Image.new('RGBA', card_on_canvas.size, (0, 0, 0, 0))
    shadow_rgb = Image.new('RGB', card_on_canvas.size, (0, 0, 0))
    shadow = Image.merge('RGBA', (*shadow_rgb.split(), shadow_alpha))
    
    # Composite: bg -> shadow -> card
    result = bg.copy().convert('RGBA')
    result = Image.alpha_composite(result, shadow)
    result = Image.alpha_composite(result, card_on_canvas)
    
    return result

def add_reflection(composite, card_on_canvas):
    """Add a subtle reflection below the card."""
    # Flip card vertically
    reflection = card_on_canvas.transpose(Image.FLIP_TOP_BOTTOM)
    
    # Fade out reflection
    r_array = np.array(reflection)
    h = r_array.shape[0]
    for y in range(h):
        # Only apply to top portion of flipped image (which is bottom of card)
        fade = max(0, 1.0 - y / (h * 0.3))
        r_array[y, :, 3] = (r_array[y, :, 3].astype(float) * fade * 0.15).astype(np.uint8)
    
    reflection = Image.fromarray(r_array)
    
    # Shift reflection down
    shifted = Image.new('RGBA', composite.size, (0, 0, 0, 0))
    shifted.paste(reflection, (0, 180))
    
    result = Image.alpha_composite(composite.convert('RGBA'), shifted)
    return result

def add_light_flare(img):
    """Add subtle light flares for studio lighting effect."""
    flare = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(flare)
    
    # Soft light spot upper right
    w, h = img.size
    for r in range(300, 0, -1):
        alpha = int(3 * (1 - r / 300))
        if alpha > 0:
            draw.ellipse([w * 0.65 - r, h * 0.15 - r, w * 0.65 + r, h * 0.15 + r],
                        fill=(255, 255, 255, alpha))
    
    # Soft warm light lower left
    for r in range(200, 0, -1):
        alpha = int(2 * (1 - r / 200))
        if alpha > 0:
            draw.ellipse([w * 0.2 - r, h * 0.7 - r, w * 0.2 + r, h * 0.7 + r],
                        fill=(255, 200, 180, alpha))
    
    return Image.alpha_composite(img.convert('RGBA'), flare)

def main():
    print("Creating background...")
    bg = make_gradient_bg(W, H)
    
    print("Creating Netflix card face...")
    card = create_netflix_card(900, 570)
    
    print("Applying 3D perspective...")
    card_3d = apply_3d_perspective(card, (W, H))
    
    # Ensure card_3d matches canvas
    card_3d = card_3d.resize((W, H), Image.BICUBIC)
    
    print("Adding shadow...")
    composite = add_shadow(card_3d, bg, offset=(35, 45), blur=60, opacity=200)
    
    print("Adding reflection...")
    composite = add_reflection(composite, card_3d)
    
    print("Adding lighting effects...")
    composite = add_light_flare(composite)
    
    # Final adjustments - slight vignette
    vignette = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for y in range(H):
        for x in range(W):
            cx, cy = W / 2, H / 2
            dist = math.sqrt((x - cx)**2 + (y - cy)**2) / math.sqrt(cx**2 + cy**2)
            v = int(min(80, max(0, (dist - 0.5) * 160)))
            if v > 0:
                vignette.putpixel((x, y), (0, 0, 0, v))
    
    composite = Image.alpha_composite(composite, vignette)
    
    # Save
    output = composite.convert('RGB')
    out_path = '/Users/administrator/.openclaw/workspace/gifted-project/test-product-images/netflix-gift-card-v2.png'
    output.save(out_path, 'PNG', quality=95)
    print(f"Saved to {out_path}")
    print(f"Size: {output.size}")

if __name__ == '__main__':
    main()
