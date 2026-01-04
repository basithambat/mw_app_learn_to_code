import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/routes/app_routes.dart';

class FigmaSplashScreen1 extends StatelessWidget {
  const FigmaSplashScreen1({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Screen dimensions from Figma: 360×720
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      body: Container(
        width: screenWidth,
        height: screenHeight,
        decoration: BoxDecoration(
          // Radial gradient: rgba(15,54,31,1) to rgba(22,79,45,1)
          gradient: RadialGradient(
            center: Alignment.topLeft,
            radius: 2.0,
            colors: [
              const Color(0xFF0F361F), // rgba(15, 54, 31, 1)
              const Color(0xFF164F2D), // rgba(22, 79, 45, 1)
            ],
            stops: const [0.0, 1.0],
            transform: const GradientRotation(0.0), // Simplified transform
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
            // Logo positioned exactly as in Figma
            // Position: left: 148px, top: 327.91px (from 360×720 screen)
            Positioned(
              left: (screenWidth / 360) * 148, // Scale proportionally
              top: (screenHeight / 720) * 327.91,
              child: SvgPicture.asset(
                'assets/icons/logo_splash1.svg',
                width: (screenWidth / 360) * 64,
                height: (screenHeight / 720) * 64.184,
                fit: BoxFit.contain,
              ),
            ),
            // Auto-advance after 2 seconds
            Positioned.fill(
              child: GestureDetector(
                onTap: () {
                  Navigator.pushReplacementNamed(context, AppRoutes.splash2);
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
