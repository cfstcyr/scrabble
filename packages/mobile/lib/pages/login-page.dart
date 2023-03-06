import 'package:flutter/material.dart';

import '../components/login-form.dart';
import '../constants/login-constants.dart';

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text("Super Scrabble"),
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

class MainTitle extends StatelessWidget {
  const MainTitle({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    return Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Card(
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Image.asset(LOGO_PATH, height: 60, width: 90),
        ),
      ),
      SizedBox(height: 5),
      Card(
        child: LoginForm(),
      ),
    ]);
  }
}
