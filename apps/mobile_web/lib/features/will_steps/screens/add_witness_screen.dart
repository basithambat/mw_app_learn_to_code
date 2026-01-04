import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/arrangements_service.dart';
import 'add_witness_form_screen.dart';

class AddWitnessScreen extends StatefulWidget {
  final String? willId;

  const AddWitnessScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<AddWitnessScreen> createState() => _AddWitnessScreenState();
}

class _AddWitnessScreenState extends State<AddWitnessScreen> {
  final _arrangementsService = ArrangementsService();
  List<dynamic> _witnesses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadWitnesses();
  }

  Future<void> _loadWitnesses() async {
    if (widget.willId == null || widget.willId!.startsWith('demo-')) {
      setState(() {
        _witnesses = [];
        _isLoading = false;
      });
      return;
    }

    try {
      final witnesses = await _arrangementsService.getWitnesses(widget.willId!);
      setState(() {
        _witnesses = witnesses;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _witnesses = [];
        _isLoading = false;
      });
    }
  }

  Future<void> _addWitness(int witnessNumber) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddWitnessFormScreen(
          willId: widget.willId,
          witnessNumber: witnessNumber,
        ),
      ),
    );
    if (result == true) {
      await _loadWitnesses();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final hasFirstWitness = _witnesses.isNotEmpty;
    final hasSecondWitness = _witnesses.length >= 2;

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
          'Add witness',
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
                'You need at least 2 witnesses for your will. Witnesses should be adults, preferably not beneficiaries, and should not be your executor.',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              // Witness 1
              if (hasFirstWitness)
                _buildWitnessCard(
                  witness: _witnesses[0],
                  witnessNumber: 1,
                  onEdit: () => _addWitness(1),
                )
              else
                PrimaryButton(
                  text: 'Add first witness',
                  onPressed: () => _addWitness(1),
                ),
              const SizedBox(height: 16),
              // Witness 2
              if (hasSecondWitness)
                _buildWitnessCard(
                  witness: _witnesses[1],
                  witnessNumber: 2,
                  onEdit: () => _addWitness(2),
                )
              else
                PrimaryButton(
                  text: 'Add second witness',
                  onPressed: hasFirstWitness ? () => _addWitness(2) : null,
                  backgroundColor: hasFirstWitness ? AppTheme.primaryColor : AppTheme.primaryColor.withOpacity(0.5),
                ),
              const SizedBox(height: 40),
              if (hasSecondWitness)
                PrimaryButton(
                  text: 'Save & Continue',
                  onPressed: () => Navigator.pop(context, true),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWitnessCard({
    required dynamic witness,
    required int witnessNumber,
    required VoidCallback onEdit,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.borderColor.withOpacity(0.12)),
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Witness $witnessNumber',
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  witness['fullName'] ?? '',
                  style: GoogleFonts.lato(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                if (witness['email'] != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    witness['email'] ?? '',
                    style: GoogleFonts.lato(
                      fontSize: 14,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ],
            ),
          ),
          TextButton(
            onPressed: onEdit,
            child: Text(
              'Edit',
              style: GoogleFonts.lato(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: AppTheme.accentGreen,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
