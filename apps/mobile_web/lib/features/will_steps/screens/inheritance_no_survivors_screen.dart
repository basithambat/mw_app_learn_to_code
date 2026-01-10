import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/inheritance_service.dart';
import 'add_charity_friend_screen.dart';

class InheritanceNoSurvivorsScreen extends StatefulWidget {
  final String? willId;
  final Map<String, dynamic>? mother;
  final List<Map<String, dynamic>>? others;

  const InheritanceNoSurvivorsScreen({
    Key? key,
    this.willId,
    this.mother,
    this.others,
  }) : super(key: key);

  @override
  State<InheritanceNoSurvivorsScreen> createState() => _InheritanceNoSurvivorsScreenState();
}

class _InheritanceNoSurvivorsScreenState extends State<InheritanceNoSurvivorsScreen> {
  final _inheritanceService = InheritanceService();
  List<Map<String, dynamic>> _beneficiaries = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.mother != null) {
      _beneficiaries.add({
        'person': widget.mother,
        'percentage': 100.0,
      });
    }
    _loadScenario();
  }

  Future<void> _loadScenario() async {
    if (widget.willId == null) return;
    try {
      final scenarios = await _inheritanceService.getScenarios(widget.willId!);
      final scenario = scenarios.firstWhere(
        (s) => s['type'] == 'NO_ONE_SURVIVES',
        orElse: () => null,
      );
      if (scenario != null && scenario['allocationJson'] != null) {
        // Load existing distributions
        // This would need to map person IDs to actual person objects
      }
    } catch (e) {
      // Use default
    }
  }

  Future<void> _save() async {
    if (widget.willId == null) return;

    setState(() => _isLoading = true);

    try {
      final distributions = _beneficiaries.map((b) => {
        'personId': b['person']['id'],
        'percentage': (b['percentage'] as double).toInt(),
      }).toList();

      final data = {
        'type': 'NO_ONE_SURVIVES',
        'allocationJson': {
          'allocations': distributions,
        },
      };

      final scenarios = await _inheritanceService.getScenarios(widget.willId!);
      final existing = scenarios.firstWhere(
        (s) => s['type'] == 'NO_ONE_SURVIVES',
        orElse: () => null,
      );

      if (existing != null) {
        await _inheritanceService.updateScenario(
          widget.willId!,
          existing['id'],
          data,
        );
      } else {
        await _inheritanceService.createScenario(widget.willId!, data);
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
            // Header with progress bar
            Padding(
              padding: EdgeInsets.fromLTRB(padding, 12, padding, 0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Color(0xFF323232)),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Expanded(
                    child: Container(
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryLight,
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: 1.0, // 3 of 3 steps
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
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
                    Text(
                      'If no one survives from your family, who gets your estate?',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'In very unlikely event, your mother is suppose to be the inheritor of all your estate. If you wish to add any, you can adjust the share.',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 32),
                    // Beneficiaries
                    ..._beneficiaries.map((beneficiary) {
                      final person = beneficiary['person'] as Map<String, dynamic>;
                      final percentage = beneficiary['percentage'] as double;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: const Color(0xFFD0D0D0),
                            ),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: person['photoUrl'] != null
                                    ? Image.network(
                                        person['photoUrl'],
                                        width: 40,
                                        height: 40,
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
                                      '${person['fullName']} gets ${percentage.toInt()}%',
                                      style: GoogleFonts.lato(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                    Text(
                                      person['relationship'] ?? 'Beneficiary',
                                      style: GoogleFonts.lato(
                                        fontSize: 14,
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 16),
                    // Add another button
                    OutlinedButton(
                      onPressed: () async {
                        final type = await showDialog<String>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: Text('Add beneficiary'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                ListTile(
                                  leading: const Icon(Icons.favorite),
                                  title: const Text('Charity'),
                                  onTap: () => Navigator.pop(context, 'charity'),
                                ),
                                ListTile(
                                  leading: const Icon(Icons.person),
                                  title: const Text('Friend'),
                                  onTap: () => Navigator.pop(context, 'friend'),
                                ),
                              ],
                            ),
                          ),
                        );
                        if (type != null && mounted) {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => AddCharityFriendScreen(
                                willId: widget.willId,
                                type: type,
                              ),
                            ),
                          );
                          if (result != null && mounted) {
                            setState(() {
                              _beneficiaries.add(result);
                            });
                          }
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: AppTheme.primaryColor),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add, color: AppTheme.primaryColor),
                          const SizedBox(width: 8),
                          Text(
                            'Add another',
                            style: GoogleFonts.lato(
                              fontSize: 16,
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Save Button
            Padding(
              padding: EdgeInsets.all(padding),
              child: PrimaryButton(
                text: 'Save',
                onPressed: _isLoading ? null : _save,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholderPhoto() {
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
