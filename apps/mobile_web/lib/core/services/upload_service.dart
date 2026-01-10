import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import '../utils/api_client.dart';

class UploadService {
  final _apiClient = ApiClient();

  /// Uploads a photo to the backend and returns the URL.
  Future<String?> uploadPhoto(XFile file) async {
    try {
      final bytes = await file.readAsBytes();
      final fileName = file.name;
      
      final multipartFile = MultipartFile.fromBytes(
        bytes,
        filename: fileName,
      );

      final formData = FormData.fromMap({
        'file': multipartFile,
      });

      final response = await _apiClient.post('/upload/photo', data: formData);
      final data = _apiClient.extractData(response);
      
      if (data != null && data['url'] != null) {
        return data['url'];
      }
      return null;
    } catch (e) {
      // Re-throw so UI can handle it
      throw e;
    }
  }
}
