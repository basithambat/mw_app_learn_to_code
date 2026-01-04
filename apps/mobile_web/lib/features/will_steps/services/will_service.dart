import '../../../core/utils/api_client.dart';

class WillService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> createWill(Map<String, dynamic> data) async {
    final response = await _apiClient.post('/wills', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> getWill(String willId) async {
    final response = await _apiClient.get('/wills/$willId');
    return response.data;
  }

  Future<List<dynamic>> getAllWills() async {
    final response = await _apiClient.get('/wills');
    return response.data;
  }

  Future<Map<String, dynamic>> updateWill(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.patch('/wills/$willId', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> updateBasicInfo(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.patch('/wills/$willId/basic-info', data: data);
    return response.data;
  }
}
