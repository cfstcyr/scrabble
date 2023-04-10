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

  GameBoard({required this.gameStream, this.isInteractable = true, this.size = 630});

  final Stream<AbstractGame?> gameStream;
  final bool isInteractable;
  double size;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        padding: EdgeInsets.all(SPACE_2),
        child: AspectRatio(
          aspectRatio: 1,
          child: StreamBuilder<AbstractGame?>(
            stream: gameStream,
            builder: (context, snapshot) {
              return GridView.count(
                crossAxisCount: GRID_SIZE + 1,
                physics: NeverScrollableScrollPhysics(),
                mainAxisSpacing: SPACE_1 / 2,
                crossAxisSpacing: SPACE_1 / 2,
                shrinkWrap: true,
                childAspectRatio: 1,
                children: _buildGridChildren(snapshot),
              );
            },
          ),
        ),
      ),
    );
  }

  List<Widget> _buildGridChildren(AsyncSnapshot<AbstractGame?> snapshot) {
    List<Widget> children = [];

    // add the column headers row
    children.add(_buildGridNumber(''));
    for (int col = 0; col < GRID_SIZE; col++) {
      children.add(_buildGridNumber((col + 1).toString()));
    }

    for (int row = 0; row < GRID_SIZE; row++) {
      // add the row header cell
      children
          .add(_buildGridNumber(String.fromCharCode('A'.codeUnitAt(0) + row)));

      for (int col = 0; col < GRID_SIZE; col++) {
        var position = Position(row, col);
        children.add(GameSquare(
          tileRack: snapshot.hasData ? snapshot.data!.tileRack : null,
          square: snapshot.data?.board.getSquare(position) ??
              Square(position: Position(0, 0)),
          boardSize: size,
          isInteractable: isInteractable,
        ));
      }
    }

    return children;
  }

  Widget _buildGridNumber(String number) {
    return Container(
      alignment: Alignment.center,
      color: Colors.white,
      child: Text(
        number is int ? number.toString() : number,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
          fontFamily: 'CaveStoryRegular',
        ),
      ),
    );
  }
}
