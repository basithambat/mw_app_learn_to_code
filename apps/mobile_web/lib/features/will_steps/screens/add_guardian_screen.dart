import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/people_service.dart';

class AddGuardianScreen extends StatefulWidget {
  final String? willId;
  final List<Map<String, dynamic>> children;
  final Map<String, dynamic>? existingGuardian;

  const AddGuardianScreen({
    Key? key,
    this.willId,
    required this.children,
    this.existingGuardian,
  }) : super(key: key);

  @override
  State<AddGuardianScreen> createState() => _AddGuardianScreenState();
}

class _AddGuardianScreenState extends State<AddGuardianScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _peopleService = PeopleService();
  final _imagePicker = ImagePicker();
  DateTime? _dateOfBirth;
  String? _relationship;
  Set<String> _selectedChildrenIds = {};
  String? _photoUrl;
  File? _photo;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.existingGuardian != null) {
      _nameController.text = widget.existingGuardian!['fullName'] ?? '';
      _relationship = widget.existingGuardian!['relationship'];
      _photoUrl = widget.existingGuardian!['photoUrl'];
      if (widget.existingGuardian!['dateOfBirth'] != null) {
        _dateOfBirth = DateTime.parse(widget.existingGuardian!['dateOfBirth']);
      }
      // Load assigned children
      if (widget.existingGuardian!['guardianFor'] != null) {
        _selectedChildrenIds = Set<String>.from(
          widget.existingGuardian!['guardianFor'] as List,
        );
      }
    } else {
      // By default, select all children
      _selectedChildrenIds = Set<String>.from(
        widget.children.map((c) => c['id'].toString()),
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    // TODO: Implement photo picker
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Photo picker coming soon')),
    );
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
    if (_selectedChildrenIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one child')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final data = {
        'fullName': _nameController.text,
        'dateOfBirth': DateFormat('yyyy-MM-dd').format(_dateOfBirth!),
        'relationship': _relationship,
        'guardianFor': _selectedChildrenIds.toList(),
        if (_photoUrl != null) 'photoUrl': _photoUrl,
      };

      if (widget.existingGuardian != null && widget.willId != null) {
        await _peopleService.updatePerson(
          widget.willId!,
          widget.existingGuardian!['id'],
          data,
        );
      } else if (widget.willId != null) {
        await _peopleService.assignGuardian(widget.willId!, data);
      }

      if (mounted) {
        Navigator.pop(context, {'saved': true});
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
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
                          'Add Guardian',
                          style: GoogleFonts.frankRuhlLibre(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
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
                      const SizedBox(height: 24),
                      // Relationship
                      DropdownButtonFormField<String>(
                        value: _relationship,
                        decoration: InputDecoration(
                          labelText: 'Relationship with you',
                          labelStyle: GoogleFonts.lato(
                            fontSize: 14,
                            color: AppTheme.textSecondary,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        items: [
                          'MOTHER',
                          'FATHER',
                          'BROTHER',
                          'SISTER',
                          'OTHER',
                        ].map((rel) {
                          return DropdownMenuItem(
                            value: rel,
                            child: Text(rel.replaceAll('_', ' ').toLowerCase().split(' ').map((s) => s[0].toUpperCase() + s.substring(1)).join(' ')),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() => _relationship = value);
                        },
                        validator: (value) =>
                            value == null ? 'Required' : null,
                      ),
                      const SizedBox(height: 32),
                      // Children selection
                      Text(
                        'Who will they be guardian for?',
                        style: GoogleFonts.lato(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ...widget.children.map((child) {
                        final childId = child['id'].toString();
                        final isSelected = _selectedChildrenIds.contains(childId);
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                if (isSelected) {
                                  _selectedChildrenIds.remove(childId);
                                } else {
                                  _selectedChildrenIds.add(childId);
                                }
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(16),
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
                                  // Child photo
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(20),
                                    child: child['photoUrl'] != null
                                        ? Image.network(
                                            child['photoUrl'],
                                            width: 40,
                                            height: 40,
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) =>
                                                _buildChildPlaceholder(),
                                          )
                                        : _buildChildPlaceholder(),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      child['fullName'] ?? 'Child',
                                      style: GoogleFonts.lato(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w500,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                  ),
                                  // Checkmark
                                  Container(
                                    width: 24,
                                    height: 24,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isSelected
                                          ? AppTheme.primaryColor
                                          : Colors.transparent,
                                      border: Border.all(
                                        color: isSelected
                                            ? AppTheme.primaryColor
                                            : const Color(0xFFD0D0D0),
                                        width: 2,
                                      ),
                                    ),
                                    child: isSelected
                                        ? const Icon(
                                            Icons.check,
                                            color: Colors.white,
                                            size: 16,
                                          )
                                        : null,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
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
                            _relationship != null &&
                            _selectedChildrenIds.isNotEmpty)
                        ? _save
                        : null,
                backgroundColor: (_nameController.text.isNotEmpty &&
                        _dateOfBirth != null &&
                        _relationship != null &&
                        _selectedChildrenIds.isNotEmpty)
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

  Widget _buildChildPlaceholder() {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: AppTheme.lightGray.withOpacity(0.78),
        shape: BoxShape.circle,
      ),
    );
  }
}
