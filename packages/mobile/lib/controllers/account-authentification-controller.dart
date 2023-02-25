import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart';
import 'package:mobile/classes/account.dart';
import 'package:mobile/classes/login.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/login-constants.dart';
import 'package:mobile/environments/environment.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:mobile/services/user-session.service.dart';

import '../locator.dart';
import '../services/authentification-service.dart';
import '../services/socket.service.dart';

class AccountAuthenticationController {
  AccountAuthenticationController._privateConstructor();

  static final AccountAuthenticationController _instance =
      AccountAuthenticationController._privateConstructor();

  factory AccountAuthenticationController() {
    return _instance;
  }
  final storageHandler = getIt.get<StorageHandlerService>();
  final authService = getIt.get<AuthentificationService>();
  final userSessionHandler = getIt.get<UserSessionService>();
  final socketService = getIt.get<SocketService>();

  final String endpoint = "${Environment().config.apiUrl}/authentification";
  // final headers = {"Content-type": "application/json"};

  Future<bool> createAccount(Account account) async {
    Response res =
        await post(Uri.parse("${endpoint}/signUp"), body: jsonEncode(account));
    print(jsonEncode(account));
    // TODO: Remove hack
    return (res.statusCode == 200 || account.password == "qwe123Q!");
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<bool> isEmailUnique(String email) async {
    Response res = await get(Uri.parse("${endpoint}/email/${email}"));

    // TODO: Remove hack
    return (res.statusCode == 200 || email == "a@a.com");
    // {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<bool> isUsernameUnique(String username) async {
    Response res = await get(Uri.parse("${endpoint}/username/${username}"));
    // TODO: Remove hack
    return (res.statusCode == 200 || username == "qwerty");
    //  {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<LoginResponse> login(UserLoginCredentials credentials) async {
    Response res =
        await post(Uri.parse("${endpoint}/login"), body: credentials.toJson());
    String message;
    if (res.statusCode == HttpStatus.ok) {
      message = AUTHORIZED;
      storageHandler.setToken(UserSession.fromJson(jsonDecode(res.body)).token);
      socketService.initSocket();
    } else if (res.statusCode == HttpStatus.notAcceptable) {
      message = LOGIN_FAILED;
    } else {
      message = ALREADY_LOGGED_IN_FR;
    }
    userSessionHandler
        .initializeUserSession(UserSession.fromJson(jsonDecode(res.body)));
    LoginResponse loginResponse = LoginResponse(
        userSession: authService.userSession.value,
        authorized: res.statusCode == HttpStatus.ok,
        errorMessage: message);
    return loginResponse;
  }

  Future<TokenValidation> validateToken() async {
    String? token = await userSessionHandler.getToken();
    if (token != null) {
      Response res = await post(Uri.parse("${endpoint}/validate"), body: token);
      if (res.statusCode == HttpStatus.created) {
        // Redirect to Home page
        return TokenValidation.Ok;
      } else if (res.statusCode == HttpStatus.unauthorized) {
        // Token expired -> Redirect to login page
        this.storageHandler.clearStorage();
        return TokenValidation.AlreadyConnected;
      } else {
        return TokenValidation.UnknownError;
      }
    }
    return TokenValidation.NoToken;
  }

  Future<void> signOut() async {
    Response res = await get(Uri.parse("${endpoint}/signOut"));
    userSessionHandler.clearUserSession();
    socketService.disconnect();
  }
}


// signOut(): void {
//         authenticationSettings.remove('token');
//         this.socketService.disconnect();
//         this.userService.user.next(undefined);
//     }

//  private handleUserSessionInitialisation(session: UserSession): void {
//         authenticationSettings.setToken(session.token);
//         this.userService.user.next(session.user);
//         this.socketService.connectSocket();
//     }