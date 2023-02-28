import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';
import 'package:rxdart/rxdart.dart';

class TileRack extends StatelessWidget {
  final double _tileSize = 42;
  final BehaviorSubject<int?> _currentTileIndex = BehaviorSubject();
  final BehaviorSubject<int?> _currentHoveredTileIndex = BehaviorSubject();
  final GameService _gameService = getIt.get<GameService>();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
        height: 70,
        child: Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          alignment: WrapAlignment.spaceEvenly,
          spacing: SPACE_4,
          children: [
            AppButton(
              onPressed: () {},
              icon: Icons.repeat,
              iconOnly: true,
            ),
            StreamBuilder(
                stream: _gameService.getTileRack().stream,
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
                              (index) =>
                                  _buildTile(snapshot.data![index], index),
                            )
                          ],
                        )
                      : Container();
                })),
            AppButton(
              onPressed: null,
              icon: Icons.close,
              size: AppButtonSize.large,
            ),
          ],
        ),
      ),
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
                  // : SizedBox(
                  //     height: height,
                  //     width: width,
                  //   );
                },
              );
            });
      },
      onAccept: (data) {
        _gameService.getTileRack().moveTile(data, index);
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
