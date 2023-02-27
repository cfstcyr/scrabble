import 'package:get_it/get_it.dart';
import 'package:mobile/controllers/channel.controller.dart';
import 'package:mobile/services/authentification-service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/user-session.service.dart';
import 'package:mobile/services/user.service.dart';

import 'controllers/account-authentification-controller.dart';

final GetIt getIt = GetIt.instance;

void setUpLocator() {
  getIt.registerLazySingleton<StorageHandlerService>(
      () => StorageHandlerService());
  getIt.registerLazySingleton<UserService>(() => UserService());
  getIt.registerLazySingleton<UserSessionService>(() => UserSessionService());
  getIt.registerLazySingleton<AuthentificationService>(
      () => AuthentificationService());
  getIt.registerLazySingleton<AccountAuthenticationController>(
      () => AccountAuthenticationController());
  getIt.registerLazySingleton<ChannelController>(() => ChannelController());
  getIt.registerLazySingleton<SocketService>(() => SocketService());
  getIt.registerLazySingleton<GameService>(() => GameService());

  getIt.registerLazySingleton<ThemeColorService>(() => ThemeColorService());
}
