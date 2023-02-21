import 'package:get_it/get_it.dart';
import 'package:mobile/controllers/channel.controller.dart';
import 'package:mobile/services/authentification-service.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/theme-color-service.dart';

import 'controllers/account-authentification-controller.dart';

final GetIt getIt = GetIt.instance;

void setUpLocator() {
  getIt.registerLazySingleton<AuthentificationService>(
      () => AuthentificationService());
  getIt.registerLazySingleton<AccountAuthenticationController>(
      () => AccountAuthenticationController());
  getIt.registerLazySingleton<ChannelController>(() => ChannelController());
  getIt.registerLazySingleton<SocketService>(() => SocketService());

  getIt.registerLazySingleton<ThemeColorService>(() => ThemeColorService());
}
