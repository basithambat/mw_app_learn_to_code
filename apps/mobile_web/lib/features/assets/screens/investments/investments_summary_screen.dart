import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';

class InvestmentsSummaryScreen extends StatelessWidget {
  final String? willId;

  const InvestmentsSummaryScreen({Key? key, this.willId}) : super(key: key);

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
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 20),
            child: Text(
              '₹4,97,788.00',
              style: GoogleFonts.lato(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'As of Sep 6th, 2021',
                style: GoogleFonts.lato(
                  fontSize: 12,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'BANK ACCOUNTS',
                    style: GoogleFonts.lato(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      '+ Add account',
                      style: GoogleFonts.lato(
                        fontSize: 12,
                        color: AppTheme.accentGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildAccountCard('HDFC Bank', 'Salaried Savings', '₹3,75,720'),
              const SizedBox(height: 12),
              _buildAccountCard('Bank of Baroda', 'Savings', '₹50,793'),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'MUTUAL FUNDS',
                    style: GoogleFonts.lato(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      '+ Add funds',
                      style: GoogleFonts.lato(
                        fontSize: 12,
                        color: AppTheme.accentGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildFundCard('AXIS Midcap', '₹32,000 invested', '₹41,720', '▲ ₹9,725', true),
              const SizedBox(height: 12),
              _buildFundCard('Kotak equity', '₹24,000 invested', '₹29,555', '▲ ₹5,555', true),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'STOCKS',
                    style: GoogleFonts.lato(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      '+ Add stocks',
                      style: GoogleFonts.lato(
                        fontSize: 12,
                        color: AppTheme.accentGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildFundCard('NIFTY 50', '₹22,000 invested', '₹19,970', '▼ ₹2,030', false),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAccountCard(String bank, String type, String amount) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.borderColor.withOpacity(0.12)),
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.account_balance, color: Colors.blue),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  bank,
                  style: GoogleFonts.lato(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  type,
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ),
          ),
          Text(
            amount,
            style: GoogleFonts.lato(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFundCard(String name, String invested, String current, String change, bool isGain) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: AppTheme.borderColor.withOpacity(0.12)),
        borderRadius: BorderRadius.circular(AppTheme.radiusM),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppTheme.lightGray.withOpacity(0.3),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.trending_up, color: AppTheme.textSecondary),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: GoogleFonts.lato(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  invested,
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                current,
                style: GoogleFonts.lato(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              Text(
                change,
                style: GoogleFonts.lato(
                  fontSize: 12,
                  color: isGain ? AppTheme.accentGreen : Colors.red,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
