import 'package:intl/intl.dart';

class WillNarrativeSection {
  final String title;
  final String content;
  final bool isHeader;

  WillNarrativeSection({
    required this.title,
    required this.content,
    this.isHeader = false,
  });
}

class WillNarrativeService {
  List<WillNarrativeSection> generateNarrative(Map<String, dynamic> will) {
    final List<WillNarrativeSection> sections = [];
    final profile = will['profile'] as Map<String, dynamic>?;
    final people = (will['people'] as List<dynamic>?) ?? [];
    final scenarios = (will['scenarios'] as List<dynamic>?) ?? [];
    final guardians = (will['guardianAssignments'] as List<dynamic>?) ?? [];
    final executors = (will['executorAssignments'] as List<dynamic>?) ?? [];
    final witnesses = (will['witnesses'] as List<dynamic>?) ?? [];
    final assets = (will['assets'] as List<dynamic>?) ?? [];

    // 1. Title
    sections.add(WillNarrativeSection(
      title: 'LAST WILL AND TESTAMENT',
      content: '',
      isHeader: true,
    ));

    // 2. Personal Declaration
    if (profile != null) {
      final String fullName = profile['fullName'] ?? 'the Testator';
      final String? dobRaw = profile['dateOfBirth'];
      String dobStr = '';
      if (dobRaw != null) {
        try {
          final dob = DateTime.parse(dobRaw);
          dobStr = ', born on ${DateFormat('dd MMMM yyyy').format(dob)}';
        } catch (_) {}
      }

      sections.add(WillNarrativeSection(
        title: 'PERSONAL DECLARATION',
        content: 'I, $fullName$dobStr, being of sound mind and memory, and not acting under any coercion, undue influence, or fraud, do hereby declare this to be my Last Will and Testament, and I hereby revoke all former wills and codicils made by me.',
      ));
    }

    // 3. Executor Appointment
    if (executors.isNotEmpty) {
      final executor = executors[0]['person'];
      if (executor != null) {
        sections.add(WillNarrativeSection(
          title: 'APPOINTMENT OF EXECUTOR',
          content: 'I hereby appoint ${executor['fullName']} as the executor of this will. The executor shall have full power and authority to administer my estate according to the terms of this will.',
        ));
      }
    }

    // 4. Distribution of Estate (Scenarios)
    if (scenarios.isNotEmpty) {
      String distributionText = '';
      for (var scenario in scenarios) {
        final type = scenario['type'];
        final String scenarioTitle = _getScenarioTitle(type);
        distributionText += '$scenarioTitle\n';

        final allocations = (scenario['allocationJson']?['allocations'] as List<dynamic>?) ?? [];
        for (var allocation in allocations) {
          final person = people.firstWhere((p) => p['id'] == allocation['personId'], orElse: () => null);
          if (person != null) {
            distributionText += '• ${person['fullName']}: ${allocation['percentage']}%\n';
          }
        }
        distributionText += '\n';
      }

      sections.add(WillNarrativeSection(
        title: 'DISTRIBUTION OF ESTATE',
        content: distributionText.trim(),
      ));
    }

    // 5. Guardianship
    if (guardians.isNotEmpty) {
      String guardianText = '';
      for (var g in guardians) {
        final child = g['child'];
        final guardian = g['guardian'];
        final altGuardian = g['alternateGuardian'];
        
        guardianText += 'I hereby appoint ${guardian['fullName']} as guardian for ${child['fullName']}';
        if (altGuardian != null) {
          guardianText += ', with ${altGuardian['fullName']} as alternate guardian';
        }
        guardianText += '.\n';
      }

      sections.add(WillNarrativeSection(
        title: 'GUARDIANSHIP',
        content: guardianText.trim(),
      ));
    }

    // 6. Schedule of Assets
    if (assets.isNotEmpty) {
      String assetText = '';
      for (var asset in assets) {
        assetText += '• ${asset['title']} (${asset['category']})\n';
        if (asset['description'] != null) {
          assetText += '  ${asset['description']}\n';
        }
      }

      sections.add(WillNarrativeSection(
        title: 'SCHEDULE OF ASSETS',
        content: assetText.trim(),
      ));
    }

    // 7. Witness Declaration
    if (witnesses.isNotEmpty) {
      sections.add(WillNarrativeSection(
        title: 'WITNESS DECLARATION',
        content: 'We, the undersigned witnesses, hereby declare that the testator signed this will in our presence, and we signed in the presence of the testator and each other.',
      ));
    }

    return sections;
  }

  String _getScenarioTitle(String type) {
    switch (type) {
      case 'USER_DIES_FIRST':
        return 'If I die before my spouse:';
      case 'SPOUSE_DIES_FIRST':
        return 'If my spouse dies before me:';
      case 'NO_ONE_SURVIVES':
        return 'If no one from my family survives:';
      default:
        return 'Distribution:';
    }
  }
}
