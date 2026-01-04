import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // React Design System Color Palette
  // Primary Colors (Dark Green)
  static const Color primaryColor = Color(0xFF0F361F); // #0f361f - Primary dark green
  static const Color primaryDark = Color(0xFF0E371F); // #0e371f - Alternative dark green
  static const Color primaryLight = Color(0xFFE3EAE6); // #e3eae6 - Light green background
  
  // Accent Colors
  static const Color accentGreen = Color(0xFF09B852); // #09b852 - Bright green
  static const Color lightGreen = Color(0xFFE7F1EB); // #e7f1eb - Light green
  static const Color lightGreenAlt = Color(0xFFD8E4DD); // #d8e4dd - Alternative light green
  
  // Secondary Colors
  static const Color secondaryColor = Color(0xFF09B852); // Success Green
  static const Color successColor = Color(0xFF09B981);
  static const Color warningColor = Color(0xFFF59E0B);
  static const Color errorColor = Color(0xFFEF4444);
  
  // Neutral Colors
  static const Color backgroundColor = Colors.white; // White background
  static const Color surfaceColor = Colors.white;
  static const Color lightGray = Color(0xFFF1F3F5); // #f1f3f5 - Light gray background
  static const Color borderColor = Color(0xFF000000); // Black with opacity for borders
  static const Color textPrimary = Color(0xFF242424); // #242424 - Primary text
  static const Color textSecondary = Color(0xFF707070); // #707070 - Secondary text
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color textMuted = Color(0x8F000000); // rgba(0,0,0,0.56) - Muted text

  // Typography - Using Google Fonts
  // Frank Ruhl Libre for titles, Lato for body text
  // Use GoogleFonts.frankRuhlLibre() for titles
  // Use GoogleFonts.lato() for body text

  static TextTheme get textTheme {
    final frankRuhlLibre = GoogleFonts.frankRuhlLibre();
    final lato = GoogleFonts.lato();

    return TextTheme(
      displayLarge: frankRuhlLibre.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: textPrimary,
        height: 1.25, // 40px line-height for 32px font
      ),
      displayMedium: frankRuhlLibre.copyWith(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: textPrimary,
      ),
      displaySmall: frankRuhlLibre.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: textPrimary,
        height: 1.33, // 32px line-height for 24px font
      ),
      headlineMedium: lato.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: textPrimary,
      ),
      titleLarge: lato.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: textPrimary,
      ),
      titleMedium: lato.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: textPrimary,
        height: 1.5, // 24px line-height for 16px font
      ),
      bodyLarge: lato.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        color: textPrimary,
        height: 1.5, // 24px line-height
      ),
      bodyMedium: lato.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.normal,
        color: textSecondary,
        height: 1.43, // 20px line-height for 14px font
      ),
      bodySmall: lato.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.normal,
        color: textSecondary,
      ),
    );
  }

  // Spacing
  static const double spacingXS = 4.0;
  static const double spacingS = 8.0;
  static const double spacingM = 16.0;
  static const double spacingL = 24.0;
  static const double spacingXL = 32.0;
  static const double spacingXXL = 48.0;

  // Border Radius
  static const double radiusS = 4.0;
  static const double radiusM = 8.0;
  static const double radiusL = 12.0;
  static const double radiusXL = 16.0;

  // Theme Data
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentGreen,
        surface: surfaceColor,
        background: backgroundColor,
        error: errorColor,
      ),
      textTheme: textTheme,
      scaffoldBackgroundColor: backgroundColor,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: true,
        shadowColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          minimumSize: const Size(320, 56), // w-80 h-14 from React
          padding: const EdgeInsets.symmetric(horizontal: spacingXL, vertical: spacingM),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusM),
          ),
          textStyle: GoogleFonts.frankRuhlLibre(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: Colors.white,
          ),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          side: const BorderSide(color: primaryColor, width: 1.5),
          minimumSize: const Size(320, 56), // w-80 h-14 from React
          padding: const EdgeInsets.symmetric(horizontal: spacingXL, vertical: spacingM),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusM),
          ),
          textStyle: GoogleFonts.lato(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: primaryColor,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          padding: const EdgeInsets.symmetric(horizontal: spacingM, vertical: spacingS),
          textStyle: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: BorderSide(color: borderColor.withOpacity(0.12)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: BorderSide(color: borderColor.withOpacity(0.12)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusM),
          borderSide: const BorderSide(color: errorColor),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: spacingM),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusM), // rounded-lg = 8px
          side: BorderSide(color: borderColor.withOpacity(0.12), width: 1),
        ),
        color: surfaceColor,
        margin: const EdgeInsets.symmetric(horizontal: spacingM, vertical: spacingS),
      ),
      dividerTheme: DividerThemeData(
        color: borderColor.withOpacity(0.12),
        thickness: 1,
        space: 1,
      ),
    );
  }
}
