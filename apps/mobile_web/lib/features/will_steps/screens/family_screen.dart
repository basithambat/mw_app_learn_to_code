import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/person_card.dart';
import '../../../core/widgets/info_card.dart';
import '../../../core/widgets/section_title.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/routes/app_routes.dart';
import '../services/people_service.dart';
import 'add_child_screen.dart';
import 'add_guardian_screen.dart';
import 'understand_modal.dart';

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

  dynamic _getPersonByRelationship(String relationship) {
    try {
      return _people.firstWhere(
        (p) => p['relationship'] == relationship,
        orElse: () => null,
      );
    } catch (e) {
      return null;
    }
  }

  List<dynamic> _getChildren() {
    return _people.where((p) {
      final rel = p['relationship']?.toString().toUpperCase() ?? '';
      return rel == 'SON' || rel == 'DAUGHTER' || rel == 'CHILD';
    }).toList();
  }

  bool _canContinue() {
    return _getPersonByRelationship('SPOUSE') != null ||
        _getChildren().isNotEmpty ||
        _getPersonByRelationship('MOTHER') != null;
  }

  void _showChildrenCountModal() {
    int selectedCount = 1;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'How many children you have?',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Include blood-one, stepchildren and adopted. If any children is on the way, you can add them later.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: List.generate(6, (index) {
                  final count = index + 1;
                  final isSelected = selectedCount == count;
                  return GestureDetector(
                    onTap: () {
                      setModalState(() => selectedCount = count);
                    },
                    child: Container(
                      width: 50,
                      height: 50,
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
                      child: Center(
                        child: Text(
                          count.toString(),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected
                                ? AppTheme.primaryColor
                                : AppTheme.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 24),
              PrimaryButton(
                text: 'Continue',
                onPressed: () {
                  Navigator.pop(context);
                  _addChildren(selectedCount);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _addChildren(int count) async {
    final children = _getChildren();
    int currentChildNumber = children.length + 1;
    
    for (int i = 0; i < count; i++) {
      final result = await Navigator.pushNamed(
        context,
        AppRoutes.addChild,
        arguments: {
          'willId': widget.willId,
          'childNumber': currentChildNumber + i,
        },
      );
      if (result != null && (result as Map)['saved'] == true) {
        await _loadPeople();
      }
    }
    
    // Check if any children are under 18 and show guardian prompt
    final updatedChildren = _getChildren();
    final hasUnder18 = updatedChildren.any((child) {
      if (child['dateOfBirth'] == null) return false;
      final dob = DateTime.parse(child['dateOfBirth']);
      final age = DateTime.now().difference(dob).inDays ~/ 365;
      return age < 18;
    });
    
    if (hasUnder18 && mounted) {
      _showGuardianPromptModal(updatedChildren);
    }
  }

  void _showGuardianPromptModal(List<dynamic> children) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image placeholder (you can replace with actual image asset)
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                color: AppTheme.lightGray.withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.family_restroom,
                size: 80,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Add a guardian for your under 18 children',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'If you pass away before your children turn 18, your guardian will take care of them.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              text: 'Add Guardian',
              onPressed: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => AddGuardianScreen(
                      willId: widget.willId,
                      children: children.map((c) => c as Map<String, dynamic>).toList(),
                    ),
                  ),
                ).then((result) {
                  if (result != null && (result as Map)['saved'] == true) {
                    _loadPeople();
                  }
                });
              },
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Skip for now',
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleContinue() async {
    if (!_canContinue()) return;
    
    // Navigate to inheritance screen
    if (widget.willId != null) {
      final result = await Navigator.pushNamed(
        context,
        AppRoutes.inheritance,
        arguments: widget.willId,
      );
      
      // If inheritance is completed, mark family step as completed and return to dashboard
      if (result != null && (result as Map)['stepCompleted'] == 'stepInheritance') {
        if (mounted) {
          Navigator.pop(context, {'stepCompleted': 'stepFamily'});
        }
      }
    } else {
      // In demo mode, just mark as completed and return
      if (mounted) {
        Navigator.pop(context, {'stepCompleted': 'stepFamily'});
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final spouse = _getPersonByRelationship('SPOUSE');
    final children = _getChildren();
    final mother = _getPersonByRelationship('MOTHER');
    final hasSpouse = spouse != null;
    final hasChildren = children.isNotEmpty;
    final hasMother = mother != null;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Status Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 24,
            child: Container(
              color: Colors.black.withOpacity(0.05),
            ),
          ),
          // Decorative Element
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              width: 120,
              height: 120,
              color: AppTheme.primaryLight,
            ),
          ),
          // Back Button
          Positioned(
            left: 16,
            top: 40,
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: Color(0xFF323232)),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          // Title Section
          const SectionTitle(
            title: 'Family & Inheritance',
            description:
                'These are usually the ones who you want to own the assets once you are no more',
            padding: EdgeInsets.only(left: 20, top: 88, right: 20),
          ),
          // Spouse Card
          Positioned(
            left: 20,
            top: 200,
            width: 320,
            child: hasSpouse
                ? PersonCard(
                    name: spouse['fullName'],
                    relationship: 'Spouse',
                    photoUrl: spouse['photoUrl'],
                    onEdit: () async {
                      final result = await Navigator.pushNamed(
                        context,
                        AppRoutes.addSpouse,
                        arguments: {
                          'willId': widget.willId,
                          'existingSpouse': spouse,
                        },
                      );
                      if (result != null && (result as Map)['saved'] == true) {
                        _loadPeople();
                      }
                    },
                  )
                : PersonCard(
                    name: 'Spouse',
                    isEmpty: true,
                    height: 64,
                    onAdd: () async {
                      final result = await Navigator.pushNamed(
                        context,
                        AppRoutes.addSpouse,
                        arguments: {
                          'willId': widget.willId,
                        },
                      );
                      if (result != null && (result as Map)['saved'] == true) {
                        _loadPeople();
                      }
                    },
                  ),
          ),
          // Children Card
          Positioned(
            left: 20,
            top: 292,
            width: 320,
            child: hasChildren
                ? PersonCard(
                    name: 'Children',
                    relationship: '${children.length} ${children.length == 1 ? 'child' : 'children'}',
                    onEdit: () async {
                      // Show children list modal or navigate to children management
                      _showChildrenCountModal();
                    },
                  )
                : PersonCard(
                    name: 'Children',
                    isEmpty: true,
                    height: 64,
                    onAdd: () {
                      _showChildrenCountModal();
                    },
                  ),
          ),
          // Mother Card with explanation
          Positioned(
            left: 20,
            top: 371,
            width: 320,
            child: InfoCard(
              explanation:
                  'Mothers are suppose to have a share in son\'s property as per law',
              child: hasMother
                  ? PersonCard(
                      name: mother['fullName'],
                      relationship: 'Mother',
                      photoUrl: mother['photoUrl'],
                      onEdit: () {
                        // TODO: Navigate to edit mother
                      },
                    )
                  : PersonCard(
                      name: 'Mother',
                      isEmpty: true,
                      height: 64,
                      onAdd: () {
                        // TODO: Navigate to add mother
                      },
                    ),
            ),
          ),
          // Others Card with explanation
          Positioned(
            left: 20,
            top: 515,
            width: 320,
            child: InfoCard(
              explanation:
                  'Can be one who you want to have some share in your assets & properties',
              child: PersonCard(
                name: 'Others (Optional)',
                isEmpty: true,
                height: 64,
                onAdd: () {
                  // TODO: Navigate to add others
                },
              ),
            ),
          ),
          // Footer with link and button
          Positioned(
            left: 20,
            bottom: 80,
            width: 320,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (context) => UnderstandModal(),
                    );
                  },
                  child: Text(
                    'Understand what is counted for distribution here',
                    style: GoogleFonts.lato(
                      fontSize: 14,
                      color: AppTheme.primaryColor,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                PrimaryButton(
                  text: 'Decide who gets how much',
                  onPressed: _canContinue() ? () async {
                    final result = await Navigator.pushNamed(
                      context, 
                      AppRoutes.inheritance, 
                      arguments: widget.willId,
                    );
                    // If inheritance is completed, mark family step as completed and return
                    if (result != null && (result as Map)['stepCompleted'] == 'stepInheritance') {
                      if (mounted) {
                        Navigator.pop(context, {'stepCompleted': 'stepFamily'});
                      }
                    }
                  } : null,
                  width: 320,
                ),
              ],
            ),
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
