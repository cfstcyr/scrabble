// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'package:flutter/material.dart';
import 'package:mobile/pages/prototype-page.dart';

import '../components/scaffold-persistance.dart';

class HomePage extends StatefulWidget {
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  var selectedIndex = 0;

  final _loginScreen = GlobalKey<NavigatorState>();
  final _createAccountScreen = GlobalKey<NavigatorState>();
  final _homePageScreen = GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: "Home",
      body: IndexedStack(
        index: selectedIndex,
        children: <Widget>[
          Navigator(
            key: _loginScreen,
            onGenerateRoute: (route) => MaterialPageRoute(
              settings: route,
              builder: (context) => PrototypePage(),
            ),
          ),
          Navigator(
            key: _createAccountScreen,
            onGenerateRoute: (route) => MaterialPageRoute(
              settings: route,
              builder: (context) => PrototypePage(),
            ),
          ),
          Navigator(
            key: _homePageScreen,
            onGenerateRoute: (route) => MaterialPageRoute(
              settings: route,
              builder: (context) => PrototypePage(),
            ),
          ),
        ],
      ),
    );
  }

  void _onTap(int val, BuildContext context) {
    if (selectedIndex == val) {
      switch (val) {
        case 0:
          _loginScreen.currentState!.popUntil((route) => route.isFirst);
          break;
        case 1:
          _createAccountScreen.currentState!.popUntil((route) => route.isFirst);
          break;
        case 2:
          _homePageScreen.currentState!.popUntil((route) => route.isFirst);
          break;
        default:
      }
    } else {
      if (mounted) {
        setState(() {
          selectedIndex = val;
        });
      }
    }
  }
}
