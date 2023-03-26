import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/services/theme-color-service.dart';

import '../classes/game/game-message.dart';
import '../classes/game/game_messages.dart';
import '../constants/layout.constants.dart';
import '../controllers/game-play.controller.dart';
import '../locator.dart';
import '../utils/game_messages.dart';

class GameMessagesService {
  late List<Widget> messages = [_buildMessage("Début de la partie")];

  GameMessagesService._privateConstructor() {
    messages = [_buildMessage("Début de la partie")];
    _chatController.messageEvent.listen((GameMessage? gameMessage) => {
          if (gameMessage != null)
            messages.add(_buildMessage(gameMessage!.content))
        });
  }

  Stream<GameMessage?> get messageEvent => _chatController.gameMessage$.stream;

  static final GameMessagesService _instance =
      GameMessagesService._privateConstructor();
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  factory GameMessagesService() {
    return _instance;
  }

  final _chatController = getIt.get<GamePlayController>();

  void resetMessages() {
    messages = [_buildMessage("Début de la partie")];
  }

  Widget _buildMessage(String message) {
    PlacementMessage? placement = getPlacementMessage(message);

    if (placement != null) return _buildPlacementMessage(placement);

    List<String> subMessages = message.split('<br>');
    return Container(
      margin: EdgeInsets.only(bottom: SPACE_2),
      child: Column(
        children: subMessages
            .map((String message) => MarkdownBody(data: message))
            .toList(),
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

  Widget _buildPlacementMessage(PlacementMessage placement) {
    return Container(
      margin: EdgeInsets.only(bottom: SPACE_1),
      child: Table(
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
                                : _themeColorService.themeColor.value,
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
}
