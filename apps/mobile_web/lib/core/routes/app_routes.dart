import 'package:flutter/material.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/services/auth_service.dart';
import '../../features/onboarding/screens/splash_screen_1.dart';
import '../../features/onboarding/screens/splash_screen_2.dart';
import '../../features/onboarding/screens/splash_screen_3.dart';
import '../../features/onboarding/screens/figma_splash_screen_1.dart';
import '../../features/onboarding/screens/figma_splash_screen_2.dart';
import '../../features/onboarding/screens/figma_splash_screen_3.dart';
import '../../features/onboarding/screens/animated_splash_screen.dart';
import '../../features/onboarding/screens/onboarding_flow_screen.dart';
import '../../features/will_steps/screens/dashboard_screen.dart';
import '../../features/will_steps/screens/basic_info_screen.dart';
import '../../features/will_steps/screens/family_screen.dart';
import '../../features/will_steps/screens/inheritance_screen.dart';
import '../../features/will_steps/screens/arrangements_screen.dart';
import '../../features/assets/screens/assets_screen.dart';
import '../../features/legal_assistant/screens/assistant_screen.dart';
import '../../features/will_steps/screens/add_spouse_screen.dart';
import '../../features/will_steps/screens/add_child_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String splash1 = '/splash/1';
  static const String splash2 = '/splash/2';
  static const String splash3 = '/splash/3';
  static const String login = '/login';
  static const String onboarding = '/onboarding';
  static const String dashboard = '/dashboard';
  static const String basicInfo = '/basic-info';
  static const String family = '/family';
  static const String inheritance = '/inheritance';
  static const String arrangements = '/arrangements';
  static const String assets = '/assets';
  static const String assistant = '/assistant';
  static const String addSpouse = '/add-spouse';
  static const String addChild = '/add-child';

        static Map<String, WidgetBuilder> get routes {
    return {
      splash: (context) => const AnimatedSplashScreen(),
      splash1: (context) => const AnimatedSplashScreen(),
      splash2: (context) => const AnimatedSplashScreen(),
      splash3: (context) => const AnimatedSplashScreen(),
      login: (context) => const LoginScreen(),
      onboarding: (context) => const OnboardingFlowScreen(),
      dashboard: (context) {
        final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
        return DashboardScreen(onboardingCompleted: args?['onboardingCompleted'] == true);
      },
      basicInfo: (context) {
        final willId = ModalRoute.of(context)?.settings.arguments as String?;
        // Use onboarding flow instead of basic info screen
        if (willId != null) {
          return OnboardingFlowScreen();
        }
        return BasicInfoScreen(willId: willId);
      },
      family: (context) {
        final willId = ModalRoute.of(context)?.settings.arguments as String?;
        return FamilyScreen(willId: willId);
      },
      inheritance: (context) {
        final willId = ModalRoute.of(context)?.settings.arguments as String?;
        return InheritanceScreen(willId: willId);
      },
      arrangements: (context) {
        final willId = ModalRoute.of(context)?.settings.arguments as String?;
        return ArrangementsScreen(willId: willId);
      },
      assets: (context) {
        final willId = ModalRoute.of(context)?.settings.arguments as String?;
        return AssetsScreen(willId: willId);
      },
      assistant: (context) {
        final willId = ModalRoute.of(context)?.settings.arguments as String?;
        return AssistantScreen(willId: willId);
      },
      addSpouse: (context) {
        final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
        return AddSpouseScreen(
          willId: args?['willId'] as String?,
          existingSpouse: args?['existingSpouse'] as Map<String, dynamic>?,
        );
      },
      addChild: (context) {
        final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
        return AddChildScreen(
          willId: args?['willId'] as String?,
          childNumber: args?['childNumber'] as int? ?? 1,
          existingChild: args?['existingChild'] as Map<String, dynamic>?,
        );
      },
    };
  }
}
