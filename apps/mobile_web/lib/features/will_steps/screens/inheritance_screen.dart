import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/inheritance_service.dart';

class InheritanceScreen extends StatefulWidget {
  final String? willId;

  const InheritanceScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<InheritanceScreen> createState() => _InheritanceScreenState();
}

class _InheritanceScreenState extends State<InheritanceScreen> {
  final _inheritanceService = InheritanceService();
  List<dynamic> _scenarios = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadScenarios();
  }

  Future<void> _loadScenarios() async {
    if (widget.willId == null) {
      setState(() => _isLoading = false);
      return;
    }
    try {
      final scenarios = await _inheritanceService.getScenarios(widget.willId!);
      setState(() {
        _scenarios = scenarios;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Inheritance Distribution')),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacingM),
        children: [
          Text(
            'Distribution Scenarios',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacingM),
          ...['USER_DIES_FIRST', 'SPOUSE_DIES_FIRST', 'NO_ONE_SURVIVES'].map((type) {
            final scenario = _scenarios.firstWhere(
              (s) => s['type'] == type,
              orElse: () => null,
            );
            return Card(
              child: ListTile(
                title: Text(_getScenarioTitle(type)),
                subtitle: scenario != null ? const Text('Configured') : const Text('Not configured'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () {
                  // Navigate to scenario editor
                },
              ),
            );
          }),
        ],
      ),
    );
  }

  String _getScenarioTitle(String type) {
    switch (type) {
      case 'USER_DIES_FIRST':
        return 'If I die before my spouse';
      case 'SPOUSE_DIES_FIRST':
        return 'If my spouse dies before me';
      case 'NO_ONE_SURVIVES':
        return 'If no one from my family survives';
      default:
        return type;
    }
  }
}
