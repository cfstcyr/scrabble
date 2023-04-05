import 'package:flutter/material.dart';
import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/tile/tile-rack/shuffle-tile-rack-button.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:rxdart/rxdart.dart';
import 'package:mobile/classes/tile/tile-rack.dart' as p;

abstract class AbstractTileRack extends StatelessWidget {
  AbstractTileRack({required this.gameStream});

  final ValueStream<AbstractGame?> gameStream;
  final BehaviorSubject<int?> _currentTileIndex = BehaviorSubject();
  final BehaviorSubject<int?> _currentHoveredTileIndex = BehaviorSubject();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AbstractGame?>(
      stream: gameStream,
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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: startOfTileRackButtons(
                            tileRack: game.data!.tileRack),
                      ),
                      playerTileRack(game.data!.tileRack.stream),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisSize: MainAxisSize.min,
                        children: endOfTileRackButtons(
                            game.data!.tileRack, game.data!.board),
                      )
                    ],
                  )
                : Container(),
          ),
        );
      },
    );
  }

  List<Widget> endOfTileRackButtons(p.TileRack tileRack, Board board);

  Widget buildTile(c.Tile tile, int index);

  List<Widget> startOfTileRackButtons({required p.TileRack tileRack}) {
    return List.of([ShuffleTileRackButton(tileRack: tileRack)]);
  }

  Widget playerTileRack(Stream<List<c.Tile>> tilesStream) {
    return StreamBuilder(
        stream: tilesStream,
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
                      (index) => buildTile(snapshot.data![index], index),
                    )
                  ],
                )
              : Container();
        }));
  }

  Widget buildDraggableTile(c.Tile tile, int index) {
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
            child: buildWrappedTile(tile, index, false)),
      ],
    );
  }

  Widget buildWrappedTile(c.Tile tile, int index, bool shouldWiggle) {
    return Wrap(
      children: [
        Stack(
          children: [
            Tile(
                tile: tile,
                size: TILE_SIZE,
                shouldWiggle: shouldWiggle),
            Wrap(
              children: [
                _buildTarget(index - 1, width: TILE_SIZE / 2, height: TILE_SIZE),
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

  StreamBuilder<AbstractGame?> _buildTarget(int index,
      {double width = 0, double height = 0, bool changeOnActive = false}) {
    return StreamBuilder<AbstractGame?>(
        stream: gameStream,
        builder: (context, snapshot) {
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
                                margin: EdgeInsets.symmetric(
                                    horizontal: SPACE_2 + 1),
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
              snapshot.data!.tileRack.placeTile(data, to: index);
              _currentHoveredTileIndex.add(null);
            },
            onMove: (details) {
              _currentHoveredTileIndex.add(index);
            },
            onLeave: (data) {
              _currentHoveredTileIndex.add(null);
            },
          );
        });
  }
}
