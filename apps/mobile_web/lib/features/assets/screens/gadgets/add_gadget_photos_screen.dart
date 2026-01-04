import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import 'add_gadget_details_screen.dart';

class AddGadgetPhotosScreen extends StatefulWidget {
  final String? willId;
  final String category;

  const AddGadgetPhotosScreen({
    Key? key,
    this.willId,
    required this.category,
  }) : super(key: key);

  @override
  State<AddGadgetPhotosScreen> createState() => _AddGadgetPhotosScreenState();
}

class _AddGadgetPhotosScreenState extends State<AddGadgetPhotosScreen> {
  final _imagePicker = ImagePicker();
  File? _frontPhoto;
  File? _backPhoto;
  bool _isFrontDone = false;

  Future<void> _takePhoto(bool isFront) async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          if (isFront) {
            _frontPhoto = File(image.path);
            _isFrontDone = true;
          } else {
            _backPhoto = File(image.path);
          }
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to capture photo: ${e.toString()}')),
      );
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
          'Place device on a plain background & within the bounds',
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
            Expanded(
              child: Center(
                child: Container(
                  width: 300,
                  height: 300,
                  decoration: BoxDecoration(
                    color: AppTheme.lightGray.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                    border: Border.all(
                      color: AppTheme.borderColor.withOpacity(0.3),
                      style: BorderStyle.solid,
                    ),
                  ),
                  child: _isFrontDone && _backPhoto == null
                      ? _backPhoto != null
                          ? Image.file(_backPhoto!, fit: BoxFit.cover)
                          : const Center(
                              child: Icon(Icons.phone_android, size: 64),
                            )
                      : _frontPhoto != null
                          ? Image.file(_frontPhoto!, fit: BoxFit.cover)
                          : const Center(
                              child: Icon(Icons.phone_android, size: 64),
                            ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Text(
                    _isFrontDone
                        ? 'Take back side of the phone'
                        : 'Take front side of the phone',
                    style: GoogleFonts.lato(
                      fontSize: 14,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  GestureDetector(
                    onTap: () => _takePhoto(!_isFrontDone),
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: AppTheme.primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.camera_alt,
                        color: Colors.white,
                        size: 40,
                      ),
                    ),
                  ),
                  if (_frontPhoto != null && _backPhoto != null) ...[
                    const SizedBox(height: 20),
                    PrimaryButton(
                      text: 'Continue',
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => AddGadgetDetailsScreen(
                              willId: widget.willId,
                              category: widget.category,
                              frontPhoto: _frontPhoto!,
                              backPhoto: _backPhoto!,
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
