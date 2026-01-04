import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Info card widget matching React design
/// Light gray background with nested white card
class InfoCard extends StatelessWidget {
  final Widget child;
  final String? explanation;
  final EdgeInsets? padding;

  const InfoCard({
    Key? key,
    required this.child,
    this.explanation,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? EdgeInsets.zero,
      decoration: BoxDecoration(
        color: AppTheme.lightGray,
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Nested white card (no padding, card handles its own)
          child,
          // Explanation text
          if (explanation != null) ...[
            Padding(
              padding: const EdgeInsets.only(
                left: 20,
                right: 20,
                top: 12,
                bottom: 16,
              ),
              child: Text(
                explanation!,
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textSecondary,
                  height: 1.43,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
