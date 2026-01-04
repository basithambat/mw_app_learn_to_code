import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/people_service.dart';
import '../../auth/services/auth_service.dart';

class AddSpouseScreen extends StatefulWidget {
  final String? willId;
  final Map<String, dynamic>? existingSpouse;

  const AddSpouseScreen({
    Key? key,
    this.willId,
    this.existingSpouse,
  }) : super(key: key);

  @override
  State<AddSpouseScreen> createState() => _AddSpouseScreenState();
}

class _AddSpouseScreenState extends State<AddSpouseScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _peopleService = PeopleService();
  final _authService = AuthService();
  final _imagePicker = ImagePicker();
  DateTime? _dateOfBirth;
  String? _relationship; // 'HUSBAND' or 'WIFE'
  String? _photoUrl;
  File? _photo;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.existingSpouse != null) {
      _nameController.text = widget.existingSpouse!['fullName'] ?? '';
      _relationship = widget.existingSpouse!['relationship'];
      _photoUrl = widget.existingSpouse!['photoUrl'];
      if (widget.existingSpouse!['dateOfBirth'] != null) {
        _dateOfBirth = DateTime.parse(widget.existingSpouse!['dateOfBirth']);
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (image != null) {
        setState(() {
          _photo = File(image.path);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to pick photo: ${e.toString()}')),
      );
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dateOfBirth == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select date of birth')),
      );
      return;
    }
    if (_relationship == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select relationship')),
      );
      return;
    }

    // Check authentication before making request
    final isAuthenticated = await _authService.isAuthenticated();
    if (!isAuthenticated) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please login to save spouse information'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 3),
          ),
        );
      }
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Convert relationship to backend enum format
      String relationshipEnum = 'SPOUSE'; // Default to SPOUSE
      if (_relationship == 'HUSBAND' || _relationship == 'WIFE') {
        relationshipEnum = 'SPOUSE'; // Backend uses SPOUSE for both
      }
      
      final data = {
        'fullName': _nameController.text,
        'dateOfBirth': DateFormat('yyyy-MM-dd').format(_dateOfBirth!),
        'relationship': relationshipEnum,
        if (_photoUrl != null) 'photoUrl': _photoUrl,
      };
      
      print('📤 Saving spouse with data: $data');
      print('📤 WillId: ${widget.willId}');

      if (widget.existingSpouse != null && widget.willId != null) {
        await _peopleService.updatePerson(
          widget.willId!,
          widget.existingSpouse!['id'],
          data,
        );
      } else if (widget.willId != null) {
        await _peopleService.addPerson(widget.willId!, data);
      } else {
        // Demo mode - just return success
        if (mounted) {
          Navigator.pop(context, {'saved': true});
        }
        return;
      }

      if (mounted) {
        Navigator.pop(context, {'saved': true});
      }
    } catch (e) {
      // Log full error for debugging
      print('❌ Error saving spouse: $e');
      if (e.toString().contains('DioException')) {
        print('❌ DioException details: ${e.toString()}');
      }
      
      if (mounted) {
        String errorMessage = 'Failed to save spouse';
        
        // Better error message extraction
        if (e.toString().contains('DioException')) {
          // Check for ApiException with status code
          if (e.toString().contains('401') || e.toString().contains('Unauthorized')) {
            errorMessage = 'Unauthorized: Please login again to continue';
          } else if (e.toString().contains('403') || e.toString().contains('Forbidden')) {
            errorMessage = 'Access denied: You don\'t have permission to perform this action';
          } else if (e.toString().contains('404') || e.toString().contains('Not Found')) {
            errorMessage = 'Will not found. Please create a will first.';
          } else if (e.toString().contains('400') || e.toString().contains('Bad Request')) {
            // Extract validation error message
            final errorStr = e.toString();
            if (errorStr.contains('Only one spouse')) {
              errorMessage = 'Only one spouse can be added to a will';
            } else if (errorStr.contains('message:')) {
              final match = RegExp(r'message:\s*([^\n]+)').firstMatch(errorStr);
              if (match != null) {
                errorMessage = match.group(1) ?? errorMessage;
              }
            } else {
              errorMessage = 'Invalid data. Please check all fields.';
            }
          } else if (e.toString().contains('500') || e.toString().contains('Internal Server Error')) {
            errorMessage = 'Server error: Please try again later';
          } else {
            // Try to extract meaningful error from exception
            final errorStr = e.toString();
            if (errorStr.contains('message:')) {
              final match = RegExp(r'message:\s*([^\n]+)').firstMatch(errorStr);
              if (match != null) {
                errorMessage = match.group(1) ?? errorMessage;
              }
            }
          }
        } else {
          errorMessage = e.toString();
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
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
    final screenWidth = MediaQuery.of(context).size.width;
    final padding = screenWidth * 0.055;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: EdgeInsets.fromLTRB(padding, 12, padding, 0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Color(0xFF323232)),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Add Spouse',
                          style: GoogleFonts.frankRuhlLibre(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Includes married or engaged partner',
                          style: GoogleFonts.lato(
                            fontSize: 14,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Photo button
                  GestureDetector(
                    onTap: _pickPhoto,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppTheme.accentGreen.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppTheme.accentGreen.withOpacity(0.3),
                        ),
                      ),
                      child: _photoUrl != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                _photoUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    _buildPhotoPlaceholder(),
                              ),
                            )
                          : _buildPhotoPlaceholder(),
                    ),
                  ),
                ],
              ),
            ),

            // Form Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(padding),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 24),
                      // Full legal name
                      TextFormField(
                        controller: _nameController,
                        style: GoogleFonts.lato(
                          fontSize: 18,
                          color: AppTheme.textPrimary,
                        ),
                        decoration: InputDecoration(
                          labelText: 'Full legal name',
                          labelStyle: GoogleFonts.lato(
                            fontSize: 14,
                            color: AppTheme.textSecondary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: _nameController.text.isNotEmpty
                                  ? AppTheme.primaryColor
                                  : const Color(0xFFD0D0D0),
                              width: _nameController.text.isNotEmpty ? 2 : 1,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(
                              color: _nameController.text.isNotEmpty
                                  ? AppTheme.primaryColor
                                  : const Color(0xFFD0D0D0),
                              width: _nameController.text.isNotEmpty ? 2 : 1,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: AppTheme.primaryColor,
                              width: 2,
                            ),
                          ),
                        ),
                        validator: (value) =>
                            value?.isEmpty ?? true ? 'Required' : null,
                      ),
                      const SizedBox(height: 24),
                      // Date of birth
                      InkWell(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: _dateOfBirth ?? DateTime.now(),
                            firstDate: DateTime(1900),
                            lastDate: DateTime.now(),
                          );
                          if (date != null) {
                            setState(() => _dateOfBirth = date);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: _dateOfBirth != null
                                  ? AppTheme.primaryColor
                                  : const Color(0xFFD0D0D0),
                              width: _dateOfBirth != null ? 2 : 1,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  _dateOfBirth != null
                                      ? DateFormat('dd / MM / yyyy')
                                          .format(_dateOfBirth!)
                                      : 'Date of birth',
                                  style: GoogleFonts.lato(
                                    fontSize: 18,
                                    color: _dateOfBirth != null
                                        ? AppTheme.textPrimary
                                        : AppTheme.textSecondary,
                                  ),
                                ),
                              ),
                              Icon(
                                Icons.calendar_today,
                                color: AppTheme.textSecondary,
                                size: 20,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),
                      // Relationship section
                      Text(
                        'YOUR RELATIONSHIP',
                        style: GoogleFonts.lato(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textSecondary,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Relationship options
                      Row(
                        children: [
                          Expanded(
                            child: _buildRelationshipOption('HUSBAND', 'Husband'),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildRelationshipOption('WIFE', 'Wife'),
                          ),
                        ],
                      ),
                      SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                    ],
                  ),
                ),
              ),
            ),

            // Save Button
            Padding(
              padding: EdgeInsets.all(padding),
              child: PrimaryButton(
                text: 'Save',
                onPressed: _isLoading
                    ? null
                    : (_nameController.text.isNotEmpty &&
                            _dateOfBirth != null &&
                            _relationship != null)
                        ? _save
                        : null,
                backgroundColor: (_nameController.text.isNotEmpty &&
                        _dateOfBirth != null &&
                        _relationship != null)
                    ? AppTheme.primaryColor
                    : AppTheme.accentGreen.withOpacity(0.3),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoPlaceholder() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.add,
          color: AppTheme.accentGreen,
          size: 24,
        ),
        const SizedBox(height: 4),
        Text(
          'Photo',
          style: GoogleFonts.lato(
            fontSize: 12,
            color: AppTheme.accentGreen,
          ),
        ),
      ],
    );
  }

  Widget _buildRelationshipOption(String value, String label) {
    final isSelected = _relationship == value;
    return GestureDetector(
      onTap: () {
        setState(() => _relationship = value);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryColor
                : const Color(0xFFD0D0D0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                style: GoogleFonts.lato(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? AppTheme.primaryColor
                      : const Color(0xFFD0D0D0),
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
