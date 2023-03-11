import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';

class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: 'Mon profile',
      body: Column(children: [Text('Hello')]),
    );
  }
}
