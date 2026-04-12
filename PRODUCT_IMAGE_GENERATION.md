# Product Image Generation - Gifted

## Current Approach (MVP)

**Method:** Programmatic rendering using Python/Pillow + Playwright
**Location:** `/workspace/gifted-project/test-product-images/`

### Working Examples
- ✅ Netflix gift card (v5) - Red card, prominent logo, 3D tilt
- ✅ Apple gift card (v3) - White iridescent card, centered logo
- ✅ Uber gift card (v1) - White card, black wordmark

### Specs
- **Resolution:** 2400x1600 (high-res)
- **Composition:** Card fills ~87% of frame width, 3D tilted perspective
- **Logo prominence:** 20-25% of card height
- **Background:** Dark gradient with studio lighting
- **Effects:** Shadows, reflections, subtle highlights

### Pros
- ✅ **Fast:** Generate in 1-5 minutes per card
- ✅ **Free:** No API costs
- ✅ **Reproducible:** Automated generation for entire catalog
- ✅ **Customizable:** Easy to adjust colors, sizes, layouts
- ✅ **Scalable:** Can generate thousands of variants

### Cons
- ❌ **Not photorealistic:** Looks clean but obviously rendered
- ❌ **Limited lighting:** Can't do complex studio lighting
- ❌ **No textures:** Cards look flat, missing material depth
- ❌ **Generic feel:** Won't match Apple.com-level premium aesthetic

### Use Case
**Perfect for:** MVP, placeholder images, testing, internal demos
**Not ideal for:** Premium product launch, high-end marketing, Apple-level polish

---

## Upgrade Path: AI Image Generation

For premium, photorealistic product images, use AI generation tools.

### Option 1: Midjourney (Recommended)

**Best for:** Highest quality, most control, best for branding

#### Setup (10 minutes)
1. Sign up: https://midjourney.com
2. Join Discord server
3. Subscribe: $10/month Basic, $30/month Standard (recommended)

#### Pricing
- **Basic:** $10/month (200 images)
- **Standard:** $30/month (unlimited in relaxed mode, 15h fast)
- **Pro:** $60/month (30h fast, stealth mode)

#### How to Use

**1. Write prompts for each brand:**

```
Netflix Gift Card Prompt:
"Premium Netflix gift card, floating in space, 3D perspective tilt, 
dark matte red card with Netflix logo prominent and centered, 
professional studio lighting, soft shadows, dark gradient background, 
cinematic, photorealistic, product photography, 8K resolution, 
octane render --ar 3:2 --v 6 --style raw"

Apple Gift Card Prompt:
"Premium Apple gift card, floating in space, 3D perspective tilt,
white iridescent card with holographic rainbow gradients, 
Apple logo centered (bitten apple silhouette), minimal and clean,
professional studio lighting, soft shadows, dark background,
photorealistic, product photography, 8K resolution --ar 3:2 --v 6"

Uber Gift Card Prompt:
"Premium Uber gift card, floating in space, 3D perspective tilt,
clean white card with black Uber wordmark centered,
modern minimalist design, professional studio lighting, 
soft shadows, dark gradient background, photorealistic,
product photography, 8K resolution --ar 3:2 --v 6 --style raw"
```

**2. Run in Midjourney Discord:**
- `/imagine [paste prompt]`
- Wait 30-60 seconds
- Get 4 variations
- Upscale best one with `U1`, `U2`, `U3`, or `U4`
- Download high-res image

**3. Iterate if needed:**
- `/imagine [original prompt] --seed [number]` for consistency
- Use `--stylize` parameter to control artistic vs realistic (0-1000)
- Use `--chaos` for more variety (0-100)

#### Batch Generation Strategy

For 100+ products:
1. Create template prompts for each brand style
2. Use `/imagine` with variations
3. Download and organize by brand
4. Resize to 2400x1600 if needed

**Time estimate:** 2-3 minutes per card (including selection/upscaling)
**Cost:** $30/month Standard plan (unlimited relaxed mode)

---

### Option 2: DALL-E 3 (via ChatGPT Plus or API)

**Best for:** Easier text prompts, better at following instructions

#### Setup
**Option A: ChatGPT Plus** ($20/month)
- Already have access
- Generate via chat interface
- Limited to ~50 images/day

**Option B: OpenAI API**
- Sign up: https://platform.openai.com
- Add payment method
- $0.04 per 1024x1024 image (standard)
- $0.08 per 1024x1792 HD image

#### Pricing (API)
- **Standard (1024x1024):** $0.04/image
- **HD (1024x1792):** $0.08/image
- **Batch of 100 HD images:** $8

#### How to Use (API)

**1. Get API key:**
```bash
export OPENAI_API_KEY="sk-..."
```

**2. Create generation script:**
```python
import openai
import requests

def generate_gift_card(brand_name, prompt):
    response = openai.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1792x1024",  # HD
        quality="hd",
        n=1
    )
    
    image_url = response.data[0].url
    
    # Download image
    img_data = requests.get(image_url).content
    with open(f'{brand_name}-gift-card.png', 'wb') as f:
        f.write(img_data)
    
    return image_url

# Example usage
netflix_prompt = """
Premium Netflix gift card floating in space with 3D perspective tilt.
Dark matte red card with Netflix logo prominent and centered.
Professional studio lighting with soft shadows on dark gradient background.
Photorealistic product photography, 8K resolution, cinematic quality.
"""

generate_gift_card("netflix", netflix_prompt)
```

**3. Batch generate:**
```python
brands = {
    "netflix": "Red card with Netflix logo...",
    "apple": "White iridescent card with Apple logo...",
    "uber": "White card with black Uber wordmark...",
    # ... add all brands
}

for brand, prompt in brands.items():
    generate_gift_card(brand, prompt)
    time.sleep(1)  # Rate limiting
```

#### Integration with OpenClaw

Add to `.env`:
```bash
OPENAI_API_KEY=sk-...
```

Create skill or agent that:
1. Reads product list from Reloadly
2. Generates prompts for each brand
3. Calls DALL-E 3 API
4. Saves images to `/public/images/products/`
5. Updates database with image URLs

---

### Option 3: Stable Diffusion (Self-Hosted)

**Best for:** Full control, no API costs, unlimited generation

#### Setup (Advanced)
1. **Hardware:** GPU with 8GB+ VRAM (RTX 3060+)
2. **Software:** Automatic1111 WebUI or ComfyUI
3. **Models:** Download from Hugging Face or CivitAI

#### Pros
- ✅ **Free:** No per-image costs
- ✅ **Unlimited:** Generate as many as you want
- ✅ **Full control:** Fine-tune everything
- ✅ **Privacy:** All local, no data sent to third parties

#### Cons
- ❌ **Setup complexity:** Requires technical knowledge
- ❌ **Hardware:** Needs powerful GPU
- ❌ **Quality:** Not quite as good as Midjourney/DALL-E 3 out of box
- ❌ **Time:** 30-60 seconds per image locally

#### When to Use
- If you already have the hardware
- If you need 1000+ images
- If you want to train custom models on your brand
- If privacy/data control is critical

---

## Recommended Approach

### Phase 1: NOW (MVP)
✅ **Use programmatic rendering** for all products
- Fast, free, scalable
- Good enough for testing and internal use
- Already working for Netflix, Apple, Uber

### Phase 2: NEXT (Premium Launch)
🎯 **Midjourney for hero brands** (top 20-30 products)
- Netflix, Amazon, Apple, Spotify, Uber, Airbnb, etc.
- High-quality, photorealistic images
- Use for marketing, homepage, featured products
- Cost: ~$30/month + 2-3 hours of work

### Phase 3: SCALE (Full Catalog)
🚀 **DALL-E 3 API for long tail** (remaining products)
- Automated generation via script
- Batch process 100+ brands
- Cost: ~$8-10 for 100 HD images
- Can run overnight

### Phase 4: FUTURE (Advanced)
🔬 **Stable Diffusion + LoRA training** (optional)
- Train custom model on your brand aesthetic
- Generate infinite variations
- Full control over style consistency
- Requires GPU server or cloud GPU (Replicate, RunPod)

---

## Implementation Checklist

### For Midjourney Upgrade

- [ ] Sign up for Midjourney Standard ($30/month)
- [ ] Create prompt templates for top 30 brands
- [ ] Generate 4 variations per brand
- [ ] Select best, upscale to high-res
- [ ] Download and organize in `/public/images/products/hero/`
- [ ] Update product data to reference new images
- [ ] A/B test: programmatic vs Midjourney conversion rates

### For DALL-E 3 Automation

- [ ] Get OpenAI API key
- [ ] Add $20 credit to account
- [ ] Write Python script for batch generation
- [ ] Create prompt template system
- [ ] Test with 10 brands
- [ ] Review quality and iterate prompts
- [ ] Run full batch (100+ brands)
- [ ] Upload to `/public/images/products/`
- [ ] Update database/config with image URLs

### For Quality Comparison

- [ ] Generate same 5 cards with all 3 methods:
  - Programmatic (current)
  - Midjourney
  - DALL-E 3
- [ ] User test: show to 10 people, ask which looks most premium
- [ ] Measure: conversion rate difference in A/B test
- [ ] Calculate ROI: cost vs conversion improvement

---

## Prompt Engineering Tips

### Universal Template

```
[Brand] gift card, floating in space, 3D perspective tilt,
[card color/material] with [logo description] prominent and centered,
[brand aesthetic adjectives: modern/premium/clean/etc],
professional studio lighting, soft drop shadow, subtle floor reflection,
dark gradient background with [brand color] ambient glow,
photorealistic product photography, 8K resolution, octane render,
shot with Phase One camera, --ar 3:2 --style raw --v 6
```

### Brand-Specific Adjustments

**Tech brands** (Apple, Google, Microsoft):
- Add: "minimal, clean, modern, precision engineered"
- Material: "white glossy card" or "aluminum card"

**Entertainment** (Netflix, Spotify, Disney):
- Add: "vibrant, cinematic, entertainment aesthetic"
- Lighting: "dramatic lighting with colored gels"

**Food/Lifestyle** (Starbucks, Uber Eats):
- Add: "warm, inviting, lifestyle photography"
- Background: "warm gradient background"

**Gaming** (Steam, PlayStation, Xbox):
- Add: "futuristic, high-tech, gaming aesthetic"
- Effects: "subtle LED glow, RGB highlights"

---

## File Organization

```
/public/images/products/
├── programmatic/          # Current MVP approach
│   ├── netflix-v5.png
│   ├── apple-v3.png
│   └── uber-v1.png
│
├── midjourney/            # Premium hero images
│   ├── netflix-hero.png
│   ├── apple-hero.png
│   └── uber-hero.png
│
├── dalle/                 # AI-generated long tail
│   ├── starbucks.png
│   ├── target.png
│   └── ...
│
└── fallback/              # Generic backup
    └── generic-card.png
```

---

## Cost Comparison

| Method | Setup | Per Image | 100 Images | Quality | Time/Image |
|--------|-------|-----------|------------|---------|------------|
| **Programmatic** | Free | Free | Free | 6/10 | 2 min |
| **Midjourney** | $30/mo | $0.15 | $15 | 9/10 | 3 min |
| **DALL-E 3** | $0 | $0.08 | $8 | 8/10 | 1 min |
| **Stable Diffusion** | $500+ GPU | Free | Free | 7/10 | 1 min |
| **Designer** | $0 | $50-200 | $5,000+ | 10/10 | 1-2 days |

---

## Next Steps

1. **Immediate:** Keep using programmatic rendering for MVP
2. **This week:** Sign up for Midjourney, generate hero cards for top 10 brands
3. **Next week:** Set up DALL-E 3 API, automate batch generation for remaining catalog
4. **Later:** Measure conversion impact, decide if worth upgrading all images

---

**Status:** Using programmatic rendering (MVP)  
**Next upgrade:** Midjourney for hero brands  
**Long-term:** DALL-E 3 API for full catalog automation
