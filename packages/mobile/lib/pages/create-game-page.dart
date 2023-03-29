// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';

import '../components/create-game/create-game-form.dart';
import '../components/scaffold-persistance.dart';

class CreateGamePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: "Création de partie",
      hasBackButton: true,
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Center(
              child: Column(
                children: [CreateGameForm()],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
