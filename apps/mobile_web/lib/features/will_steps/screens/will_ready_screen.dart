import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import 'will_preview_screen.dart';

class WillReadyScreen extends StatelessWidget {
  final String? willId;

  const WillReadyScreen({Key? key, this.willId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              Text(
                'Yay! Your will is ready',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // Will preview placeholder
              Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  color: AppTheme.lightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(AppTheme.radiusM),
                  border: Border.all(
                    color: AppTheme.borderColor.withOpacity(0.2),
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.description,
                      size: 48,
                      color: AppTheme.textSecondary,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Will Document Preview',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              PrimaryButton(
                text: 'Review my will',
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => WillPreviewScreen(willId: willId),
                    ),
                  );
                },
              ),
              const SizedBox(height: 40),
              // Next steps section
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.lightGray.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppTheme.radiusM),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Next steps',
                      style: GoogleFonts.lato(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildNextStepItem('Notify your executors', false),
                    const SizedBox(height: 12),
                    _buildNextStepItem('Notify your family & properties', false),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNextStepItem(String text, bool isCompleted) {
    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: isCompleted ? AppTheme.accentGreen : Colors.transparent,
            border: Border.all(
              color: isCompleted ? AppTheme.accentGreen : AppTheme.borderColor.withOpacity(0.5),
            ),
            borderRadius: BorderRadius.circular(4),
          ),
          child: isCompleted
              ? const Icon(
                  Icons.check,
                  size: 14,
                  color: Colors.white,
                )
              : null,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.lato(
              fontSize: 14,
              color: isCompleted ? AppTheme.textPrimary : AppTheme.textSecondary,
              decoration: isCompleted ? null : TextDecoration.none,
            ),
          ),
        ),
      ],
    );
  }
}
