import '../../../core/utils/api_client.dart';

class InheritanceService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> createScenario(
    String willId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _apiClient.post(
        '/wills/$willId/inheritance/scenarios',
        data: data,
      );
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getScenarios(String willId) async {
    try {
      final response = await _apiClient.get('/wills/$willId/inheritance/scenarios');
      final data = _apiClient.extractData(response) ?? response.data;
      return data is List ? data : [];
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updateScenario(
    String willId,
    String scenarioId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _apiClient.patch(
        '/wills/$willId/inheritance/scenarios/$scenarioId',
        data: data,
      );
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteScenario(String willId, String scenarioId) async {
    try {
      await _apiClient.delete('/wills/$willId/inheritance/scenarios/$scenarioId');
    } catch (e) {
      rethrow;
    }
  }
}
