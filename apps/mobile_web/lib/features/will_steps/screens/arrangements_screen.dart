import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/arrangements_service.dart';
import '../services/will_service.dart';
import 'assign_executor_screen.dart';
import 'add_witness_screen.dart';
import 'add_signature_screen.dart';
import 'record_consent_screen.dart';
import 'will_ready_screen.dart';

class ArrangementsScreen extends StatefulWidget {
  final String? willId;

  const ArrangementsScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<ArrangementsScreen> createState() => _ArrangementsScreenState();
}

class _ArrangementsScreenState extends State<ArrangementsScreen> {
  final _arrangementsService = ArrangementsService();
  final _willService = WillService();
  bool _hasExecutor = false;
  bool _hasWitnesses = false;
  bool _hasSignature = false;
  bool _hasConsent = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  Future<void> _loadStatus() async {
    if (widget.willId == null || widget.willId!.startsWith('demo-')) {
      setState(() {
        _isLoading = false;
      });
      return;
    }

    try {
      final [executors, witnesses] = await Future.wait([
        _arrangementsService.getExecutors(widget.willId!),
        _arrangementsService.getWitnesses(widget.willId!),
      ]);

      setState(() {
        _hasExecutor = executors.isNotEmpty;
        _hasWitnesses = witnesses.length >= 2;
        // TODO: Check signature and consent status from API
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _startFlow() async {
    // Step 1: Assign Executor
    final executorResult = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AssignExecutorScreen(willId: widget.willId),
      ),
    );

    if (executorResult != true) return;

    // Step 2: Add Witnesses
    final witnessResult = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddWitnessScreen(willId: widget.willId),
      ),
    );

    if (witnessResult != true) return;

    // Step 3: Add Signature
    final signatureResult = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddSignatureScreen(willId: widget.willId),
      ),
    );

    if (signatureResult != true) return;

    // Step 4: Record Consent
    final consentResult = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RecordConsentScreen(
          willId: widget.willId,
          userName: 'User', // TODO: Get from will data
        ),
      ),
    );

    if (consentResult != true) return;

    // Step 5: Will Ready
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WillReadyScreen(willId: widget.willId),
      ),
    );

    // Mark step as completed
    if (widget.willId != null && !widget.willId!.startsWith('demo-')) {
      try {
        await _willService.updateWill(widget.willId!, {
          'stepArrangements': 'COMPLETED',
        });
      } catch (e) {
        // Handle error
      }
    }

    if (mounted) {
      Navigator.pop(context, {'stepCompleted': 'stepArrangements'});
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final allComplete = _hasExecutor && _hasWitnesses && _hasSignature && _hasConsent;

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
          'Will Arrangements',
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
                'Complete the following steps to finalize your will arrangements:',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              _buildStepItem(
                title: 'Assign Executor',
                completed: _hasExecutor,
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AssignExecutorScreen(willId: widget.willId),
                    ),
                  );
                  if (result == true) {
                    await _loadStatus();
                  }
                },
              ),
              const SizedBox(height: 16),
              _buildStepItem(
                title: 'Add Witnesses (2 required)',
                completed: _hasWitnesses,
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AddWitnessScreen(willId: widget.willId),
                    ),
                  );
                  if (result == true) {
                    await _loadStatus();
                  }
                },
              ),
              const SizedBox(height: 16),
              _buildStepItem(
                title: 'Add Signature',
                completed: _hasSignature,
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AddSignatureScreen(willId: widget.willId),
                    ),
                  );
                  if (result == true) {
                    await _loadStatus();
                  }
                },
              ),
              const SizedBox(height: 16),
              _buildStepItem(
                title: 'Record Consent Video',
                completed: _hasConsent,
                onTap: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => RecordConsentScreen(
                        willId: widget.willId,
                        userName: 'User',
                      ),
                    ),
                  );
                  if (result == true) {
                    await _loadStatus();
                  }
                },
              ),
              const SizedBox(height: 40),
              PrimaryButton(
                text: allComplete ? 'Continue' : 'Get Started',
                onPressed: _startFlow,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepItem({
    required String title,
    required bool completed,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: completed ? AppTheme.accentGreen : AppTheme.borderColor.withOpacity(0.12),
            width: completed ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(AppTheme.radiusM),
          color: completed ? AppTheme.accentGreen.withOpacity(0.05) : Colors.white,
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: completed ? AppTheme.accentGreen : Colors.transparent,
                border: Border.all(
                  color: completed ? AppTheme.accentGreen : AppTheme.borderColor.withOpacity(0.5),
                ),
                shape: BoxShape.circle,
              ),
              child: completed
                  ? const Icon(
                      Icons.check,
                      size: 16,
                      color: Colors.white,
                    )
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: GoogleFonts.lato(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: completed ? AppTheme.textPrimary : AppTheme.textSecondary,
                ),
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: AppTheme.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}
