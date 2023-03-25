import 'package:get_it/get_it.dart';
import 'package:mobile/controllers/game-creation-controller.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/controllers/group-join-controller.dart';
import 'package:mobile/controllers/user-controller.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/channel.service.dart';
import 'package:mobile/services/chat-management.service.dart';
import 'package:mobile/services/client.dart';
import 'package:mobile/services/end-game.service.dart';
import 'package:mobile/services/game-creation-service.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/group-join.service.dart';
import 'package:mobile/services/initializer.service.dart';
import 'package:mobile/services/player-leave-service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/user-session.service.dart';
import 'package:mobile/services/user.service.dart';

import 'controllers/account-authentification-controller.dart';
import 'services/chat.service.dart';

final GetIt getIt = GetIt.instance;

class CustomLocator {
  static final CustomLocator _instance = CustomLocator._();

  factory CustomLocator() {
    return _instance;
  }

  CustomLocator._();

  void setUpLocator() {
    _registerLazySingletons();
    _registerActiveSingleton();
  }

  void _registerLazySingletons() {
    getIt.registerLazySingleton<PersonnalHttpClient>(
        () => PersonnalHttpClient());
    getIt.registerLazySingleton<StorageHandlerService>(
        () => StorageHandlerService());

    getIt.registerLazySingleton<UserService>(() => UserService());
    getIt.registerLazySingleton<UserSessionService>(() => UserSessionService());
    getIt.registerLazySingleton<UserController>(() => UserController());

    getIt.registerLazySingleton<SocketService>(() => SocketService());
    getIt.registerLazySingleton<GameEventService>(() => GameEventService());
    getIt.registerLazySingleton<ChatManagementService>(
        () => ChatManagementService());
    getIt.registerLazySingleton<ChannelService>(() => ChannelService());
    getIt.registerLazySingleton<RoundService>(() => RoundService());

    getIt.registerLazySingleton<ThemeColorService>(() => ThemeColorService());
    getIt.registerLazySingleton<GroupJoinController>(
        () => GroupJoinController());
    getIt.registerLazySingleton<GroupJoinService>(() => GroupJoinService());

    getIt.registerLazySingleton<GamePlayController>(() => GamePlayController());
    getIt.registerLazySingleton<ActionService>(() => ActionService());
    getIt.registerLazySingleton<PlayerLeaveService>(() => PlayerLeaveService());

    getIt.registerLazySingleton<GameCreationController>(
        () => GameCreationController());
  }

  void _registerActiveSingleton() {
    getIt.registerSingleton<ChatService>(
        ChatService());
    getIt.registerSingleton<AccountAuthenticationController>(
        AccountAuthenticationController());
    getIt.registerSingleton<InitializerService>(InitializerService());
    getIt.registerSingleton<GameCreationService>(GameCreationService());
    getIt.registerSingleton<GameService>(GameService());
    getIt.registerSingleton<EndGameService>(EndGameService());
    getIt.registerSingleton<GameMessagesService>(GameMessagesService());
  }
}
