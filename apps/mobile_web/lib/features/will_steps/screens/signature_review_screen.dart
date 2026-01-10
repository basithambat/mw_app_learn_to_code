import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/arrangements_service.dart';

class SignatureReviewScreen extends StatefulWidget {
  final String willId;
  final File signatureFile;

  const SignatureReviewScreen({
    Key? key,
    required this.willId,
    required this.signatureFile,
  }) : super(key: key);

  @override
  State<SignatureReviewScreen> createState() => _SignatureReviewScreenState();
}

class _SignatureReviewScreenState extends State<SignatureReviewScreen> {
  final _arrangementsService = ArrangementsService();
  bool _isLoading = false;

  Future<void> _uploadSignature() async {
    setState(() => _isLoading = true);

    try {
      if (!widget.willId.startsWith('demo-')) {
        await _arrangementsService.uploadSignature(widget.willId, widget.signatureFile);
      }
      
      if (mounted) {
        // Return 2 values: [shouldClose, success]
        // But simpler: just true means success/confirmed
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save signature: ${e.toString()}')),
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
          'Review Signature',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: AppTheme.borderColor.withOpacity(0.3),
                    style: BorderStyle.solid,
                  ),
                  borderRadius: BorderRadius.circular(AppTheme.radiusM),
                ),
                child: Center(
                  child: Image.file(
                    widget.signatureFile,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  PrimaryButton(
                    text: 'Confirm & Save',
                    onPressed: _isLoading ? null : _uploadSignature,
                    isLoading: _isLoading,
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: _isLoading ? null : () {
                      // Pop with false/null to indicate redo
                      Navigator.pop(context, false);
                    },
                    child: Text(
                      'Redo Signature',
                      style: GoogleFonts.lato(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
