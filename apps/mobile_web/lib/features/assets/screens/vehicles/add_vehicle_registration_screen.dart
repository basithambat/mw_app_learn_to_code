import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import 'vehicle_confirm_screen.dart';

class AddVehicleRegistrationScreen extends StatefulWidget {
  final String? willId;
  final String vehicleType;

  const AddVehicleRegistrationScreen({
    Key? key,
    this.willId,
    required this.vehicleType,
  }) : super(key: key);

  @override
  State<AddVehicleRegistrationScreen> createState() => _AddVehicleRegistrationScreenState();
}

class _AddVehicleRegistrationScreenState extends State<AddVehicleRegistrationScreen> {
  final _registrationController = TextEditingController();

  @override
  void dispose() {
    _registrationController.dispose();
    super.dispose();
  }

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
          'Add Vehicle',
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
                'Enter your vehicle registration number',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We will fetch the details from govt. vehicle registry',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _registrationController,
                decoration: InputDecoration(
                  labelText: 'Vehicle registration number',
                  hintText: 'KA 01 AC 3872',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                    borderSide: BorderSide(color: AppTheme.borderColor.withOpacity(0.12)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                    borderSide: BorderSide(color: AppTheme.borderColor.withOpacity(0.12)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                    borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                  ),
                ),
                onChanged: (value) => setState(() {}),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  // Manual entry option
                },
                child: Text(
                  'I don\'t remember registration number',
                  style: GoogleFonts.lato(
                    fontSize: 14,
                    color: AppTheme.accentGreen,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              PrimaryButton(
                text: 'Find vehicle details',
                onPressed: _registrationController.text.isNotEmpty
                    ? () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => VehicleConfirmScreen(
                              willId: widget.willId,
                              vehicleType: widget.vehicleType,
                              registrationNumber: _registrationController.text,
                            ),
                          ),
                        );
                      }
                    : null,
                backgroundColor: _registrationController.text.isNotEmpty
                    ? AppTheme.primaryColor
                    : AppTheme.primaryColor.withOpacity(0.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
