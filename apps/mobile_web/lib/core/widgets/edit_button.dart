import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Edit/Add button widget matching React design
/// Light green background with green text
class EditButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final EdgeInsets? padding;

  const EditButton({
    Key? key,
    required this.label,
    this.onPressed,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppTheme.accentGreen.withOpacity(0.12),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: GoogleFonts.lato(
            fontWeight: FontWeight.bold,
            fontSize: 14,
            color: AppTheme.accentGreen,
          ),
        ),
      ),
    );
  }
}
