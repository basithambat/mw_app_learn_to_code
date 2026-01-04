import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/utils/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> sendOtp(String phone) async {
    final response = await _apiClient.post('/auth/otp/send', data: {'phone': phone});
    return response.data;
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final response = await _apiClient.post('/auth/otp/verify', data: {
      'phone': phone,
      'otp': otp,
    });

    if (response.data['accessToken'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', response.data['accessToken']);
      await prefs.setString('user_id', response.data['user']['id']);
    }

    return response.data;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_id');
  }

  Future<bool> isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token') != null;
  }
}
