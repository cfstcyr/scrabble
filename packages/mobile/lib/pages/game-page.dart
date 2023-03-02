import 'package:flutter/material.dart';
import 'package:mobile/components/animation/pulse.dart';
import 'package:mobile/components/game/game_actions.dart';
import 'package:mobile/components/game/game_board.dart';
import 'package:mobile/components/game/game_info.dart';
import 'package:mobile/components/game/game_timer.dart';
import 'package:mobile/components/player/players_container.dart';
import 'package:mobile/components/tile/tile-rack.dart';
import 'package:mobile/components/timer.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';

import '../components/game/game_messages.dart';

class GamePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
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
                  Expanded(child: GameBoard()),
                  TileRack(),
                ],
              ),
            )),
            SizedBox(
              width: 425,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  PlayersContainer(),
                  Row(
                    children: [
                      Expanded(
                        child: GameInfo(
                            value: "12",
                            name: "Tuiles restantes",
                            icon: Icons.font_download),
                      ),
                      Expanded(
                        child: GameTimer(),
                      ),
                    ],
                  ),
                  Expanded(child: GameMessages()),
                  GameActions(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  State<StatefulWidget> createState() {
    // TODO: implement createState
    throw UnimplementedError();
  }
}
