# React to Flutter Component Mapping

## Overview

This document maps React components from the Mwreact repository to their Flutter equivalents, focusing on UI components only (no business logic).

## UI Component Library Mapping

### Buttons

| React Component | Flutter Widget | Notes |
|----------------|----------------|-------|
| `<button className="bg-[#0f361f]">` | `ElevatedButton` | Primary button, dark green background |
| `<button className="border-[1.5px] border-[#0f361f]">` | `OutlinedButton` | Secondary button, outlined border |
| `<button className="bg-[rgba(9,184,82,0.12)]">` | `TextButton` with custom style | Edit/Add button, light green background |
| Button with icon | `IconButton` or `ElevatedButton.icon` | Icon buttons |

**Flutter Implementation**:
```dart
// Primary Button
ElevatedButton(
  onPressed: onPressed,
  style: ElevatedButton.styleFrom(
    backgroundColor: Color(0xFF0F361F), // #0f361f
    foregroundColor: Colors.white,
    minimumSize: Size(320, 56), // w-80 h-14
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8), // rounded-lg
    ),
  ),
  child: Text(
    label,
    style: TextStyle(
      fontFamily: 'FrankRuhlLibre',
      fontWeight: FontWeight.bold,
      fontSize: 16,
    ),
  ),
)

// Edit/Add Button
Container(
  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
  decoration: BoxDecoration(
    color: Color(0xFF09B852).withOpacity(0.12),
    borderRadius: BorderRadius.circular(4),
  ),
  child: Text(
    'Edit',
    style: TextStyle(
      fontFamily: 'Lato',
      fontWeight: FontWeight.bold,
      fontSize: 14,
      color: Color(0xFF09B852),
    ),
  ),
)
```

### Input Fields

| React Component | Flutter Widget | Notes |
|----------------|----------------|-------|
| `<input type="text">` | `TextFormField` | Text input with validation |
| `<input type="email">` | `TextFormField` with `TextInputType.emailAddress` | Email input |
| `<input type="tel">` | `TextFormField` with `TextInputType.phone` | Phone input |
| `<select>` | `DropdownButtonFormField` | Dropdown selection |
| Date picker | `showDatePicker` or custom date picker | Date selection |

**Flutter Implementation**:
```dart
TextFormField(
  decoration: InputDecoration(
    labelText: 'Full Name',
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: Colors.black.withOpacity(0.12)),
    ),
    filled: true,
    fillColor: Colors.white,
    contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
  ),
  style: TextStyle(
    fontFamily: 'Lato',
    fontSize: 16,
    color: Color(0xFF242424),
  ),
)
```

### Cards

| React Component | Flutter Widget | Notes |
|----------------|----------------|-------|
| `<div className="border border-black/12 rounded-lg">` | `Card` | Standard card with border |
| `<div className="bg-[#f1f3f5] rounded-lg">` | `Container` with `BoxDecoration` | Info card with light background |
| Person card | `Card` with `ListTile` or custom layout | Person card with photo, name, edit button |

**Flutter Implementation**:
```dart
// Standard Card
Card(
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(8),
    side: BorderSide(color: Colors.black.withOpacity(0.12)),
  ),
  child: Container(
    height: 76,
    padding: EdgeInsets.symmetric(horizontal: 20),
    child: Row(
      children: [
        // Photo
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Color(0xFFF1F3F5),
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        SizedBox(width: 12),
        // Name and relationship
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: TextStyle(
                  fontFamily: 'Lato',
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Color(0xFF242424),
                ),
              ),
              Text(
                relationship,
                style: TextStyle(
                  fontFamily: 'Lato',
                  fontSize: 14,
                  color: Colors.black.withOpacity(0.56),
                ),
              ),
            ],
          ),
        ),
        // Edit button
        _buildEditButton(),
      ],
    ),
  ),
)
```

### Lists

| React Component | Flutter Widget | Notes |
|----------------|----------------|-------|
| `<div className="space-y-4">` | `ListView.builder` or `Column` with spacing | Vertical list |
| Person list | `ListView.builder` with person cards | List of person cards |
| Asset category list | `ListView.builder` with category cards | List of asset categories |

**Flutter Implementation**:
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16),
      child: PersonCard(person: items[index]),
    );
  },
)
```

### Modals and Sheets

| React Component | Flutter Widget | Notes |
|----------------|----------------|-------|
| Bottom sheet | `showModalBottomSheet` | Bottom sheet modal |
| Full screen modal | `showDialog` with `Dialog` | Full screen dialog |
| Overlay | `Stack` with `Positioned` | Dark overlay background |

**Flutter Implementation**:
```dart
// Bottom Sheet
showModalBottomSheet(
  context: context,
  isScrollControlled: true,
  backgroundColor: Colors.transparent,
  builder: (context) => Container(
    height: MediaQuery.of(context).size.height * 0.8,
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(10),
        topRight: Radius.circular(10),
      ),
    ),
    child: Column(
      children: [
        // Drag handle
        Container(
          width: 48,
          height: 4,
          margin: EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: Color(0xFFE1E1E1),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        // Content
        Expanded(child: content),
      ],
    ),
  ),
)
```

### Progress Indicators

| React Component | Flutter Widget | Notes |
|----------------|----------------|-------|
| Progress bar | `LinearProgressIndicator` | Horizontal progress bar |
| Step indicator | Custom `Row` with circles and lines | Milestone stepper |
| Loading spinner | `CircularProgressIndicator` | Loading indicator |

**Flutter Implementation**:
```dart
// Progress Bar
Container(
  height: 4,
  decoration: BoxDecoration(
    color: Colors.black.withOpacity(0.12),
    borderRadius: BorderRadius.circular(2),
  ),
  child: FractionallySizedBox(
    alignment: Alignment.centerLeft,
    widthFactor: progress, // 0.0 to 1.0
    child: Container(
      decoration: BoxDecoration(
        color: Color(0xFF0F361F),
        borderRadius: BorderRadius.circular(2),
      ),
    ),
  ),
)
```

### Images and Avatars

| React Component | Flutter Widget | Notes |
|----------------|----------------|-------|
| `<img src="...">` | `Image.network` or `Image.asset` | Network or asset image |
| Avatar/Photo | `CircleAvatar` or `ClipRRect` | Circular or rounded image |
| SVG | `SvgPicture.asset` (from `flutter_svg`) | SVG graphics |

**Flutter Implementation**:
```dart
// Avatar
ClipRRect(
  borderRadius: BorderRadius.circular(8),
  child: photoUrl != null
    ? Image.network(
        photoUrl,
        width: 40,
        height: 40,
        fit: BoxFit.cover,
      )
    : Container(
        width: 40,
        height: 40,
        color: Color(0xFFF1F3F5),
      ),
)
```

### Layout Components

| React Component | Flutter Widget | Notes |
|----------------|----------------|-------|
| `<div className="flex">` | `Row` or `Column` | Flex layout |
| `<div className="absolute">` | `Stack` with `Positioned` | Absolute positioning |
| Container with padding | `Padding` or `Container` with `padding` | Spacing |

**Flutter Implementation**:
```dart
// Absolute positioning (like React)
Stack(
  children: [
    Positioned(
      left: 20, // left-5 = 20px
      top: 88,  // top-[88px]
      child: Text('Title'),
    ),
  ],
)
```

### Typography

| React Class | Flutter TextStyle | Notes |
|------------|-------------------|-------|
| `font-['Frank_Ruhl_Libre'] font-bold text-2xl` | `TextStyle(fontFamily: 'FrankRuhlLibre', fontWeight: FontWeight.bold, fontSize: 24)` | Title style |
| `font-['Lato'] text-sm text-[#707070]` | `TextStyle(fontFamily: 'Lato', fontSize: 14, color: Color(0xFF707070))` | Body text style |
| `font-['Lato'] font-bold text-base` | `TextStyle(fontFamily: 'Lato', fontWeight: FontWeight.bold, fontSize: 16)` | Bold body text |

## Screen-Specific Component Mappings

### Dashboard Screen

| React Element | Flutter Widget |
|--------------|----------------|
| Milestone step card | `Row` with `Container` (icon) + `Column` (content) |
| Vertical line connector | `Container` with `height` and `color` |
| Divider | `Divider` |
| Bottom action bar | `Positioned` at bottom with `Container` |

### Family Screen

| React Element | Flutter Widget |
|--------------|----------------|
| Empty person card | `Card` with placeholder and "Add" button |
| Filled person card | `Card` with `Row` (photo + info + edit button) |
| Info card with explanation | `Container` with nested `Card` |
| Continue button | `Positioned` `ElevatedButton` at bottom |

### Inheritance Scenario Screen

| React Element | Flutter Widget |
|--------------|----------------|
| Person card with slider | `Card` with `Row` + `Slider` widget |
| Percentage display | `Text` widget |
| Total percentage | `Text` widget with validation |

### Witness Screen

| React Element | Flutter Widget |
|--------------|----------------|
| Witness slot (empty) | `OutlinedButton` |
| Witness slot (filled) | `Card` with badge, name, email, edit button |
| Progress bar | `LinearProgressIndicator` |

### Assets Overview Screen

| React Element | Flutter Widget |
|--------------|----------------|
| Top section (light green) | `Container` with `BoxDecoration` |
| Bottom sheet | `showModalBottomSheet` or `DraggableScrollableSheet` |
| Category card | `Row` with icon, text, toggle switch |
| Toggle switch | `Switch` widget |

## Color Mapping

| React Color | Flutter Color | Usage |
|------------|---------------|-------|
| `#0f361f` / `#0e371f` | `Color(0xFF0F361F)` | Primary dark green |
| `#09b852` | `Color(0xFF09B852)` | Accent green |
| `#e3eae6` / `#e7f1eb` | `Color(0xFFE3EAE6)` | Light green background |
| `#f1f3f5` | `Color(0xFFF1F3F5)` | Light gray background |
| `#242424` | `Color(0xFF242424)` | Primary text color |
| `#707070` | `Color(0xFF707070)` | Secondary text color |
| `rgba(0,0,0,0.56)` | `Colors.black.withOpacity(0.56)` | Muted text |
| `rgba(0,0,0,0.12)` | `Colors.black.withOpacity(0.12)` | Border color |

## Spacing Mapping

| React Class | Flutter Value | Notes |
|------------|---------------|-------|
| `left-5` / `px-5` | `20.0` | 5 * 4px = 20px |
| `gap-3` | `12.0` | 3 * 4px = 12px |
| `gap-4` | `16.0` | 4 * 4px = 16px |
| `gap-6` | `24.0` | 6 * 4px = 24px |
| `h-14` | `56.0` | 14 * 4px = 56px |
| `w-80` | `320.0` | 80 * 4px = 320px |
| `rounded-lg` | `BorderRadius.circular(8)` | 8px radius |

## Font Mapping

| React Font | Flutter Font Family | Notes |
|-----------|---------------------|-------|
| `font-['Frank_Ruhl_Libre']` | `'FrankRuhlLibre'` | Title font (needs to be added to pubspec.yaml) |
| `font-['Lato']` | `'Lato'` | Body font (needs to be added to pubspec.yaml) |

## Common Patterns

### Screen Container
```dart
Scaffold(
  backgroundColor: Colors.white,
  body: Stack(
    children: [
      // Status bar
      Positioned(
        top: 0,
        left: 0,
        right: 0,
        height: 24,
        child: Container(
          color: Colors.black.withOpacity(0.05),
        ),
      ),
      // Decorative element
      Positioned(
        top: 0,
        right: 0,
        child: Container(
          width: 120,
          height: 120,
          color: Color(0xFFE3EAE6),
        ),
      ),
      // Back button
      Positioned(
        top: 40,
        left: 16,
        child: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: onBack,
        ),
      ),
      // Content
      Positioned(
        top: 88,
        left: 20,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Text(
              title,
              style: TextStyle(
                fontFamily: 'FrankRuhlLibre',
                fontWeight: FontWeight.bold,
                fontSize: 24,
                color: Color(0xFF242424),
              ),
            ),
            // Description
            SizedBox(height: 8),
            Text(
              description,
              style: TextStyle(
                fontFamily: 'Lato',
                fontSize: 14,
                color: Color(0xFF707070),
              ),
            ),
          ],
        ),
      ),
    ],
  ),
)
```

### Person Card Component
```dart
class PersonCard extends StatelessWidget {
  final String name;
  final String? relationship;
  final String? photoUrl;
  final VoidCallback? onEdit;

  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: Colors.black.withOpacity(0.12)),
      ),
      child: Container(
        height: 76,
        padding: EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            // Photo
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: photoUrl != null
                ? Image.network(photoUrl!, width: 40, height: 40, fit: BoxFit.cover)
                : Container(width: 40, height: 40, color: Color(0xFFF1F3F5)),
            ),
            SizedBox(width: 12),
            // Name and relationship
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontFamily: 'Lato',
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Color(0xFF242424),
                    ),
                  ),
                  if (relationship != null)
                    Text(
                      relationship!,
                      style: TextStyle(
                        fontFamily: 'Lato',
                        fontSize: 14,
                        color: Colors.black.withOpacity(0.56),
                      ),
                    ),
                ],
              ),
            ),
            // Edit button
            if (onEdit != null)
              GestureDetector(
                onTap: onEdit,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Color(0xFF09B852).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Edit',
                    style: TextStyle(
                      fontFamily: 'Lato',
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Color(0xFF09B852),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

## Notes for Implementation

1. **Absolute Positioning**: React uses absolute positioning extensively. Flutter should use `Stack` with `Positioned` widgets.

2. **Fixed Dimensions**: React screens use fixed 360px width. Flutter should use `SizedBox` or `Container` with fixed width.

3. **Font Loading**: Custom fonts (Frank Ruhl Libre, Lato) need to be added to `pubspec.yaml` and loaded.

4. **SVG Support**: Use `flutter_svg` package for SVG graphics.

5. **Image Assets**: Convert Figma-generated image paths to Flutter asset images.

6. **State Management**: Use Flutter's existing state management (Provider) - don't copy React state patterns.

7. **Navigation**: Use Flutter's navigation system, not React Router patterns.

8. **Form Validation**: Use Flutter's form validation, not React Hook Form patterns.
