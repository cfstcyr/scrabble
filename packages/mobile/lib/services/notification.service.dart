import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:mobile/controllers/notification-controller.dart';
import 'package:mobile/services/storage.handler.dart';

import '../locator.dart';

class NotificationService {
  NotificationService._privateConstructor();

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
  late FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  late NotificationSettings _settings;

  Future init() async {
    final AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    final InitializationSettings initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);

    final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
        FlutterLocalNotificationsPlugin();

    await flutterLocalNotificationsPlugin.initialize(initializationSettings);

    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
            'reminders_channel', 'rappels', 'Rappels de jeu.',
            importance: Importance.max, priority: Priority.max);

    const NotificationDetails platformChannelSpecifics =
        NotificationDetails(android: androidPlatformChannelSpecifics);

    FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      if (message.notification == null) {
        print("notification is empty ${message.notification}");
      }

      RemoteNotification notification = message.notification!;

      await flutterLocalNotificationsPlugin.show(notification.hashCode,
          notification.title, notification.body, platformChannelSpecifics);
    });
  }

  Future<void> sendFirebaseToken() async {
    _settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    print('User granted permission: ${_settings.authorizationStatus}');

    final token = await _firebaseMessaging.getToken();
    if (token == null) print("gg erreur token");
    notificationController.sendFirebaseToken(token!);
  }
}
