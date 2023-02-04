import 'package:mobile/classes/login.dart';

import '../controllers/login-authentification.controller.dart';
import '../locator.dart';

class AuthenticationService {
  AuthenticationService._privateConstructor();

  static final AuthenticationService _instance =
      AuthenticationService._privateConstructor();

  factory AuthenticationService() {
    return _instance;
  }
  // final headers = {"Content-type": "application/json"};
  final authenticationController = getIt.get<AuthentificationController>();
  final authentificationController = getIt.get<AuthentificationController>();

  Future<bool> login(LoginData credentials) async {
    return await authenticationController.login(credentials);
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }
}
