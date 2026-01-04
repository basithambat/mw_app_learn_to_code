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

  /// Mock login for development/testing
  /// Calls backend dev endpoint to get a real JWT token
  /// Phone: 7042063370, OTP: 278823
  Future<void> mockLogin() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Check if already logged in
    final existingToken = prefs.getString('auth_token');
    if (existingToken != null) {
      return; // Already logged in
    }

    try {
      // Call backend dev endpoint to get real JWT token
      final response = await _apiClient.post('/auth/dev/mock-login', data: {
        'phone': '7042063370',
        'otp': '278823',
      });

      final data = _apiClient.extractData(response) ?? response.data;
      
      if (data['accessToken'] != null) {
        await prefs.setString('auth_token', data['accessToken']);
        if (data['user'] != null && data['user']['id'] != null) {
          await prefs.setString('user_id', data['user']['id']);
        }
        if (data['user'] != null && data['user']['phone'] != null) {
          await prefs.setString('user_phone', data['user']['phone']);
        }
      }
    } catch (e) {
      // If backend is not available, fall back to demo mode
      // This allows the app to work offline
      print('⚠️ Backend not available for mock login, using demo mode');
    }
  }

  /// Check if mock credentials match
  bool isMockCredentials(String phone, String otp) {
    return phone == '7042063370' && otp == '278823';
  }

  /// Auto-login with mock credentials if they match
  Future<Map<String, dynamic>> verifyOtpWithMock(String phone, String otp) async {
    // If mock credentials, use mock login
    if (isMockCredentials(phone, otp)) {
      await mockLogin();
      return {
        'accessToken': 'mock_jwt_token_7042063370_278823',
        'user': {
          'id': 'mock_user_7042063370',
          'phone': phone,
        },
      };
    }
    
    // Otherwise, use real API
    return await verifyOtp(phone, otp);
  }
}
