import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/routes/app_routes.dart';

class FloatingAssistantButton extends StatelessWidget {
  final String? willId;

  const FloatingAssistantButton({
    Key? key,
    this.willId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () {
        Navigator.pushNamed(
          context,
          AppRoutes.assistant,
          arguments: willId,
        );
      },
      backgroundColor: AppTheme.primaryColor,
      foregroundColor: Colors.white,
      child: const Icon(Icons.help_outline, size: 24),
      elevation: 4,
      shape: const CircleBorder(),
    );
  }
}
