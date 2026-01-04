import '../../../core/utils/api_client.dart';

class InheritanceService {
  final ApiClient _apiClient = ApiClient();
  
  Future<List<dynamic>> getScenarios(String willId) async {
    final response = await _apiClient.get('/wills/$willId/inheritance/scenarios');
    return response.data;
  }

  Future<Map<String, dynamic>> createScenario(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.post('/wills/$willId/inheritance/scenarios', data: data);
    return response.data;
  }
}
