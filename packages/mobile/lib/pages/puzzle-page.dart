import 'package:flutter/material.dart';
import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/components/game/game_actions.dart';
import 'package:mobile/components/game/game_board.dart';
import 'package:mobile/components/game/game_info.dart';
import 'package:mobile/components/game/game_timer.dart';
import 'package:mobile/components/player/players_container.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/tile/tile-rack.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';

import '../components/game/game_messages.dart';

class PuzzlePage extends StatefulWidget {
  @override
  State<PuzzlePage> createState() => _PuzzlePageState();
}

class _PuzzlePageState extends State<PuzzlePage> {
  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.shrink();
    // GameService gameService = getIt.get<GameService>();
    //
    // return StreamBuilder<Game?>(
    //     stream: gameService.gameStream,
    //     builder: (context, snapshot) {
    //       if (snapshot.data != null && snapshot.data!.isOver) {
    //         WidgetsBinding.instance.addPostFrameCallback((_) {
    //           gameService.handleEndGame(context);
    //         });
    //       }
    //       return MyScaffold(
    //         title: "Game",
    //         body: Container(
    //           color: Colors.grey.shade100,
    //           padding: EdgeInsets.all(SPACE_1),
    //           child: SafeArea(
    //             child: Row(
    //               mainAxisAlignment: MainAxisAlignment.center,
    //               children: [
    //                 Container(
    //                     child: IntrinsicWidth(
    //                   child: Column(
    //                     crossAxisAlignment: CrossAxisAlignment.stretch,
    //                     children: [
    //                       Expanded(child: GameBoard()),
    //                       TileRack(),
    //                     ],
    //                   ),
    //                 )),
    //                 SizedBox(
    //                   width: 425,
    //                   child: Column(
    //                     crossAxisAlignment: CrossAxisAlignment.stretch,
    //                     children: [
    //                       PlayersContainer(),
    //                       Row(
    //                         children: [
    //                           Expanded(
    //                             child: GameInfo(
    //                                 value: snapshot.data != null
    //                                     ? snapshot.data!
    //                                         .computeNumberOfTilesLeft()
    //                                         .toString()
    //                                     : '0',
    //                                 name: "Tuiles restantes",
    //                                 icon: Icons.font_download),
    //                           ),
    //                           Expanded(
    //                             child: GameTimer(),
    //                           ),
    //                         ],
    //                       ),
    //                       Expanded(child: GameMessages()),
    //                       GameActions(),
    //                     ],
    //                   ),
    //                 ),
    //               ],
    //             ),
    //           ),
    //         ),
    //       );
    //     });
  }
}
