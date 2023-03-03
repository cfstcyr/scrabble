// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/classes/login.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/pages/home-page.dart';
import 'package:mobile/pages/login-page.dart';
import 'package:provider/provider.dart';

import 'controllers/account-authentification-controller.dart';
import 'environments/environment.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: Environment.DEV,
  );
  Environment().initConfig(environment);
  setUpLocator();

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  AccountAuthenticationController authController =
      getIt.get<AccountAuthenticationController>();
  MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Widget>(
      future: getEntryPage(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          // Return a loading indicator while the future is being fetched
          return CircularProgressIndicator();
        } else {
          return ChangeNotifierProvider(
            create: (context) => MyAppState(),
            child: MaterialApp(
              title: 'Namer App',
              theme: ThemeData(
                useMaterial3: true,
                colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
              ),
              home: snapshot.data,
            ),
          );
        }
      },
    );
  }

  Future<Widget>? getEntryPage() async {
    TokenValidation tokenValidation = await authController.validateToken();
    switch (tokenValidation) {
      case TokenValidation.Ok:
        {
          return HomePage();
        }

      case TokenValidation.NoToken:
        {
          return MainPage();
        }
      default:
        {
          return MainPage();
        }
    }
  }
}

class MyAppState extends ChangeNotifier {}

class MainPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text("Super Scrabble"),
          automaticallyImplyLeading: false,
        ),
        backgroundColor: Colors.white,
        body: LoginPage());
  }
}
