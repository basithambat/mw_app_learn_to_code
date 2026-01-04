import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/secondary_button.dart';
import '../../../core/widgets/placeholder_image.dart';

/// Onboarding Assets Screen - Matches React OnboardingAssets component
/// Screen 6: Grid of asset cards with images and selection
class OnboardingAssetsScreen extends StatefulWidget {
  final String userName;
  final Function(List<String> selectedAssets)? onContinue;
  final VoidCallback? onBack;

  const OnboardingAssetsScreen({
    Key? key,
    required this.userName,
    this.onContinue,
    this.onBack,
  }) : super(key: key);

  @override
  State<OnboardingAssetsScreen> createState() => _OnboardingAssetsScreenState();
}

class _OnboardingAssetsScreenState extends State<OnboardingAssetsScreen> {
  final Set<String> _selectedAssets = {};

  static const List<Map<String, String>> assetCategories = [
    {'id': 'real-estate', 'label': 'Property/Land'},
    {'id': 'vehicle', 'label': 'Vehicle'},
    {'id': 'gadgets', 'label': 'Gadgets'},
    {'id': 'household', 'label': 'Household item'},
    {'id': 'ornaments', 'label': 'Ornaments'},
    {'id': 'bank-account', 'label': 'Bank account'},
    {'id': 'stocks', 'label': 'Stock/Volatile\nInvestments'},
    {'id': 'loans', 'label': 'Loans'},
  ];

  void _toggleAsset(String assetId) {
    setState(() {
      if (_selectedAssets.contains(assetId)) {
        _selectedAssets.remove(assetId);
      } else {
        _selectedAssets.add(assetId);
      }
    });
  }

  void _handleContinue() {
    widget.onContinue?.call(_selectedAssets.toList());
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final padding = screenWidth * 0.055;
    final cardWidth = (screenWidth - padding * 2 - 12) / 2; // 2 columns with gap
    final cardHeight = screenHeight * 0.22; // ~156px on 720px screen

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
                          'Almost done, ${widget.userName}!',
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
                  const SizedBox(height: 8),
                  // Progress Bar - Full width
                  Stack(
                    children: [
                      Container(
                        height: 0.5,
                        color: const Color(0xFF0D361E).withOpacity(0.2),
                      ),
                      Container(
                        height: 0.5,
                        width: double.infinity, // Full width
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
                    // Question
                    Text(
                      'What all do you own?',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        height: 1.33,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Subtitle
                    Text(
                      'Consider choosing options that are valuable and you seek proper ownership once you are gone',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        height: 1.43,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Asset Grid
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: assetCategories.map((asset) {
                        final isSelected = _selectedAssets.contains(asset['id']);
                        return GestureDetector(
                          onTap: () => _toggleAsset(asset['id']!),
                          child: Container(
                            width: cardWidth,
                            height: cardHeight,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected
                                    ? const Color(0xFF0E371F)
                                    : Colors.black.withOpacity(0.12),
                                width: isSelected ? 2 : 1,
                              ),
                            ),
                            child: Stack(
                              children: [
                                // Asset Image
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: PlaceholderImage(
                                    width: cardWidth,
                                    height: cardHeight,
                                    type: asset['id']!,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),

                                // Overlay
                                Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    gradient: isSelected
                                        ? LinearGradient(
                                            begin: Alignment.topCenter,
                                            end: Alignment.bottomCenter,
                                            colors: [
                                              const Color(0xFF116937).withOpacity(0.4),
                                              const Color(0xFF116937).withOpacity(0.4),
                                            ],
                                          )
                                        : LinearGradient(
                                            begin: Alignment.topCenter,
                                            end: Alignment.bottomCenter,
                                            colors: [
                                              Colors.transparent,
                                              Colors.black.withOpacity(0.5),
                                            ],
                                            stops: const [0.5, 1.0],
                                          ),
                                  ),
                                ),

                                // Label
                                Positioned(
                                  left: 16,
                                  bottom: 16,
                                  right: 16,
                                  child: Text(
                                    asset['label']!,
                                    style: GoogleFonts.lato(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      height: 1.33,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
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
                      text: 'Done',
                      onPressed: _selectedAssets.isNotEmpty ? _handleContinue : null,
                      backgroundColor: _selectedAssets.isNotEmpty
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
