import '../../../core/utils/api_client.dart';

class WillService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> createWill(Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post('/wills', data: data);
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getWill(String willId) async {
    try {
      final response = await _apiClient.get('/wills/$willId');
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getAllWills() async {
    try {
      final response = await _apiClient.get('/wills');
      final data = _apiClient.extractData(response) ?? response.data;
      return data is List ? data : [];
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updateWill(String willId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.patch('/wills/$willId', data: data);
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updateBasicInfo(String willId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.patch('/wills/$willId/basic-info', data: data);
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }
}
