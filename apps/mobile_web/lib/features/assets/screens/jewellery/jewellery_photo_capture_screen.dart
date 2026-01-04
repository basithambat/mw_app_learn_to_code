import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import 'jewellery_list_screen.dart';
import '../../services/assets_service.dart';

class JewelleryPhotoCaptureScreen extends StatefulWidget {
  final String? willId;
  final String jewelleryType;
  final int itemCount;
  final String carat;
  final String grams;
  final String? transferTo;

  const JewelleryPhotoCaptureScreen({
    Key? key,
    this.willId,
    required this.jewelleryType,
    required this.itemCount,
    required this.carat,
    required this.grams,
    this.transferTo,
  }) : super(key: key);

  @override
  State<JewelleryPhotoCaptureScreen> createState() => _JewelleryPhotoCaptureScreenState();
}

class _JewelleryPhotoCaptureScreenState extends State<JewelleryPhotoCaptureScreen> {
  final _imagePicker = ImagePicker();
  final _assetsService = AssetsService();
  List<File?> _photos = [];
  int _currentItemIndex = 0;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _photos = List.filled(widget.itemCount, null);
  }

  Future<void> _takePhoto() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _photos[_currentItemIndex] = File(image.path);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to capture photo: ${e.toString()}')),
      );
    }
  }

  Future<void> _save() async {
    if (_photos.any((photo) => photo == null)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please capture photos for all items')),
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
              builder: (context) => JewelleryListScreen(willId: widget.willId),
            ),
          );
        }
        return;
      }

      await _assetsService.addAsset(widget.willId!, {
        'category': 'JEWELLERY',
        'title': '${widget.jewelleryType} Jewellery',
        'description': '${widget.itemCount} items, ${widget.carat}, ${widget.grams} gms',
        'estimatedValue': 'Based on current market rate',
        'metadataJson': {
          'jewelleryType': widget.jewelleryType,
          'itemCount': widget.itemCount.toString(),
          'carat': widget.carat,
          'grams': widget.grams,
          'isPhysical': true,
          'photos': _photos.map((p) => p?.path).toList(),
        },
        'transferToJson': widget.transferTo != null ? {'heirs': widget.transferTo} : null,
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

  void _nextItem() {
    if (_currentItemIndex < widget.itemCount - 1) {
      setState(() {
        _currentItemIndex++;
      });
    }
  }

  void _previousItem() {
    if (_currentItemIndex > 0) {
      setState(() {
        _currentItemIndex--;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasPhoto = _photos[_currentItemIndex] != null;
    final allPhotosTaken = _photos.every((photo) => photo != null);

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
          'Keep the jewelery on a plain background and within bounds',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress indicator
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                children: [
                  Text(
                    'Item ${_currentItemIndex + 1} of ${widget.itemCount}',
                    style: GoogleFonts.lato(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: LinearProgressIndicator(
                      value: (_currentItemIndex + 1) / widget.itemCount,
                      backgroundColor: AppTheme.lightGray.withOpacity(0.3),
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                    ),
                  ),
                ],
              ),
            ),
            // Camera preview area
            Expanded(
              child: Center(
                child: Container(
                  width: 300,
                  height: 300,
                  margin: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                    border: Border.all(
                      color: Colors.white,
                      width: 2,
                      style: BorderStyle.solid,
                    ),
                  ),
                  child: hasPhoto
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(AppTheme.radiusM),
                          child: Image.file(
                            _photos[_currentItemIndex]!,
                            fit: BoxFit.cover,
                          ),
                        )
                      : Center(
                          child: Icon(
                            Icons.diamond,
                            size: 64,
                            color: Colors.white.withOpacity(0.5),
                          ),
                        ),
                ),
              ),
            ),
            // Instructions
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Take one photo of each ${widget.jewelleryType.toLowerCase()} items',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 20),
            // Navigation buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  if (_currentItemIndex > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _previousItem,
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: AppTheme.borderColor.withOpacity(0.5)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusM),
                          ),
                          minimumSize: const Size(0, 56),
                        ),
                        child: Text(
                          'Previous',
                          style: GoogleFonts.lato(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  if (_currentItemIndex > 0) const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: GestureDetector(
                      onTap: hasPhoto ? null : _takePhoto,
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: hasPhoto ? AppTheme.accentGreen : AppTheme.primaryColor,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          hasPhoto ? Icons.check : Icons.camera_alt,
                          color: Colors.white,
                          size: 40,
                        ),
                      ),
                    ),
                  ),
                  if (_currentItemIndex < widget.itemCount - 1) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: PrimaryButton(
                        text: 'Next',
                        onPressed: hasPhoto ? _nextItem : null,
                        backgroundColor: hasPhoto
                            ? AppTheme.primaryColor
                            : AppTheme.primaryColor.withOpacity(0.5),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            // Save button (when all photos taken)
            if (allPhotosTaken) ...[
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: PrimaryButton(
                  text: 'Save & Continue',
                  onPressed: _isLoading ? null : _save,
                  isLoading: _isLoading,
                ),
              ),
            ],
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
