import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../will_steps/services/people_service.dart';

class VehicleNomineeModal extends StatefulWidget {
  final String? willId;
  final String vehicleName;

  const VehicleNomineeModal({
    Key? key,
    this.willId,
    required this.vehicleName,
  }) : super(key: key);

  @override
  State<VehicleNomineeModal> createState() => _VehicleNomineeModalState();
}

class _VehicleNomineeModalState extends State<VehicleNomineeModal> {
  final _peopleService = PeopleService();
  List<dynamic> _people = [];
  String? _selectedId;

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
          {'id': 'demo-2', 'fullName': 'Mamta', 'relationship': 'MOTHER'},
          {'id': 'demo-3', 'fullName': 'Gouri', 'relationship': 'DAUGHTER'},
        ];
      });
      return;
    }

    try {
      final people = await _peopleService.getPeople(widget.willId!);
      setState(() {
        _people = people;
      });
    } catch (e) {
      setState(() {
        _people = [];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
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
            'Who gets to own ${widget.vehicleName.split(' ').last} once you are no more',
            style: GoogleFonts.frankRuhlLibre(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Wife or your mother is the eligible owner for your vehicles as all your children are minor',
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
              final isSelected = _selectedId == person['id'].toString();
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedId = person['id'].toString();
                  });
                },
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
            text: 'Finish',
            onPressed: _selectedId != null
                ? () {
                    final selectedPerson = _people.firstWhere(
                      (p) => p['id'].toString() == _selectedId,
                    );
                    Navigator.pop(context, selectedPerson['fullName']);
                  }
                : null,
            backgroundColor: _selectedId != null
                ? AppTheme.primaryColor
                : AppTheme.primaryColor.withOpacity(0.5),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }
}
