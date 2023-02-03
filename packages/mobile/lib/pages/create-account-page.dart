// ignore_for_file: prefer_const_constructors

import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';
import 'package:mobile/components/create-account-form.dart';
import 'package:provider/provider.dart';

import 'prototype-page.dart';

class CreateAccountPage extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Création d'un compte"),
      ),
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Center(
              child: Column(
                children: [
                  CreateAccountForm()
                  ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
