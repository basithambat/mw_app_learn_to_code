import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';

class InvestmentsConfirmModal extends StatefulWidget {
  final String? willId;

  const InvestmentsConfirmModal({Key? key, this.willId}) : super(key: key);

  @override
  State<InvestmentsConfirmModal> createState() => _InvestmentsConfirmModalState();
}

class _InvestmentsConfirmModalState extends State<InvestmentsConfirmModal> {
  bool _isChecked = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Text(
            'Confirm your details',
            style: GoogleFonts.frankRuhlLibre(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Note: Enter email ID & PAN linked to your mutual funds to start tracking',
            style: GoogleFonts.lato(
              fontSize: 12,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 20),
          TextField(
            decoration: InputDecoration(
              labelText: 'Email address',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusM),
              ),
            ),
            controller: TextEditingController(text: 'rishabh.sharma2012@gmail.com'),
          ),
          const SizedBox(height: 16),
          TextField(
            decoration: InputDecoration(
              labelText: 'PAN',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusM),
              ),
            ),
            controller: TextEditingController(text: 'EAHPK6078F'),
          ),
          const SizedBox(height: 8),
          Text(
            'PAN is fetched from credit report',
            style: GoogleFonts.lato(
              fontSize: 12,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                value: _isChecked,
                onChanged: (value) => setState(() => _isChecked = value ?? false),
                activeColor: AppTheme.primaryColor,
              ),
              Expanded(
                child: Text(
                  'I allow Mywasiyat to fetch the updated fund reports every month. You can always opt out from settings',
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    color: AppTheme.textMuted,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            text: 'Get details',
            onPressed: _isChecked
                ? () {
                    Navigator.pop(context, true);
                  }
                : null,
            backgroundColor: _isChecked
                ? AppTheme.primaryColor
                : AppTheme.primaryColor.withOpacity(0.5),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }
}
