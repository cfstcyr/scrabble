import 'package:mobile/controllers/notification-controller.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import '../locator.dart';

class NotificationService {
  NotificationService._privateConstructor();
  static final NotificationService _instance = NotificationService._privateConstructor();
  StorageHandlerService storageHandlerService = getIt.get<StorageHandlerService>();
  NotificationController notificationController = getIt.get<NotificationController>();

  factory NotificationService() {
    return _instance;
  }
  static bool isNotificationEnabled = true;
  static final notificationMinutesDelay = 5;
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> sendFirebaseToken() async {
    final token = await _firebaseMessaging.getToken();
    notificationController.sendFirebaseToken(token);
  }
}
