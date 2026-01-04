import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Person card widget matching React design
/// Supports both empty and filled states
class PersonCard extends StatelessWidget {
  final String? name;
  final String? relationship;
  final String? photoUrl;
  final VoidCallback? onEdit;
  final VoidCallback? onAdd;
  final bool isEmpty;
  final double height;

  const PersonCard({
    Key? key,
    this.name,
    this.relationship,
    this.photoUrl,
    this.onEdit,
    this.onAdd,
    this.isEmpty = false,
    this.height = 76.0, // Default filled card height
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (isEmpty) {
      return _buildEmptyCard();
    }
    return _buildFilledCard();
  }

  Widget _buildEmptyCard() {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
        side: BorderSide(color: AppTheme.borderColor.withOpacity(0.12)),
      ),
      child: Container(
        height: 64.0, // Empty card height
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            // Placeholder photo
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppTheme.lightGray.withOpacity(0.78),
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            const SizedBox(width: 12),
            // Name/Title
            Expanded(
              child: Text(
                name ?? 'Add',
                style: GoogleFonts.lato(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            // Add button
            if (onAdd != null) _buildEditButton(onAdd!, 'Add'),
          ],
        ),
      ),
    );
  }

  Widget _buildFilledCard() {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
        side: BorderSide(color: AppTheme.borderColor.withOpacity(0.12)),
      ),
      child: Container(
        height: height,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            // Photo
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: photoUrl != null
                  ? Image.network(
                      photoUrl!,
                      width: 40,
                      height: 40,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          _buildPlaceholderPhoto(),
                    )
                  : _buildPlaceholderPhoto(),
            ),
            const SizedBox(width: 12),
            // Name and relationship
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (name != null)
                    Text(
                      name!,
                style: GoogleFonts.lato(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: AppTheme.textPrimary,
                  height: 1.5,
                ),
                    ),
                  if (relationship != null)
                    Text(
                      relationship!,
                  style: GoogleFonts.lato(
                    fontSize: 14,
                    color: AppTheme.textMuted,
                    height: 1.43,
                  ),
                    ),
                ],
              ),
            ),
            // Edit button
            if (onEdit != null) _buildEditButton(onEdit!, 'Edit'),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholderPhoto() {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: AppTheme.lightGray.withOpacity(0.78),
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }

  Widget _buildEditButton(VoidCallback onTap, String label) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
