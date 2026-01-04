import '../../../core/utils/api_client.dart';

class PeopleService {
  final ApiClient _apiClient = ApiClient();

  Future<List<dynamic>> getPeople(String willId) async {
    final response = await _apiClient.get('/wills/$willId/people');
    return response.data;
  }

  Future<Map<String, dynamic>> addPerson(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.post('/wills/$willId/people', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> updatePerson(String willId, String personId, Map<String, dynamic> data) async {
    final response = await _apiClient.patch('/wills/$willId/people/$personId', data: data);
    return response.data;
  }

  Future<void> deletePerson(String willId, String personId) async {
    await _apiClient.delete('/wills/$willId/people/$personId');
  }

  Future<Map<String, dynamic>> assignGuardian(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.post('/wills/$willId/people/guardians', data: data);
    return response.data;
  }

  Future<List<dynamic>> getGuardians(String willId) async {
    final response = await _apiClient.get('/wills/$willId/people/guardians');
    return response.data;
  }
}
