# Flutter DevTools Inspection Guide

## Issue: Flat Overlay in Widget Inspector

If you're experiencing a "flat overlay" or square that prevents you from inspecting individual widgets in Flutter DevTools, here are the solutions:

## Solution 1: Use Widget Tree View (Recommended)

Instead of using the on-screen inspector, use the **Widget Tree** panel in DevTools:

1. Open Flutter DevTools (usually opens automatically when running `flutter run`)
2. Click on the **Widget Tree** tab (left sidebar)
3. Use the search box at the top to find widgets by:
   - Widget type (e.g., `Text`, `Container`, `ElevatedButton`)
   - Key name (e.g., `dashboard_step1_card`, `dashboard_get_started_button`)
4. Click on any widget in the tree to see its properties

### Finding Widgets by Key

All major widgets in the dashboard screen have been assigned Keys for easy inspection:

- `dashboard_status_bar` - Status bar at top
- `dashboard_header` - Logo and app name
- `dashboard_main_title` - Main title text
- `dashboard_step1_card` through `dashboard_step4_card` - Step number cards
- `dashboard_step1_content` through `dashboard_step4_content` - Step content areas
- `dashboard_bottom_bar` - Bottom action bar
- `dashboard_get_started_button` - Get Started button
- `dashboard_floating_assistant` - Floating help button

## Solution 2: Enable Repaint Rainbow

To identify if RepaintBoundary is causing issues:

1. In DevTools, go to the **Performance** tab
2. Enable **Highlight Repaints** (Repaint Rainbow)
3. If you see large solid-colored rectangles flashing, those are likely RepaintBoundary widgets
4. Note: This app doesn't use RepaintBoundary, so this shouldn't be the issue

## Solution 3: Check for Web Renderer Issues

If you're running on web:

1. Check your renderer: `flutter run -d chrome --web-renderer html` (for debugging)
2. Note: HTML renderer is being deprecated, use only for debugging

## Solution 4: Inspect Overlays Separately

For dialogs, bottom sheets, or drawers:

1. Use the Widget Tree to find overlay widgets
2. Search for widget types like `AlertDialog`, `BottomSheet`, `Drawer`
3. These are often easier to find in the tree than by clicking on screen

## Why This Happens

The dashboard screen uses a `Stack` with many `Positioned` widgets to achieve pixel-perfect layout matching the Figma design. While this provides precise control, it can make on-screen inspection challenging because:

- All widgets are in a single Stack layer
- Positioned widgets can overlap
- The inspector may see the entire Stack as one unit

## Best Practices

1. **Use Widget Tree for inspection** - It's more reliable than on-screen clicking
2. **Search by Key** - All important widgets have semantic Keys
3. **Use search by type** - Find widgets by their class name
4. **Check properties panel** - Once selected in tree, see all properties

## Additional Tips

- Use `flutter run --profile` for better DevTools performance
- Keep Flutter and DevTools updated: `flutter upgrade`
- Use hot reload to see changes instantly without losing inspector state
