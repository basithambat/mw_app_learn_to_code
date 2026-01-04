import 'package:flutter/material.dart';
import 'placeholder_image.dart';

/// Smart image widget that tries to load actual image first,
/// falls back to placeholder if image doesn't exist
class SmartImage extends StatelessWidget {
  final String imagePath;
  final double width;
  final double height;
  final String placeholderType;
  final BoxFit fit;
  final BorderRadius? borderRadius;

  const SmartImage({
    Key? key,
    required this.imagePath,
    required this.width,
    required this.height,
    required this.placeholderType,
    this.fit = BoxFit.cover,
    this.borderRadius,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget imageWidget = Image.asset(
      imagePath,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        return PlaceholderImage(
          width: width,
          height: height,
          type: placeholderType,
          borderRadius: borderRadius,
        );
      },
    );

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }

    return imageWidget;
  }
}
