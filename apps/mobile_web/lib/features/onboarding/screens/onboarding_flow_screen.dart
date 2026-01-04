import 'package:flutter/material.dart';
import 'onboarding_name_screen.dart';
import 'onboarding_dob_screen.dart';
import 'onboarding_spouse_screen.dart';
import 'onboarding_children_screen.dart';
import 'onboarding_minors_screen.dart';
import 'onboarding_assets_screen.dart';
import '../../../core/routes/app_routes.dart';
import '../../will_steps/services/will_service.dart';

/// Onboarding Flow Screen - Manages the multi-step onboarding process
/// Matches React App.tsx onboarding flow
class OnboardingFlowScreen extends StatefulWidget {
  const OnboardingFlowScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingFlowScreen> createState() => _OnboardingFlowScreenState();
}

class _OnboardingFlowScreenState extends State<OnboardingFlowScreen> {
  final _willService = WillService();
  
  // Store user data through the flow
  String _userName = '';
  String _gender = '';
  Map<String, dynamic> _dob = {};
  bool? _hasSpouse;
  bool? _hasChildren;
  bool? _hasMinors;
  List<String> _selectedAssets = [];
  String? _willId;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _initializeWill();
  }

  Future<void> _initializeWill() async {
    try {
      // Get or create a will
      final wills = await _willService.getAllWills();
      if (wills.isNotEmpty) {
        setState(() {
          _willId = wills[0]['id'];
        });
      } else {
        // Create new will
        final newWill = await _willService.createWill({
          'title': 'My Will',
          'personalLaw': 'UNKNOWN',
        });
        setState(() {
          _willId = newWill['id'];
        });
      }
    } catch (e) {
      // If API fails, create demo will ID
      setState(() {
        _willId = 'demo-will-id';
      });
    }
  }

  void _handleNameContinue(String name, String gender) {
    setState(() {
      _userName = name;
      _gender = gender;
    });
    // Navigate to DOB screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OnboardingDOBScreen(
          userName: _userName,
          onContinue: _handleDOBContinue,
          onBack: () => Navigator.pop(context),
        ),
      ),
    );
  }

  void _handleDOBContinue({required int day, required int month, required int year}) {
    setState(() {
      _dob = {'day': day, 'month': month, 'year': year};
    });
    // Navigate to Spouse screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OnboardingSpouseScreen(
          userName: _userName,
          onContinue: _handleSpouseContinue,
          onBack: () => Navigator.pop(context),
        ),
      ),
    );
  }

  void _handleSpouseContinue(bool hasSpouse) {
    setState(() {
      _hasSpouse = hasSpouse;
    });
    // Navigate to Children screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OnboardingChildrenScreen(
          userName: _userName,
          onContinue: _handleChildrenContinue,
          onBack: () => Navigator.pop(context),
        ),
      ),
    );
  }

  void _handleChildrenContinue(bool hasChildren) {
    setState(() {
      _hasChildren = hasChildren;
    });
    // If has children, ask about minors, otherwise skip to assets
    if (hasChildren) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OnboardingMinorsScreen(
            userName: _userName,
            onContinue: _handleMinorsContinue,
            onBack: () => Navigator.pop(context),
          ),
        ),
      );
    } else {
      // Skip to assets
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OnboardingAssetsScreen(
            userName: _userName,
            onContinue: _handleAssetsContinue,
            onBack: () => Navigator.pop(context),
          ),
        ),
      );
    }
  }

  void _handleMinorsContinue(bool hasMinors) {
    setState(() {
      _hasMinors = hasMinors;
    });
    // Navigate to Assets screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OnboardingAssetsScreen(
          userName: _userName,
          onContinue: _handleAssetsContinue,
          onBack: () => Navigator.pop(context),
        ),
      ),
    );
  }

  Future<void> _handleAssetsContinue(List<String> selectedAssets) async {
    setState(() {
      _selectedAssets = selectedAssets;
      _isLoading = true;
    });

    try {
      // Save all onboarding data to backend
      if (_willId != null && !_willId!.startsWith('demo-')) {
        // Determine marital status from hasSpouse
        final maritalStatus = _hasSpouse == true ? 'MARRIED' : 'SINGLE';
        
        // Determine religion/personal law from gender (default to UNKNOWN for now)
        // This should be asked in a later step, but for now we'll use UNKNOWN
        final personalLaw = 'UNKNOWN';
        
        // Format date of birth
        final dateOfBirth = _dob.isNotEmpty
            ? '${_dob['year']}-${_dob['month'].toString().padLeft(2, '0')}-${_dob['day'].toString().padLeft(2, '0')}'
            : null;

        // Save basic info
        await _willService.updateBasicInfo(_willId!, {
          'fullName': _userName,
          'gender': _gender.toUpperCase(),
          'dateOfBirth': dateOfBirth,
          'maritalStatus': maritalStatus,
          'religionLabel': 'Unknown', // Will be asked later
          'personalLaw': personalLaw,
          'previousWillExists': false,
        });
        
        // Mark step 1 as completed
        try {
          await _willService.updateWill(_willId!, {
            'stepBasicInfo': 'COMPLETED',
          });
        } catch (e) {
          // If marking step fails, continue anyway
        }
      }

      // Navigate to dashboard
      if (mounted) {
        Navigator.pushReplacementNamed(
          context,
          AppRoutes.dashboard,
        );
      }
    } catch (e) {
      // Even if API fails, navigate to dashboard (demo mode)
      // In demo mode, we'll pass a flag to dashboard to mark step 1 as completed
      if (mounted) {
        Navigator.pushReplacementNamed(
          context,
          AppRoutes.dashboard,
          arguments: {'onboardingCompleted': true},
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // Start with the name screen
    return OnboardingNameScreen(
      onContinue: _handleNameContinue,
    );
  }
}
