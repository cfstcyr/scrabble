import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';

class ThemeColorService {
  ThemeColorService._privateConstructor();

  static final ThemeColorService _instance =
      ThemeColorService._privateConstructor();

  factory ThemeColorService() {
    return _instance;
  }

  BehaviorSubject<Color> themeColor =
      BehaviorSubject<Color>.seeded(Color.fromRGBO(27, 94, 32, 1));

  Color secondaryButton = Color.fromRGBO(216, 216, 216, 1);

  Color cardColor = Color.fromRGBO(255, 255, 255, 1);
}
