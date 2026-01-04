import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/routes/app_routes.dart';
import '../services/will_service.dart';
import '../../../core/widgets/floating_assistant_button.dart';
import 'package:flutter_svg/flutter_svg.dart';

class DashboardScreen extends StatefulWidget {
  final bool onboardingCompleted;
  
  const DashboardScreen({Key? key, this.onboardingCompleted = false}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _willService = WillService();
  Map<String, dynamic>? _will;
  bool _isLoading = true;
  final String _userName = 'User'; // TODO: Get from auth

  @override
  void initState() {
    super.initState();
    _loadWill();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // If onboarding just completed, mark step 1 as completed
    if (widget.onboardingCompleted && _will != null && !_isLoading) {
      if (_will!['stepBasicInfo'] != 'COMPLETED') {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            setState(() {
              _will!['stepBasicInfo'] = 'COMPLETED';
            });
          }
        });
      }
    }
  }

  Future<void> _loadWill() async {
    try {
      final wills = await _willService.getAllWills();
      if (wills.isNotEmpty) {
        setState(() {
          _will = wills[0];
          _isLoading = false;
        });
      } else {
        // Create new will
        final newWill = await _willService.createWill({
          'title': 'My Will',
          'personalLaw': 'UNKNOWN',
        });
        setState(() {
          _will = newWill;
          _isLoading = false;
        });
      }
    } catch (e) {
      // If API fails, create a mock will for offline/demo mode
      // Preserve existing will state if it exists (to maintain step completion)
      setState(() {
        if (_will == null) {
          _will = {
            'id': 'demo-will-id',
            'title': 'My Will',
            'personalLaw': 'UNKNOWN',
            'stepBasicInfo': 'NOT_STARTED',
            'stepFamily': 'NOT_STARTED',
            'stepArrangements': 'NOT_STARTED',
            'stepAssets': 'NOT_STARTED',
          };
        }
        _isLoading = false;
      });
    }
  }

  bool _isStepCompleted(String? status) {
    return status == 'COMPLETED';
  }

  int _getCurrentStepIndex() {
    if (_will == null) return 0; // Start at Basic Info if no will
    final steps = [
      'stepBasicInfo',
      'stepFamily',
      'stepArrangements',
      'stepAssets',
    ];
    for (int i = 0; i < steps.length; i++) {
      if (!_isStepCompleted(_will![steps[i]])) return i;
    }
    return steps.length; // All steps completed
  }

  String _getNextStepTitle() {
    final currentIndex = _getCurrentStepIndex();
    switch (currentIndex) {
      case 0:
        return 'Basic info';
      case 1:
        return 'Family & inheritance';
      case 2:
        return 'Will arrangements';
      case 3:
        return 'Accounts & properties';
      default:
        return 'Complete';
    }
  }

  void _handleGetStarted() async {
    final currentIndex = _getCurrentStepIndex();
    final willId = _will?['id'];
    if (willId == null) return;

    dynamic result;
    switch (currentIndex) {
      case 0:
        result = await Navigator.pushNamed(
          context,
          AppRoutes.basicInfo,
          arguments: willId,
        );
        // Update step status in demo mode
        if (result != null && result['stepCompleted'] == 'stepBasicInfo') {
          setState(() {
            _will?['stepBasicInfo'] = 'COMPLETED';
          });
          // Force rebuild to update button text
          if (mounted) {
            setState(() {});
          }
        }
        break;
      case 1:
        result = await Navigator.pushNamed(
          context,
          AppRoutes.family,
          arguments: willId,
        );
        if (result != null && result['stepCompleted'] == 'stepFamily') {
          setState(() {
            _will?['stepFamily'] = 'COMPLETED';
          });
          // Automatically navigate to step 3 after step 2 is completed
          if (mounted) {
            await Future.delayed(const Duration(milliseconds: 300));
            _navigateToStep(2);
          }
        }
        break;
      case 2:
        result = await Navigator.pushNamed(
          context,
          AppRoutes.arrangements,
          arguments: willId,
        );
        if (result != null && result['stepCompleted'] == 'stepArrangements') {
          setState(() {
            _will?['stepArrangements'] = 'COMPLETED';
          });
          // Automatically navigate to step 4 after step 3 is completed
          if (mounted) {
            await Future.delayed(const Duration(milliseconds: 300));
            _navigateToStep(3);
          }
        }
        break;
      case 3:
        result = await Navigator.pushNamed(
          context,
          AppRoutes.assets,
          arguments: willId,
        );
        if (result != null && result['stepCompleted'] == 'stepAssets') {
          setState(() {
            _will?['stepAssets'] = 'COMPLETED';
          });
        }
        break;
    }

    // Reload will data from API if available (for real data)
    // Or just update state if in demo mode
    if (mounted) {
      if (willId.toString().startsWith('demo-')) {
        // In demo mode, state is already updated by the result handling above
        setState(() {}); // Trigger rebuild to reflect changes
      } else {
        _loadWill(); // Reload from API for real data
      }
    }
  }

  void _navigateToStep(int stepIndex) {
    final willId = _will?['id'];
    if (willId == null) return;

    switch (stepIndex) {
      case 1:
        Navigator.pushNamed(
          context,
          AppRoutes.family,
          arguments: willId,
        ).then((result) {
          if (mounted && result != null && (result as Map)['stepCompleted'] == 'stepFamily') {
            setState(() {
              _will?['stepFamily'] = 'COMPLETED';
            });
            // Continue to next step if needed
            if (mounted) {
              Future.delayed(const Duration(milliseconds: 300), () {
                if (mounted) _navigateToStep(2);
              });
            }
          }
        });
        break;
      case 2:
        Navigator.pushNamed(
          context,
          AppRoutes.arrangements,
          arguments: willId,
        ).then((result) {
          if (mounted && result != null && (result as Map)['stepCompleted'] == 'stepArrangements') {
            setState(() {
              _will?['stepArrangements'] = 'COMPLETED';
            });
            // Continue to next step if needed
            if (mounted) {
              Future.delayed(const Duration(milliseconds: 300), () {
                if (mounted) _navigateToStep(3);
              });
            }
          }
        });
        break;
      case 3:
        Navigator.pushNamed(
          context,
          AppRoutes.assets,
          arguments: willId,
        ).then((result) {
          if (mounted && result != null && (result as Map)['stepCompleted'] == 'stepAssets') {
            setState(() {
              _will?['stepAssets'] = 'COMPLETED';
            });
          }
        });
        break;
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

    final currentStepIndex = _getCurrentStepIndex();
    final isStep1Completed = _isStepCompleted(_will?['stepBasicInfo']);
    final isStep2Completed = _isStepCompleted(_will?['stepFamily']);
    final isStep3Completed = _isStepCompleted(_will?['stepArrangements']);
    final isStep4Completed = _isStepCompleted(_will?['stepAssets']);

    // Calculate positions based on Figma design (exact pixel values)
    const double cardLeft = 24.0;
    const double cardSize = 40.0;
    const double lineLeft = 43.0; // Center of card (24 + 20 - 1px adjustment)
    const double contentLeft = 88.0; // 24 + 40 + 24 spacing
    // Step positions from Figma
    const double step1Top = 196.0;
    const double step2Top = 288.0;
    const double step3Top = 404.0;
    const double step4Top = 520.0;
    // Title positions (4px above card for step 1, aligned with card for others)
    const double step1TitleTop = 192.0;
    const double step2TitleTop = 288.0;
    const double step3TitleTop = 404.0;
    const double step4TitleTop = 520.0;
    // Description positions (28px below title)
    const double step1DescTop = 220.0;
    const double step2DescTop = 316.0;
    const double step3DescTop = 432.0;
    const double step4DescTop = 548.0;
    // Divider positions
    const double divider1Top = 264.0;
    const double divider2Top = 380.0;
    const double divider3Top = 496.0;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Status Bar
          Positioned(
            key: const Key('dashboard_status_bar'),
            top: 0,
            left: 0,
            right: 0,
            height: 24,
            child: Container(color: Colors.black.withOpacity(0.05)),
          ),
          // Decorative Element
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              width: 96,
              height: 96,
              color: const Color(0xFFB9C5BE).withOpacity(0.5),
            ),
          ),
          // Logo and Title
          Positioned(
            key: const Key('dashboard_header'),
            left: 20,
            top: 44,
            child: Row(
              children: [
                SvgPicture.asset(
                  'assets/icons/logo_icon.svg',
                  width: 24,
                  height: 24,
                ),
                const SizedBox(width: 8),
                Text(
                  "$_userName's wasiyat",
                  style: GoogleFonts.frankRuhlLibre(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppTheme.primaryColor,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          // Main Title
          Positioned(
            key: const Key('dashboard_main_title'),
            left: 20,
            top: 104,
            child: Text(
              "Let's get you a legal will",
              style: GoogleFonts.frankRuhlLibre(
                fontWeight: FontWeight.bold,
                fontSize: 24,
                color: AppTheme.textPrimary,
                height: 1.33,
              ),
            ),
          ),
          // Subtitle
          Positioned(
            left: 20,
            top: 140,
            width: 320,
            child: Text(
              'Do at your pace, we will save the details as you go',
              style: GoogleFonts.lato(
                fontSize: 14,
                color: AppTheme.textSecondary,
                height: 1.43,
              ),
            ),
          ),

          // Vertical Progress Lines - Positioned from left edge at center of cards
          // Line from Step 1 to Step 2
          Positioned(
            left: lineLeft,
            top: step1Top + cardSize, // Start after step 1 card
            child: Column(
              children: [
                // Dark green line if step 1 completed
                if (isStep1Completed)
                  Container(width: 2, height: 56, color: AppTheme.primaryColor),
                // Light green line to step 2
                Container(
                  width: 2,
                  height: isStep1Completed
                      ? 64
                      : 92, // 64 if completed, else full gap
                  color: AppTheme.primaryLight,
                ),
              ],
            ),
          ),
          // Line from Step 2 to Step 3
          Positioned(
            left: lineLeft,
            top: step2Top + cardSize, // Start after step 2 card
            child: Column(
              children: [
                // Dark green line if step 2 completed
                if (isStep2Completed)
                  Container(width: 2, height: 42, color: AppTheme.primaryColor),
                // Light green line to step 3
                Container(
                  width: 2,
                  height: isStep2Completed
                      ? 76
                      : 116, // 76 if completed, else full gap
                  color: AppTheme.primaryLight,
                ),
              ],
            ),
          ),
          // Line from Step 3 to Step 4
          Positioned(
            left: lineLeft,
            top: step3Top + cardSize, // Start after step 3 card
            child: Container(
              width: 2,
              height: 76, // Always light green to step 4
              color: AppTheme.primaryLight,
            ),
          ),

          // Step 1: Basic Info
          Positioned(
            key: const Key('dashboard_step1_card'),
            left: cardLeft,
            top: step1Top,
            child: _buildStepCard(
              stepNumber: 1,
              isCompleted: isStep1Completed,
              isCurrent: currentStepIndex == 0,
            ),
          ),
          Positioned(
            key: const Key('dashboard_step1_content'),
            left: contentLeft,
            top: step1TitleTop,
            child: _buildStepContent(
              title: 'Basic info',
              description: isStep1Completed
                  ? "You're married and have children"
                  : 'Personal details and religion',
              isCompleted: isStep1Completed,
              onEdit: isStep1Completed
                  ? () async {
                      final result = await Navigator.pushNamed(
                        context,
                        AppRoutes.basicInfo,
                        arguments: _will!['id'],
                      );
                      if (mounted) {
                        if (_will!['id'].toString().startsWith('demo-')) {
                          setState(() {});
                        } else {
                          _loadWill();
                        }
                      }
                    }
                  : null,
            ),
          ),
          // Horizontal divider after Step 1
          Positioned(
            key: const Key('dashboard_divider_1'),
            left: contentLeft,
            top: divider1Top,
            child: IgnorePointer(
              child: Container(
                width: 252,
                height: 1,
                color: Colors.black.withOpacity(0.12),
              ),
            ),
          ),

          // Step 2: Family & Inheritance
          Positioned(
            key: const Key('dashboard_step2_card'),
            left: cardLeft,
            top: step2Top,
            child: _buildStepCard(
              stepNumber: 2,
              isCompleted: isStep2Completed,
              isCurrent: currentStepIndex == 1,
            ),
          ),
          Positioned(
            key: const Key('dashboard_step2_content'),
            left: contentLeft,
            top: step2TitleTop,
            child: _buildStepContent(
              title: 'Family & inheritance',
              description:
                  'Details of your family members and distribution of what they get',
              isCompleted: isStep2Completed,
              onEdit: isStep2Completed
                  ? () async {
                      final result = await Navigator.pushNamed(
                        context,
                        AppRoutes.family,
                        arguments: _will!['id'],
                      );
                      if (mounted) {
                        if (_will!['id'].toString().startsWith('demo-')) {
                          setState(() {});
                        } else {
                          _loadWill();
                        }
                      }
                    }
                  : null,
            ),
          ),
          // Horizontal divider after Step 2
          Positioned(
            key: const Key('dashboard_divider_2'),
            left: contentLeft,
            top: divider2Top,
            child: IgnorePointer(
              child: Container(
                width: 252,
                height: 1,
                color: Colors.black.withOpacity(0.12),
              ),
            ),
          ),

          // Step 3: Will Arrangements
          Positioned(
            key: const Key('dashboard_step3_card'),
            left: cardLeft,
            top: step3Top,
            child: _buildStepCard(
              stepNumber: 3,
              isCompleted: isStep3Completed,
              isCurrent: currentStepIndex == 2,
            ),
          ),
          Positioned(
            key: const Key('dashboard_step3_content'),
            left: contentLeft,
            top: step3TitleTop,
            child: _buildStepContent(
              title: 'Will arrangements',
              description:
                  'Assign a person to carry your wishes and finish legal formalities',
              isCompleted: isStep3Completed,
              onEdit: isStep3Completed
                  ? () async {
                      final result = await Navigator.pushNamed(
                        context,
                        AppRoutes.arrangements,
                        arguments: _will!['id'],
                      );
                      if (mounted) {
                        if (_will!['id'].toString().startsWith('demo-')) {
                          setState(() {});
                        } else {
                          _loadWill();
                        }
                      }
                    }
                  : null,
            ),
          ),
          // Horizontal divider after Step 3
          Positioned(
            key: const Key('dashboard_divider_3'),
            left: contentLeft,
            top: divider3Top,
            child: IgnorePointer(
              child: Container(
                width: 252,
                height: 1,
                color: Colors.black.withOpacity(0.12),
              ),
            ),
          ),

          // Step 4: Accounts & Properties
          Positioned(
            key: const Key('dashboard_step4_card'),
            left: cardLeft,
            top: step4Top,
            child: _buildStepCard(
              stepNumber: 4,
              isCompleted: isStep4Completed,
              isCurrent: currentStepIndex == 3,
            ),
          ),
          Positioned(
            key: const Key('dashboard_step4_content'),
            left: contentLeft,
            top: step4TitleTop,
            child: _buildStepContent(
              title: 'Accounts & properties',
              description:
                  'Add specifics of what you own and who gets what from those',
              isCompleted: isStep4Completed,
              onEdit: isStep4Completed
                  ? () async {
                      final result = await Navigator.pushNamed(
                        context,
                        AppRoutes.assets,
                        arguments: _will!['id'],
                      );
                      if (mounted) {
                        if (_will!['id'].toString().startsWith('demo-')) {
                          setState(() {});
                        } else {
                          _loadWill();
                        }
                      }
                    }
                  : null,
            ),
          ),

          // Bottom Action Section
          Positioned(
            key: const Key('dashboard_bottom_bar'),
            left: 0,
            right: 0,
            bottom: 0,
            height: 101,
            child: Container(
              key: const Key('dashboard_bottom_container'),
              decoration: const BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(8),
                  topRight: Radius.circular(8),
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    key: const Key('dashboard_next_step_label'),
                    left: 20,
                    top: 28,
                    child: Text(
                      'Next step',
                      style: GoogleFonts.lato(
                        fontSize: 14,
                        color: Colors.white,
                        height: 1.43,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 20,
                    top: 52,
                    child: Text(
                      _getNextStepTitle(),
                      style: GoogleFonts.lato(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                        color: Colors.white,
                        height: 1.5,
                      ),
                    ),
                  ),
                  Positioned(
                    key: const Key('dashboard_get_started_button'),
                    right: 20,
                    top: 24,
                    child: SizedBox(
                      width: 150, // Increased from 136 to fit "Get Started"
                      height: 56,
                      child: ElevatedButton(
                        key: const Key('dashboard_get_started_elevated_button'),
                        onPressed: _handleGetStarted,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.lightGray,
                          foregroundColor: AppTheme.textPrimary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                        ),
                        child: Text(
                          'Get Started',
                          style: GoogleFonts.frankRuhlLibre(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Floating Assistant Button - Positioned above bottom bar
          Positioned(
            key: const Key('dashboard_floating_assistant'),
            bottom: 120, // Above the bottom bar (101px height + 19px spacing)
            right: 20,
            child: FloatingAssistantButton(willId: _will?['id']),
          ),
        ],
      ),
    );
  }

  Widget _buildStepCard({
    required int stepNumber,
    required bool isCompleted,
    required bool isCurrent,
  }) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: isCompleted || isCurrent
            ? AppTheme.primaryColor
            : AppTheme.primaryLight,
        borderRadius: BorderRadius.circular(8),
      ),
      child: isCompleted
          ? const Icon(Icons.check, color: Colors.white, size: 20)
          : Center(
              child: Text(
                stepNumber.toString(),
                style: GoogleFonts.frankRuhlLibre(
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                  color: isCurrent ? Colors.white : AppTheme.primaryColor,
                ),
              ),
            ),
    );
  }

  Widget _buildStepContent({
    required String title,
    required String description,
    required bool isCompleted,
    VoidCallback? onEdit,
  }) {
    return SizedBox(
      width: 252, // Fixed width from Figma
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.lato(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppTheme.textPrimary,
                    height: 1.5, // 24px line height
                  ),
                ),
              ),
              if (isCompleted && onEdit != null)
                GestureDetector(
                  onTap: onEdit,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.accentGreen.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Edit',
                      style: GoogleFonts.lato(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: AppTheme.accentGreen,
                        height: 1.43, // 20px line height
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4), // 4px gap between title and description
          SizedBox(
            width: 216, // Fixed width from Figma
            child: Text(
              description,
              style: GoogleFonts.lato(
                fontSize: 14,
                color: AppTheme.textSecondary,
                height: 1.43, // 20px line height
              ),
            ),
          ),
        ],
      ),
    );
  }
}
