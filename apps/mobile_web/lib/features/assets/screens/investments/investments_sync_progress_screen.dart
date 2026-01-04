import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import 'investments_summary_screen.dart';

class InvestmentsSyncProgressScreen extends StatefulWidget {
  final String? willId;
  final String email;

  const InvestmentsSyncProgressScreen({
    Key? key,
    this.willId,
    required this.email,
  }) : super(key: key);

  @override
  State<InvestmentsSyncProgressScreen> createState() => _InvestmentsSyncProgressScreenState();
}

class _InvestmentsSyncProgressScreenState extends State<InvestmentsSyncProgressScreen> {
  bool _step1Completed = false;
  bool _step2Completed = false;

  @override
  void initState() {
    super.initState();
    _simulateProgress();
  }

  Future<void> _simulateProgress() async {
    // Simulate step 1 completion
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() => _step1Completed = true);
    }

    // Simulate step 2 completion
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() => _step2Completed = true);
    }
  }

  @override
  Widget build(BuildContext context) {
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
          'Investments',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Investments',
                style: GoogleFonts.lato(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textSecondary,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Auto-track request initiated',
                style: GoogleFonts.frankRuhlLibre(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We will notify you once we are done',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 48),
              // Step 1
              _buildProgressStep(
                isCompleted: _step1Completed,
                title: 'Portfolio sync initiated',
                subtitle: 'Process has started for ${widget.email}',
                isLast: false,
              ),
              const SizedBox(height: 24),
              // Step 2
              _buildProgressStep(
                isCompleted: _step2Completed,
                title: 'Sync successful',
                subtitle: null,
                isLast: true,
              ),
              const SizedBox(height: 48),
              OutlinedButton(
                onPressed: _step2Completed
                    ? () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => InvestmentsSummaryScreen(willId: widget.willId),
                          ),
                        );
                      }
                    : null,
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: _step2Completed
                        ? AppTheme.primaryColor
                        : AppTheme.borderColor.withOpacity(0.5),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusM),
                  ),
                  minimumSize: const Size(double.infinity, 56),
                ),
                child: Text(
                  'Done',
                  style: GoogleFonts.lato(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: _step2Completed
                        ? AppTheme.primaryColor
                        : AppTheme.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressStep({
    required bool isCompleted,
    required String title,
    String? subtitle,
    required bool isLast,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isCompleted ? AppTheme.accentGreen : Colors.transparent,
                border: Border.all(
                  color: isCompleted
                      ? AppTheme.accentGreen
                      : AppTheme.borderColor.withOpacity(0.5),
                  width: 2,
                ),
                shape: BoxShape.circle,
              ),
              child: isCompleted
                  ? const Icon(
                      Icons.check,
                      size: 16,
                      color: Colors.white,
                    )
                  : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                margin: const EdgeInsets.only(top: 4),
                color: isCompleted
                    ? AppTheme.accentGreen
                    : AppTheme.borderColor.withOpacity(0.3),
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.lato(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isCompleted ? AppTheme.textPrimary : AppTheme.textSecondary,
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.lato(
                    fontSize: 14,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
