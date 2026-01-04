import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import 'vehicle_details_screen.dart';

class VehicleConfirmScreen extends StatelessWidget {
  final String? willId;
  final String vehicleType;
  final String registrationNumber;

  const VehicleConfirmScreen({
    Key? key,
    this.willId,
    required this.vehicleType,
    required this.registrationNumber,
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
          'Did we get it right?',
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
              // Vehicle image placeholder
              Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  color: AppTheme.lightGray.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(AppTheme.radiusM),
                ),
                child: Icon(
                  Icons.directions_car,
                  size: 64,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'MARUTI SUZUKI Baleno Signa',
                style: GoogleFonts.lato(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              _buildDetailRow('Fuel type:', 'Petrol'),
              _buildDetailRow('Registered in:', '2019'),
              _buildDetailRow('Engine Number:', 'XXXX-98762'),
              const SizedBox(height: 40),
              PrimaryButton(
                text: 'Yes, It\'s my car',
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => VehicleDetailsScreen(
                        willId: willId,
                        vehicleType: vehicleType,
                        vehicleName: 'MARUTI SUZUKI Baleno Signa',
                        vehicleDetails: {
                          'fuelType': 'Petrol',
                          'year': '2019',
                          'engineNumber': 'XXXX-98762',
                        },
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () {
                  // Edit details
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppTheme.borderColor.withOpacity(0.5)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                  ),
                  minimumSize: const Size(double.infinity, 56),
                ),
                child: Text(
                  'No, Edit details',
                  style: GoogleFonts.lato(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Text(
            label,
            style: GoogleFonts.lato(
              fontSize: 14,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            value,
            style: GoogleFonts.lato(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
