import 'package:flutter/material.dart';

/// Placeholder image widget that creates a colored gradient placeholder
/// Useful for development when actual images aren't available
class PlaceholderImage extends StatelessWidget {
  final double width;
  final double height;
  final String type; // 'calendar', 'couple', 'family', 'child', 'asset'
  final BorderRadius? borderRadius;

  const PlaceholderImage({
    Key? key,
    required this.width,
    required this.height,
    required this.type,
    this.borderRadius,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color color1;
    Color color2;
    IconData icon;

    switch (type) {
      case 'calendar':
        color1 = const Color(0xFFE8F5E9);
        color2 = const Color(0xFFC8E6C9);
        icon = Icons.calendar_today;
        break;
      case 'couple':
        color1 = const Color(0xFFFFE0B2);
        color2 = const Color(0xFFFFCC80);
        icon = Icons.favorite;
        break;
      case 'family':
        color1 = const Color(0xFFE1BEE7);
        color2 = const Color(0xFFCE93D8);
        icon = Icons.family_restroom;
        break;
      case 'child':
        color1 = const Color(0xFFFFCDD2);
        color2 = const Color(0xFFFFAB91);
        icon = Icons.child_care;
        break;
      case 'real-estate':
        color1 = const Color(0xFFBBDEFB);
        color2 = const Color(0xFF90CAF9);
        icon = Icons.home;
        break;
      case 'vehicle':
        color1 = const Color(0xFFCFD8DC);
        color2 = const Color(0xFFB0BEC5);
        icon = Icons.directions_car;
        break;
      case 'gadgets':
        color1 = const Color(0xFFE0E0E0);
        color2 = const Color(0xFFBDBDBD);
        icon = Icons.phone_android;
        break;
      case 'household':
        color1 = const Color(0xFFFFF9C4);
        color2 = const Color(0xFFFFF59D);
        icon = Icons.chair;
        break;
      case 'ornaments':
        color1 = const Color(0xFFFFF8E1);
        color2 = const Color(0xFFFFE082);
        icon = Icons.diamond;
        break;
      case 'bank-account':
        color1 = const Color(0xFFFFE0B2);
        color2 = const Color(0xFFFFCC80);
        icon = Icons.account_balance;
        break;
      case 'stocks':
        color1 = const Color(0xFFFFF9C4);
        color2 = const Color(0xFFFFF59D);
        icon = Icons.trending_up;
        break;
      case 'loans':
        color1 = const Color(0xFFFFCDD2);
        color2 = const Color(0xFFFFAB91);
        icon = Icons.credit_card;
        break;
      default:
        color1 = const Color(0xFFF5F5F5);
        color2 = const Color(0xFFE0E0E0);
        icon = Icons.image;
    }

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color1, color2],
        ),
        borderRadius: borderRadius ?? BorderRadius.circular(8),
      ),
      child: Center(
        child: Icon(
          icon,
          size: width * 0.3,
          color: Colors.white.withOpacity(0.7),
        ),
      ),
    );
  }
}
