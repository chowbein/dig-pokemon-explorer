# Pokemon Habitat Background Images - Implementation Guide

## Overview
Your Pokemon cards now support habitat-based background images! Each Pokemon's card will display a themed background based on its natural habitat from the PokeAPI.

## Folder Location
**Place your habitat images in:** `/public/habitats/`

## Required Images

You need to add 9 habitat images with these exact filenames:

1. **`cave.jpg`** (or `.png`) - Dark caves, underground areas
2. **`forest.jpg`** - Dense forests, wooded areas  
3. **`grassland.jpg`** - Open plains, meadows, tall grass
4. **`mountain.jpg`** - Rocky peaks, mountainous terrain
5. **`rare.jpg`** - Rare/special locations (mystical, legendary)
6. **`rough-terrain.jpg`** - Rugged, harsh environments
7. **`sea.jpg`** - Deep ocean, open water
8. **`urban.jpg`** - Cities, towns, buildings
9. **`waters-edge.jpg`** - Beaches, shores, coastlines

## Image Specifications

### Recommended Settings:
- **Format**: JPG or PNG
- **Dimensions**: 800x600px (4:3 aspect ratio recommended)
- **File Size**: Keep under 200KB per image for performance
- **Style**: Use subtle, slightly muted images so Pokemon sprites stand out
- **Contrast**: Low-to-medium contrast works best for readability

### Tips for Best Results:
- Images will have a semi-transparent white overlay (30-35%) for readability
- Choose images with soft focus or blur for a professional look
- Avoid busy patterns that compete with the Pokemon sprite
- Test with both light and dark mode

## Finding Images

### Free Stock Photo Sources:
- **Unsplash** (https://unsplash.com/) - High quality, free to use
- **Pexels** (https://pexels.com/) - Large collection, no attribution required
- **Pixabay** (https://pixabay.com/) - Free images and illustrations

### Search Terms by Habitat:
- **cave**: "dark cave interior", "underground cavern", "rocky cave"
- **forest**: "dense forest", "woodland path", "tree canopy"
- **grassland**: "open meadow", "prairie grass", "savanna"
- **mountain**: "mountain peaks", "rocky cliff", "alpine landscape"
- **rare**: "mystical forest", "aurora", "fantasy landscape"
- **rough-terrain**: "rocky desert", "badlands", "volcanic rock"
- **sea**: "ocean depths", "underwater", "blue ocean"
- **urban**: "city skyline", "modern buildings", "urban street"
- **waters-edge**: "beach shore", "lake coast", "waterfront"

### AI-Generated Options:
Use AI image generators (DALL-E, Midjourney, Stable Diffusion) with prompts like:
- "Subtle background texture of [habitat] for Pokemon card, soft focus, low contrast"

## Implementation Details

### How It Works:
1. **Data Fetching**: App fetches Pokemon species data from PokeAPI
2. **Habitat Extraction**: Extracts habitat name (e.g., "forest", "sea")
3. **Image Mapping**: Maps habitat to background image in `/public/habitats/`
4. **Fallback**: If image fails to load, displays a CSS gradient instead

### Where Backgrounds Appear:
- ✅ Main Pokemon list cards
- ✅ Team sidebar cards (compact version)
- ✅ Pokemon detail pages (if PokemonCard is used there)

### Fallback Behavior:
- If an image is missing or fails to load, the app will display a themed gradient instead
- No errors will show to users - graceful degradation
- Cards without habitat data show default gray background

## Testing Your Images

1. Add all 9 habitat images to `/public/habitats/`
2. Restart your development server if running
3. Browse Pokemon cards - backgrounds should appear automatically
4. Check both light and dark modes for readability
5. Test compact cards in the team sidebar

## Examples of Pokemon by Habitat

- **Cave**: Zubat, Geodude, Onix
- **Forest**: Bulbasaur, Caterpie, Oddish
- **Grassland**: Rattata, Pidgey, Meowth
- **Mountain**: Machop, Clefairy, Rhyhorn
- **Rare**: Legendary Pokemon (Articuno, Mew, etc.)
- **Rough-terrain**: Cubone, Sandshrew, Dugtrio
- **Sea**: Tentacool, Magikarp, Krabby
- **Urban**: Grimer, Meowth, Pidgey
- **Waters-edge**: Psyduck, Slowpoke, Krabby

## Customization

Want to adjust the overlay opacity or change fallback gradients?

Edit `/src/lib/pokemonHabitats.ts`:

```typescript
export const HABITAT_CONFIG: Record<HabitatName, HabitatConfig> = {
  forest: {
    image: '/habitats/forest.jpg',
    fallbackGradient: 'linear-gradient(135deg, #2d5016 0%, #1a3409 100%)',
    overlayOpacity: 0.3, // Adjust this (0 = transparent, 1 = opaque)
  },
  // ... other habitats
};
```

## Troubleshooting

### Images not showing?
1. Check image filenames match exactly (case-sensitive)
2. Ensure images are in `/public/habitats/` folder
3. Check browser console for 404 errors
4. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Images too prominent?
- Increase `overlayOpacity` in `/src/lib/pokemonHabitats.ts`
- Use lighter/softer images

### Text hard to read?
- Increase overlay opacity
- Use images with less contrast
- Choose images with more uniform colors

## License Considerations

Ensure you have rights to use any images you add:
- ✅ Public domain images
- ✅ CC0 licensed images  
- ✅ Images you created yourself
- ❌ Copyrighted images without permission
- ❌ Pokemon game screenshots (Nintendo copyright)

## Next Steps

1. Download or create 9 habitat images
2. Name them according to the list above
3. Add them to `/public/habitats/`
4. Restart your dev server
5. Enjoy themed Pokemon cards! 🎨

---

**Questions?** Check the code in:
- `/src/lib/pokemonHabitats.ts` - Habitat configuration
- `/src/components/PokemonCard.tsx` - Card rendering
- `/src/components/PokemonCardWithData.tsx` - Data fetching

