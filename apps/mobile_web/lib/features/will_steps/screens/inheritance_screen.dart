import 'package:flutter/material.dart';
import '../services/people_service.dart';
import 'inheritance_spouse_screen.dart';
import 'inheritance_children_screen.dart';
import 'inheritance_no_survivors_screen.dart';
import 'inheritance_summary_screen.dart';

class InheritanceScreen extends StatefulWidget {
  final String? willId;

  const InheritanceScreen({Key? key, this.willId}) : super(key: key);

  @override
  State<InheritanceScreen> createState() => _InheritanceScreenState();
}

class _InheritanceScreenState extends State<InheritanceScreen> {
  final _peopleService = PeopleService();
  List<dynamic> _people = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPeople();
  }

  Future<void> _loadPeople() async {
    if (widget.willId == null) {
      setState(() => _isLoading = false);
      return;
    }
    try {
      final people = await _peopleService.getPeople(widget.willId!);
      setState(() {
        _people = people;
        _isLoading = false;
      });
      // Start the flow automatically
      if (mounted) {
        _startInheritanceFlow();
      }
    } catch (e) {
      setState(() => _isLoading = false);
      // Even if API fails, start flow in demo mode
      if (mounted) {
        _startInheritanceFlow();
      }
    }
  }

  void _startInheritanceFlow() {
    final spouse = _people.firstWhere(
      (p) => p['relationship'] == 'SPOUSE',
      orElse: () => null,
    );
    final children = _people.where((p) {
      final rel = p['relationship']?.toString().toUpperCase() ?? '';
      return rel == 'SON' || rel == 'DAUGHTER' || rel == 'CHILD';
    }).map((p) => p as Map<String, dynamic>).toList();
    final mother = _people.firstWhere(
      (p) => p['relationship'] == 'MOTHER',
      orElse: () => null,
    );

    // Navigate to spouse screen first
    if (spouse != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => InheritanceSpouseScreen(
            willId: widget.willId,
            spouse: spouse,
          ),
        ),
      ).then((result) {
        if (result != null && (result as Map)['saved'] == true && mounted) {
          // Navigate to children screen
          if (children.isNotEmpty) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => InheritanceChildrenScreen(
                  willId: widget.willId,
                  children: children,
                ),
              ),
            ).then((result) {
              if (result != null && (result as Map)['saved'] == true && mounted) {
                // Navigate to no survivors screen
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => InheritanceNoSurvivorsScreen(
                      willId: widget.willId,
                      mother: mother,
                    ),
                  ),
                ).then((result) {
                  if (result != null && (result as Map)['saved'] == true && mounted) {
                    // Navigate to summary screen
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => InheritanceSummaryScreen(
                          willId: widget.willId,
                        ),
                      ),
                    );
                  }
                });
              }
            });
          } else {
            // No children, go directly to no survivors
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => InheritanceNoSurvivorsScreen(
                  willId: widget.willId,
                  mother: mother,
                ),
              ),
            ).then((result) {
              if (result != null && (result as Map)['saved'] == true && mounted) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => InheritanceSummaryScreen(
                      willId: widget.willId,
                    ),
                  ),
                );
              }
            });
          }
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
