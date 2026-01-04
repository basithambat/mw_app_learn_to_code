import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/primary_button.dart';

class LiabilitiesConfirmModal extends StatefulWidget {
  final String? willId;

  const LiabilitiesConfirmModal({Key? key, this.willId}) : super(key: key);

  @override
  State<LiabilitiesConfirmModal> createState() => _LiabilitiesConfirmModalState();
}

class _LiabilitiesConfirmModalState extends State<LiabilitiesConfirmModal> {
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
          const SizedBox(height: 20),
          TextField(
            decoration: InputDecoration(
              labelText: 'First name',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusM),
              ),
            ),
            controller: TextEditingController(text: 'Rishabh'),
          ),
          const SizedBox(height: 16),
          TextField(
            decoration: InputDecoration(
              labelText: 'Last name',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusM),
              ),
            ),
            controller: TextEditingController(text: 'Sharma'),
          ),
          const SizedBox(height: 16),
          TextField(
            decoration: InputDecoration(
              labelText: 'Email address',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusM),
              ),
            ),
            controller: TextEditingController(text: 'rishabh.sharma2012@gmail.com'),
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
                  'I allow MyWasiyat to fetch my credit report from experian and CRIF report. This will help us track your wealth and keep your will up-to-date',
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
