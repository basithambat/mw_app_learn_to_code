import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/routes/app_routes.dart';

class FigmaSplashScreen3 extends StatelessWidget {
  const FigmaSplashScreen3({Key? key}) : super(key: key);

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
            // Logo + Text Group (same as Screen 2)
            Positioned(
              left: (screenWidth / 360) * 80,
              top: (screenHeight / 720) * 336,
              child: SizedBox(
                width: (screenWidth / 360) * 200,
                height: (screenHeight / 720) * 48,
                child: Stack(
                  children: [
                    // Logo
                    Positioned(
                      left: 0,
                      top: 0,
                      child: SvgPicture.asset(
                        'assets/icons/logo_splash2.svg',
                        width: (screenWidth / 360) * 47.863,
                        height: (screenHeight / 720) * 48,
                        fit: BoxFit.contain,
                      ),
                    ),
                    // Text "mywasiyat"
                    Positioned(
                      left: (screenWidth / 360) * 55.04,
                      top: (screenHeight / 720) * 9.6,
                      child: SvgPicture.asset(
                        'assets/icons/mywasiyat_text.svg',
                        width: (screenWidth / 360) * 144.958,
                        height: (screenHeight / 720) * 28.8,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Progress Indicator Group at bottom
            // Positioned at (100.5, 652) from Figma, centered horizontally
            Positioned(
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
                              borderRadius: BorderRadius.circular((screenHeight / 720) * 56),
                            ),
                          ),
                          // Progress fill
                          Container(
                            width: (screenWidth / 360) * 60, // 37.7% of 159px
                            height: (screenHeight / 720) * 3,
                            decoration: BoxDecoration(
                              color: const Color(0xFF09b852).withOpacity(0.45),
                              borderRadius: BorderRadius.circular((screenHeight / 720) * 56),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: (screenHeight / 720) * 8),
                    // Tagline text
                    Text(
                      'Plan for better tomorrow',
                      style: TextStyle(
                        fontFamily: 'Avenir',
                        fontWeight: FontWeight.w500, // Medium
                        fontSize: (screenHeight / 720) * 14,
                        color: Colors.white.withOpacity(0.56),
                        letterSpacing: 0,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
            // Navigation
            Positioned.fill(
              child: GestureDetector(
                onTap: () {
                  Navigator.pushReplacementNamed(context, AppRoutes.login);
                },
                child: Container(
                  color: Colors.transparent,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
