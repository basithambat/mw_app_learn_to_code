import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException(this.message, {this.statusCode, this.data});

  @override
  String toString() => message;
}

class ApiClient {
  late Dio _dio;
  static const String baseUrl = 'http://localhost:3000/api'; // Updated to include /api prefix

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        // Handle error responses
        if (error.response != null) {
          final statusCode = error.response!.statusCode;
          final data = error.response!.data;
          
          String message = 'An error occurred';
          if (data is Map<String, dynamic>) {
            message = data['message'] ?? 
                     (data['errors'] is List && (data['errors'] as List).isNotEmpty
                         ? (data['errors'] as List).first.toString()
                         : message);
          } else if (data is String) {
            message = data;
          }

          return handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              response: error.response,
              type: DioExceptionType.badResponse,
              error: ApiException(message, statusCode: statusCode, data: data),
            ),
          );
        }
        return handler.next(error);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  Future<Response> patch(String path, {dynamic data}) {
    return _dio.patch(path, data: data);
  }

  Future<Response> delete(String path) {
    return _dio.delete(path);
  }

  // Helper method to extract data from response
  dynamic extractData(Response response) {
    final data = response.data;
    // Backend returns {success: true, data: ...} format
    if (data is Map<String, dynamic> && data.containsKey('data')) {
      return data['data'];
    }
    return data;
  }
}
