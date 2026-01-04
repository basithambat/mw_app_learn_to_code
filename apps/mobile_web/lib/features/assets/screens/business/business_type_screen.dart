import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import 'business_details_screen.dart';

class BusinessTypeScreen extends StatelessWidget {
  final String? willId;

  const BusinessTypeScreen({Key? key, this.willId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final types = [
      _BusinessType(name: 'Self-employed', description: 'Owned & operated by you', icon: Icons.person),
      _BusinessType(name: 'Partnership', description: 'Business with shared profits & responsibilities', icon: Icons.handshake),
      _BusinessType(name: 'Corporation', description: 'Fully independent business with stakeholders', icon: Icons.business_center),
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
          'Personal business',
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
                'Select your business type',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
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

  Widget _buildTypeCard(BuildContext context, _BusinessType type) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => BusinessDetailsScreen(
                willId: willId,
                businessType: type.name,
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

class _BusinessType {
  final String name;
  final String description;
  final IconData icon;

  _BusinessType({
    required this.name,
    required this.description,
    required this.icon,
  });
}
