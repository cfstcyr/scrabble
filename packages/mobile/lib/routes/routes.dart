// ignore_for_file: non_constant_identifier_names, constant_identifier_names

import 'package:mobile/pages/game-page.dart';
import 'package:mobile/pages/home-page.dart';

const HOME_ROUTE = '/home';
const GAME_PAGE_ROUTE = '/game';

final ROUTES = {
  HOME_ROUTE: (context) => HomePage(),
  GAME_PAGE_ROUTE: (context) => GamePage(),
};
