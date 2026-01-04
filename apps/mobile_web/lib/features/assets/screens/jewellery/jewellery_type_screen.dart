import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import 'jewellery_details_screen.dart';

class JewelleryTypeScreen extends StatelessWidget {
  final String? willId;

  const JewelleryTypeScreen({Key? key, this.willId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final types = [
      _JewelleryType(name: 'Gold', description: 'Jewellery or digital', icon: Icons.diamond),
      _JewelleryType(name: 'Silver', description: 'Jewellery or digital', icon: Icons.diamond),
      _JewelleryType(name: 'Platinum', description: 'Jewellery', icon: Icons.diamond),
      _JewelleryType(name: 'Diamond', description: 'Jewellery or digital', icon: Icons.diamond),
    ];

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
          'Add a jewellery',
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
                'Select your asset type',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'You can add multiple items together if they are part of a set',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 24),
              ...types.map((type) => _buildTypeCard(context, type)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeCard(BuildContext context, _JewelleryType type) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => JewelleryDetailsScreen(
                willId: willId,
                jewelleryType: type.name,
              ),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: AppTheme.borderColor.withOpacity(0.12)),
            borderRadius: BorderRadius.circular(AppTheme.radiusM),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.lightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  type.icon,
                  size: 28,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      type.name,
                      style: GoogleFonts.lato(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      type.description,
                      style: GoogleFonts.lato(
                        fontSize: 12,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: AppTheme.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _JewelleryType {
  final String name;
  final String description;
  final IconData icon;

  _JewelleryType({
    required this.name,
    required this.description,
    required this.icon,
  });
}
