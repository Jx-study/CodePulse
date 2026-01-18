# Skeleton Loading System

A comprehensive skeleton loading system for React Lazy Loading components, providing smooth visual feedback during component loading.

## 📁 File Structure

```
Skeleton/
├── index.ts                          # Unified exports
├── SkeletonCard.tsx                  # Card skeleton component
├── SkeletonText.tsx                  # Text skeleton component
├── SkeletonImage.tsx                 # Image skeleton component
├── SkeletonButton.tsx                # Button skeleton component
├── FeaturesSkeleton.tsx              # Features section skeleton
├── DataStructureAlgorithmSkeleton.tsx # Algorithm section skeleton
├── Skeleton.module.scss              # Styles and animations
└── README.md                         # This file
```

## 🚀 Usage

### Basic Components

#### SkeletonCard
```tsx
import { SkeletonCard } from '@/shared/components/Skeleton';

<SkeletonCard
  width="280px"
  height="320px"
  variant="rounded"
  animation="shimmer"
/>
```

#### SkeletonText
```tsx
import { SkeletonText } from '@/shared/components/Skeleton';

// Single line
<SkeletonText width="80%" height="1.5rem" />

// Multiple lines with varying widths
<SkeletonText
  lines={3}
  width={['100%', '95%', '85%']}
  height="1rem"
/>
```

#### SkeletonImage
```tsx
import { SkeletonImage } from '@/shared/components/Skeleton';

<SkeletonImage
  width="80px"
  height="80px"
  variant="circular"
/>
```

#### SkeletonButton
```tsx
import { SkeletonButton } from '@/shared/components/Skeleton';

<SkeletonButton width="100px" height="36px" />
```

### Specialized Skeleton Screens

#### FeaturesSkeleton
```tsx
import { FeaturesSkeleton } from '@/shared/components/Skeleton';

<Suspense fallback={<FeaturesSkeleton count={4} />}>
  <Features />
</Suspense>
```

#### DataStructureAlgorithmSkeleton
```tsx
import { DataStructureAlgorithmSkeleton } from '@/shared/components/Skeleton';

<Suspense fallback={<DataStructureAlgorithmSkeleton cardsPerSlide={4} />}>
  <DataStructureAlgorithm />
</Suspense>
```

## 🎨 Features

### Animations
- **Shimmer**: Smooth shimmer effect (光澤掃過效果)
- **Pulse**: Breathing effect (呼吸效果)
- **None**: Static skeleton without animation

### Variants
- **Rectangular**: 4px border radius
- **Rounded**: 8px border radius
- **Circular**: 50% border radius (perfect circles)

### Theme Support
- ✅ Light mode
- ✅ Dark mode (automatic detection)
- ✅ Follows system preferences

### Accessibility
- ✅ `aria-busy="true"` for loading state
- ✅ `aria-live="polite"` for screen readers
- ✅ Respects `prefers-reduced-motion` setting

## 🎯 Props Reference

### SkeletonCard Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | string \| number | '100%' | Width of the skeleton |
| height | string \| number | '200px' | Height of the skeleton |
| variant | 'rectangular' \| 'rounded' \| 'circular' | 'rounded' | Border radius variant |
| animation | 'shimmer' \| 'pulse' \| 'none' | 'shimmer' | Animation type |
| className | string | '' | Additional CSS classes |
| children | ReactNode | - | Optional children for container mode |

### SkeletonText Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| lines | number | 1 | Number of text lines |
| width | string \| number \| Array | '100%' | Width(s) for each line |
| height | string \| number | '1em' | Height of each line |
| spacing | string \| number | '0.5em' | Gap between lines |
| animation | 'shimmer' \| 'pulse' \| 'none' | 'shimmer' | Animation type |

### SkeletonImage Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | string \| number | '100%' | Width of the skeleton |
| height | string \| number | - | Height of the skeleton |
| aspectRatio | string | - | CSS aspect-ratio value |
| variant | 'rectangular' \| 'rounded' \| 'circular' | 'rounded' | Border radius variant |
| animation | 'shimmer' \| 'pulse' \| 'none' | 'shimmer' | Animation type |

### SkeletonButton Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | string \| number | '100px' | Width of the button |
| height | string \| number | '36px' | Height of the button |
| variant | 'primary' \| 'secondary' \| 'outline' | 'primary' | Button style variant |
| animation | 'shimmer' \| 'pulse' \| 'none' | 'shimmer' | Animation type |

## 🎭 Design Guidelines

### Color Scheme
```scss
// Light mode
--skeleton-bg: #e0e0e0
--skeleton-shimmer: rgba(255, 255, 255, 0.3)

// Dark mode
--skeleton-bg-dark: #2a2a2a
--skeleton-shimmer-dark: rgba(255, 255, 255, 0.1)
```

### Animation Timing
- **Shimmer**: 2s infinite loop
- **Pulse**: 1.5s infinite loop
- **Transition**: 300ms fade-in when content loads

## 📱 Responsive Design

All skeleton components are fully responsive and adapt to different screen sizes:
- Desktop: 4-column grid
- Tablet: 2-column grid
- Mobile: Single column

## ♿ Accessibility

The skeleton system follows accessibility best practices:
- Semantic HTML with ARIA attributes
- Screen reader friendly
- Respects motion preferences
- Keyboard navigation compatible

## 🔧 Technical Notes

### Performance Optimizations
1. CSS animations instead of JavaScript (GPU accelerated)
2. Uses `transform` and `opacity` to avoid reflow
3. Minimal DOM nodes
4. Efficient CSS classes

### Browser Support
- Modern browsers with CSS Grid support
- Prefers-color-scheme media query support
- CSS animations support

## 📝 Examples

### Custom Skeleton Layout
```tsx
import { SkeletonCard, SkeletonText, SkeletonImage } from '@/shared/components/Skeleton';

function CustomSkeleton() {
  return (
    <div className="custom-skeleton">
      <SkeletonImage width="100%" height="200px" />
      <SkeletonText width="80%" height="2rem" />
      <SkeletonText lines={3} width={['100%', '95%', '85%']} />
    </div>
  );
}
```

## 📚 Related Documentation

See [Skeleton-Loading-System-Design.md](../../../../../Note/design-docs/components/Skeleton-Loading-System-Design.md) for full design specifications.

## 🐛 Troubleshooting

### Skeleton not showing
- Ensure the component is wrapped in `<Suspense>`
- Check that the lazy-loaded component path is correct

### Animation not working
- Check browser CSS animation support
- Verify `prefers-reduced-motion` settings

### Styling issues
- Ensure SCSS modules are properly imported
- Check CSS variable definitions in `_variables.scss`

---

**Version**: 1.0
**Created**: 2025-10-24
**Author**: Claude + Julian Tee
