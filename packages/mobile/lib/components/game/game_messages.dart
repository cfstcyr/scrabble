import 'package:flutter/material.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/utils/game_messages.dart';

class GameMessages extends StatelessWidget {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: SingleChildScrollView(
        reverse: true,
        // dragStartBehavior: DragStartBehavior.down,
        padding: EdgeInsets.symmetric(
          vertical: SPACE_2,
          horizontal: SPACE_3,
        ),
        child: Container(
          child: Column(children: [
            _buildMessage(
                "Aristotefdsahfudsahgufhduyhuib a placé BONJOUR pour 8 points"),
            _buildMessage("Aristote (débutant) a placé OEL pour 13 points"),
            _buildMessage("Aristote (débutant) a placé DSAF pour 13 points"),
            _buildMessage("Vous avez placé N pour 2 points"),
            _buildMessage("Aristote (débutant) a placé GFDS pour 13 points"),
            _buildMessage("Aristote (débutant) a placé A pour 13 points"),
            _buildMessage("Aristote (débutant) a placé HFGHG pour 13 points"),
            _buildMessage("Vous avez placé LP pour 2 points"),
            _buildMessage("Aristote (débutant) a placé OEL pour 13 points"),
            _buildMessage("Vous avez passé votre tour"),
            _buildMessage("Aristote (débutant) a passé son tour"),
          ]),
        ),
      ),
    );
  }

  Widget _buildMessage(String message) {
    PlacementMessage? placement = getPlacementMessage(message);

    if (placement != null) return _buildPlacementMessage(placement);

    return Container(
      margin: EdgeInsets.only(bottom: SPACE_2),
      child: Text(message),
    );
  }

  Widget _buildPlacementMessage(PlacementMessage placement) {
    return Container(
      margin: EdgeInsets.only(bottom: SPACE_1),
      child: Table(
        // border: TableBorder.all(color: Colors.black12),
        columnWidths: const <int, TableColumnWidth>{
          0: FlexColumnWidth(0.7),
          1: FlexColumnWidth(1.6),
          2: FlexColumnWidth(0.6),
        },
        children: [
          TableRow(children: [
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                    padding: EdgeInsets.all(SPACE_1),
                    child: Text(placement is OpponentPlacementMessage
                        ? placement.name
                        : "Vous"))),
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                  padding: EdgeInsets.all(SPACE_1),
                  child: _buildPlacementMessageLetters(placement),
                )),
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                  padding: EdgeInsets.all(SPACE_1),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Container(
                        padding: EdgeInsets.all(SPACE_1),
                        decoration: BoxDecoration(
                            color: placement is OpponentPlacementMessage
                                ? Colors.black12
                                : _themeColorService.themeColor,
                            borderRadius: BorderRadius.all(Radius.circular(6))),
                        child: Wrap(
                          spacing: 2,
                          crossAxisAlignment: WrapCrossAlignment.end,
                          children: [
                            Text(
                              "${placement.points}",
                              style: TextStyle(
                                  color: placement is OpponentPlacementMessage
                                      ? Colors.black
                                      : Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600),
                            ),
                            Text(
                              "pts",
                              style: TextStyle(
                                  color: placement is OpponentPlacementMessage
                                      ? Colors.black54
                                      : Colors.white54,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600),
                            )
                          ],
                        ),
                      ),
                    ],
                  ),
                )),
          ]),
        ],
      ),
    );
  }

  Widget _buildPlacementMessageLetters(PlacementMessage placement) {
    return Wrap(
      spacing: 2,
      alignment: WrapAlignment.center,
      children: [
        ...placement.letters.split('').map((letter) => Tile(
              tile: c.Tile(letter: letter),
              size: 22,
            ))
      ],
    );
  }
}
