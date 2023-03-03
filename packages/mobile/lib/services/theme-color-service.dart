import 'dart:convert';
import 'dart:ui';
import 'package:http/http.dart';
import 'package:mobile/classes/account.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/environments/environment.dart';

import '../locator.dart';

class ThemeColorService {
  ThemeColorService._privateConstructor();

  static final ThemeColorService _instance = ThemeColorService._privateConstructor();

  factory ThemeColorService() {
    return _instance;
  }

  Color themeColor = Color.fromRGBO(27, 94, 32, 1);

  Color secondaryButton = Color.fromRGBO(216, 216, 216, 1);

  Color cardColor = Color.fromRGBO(255, 255, 255, 1);
}
