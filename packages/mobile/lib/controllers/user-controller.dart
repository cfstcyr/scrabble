import 'dart:convert';

import 'package:mobile/classes/user.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/client.dart';
import 'package:mobile/environments/environment.dart';

class UserController {
  UserController._privateConstructor();

  static final UserController _instance = UserController._privateConstructor();

  factory UserController() {
    return _instance;
  }

  final String endpoint = "${Environment().config.apiUrl}";
  final _http = getIt.get<PersonnalHttpClient>().http;

  Future<PublicUser> editUser(EditableUserFields edits) async {
    return PublicUser.fromJson(jsonDecode(
        (await _http.patch(Uri.parse("$endpoint/users"), body: edits.toJson()))
            .body));
  }

  Future<UserStatistics> getUserStatistics() async {
    return UserStatistics.fromJson(jsonDecode(
        (await _http.get(Uri.parse("$endpoint/users/statistics"))).body));
  }
}
