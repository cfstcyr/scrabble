import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/components/game/game_actions.dart';
import 'package:mobile/components/game/game_board.dart';
import 'package:mobile/components/game/game_info.dart';
import 'package:mobile/components/game/game_timer.dart';
import 'package:mobile/components/player/players_container.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/tile/tilerack/abstract-tile-rack.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/initializer.service.dart';
import 'package:mobile/services/player-leave-service.dart';

import '../components/game/game_messages.dart';

class GamePage extends StatefulWidget {
  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> with WidgetsBindingObserver {
  PlayerLeaveService _playerLeaveService = getIt.get<PlayerLeaveService>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    super.dispose();
    WidgetsBinding.instance.removeObserver(this);
  }

  @override
  Future<void> didChangeAppLifecycleState(AppLifecycleState state) async {
    if (state == AppLifecycleState.paused) getIt.get<GamePlayController>().leaveGame();
    if (state == AppLifecycleState.resumed) {
      InitializerService initializerService = getIt.get<InitializerService>();
      await initializerService.initialize();
      String entryPage = initializerService.entryPageStream.value ?? LOGIN_ROUTE;
      Navigator.pushNamedAndRemoveUntil(navigatorKey.currentContext!, entryPage, (route) => route.settings.name == entryPage);
    }
  }

  @override
  Widget build(BuildContext context) {
    GameService gameService = getIt.get<GameService>();

    return StreamBuilder<MultiplayerGame?>(
        stream: gameService.gameStream,
        builder: (context, snapshot) {
          if (snapshot.data != null && snapshot.data!.isOver) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              gameService.handleEndGame(context);
            });
          }
          return MyScaffold(
            title: "Partie Multijoueur",
            body: Container(
              color: Colors.grey.shade100,
              padding: EdgeInsets.all(SPACE_1),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                        child: IntrinsicWidth(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(child: GameBoard(gameStream: gameService.gameStream,)),
                          MultiplayerTileRack(),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
      onWillPop: () => _handleBack(context),
    );
  }

  Future<bool> _handleBack(BuildContext context) {
    _playerLeaveService.abandonGame(context);
    return Future.value(true);
  }
}
