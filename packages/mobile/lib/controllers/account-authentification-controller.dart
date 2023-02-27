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
      await userSessionHandler
          .initializeUserSession(UserSession.fromJson(jsonDecode(res.body)));
      await socketService.initSocket(await storageHandler.getToken());
      print(" init token: ${await storageHandler.getToken()}");
    } else if (res.statusCode == HttpStatus.unauthorized) {
      message = ALREADY_LOGGED_IN_FR;
    } else {
      message = LOGIN_FAILED;
    }
    print("bodyres  : ${res.body}");

    LoginResponse loginResponse = LoginResponse(
        userSession: authService.userSession.valueOrNull,
        authorized: res.statusCode == HttpStatus.ok,
        errorMessage: message);
    print(res.statusCode == HttpStatus.ok);
    return loginResponse;
  }

  Future<TokenValidation> validateToken() async {
    String token = await storageHandler.getToken() ?? "";
    Map<String, String> requestHeaders = {
      'authorization': token,
    };
    print(token);
    print(await storageHandler.getToken());
    if (!token.isEmpty) {
      Response res = await post(Uri.parse("${endpoint}/validate"),
          body: token, headers: requestHeaders);
      if (res.statusCode == HttpStatus.created) {
        userSessionHandler
            .initializeUserSession(UserSession.fromJson(jsonDecode(res.body)));
        return TokenValidation.Ok;
      } else if (res.statusCode == HttpStatus.unauthorized) {
        this.storageHandler.clearStorage();
        this.socketService.disconnect();
        return TokenValidation.AlreadyConnected;
      } else {
        return TokenValidation.UnknownError;
      }
    } else {
      userSessionHandler.clearUserSession();
      return TokenValidation.NoToken;
    }
  }

  Future<void> signOut() async {
    Response res = await get(Uri.parse("${endpoint}/signOut"));
    userSessionHandler.clearUserSession();
    socketService.disconnect();
  }

  Future<void> onRefresh() async {
    userSessionHandler.clearUserSession();
    socketService.disconnect();
  }
}
