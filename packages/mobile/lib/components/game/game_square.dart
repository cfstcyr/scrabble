import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/components/tile/wildcard-dialog.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game.service.dart';

// ignore: constant_identifier_names
const Color NOT_APPLIED_COLOR = Color.fromARGB(255, 66, 135, 69);

class GameSquare extends StatefulWidget {
  final TileRack? tileRack;
  final Square square;
  final Color color;

  GameSquare({
    required this.tileRack,
    required this.square,
  }) : color =
            square.multiplier != null ? square.getColor() : Color(0xFFEEEEEE);

  @override
  State<GameSquare> createState() => _GameSquareState();
}

class _GameSquareState extends State<GameSquare> {
  final GameEventService _gameEventService = getIt.get<GameEventService>();
  late final StreamSubscription<void> _putTilesBackSubscription;

  @override
  void initState() {
    super.initState();
    _putTilesBackSubscription = _gameEventService.listen<void>(
        PUT_BACK_TILES_ON_TILE_RACK, _onPutBackTiles);
  }

  @override
  void dispose() {
    super.dispose();
    _putTilesBackSubscription.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            color: widget.color,
            borderRadius: BorderRadius.all(Radius.circular(6)),
          ),
          child: _getContent(),
        ),
        StreamBuilder<c.Tile?>(
          stream: widget.square.tile,
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
                        _onPlaceTile(context, data);
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
        stream: widget.square.tile,
        builder: (context, snapshot) {
          return Stack(
            alignment: Alignment.center,
            children: [
              widget.square.isCenter
                  ? Container(
                      transform: Matrix4.translationValues(0, -2, 0),
                      child: Text('★', style: TextStyle(fontSize: 24)),
                    )
                  : widget.square.multiplier != null
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              widget.square.multiplier!.getType().toUpperCase(),
                              style: TextStyle(
                                fontSize: 8,
                              ),
                            ),
                            Text(
                              'x${widget.square.multiplier!.value}',
                              style: TextStyle(
                                height: 1,
                              ),
                            )
                          ],
                        )
                      : SizedBox(),
              snapshot.data != null
                  ? StreamBuilder<bool>(
                      stream: widget.square.isAppliedStream,
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
                                    shouldWiggle: true,
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

  _onPlaceTile(BuildContext context, c.Tile tile) async {
    widget.square.setTile(tile);

    if (tile.isWildcard) {
      await triggerWildcardDialog(context, square: widget.square);
    }

    _gameEventService.add<TilePlacement>(PLACE_TILE_ON_BOARD,
        TilePlacement(tile: tile, position: widget.square.position));
  }

  _onPutBackTiles(void _) {
    var tile = widget.square.getTile();

    if (!widget.square.getIsApplied() && tile != null) {
      widget.tileRack?.placeTile(tile);
      removeTile();
    }
  }

  removeTile() {
    var tile = widget.square.getTile();

    if (tile != null) {
      if (tile.isWildcard) tile.playedLetter = null;

      widget.square.removeTile();
      _gameEventService.add<TilePlacement>(REMOVE_TILE_FROM_BOARD,
          TilePlacement(tile: tile, position: widget.square.position));
    }
  }
}
