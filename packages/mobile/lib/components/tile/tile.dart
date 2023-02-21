import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/constants/layout.constants.dart';

class Tile extends StatelessWidget {
  Tile({
    this.tile,
    this.size = 40,
  });

  final c.Tile? tile;

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
            image: DecorationImage(
                image: AssetImage("images/tile.png"), fit: BoxFit.contain)),
        child: Stack(
          children: [
            Container(
              transform: Matrix4.translationValues(-1, -1, 0),
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
        ));
  }
}
