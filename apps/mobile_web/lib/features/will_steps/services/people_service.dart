import '../../../core/utils/api_client.dart';

class PeopleService {
  final ApiClient _apiClient = ApiClient();

  Future<List<dynamic>> getPeople(String willId) async {
    try {
      final response = await _apiClient.get('/wills/$willId/people');
      final data = _apiClient.extractData(response);
      if (data is List) return data;
      if (response.data is List) return response.data;
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> addPerson(String willId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post('/wills/$willId/people', data: data);
      final resData = _apiClient.extractData(response);
      if (resData is Map<String, dynamic>) return resData;
      if (response.data is Map<String, dynamic>) return response.data;
      return {};
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updatePerson(String willId, String personId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.patch('/wills/$willId/people/$personId', data: data);
      final resData = _apiClient.extractData(response);
      if (resData is Map<String, dynamic>) return resData;
      if (response.data is Map<String, dynamic>) return response.data;
      return {};
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
      final resData = _apiClient.extractData(response);
      if (resData is Map<String, dynamic>) return resData;
      if (response.data is Map<String, dynamic>) return response.data;
      return {};
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> assignGuardiansBulk(String willId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post('/wills/$willId/people/guardians/bulk', data: data);
      final list = _apiClient.extractData(response);
      if (list is List) return list;
      if (response.data is List) return response.data;
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getGuardians(String willId) async {
    try {
      final response = await _apiClient.get('/wills/$willId/people/guardians');
      final data = _apiClient.extractData(response);
      if (data is List) return data;
      if (response.data is List) return response.data;
      return [];
    } catch (e) {
      rethrow;
    }
  }
}
