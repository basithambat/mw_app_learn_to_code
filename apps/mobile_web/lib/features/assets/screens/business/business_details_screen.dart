import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../services/assets_service.dart';
import '../shared/transfer_to_modal.dart';

class BusinessDetailsScreen extends StatefulWidget {
  final String? willId;
  final String businessType;

  const BusinessDetailsScreen({
    Key? key,
    this.willId,
    required this.businessType,
  }) : super(key: key);

  @override
  State<BusinessDetailsScreen> createState() => _BusinessDetailsScreenState();
}

class _BusinessDetailsScreenState extends State<BusinessDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _locationController = TextEditingController();
  final _gstController = TextEditingController();
  final _assetsService = AssetsService();
  String? _monthlyTurnover;
  bool _isGstRegistered = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _locationController.dispose();
    _gstController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      if (widget.willId == null || widget.willId!.startsWith('demo-')) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) {
          Navigator.pop(context, true);
        }
        return;
      }

      await _assetsService.addAsset(widget.willId!, {
        'category': 'BUSINESS',
        'title': _nameController.text.trim(),
        'description': widget.businessType,
        'estimatedValue': _monthlyTurnover ?? '',
        'metadataJson': {
          'businessType': widget.businessType,
          'location': _locationController.text.trim(),
          'monthlyTurnover': _monthlyTurnover,
          'isGstRegistered': _isGstRegistered,
          'gstNumber': _isGstRegistered ? _gstController.text.trim() : null,
        },
      });

      if (mounted) {
        Navigator.pop(context, true);
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
          'Add details of your ${widget.businessType.toLowerCase()} business',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 18,
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
                _buildTextField(
                  controller: _nameController,
                  label: 'Name of Business',
                  hint: 'Enter business name',
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter business name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextField(
                  controller: _locationController,
                  label: 'Registered location (Optional)',
                  hint: 'Enter location',
                ),
                const SizedBox(height: 20),
                _buildDropdown(
                  label: 'Monthly turnover',
                  value: _monthlyTurnover,
                  items: [
                    'Less than ₹1 lakh',
                    '₹1 lakh - ₹5 lakhs',
                    '₹5 lakhs - ₹10 lakhs',
                    '₹10 lakhs - ₹25 lakhs',
                    'More than ₹25 lakhs',
                  ],
                  onChanged: (value) => setState(() => _monthlyTurnover = value),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'GST registered',
                        style: GoogleFonts.lato(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ),
                    Switch(
                      value: _isGstRegistered,
                      onChanged: (value) => setState(() => _isGstRegistered = value),
                      activeColor: AppTheme.primaryColor,
                    ),
                  ],
                ),
                if (_isGstRegistered) ...[
                  const SizedBox(height: 20),
                  _buildTextField(
                    controller: _gstController,
                    label: 'GST number',
                    hint: 'Enter GST number',
                    validator: _isGstRegistered
                        ? (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Please enter GST number';
                            }
                            return null;
                          }
                        : null,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'This makes business identification concrete',
                    style: GoogleFonts.lato(
                      fontSize: 12,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                InkWell(
                  onTap: () async {
                    final result = await showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (context) => TransferToModal(
                        willId: widget.willId,
                        allowMultiple: true,
                      ),
                    );
                    if (result != null) {
                      setState(() {
                        // Store result for saving
                      });
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
                        Expanded(
                          child: Text(
                            'Transfer to: Choose',
                            style: GoogleFonts.lato(
                              fontSize: 14,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, size: 16),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 40),
                PrimaryButton(
                  text: 'Add Business',
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
