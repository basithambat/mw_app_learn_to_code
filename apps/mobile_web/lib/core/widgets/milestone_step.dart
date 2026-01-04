import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'edit_button.dart';

/// Milestone step widget for dashboard
/// Matches React WillMilestonesDashboard design
class MilestoneStep extends StatelessWidget {
  final int stepNumber;
  final String title;
  final String description;
  final bool isCompleted;
  final bool isCurrent;
  final VoidCallback? onEdit;
  final Widget? child; // Custom content for completed state

  const MilestoneStep({
    Key? key,
    required this.stepNumber,
    required this.title,
    required this.description,
    this.isCompleted = false,
    this.isCurrent = false,
    this.onEdit,
    this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon/Badge
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isCompleted || isCurrent
                    ? AppTheme.primaryColor
                    : AppTheme.primaryLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: isCompleted
                  ? const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 20,
                    )
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
            ),
            const SizedBox(width: 24),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title,
                        style: GoogleFonts.lato(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      if (isCompleted && onEdit != null)
                        EditButton(
                          label: 'Edit',
                          onPressed: onEdit,
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  SizedBox(
                    width: 216, // w-[216px] from React
                    child: child ??
                        Text(
                          description,
                          style: GoogleFonts.lato(
                            fontSize: 14,
                            color: AppTheme.textSecondary,
                            height: 1.43,
                          ),
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
