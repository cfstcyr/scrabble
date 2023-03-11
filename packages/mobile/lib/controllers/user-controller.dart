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
  final _httpClient = getIt.get<PersonnalHttpClient>();

  Future<PublicUser> editUser(EditableUserFields edits) async {
    return PublicUser.fromJson(jsonDecode((await _httpClient.http
            .patch(Uri.parse("$endpoint/users"), body: edits.toJson()))
        .body));
  }
}
