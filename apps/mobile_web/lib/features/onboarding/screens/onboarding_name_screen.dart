import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';

/// Onboarding Name Screen - Matches React OnboardingName component
/// Screen 1: Confirm legal name with gender selection
class OnboardingNameScreen extends StatefulWidget {
  final Function(String name, String gender)? onContinue;

  const OnboardingNameScreen({
    Key? key,
    this.onContinue,
  }) : super(key: key);

  @override
  State<OnboardingNameScreen> createState() => _OnboardingNameScreenState();
}

class _OnboardingNameScreenState extends State<OnboardingNameScreen> {
  final _nameController = TextEditingController();
  final _focusNode = FocusNode();
  String? _selectedGender;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleContinue() {
    if (_nameController.text.isNotEmpty && _selectedGender != null) {
      widget.onContinue?.call(_nameController.text, _selectedGender!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final padding = screenWidth * 0.055; // ~20px on 360px screen

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Column(
          children: [
            // Header Section
            Padding(
              padding: EdgeInsets.fromLTRB(padding, 20, padding, 0),
              child: Column(
                children: [
                  // Logo Header
                  Row(
                    children: [
                      SvgPicture.asset(
                        'assets/icons/logo_icon.svg',
                        width: 24,
                        height: 24,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'mywasiyat',
                        style: GoogleFonts.frankRuhlLibre(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0E361F),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Separator Line
                  Container(
                    height: 1,
                    color: const Color(0xFFE0E0E0),
                  ),
                  // Progress Indicator
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(top: 1),
                      height: 3,
                      width: 56,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(1.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content Section - Scrollable
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    // Title
                    Text(
                      'Confirm your legal name',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        height: 1.33,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Subtitle
                    Text(
                      'We will be making will for this person',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: const Color(0xFF666666),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Name Input
                    Container(
                      height: 56,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _isFocused || _nameController.text.isNotEmpty
                              ? const Color(0xFF16B868)
                              : const Color(0xFFE0E0E0),
                          width: _isFocused || _nameController.text.isNotEmpty ? 2 : 1,
                        ),
                      ),
                      child: TextField(
                        controller: _nameController,
                        focusNode: _focusNode,
                        style: GoogleFonts.lato(
                          fontSize: 18,
                          color: AppTheme.textPrimary,
                        ),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          errorBorder: InputBorder.none,
                          disabledBorder: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          hintText: 'Enter your name',
                          hintStyle: GoogleFonts.lato(
                            fontSize: 18,
                            color: AppTheme.textSecondary,
                          ),
                          filled: false,
                        ),
                        onChanged: (value) {
                          setState(() {}); // Update border color when text changes
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Gender Selection
                    Row(
                      children: ['Male', 'Female', 'Other'].map((gender) {
                        final isSelected = _selectedGender == gender;
                        return Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(
                              right: gender != 'Other' ? 12 : 0,
                            ),
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  _selectedGender = gender;
                                });
                              },
                              child: Container(
                                height: 48,
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppTheme.primaryColor
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSelected
                                        ? AppTheme.primaryColor
                                        : const Color(0xFFD0D0D0),
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    gender,
                                    style: GoogleFonts.lato(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                      color: isSelected
                                          ? Colors.white
                                          : const Color(0xFF333333),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    SizedBox(height: screenHeight * 0.1), // Spacer for button
                  ],
                ),
              ),
            ),

            // Continue Button - Fixed at bottom
            Padding(
              padding: EdgeInsets.all(padding),
              child: PrimaryButton(
                text: 'Continue',
                onPressed:
                    _nameController.text.isNotEmpty && _selectedGender != null
                        ? _handleContinue
                        : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
