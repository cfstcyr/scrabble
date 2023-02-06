import 'package:get_it/get_it.dart';
import 'package:mobile/controllers/chat.controller.dart';
import 'package:mobile/services/account-authentification-service.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/theme-color-service.dart';

import 'controllers/account-authentification-controller.dart';

final GetIt getIt = GetIt.instance;

void setUpLocator() {
  getIt.registerLazySingleton<AccountAuthenticationService>(
      () => AccountAuthenticationService());
  getIt.registerLazySingleton<AccountAuthenticationController>(
      () => AccountAuthenticationController());
  getIt.registerLazySingleton<ChatController>(() => ChatController());
  getIt.registerLazySingleton<SocketService>(() => SocketService());

  getIt.registerLazySingleton<ThemeColorService>(() => ThemeColorService());
}
