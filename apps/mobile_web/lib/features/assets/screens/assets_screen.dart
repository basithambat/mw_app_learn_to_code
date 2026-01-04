import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/assets_service.dart';

class AssetsScreen extends StatefulWidget {
  final String? willId;

  const AssetsScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<AssetsScreen> createState() => _AssetsScreenState();
}

class _AssetsScreenState extends State<AssetsScreen> {
  final _assetsService = AssetsService();
  List<dynamic> _assets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAssets();
  }

  Future<void> _loadAssets() async {
    if (widget.willId == null) {
      setState(() => _isLoading = false);
      return;
    }
    try {
      final assets = await _assetsService.getAssets(widget.willId!);
      setState(() {
        _assets = assets;
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
      appBar: AppBar(title: const Text('Assets & Properties')),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacingM),
        children: [
          Text(
            'Your Assets',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacingM),
          ..._assets.map((asset) => Card(
                child: ListTile(
                  title: Text(asset['title'] ?? 'Asset'),
                  subtitle: Text('${asset['category']} - ${asset['ownershipType']}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.edit),
                    onPressed: () {
                      // Edit asset
                    },
                  ),
                ),
              )),
          const SizedBox(height: AppTheme.spacingM),
          PrimaryButton(
            text: 'Add Asset',
            onPressed: () {
              // Show add asset dialog
            },
          ),
        ],
      ),
    );
  }
}
