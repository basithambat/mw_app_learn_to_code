import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:flutter_dotenv/flutter_dotenv.dart';

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
  
  static String get baseUrl {
    // 1. If Web, always use localhost or specific env var
    if (kIsWeb) {
      return dotenv.get('API_URL_WEB', fallback: 'http://localhost:3000/api');
    } 
    
    // 2. If Android Emulator, use the standard loopback IP
    if (Platform.isAndroid) {
      // Heuristic: If running in debug mode on Android, default to 10.0.2.2
      // unless an explicit ENV var is set.
      return dotenv.get('API_URL_ANDROID', fallback: 'http://10.0.2.2:3000/api');
    }
    
    // 3. For iOS simulator or physical devices, read from .env
    // Developers must create a .env file with API_URL=http://<YOUR_LOCAL_IP>:3000/api
    return dotenv.get('API_URL', fallback: 'http://localhost:3000/api');
  }

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Add logging interceptor for debugging
    _dio.interceptors.add(LogInterceptor(
      requestHeader: true,
      requestBody: true,
      responseBody: true,
      responseHeader: false,
      error: true,
      logPrint: (obj) {
        if (kIsWeb) {
          print(obj);
        } else {
          debugPrint(obj.toString());
        }
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
          if (kIsWeb) {
            print('🔑 Token attached to request: ${token.substring(0, 20)}...');
          } else {
            debugPrint('🔑 Token attached to request: ${token.substring(0, 20)}...');
          }
        } else {
          if (kIsWeb) {
            print('⚠️ No auth token found in SharedPreferences');
          } else {
            debugPrint('⚠️ No auth token found in SharedPreferences');
          }
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        // Enhanced error handling with better logging
        if (error.response != null) {
          final statusCode = error.response!.statusCode;
          final data = error.response!.data;
          
          // Log detailed error information
          if (kIsWeb) {
            print('❌ API Error - Status: $statusCode');
            print('❌ Response Data: $data');
            print('❌ Request Path: ${error.requestOptions.path}');
            print('❌ Request Headers: ${error.requestOptions.headers}');
          } else {
            debugPrint('❌ API Error - Status: $statusCode');
            debugPrint('❌ Response Data: $data');
            debugPrint('❌ Request Path: ${error.requestOptions.path}');
            debugPrint('❌ Request Headers: ${error.requestOptions.headers}');
          }
          
          String message = 'An error occurred';
          if (data is Map<String, dynamic>) {
            final dynamic rawMessage = data['message'] ?? data['error'];
            if (rawMessage is List) {
              message = rawMessage.first.toString();
            } else if (rawMessage != null) {
              message = rawMessage.toString();
            }
            
            if (data['errors'] is List && (data['errors'] as List).isNotEmpty) {
              message = (data['errors'] as List).first.toString();
            }
          } else if (data is String) {
            message = data;
          }
          
          // Special handling for 401 Unauthorized
          if (statusCode == 401) {
            message = 'Unauthorized: Please login again. ${message.isNotEmpty ? "($message)" : ""}';
          }

          return handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              response: error.response,
              type: DioExceptionType.badResponse,
              error: ApiException(message, statusCode: statusCode, data: data),
            ),
          );
        } else {
          // Network or other errors
          String message = error.message ?? 'Network error occurred';
          if (kIsWeb) {
            print('❌ Network Error: $message');
          } else {
            debugPrint('❌ Network Error: $message');
          }
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
