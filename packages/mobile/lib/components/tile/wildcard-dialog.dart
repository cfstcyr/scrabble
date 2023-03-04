import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';

Future<void> triggerWildcardDialog(BuildContext context,
    {required Square square}) {
  return showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(CHOOSE_LETTER_FOR_WILDCARD),
          surfaceTintColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          content: SizedBox(
            width: 400,
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: SPACE_1,
              runSpacing: SPACE_1,
              children: ALPHABET
                  .split('')
                  .map((letter) => InkWell(
                        onTap: () {
                          var tile = square.getTile();

                          if (tile == null) {
                            throw Exception(
                                CANNOT_SET_LETTER_FOR_WILDCARD_SQUARE_EMPTY);
                          }

                          tile.playedLetter = letter;

                          square.setTile(tile);

                          Navigator.of(context).pop();
                        },
                        child: Tile(
                          tile: c.Tile(letter: letter),
                        ),
                      ))
                  .toList(),
            ),
          ),
        );
      });
}
