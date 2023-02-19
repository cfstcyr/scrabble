import 'package:mobile/classes/account.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';

import '../locator.dart';

class AccountAuthenticationService {
  AccountAuthenticationService._privateConstructor();

  static final AccountAuthenticationService _instance =
      AccountAuthenticationService._privateConstructor();

  factory AccountAuthenticationService() {
    return _instance;
  }
  // final headers = {"Content-type": "application/json"};
  final accountAuthenticationController =
      getIt.get<AccountAuthenticationController>();
  Future<bool> createAccount(Account account) async {
    return await accountAuthenticationController.createAccount(account);
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<bool> isEmailUnique(String email) async {
    return await accountAuthenticationController.isEmailUnique(email);
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<bool> isUsernameUnique(String username) async {
    return await accountAuthenticationController.isUsernameUnique(username);
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }
}
