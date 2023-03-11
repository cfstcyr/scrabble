// ignore_for_file: non_constant_identifier_names, constant_identifier_names

import 'dart:js';

import 'package:flutter/material.dart';
import 'package:mobile/pages/home-page.dart';
import 'package:mobile/pages/login-page.dart';
import 'package:mobile/pages/profile-edit-page.dart';
import 'package:mobile/pages/profile-page.dart';

const HOME_ROUTE = '/home';
const PROFILE_ROUTE = '/profile';
const PROFILE_EDIT_ROUTE = '/edit-profile';
const LOGIN_ROUTE = '/login';

final Map<String, Widget Function(BuildContext)> ROUTES = {
  HOME_ROUTE: (context) => HomePage(),
  PROFILE_ROUTE: (context) => ProfilePage(),
  PROFILE_EDIT_ROUTE: (context) => ProfileEditPage(),
  LOGIN_ROUTE: (context) => LoginPage(),
};
