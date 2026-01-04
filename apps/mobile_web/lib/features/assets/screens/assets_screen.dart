import 'package:flutter/material.dart';
import 'properties_main_screen.dart';

class AssetsScreen extends StatelessWidget {
  final String? willId;

  const AssetsScreen({Key? key, this.willId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PropertiesMainScreen(willId: willId);
  }
}
