import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../services/assets_service.dart';
import 'jewellery_list_screen.dart';
import 'jewellery_photo_capture_screen.dart';
import '../shared/transfer_to_modal.dart';

class JewelleryDetailsScreen extends StatefulWidget {
  final String? willId;
  final String jewelleryType;

  const JewelleryDetailsScreen({
    Key? key,
    this.willId,
    required this.jewelleryType,
  }) : super(key: key);

  @override
  State<JewelleryDetailsScreen> createState() => _JewelleryDetailsScreenState();
}

class _JewelleryDetailsScreenState extends State<JewelleryDetailsScreen> {
  final _assetsService = AssetsService();
  bool _isPhysical = true;
  String? _itemCount;
  String? _carat;
  final _gramsController = TextEditingController();
  String? _transferTo;
  bool _isLoading = false;

  @override
  void dispose() {
    _gramsController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_itemCount == null || _carat == null || _gramsController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    // For physical jewellery, navigate to photo capture
    if (_isPhysical) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => JewelleryPhotoCaptureScreen(
            willId: widget.willId,
            jewelleryType: widget.jewelleryType,
            itemCount: int.parse(_itemCount!),
            carat: _carat!,
            grams: _gramsController.text,
            transferTo: _transferTo,
          ),
        ),
      );
      return;
    }

    // For digital jewellery, save directly
    setState(() => _isLoading = true);

    try {
      if (widget.willId == null || widget.willId!.startsWith('demo-')) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => JewelleryListScreen(willId: widget.willId),
            ),
          );
        }
        return;
      }

      await _assetsService.addAsset(widget.willId!, {
        'category': 'JEWELLERY',
        'title': '${widget.jewelleryType} Jewellery',
        'description': '${_itemCount} items, ${_carat}, ${_gramsController.text} gms',
        'estimatedValue': 'Based on current market rate',
        'metadataJson': {
          'jewelleryType': widget.jewelleryType,
          'itemCount': _itemCount,
          'carat': _carat,
          'grams': _gramsController.text,
          'isPhysical': _isPhysical,
        },
        'transferToJson': _transferTo != null ? {'heirs': _transferTo} : null,
      });

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => JewelleryListScreen(willId: widget.willId),
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
          'Add details of your ${widget.jewelleryType.toLowerCase()} asset',
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
                'Today at ₹4,889.50/gms of 24k',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: _buildTab('Physical', _isPhysical, () {
                      setState(() => _isPhysical = true);
                    }),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTab('Digital', !_isPhysical, () {
                      setState(() => _isPhysical = false);
                    }),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              if (_isPhysical) ...[
                _buildDropdown('No. of items', _itemCount, ['1', '2', '3', '4', '5'], (v) => setState(() => _itemCount = v)),
                const SizedBox(height: 20),
                _buildDropdown('Carat', _carat, ['24k (99.5% purity)', '22k', '18k'], (v) => setState(() => _carat = v)),
                const SizedBox(height: 20),
                TextField(
                  controller: _gramsController,
                  decoration: InputDecoration(
                    labelText: 'Amount in gms',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusM),
                    ),
                  ),
                  keyboardType: TextInputType.number,
                ),
              ] else ...[
                Text(
                  'Refer to google pay/Phonepe gold purchase section for details',
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 20),
                _buildDropdown('Digital gold provider', null, ['Google Pay', 'PhonePe', 'Paytm'], (v) {}),
                const SizedBox(height: 20),
                TextField(
                  controller: _gramsController,
                  decoration: InputDecoration(
                    labelText: 'Amount in gms',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusM),
                    ),
                  ),
                  keyboardType: TextInputType.number,
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
                      _transferTo = result.toString();
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
                          'Transfer to: ${_transferTo ?? 'Choose'}',
                          style: GoogleFonts.lato(
                            fontSize: 14,
                            color: AppTheme.textPrimary,
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
                text: _isPhysical ? 'Next' : 'Add Gold',
                onPressed: _isLoading ? null : _save,
                isLoading: _isLoading,
              ),
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

  Widget _buildDropdown(String label, String? value, List<String> items, ValueChanged<String?> onChanged) {
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
          items: items.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
          onChanged: onChanged,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusM),
            ),
          ),
        ),
      ],
    );
  }
}
