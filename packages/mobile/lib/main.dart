// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';
import 'package:mobile/classes/login.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/pages/login-page.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/initializer.service.dart';
import 'package:provider/provider.dart';
import 'package:rxdart/rxdart.dart';

import 'controllers/account-authentification-controller.dart';
import 'environments/environment.dart';

Future<void> main() async {
  Intl.defaultLocale = 'fr_CA';
  initializeDateFormatting('fr_CA', null);

  await dotenv.load(fileName: ".env");
  const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: Environment.DEV,
  );
  Environment().initConfig(environment);
  CustomLocator().setUpLocator();
  getIt.get<InitializerService>().initialize();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  final InitializerService _initializerService =
      getIt.get<InitializerService>();

  MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<String?>(
        stream: _initializerService.entryPageStream,
        builder: (context, snapshot) {
          if (!snapshot.hasData || snapshot.hasError) {
            return CircularProgressIndicator();
          }

          return MaterialApp(
            title: 'LOG3900 - 103',
            theme: ThemeData(
                useMaterial3: true,
                scaffoldBackgroundColor: Colors.white,
                colorScheme: ColorScheme.fromSeed(
                    seedColor: Color.fromRGBO(27, 94, 32, 1),
                    background: Color.fromRGBO(243, 243, 243, 1),
                    onBackground: Color.fromRGBO(232, 232, 232, 1),
                    tertiary: Color.fromRGBO(216, 216, 216, 1)),
                cardTheme: CardTheme(
                    color: Colors.white, surfaceTintColor: Colors.white)),
            navigatorKey: navigatorKey,
            initialRoute: snapshot.data,
            routes: ROUTES,
            onGenerateRoute: customOnGenerateRoute,
          );
        });
  }
}

// class MyAppState extends ChangeNotifier {}
