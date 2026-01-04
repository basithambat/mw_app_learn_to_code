import '../../../core/utils/api_client.dart';

class ArrangementsService {
  final ApiClient _apiClient = ApiClient();
  
  Future<Map<String, dynamic>> assignExecutor(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.post('/wills/$willId/executor', data: data);
    return response.data;
  }

  Future<List<dynamic>> getWitnesses(String willId) async {
    final response = await _apiClient.get('/wills/$willId/witnesses');
    return response.data;
  }

  Future<Map<String, dynamic>> addWitness(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.post('/wills/$willId/witnesses', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> uploadSignature(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.post('/wills/$willId/signature', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> acceptDeclaration(String willId) async {
    final response = await _apiClient.post('/wills/$willId/declaration', data: {'accepted': true});
    return response.data;
  }
}
