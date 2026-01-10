import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/inheritance_service.dart';
import '../services/people_service.dart';

class InheritanceSummaryScreen extends StatefulWidget {
  final String? willId;

  const InheritanceSummaryScreen({
    Key? key,
    this.willId,
  }) : super(key: key);

  @override
  State<InheritanceSummaryScreen> createState() => _InheritanceSummaryScreenState();
}

class _InheritanceSummaryScreenState extends State<InheritanceSummaryScreen> {
  final _inheritanceService = InheritanceService();
  final _peopleService = PeopleService();
  List<dynamic> _scenarios = [];
  List<dynamic> _people = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (widget.willId == null) {
      setState(() => _isLoading = false);
      return;
    }
    try {
      final [scenarios, people] = await Future.wait([
        _inheritanceService.getScenarios(widget.willId!),
        _peopleService.getPeople(widget.willId!),
      ]);
      setState(() {
        _scenarios = scenarios;
        _people = people;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Map<String, dynamic>? _getPersonById(String id) {
    try {
      return _people.firstWhere((p) => p['id'].toString() == id);
    } catch (e) {
      return null;
    }
  }

  Map<String, dynamic>? _getScenario(String type) {
    try {
      return _scenarios.firstWhere(
        (s) => s['type'] == type,
        orElse: () => null,
      );
    } catch (e) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final screenWidth = MediaQuery.of(context).size.width;
    final padding = screenWidth * 0.055;

    final spouseScenario = _getScenario('USER_DIES_FIRST');
    final childrenScenario = _getScenario('SPOUSE_DIES_FIRST');
    final noSurvivorsScenario = _getScenario('NO_ONE_SURVIVES');

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
                    child: Text(
                      'Inheritance summary',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    // Scenario 1: User dies first
                    _buildScenarioSection(
                      title: 'IF YOU DIE BEFORE YOUR SPOUSE',
                      scenario: spouseScenario,
                      onEdit: () {
                        // Navigate to spouse screen
                      },
                    ),
                    const SizedBox(height: 24),
                    // Scenario 2: Spouse dies first
                    _buildScenarioSection(
                      title: 'IF YOUR SPOUSE DIES BEFORE YOU',
                      scenario: childrenScenario,
                      onEdit: () {
                        // Navigate to children screen
                      },
                    ),
                    const SizedBox(height: 24),
                    // Scenario 3: No one survives
                    _buildScenarioSection(
                      title: 'IF NO ONE FROM YOUR FAMILY IS LIVING',
                      scenario: noSurvivorsScenario,
                      onEdit: () {
                        // Navigate to no survivors screen
                      },
                    ),
                    const SizedBox(height: 32),
                    // Faraid Distribution Info Card (Muslim Law)
                    _buildFaraidInfoCard(),
                  ],
                ),
              ),
            ),

            // Save Button
            Padding(
              padding: EdgeInsets.all(padding),
              child: PrimaryButton(
                text: 'Save details',
                onPressed: () {
                  Navigator.pop(context, {'stepCompleted': 'stepInheritance'});
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScenarioSection({
    required String title,
    required Map<String, dynamic>? scenario,
    required VoidCallback onEdit,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD0D0D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.lato(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),
              TextButton(
                onPressed: onEdit,
                child: Text(
                  'Edit',
                  style: GoogleFonts.lato(
                    fontSize: 14,
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (scenario != null && 
              scenario['allocationJson'] != null && 
              scenario['allocationJson']['allocations'] != null)
            ...(scenario['allocationJson']['allocations'] as List).map((dist) {
              final person = _getPersonById(dist['personId'].toString());
              if (person == null) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: person['photoUrl'] != null
                          ? Image.network(
                              person['photoUrl'],
                              width: 32,
                              height: 32,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  _buildPlaceholderPhoto(),
                            )
                          : _buildPlaceholderPhoto(),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${person['fullName']} gets ${dist['percentage']}%',
                            style: GoogleFonts.lato(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          if (scenario['type'] == 'USER_DIES_FIRST')
                            Text(
                              'Rest will be given to your children',
                              style: GoogleFonts.lato(
                                fontSize: 12,
                                color: AppTheme.textSecondary,
                              ),
                            )
                          else
                            Text(
                              'Of your estate',
                              style: GoogleFonts.lato(
                                fontSize: 12,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }).toList()
          else
            Text(
              'Not configured',
              style: GoogleFonts.lato(
                fontSize: 14,
                color: AppTheme.textSecondary,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderPhoto() {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: AppTheme.lightGray.withOpacity(0.78),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildFaraidInfoCard() {
    // Check if we have children with specific distributions
    final hasChildren = _people.any((p) => 
      p['relationship'] == 'SON' || p['relationship'] == 'DAUGHTER');
    final hasParents = _people.any((p) => 
      p['relationship'] == 'MOTHER' || p['relationship'] == 'FATHER');
    final hasSpouse = _people.any((p) => p['relationship'] == 'SPOUSE');

    if (!hasChildren && !hasParents && !hasSpouse) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9), // Light green background
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF81C784)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.balance, color: Color(0xFF388E3C), size: 24),
              const SizedBox(width: 8),
              Text(
                'Faraid Distribution Applied',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF1B5E20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Based on your family structure, the remaining estate is allocated as follows:',
            style: GoogleFonts.lato(
              fontSize: 14,
              color: const Color(0xFF2E7D32),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          if (hasParents) ...[
            _buildFaraidItem(
              icon: Icons.elderly,
              text: 'Parents: Your Father and Mother receive 1/6th each (approx 16.6%) because you have children.',
            ),
            const SizedBox(height: 8),
          ],
          if (hasChildren) ...[
            _buildFaraidItem(
              icon: Icons.child_care,
              text: 'Children: The remainder is divided among your children using the 2:1 ratio (Sons receive double the share of Daughters), as prescribed in Sharia.',
            ),
            const SizedBox(height: 8),
          ],
          if (hasSpouse) ...[
            _buildFaraidItem(
              icon: Icons.favorite,
              text: 'Spouse: Receives 1/8th (if children exist) or 1/4th (if no children) of your estate.',
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFaraidItem({required IconData icon, required String text}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF388E3C), size: 20),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.lato(
              fontSize: 14,
              color: const Color(0xFF2E7D32),
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }
}
