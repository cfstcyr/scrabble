import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/multiplier.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/constants/layout.constants.dart';

class GameSquare extends StatelessWidget {
  final Square square;
  Color color = Color(0xFFEEEEEE);
  
  GameSquare({
    required this.square,
  }) {
    if (square.multiplier != null) {
      color = square.getColor();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.all(Radius.circular(6)),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: getChildren(),
      ),
    );
  }

  List<Widget> getChildren() {
    List<Widget> children = [];

    if (square.isCenter == true) {
      children.add(
        Container(
          transform: Matrix4.translationValues(0, -2, 0),
          child: Text('★', style: TextStyle(fontSize: 24)),
        )
      );
    } else if (square.multiplier != null) {
      children.add(
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              square.multiplier!.getType().toUpperCase(),
              style: TextStyle(
                fontSize: 8,
              ),
            ),
            Text(
              'x${square.multiplier?.value ?? ''}',
              style: TextStyle(
                height: 1,
                // backgroundColor: Colors.red
              ),
            )
          ],
        ),
      );
    }

    if (square.tile != null) {
      children.add(Container(
        child: Tile(tile: square.tile),
      ));
    }

    return children;
  }
}
