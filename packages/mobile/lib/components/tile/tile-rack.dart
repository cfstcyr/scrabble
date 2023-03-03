import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:rxdart/rxdart.dart';

class TileRack extends StatelessWidget {
  final double _tileSize = 42;
  final BehaviorSubject<int?> _currentTileIndex = BehaviorSubject();
  final BehaviorSubject<int?> _currentHoveredTileIndex = BehaviorSubject();
  final GameService _gameService = getIt.get<GameService>();
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Game?>(
      stream: _gameService.gameStream,
      builder: (context, game) {
        return Card(
          child: Container(
            padding:
                EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
            height: 70,
            child: game.data != null
                ? Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    alignment: WrapAlignment.spaceBetween,
                    spacing: SPACE_4,
                    children: [
                      AppButton(
                        onPressed: () {
                          _gameService.getTileRack().shuffle();
                        },
                        icon: Icons.repeat,
                      ),
                      StreamBuilder(
                          stream: game.data!.tileRack.stream,
                          builder: ((context, snapshot) {
                            return snapshot.data != null
                                ? Wrap(
                                    children: [
                                      _buildTarget(-1,
                                          width: SPACE_2,
                                          height: _tileSize,
                                          changeOnActive: true),
                                      ...List.generate(
                                        snapshot.data!.length,
                                        (index) => _buildTile(
                                            snapshot.data![index], index),
                                      )
                                    ],
                                  )
                                : Container();
                          })),
                      StreamBuilder<bool>(
                        stream: game.data!.board.hasPlacementStream,
                        builder: (context, snapshot) {
                          return AppButton(
                            onPressed: snapshot.data ?? false
                                ? () {
                                    _gameEventService.add<void>(
                                        PUT_BACK_TILES_ON_TILE_RACK, null);
                                  }
                                : null,
                            icon: Icons.close,
                          );
                        },
                      )
                    ],
                  )
                : Container(),
          ),
        );
      },
    );
  }

  Widget _buildTile(c.Tile tile, int index) {
    return Wrap(
      children: [
        Draggable(
            data: tile,
            onDragStarted: () {
              _currentTileIndex.add(index);
              _currentHoveredTileIndex.add(index);
            },
            onDragEnd: (details) {
              _currentTileIndex.add(null);
              _currentHoveredTileIndex.add(null);
            },
            feedback: Tile(
              tile: tile,
              size: _tileSize * 1.1,
              isSelected: true,
            ),
            childWhenDragging: StreamBuilder(
              stream: _currentHoveredTileIndex,
              builder: (context, snapshot) {
                return snapshot.data == index ||
                        snapshot.data == index - 1 ||
                        snapshot.data == null
                    ? SizedBox(
                        height: _tileSize,
                        width: _tileSize + SPACE_2,
                      )
                    : SizedBox();
              },
            ),
            child: Wrap(
              children: [
                Stack(
                  children: [
                    Tile(
                      tile: tile,
                      size: _tileSize,
                    ),
                    Wrap(
                      children: [
                        _buildTarget(index - 1,
                            width: _tileSize / 2, height: _tileSize),
                        _buildTarget(index,
                            width: _tileSize / 2, height: _tileSize),
                      ],
                    ),
                  ],
                ),
                _buildTarget(index,
                    width: SPACE_2, height: _tileSize, changeOnActive: true)
              ],
            )),
      ],
    );
  }

  DragTarget<c.Tile> _buildTarget(int index,
      {double width = 0, double height = 0, bool changeOnActive = false}) {
    return DragTarget<c.Tile>(
      builder: (context, candidateItems, rejectedItems) {
        return StreamBuilder(
            stream: _currentTileIndex.stream,
            builder: (context, currentTileSnapshot) {
              return StreamBuilder(
                stream: _currentHoveredTileIndex.stream,
                builder: (context, currentHoveredTileSnapshot) {
                  return changeOnActive &&
                          currentHoveredTileSnapshot.data == index &&
                          currentTileSnapshot.data != index &&
                          currentTileSnapshot.data != index + 1
                      ? Container(
                          margin: EdgeInsets.symmetric(horizontal: SPACE_2 + 1),
                          child: Opacity(opacity: 0.25, child: Tile()),
                        )
                      : SizedBox(
                          height: height,
                          width: width,
                        );
                },
              );
            });
      },
      onAccept: (data) {
        _gameService.getTileRack().placeTile(data, to: index);
        _currentHoveredTileIndex.add(null);
      },
      onMove: (details) {
        _currentHoveredTileIndex.add(index);
      },
      onLeave: (data) {
        _currentHoveredTileIndex.add(null);
      },
    );
  }
}
