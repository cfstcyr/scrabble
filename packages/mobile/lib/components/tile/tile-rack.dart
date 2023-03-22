import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game-observer-service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:rxdart/rxdart.dart';

class TileRack extends StatelessWidget {
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
                    children: [
                      AppButton(
                        onPressed: () {
                          _gameService.getTileRack().shuffle();
                        },
                        icon: Icons.repeat,
                        iconOnly: true,
                      ),
                      StreamBuilder(
                          stream: game.data!.tileRack.stream,
                          builder: ((context, snapshot) {
                            return snapshot.data != null
                                ? Wrap(
                                    children: [
                                      _buildTarget(-1,
                                          width: SPACE_2,
                                          height: TILE_SIZE,
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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          StreamBuilder<bool>(
                              stream: game.data!.tileRack.isExchangeModeEnabled,
                              builder: (context, snapshot) {
                                return ToggleButtons(
                                    isSelected: [snapshot.data ?? false],
                                    onPressed: (int index) {
                                      game.data!.tileRack.toggleExchangeMode();
                                      _gameEventService.add<void>(
                                          PUT_BACK_TILES_ON_TILE_RACK, null);
                                    },
                                    borderRadius: BorderRadius.circular(8),
                                    constraints: BoxConstraints(
                                        maxWidth: 36,
                                        maxHeight: 36,
                                        minHeight: 36,
                                        minWidth: 36),
                                    fillColor: Theme.of(context).primaryColor,
                                    selectedColor: Colors.white,
                                    color: Theme.of(context).primaryColor,
                                    children: [Icon(Icons.swap_horiz_rounded)]);
                              }),
                          SizedBox(
                            width: SPACE_2,
                          ),
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
                                icon: Icons.clear,
                                iconOnly: true,
                              );
                            },
                          ),
                        ],
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
    return StreamBuilder<bool>(
        stream: _gameService.getTileRack().isExchangeModeEnabled,
        builder: (context, isExchangeModeEnabled) {
          return isExchangeModeEnabled.data == null ||
                  isExchangeModeEnabled.data == false
              ? _buildDraggableTile(tile, index)
              : _buildSelectableTile(tile, index, true);
        });
  }

  Widget _buildDraggableTile(c.Tile tile, int index) {
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
            feedback: Card(
              color: Colors.transparent,
              shadowColor: Colors.transparent,
              child: Tile(
                tile: tile,
                size: TILE_SIZE_DRAG,
                shouldWiggle: true,
              ),
            ),
            childWhenDragging: StreamBuilder(
              stream: _currentHoveredTileIndex,
              builder: (context, snapshot) {
                return snapshot.data == index ||
                        snapshot.data == index - 1 ||
                        snapshot.data == null
                    ? SizedBox(
                        height: TILE_SIZE,
                        width: TILE_SIZE + SPACE_2,
                      )
                    : SizedBox();
              },
            ),
            child: _buildWrappedTile(tile, index, false)),
      ],
    );
  }

  Widget _buildSelectableTile(c.Tile tile, int index, bool shouldWiggle) {
    return StreamBuilder(
        stream: _gameService.tileRackStream,
        builder: (context, snapshot) {
          return GestureDetector(
              onTap: snapshot.data != null
                  ? () => snapshot.data!.toggleSelectedTile(tile)
                  : null,
              child: _buildWrappedTile(tile, index, shouldWiggle));
        });
  }

  Widget _buildWrappedTile(c.Tile tile, int index, bool shouldWiggle) {
    return Wrap(
      children: [
        Stack(
          children: [
            Tile(
              tile: tile,
              size: TILE_SIZE,
              shouldWiggle: shouldWiggle,
            ),
            Wrap(
              children: [
                _buildTarget(index - 1,
                    width: TILE_SIZE / 2, height: TILE_SIZE),
                _buildTarget(index, width: TILE_SIZE / 2, height: TILE_SIZE),
              ],
            ),
          ],
        ),
        _buildTarget(index,
            width: SPACE_2, height: TILE_SIZE, changeOnActive: true)
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

class TileRackObserver extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
        stream: getIt.get<GameObserverService>().tilesStream,
        builder: ((context, snapshot) {
          return snapshot.data != null
              ? Wrap(
                  children: [
                    ...List.generate(
                      snapshot.data!.length,
                      (index) => Card(
                        color: Colors.transparent,
                        shadowColor: Colors.transparent,
                        child: Tile(
                          tile: snapshot.data![index],
                          size: TILE_SIZE_DRAG,
                          shouldWiggle: true,
                        ),
                      ),
                    )
                  ],
                )
              : Container();
        }));
  }
}
