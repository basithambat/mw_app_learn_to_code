import '../../../core/utils/api_client.dart';
import 'package:dio/dio.dart';
import 'dart:io';

class ArrangementsService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> assignExecutor(
    String willId,
    String personId,
  ) async {
    try {
      final response = await _apiClient.post(
        '/wills/$willId/executor',
        data: {'personId': personId},
      );
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> addWitness(
    String willId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _apiClient.post(
        '/wills/$willId/witnesses',
        data: data,
      );
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getExecutors(String willId) async {
    try {
      final response = await _apiClient.get('/wills/$willId/executor');
      final data = _apiClient.extractData(response) ?? response.data;
      if (data is List) return data;
      if (data is Map && data['executorAssignments'] != null) {
        return data['executorAssignments'] is List ? data['executorAssignments'] : [];
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getWitnesses(String willId) async {
    try {
      final response = await _apiClient.get('/wills/$willId/witnesses');
      final data = _apiClient.extractData(response) ?? response.data;
      return data is List ? data : [];
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> uploadSignature(
    String willId,
    File signatureFile,
  ) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(signatureFile.path),
      });
      
      final response = await _apiClient.post(
        '/wills/$willId/signature',
        data: formData,
      );
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> uploadConsentVideo(
    String willId,
    File videoFile,
  ) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(videoFile.path),
      });
      
      final response = await _apiClient.post(
        '/wills/$willId/consent-video',
        data: formData,
      );
      return _apiClient.extractData(response) ?? response.data;
    } catch (e) {
      rethrow;
    }
  }
}
