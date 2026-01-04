import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Progress bar widget matching React design
/// Horizontal bar with percentage fill
class ProgressBar extends StatelessWidget {
  final double progress; // 0.0 to 1.0
  final double height;
  final Color? backgroundColor;
  final Color? fillColor;
  final List<double>? stepIndicators; // Positions for step dots (0.0 to 1.0)

  const ProgressBar({
    Key? key,
    required this.progress,
    this.height = 4.0,
    this.backgroundColor,
    this.fillColor,
    this.stepIndicators,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: backgroundColor ?? AppTheme.borderColor.withOpacity(0.12),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Stack(
        children: [
          // Progress fill
          FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: progress.clamp(0.0, 1.0),
            child: Container(
              decoration: BoxDecoration(
                color: fillColor ?? AppTheme.primaryColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // Step indicators (dots)
          if (stepIndicators != null)
            ...stepIndicators!.map((position) => Positioned(
                  left: (position * 100).clamp(0.0, 100.0) - 2,
                  top: 0,
                  child: Container(
                    width: 4,
                    height: height,
                    decoration: BoxDecoration(
                      color: const Color(0xFFC4C4C4),
                      shape: BoxShape.circle,
                    ),
                  ),
                )),
        ],
      ),
    );
  }
}
