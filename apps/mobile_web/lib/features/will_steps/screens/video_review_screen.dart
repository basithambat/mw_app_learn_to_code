import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../services/arrangements_service.dart';

class VideoReviewScreen extends StatefulWidget {
  final String willId;
  final File videoFile;

  const VideoReviewScreen({
    Key? key,
    required this.willId,
    required this.videoFile,
  }) : super(key: key);

  @override
  State<VideoReviewScreen> createState() => _VideoReviewScreenState();
}

class _VideoReviewScreenState extends State<VideoReviewScreen> {
  late VideoPlayerController _videoController;
  final _arrangementsService = ArrangementsService();
  bool _isPlaying = false;
  bool _isInitialized = false;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  Future<void> _initializeVideo() async {
    _videoController = VideoPlayerController.file(widget.videoFile);
    try {
      await _videoController.initialize();
      setState(() {
        _isInitialized = true;
      });
      _videoController.addListener(() {
        if (mounted) {
          setState(() {
            _isPlaying = _videoController.value.isPlaying;
          });
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading video: ${e.toString()}')),
        );
      }
    }
  }

  @override
  void dispose() {
    _videoController.dispose();
    super.dispose();
  }

  void _togglePlay() {
    if (_videoController.value.isPlaying) {
      _videoController.pause();
    } else {
      _videoController.play();
    }
  }

  Future<void> _uploadVideo() async {
    setState(() => _isUploading = true);

    try {
      if (!widget.willId.startsWith('demo-')) {
        await _arrangementsService.uploadConsentVideo(widget.willId, widget.videoFile);
      }
      
      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upload video: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Review Video',
          style: GoogleFonts.frankRuhlLibre(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Stack(
                alignment: Alignment.center,
                children: [
                   _isInitialized 
                      ? AspectRatio(
                          aspectRatio: _videoController.value.aspectRatio,
                          child: VideoPlayer(_videoController),
                        )
                      : const Center(child: CircularProgressIndicator()),
                  
                  if (_isInitialized)
                    GestureDetector(
                      onTap: _togglePlay,
                      child: Container(
                        color: Colors.transparent,
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.4),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _isPlaying ? Icons.pause : Icons.play_arrow,
                              size: 48,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.black,
              ),
              child: Column(
                children: [
                  PrimaryButton(
                    text: 'Confirm & Upload',
                    onPressed: _isUploading ? null : _uploadVideo,
                    isLoading: _isUploading,
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: _isUploading ? null : () => Navigator.pop(context, false),
                    child: Text(
                      'Retake Video',
                      style: GoogleFonts.lato(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
