import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_routes.dart';
import 'features/auth/services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Auto-login with mock credentials on app startup
  final authService = AuthService();
  await authService.mockLogin();
  
  runApp(const MywasiyatApp());
}

class MywasiyatApp extends StatelessWidget {
  const MywasiyatApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mywasiyat',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      initialRoute: AppRoutes.dashboard, // Temporarily skip login/splash
      routes: AppRoutes.routes,
    );
  }
}
