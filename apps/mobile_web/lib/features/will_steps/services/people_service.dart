import '../../../core/utils/api_client.dart';

class PeopleService {
  final ApiClient _apiClient = ApiClient();

  Future<List<dynamic>> getPeople(String willId) async {
    try {
      final response = await _apiClient.get('/wills/$willId/people');
      final data = _apiClient.extractData(response) ?? response.data;
      return data is List ? data : [];
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> addPerson(String willId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post('/wills/$willId/people', data: data);
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updatePerson(String willId, String personId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.patch('/wills/$willId/people/$personId', data: data);
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deletePerson(String willId, String personId) async {
    try {
      await _apiClient.delete('/wills/$willId/people/$personId');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> assignGuardian(String willId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post('/wills/$willId/people/guardians', data: data);
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getGuardians(String willId) async {
    try {
      final response = await _apiClient.get('/wills/$willId/people/guardians');
      final data = _apiClient.extractData(response) ?? response.data;
      return data is List ? data : [];
    } catch (e) {
      rethrow;
    }
  }
}
