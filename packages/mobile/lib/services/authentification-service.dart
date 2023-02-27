import 'package:mobile/classes/account.dart';
import 'package:mobile/classes/user.dart';
import 'package:rxdart/rxdart.dart';

class AuthentificationService {
  BehaviorSubject<UserSession?> userSession = BehaviorSubject<UserSession?>();
  AuthentificationService._privateConstructor();
  static final AuthentificationService _instance =
      AuthentificationService._privateConstructor();
  factory AuthentificationService() {
    return _instance;
  }

  // final headers = {"Content-type": "application/json"};
  // final accountAuthenticationController =
  //     getIt.get<AccountAuthenticationController>();
  Future<bool> createAccount(Account account) async {
    return true;
    //return await accountAuthenticationController.createAccount(account);
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<bool> isEmailUnique(String email) async {
    return true;
    // return await accountAuthenticationController.isEmailUnique(email);
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<bool> isUsernameUnique(String username) async {
    return true;
    // return await accountAuthenticationController.isUsernameUnique(username);
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<void> signout() async {}
}
