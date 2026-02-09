# Images Directory

This directory contains all static images for the Sapa Paragliding website.

## Required Images

### Hero Images
- `hero-bg.jpg` - Homepage hero background (1920x1080px recommended)
- `about-hero.jpg` - About page hero background (1920x600px recommended)

### Gallery Images
Place in `gallery/` subdirectory:
- `gallery-1.jpg` - Soaring Above Sapa Valley
- `gallery-2.jpg` - Sunset Flight
- `gallery-3.jpg` - Mountain Peaks
- `gallery-4.jpg` - Tandem Joy
- `gallery-5.jpg` - Cloud Dancing
- `gallery-6.jpg` - Valley Views
- `gallery-7.jpg` - Perfect Landing
- `gallery-8.jpg` - Adventure Awaits

**Recommended size**: 800x800px (square format)

### Pilot Images
Place in `pilots/` subdirectory:
- `Long Nguyen_Chief Pilot.jpg`
- `Minh Tran_Senior Pilot.jpg`
- `Tuan Nguyen_Team Pilot.jpg`
- `Hai Le_Team Pilot.jpg`
- `Nam Pham_Team Pilot.jpg`

**Recommended size**: 600x800px (portrait format)

### Service Images (Optional)
- `discovery-flight.jpg`
- `adventure-flight.jpg`
- `premium-flight.jpg`

## Image Guidelines

### Format
- Use JPEG for photos
- Use PNG for graphics with transparency
- Use WebP for better compression (if supported)

### Optimization
- Compress images before uploading
- Use tools like TinyPNG or ImageOptim
- Target file size: < 200KB per image

### Dimensions
- Hero images: 1920x1080px
- Gallery images: 800x800px
- Pilot images: 600x800px
- Keep aspect ratios consistent

### Naming Convention
- Use descriptive names
- No spaces (use hyphens or underscores)
- Lowercase preferred
- Match names in data files exactly

## Placeholder Images

If images are not available, the website will show:
- Placeholder images from via.placeholder.com
- Or fallback to default images

## Adding New Images

1. Place image in appropriate directory
2. Update corresponding data file if needed:
   - `app/data/pilots.json` for pilot images
   - `app/data/gallery.json` for gallery images
3. Ensure filename matches exactly (case-sensitive)

## Current Structure

```
public/images/
├── hero-bg.jpg
├── about-hero.jpg
├── gallery/
│   ├── gallery-1.jpg
│   ├── gallery-2.jpg
│   ├── gallery-3.jpg
│   ├── gallery-4.jpg
│   ├── gallery-5.jpg
│   ├── gallery-6.jpg
│   ├── gallery-7.jpg
│   └── gallery-8.jpg
└── pilots/
    ├── Long Nguyen_Chief Pilot.jpg
    ├── Minh Tran_Senior Pilot.jpg
    ├── Tuan Nguyen_Team Pilot.jpg
    ├── Hai Le_Team Pilot.jpg
    └── Nam Pham_Team Pilot.jpg
```

## Tips

- Use high-quality images that showcase paragliding
- Ensure images are properly licensed
- Consider using actual photos from your flights
- Maintain consistent style and quality across all images
- Test images on different devices and screen sizes
