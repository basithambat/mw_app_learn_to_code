import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/will_service.dart';
import '../services/will_narrative_service.dart';

class WillPreviewScreen extends StatefulWidget {
  final String? willId;

  const WillPreviewScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<WillPreviewScreen> createState() => _WillPreviewScreenState();
}

class _WillPreviewScreenState extends State<WillPreviewScreen> {
  final _willService = WillService();
  final _narrativeService = WillNarrativeService();
  bool _isLoading = true;
  List<WillNarrativeSection> _sections = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (widget.willId == null || widget.willId!.startsWith('demo-')) {
      setState(() {
        _sections = [
          WillNarrativeSection(title: 'PREVIEW MODE', content: 'This is a sample preview. Complete the steps to see your actual will narrative.'),
          WillNarrativeSection(title: 'LAST WILL AND TESTAMENT', content: 'I, John Doe, born on 01 January 1980, being of sound mind...'),
        ];
        _isLoading = false;
      });
      return;
    }

    try {
      final willData = await _willService.getWill(widget.willId!);
      setState(() {
        _sections = _narrativeService.generateNarrative(willData);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load will data: $e';
        _isLoading = false;
      });
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
          'Will Preview',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
                : Column(
                    children: [
                      Expanded(
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Cover style header
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor,
                                  borderRadius: BorderRadius.circular(AppTheme.radiusM),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      'Last Will & Testament',
                                      style: GoogleFonts.frankRuhlLibre(
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Preview Generated: ${DateFormat('dd MMM yyyy').format(DateTime.now())}',
                                      style: GoogleFonts.lato(
                                        fontSize: 14,
                                        color: Colors.white.withOpacity(0.9),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 32),
                              // Narrative Sections
                              ..._sections.map((section) => _buildSection(section)),
                              const SizedBox(height: 24),
                              // Tips section
                              _buildTipsSection(),
                              const SizedBox(height: 40),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }

  Widget _buildSection(WillNarrativeSection section) {
    if (section.isHeader) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 24),
        child: Center(
          child: Text(
            section.title,
            style: GoogleFonts.frankRuhlLibre(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              decoration: TextDecoration.underline,
              color: AppTheme.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            section.title,
            style: GoogleFonts.lato(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            section.content,
            style: GoogleFonts.lato(
              fontSize: 15,
              color: AppTheme.textSecondary,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTipsSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.accentGreen.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Make your will more strong',
            style: GoogleFonts.lato(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          _buildTipItem('Coordinate with your executors'),
          _buildTipItem('Review inheritance scenarios with family'),
          _buildTipItem('Ensure all high-value assets are listed'),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () {
              Navigator.popUntil(context, (route) => route.isFirst);
            },
            child: Text(
              'Back to Dashboard',
              style: GoogleFonts.lato(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppTheme.accentGreen,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTipItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const Icon(
            Icons.check_circle,
            size: 16,
            color: AppTheme.accentGreen,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.lato(
                fontSize: 14,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

