import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';

class UnderstandModal extends StatelessWidget {
  const UnderstandModal({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Understand what is counted for distribution here',
            style: GoogleFonts.frankRuhlLibre(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 24),
          // INCLUDED Section
          Text(
            'INCLUDED',
            style: GoogleFonts.lato(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryColor,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 1,
            color: Colors.black.withOpacity(0.12),
          ),
          const SizedBox(height: 12),
          _buildBulletPoint('Property (Flat, House, Land)'),
          _buildBulletPoint('Money in your bank accounts'),
          _buildBulletPoint('Stocks, jewellery & shares'),
          _buildBulletPoint('Things that can be distributed'),
          const SizedBox(height: 24),
          // NOT INCLUDED Section
          Text(
            'NOT INCLUDED',
            style: GoogleFonts.lato(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.red.shade700,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 1,
            color: Colors.black.withOpacity(0.12),
          ),
          const SizedBox(height: 12),
          _buildBulletPoint('Nominated life insurance policies'),
          _buildBulletPoint('Asset that can have singular ownership like vehicle or gadget*'),
          const SizedBox(height: 16),
          Text(
            '*You can add such assets to ensure smoother ownership transfer anytime in "assets & properties" section',
            style: GoogleFonts.lato(
              fontSize: 12,
              color: AppTheme.textSecondary,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            text: 'Okay, Continue',
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 6, right: 12),
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.textPrimary,
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.lato(
                fontSize: 14,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
