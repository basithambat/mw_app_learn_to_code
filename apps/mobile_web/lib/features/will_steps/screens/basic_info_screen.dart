import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/routes/app_routes.dart';
import '../services/will_service.dart';

class BasicInfoScreen extends StatefulWidget {
  final String? willId;

  const BasicInfoScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<BasicInfoScreen> createState() => _BasicInfoScreenState();
}

class _BasicInfoScreenState extends State<BasicInfoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _willService = WillService();
  final _nameController = TextEditingController();
  DateTime? _dateOfBirth;
  String? _gender;
  String? _maritalStatus;
  String? _religion;
  bool _previousWillExists = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadWill();
  }

  Future<void> _loadWill() async {
    if (widget.willId == null) return;
    try {
      final will = await _willService.getWill(widget.willId!);
      if (will['profile'] != null) {
        final profile = will['profile'];
        setState(() {
          _nameController.text = profile['fullName'] ?? '';
          _gender = profile['gender'];
          _maritalStatus = profile['maritalStatus'];
          _religion = profile['religionLabel'];
          _previousWillExists = will['previousWillExists'] ?? false;
          if (profile['dateOfBirth'] != null) {
            _dateOfBirth = DateTime.parse(profile['dateOfBirth']);
          }
        });
      }
    } catch (e) {
      // Handle error
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await _willService.updateBasicInfo(widget.willId!, {
        'fullName': _nameController.text,
        'gender': _gender,
        'dateOfBirth': _dateOfBirth?.toIso8601String(),
        'maritalStatus': _maritalStatus,
        'religionLabel': _religion,
        'personalLaw': _getPersonalLaw(_religion),
        'previousWillExists': _previousWillExists,
      });

      if (mounted) {
        Navigator.pop(context);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  String _getPersonalLaw(String? religion) {
    if (religion == null) return 'UNKNOWN';
    final r = religion.toLowerCase();
    if (['hindu', 'jain', 'buddhist', 'sikh'].contains(r)) return 'HINDU';
    if (r == 'muslim') return 'MUSLIM';
    if (r == 'christian') return 'CHRISTIAN';
    return 'UNKNOWN';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Basic Information')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppTheme.spacingM),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name *'),
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            const SizedBox(height: AppTheme.spacingM),
            DropdownButtonFormField<String>(
              value: _gender,
              decoration: const InputDecoration(labelText: 'Gender *'),
              items: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
                  .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                  .toList(),
              onChanged: (value) => setState(() => _gender = value),
              validator: (value) => value == null ? 'Required' : null,
            ),
            const SizedBox(height: AppTheme.spacingM),
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
              child: InputDecorator(
                decoration: const InputDecoration(labelText: 'Date of Birth *'),
                child: Text(
                  _dateOfBirth != null
                      ? DateFormat('yyyy-MM-dd').format(_dateOfBirth!)
                      : 'Select date',
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacingM),
            DropdownButtonFormField<String>(
              value: _maritalStatus,
              decoration: const InputDecoration(labelText: 'Marital Status *'),
              items: ['MARRIED', 'SINGLE', 'DIVORCED', 'WIDOWED']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                  .toList(),
              onChanged: (value) => setState(() => _maritalStatus = value),
              validator: (value) => value == null ? 'Required' : null,
            ),
            const SizedBox(height: AppTheme.spacingM),
            DropdownButtonFormField<String>(
              value: _religion,
              decoration: const InputDecoration(labelText: 'Religion *'),
              items: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other']
                  .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                  .toList(),
              onChanged: (value) => setState(() => _religion = value),
              validator: (value) => value == null ? 'Required' : null,
            ),
            const SizedBox(height: AppTheme.spacingM),
            SwitchListTile(
              title: const Text('Have you made a will before?'),
              value: _previousWillExists,
              onChanged: (value) => setState(() => _previousWillExists = value),
            ),
            const SizedBox(height: AppTheme.spacingXL),
            PrimaryButton(
              text: 'Save & Continue',
              onPressed: _save,
              isLoading: _isLoading,
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }
}
