import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../services/assets_service.dart';
import 'gadget_list_screen.dart';
import '../../../will_steps/services/people_service.dart';
import '../shared/transfer_to_modal.dart';

class AddGadgetDetailsScreen extends StatefulWidget {
  final String? willId;
  final String category;
  final File frontPhoto;
  final File backPhoto;

  const AddGadgetDetailsScreen({
    Key? key,
    this.willId,
    required this.category,
    required this.frontPhoto,
    required this.backPhoto,
  }) : super(key: key);

  @override
  State<AddGadgetDetailsScreen> createState() => _AddGadgetDetailsScreenState();
}

class _AddGadgetDetailsScreenState extends State<AddGadgetDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _brandController = TextEditingController();
  final _modelController = TextEditingController();
  final _purchasePriceController = TextEditingController();
  final _assetsService = AssetsService();
  final _peopleService = PeopleService();
  String? _purchaseMonth;
  bool _onInstallments = false;
  String? _transferTo;
  bool _isLoading = false;

  final List<String> _months = [
    'January 2020',
    'February 2020',
    'March 2020',
    // Add more months
  ];

  @override
  void dispose() {
    _brandController.dispose();
    _modelController.dispose();
    _purchasePriceController.dispose();
    super.dispose();
  }

  Future<void> _selectTransferTo() async {
    final result = await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => TransferToModal(
        willId: widget.willId,
        allowMultiple: false,
      ),
    );
    if (result != null) {
      setState(() => _transferTo = result.toString());
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      if (widget.willId == null || widget.willId!.startsWith('demo-')) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => GadgetListScreen(willId: widget.willId),
            ),
          );
        }
        return;
      }

      await _assetsService.addAsset(widget.willId!, {
        'category': 'GADGET',
        'title': '${_brandController.text.trim()} ${_modelController.text.trim()}',
        'description': widget.category,
        'estimatedValue': _purchasePriceController.text.trim(),
        'metadataJson': {
          'brand': _brandController.text.trim(),
          'model': _modelController.text.trim(),
          'purchasePrice': _purchasePriceController.text.trim(),
          'purchaseMonth': _purchaseMonth,
          'onInstallments': _onInstallments,
        },
        'transferToJson': _transferTo != null ? {'heirs': _transferTo} : null,
      });

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => GadgetListScreen(willId: widget.willId),
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
          'Enter details of your ${widget.category.toLowerCase()}',
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
                  controller: _brandController,
                  label: 'Select brand',
                  hint: 'Select brand',
                ),
                const SizedBox(height: 20),
                _buildTextField(
                  controller: _modelController,
                  label: 'Modal & variant',
                  hint: 'Enter model',
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter model';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                _buildTextField(
                  controller: _purchasePriceController,
                  label: 'Purchased for',
                  hint: 'Enter price',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 20),
                _buildDropdown(
                  label: 'Month & year of purchase',
                  value: _purchaseMonth,
                  items: _months,
                  onChanged: (value) => setState(() => _purchaseMonth = value),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'On Installments',
                            style: GoogleFonts.lato(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Text(
                            'EMIs are yet to finish',
                            style: GoogleFonts.lato(
                              fontSize: 12,
                              color: AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: _onInstallments,
                      onChanged: (value) => setState(() => _onInstallments = value),
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
                  text: 'Add Phone',
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
    TextInputType? keyboardType,
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
          keyboardType: keyboardType,
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
