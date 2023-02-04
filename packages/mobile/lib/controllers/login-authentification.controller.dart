import 'package:http/http.dart';
import 'package:mobile/environments/environment.dart';

import '../classes/login.dart';

class AuthentificationController {
  AuthentificationController._privateConstructor();

  static final AuthentificationController _instance =
      AuthentificationController._privateConstructor();

  factory AuthentificationController() {
    return _instance;
  }

  final String endpoint = "${Environment().config.apiUrl}/authentification";
  // final headers = {"Content-type": "application/json"};

  Future<bool> login(LoginData credentials) async {
    Response res =
        await post(Uri.parse("${endpoint}/login"), body: credentials);

    if (res.statusCode == 204) {
      return true;
    } else {
      return false;
    }
  }
}
