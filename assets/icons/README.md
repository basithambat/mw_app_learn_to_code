# Icons Directory

This directory contains all SVG icons organized by category, following evolved app architecture patterns.

## Structure

```
assets/icons/
├── index.ts              # Central export point for all icons
└── categories/           # Category-specific icons
    ├── index.ts         # Category icons exports and registry
    └── *.svg           # Individual SVG icon files
```

## Usage

### Import Individual Icons

```typescript
import { BusinessIcon, TechnologyIcon } from '@/assets/icons/categories';

// Use in component
<BusinessIcon width={24} height={24} />
```

### Use Category Icon Helper

```typescript
import { getCategoryIcon } from '@/assets/icons/categories';

const IconComponent = getCategoryIcon('business');
<IconComponent width={24} height={24} />
```

### Use CategoryIcon Component

```typescript
import CategoryIcon from '@/components/CategoryIcon';

<CategoryIcon categoryId="business" size={24} />
```

## Adding New Icons

1. Add the SVG file to `assets/icons/categories/`
2. Export it in `assets/icons/categories/index.ts`
3. Add it to the `CATEGORY_ICONS` registry with appropriate category IDs

## Icon Naming Convention

- Use camelCase for file names (e.g., `breakingNews.svg`)
- Use descriptive names that match category IDs
- Keep SVG files optimized and React Native compatible
