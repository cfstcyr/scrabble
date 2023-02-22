import 'package:flutter/material.dart';
import 'package:mobile/components/game/game_board.dart';
import 'package:mobile/components/player/players_container.dart';
import 'package:mobile/components/tile/tile-rack.dart';
import 'package:mobile/constants/layout.constants.dart';

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
            Container(
              width: 425,
              child: Container(
                child: Column(
                  children: [
                    PlayersContainer(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
