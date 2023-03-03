import 'package:flutter/material.dart';

import '../components/login-form.dart';
import '../constants/login-constants.dart';
import 'groups-page.dart';

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          MainTitle(),
          SizedBox(height: 10),
        ],
      ),
    );
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
          padding: const EdgeInsets.all(20.0),
          child: Image.asset(LOGO_PATH, height: 80, width: 120),
        ),
      ),
      SizedBox(height: 10),
      Card(
        child: LoginForm(),
      ),
    ]);
  }
}
