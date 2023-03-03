import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/tile/tile.dart';

class GameSquare extends StatelessWidget {
  final Square square;
  final Color color;

  GameSquare({
    required this.square,
  }) : color =
            square.multiplier != null ? square.getColor() : Color(0xFFEEEEEE);

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
        StreamBuilder(
          stream: square.tile,
          builder: (context, snapshot) {
            return DragTarget<c.Tile>(
              builder: (context, candidateData, rejectedData) {
                return candidateData.isNotEmpty && snapshot.data == null
                    ? Container(
                        height: double.maxFinite,
                        width: double.maxFinite,
                        decoration: BoxDecoration(
                          color: Color.fromRGBO(64, 218, 115, .3),
                          borderRadius: BorderRadius.all(Radius.circular(6)),
                          border: Border.all(
                              color: Color.fromRGBO(64, 218, 115, 1), width: 3),
                        ),
                      )
                    : SizedBox(
                        height: double.maxFinite,
                        width: double.maxFinite,
                      );
              },
              onAccept: (data) {
                if (snapshot.data == null) square.setTile(data);
              },
            );
          },
        )
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
                  ? Draggable(
                      data: snapshot.data,
                      feedback: Tile(tile: snapshot.data),
                      child: Tile(tile: snapshot.data))
                  : Opacity(opacity: 0, child: Tile()),
            ],
          );
        });
  }
}
