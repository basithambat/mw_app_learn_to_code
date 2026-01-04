import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/utils/api_client.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> sendOtp(String phone) async {
    try {
      final response = await _apiClient.post('/auth/otp/send', data: {'phone': phone});
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    try {
      final response = await _apiClient.post('/auth/otp/verify', data: {
        'phone': phone,
        'otp': otp,
      });

      final data = _apiClient.extractData(response) ?? response.data;
      
      if (data['accessToken'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', data['accessToken']);
        if (data['user'] != null && data['user']['id'] != null) {
          await prefs.setString('user_id', data['user']['id']);
        }
      }

      return data;
    } catch (e) {
      rethrow;
    }
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

  Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }
}
