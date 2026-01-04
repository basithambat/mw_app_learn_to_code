import '../../../core/utils/api_client.dart';

class AssistantService {
  final ApiClient _apiClient = ApiClient();
  
  Future<Map<String, dynamic>> query(String question, {String? willId, Map<String, dynamic>? context}) async {
    try {
      final response = await _apiClient.post('/assistant/query', data: {
        'question': question,
        'willId': willId,
        'context': context,
      });
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> escalate(String reason, {String? willId, String? question}) async {
    try {
      final response = await _apiClient.post('/assistant/escalate', data: {
        'reason': reason,
        'willId': willId,
        'question': question,
      });
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }
}
