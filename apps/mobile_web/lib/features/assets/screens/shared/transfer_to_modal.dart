import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../will_steps/services/people_service.dart';

class TransferToModal extends StatefulWidget {
  final String? willId;
  final String? title;
  final String? description;
  final bool allowMultiple;
  final List<String>? defaultSelectedIds;

  const TransferToModal({
    Key? key,
    this.willId,
    this.title,
    this.description,
    this.allowMultiple = true,
    this.defaultSelectedIds,
  }) : super(key: key);

  @override
  State<TransferToModal> createState() => _TransferToModalState();
}

class _TransferToModalState extends State<TransferToModal> {
  final _peopleService = PeopleService();
  List<dynamic> _people = [];
  Set<String> _selectedIds = {};

  @override
  void initState() {
    super.initState();
    _loadPeople();
  }

  Future<void> _loadPeople() async {
    if (widget.willId == null || widget.willId!.startsWith('demo-')) {
      setState(() {
        _people = [
          {'id': 'demo-1', 'fullName': 'Suhaana', 'relationship': 'SPOUSE'},
          {'id': 'demo-2', 'fullName': 'Avi', 'relationship': 'SON'},
          {'id': 'demo-3', 'fullName': 'Gouri', 'relationship': 'DAUGHTER'},
          {'id': 'demo-4', 'fullName': 'Mamta', 'relationship': 'MOTHER'},
        ];
        _selectedIds = widget.defaultSelectedIds?.toSet() ?? 
            (widget.allowMultiple ? _people.map((p) => p['id'].toString()).toSet() : {});
      });
      return;
    }

    try {
      final people = await _peopleService.getPeople(widget.willId!);
      setState(() {
        _people = people;
        _selectedIds = widget.defaultSelectedIds?.toSet() ?? 
            (widget.allowMultiple ? people.map((p) => p['id'].toString()).toSet() : {});
      });
    } catch (e) {
      setState(() {
        _people = [];
      });
    }
  }

  void _toggleSelection(String personId) {
    setState(() {
      if (widget.allowMultiple) {
        if (_selectedIds.contains(personId)) {
          _selectedIds.remove(personId);
        } else {
          _selectedIds.add(personId);
        }
      } else {
        _selectedIds = {personId};
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.title ?? 'Who gets to own this asset once you are no more';
    final description = widget.description ?? 
        'Usually your wife, children and your mother has share by law, unless you choose otherwise';

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Text(
            title,
            style: GoogleFonts.frankRuhlLibre(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: GoogleFonts.lato(
              fontSize: 14,
              color: AppTheme.textMuted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: _people.map((person) {
              final isSelected = _selectedIds.contains(person['id'].toString());
              return GestureDetector(
                onTap: () => _toggleSelection(person['id'].toString()),
                child: Column(
                  children: [
                    Stack(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppTheme.lightGray.withOpacity(0.3),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.person,
                            size: 32,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        if (isSelected)
                          Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              width: 20,
                              height: 20,
                              decoration: const BoxDecoration(
                                color: AppTheme.accentGreen,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.check,
                                size: 14,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      person['fullName'] ?? '',
                      style: GoogleFonts.lato(
                        fontSize: 12,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            text: 'Got It',
            onPressed: _selectedIds.isNotEmpty
                ? () {
                    final selectedNames = _people
                        .where((p) => _selectedIds.contains(p['id'].toString()))
                        .map((p) => p['fullName'])
                        .join(', ');
                    Navigator.pop(context, selectedNames.isEmpty ? 'All heirs & mother' : selectedNames);
                  }
                : null,
            backgroundColor: _selectedIds.isNotEmpty
                ? AppTheme.primaryColor
                : AppTheme.primaryColor.withOpacity(0.5),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }
}
