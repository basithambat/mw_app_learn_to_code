import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/person_card.dart';
import '../services/arrangements_service.dart';
import '../services/people_service.dart';
import 'add_executor_screen.dart';
import 'duties_executor_modal.dart';

class AssignExecutorScreen extends StatefulWidget {
  final String? willId;

  const AssignExecutorScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<AssignExecutorScreen> createState() => _AssignExecutorScreenState();
}

class _AssignExecutorScreenState extends State<AssignExecutorScreen> {
  final _arrangementsService = ArrangementsService();
  final _peopleService = PeopleService();
  List<dynamic> _executors = [];
  List<dynamic> _people = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (widget.willId == null || widget.willId!.startsWith('demo-')) {
      // Demo mode
      setState(() {
        _executors = [];
        _people = [
          {'id': 'demo-1', 'fullName': 'Suhaana', 'relationship': 'SPOUSE', 'photoUrl': null},
          {'id': 'demo-2', 'fullName': 'Mamta', 'relationship': 'MOTHER', 'photoUrl': null},
        ];
        _isLoading = false;
      });
      return;
    }

    try {
      final [executors, people] = await Future.wait([
        _arrangementsService.getExecutors(widget.willId!),
        _peopleService.getPeople(widget.willId!),
      ]);
      setState(() {
        _executors = executors;
        _people = people;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _people = [];
        _executors = [];
        _isLoading = false;
      });
    }
  }

  Future<void> _assignExecutor(String personId) async {
    if (widget.willId == null || widget.willId!.startsWith('demo-')) {
      setState(() {
        _executors = [{'personId': personId, 'person': _people.firstWhere((p) => p['id'] == personId)}];
      });
      return;
    }

    try {
      await _arrangementsService.assignExecutor(widget.willId!, personId);
      await _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to assign executor: ${e.toString()}')),
        );
      }
    }
  }

  void _showDutiesModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DutiesExecutorModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final recommendedPeople = _people.where((p) => 
      ['SPOUSE', 'MOTHER', 'FATHER', 'BROTHER', 'SISTER'].contains(p['relationship'])
    ).toList();

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
          'Arrangements',
          style: GoogleFonts.lato(
            fontSize: 14,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress indicator
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              height: 4,
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.12),
                borderRadius: BorderRadius.circular(2),
              ),
              child: Stack(
                children: [
                  FractionallySizedBox(
                    widthFactor: 0.25, // 1/4 progress
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Assign an executor',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Executor is a responsible trusted person who will carry out your wishes in case something happens. ',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: AppTheme.textMuted,
                        height: 1.43,
                      ),
                    ),
                    GestureDetector(
                      onTap: _showDutiesModal,
                      child: Text(
                        'Requirement & responsibilities',
                        style: GoogleFonts.lato(
                          fontSize: 14,
                          color: AppTheme.textMuted,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'RECOMMENDED',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Recommended people
                    ...recommendedPeople.map((person) {
                      final isExecutor = _executors.any((e) => e['personId'] == person['id'] || e['person']?['id'] == person['id']);
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: PersonCard(
                          name: person['fullName'] ?? '',
                          relationship: person['relationship'] ?? '',
                          photoUrl: person['photoUrl'],
                          onEdit: isExecutor ? () {
                            // Already executor, can edit
                          } : null,
                          onAdd: isExecutor ? null : () async {
                            await _assignExecutor(person['id']);
                          },
                        ),
                      );
                    }),
                    const SizedBox(height: 12),
                    // Add someone else button
                    OutlinedButton(
                      onPressed: () async {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => AddExecutorScreen(willId: widget.willId),
                          ),
                        );
                        if (result == true) {
                          await _loadData();
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: AppTheme.primaryColor, width: 1.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppTheme.radiusM),
                        ),
                        minimumSize: const Size(double.infinity, 56),
                      ),
                      child: Text(
                        'Add someone else',
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
            ),
            // Continue button
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
              child: PrimaryButton(
                text: 'Continue',
                onPressed: _executors.isNotEmpty ? () {
                  Navigator.pop(context, true);
                } : null,
                backgroundColor: _executors.isNotEmpty ? AppTheme.primaryColor : AppTheme.primaryColor.withOpacity(0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
