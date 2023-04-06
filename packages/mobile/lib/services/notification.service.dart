import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:mobile/controllers/notification-controller.dart';
import 'package:mobile/services/storage.handler.dart';

import '../locator.dart';

class NotificationService {
  NotificationService._privateConstructor() {
    _firebaseMessaging = FirebaseMessaging.instance;
  }

  static final NotificationService _instance =
      NotificationService._privateConstructor();
  StorageHandlerService storageHandlerService =
      getIt.get<StorageHandlerService>();
  NotificationController notificationController =
      getIt.get<NotificationController>();

  factory NotificationService() {
    return _instance;
  }
  static bool isNotificationEnabled = true;
  static final notificationMinutesDelay = 5;
  late FirebaseMessaging _firebaseMessaging;

  Future<void> sendFirebaseToken() async {
    final token = await _firebaseMessaging.getToken();
    if (token == null) print("gg erreur token");
    notificationController.sendFirebaseToken(token!);
  }
}
