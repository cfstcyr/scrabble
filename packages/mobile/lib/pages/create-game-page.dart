// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';

import '../components/create-game/create-game-form.dart';

class CreateGamePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Création de partie"),
      ),
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
