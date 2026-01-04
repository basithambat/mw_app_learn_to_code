import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum StepStatus {
  notStarted,
  inProgress,
  completed,
  needsAttention,
}

class ProgressStepper extends StatelessWidget {
  final List<StepData> steps;
  final int currentStep;
  final Function(int)? onStepTap;

  const ProgressStepper({
    Key? key,
    required this.steps,
    required this.currentStep,
    this.onStepTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: steps.asMap().entries.map((entry) {
        final index = entry.key;
        final step = entry.value;
        final isActive = index == currentStep;
        final isCompleted = index < currentStep;
        final status = step.status;

        return InkWell(
          onTap: onStepTap != null ? () => onStepTap!(index) : null,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            child: Row(
              children: [
                // Step indicator
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _getStepColor(status, isActive, isCompleted),
                    border: Border.all(
                      color: _getStepBorderColor(status, isActive, isCompleted),
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.check, color: Colors.white, size: 20)
                        : Text(
                            '${index + 1}',
                            style: TextStyle(
                              color: _getStepTextColor(status, isActive, isCompleted),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 16),
                // Step content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step.title,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: _getStepTextColor(status, isActive, isCompleted),
                              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                            ),
                      ),
                      if (step.subtitle != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          step.subtitle!,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ],
                  ),
                ),
                // Status indicator
                if (status == StepStatus.needsAttention)
                  const Icon(Icons.warning, color: Colors.orange, size: 20),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Color _getStepColor(StepStatus status, bool isActive, bool isCompleted) {
    if (status == StepStatus.needsAttention) return Colors.orange;
    if (isCompleted) return AppTheme.successColor;
    if (isActive) return AppTheme.primaryColor;
    return Colors.grey[300]!;
  }

  Color _getStepBorderColor(StepStatus status, bool isActive, bool isCompleted) {
    if (status == StepStatus.needsAttention) return Colors.orange;
    if (isCompleted) return AppTheme.successColor;
    if (isActive) return AppTheme.primaryColor;
    return Colors.grey[400]!;
  }

  Color _getStepTextColor(StepStatus status, bool isActive, bool isCompleted) {
    if (status == StepStatus.needsAttention) return Colors.orange;
    if (isCompleted || isActive) return AppTheme.textPrimary;
    return AppTheme.textSecondary;
  }
}

class StepData {
  final String title;
  final String? subtitle;
  final StepStatus status;

  StepData({
    required this.title,
    this.subtitle,
    this.status = StepStatus.notStarted,
  });
}
