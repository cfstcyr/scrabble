// ignore_for_file: non_constant_identifier_names, constant_identifier_names

import 'package:mobile/pages/game-page.dart';
import 'package:mobile/pages/home-page.dart';
import 'package:mobile/pages/login-page.dart';
import 'package:mobile/pages/profile-edit-page.dart';
import 'package:mobile/pages/profile-page.dart';

import '../main.dart';
import '../pages/create-lobby.dart';
import '../pages/groups-page.dart';

const HOME_ROUTE = '/home';
const CREATE_LOBBY_ROUTE = '/create-waiting-room';
const JOIN_LOBBY_ROUTE = '/join-waiting-room';
const MAIN_PAGE = '/main';
const GAME_PAGE_ROUTE = '/game';
const PROFILE_ROUTE = '/profile';
const PROFILE_EDIT_ROUTE = '/edit-profile';

final ROUTES = {
  HOME_ROUTE: (context) => HomePage(),
  CREATE_LOBBY_ROUTE: (context) => CreateLobbyPage(),
  JOIN_LOBBY_ROUTE: (context) => GroupPage(),
  MAIN_PAGE: (context) => MainPage(),
  GAME_PAGE_ROUTE: (context) => GamePage(),
  PROFILE_ROUTE: (context) => ProfilePage(),
  PROFILE_EDIT_ROUTE: (context) => ProfileEditPage(),
};
