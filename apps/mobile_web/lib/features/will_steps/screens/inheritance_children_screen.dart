import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/constants/app_enums.dart';
import '../services/inheritance_service.dart';
import '../services/people_service.dart';
import '../services/will_service.dart';

class InheritanceChildrenScreen extends StatefulWidget {
  final String? willId;
  final List<Map<String, dynamic>> children;

  const InheritanceChildrenScreen({
    Key? key,
    this.willId,
    required this.children,
  }) : super(key: key);

  @override
  State<InheritanceChildrenScreen> createState() => _InheritanceChildrenScreenState();
}

class _InheritanceChildrenScreenState extends State<InheritanceChildrenScreen> {
  final _inheritanceService = InheritanceService();
  final _willService = WillService();
  Map<String, double> _percentages = {};
  bool _isLoading = false;
  String? _personalLaw;

  @override
  void initState() {
    super.initState();
    // Initialize with equal distribution
    final equalShare = 100.0 / widget.children.length;
    for (var child in widget.children) {
      _percentages[child['id'].toString()] = equalShare;
    }
    _loadData();
  }

  Future<void> _loadData() async {
    if (widget.willId == null) return;
    try {
       // 1. Fetch Personal Law
       final will = await _willService.getWill(widget.willId!);
       _personalLaw = will['personalLaw'];
       
       // 2. Load Scenario
       await _loadScenario();
       
    } catch (e) {
      print('Error loading data: $e');
    }
  }

  Future<void> _loadScenario() async {
    if (widget.willId == null) return;
    try {
      final scenarios = await _inheritanceService.getScenarios(widget.willId!);
      final scenario = scenarios.firstWhere(
        (s) => s['type'] == 'SPOUSE_DIES_FIRST',
        orElse: () => null,
      );
      if (scenario != null && scenario['allocationJson'] != null) {
        final allocationJson = scenario['allocationJson'];
        if (allocationJson['allocations'] != null) {
          final distributions = allocationJson['allocations'] as List;
          setState(() {
            for (var dist in distributions) {
              _percentages[dist['personId'].toString()] = (dist['percentage'] ?? 0.0).toDouble();
            }
          });
        }
      }
    } catch (e) {
      // Use default equal distribution
    }
  }

  double _getTotalPercentage() {
    return _percentages.values.fold(0.0, (sum, p) => sum + p);
  }

  Future<void> _save() async {
    if (widget.willId == null) return;
    if (_getTotalPercentage() != 100.0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Total percentage must equal 100%')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final distributions = _percentages.entries.map((e) => {
        'personId': e.key,
        'percentage': e.value.toInt(),
      }).toList();

      final data = {
        'type': 'SPOUSE_DIES_FIRST',
        'allocationJson': {
          'allocations': distributions,
        },
      };

      final scenarios = await _inheritanceService.getScenarios(widget.willId!);
      final existing = scenarios.firstWhere(
        (s) => s['type'] == 'SPOUSE_DIES_FIRST',
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
    final totalPercentage = _getTotalPercentage();

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
                        widthFactor: 0.66, // 2 of 3 steps
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
                      'If your spouse dies before you, how much your child gets?',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'If the overall percentage don\'t add upto 100, you need to assign it to someone else',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    if (totalPercentage != 100.0)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          'Total: ${totalPercentage.toStringAsFixed(0)}% (must be 100%)',
                          style: GoogleFonts.lato(
                            fontSize: 14,
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    const SizedBox(height: 32),
                    // Children with sliders
                    ...widget.children.map((child) {
                      final childId = child['id'].toString();
                      final percentage = _percentages[childId] ?? 0.0;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 32),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(20),
                                  child: child['photoUrl'] != null
                                      ? Image.network(
                                          child['photoUrl'],
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
                                  child: Text(
                                    child['fullName'] ?? 'Child',
                                    style: GoogleFonts.lato(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                ),
                                Text(
                                  '${percentage.toInt()}%',
                                  style: GoogleFonts.frankRuhlLibre(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                            if (_personalLaw == PersonalLaw.MUSLIM)
                               Padding(
                                 padding: const EdgeInsets.only(top: 4, bottom: 8),
                                 child: Container(
                                   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                   decoration: BoxDecoration(
                                     color: Colors.green.withOpacity(0.1),
                                     borderRadius: BorderRadius.circular(4),
                                     border: Border.all(color: Colors.green),
                                   ),
                                   child: Text(
                                     'Fixed by Law (Faraid)',
                                     style: GoogleFonts.lato(
                                       fontSize: 12,
                                       color: Colors.green[800],
                                       fontWeight: FontWeight.bold,
                                     ),
                                   ),
                                 ),
                               ),
                            const SizedBox(height: 12),
                            Slider(
                              value: percentage,
                              min: 0,
                              max: 100,
                              divisions: 100,
                              activeColor: _personalLaw == PersonalLaw.MUSLIM ? Colors.grey : AppTheme.primaryColor,
                              inactiveColor: AppTheme.primaryLight,
                              onChanged: _personalLaw == PersonalLaw.MUSLIM ? null : (value) {
                                if (value.round() != percentage.round()) {
                                  HapticFeedback.lightImpact();
                                  setState(() {
                                    _percentages[childId] = value.roundToDouble();
                                  });
                                }
                              },
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                _buildTickMark(0),
                                _buildTickMark(25),
                                _buildTickMark(50),
                                _buildTickMark(75),
                                _buildTickMark(100),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),

            // Next Button
            Padding(
              padding: EdgeInsets.all(padding),
              child: PrimaryButton(
                text: 'Next',
                onPressed: _isLoading || totalPercentage != 100.0 ? null : _save,
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

  Widget _buildTickMark(int value) {
    return Text(
      value.toString(),
      style: GoogleFonts.lato(
        fontSize: 10,
        color: AppTheme.textSecondary,
      ),
    );
  }
}
