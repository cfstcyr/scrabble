import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';
import 'package:mobile/create-account-page.dart';
import 'package:provider/provider.dart';
import 'home-page.dart';
import 'login.dart';

void main() {
  runApp(const MyApp());
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
  var showSideBar = true;

  toggleHide() {
    showSideBar = !showSideBar;
  }
}

class MainPage extends StatefulWidget {
  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  var selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    var appState = context.watch<MyAppState>();

    Widget page;
    switch (selectedIndex) {
      case 0:
        page = HomePage();
        break;
      case 1:
        page = CreateAccountPage();
        break;
      case 2:
        page = LoginPage();
        break;
      default:
        throw UnimplementedError('no widget for $selectedIndex');
    }
    return LayoutBuilder(builder: (context, constraints) {
      return Scaffold(
        body: Row(
          children: [
            SafeArea(
              child: NavigationRail(
                leading: FloatingActionButton(
                  elevation: 0,
                  onPressed: () {
                    setState(() {
                      appState.toggleHide();
                    });
                  },
                  child: appState.showSideBar
                      ? const Icon(Icons.arrow_left_sharp)
                      : const Icon(Icons.arrow_right_alt_sharp),
                ),
                extended: appState.showSideBar,
                destinations: const [
                  NavigationRailDestination(
                    icon: Icon(Icons.home),
                    label: Text('Home'),
                  ),
                  NavigationRailDestination(
                    icon: Icon(Icons.login),
                    label: Text('Log in'),
                  ),
                ],
                selectedIndex: selectedIndex,
                onDestinationSelected: (value) {
                  setState(() {
                    selectedIndex = value;
                  });
                },
              ),
            ),
            Expanded(
              child: Container(
                color: Theme.of(context).colorScheme.primaryContainer,
                child: page,
              ),
            ),
          ],
        ),
      );
    });
  }
}
