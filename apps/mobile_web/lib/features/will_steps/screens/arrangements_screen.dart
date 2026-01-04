import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/arrangements_service.dart';

class ArrangementsScreen extends StatefulWidget {
  final String? willId;

  const ArrangementsScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<ArrangementsScreen> createState() => _ArrangementsScreenState();
}

class _ArrangementsScreenState extends State<ArrangementsScreen> {
  final _arrangementsService = ArrangementsService();
  List<dynamic> _witnesses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadWitnesses();
  }

  Future<void> _loadWitnesses() async {
    if (widget.willId == null) {
      setState(() => _isLoading = false);
      return;
    }
    try {
      final witnesses = await _arrangementsService.getWitnesses(widget.willId!);
      setState(() {
        _witnesses = witnesses;
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
      appBar: AppBar(title: const Text('Will Arrangements')),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacingM),
        children: [
          Text(
            'Executor',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacingM),
          Card(
            child: ListTile(
              title: const Text('Assign Executor'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: () {
                // Navigate to executor selection
              },
            ),
          ),
          const SizedBox(height: AppTheme.spacingXL),
          Text(
            'Witnesses (${_witnesses.length}/2)',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacingM),
          ..._witnesses.map((witness) => Card(
                child: ListTile(
                  title: Text(witness['fullName'] ?? ''),
                  subtitle: Text(witness['email'] ?? ''),
                ),
              )),
          if (_witnesses.length < 2)
            PrimaryButton(
              text: 'Add Witness',
              onPressed: () {
                // Show add witness dialog
              },
            ),
          const SizedBox(height: AppTheme.spacingXL),
          Text(
            'Signature',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacingM),
          PrimaryButton(
            text: 'Upload Signature',
            onPressed: () {
              // Navigate to signature screen
            },
          ),
        ],
      ),
    );
  }
}
