import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game.service.dart';

// ignore: constant_identifier_names
const Color NOT_APPLIED_COLOR = Color.fromARGB(255, 66, 135, 69);

class GameSquare extends StatelessWidget {
  final GameService _gameService = getIt.get<GameService>();
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  final Square square;
  final Color color;

  GameSquare({
    required this.square,
  }) : color =
            square.multiplier != null ? square.getColor() : Color(0xFFEEEEEE) {
    _gameEventService.listen(PUT_BACK_TILES_ON_TILE_RACK, (_) {
      var tile = square.getTile();

      if (!square.getIsApplied() && tile != null) {
        _gameService.getTileRack().placeTile(tile);
        removeTile();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.all(Radius.circular(6)),
          ),
          child: _getContent(),
        ),
        StreamBuilder<c.Tile?>(
          stream: square.tile,
          builder: (context, snapshot) {
            return snapshot.data != null
                ? SizedBox(
                    height: double.maxFinite,
                    width: double.maxFinite,
                  )
                : DragTarget<c.Tile>(
                    builder: (context, candidateData, rejectedData) {
                      return candidateData.isNotEmpty
                          ? Container(
                              height: double.maxFinite,
                              width: double.maxFinite,
                              decoration: BoxDecoration(
                                color: Color.fromRGBO(64, 218, 115, .3),
                                borderRadius:
                                    BorderRadius.all(Radius.circular(6)),
                                border: Border.all(
                                    color: Color.fromRGBO(64, 218, 115, 1),
                                    width: 3),
                              ),
                            )
                          : SizedBox(
                              height: double.maxFinite,
                              width: double.maxFinite,
                            );
                    },
                    onAccept: (data) {
                      if (snapshot.data == null) {
                        square.setTile(data);
                        _gameEventService.add<TilePlacement>(
                            PLACE_TILE_ON_BOARD,
                            TilePlacement(
                                tile: data, position: square.position));
                      }
                    },
                  );
          },
        ),
      ],
    );
  }

  Widget _getContent() {
    return StreamBuilder(
        stream: square.tile,
        builder: (context, snapshot) {
          return Stack(
            alignment: Alignment.center,
            children: [
              square.isCenter
                  ? Container(
                      transform: Matrix4.translationValues(0, -2, 0),
                      child: Text('★', style: TextStyle(fontSize: 24)),
                    )
                  : square.multiplier != null
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              square.multiplier!.getType().toUpperCase(),
                              style: TextStyle(
                                fontSize: 8,
                              ),
                            ),
                            Text(
                              'x${square.multiplier!.value}',
                              style: TextStyle(
                                height: 1,
                              ),
                            )
                          ],
                        )
                      : SizedBox(),
              snapshot.data != null
                  ? StreamBuilder<bool>(
                      stream: square.isAppliedStream,
                      builder: (context, isAppliedSnapshot) {
                        return isAppliedSnapshot.data ?? false
                            ? Tile(tile: snapshot.data)
                            : Draggable(
                                data: snapshot.data,
                                feedback: Card(
                                  color: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  child: Tile(
                                    tile: snapshot.data,
                                    isSelected: true,
                                    size: TILE_SIZE_DRAG,
                                  ),
                                ),
                                childWhenDragging: Opacity(
                                  opacity: 0,
                                  child: Tile(
                                    tile: snapshot.data,
                                  ),
                                ),
                                child: Tile(
                                  tile: snapshot.data,
                                  tint: NOT_APPLIED_COLOR,
                                ),
                                onDragCompleted: () {
                                  removeTile();
                                },
                              );
                      },
                    )
                  : Opacity(opacity: 0, child: Tile()),
            ],
          );
        });
  }

  removeTile() {
    var tile = square.getTile();
    if (tile != null) {
      square.removeTile();
      _gameEventService.add<TilePlacement>(REMOVE_TILE_FROM_BOARD,
          TilePlacement(tile: tile, position: square.position));
    }
  }
}
