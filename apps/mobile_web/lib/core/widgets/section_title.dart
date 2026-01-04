import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Section title widget matching React design
/// Title (Frank Ruhl Libre) + Description (Lato)
class SectionTitle extends StatelessWidget {
  final String title;
  final String? description;
  final EdgeInsets? padding;

  const SectionTitle({
    Key? key,
    required this.title,
    this.description,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? const EdgeInsets.only(left: 20, top: 88, right: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.frankRuhlLibre(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              color: AppTheme.textPrimary,
              height: 1.33, // 32px line-height
            ),
          ),
          if (description != null) ...[
            const SizedBox(height: 8),
            Text(
              description!,
              style: GoogleFonts.lato(
                fontSize: 14,
                color: AppTheme.textSecondary,
                height: 1.43, // 20px line-height
              ),
            ),
          ],
        ],
      ),
    );
  }
}
