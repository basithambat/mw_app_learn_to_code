import '../../../core/utils/api_client.dart';

class AssetsService {
  final ApiClient _apiClient = ApiClient();
  
  Future<List<dynamic>> getAssets(String willId, {String? category}) async {
    final response = await _apiClient.get(
      '/wills/$willId/assets',
      queryParameters: category != null ? {'category': category} : null,
    );
    return response.data;
  }

  Future<Map<String, dynamic>> addAsset(String willId, Map<String, dynamic> data) async {
    final response = await _apiClient.post('/wills/$willId/assets', data: data);
    return response.data;
  }

  Future<Map<String, dynamic>> updateAsset(String willId, String assetId, Map<String, dynamic> data) async {
    final response = await _apiClient.patch('/wills/$willId/assets/$assetId', data: data);
    return response.data;
  }

  Future<void> deleteAsset(String willId, String assetId) async {
    await _apiClient.delete('/wills/$willId/assets/$assetId');
  }
}
