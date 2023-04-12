import 'package:firebase_messaging/firebase_messaging.dart';
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
    // await Firebase.initializeApp();
    // await FirebaseMessaging.instance
    //     .setForegroundNotificationPresentationOptions(
    //   alert: true,
    //   badge: true,
    //   sound: true,
    // );

    // final AndroidInitializationSettings initializationSettingsAndroid =
    //     AndroidInitializationSettings('app_icon');
    // final InitializationSettings initializationSettings =
    //     InitializationSettings(android: initializationSettingsAndroid);

    // final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    //     FlutterLocalNotificationsPlugin();

    // await flutterLocalNotificationsPlugin
    //     .resolvePlatformSpecificImplementation<
    //         AndroidFlutterLocalNotificationsPlugin>()
    //     ?.createNotificationChannel(channel);
    // await flutterLocalNotificationsPlugin.initialize(initializationSettings,
    //     onSelectNotification: selectNotification);

    // const AndroidNotificationDetails androidPlatformChannelSpecifics =
    //     AndroidNotificationDetails(
    //         'reminders_channel', 'rappels', 'Rappels de jeu.',
    //         importance: Importance.high, priority: Priority.high);

    // const NotificationDetails platformChannelSpecifics =
    //     NotificationDetails(android: androidPlatformChannelSpecifics);

    FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      if (message.notification == null) {
        print("message is empty ${message.notification}");
      }

      RemoteNotification notification = message.notification!;
      print("HERE ${notification.title}");

      // await flutterLocalNotificationsPlugin.show(notification.hashCode,
      //     notification.title, notification.body, platformChannelSpecifics,
      //     payload: 'i am a payload');
    });
  }

  Future selectNotification(String? payload) async {
    print(payload);
    //Handle notification tapped logic here
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
    print(token);
    if (token == null) print("gg erreur token");
    notificationController.sendFirebaseToken(token!);
  }
}
