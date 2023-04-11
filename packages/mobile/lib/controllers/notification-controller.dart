import 'dart:convert';

import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/client.dart';

class NotificationController {
  NotificationController._privateConstructor();

  static final NotificationController _instance =
      NotificationController._privateConstructor();

  factory NotificationController() {
    return _instance;
  }

  final String endpoint = NOTIFICATION_ENDPOINT;
  final http = getIt.get<PersonnalHttpClient>().http;

  sendFirebaseToken(String token) async {
    http.post(Uri.parse(endpoint), body: jsonEncode({'firebaseToken': token}));
  }
}
