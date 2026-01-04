import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/progress_stepper.dart';
import '../../../core/routes/app_routes.dart';
import '../services/will_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _willService = WillService();
  Map<String, dynamic>? _will;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadWill();
  }

  Future<void> _loadWill() async {
    try {
      final wills = await _willService.getAllWills();
      if (wills.isNotEmpty) {
        setState(() {
          _will = wills[0];
          _isLoading = false;
        });
      } else {
        // Create new will
        final newWill = await _willService.createWill({
          'title': 'My Will',
          'personalLaw': 'UNKNOWN',
        });
        setState(() {
          _will = newWill;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  List<StepData> _getSteps() {
    if (_will == null) return [];

    return [
      StepData(
        title: 'Basic Information',
        subtitle: 'Personal details and religion',
        status: _getStepStatus(_will!['stepBasicInfo']),
      ),
      StepData(
        title: 'Family & Inheritance',
        subtitle: 'Family members and distribution',
        status: _getStepStatus(_will!['stepFamily']),
      ),
      StepData(
        title: 'Will Arrangements',
        subtitle: 'Executor, witnesses, signature',
        status: _getStepStatus(_will!['stepArrangements']),
      ),
      StepData(
        title: 'Assets (Optional)',
        subtitle: 'Properties and investments',
        status: _getStepStatus(_will!['stepAssets']),
      ),
    ];
  }

  StepStatus _getStepStatus(String? status) {
    switch (status) {
      case 'COMPLETED':
        return StepStatus.completed;
      case 'IN_PROGRESS':
        return StepStatus.inProgress;
      case 'NEEDS_ATTENTION':
        return StepStatus.needsAttention;
      default:
        return StepStatus.notStarted;
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
      appBar: AppBar(
        title: const Text('My Will'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacingM),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Create Your Will',
              style: Theme.of(context).textTheme.displaySmall,
            ),
            const SizedBox(height: AppTheme.spacingM),
            Text(
              'Follow these steps to create your legally valid will',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: AppTheme.spacingXL),
            ProgressStepper(
              steps: _getSteps(),
              currentStep: _getCurrentStep(),
              onStepTap: (index) {
                switch (index) {
                  case 0:
                    Navigator.pushNamed(context, AppRoutes.basicInfo, arguments: _will!['id']);
                    break;
                  case 1:
                    Navigator.pushNamed(context, AppRoutes.family, arguments: _will!['id']);
                    break;
                  case 2:
                    Navigator.pushNamed(context, AppRoutes.arrangements, arguments: _will!['id']);
                    break;
                  case 3:
                    Navigator.pushNamed(context, AppRoutes.assets, arguments: _will!['id']);
                    break;
                  default:
                    break;
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  int _getCurrentStep() {
    if (_will == null) return 0;
    final steps = ['stepBasicInfo', 'stepFamily', 'stepArrangements', 'stepAssets'];
    for (int i = 0; i < steps.length; i++) {
      if (_will![steps[i]] != 'COMPLETED') return i;
    }
    return steps.length - 1;
  }
}
