import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import 'video_recording_screen.dart';

class RecordConsentScreen extends StatelessWidget {
  final String? willId;
  final String? userName;

  const RecordConsentScreen({
    Key? key,
    this.willId,
    this.userName,
  }) : super(key: key);

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
          'Your will is ready, record a consent to finish it',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 18,
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
              const SizedBox(height: 20),
              // Image placeholder
              Container(
                width: double.infinity,
                height: 250,
                decoration: BoxDecoration(
                  color: AppTheme.lightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(AppTheme.radiusM),
                ),
                child: Icon(
                  Icons.videocam,
                  size: 64,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'A video consent is required to make your will legally valid. You will need to record a short video stating that you are creating this will of your own free will.',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 40),
              PrimaryButton(
                text: 'Record consent',
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => VideoRecordingScreen(
                        willId: willId,
                        userName: userName ?? 'User',
                      ),
                    ),
                  ).then((result) {
                    if (result == true) {
                      Navigator.pop(context, true);
                    }
                  });
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
