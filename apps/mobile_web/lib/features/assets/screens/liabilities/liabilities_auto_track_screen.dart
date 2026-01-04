import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import 'liabilities_confirm_modal.dart';
import 'liabilities_summary_screen.dart';

class LiabilitiesAutoTrackScreen extends StatelessWidget {
  final String? willId;

  const LiabilitiesAutoTrackScreen({Key? key, this.willId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Liabilities',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Auto-track your liabilities',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'The details will auto-update in your will and the latest will be fetched whenever you download',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'AUTO-TRACK',
                style: GoogleFonts.lato(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              _buildTrackItem('Loans', 'For assets that are under your name', Icons.home, true),
              const SizedBox(height: 12),
              _buildTrackItem('Credit cards', 'Track outstanding right from app', Icons.credit_card, true),
              const SizedBox(height: 12),
              _buildTrackItem('Credit score', 'Check score that used across for trust', Icons.bar_chart, true),
              const SizedBox(height: 40),
              PrimaryButton(
                text: 'Auto-track now',
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (context) => LiabilitiesConfirmModal(
                      willId: willId,
                    ),
                  ).then((result) {
                    if (result == true) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => LiabilitiesSummaryScreen(willId: willId),
                        ),
                      );
                    }
                  });
                },
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () {
                  // Manual entry
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppTheme.borderColor.withOpacity(0.5)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                  ),
                  minimumSize: const Size(double.infinity, 56),
                ),
                child: Text(
                  'I\'ll enter manually',
                  style: GoogleFonts.lato(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTrackItem(String title, String description, IconData icon, bool isEnabled) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.borderColor.withOpacity(0.12)),
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
      ),
      child: Row(
        children: [
          Icon(icon, size: 24, color: AppTheme.textSecondary),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.lato(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ),
          ),
          if (isEnabled)
            const Icon(
              Icons.check_circle,
              color: AppTheme.accentGreen,
              size: 24,
            ),
        ],
      ),
    );
  }
}
