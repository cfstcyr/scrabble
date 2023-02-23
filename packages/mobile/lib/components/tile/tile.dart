import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/constants/layout.constants.dart';

class Tile extends StatelessWidget {
  Tile({
    this.tile,
    this.size = 40,
    this.tint = Colors.transparent,
  });

  final c.Tile? tile;

  final double size;

  final Color tint;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: size,
          width: size,
          decoration: BoxDecoration(
            color: Colors.orange,
            borderRadius: BorderRadius.all(Radius.circular(6 * size / 40)),
          ),
          clipBehavior: Clip.antiAlias,
          child: ColorFiltered(
            colorFilter: ColorFilter.mode(tint, BlendMode.color),
            child: Image.asset(
              "images/tile.png",
              height: size,
              width: size,
            ),
          ),
        ),
        SizedBox(
            width: size,
            height: size,
            child: Stack(
              children: [
                Container(
                  transform: tile?.value != null
                      ? Matrix4.translationValues(-1, -1, 0)
                      : Matrix4.translationValues(0, 0, 0),
                  child: Center(
                    child: Text(
                      tile?.letter ?? '',
                      style: TextStyle(
                        color: Color.fromRGBO(80, 55, 10, 1),
                        fontWeight: FontWeight.w600,
                        fontSize: size / 1.7,
                      ),
                    ),
                  ),
                ),
                Container(
                  width: double.maxFinite,
                  padding: EdgeInsets.only(
                    bottom: 2,
                    right: 4,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${tile?.value ?? ''}',
                        style: TextStyle(
                          fontSize: size / 3.5,
                          fontWeight: FontWeight.w600,
                        ),
                      )
                    ],
                  ),
                )
              ],
            ))
      ],
    );
  }
}
