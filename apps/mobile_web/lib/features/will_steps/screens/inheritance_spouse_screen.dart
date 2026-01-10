import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/inheritance_service.dart';

class InheritanceSpouseScreen extends StatefulWidget {
  final String? willId;
  final Map<String, dynamic>? spouse;

  const InheritanceSpouseScreen({
    Key? key,
    this.willId,
    this.spouse,
  }) : super(key: key);

  @override
  State<InheritanceSpouseScreen> createState() => _InheritanceSpouseScreenState();
}

class _InheritanceSpouseScreenState extends State<InheritanceSpouseScreen> {
  final _inheritanceService = InheritanceService();
  double _percentage = 100.0;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadScenario();
  }

  Future<void> _loadScenario() async {
    if (widget.willId == null) return;
    try {
      final scenarios = await _inheritanceService.getScenarios(widget.willId!);
      final scenario = scenarios.firstWhere(
        (s) => s['type'] == 'USER_DIES_FIRST',
        orElse: () => null,
      );
      if (scenario != null && scenario['allocationJson'] != null) {
        final allocationJson = scenario['allocationJson'];
        if (allocationJson['allocations'] != null) {
          final distributions = allocationJson['allocations'] as List;
          if (distributions.isNotEmpty) {
            setState(() {
              _percentage = (distributions[0]['percentage'] ?? 100.0).toDouble();
            });
          }
        }
      }
    } catch (e) {
      // Use default 100%
    }
  }

  Future<void> _save() async {
    if (widget.willId == null || widget.spouse == null) return;

    setState(() => _isLoading = true);

    try {
      final data = {
        'type': 'USER_DIES_FIRST',
        'allocationJson': {
          'allocations': [
            {
              'personId': widget.spouse!['id'],
              'percentage': _percentage.toInt(),
            },
          ]
        },
      };

      final scenarios = await _inheritanceService.getScenarios(widget.willId!);
      final existing = scenarios.firstWhere(
        (s) => s['type'] == 'USER_DIES_FIRST',
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
                        widthFactor: 0.33, // 1 of 3 steps
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
                      'If you die before your spouse, how much should she get?',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'If you wish your wife to inherit less than 100, rest of the estate will be given to your children equally',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 32),
                    // Spouse profile
                    Center(
                      child: Column(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(40),
                            child: widget.spouse?['photoUrl'] != null
                                ? Image.network(
                                    widget.spouse!['photoUrl'],
                                    width: 80,
                                    height: 80,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) =>
                                        _buildPlaceholderPhoto(),
                                  )
                                : _buildPlaceholderPhoto(),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            '${_percentage.toInt()}%',
                            style: GoogleFonts.frankRuhlLibre(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    // Slider
                    _buildSlider(),
                  ],
                ),
              ),
            ),

            // Next Button
            Padding(
              padding: EdgeInsets.all(padding),
              child: PrimaryButton(
                text: 'Next',
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
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        color: AppTheme.lightGray.withOpacity(0.78),
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildSlider() {
    return Column(
      children: [
        // Slider
        Slider(
          value: _percentage,
          min: 0,
          max: 100,
          divisions: 100,
          activeColor: AppTheme.primaryColor,
          inactiveColor: AppTheme.primaryLight,
          onChanged: (value) {
            setState(() {
              _percentage = value;
            });
          },
        ),
        // Tick marks and labels
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildTickMark(70),
            _buildTickMark(80),
            _buildTickMark(90),
            _buildTickMark(100),
          ],
        ),
      ],
    );
  }

  Widget _buildTickMark(int value) {
    final isSelected = (_percentage.round() == value);
    return Column(
      children: [
        Container(
          width: isSelected ? 3 : 1,
          height: isSelected ? 20 : 12,
          color: isSelected ? AppTheme.primaryColor : AppTheme.primaryLight,
        ),
        const SizedBox(height: 4),
        Text(
          value.toString(),
          style: GoogleFonts.lato(
            fontSize: 12,
            color: isSelected ? AppTheme.primaryColor : AppTheme.textSecondary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
