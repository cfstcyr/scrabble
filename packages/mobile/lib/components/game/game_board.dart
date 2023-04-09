import 'package:flutter/material.dart';
import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/vector.dart';
import 'package:mobile/components/game/game_square.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:rxdart/rxdart.dart';

import '../../constants/game.constants.dart';

class GameBoard extends StatelessWidget {
  GameBoard({required this.gameStream, this.isInteractable = true, this.size = 630, this.isLocalPlayerPlaying})
      : assert(
            gameStream is ValueStream<MultiplayerGame?>
                ? isLocalPlayerPlaying != null
                : true,
            'You have to define a isLocalPlayerPlaying stream in a Multiplayer Game');

  final Stream<AbstractGame?> gameStream;
  final Stream<bool>? isLocalPlayerPlaying;
  final bool isInteractable;
  double size;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        padding: EdgeInsets.all(SPACE_2),
        child: AspectRatio(
          aspectRatio: 1,
          child: StreamBuilder<dynamic>(
            stream: gameBoardStream(),
            builder: (context, snapshot) {
              if (!snapshot.hasData) return SizedBox.shrink();

              AbstractGame? game = snapshot.data! is List ? snapshot.data![0] : snapshot.data!;
              bool isLocalPlayerPlaying = game is MultiplayerGame? ? snapshot.data![1] : true;

              return GridView.count(
                crossAxisCount: GRID_SIZE,
                physics: NeverScrollableScrollPhysics(),
                mainAxisSpacing: SPACE_1 / 2,
                crossAxisSpacing: SPACE_1 / 2,
                shrinkWrap: true,
                childAspectRatio: 1,
                children: List.generate(GRID_SIZE * GRID_SIZE, (index) {
                  var position = Position.fromVec2(Vec2.from1D(index));
                  return GameSquare(
                    tileRack: game?.tileRack,
                    square: game?.board.getSquare(position) ??
                        Square(position: Position(0, 0)),
                      isLocalPlayerPlaying: isLocalPlayerPlaying,
                    boardSize: size,
                    isInteractable: isInteractable,
                  );
                }),
              );
            },
          ),
        ),
      ),
    );
  }

  Stream<dynamic> gameBoardStream() {
    if (isLocalPlayerPlaying == null) return gameStream;
    return CombineLatestStream<dynamic, dynamic>([gameStream, isLocalPlayerPlaying!], (values) => values);
  }
}
