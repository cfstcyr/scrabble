import 'package:mobile/classes/login.dart';

import '../controllers/login-authentification.controller.dart';
import '../locator.dart';

class AuthentificationService {
  AuthentificationService._privateConstructor();

  static final AuthentificationService _instance =
      AuthentificationService._privateConstructor();

  factory AuthentificationService() {
    return _instance;
  }
  // final headers = {"Content-type": "application/json"};
  final authentificationController = getIt.get<AuthentificationController>();

  Future<bool> login(LoginData credentials) async {
    return await authentificationController.login(credentials);
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }
}
