import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:camera/camera.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/arrangements_service.dart';
import 'video_review_screen.dart';

class VideoRecordingScreen extends StatefulWidget {
  final String? willId;
  final String userName;

  const VideoRecordingScreen({
    Key? key,
    this.willId,
    required this.userName,
  }) : super(key: key);

  @override
  State<VideoRecordingScreen> createState() => _VideoRecordingScreenState();
}

class _VideoRecordingScreenState extends State<VideoRecordingScreen> {
  CameraController? _controller;
  bool _isRecording = false;
  bool _isInitialized = false;
  final _arrangementsService = ArrangementsService();
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() => _isInitialized = false);
        return;
      }

      _controller = CameraController(
        cameras.first,
        ResolutionPreset.medium,
      );

      await _controller!.initialize();
      setState(() => _isInitialized = true);
    } catch (e) {
      setState(() => _isInitialized = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to initialize camera: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _startRecording() async {
    if (_controller == null || !_controller!.value.isInitialized) return;

    try {
      await _controller!.startVideoRecording();
      setState(() => _isRecording = true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to start recording: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _stopRecording() async {
    if (_controller == null || !_isRecording) return;

    try {
      final XFile videoFile = await _controller!.stopVideoRecording();
      setState(() => _isRecording = false);

      // Navigate to Review Screen
      if (mounted) {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => VideoReviewScreen(
              willId: widget.willId!,
              videoFile: File(videoFile.path),
            ),
          ),
        );

        if (result == true && mounted) {
          Navigator.pop(context, true);
        }
      }
    } catch (e) {
      setState(() => _isRecording = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to stop recording: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final consentText = 'I am ${widget.userName}, and I declare that all the things mentioned are below my knowledge and I am distributing my assets in whole senses, without anyone\'s force. This shall be considered as my last will.';

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Camera preview
            if (_isInitialized && _controller != null)
              SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: CameraPreview(_controller!),
              )
            else
              const Center(
                child: CircularProgressIndicator(),
              ),
            // Consent text overlay
            Positioned(
              bottom: 120,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.7),
                  borderRadius: BorderRadius.circular(AppTheme.radiusM),
                ),
                child: Text(
                  consentText,
                  style: GoogleFonts.lato(
                    fontSize: 14,
                    color: Colors.white,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            // Record button
            Positioned(
              bottom: 20,
              left: 0,
              right: 0,
              child: Center(
                child: GestureDetector(
                  onTapDown: (_) => _startRecording(),
                  onTapUp: (_) => _stopRecording(),
                  onTapCancel: () => _stopRecording(),
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: _isRecording ? Colors.red : AppTheme.primaryColor,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _isRecording ? Icons.stop : Icons.fiber_manual_record,
                      color: Colors.white,
                      size: 40,
                    ),
                  ),
                ),
              ),
            ),
            // Loading overlay
            if (_isUploading)
              Container(
                color: Colors.black.withOpacity(0.5),
                child: const Center(
                  child: CircularProgressIndicator(),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
