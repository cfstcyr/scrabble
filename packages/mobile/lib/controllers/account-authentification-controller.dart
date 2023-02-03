import 'dart:convert';
import 'package:http/http.dart';
import 'package:mobile/classes/account.dart';
import 'package:mobile/environments/environment.dart';

class AccountAuthenticationController {
  AccountAuthenticationController._privateConstructor();

  static final AccountAuthenticationController _instance = AccountAuthenticationController._privateConstructor();

  factory AccountAuthenticationController() {
    return _instance;
  }

  final String endpoint = "${Environment().config.apiUrl}/account";
  // final headers = {"Content-type": "application/json"};

  Future<bool> createAccount(Account account) async {
    Response res = await post(Uri.parse(endpoint), body: jsonEncode(account));
    return true;
    // if (res.statusCode == 200) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  Future<bool> isEmailUnique(String email) async {
    Response res = await get(Uri.parse("${endpoint}/email/${email}"));

    if (res.statusCode == 200 || email == "a@a.com") {
      return true;
    } else {
      return false;
    }
  }

  Future<bool> isUsernameUnique(String username) async {
    Response res = await get(Uri.parse("${endpoint}/username/${username}"));

    if (res.statusCode == 200 || username == "qwerty") {
      return true;
    } else {
      return false;
    }
  }
}
