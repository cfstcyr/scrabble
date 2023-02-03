// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/pages/create-account-page.dart';
import 'package:mobile/locator.dart';
import 'package:provider/provider.dart';
import 'package:mobile/pages/prototype-page.dart';
import 'package:mobile/pages/login-page.dart';

import 'environments/environment.dart';
import 'services/account-authentification-service.dart';
import 'services/theme-color-service.dart';

void main() {
  const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: Environment.DEV,
  );

  Environment().initConfig(environment);
  setUpLocator();

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => MyAppState(),
      child: MaterialApp(
        title: 'Namer App',
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        ),
        home: MainPage(),
      ),
    );
  }
}

class MyAppState extends ChangeNotifier {
}

class MainPage extends StatefulWidget {
  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  var selectedIndex = 0;

  final _loginScreen = GlobalKey<NavigatorState>();
  final _createAccountScreen = GlobalKey<NavigatorState>();
  final _homePageScreen = GlobalKey<NavigatorState>();
  final _settingsScreen = GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    return LoginPage();
  }
}

    // var appState = context.watch<MyAppState>();

    // Widget page;
    // switch (selectedIndex) {
    //   case 0:
    //     page = LoginPage();
    //     break;
    //   case 1:
    //     page = CreateAccountPage();
    //     break;
    //   case 2:
    //     page = HomePage();
    //     break;
    //   default:
    //     throw UnimplementedError('no widget for $selectedIndex');
    // }
    // return LayoutBuilder(builder: (context, constraints) {
    //   return Scaffold(
    //     body: Row(
    //       children: [
    //         SafeArea(
    //           child: NavigationRail(
    //             leading: FloatingActionButton(
    //               elevation: 0,
    //               onPressed: () {
    //                 setState(() {
    //                   appState.toggleHide();
    //                 });
    //               },
    //               child: appState.showSideBar ? const Icon(Icons.arrow_left_sharp) : const Icon(Icons.arrow_right_alt_sharp),
    //             ),
    //             extended: appState.showSideBar,
    //             destinations: const [
    //               NavigationRailDestination(
    //                 icon: Icon(Icons.login),
    //                 label: Text('Se connecter'),
    //               ),
    //               NavigationRailDestination(
    //                 icon: Icon(Icons.account_circle),
    //                 label: Text('Page principale'),
    //               ),
    //               NavigationRailDestination(
    //                 icon: Icon(Icons.account_balance),
    //                 label: Text('Créer un compte'),
    //               ),
    //             ],
    //             selectedIndex: selectedIndex,
    //             onDestinationSelected: (value) {
    //               setState(() {
    //                 selectedIndex = value;
    //               });
    //             },
    //           ),
    //         ),
    //         Expanded(
    //           child: Container(
    //             color: Theme.of(context).colorScheme.primaryContainer,
    //             child: page,
    //           ),
    //         ),
    //       ],
    //     ),
    //   );
    // });
  // }
// }
