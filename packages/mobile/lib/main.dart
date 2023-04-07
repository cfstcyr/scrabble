// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/initializer.service.dart';
import 'package:mobile/services/theme-color-service.dart';

import 'environments/environment.dart';

Future<void> main() async {
  Intl.defaultLocale = 'fr_CA';
  initializeDateFormatting('fr_CA', null);

  await dotenv.load(fileName: ".env");
  const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: Environment.DEV,
  );
  await Firebase.initializeApp();

  Environment().initConfig(environment);
  CustomLocator().setUpLocator();
  getIt.get<InitializerService>().initialize();
  SystemChrome.setPreferredOrientations(
          [DeviceOrientation.landscapeLeft, DeviceOrientation.landscapeRight])
      .then((_) => runApp(MyApp()));
}

class MyApp extends StatelessWidget {
  MyApp({super.key});

  final InitializerService _initializerService =
      getIt.get<InitializerService>();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<String?>(
        stream: _initializerService.entryPageStream,
        builder: (context, snapshot) {
          if (!snapshot.hasData || snapshot.hasError) {
            return CircularProgressIndicator();
          }

          return StreamBuilder(
              stream: getIt.get<ThemeColorService>().themeDetails.stream,
              builder: (context, color) {
                return MaterialApp(
                  title: 'LOG3900 - 103',
                  theme: ThemeData(
                      useMaterial3: true,
                      scaffoldBackgroundColor: Colors.white,
                      colorScheme: ColorScheme.fromSeed(
                          seedColor: color.data?.color.colorValue ??
                              Color.fromRGBO(27, 94, 32, 1),
                          primary:
                              color.data?.color.colorValue.withAlpha(200) ??
                                  Color.fromRGBO(27, 94, 32, 1),
                          secondary: Color.fromRGBO(27, 94, 32, 0.15),
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
        });
  }
}
