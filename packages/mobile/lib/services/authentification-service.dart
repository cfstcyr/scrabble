import 'package:mobile/classes/account.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:mobile/services/user-session.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../locator.dart';

class AuthentificationService {
  final storageHandler = getIt.get<StorageHandlerService>();
  final userSessionHandler = getIt.get<UserSessionService>();
  final socketService = getIt.get<SocketService>();
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

  Future<void> signout() async {
    this.socketService.disconnect();
    this.userSessionHandler.clearUserSession();
  }
}

//  signOut(): void {
//         authenticationSettings.remove('token');
//         this.socketService.disconnect();
//         this.userService.user.next(undefined);
//     }