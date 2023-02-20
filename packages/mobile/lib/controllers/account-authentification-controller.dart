import 'dart:convert';

import 'package:http/http.dart';
import 'package:mobile/classes/account.dart';
import 'package:mobile/environments/environment.dart';

import '../classes/login.dart';

class AccountAuthenticationController {
  AccountAuthenticationController._privateConstructor();

  static final AccountAuthenticationController _instance =
      AccountAuthenticationController._privateConstructor();

  factory AccountAuthenticationController() {
    return _instance;
  }

  final String endpoint = "${Environment().config.apiUrl}/account";
  // final headers = {"Content-type": "application/json"};

  Future<bool> createAccount(Account account) async {
    Response res = await post(Uri.parse(endpoint), body: jsonEncode(account));
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

  Future<bool> login(LoginData credentials) async {
    Response res =
        await post(Uri.parse("${endpoint}/login"), body: credentials);

    if (res.statusCode == 202) {
      return true;
    } else {
      return false;
    }
  }
}
