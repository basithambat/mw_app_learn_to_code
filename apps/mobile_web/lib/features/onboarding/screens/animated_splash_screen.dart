import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'dart:async';
import '../../../core/routes/app_routes.dart';

/// Animated splash screen that transitions through three states:
/// 1. Logo icon only (centered)
/// 2. Logo icon + "mywasiyat" text (moves to left, text fades in)
/// 3. Logo + text + progress bar + tagline (progress bar animates)
class AnimatedSplashScreen extends StatefulWidget {
  const AnimatedSplashScreen({Key? key}) : super(key: key);

  @override
  State<AnimatedSplashScreen> createState() => _AnimatedSplashScreenState();
}

class _AnimatedSplashScreenState extends State<AnimatedSplashScreen>
    with TickerProviderStateMixin {
  // Animation controllers
  late AnimationController _logoController;
  late AnimationController _textController;
  late AnimationController _progressController;
  late AnimationController _taglineController;

  // Animations
  late Animation<double> _logoScale;
  late Animation<double> _logoOpacity;
  late Animation<double> _textOpacity;
  late Animation<double> _progressWidth;
  late Animation<double> _taglineOpacity;

  // State tracking
  int _currentState = 0; // 0: icon only, 1: icon+text, 2: icon+text+progress

  @override
  void initState() {
    super.initState();

    // Logo animation controller (for scale and fade)
    _logoController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    // Text animation controller
    _textController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    // Progress bar animation controller
    _progressController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    // Tagline animation controller
    _taglineController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    // Logo scale animation (bounce in)
    _logoScale = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: Curves.elasticOut,
      ),
    );

    // Logo opacity
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: Curves.easeIn,
      ),
    );

    // Logo position animation (from state 0 position to state 1 position)
    // State 0: 148px, State 1: 80px (difference: -68px)
    // We'll animate the X position directly in the build method

    // Text fade in
    _textOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _textController,
        curve: Curves.easeIn,
      ),
    );

    // Progress bar width animation
    _progressWidth = Tween<double>(begin: 0.0, end: 60.0).animate(
      CurvedAnimation(
        parent: _progressController,
        curve: Curves.easeOut,
      ),
    );

    // Tagline fade in
    _taglineOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _taglineController,
        curve: Curves.easeIn,
      ),
    );

    // Start the animation sequence
    _startAnimationSequence();
  }

  void _startAnimationSequence() {
    // State 0: Show logo icon only (centered)
    _logoController.forward().then((_) {
      // Wait 1 second, then transition to state 1
      Future.delayed(const Duration(milliseconds: 1000), () {
        if (mounted) {
          setState(() => _currentState = 1);
          _textController.forward().then((_) {
            // Wait 1 second, then transition to state 2
            Future.delayed(const Duration(milliseconds: 1000), () {
              if (mounted) {
                setState(() => _currentState = 2);
                _progressController.forward();
                _taglineController.forward().then((_) {
                  // After all animations, wait 1.5 seconds then navigate
                  Future.delayed(const Duration(milliseconds: 1500), () {
                    if (mounted) {
                      Navigator.pushReplacementNamed(context, AppRoutes.login);
                    }
                  });
                });
              }
            });
          });
        }
      });
    });
  }

  @override
  void dispose() {
    _logoController.dispose();
    _textController.dispose();
    _progressController.dispose();
    _taglineController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      body: Container(
        width: screenWidth,
        height: screenHeight,
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topLeft,
            radius: 2.0,
            colors: [
              const Color(0xFF0F361F),
              const Color(0xFF164F2D),
            ],
            stops: const [0.0, 1.0],
          ),
        ),
        child: Stack(
          children: [
            // Ellipse background decoration
            Positioned(
              left: -550.67,
              top: -390.67,
              child: SvgPicture.asset(
                'assets/images/ellipse_background.svg',
                width: 894.67,
                height: 894.67,
                fit: BoxFit.contain,
              ),
            ),
            // Logo + Text Group
            // Position animates from state 0 to state 1
            AnimatedBuilder(
              animation: Listenable.merge([
                _logoController,
                _textController,
              ]),
              builder: (context, child) {
                // Interpolate position between state 0 and state 1
                final state0X = (screenWidth / 360) * 148;
                final state0Y = (screenHeight / 720) * 327.91;
                final state1X = (screenWidth / 360) * 80;
                final state1Y = (screenHeight / 720) * 336;

                // Interpolate based on text controller progress
                final logoX = state0X + (state1X - state0X) * _textController.value;
                final logoY = state0Y + (state1Y - state0Y) * _textController.value;

                // Interpolate size
                final state0Width = (screenWidth / 360) * 64;
                final state1Width = (screenWidth / 360) * 200;
                final logoWidth = state0Width + (state1Width - state0Width) * _textController.value;

                final state0Height = (screenHeight / 720) * 65;
                final state1Height = (screenHeight / 720) * 48;
                final logoHeight = state0Height + (state1Height - state0Height) * _textController.value;

                final useIconOnly = _currentState == 0;

                return Positioned(
                  left: logoX,
                  top: logoY,
                  child: Opacity(
                    opacity: _logoOpacity.value,
                    child: Transform.scale(
                      scale: _currentState == 0 ? _logoScale.value : 1.0,
                      child: SizedBox(
                        width: logoWidth,
                        height: logoHeight,
                        child: useIconOnly
                            ? SvgPicture.asset(
                                'assets/icons/logo_icon.svg',
                                width: logoWidth,
                                height: logoHeight,
                                fit: BoxFit.contain,
                              )
                            : Opacity(
                                opacity: _textOpacity.value,
                                child: SvgPicture.asset(
                                  'assets/icons/logo_full.svg',
                                  width: logoWidth,
                                  height: logoHeight,
                                  fit: BoxFit.contain,
                                ),
                              ),
                      ),
                    ),
                  ),
                );
              },
            ),
            // Progress Indicator (State 2 only)
            if (_currentState == 2)
              AnimatedBuilder(
                animation: Listenable.merge([
                  _progressController,
                  _taglineController,
                ]),
                builder: (context, child) {
                  return Positioned(
                    left: 0,
                    right: 0,
                    top: (screenHeight / 720) * 652,
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Progress Bar Container
                          SizedBox(
                            width: (screenWidth / 360) * 159,
                            height: (screenHeight / 720) * 3,
                            child: Stack(
                              children: [
                                // Background bar
                                Container(
                                  width: (screenWidth / 360) * 159,
                                  height: (screenHeight / 720) * 3,
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.3),
                                    borderRadius: BorderRadius.circular(
                                      (screenHeight / 720) * 56,
                                    ),
                                  ),
                                ),
                                // Progress fill (animated)
                                Container(
                                  width: (screenWidth / 360) * _progressWidth.value,
                                  height: (screenHeight / 720) * 3,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF09b852)
                                        .withOpacity(0.45),
                                    borderRadius: BorderRadius.circular(
                                      (screenHeight / 720) * 56,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: (screenHeight / 720) * 8),
                          // Tagline text (fade in)
                          Opacity(
                            opacity: _taglineOpacity.value,
                            child: Text(
                              'Plan for better tomorrow',
                              style: TextStyle(
                                fontFamily: 'Avenir',
                                fontWeight: FontWeight.w500,
                                fontSize: (screenHeight / 720) * 14,
                                color: Colors.white.withOpacity(0.56),
                                letterSpacing: 0,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
