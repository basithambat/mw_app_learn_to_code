import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import 'add_vehicle_registration_screen.dart';

class AddVehicleTypeScreen extends StatefulWidget {
  final String? willId;

  const AddVehicleTypeScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<AddVehicleTypeScreen> createState() => _AddVehicleTypeScreenState();
}

class _AddVehicleTypeScreenState extends State<AddVehicleTypeScreen> {
  bool _isPersonal = true;

  @override
  Widget build(BuildContext context) {
    final personalTypes = [
      _VehicleType(name: 'Bike', description: 'Gear or non-gear', icon: Icons.two_wheeler),
      _VehicleType(name: 'Car', description: 'Hatchback, SUV, Sedan', icon: Icons.directions_car),
      _VehicleType(name: '3 Wheeler', description: 'Auto', icon: Icons.airport_shuttle),
      _VehicleType(name: 'Heavy 4-wheeler', description: 'Tempo, Van, Truck', icon: Icons.local_shipping),
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
          'Add a vehicle',
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
                'What you own?',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'You can add other vehicles after adding one',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 24),
              // Tabs
              Row(
                children: [
                  Expanded(
                    child: _buildTab('Personal', _isPersonal, () {
                      setState(() => _isPersonal = true);
                    }),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTab('Commercial', !_isPersonal, () {
                      setState(() => _isPersonal = false);
                    }),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              ...personalTypes.map((type) => _buildVehicleTypeCard(type)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTab(String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryColor : Colors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusM),
          border: Border.all(
            color: isSelected ? AppTheme.primaryColor : AppTheme.borderColor.withOpacity(0.12),
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: GoogleFonts.lato(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : AppTheme.textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildVehicleTypeCard(_VehicleType type) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => AddVehicleRegistrationScreen(
                willId: widget.willId,
                vehicleType: type.name,
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

class _VehicleType {
  final String name;
  final String description;
  final IconData icon;

  _VehicleType({
    required this.name,
    required this.description,
    required this.icon,
  });
}
