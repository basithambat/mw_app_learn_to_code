import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter/foundation.dart' show kIsWeb;

/// A wrapper around [SvgPicture] that safely renders SVGs on Web
/// by removing unsupported tags (like <filter>) that cause crashes.
class SafeSvgPicture extends StatelessWidget {
  final String assetPath;
  final double? width;
  final double? height;
  final Color? color;
  final BoxFit fit;

  const SafeSvgPicture.asset(
    this.assetPath, {
    super.key,
    this.width,
    this.height,
    this.color,
    this.fit = BoxFit.contain,
  });

  Future<String> _loadAndSanitizeSvg() async {
    try {
      String svgContent = await rootBundle.loadString(assetPath);
      
      // Only perform sanitization on Web where the crash occurs
      if (kIsWeb) {
        // Remove <filter>...</filter> blocks
        final filterPattern = RegExp(r'<filter[\s\S]*?</filter>');
        // Remove filter="..." attributes (e.g. filter="url(#...)")
        final filterAttrPattern = RegExp(r'filter="[^"]*"');
        
        svgContent = svgContent
            .replaceAll(filterPattern, '')
            .replaceAll(filterAttrPattern, '');
      }
          
      return svgContent;
    } catch (e) {
      debugPrint('Error loading/sanitizing SVG ($assetPath): $e');
      return ''; 
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: _loadAndSanitizeSvg(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return SizedBox(width: width, height: height);
        }
        
        if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          // Fallback to empty container on error
          return SizedBox(width: width, height: height);
        }

        return SvgPicture.string(
          snapshot.data!,
          width: width,
          height: height,
          colorFilter: color != null 
              ? ColorFilter.mode(color!, BlendMode.srcIn) 
              : null,
          fit: fit,
          placeholderBuilder: (context) => SizedBox(width: width, height: height),
        );
      },
    );
  }
}
