import 'package:flutter/material.dart';

import '../components/login-form.dart';
import '../constants/login-constants.dart';

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Row(children: [Image.asset(LOGO_PATH, height: 60, width: 90)]),
          automaticallyImplyLeading: false,
        ),
        backgroundColor: Colors.white,
        body: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Center(
                child: Column(
                  children: [LoginForm()],
                ),
              ),
            ],
          ),
        ));
  }
}
