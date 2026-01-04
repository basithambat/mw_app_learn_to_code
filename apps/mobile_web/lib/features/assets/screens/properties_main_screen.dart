import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/assets_service.dart';
import 'real_estate/real_estate_location_screen.dart';
import 'vehicles/add_vehicle_type_screen.dart';
import 'gadgets/add_gadget_category_screen.dart';
import 'jewellery/jewellery_type_screen.dart';
import 'liabilities/liabilities_auto_track_screen.dart';
import 'investments/investments_auto_track_screen.dart';
import 'business/business_type_screen.dart';
import 'household/household_items_screen.dart';

class PropertiesMainScreen extends StatefulWidget {
  final String? willId;

  const PropertiesMainScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<PropertiesMainScreen> createState() => _PropertiesMainScreenState();
}

class _PropertiesMainScreenState extends State<PropertiesMainScreen> {
  final _assetsService = AssetsService();
  Map<String, int> _assetCounts = {};
  bool _isLoading = true;
  bool _showInfoCards = true;

  @override
  void initState() {
    super.initState();
    _loadAssets();
  }

  Future<void> _loadAssets() async {
    if (widget.willId == null || widget.willId!.startsWith('demo-')) {
      setState(() {
        _assetCounts = {};
        _isLoading = false;
      });
      return;
    }

    try {
      final assets = await _assetsService.getAssets(widget.willId!);
      final counts = <String, int>{};
      for (var asset in assets) {
        final category = asset['category']?.toString() ?? 'OTHER';
        counts[category] = (counts[category] ?? 0) + 1;
      }
      setState(() {
        _assetCounts = counts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _assetCounts = {};
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final categories = [
      _CategoryItem(
        name: 'Real-estate',
        description: 'Purchased flat, property',
        icon: Icons.home,
        category: 'REAL_ESTATE',
      ),
      _CategoryItem(
        name: 'Personal business',
        description: 'Self-owned, partnered or corporation',
        icon: Icons.business,
        category: 'BUSINESS',
      ),
      _CategoryItem(
        name: 'Jewellery',
        description: 'Gold, ornaments or valuables',
        icon: Icons.diamond,
        category: 'JEWELLERY',
      ),
      _CategoryItem(
        name: 'Investments',
        description: 'Stocks, funds or bank accounts',
        icon: Icons.trending_up,
        category: 'INVESTMENT',
      ),
      _CategoryItem(
        name: 'Liabilities',
        description: 'Loans and credit card lending',
        icon: Icons.account_balance,
        category: 'LIABILITY',
      ),
      _CategoryItem(
        name: 'Vehicles',
        description: 'Car, bike, bicycles or heavy vehicle',
        icon: Icons.directions_car,
        category: 'VEHICLE',
      ),
      _CategoryItem(
        name: 'Gadgets',
        description: 'Laptop, phone, wearables, Camera or stereo',
        icon: Icons.phone_android,
        category: 'GADGET',
      ),
      _CategoryItem(
        name: 'Household items',
        description: 'Furniture, antiques or appliance',
        icon: Icons.chair,
        category: 'OTHER',
      ),
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
          'Properties & accounts',
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
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Add stuff that you own.',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      setState(() => _showInfoCards = !_showInfoCards);
                    },
                    child: Text(
                      'Why it\'s important ${_showInfoCards ? '✓' : ''}',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: AppTheme.accentGreen,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              if (_showInfoCards) ...[
                const SizedBox(height: 24),
                _buildInfoCard(
                  'Transfer ownership hassle free',
                  'No court visit and challenge from others',
                ),
                const SizedBox(height: 12),
                _buildInfoCard(
                  'Customise the share among heirs',
                  'Customise among heirs or add a new one',
                ),
                const SizedBox(height: 12),
                _buildInfoCard(
                  'Track your total wealth',
                  'Be aware and plan future to meet needs',
                ),
              ],
              const SizedBox(height: 32),
              ...categories.map((category) => _buildCategoryItem(category)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(String title, String description) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.lightGray.withOpacity(0.2),
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.info_outline,
            size: 24,
            color: AppTheme.textSecondary,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.lato(
                    fontSize: 14,
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
        ],
      ),
    );
  }

  Widget _buildCategoryItem(_CategoryItem category) {
    final count = _assetCounts[category.category] ?? 0;
    final hasItems = count > 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          if (category.category == 'REAL_ESTATE') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => RealEstateLocationScreen(willId: widget.willId),
              ),
            );
          } else if (category.category == 'VEHICLE') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => AddVehicleTypeScreen(willId: widget.willId),
              ),
            );
          } else if (category.category == 'GADGET') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => AddGadgetCategoryScreen(willId: widget.willId),
              ),
            );
          } else if (category.category == 'JEWELLERY') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => JewelleryTypeScreen(willId: widget.willId),
              ),
            );
          } else if (category.category == 'LIABILITY') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => LiabilitiesAutoTrackScreen(willId: widget.willId),
              ),
            );
          } else if (category.category == 'INVESTMENT') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => InvestmentsAutoTrackScreen(willId: widget.willId),
              ),
            );
          } else if (category.category == 'BUSINESS') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => BusinessTypeScreen(willId: widget.willId),
              ),
            );
          } else if (category.category == 'OTHER' && category.name == 'Household items') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => HouseholdItemsScreen(willId: widget.willId),
              ),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('${category.name} flow coming soon')),
            );
          }
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
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppTheme.lightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  category.icon,
                  size: 24,
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
                      hasItems
                          ? '$count ${category.name.toLowerCase()} added'
                          : category.description,
                      style: GoogleFonts.lato(
                        fontSize: 12,
                        color: AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                hasItems ? 'View' : 'Add',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.accentGreen,
                ),
              ),
              const SizedBox(width: 8),
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

class _CategoryItem {
  final String name;
  final String description;
  final IconData icon;
  final String category;

  _CategoryItem({
    required this.name,
    required this.description,
    required this.icon,
    required this.category,
  });
}
