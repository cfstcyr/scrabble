// ignore_for_file: non_constant_identifier_names, constant_identifier_names

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/group.dart';
import 'package:mobile/pages/group-waiting-page.dart';
import 'package:mobile/pages/groups-page.dart';
import 'package:mobile/pages/home-page.dart';

import '../main.dart';
import '../pages/create-lobby.dart';
import '../pages/groups-request-waiting-page.dart';

const HOME_ROUTE = '/home';
const GROUPS_ROUTE = '/groups';
const CREATE_LOBBY_ROUTE = '/create-lobby';
const JOIN_WAITING_ROUTE = '/join-waiting-room';
const JOIN_LOBBY_ROUTE = '/join-lobby';
const MAIN_PAGE = '/main';
final ROUTES = {
  MAIN_PAGE: (context) => MainPage(),
  HOME_ROUTE: (context) => HomePage(),
  GROUPS_ROUTE: (context) => GroupPage(),
  CREATE_LOBBY_ROUTE: (context) => CreateLobbyPage(),
};

Route<dynamic>? customOnGenerateRoute(RouteSettings settings) {
  switch (settings.name) {
    case (JOIN_WAITING_ROUTE):
      return MaterialPageRoute(builder: (context) {
        return GroupRequestWaitingPage(group: settings.arguments as Group);
      });
    case (JOIN_LOBBY_ROUTE):
      return MaterialPageRoute(builder: (context) {
        return JoinWaitingPage(currentGroup: settings.arguments as Group);
      });
    default:
      return null;
  }
}
