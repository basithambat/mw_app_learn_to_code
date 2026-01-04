import '../../../core/utils/api_client.dart';

class AssetsService {
  final ApiClient _apiClient = ApiClient();
  
  Future<List<dynamic>> getAssets(String willId, {String? category}) async {
    try {
      final response = await _apiClient.get(
        '/wills/$willId/assets',
        queryParameters: category != null ? {'category': category} : null,
      );
      final data = _apiClient.extractData(response) ?? response.data;
      return data is List ? data : [];
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> addAsset(String willId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post('/wills/$willId/assets', data: data);
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createAsset(String willId, Map<String, dynamic> data) async {
    return addAsset(willId, data);
  }

  Future<Map<String, dynamic>> updateAsset(String willId, String assetId, Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.patch('/wills/$willId/assets/$assetId', data: data);
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteAsset(String willId, String assetId) async {
    try {
      await _apiClient.delete('/wills/$willId/assets/$assetId');
    } catch (e) {
      rethrow;
    }
  }
}
