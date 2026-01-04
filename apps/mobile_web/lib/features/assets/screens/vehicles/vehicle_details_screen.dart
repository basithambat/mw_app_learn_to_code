import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../services/assets_service.dart';
import 'vehicle_nominee_modal.dart';
import 'vehicle_list_screen.dart';

class VehicleDetailsScreen extends StatefulWidget {
  final String? willId;
  final String vehicleType;
  final String vehicleName;
  final Map<String, dynamic> vehicleDetails;

  const VehicleDetailsScreen({
    Key? key,
    this.willId,
    required this.vehicleType,
    required this.vehicleName,
    required this.vehicleDetails,
  }) : super(key: key);

  @override
  State<VehicleDetailsScreen> createState() => _VehicleDetailsScreenState();
}

class _VehicleDetailsScreenState extends State<VehicleDetailsScreen> {
  final _assetsService = AssetsService();
  String? _estimatedValue;
  bool _isOnLoan = false;
  bool _isInsured = false;
  String? _transferTo;
  bool _isLoading = false;

  final List<String> _valueRanges = [
    'Less than ₹1 lakh',
    '₹1 lakh - ₹2 lakhs',
    '₹2 lakhs - ₹3 lakhs',
    '₹3 lakhs - ₹4 lakhs',
    '₹4 lakhs - ₹5 lakhs',
    'More than ₹5 lakhs',
  ];

  Future<void> _save() async {
    if (_estimatedValue == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select estimated value')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      if (widget.willId == null || widget.willId!.startsWith('demo-')) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => VehicleListScreen(willId: widget.willId),
            ),
          );
        }
        return;
      }

      await _assetsService.addAsset(widget.willId!, {
        'category': 'VEHICLE',
        'title': widget.vehicleName,
        'description': '${widget.vehicleType} - ${widget.vehicleDetails['fuelType']} - ${widget.vehicleDetails['year']}',
        'estimatedValue': _estimatedValue!,
        'metadataJson': {
          'vehicleType': widget.vehicleType,
          'fuelType': widget.vehicleDetails['fuelType'],
          'year': widget.vehicleDetails['year'],
          'engineNumber': widget.vehicleDetails['engineNumber'],
          'isOnLoan': _isOnLoan,
          'isInsured': _isInsured,
        },
        'transferToJson': _transferTo != null ? {'heirs': _transferTo} : null,
      });

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => VehicleListScreen(willId: widget.willId),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _selectTransferTo() async {
    final result = await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => VehicleNomineeModal(
        willId: widget.willId,
        vehicleName: widget.vehicleName,
      ),
    );

    if (result != null) {
      setState(() {
        _transferTo = result.toString();
      });
    }
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
          'Add details for ${widget.vehicleName.split(' ').last}',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 18,
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
                '${widget.vehicleName.split(' ').last} - ${widget.vehicleDetails['fuelType']} - ${widget.vehicleDetails['year']}',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 24),
              _buildDropdown(
                label: 'Estimated value',
                value: _estimatedValue,
                items: _valueRanges,
                onChanged: (value) => setState(() => _estimatedValue = value),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Car on loan',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ),
                  Switch(
                    value: _isOnLoan,
                    onChanged: (value) => setState(() => _isOnLoan = value),
                    activeColor: AppTheme.primaryColor,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Car is insured',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ),
                  Switch(
                    value: _isInsured,
                    onChanged: (value) => setState(() => _isInsured = value),
                    activeColor: AppTheme.primaryColor,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              InkWell(
                onTap: _selectTransferTo,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.borderColor.withOpacity(0.12)),
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Transfer to',
                              style: GoogleFonts.lato(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _transferTo ?? 'Choose',
                              style: GoogleFonts.lato(
                                fontSize: 14,
                                color: _transferTo != null
                                    ? AppTheme.textPrimary
                                    : AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, size: 16),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 40),
              PrimaryButton(
                text: 'Next',
                onPressed: _isLoading ? null : _save,
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.lato(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          items: items.map((item) {
            return DropdownMenuItem(
              value: item,
              child: Text(item),
            );
          }).toList(),
          onChanged: onChanged,
          decoration: InputDecoration(
            hintText: 'Select range',
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
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          ),
        ),
      ],
    );
  }
}
