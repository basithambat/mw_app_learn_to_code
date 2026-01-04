import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/secondary_button.dart';
import '../../../core/widgets/placeholder_image.dart';

/// Onboarding Minors Screen - Matches React OnboardingMinors component
/// Screen 5: Yes/No question with image and radio buttons
class OnboardingMinorsScreen extends StatefulWidget {
  final String userName;
  final Function(bool hasMinors)? onContinue;
  final VoidCallback? onBack;

  const OnboardingMinorsScreen({
    Key? key,
    required this.userName,
    this.onContinue,
    this.onBack,
  }) : super(key: key);

  @override
  State<OnboardingMinorsScreen> createState() => _OnboardingMinorsScreenState();
}

class _OnboardingMinorsScreenState extends State<OnboardingMinorsScreen> {
  bool? _hasMinors;

  void _handleContinue() {
    if (_hasMinors != null) {
      widget.onContinue?.call(_hasMinors!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final padding = screenWidth * 0.055;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header Section
            Padding(
              padding: EdgeInsets.fromLTRB(padding, 12, padding, 0),
              child: Column(
                children: [
                  // Back Button and Header Row
                  Row(
                    children: [
                      GestureDetector(
                        onTap: widget.onBack,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Color(0xFF164F2D), Color(0xFF0F361F)],
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.arrow_upward,
                            size: 12,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Help us know you, ${widget.userName}!',
                          style: GoogleFonts.frankRuhlLibre(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            height: 1.5,
                            color: const Color(0xFF0E371F),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Progress Bar
                  Stack(
                    children: [
                      Container(
                        height: 0.5,
                        color: const Color(0xFF0D361E).withOpacity(0.2),
                      ),
                      Container(
                        height: 0.5,
                        width: screenWidth * 0.8, // ~256px
                        color: const Color(0xFF0D361E),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    // Hero Image (Child)
                    SizedBox(
                      width: double.infinity,
                      height: screenHeight * 0.28,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.asset(
                          'assets/images/onboarding/child.jpg',
                          width: double.infinity,
                          height: screenHeight * 0.28,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return PlaceholderImage(
                              width: double.infinity,
                              height: screenHeight * 0.28,
                              type: 'child',
                              borderRadius: BorderRadius.circular(8),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Question
                    Text(
                      'Are any children under 18?',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        height: 1.33,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Yes Option
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _hasMinors = true;
                        });
                      },
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _hasMinors == true
                                ? const Color(0xFF0D361E)
                                : Colors.black.withOpacity(0.12),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Yes',
                              style: GoogleFonts.lato(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: _hasMinors == true
                                      ? const Color(0xFF0D361E)
                                      : Colors.black.withOpacity(0.12),
                                ),
                                color: _hasMinors == true
                                    ? const Color(0xFF0D361E)
                                    : Colors.white,
                              ),
                              child: _hasMinors == true
                                  ? const Center(
                                      child: CircleAvatar(
                                        radius: 6,
                                        backgroundColor: Colors.white,
                                      ),
                                    )
                                  : null,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // No Option
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _hasMinors = false;
                        });
                      },
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _hasMinors == false
                                ? const Color(0xFF0D361E)
                                : Colors.black.withOpacity(0.12),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'No',
                              style: GoogleFonts.lato(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: _hasMinors == false
                                      ? const Color(0xFF0D361E)
                                      : Colors.black.withOpacity(0.12),
                                ),
                                color: _hasMinors == false
                                    ? const Color(0xFF0D361E)
                                    : Colors.white,
                              ),
                              child: _hasMinors == false
                                  ? const Center(
                                      child: CircleAvatar(
                                        radius: 6,
                                        backgroundColor: Colors.white,
                                      ),
                                    )
                                  : null,
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.05),
                  ],
                ),
              ),
            ),

            // Bottom Buttons
            Padding(
              padding: EdgeInsets.all(padding),
              child: Row(
                children: [
                  Expanded(
                    child: SecondaryButton(
                      text: 'Back',
                      onPressed: widget.onBack,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: PrimaryButton(
                      text: 'Continue',
                      onPressed: _hasMinors != null ? _handleContinue : null,
                      backgroundColor: _hasMinors != null
                          ? AppTheme.primaryColor
                          : AppTheme.primaryColor.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
