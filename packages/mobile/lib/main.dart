// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/pages/login-page.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';

import 'environments/environment.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: Environment.DEV,
  );
  Environment().initConfig(environment);
  setUpLocator();
  connectAndListen();
  runApp(MyApp());
}

void connectAndListen() {
  final String webSocketUrl = Environment().config.webSocketUrl;

  IO.Socket socket = IO.io(
      webSocketUrl,
      OptionBuilder()
          .disableAutoConnect()
          .setTransports(['websocket']).build());
  socket.connect();

  socket.onConnect((_) {
    print('connected to websocket');
  });
  socket.onConnectError((data) {
    print(data);
  });
  socket.onConnectTimeout((data) {
    print(data);
  });
  socket.onDisconnect((_) => {print("disconnected")});
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

class MyAppState extends ChangeNotifier {}

class MainPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text("Super Scrabble"),
        ),
        backgroundColor: Colors.white,
        body: LoginPage());
  }
}
