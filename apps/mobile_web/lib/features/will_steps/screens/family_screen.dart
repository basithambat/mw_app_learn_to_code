import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/bottom_sheet_modal.dart';
import '../services/people_service.dart';
import '../../../core/utils/api_client.dart';

class FamilyScreen extends StatefulWidget {
  final String? willId;

  const FamilyScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<FamilyScreen> createState() => _FamilyScreenState();
}

class _FamilyScreenState extends State<FamilyScreen> {
  final _peopleService = PeopleService();
  List<dynamic> _people = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPeople();
  }

  Future<void> _loadPeople() async {
    if (widget.willId == null) {
      setState(() => _isLoading = false);
      return;
    }
    try {
      final people = await _peopleService.getPeople(widget.willId!);
      setState(() {
        _people = people;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showAddPersonDialog() {
    showDialog(
      context: context,
      builder: (context) => _AddPersonDialog(
        willId: widget.willId!,
        onSaved: _loadPeople,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Family & Inheritance')),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacingM),
        children: [
          Text(
            'Family Members',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacingM),
          ..._people.map((person) => Card(
                child: ListTile(
                  title: Text(person['fullName'] ?? ''),
                  subtitle: Text(person['relationship'] ?? ''),
                  trailing: IconButton(
                    icon: const Icon(Icons.edit),
                    onPressed: () {
                      // Edit person
                    },
                  ),
                ),
              )),
          const SizedBox(height: AppTheme.spacingM),
          PrimaryButton(
            text: 'Add Family Member',
            onPressed: _showAddPersonDialog,
          ),
        ],
      ),
    );
  }
}

class _AddPersonDialog extends StatefulWidget {
  final String willId;
  final VoidCallback onSaved;

  const _AddPersonDialog({required this.willId, required this.onSaved});

  @override
  State<_AddPersonDialog> createState() => __AddPersonDialogState();
}

class __AddPersonDialogState extends State<_AddPersonDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  String? _relationship;
  final _peopleService = PeopleService();

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    try {
      await _peopleService.addPerson(widget.willId, {
        'fullName': _nameController.text,
        'relationship': _relationship,
      });
      widget.onSaved();
      if (mounted) Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Family Member'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name'),
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            DropdownButtonFormField<String>(
              value: _relationship,
              decoration: const InputDecoration(labelText: 'Relationship'),
              items: ['SPOUSE', 'SON', 'DAUGHTER', 'MOTHER', 'FATHER', 'OTHER']
                  .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                  .toList(),
              onChanged: (value) => setState(() => _relationship = value),
              validator: (value) => value == null ? 'Required' : null,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: _save,
          child: const Text('Add'),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }
}
