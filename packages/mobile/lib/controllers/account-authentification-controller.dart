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
import '../services/socket.service.dart';

class AccountAuthenticationController {
  AccountAuthenticationController._privateConstructor();

  static final AccountAuthenticationController _instance =
      AccountAuthenticationController._privateConstructor();

  factory AccountAuthenticationController() {
    return _instance;
  }
  final storageHandler = getIt.get<StorageHandlerService>();
  final userSessionHandler = getIt.get<UserSessionService>();
  final socketService = getIt.get<SocketService>();

  final String endpoint = "${Environment().config.apiUrl}/authentification";

  Future<bool> createAccount(Account account) async {
    Response res =
        await post(Uri.parse("${endpoint}/signUp"), body: account.toJson());
    bool isCreated = res.statusCode == HttpStatus.ok;
    if (isCreated) {
      await userSessionHandler
          .initializeUserSession(UserSession.fromJson(jsonDecode(res.body)));
      await socketService.initSocket(await storageHandler.getToken());
    }
    return isCreated;
    ;
  }

  Future<bool> isEmailUnique(String email) async {
    Response res =
        await post(Uri.parse("${endpoint}/validateEmail"), body: email);
    return (res.statusCode == HttpStatus.ok || true);
  }

  Future<bool> isUsernameUnique(String username) async {
    Response res =
        await post(Uri.parse("${endpoint}/validateUsername"), body: username);
    return (res.statusCode == HttpStatus.ok || true);
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
    } else if (res.statusCode == HttpStatus.unauthorized) {
      message = ALREADY_LOGGED_IN_FR;
    } else {
      message = LOGIN_FAILED;
    }

    LoginResponse loginResponse = LoginResponse(
        userSession: userSessionHandler.getSession(),
        isAuthorized: res.statusCode == HttpStatus.ok,
        errorMessage: message);
    return loginResponse;
  }

  Future<TokenValidation> validateToken() async {
    String token = await storageHandler.getToken() ?? "";
    Map<String, String> requestHeaders = {
      'authorization': "Bearer ${token}",
    };
    if (token.isNotEmpty) {
      Response res = await post(Uri.parse("${endpoint}/validate"),
          body: token, headers: requestHeaders);
      if (res.statusCode == HttpStatus.ok) {
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
    userSessionHandler.clearUserSession();
    socketService.disconnect();
  }
}
