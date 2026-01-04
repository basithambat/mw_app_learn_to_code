# Figma Splash Screens - Structure Analysis

## Screen Dimensions
- Width: 360px
- Height: 720px (mobile portrait)

## Common Elements Across All Screens

### Background
- **Type**: Radial Gradient
- **Colors**: 
  - Start: `rgba(15, 54, 31, 1)` = `#0F361F`
  - End: `rgba(22, 79, 45, 1)` = `#164F2D`
- **Gradient Transform**: `matrix(36 73.499 -36.749 18 3.747e-15 0)`
- **Full coverage**: `0 0 360 720`

### Ellipse Background Shape
- **Asset**: `ellipse_background.svg`
- **Position**: `left: -550.67px, top: -390.67px`
- **Size**: `894.67px × 894.67px`
- **Purpose**: Decorative background element

---

## Splash Screen 1 (Node: 1:5042)

### Layout
- **Background**: Dark green radial gradient
- **Ellipse**: Positioned at top-left (off-screen for effect)

### Logo
- **Asset**: `logo_splash1.svg` (Group11)
- **Position**: 
  - X: 148px (from left)
  - Y: 327.91px (from top)
- **Size**: 64px × 64.184px
- **Content**: White circular logo with stylized "m" symbol

### Navigation
- Auto-advance or swipe to next screen

---

## Splash Screen 2 (Node: 1:5021)

### Layout
- **Background**: Same dark green radial gradient
- **Ellipse**: Same decorative element

### Logo + Text Group
- **Container**: Group 171
- **Position**: X: 80px, Y: 336px
- **Width**: 200px, **Height**: 48px

#### Logo
- **Asset**: `logo_splash2.svg` (Group11)
- **Position**: X: 80px, Y: 336px (relative to container)
- **Size**: 47.863px × 48px

#### Text "mywasiyat"
- **Asset**: `mywasiyat_text.svg` (Union)
- **Position**: X: 135.04px, Y: 345.6px (relative to container)
- **Size**: 144.958px × 28.8px
- **Style**: White text, sans-serif

### Navigation
- Previous/Next buttons or swipe

---

## Splash Screen 3 (Node: 1:5029)

### Layout
- **Background**: Same dark green radial gradient
- **Ellipse**: Same decorative element
- **Logo + Text**: Same as Screen 2

### Progress Indicator (Group 2801)
- **Container Position**: X: 100.5px, Y: 652px
- **Container Size**: 159px × 30px

#### Progress Bar Background
- **Position**: X: 100.5px, Y: 652px
- **Size**: 159px × 3px
- **Color**: Black (`#000000`)
- **Opacity**: 30% (0.3)
- **Border Radius**: 56px (fully rounded)

#### Progress Bar Fill
- **Position**: X: 100.5px, Y: 652px
- **Size**: 60px × 3px (37.7% of 159px)
- **Color**: `#09b852` (green)
- **Opacity**: 45% (0.45)
- **Border Radius**: 56px

#### Tagline Text
- **Text**: "Plan for better tomorrow"
- **Position**: X: 100.5px, Y: 663px (centered)
- **Font**: Avenir Medium (or system sans-serif)
- **Size**: 14px
- **Color**: White (`#FFFFFF`)
- **Opacity**: 56% (0.56)
- **Alignment**: Center
- **Transform**: `translateX(-50%)` (centered)

### Navigation
- Continue button or auto-advance to login

---

## Implementation Plan

### 1. Assets Setup
- [ ] Download SVG assets from Figma
- [ ] Add to `assets/images/` and `assets/icons/`
- [ ] Update `pubspec.yaml` to include assets
- [ ] Use `flutter_svg` package for rendering

### 2. Theme Colors
- [ ] Add gradient colors to theme
- [ ] Create gradient helper function
- [ ] Match exact hex values

### 3. Screen 1 Implementation
- [ ] Create gradient background
- [ ] Position ellipse decoration
- [ ] Center logo (64×64px at calculated position)
- [ ] Add auto-advance or navigation

### 4. Screen 2 Implementation
- [ ] Same background + ellipse
- [ ] Logo at (80, 336)
- [ ] Text "mywasiyat" at (135.04, 345.6)
- [ ] Group them in container

### 5. Screen 3 Implementation
- [ ] Same as Screen 2
- [ ] Add progress bar container at bottom
- [ ] Implement progress indicator
- [ ] Add tagline text below progress bar

### 6. Navigation Flow
- [ ] Screen 1 → Screen 2 → Screen 3 → Login
- [ ] Add swipe gestures
- [ ] Add skip button (optional)
- [ ] Auto-advance timer (optional)

### 7. Responsive Considerations
- [ ] Scale for different screen sizes
- [ ] Maintain aspect ratios
- [ ] Center elements properly

---

## Color Palette Extracted

```dart
// Background Gradient
final Color gradientStart = Color(0xFF0F361F); // rgba(15, 54, 31, 1)
final Color gradientEnd = Color(0xFF164F2D);     // rgba(22, 79, 45, 1)

// Progress Bar
final Color progressFill = Color(0xFF09b852);  // Green
final Color progressBg = Colors.black.withOpacity(0.3);

// Text
final Color textWhite = Colors.white;
final double textOpacity = 0.56;
```

---

## Typography

- **Font Family**: Avenir Medium (fallback: system sans-serif)
- **Tagline Size**: 14px
- **Logo Text**: Embedded in SVG

---

## Measurements Summary

| Element | Screen 1 | Screen 2 | Screen 3 |
|---------|----------|----------|----------|
| Logo X | 148px | 80px | 80px |
| Logo Y | 327.91px | 336px | 336px |
| Logo Size | 64×64px | 47.863×48px | 47.863×48px |
| Text X | - | 135.04px | 135.04px |
| Text Y | - | 345.6px | 345.6px |
| Progress Y | - | - | 652px |
| Tagline Y | - | - | 663px |
