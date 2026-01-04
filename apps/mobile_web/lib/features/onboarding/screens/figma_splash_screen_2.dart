import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/routes/app_routes.dart';

class FigmaSplashScreen2 extends StatelessWidget {
  const FigmaSplashScreen2({Key? key}) : super(key: key);

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
            // Positioned at (80, 336) from Figma, scaled proportionally
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
                      left: (screenWidth / 360) * 55.04, // 135.04 - 80
                      top: (screenHeight / 720) * 9.6,    // 345.6 - 336
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
            // Navigation
            Positioned.fill(
              child: GestureDetector(
                onTap: () {
                  Navigator.pushReplacementNamed(context, AppRoutes.splash3);
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
