// // ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

// import 'package:flutter/material.dart';
// import 'package:mobile/pages/prototype-page.dart';

// class HomePage extends StatefulWidget {
//   @override
//   State<HomePage> createState() => _HomePageState();
// }

// class _HomePageState extends State<HomePage> {
//   var selectedIndex = 0;

//   final _loginScreen = GlobalKey<NavigatorState>();
//   final _createAccountScreen = GlobalKey<NavigatorState>();
//   final _homePageScreen = GlobalKey<NavigatorState>();

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: IndexedStack(
//         index: selectedIndex,
//         children: <Widget>[
//           Navigator(
//             key: _loginScreen,
//             onGenerateRoute: (route) => MaterialPageRoute(
//               settings: route,
//               builder: (context) => PrototypePage(),
//             ),
//           ),
//           Navigator(
//             key: _createAccountScreen,
//             onGenerateRoute: (route) => MaterialPageRoute(
//               settings: route,
//               builder: (context) => PrototypePage(),
//             ),
//           ),
//           Navigator(
//             key: _homePageScreen,
//             onGenerateRoute: (route) => MaterialPageRoute(
//               settings: route,
//               builder: (context) => PrototypePage(),
//             ),
//           ),
//         ],
//       ),
//       bottomNavigationBar: BottomNavigationBar(
//         type: BottomNavigationBarType.fixed,
//         currentIndex: selectedIndex,
//         onTap: (val) => _onTap(val, context),
//         backgroundColor: Theme.of(context).scaffoldBackgroundColor,
//         items: [
//           BottomNavigationBarItem(
//             icon: Icon(Icons.library_books),
//             label: 'Page a implementer 1',
//           ),
//           BottomNavigationBarItem(
//             icon: Icon(Icons.list),
//             label: 'Page a implementer 2',
//           ),
//           BottomNavigationBarItem(
//             icon: Icon(Icons.search),
//             label: 'Page a implementer 3',
//           ),
//         ],
//       ),
//     );
//   }

//   void _onTap(int val, BuildContext context) {
//     if (selectedIndex == val) {
//       switch (val) {
//         case 0:
//           _loginScreen.currentState!.popUntil((route) => route.isFirst);
//           break;
//         case 1:
//           _createAccountScreen.currentState!.popUntil((route) => route.isFirst);
//           break;
//         case 2:
//           _homePageScreen.currentState!.popUntil((route) => route.isFirst);
//           break;
//         default:
//       }
//     } else {
//       if (mounted) {
//         setState(() {
//           selectedIndex = val;
//         });
//       }
//     }
//   }
// }
