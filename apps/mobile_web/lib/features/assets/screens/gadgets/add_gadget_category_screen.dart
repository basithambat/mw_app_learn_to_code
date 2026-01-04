import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import 'add_gadget_photos_screen.dart';

class AddGadgetCategoryScreen extends StatelessWidget {
  final String? willId;

  const AddGadgetCategoryScreen({Key? key, this.willId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final categories = [
      _GadgetCategory(name: 'Mobile', description: 'Smartphones, Tablets', icon: Icons.smartphone),
      _GadgetCategory(name: 'Computers', description: 'Laptops or PC', icon: Icons.laptop),
      _GadgetCategory(name: 'Wearables', description: 'Smartwatch, earphones', icon: Icons.watch),
      _GadgetCategory(name: 'Stereo', description: 'Portable speakers, Home theatre', icon: Icons.speaker),
      _GadgetCategory(name: 'Smart devices', description: 'Alexa, Google home', icon: Icons.smart_toy),
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
          'Add a gadget',
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
                'Choose your category',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Consider adding those only that owns significant value and you want someone specific to own them',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 24),
              ...categories.map((category) => _buildCategoryCard(context, category)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryCard(BuildContext context, _GadgetCategory category) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => AddGadgetPhotosScreen(
                willId: willId,
                category: category.name,
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
                  category.icon,
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
                      category.name,
                      style: GoogleFonts.lato(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      category.description,
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

class _GadgetCategory {
  final String name;
  final String description;
  final IconData icon;

  _GadgetCategory({
    required this.name,
    required this.description,
    required this.icon,
  });
}
