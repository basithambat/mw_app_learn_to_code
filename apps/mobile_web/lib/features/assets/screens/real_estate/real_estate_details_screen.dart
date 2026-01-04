import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../services/assets_service.dart';
import 'real_estate_inheritance_modal.dart';
import 'real_estate_list_screen.dart';

class RealEstateDetailsScreen extends StatefulWidget {
  final String? willId;
  final String location;

  const RealEstateDetailsScreen({
    Key? key,
    this.willId,
    required this.location,
  }) : super(key: key);

  @override
  State<RealEstateDetailsScreen> createState() => _RealEstateDetailsScreenState();
}

class _RealEstateDetailsScreenState extends State<RealEstateDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressController = TextEditingController();
  final _assetsService = AssetsService();
  String? _estateType;
  String? _estimatedValue;
  bool _isOnLoan = false;
  String? _transferTo;
  bool _isLoading = false;

  final List<String> _estateTypes = [
    'Flat in Apartment',
    'Independent House',
    'Plot',
    'Commercial Property',
    'Other',
  ];

  final List<String> _valueRanges = [
    'Less than ₹10 lakhs',
    '₹10 lakhs - ₹25 lakhs',
    '₹25 lakhs - ₹50 lakhs',
    '₹50 lakhs - ₹1 Crore',
    '₹1 Crore - ₹2 Crores',
    'More than ₹2 Crores',
  ];

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_estateType == null || _estimatedValue == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
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
              builder: (context) => RealEstateListScreen(willId: widget.willId),
            ),
          );
        }
        return;
      }

      await _assetsService.addAsset(widget.willId!, {
        'category': 'REAL_ESTATE',
        'title': _estateType!,
        'description': _addressController.text.trim(),
        'estimatedValue': _estimatedValue!,
        'metadataJson': {
          'location': widget.location,
          'isOnLoan': _isOnLoan,
        },
        'transferToJson': _transferTo != null ? {'heirs': _transferTo} : null,
      });

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => RealEstateListScreen(willId: widget.willId),
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
      builder: (context) => RealEstateInheritanceModal(
        willId: widget.willId,
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
          'Details of the estate',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Make sure the details matches with the address proof available. List of accepted proofs.',
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 24),
                _buildTextField(
                  controller: _addressController,
                  label: 'Complete address (As per proof)',
                  hint: 'Enter complete address',
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Text(
                      'For ${widget.location}',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        'Change',
                        style: GoogleFonts.lato(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.accentGreen,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                _buildDropdown(
                  label: 'Estate type',
                  value: _estateType,
                  items: _estateTypes,
                  onChanged: (value) => setState(() => _estateType = value),
                ),
                const SizedBox(height: 20),
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
                        'House on loan',
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
                                _transferTo ?? 'All heirs & mother',
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
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    String? Function(String?)? validator,
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
        TextFormField(
          controller: controller,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
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
            hintText: 'Select',
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
