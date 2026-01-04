import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/placeholder_image.dart';
import '../../../core/widgets/smart_image.dart';

/// Onboarding DOB Screen - Matches React OnboardingDOB component
/// Screen 2: Date of birth with calendar image and scrollable date picker
class OnboardingDOBScreen extends StatefulWidget {
  final String userName;
  final Function({required int day, required int month, required int year})? onContinue;
  final VoidCallback? onBack;

  const OnboardingDOBScreen({
    Key? key,
    required this.userName,
    this.onContinue,
    this.onBack,
  }) : super(key: key);

  @override
  State<OnboardingDOBScreen> createState() => _OnboardingDOBScreenState();
}

class _OnboardingDOBScreenState extends State<OnboardingDOBScreen> {
  late FixedExtentScrollController _dayController;
  late FixedExtentScrollController _monthController;
  late FixedExtentScrollController _yearController;

  int _selectedDay = 5;
  int _selectedMonth = 7; // August (0-indexed, July=6, August=7)
  int _selectedYear = 2002;

  static const List<String> months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  @override
  void initState() {
    super.initState();
    final currentYear = DateTime.now().year;
    final years = List.generate(100, (i) => currentYear - 18 - i);
    
    // Initialize controllers with proper item indices
    _dayController = FixedExtentScrollController(initialItem: _selectedDay - 1);
    _monthController = FixedExtentScrollController(initialItem: _selectedMonth);
    
    // Find the index of selected year in the years list
    final yearIndex = years.indexOf(_selectedYear);
    _yearController = FixedExtentScrollController(
      initialItem: yearIndex >= 0 ? yearIndex : 0,
    );

    // Update selected year if it's not in the list
    if (yearIndex < 0) {
      _selectedYear = years[0];
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToSelected();
    });
  }

  void _scrollToSelected() {
    // Use jumpToItem for instant positioning (no animation)
    _dayController.jumpToItem(_selectedDay - 1);
    _monthController.jumpToItem(_selectedMonth);
    
    final currentYear = DateTime.now().year;
    final years = List.generate(100, (i) => currentYear - 18 - i);
    final yearIndex = years.indexOf(_selectedYear);
    if (yearIndex >= 0) {
      _yearController.jumpToItem(yearIndex);
    }
  }

  void _handleContinue() {
    widget.onContinue?.call(
      day: _selectedDay,
      month: _selectedMonth + 1, // Convert to 1-indexed
      year: _selectedYear,
    );
  }

  @override
  void dispose() {
    _dayController.dispose();
    _monthController.dispose();
    _yearController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final padding = screenWidth * 0.055; // ~20px on 360px screen
    final currentYear = DateTime.now().year;
    final days = List.generate(31, (i) => i + 1);
    final years = List.generate(100, (i) => currentYear - 18 - i);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header Section
            Padding(
              padding: EdgeInsets.fromLTRB(padding, 12, padding, 0),
              child: Column(
                children: [
                  // Back Button and Header Row
                  Row(
                    children: [
                      GestureDetector(
                        onTap: widget.onBack,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Color(0xFF164F2D), Color(0xFF0F361F)],
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.arrow_back,
                            size: 12,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Help us know you, ${widget.userName}!',
                          style: GoogleFonts.frankRuhlLibre(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            height: 1.5,
                            color: const Color(0xFF0E371F),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Progress Bar
                  Stack(
                    children: [
                      Container(
                        height: 0.5,
                        color: const Color(0xFF0D361E).withOpacity(0.2),
                      ),
                      Container(
                        height: 0.5,
                        width: screenWidth * 0.25, // ~80px on 360px screen
                        color: const Color(0xFF0D361E),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(padding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    // Hero Image (Calendar)
                    SizedBox(
                      width: double.infinity,
                      height: screenHeight * 0.28, // ~200px on 720px screen
                      child: SmartImage(
                        imagePath: 'assets/images/onboarding/calendar.jpg',
                        width: double.infinity,
                        height: screenHeight * 0.28,
                        placeholderType: 'calendar',
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Question
                    Text(
                      'When were you born?',
                      style: GoogleFonts.frankRuhlLibre(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        height: 1.33,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Date Picker Container with ListWheelScrollView for sticky snap
                    SizedBox(
                      width: double.infinity,
                      height: 145,
                      child: Stack(
                        children: [
                          // Selection Highlight Lines - Above and below selected item
                          Positioned(
                            top: 49, // 48px item height + 1px
                            left: 0,
                            right: 0,
                            height: 1,
                            child: Container(
                              color: Colors.black.withOpacity(0.12), // Light gray line
                            ),
                          ),
                          Positioned(
                            top: 98, // 48px item height + 1px + 48px item height + 1px
                            left: 0,
                            right: 0,
                            height: 1,
                            child: Container(
                              color: Colors.black.withOpacity(0.12), // Light gray line
                            ),
                          ),

                          // Top Gradient
                          Positioned(
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 49,
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Colors.white,
                                    Colors.white.withOpacity(0),
                                  ],
                                ),
                              ),
                            ),
                          ),

                          // Bottom Gradient
                          Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 49,
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Colors.white.withOpacity(0),
                                    Colors.white,
                                  ],
                                ),
                              ),
                            ),
                          ),

                          // Day Picker - Using ListWheelScrollView for sticky snap
                          Positioned(
                            left: 0,
                            top: 0,
                            width: screenWidth * 0.22, // Slightly wider for better spacing
                            height: 145,
                            child: ListWheelScrollView.useDelegate(
                              controller: _dayController,
                              itemExtent: 48,
                              physics: const FixedExtentScrollPhysics(),
                              perspective: 0.005,
                              diameterRatio: 1.2,
                              onSelectedItemChanged: (index) {
                                setState(() {
                                  _selectedDay = days[index];
                                });
                              },
                              childDelegate: ListWheelChildBuilderDelegate(
                                builder: (context, index) {
                                  final day = days[index];
                                  final isSelected = day == _selectedDay;
                                  return Center(
                                    child: Text(
                                      day.toString(),
                                      style: GoogleFonts.frankRuhlLibre(
                                        fontSize: 18,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        color: isSelected 
                                            ? AppTheme.textPrimary // Dark gray for selected
                                            : AppTheme.textSecondary, // Light gray for non-selected
                                      ),
                                    ),
                                  );
                                },
                                childCount: days.length,
                              ),
                            ),
                          ),

                          // Month Picker - Using ListWheelScrollView for sticky snap
                          Positioned(
                            left: screenWidth * 0.22,
                            top: 0,
                            width: screenWidth * 0.38, // Adjusted for better spacing
                            height: 145,
                            child: ListWheelScrollView.useDelegate(
                              controller: _monthController,
                              itemExtent: 48,
                              physics: const FixedExtentScrollPhysics(),
                              perspective: 0.005,
                              diameterRatio: 1.2,
                              onSelectedItemChanged: (index) {
                                setState(() {
                                  _selectedMonth = index;
                                });
                              },
                              childDelegate: ListWheelChildBuilderDelegate(
                                builder: (context, index) {
                                  final isSelected = index == _selectedMonth;
                                  return Center(
                                    child: Text(
                                      months[index],
                                      style: GoogleFonts.frankRuhlLibre(
                                        fontSize: 18,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        color: isSelected 
                                            ? AppTheme.textPrimary // Dark gray for selected
                                            : AppTheme.textSecondary, // Light gray for non-selected
                                      ),
                                    ),
                                  );
                                },
                                childCount: months.length,
                              ),
                            ),
                          ),

                          // Year Picker - Using ListWheelScrollView for sticky snap
                          Positioned(
                            left: screenWidth * 0.60,
                            top: 0,
                            width: screenWidth * 0.22, // Slightly wider for better spacing
                            height: 145,
                            child: ListWheelScrollView.useDelegate(
                              controller: _yearController,
                              itemExtent: 48,
                              physics: const FixedExtentScrollPhysics(),
                              perspective: 0.005,
                              diameterRatio: 1.2,
                              onSelectedItemChanged: (index) {
                                setState(() {
                                  _selectedYear = years[index];
                                });
                              },
                              childDelegate: ListWheelChildBuilderDelegate(
                                builder: (context, index) {
                                  final year = years[index];
                                  final isSelected = year == _selectedYear;
                                  return Center(
                                    child: Text(
                                      year.toString(),
                                      style: GoogleFonts.frankRuhlLibre(
                                        fontSize: 18,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        color: isSelected 
                                            ? AppTheme.textPrimary // Dark gray for selected
                                            : AppTheme.textSecondary, // Light gray for non-selected
                                      ),
                                    ),
                                  );
                                },
                                childCount: years.length,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: screenHeight * 0.1), // Spacer
                  ],
                ),
              ),
            ),

            // Continue Button
            Padding(
              padding: EdgeInsets.all(padding),
              child: PrimaryButton(
                text: 'Continue',
                onPressed: _handleContinue,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
