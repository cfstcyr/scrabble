import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/tile/tile-placement.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/theme-color-service.dart';

import '../classes/game/game-message.dart';
import '../classes/game/game_messages.dart';
import '../constants/layout.constants.dart';
import '../controllers/game-play.controller.dart';
import '../locator.dart';
import '../utils/game_messages.dart';

class GameMessagesService {
  static const String HINT_MESSAGE = "**Mots trouvés** :";
  late List<Widget> messages = [_buildMessage("Début de la partie")];

  GameMessagesService._privateConstructor() {
    messages = [_buildMessage("Début de la partie")];
    _chatController.messageEvent.listen((GameMessage? gameMessage) => {
          if (gameMessage != null)
            messages.add(_buildMessage(gameMessage.content))
        });
  }

  ActionService _actionService = getIt.get<ActionService>();

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
    if (_isHintMessage(subMessages)) return handleHintMessage(subMessages);

    return Container(
      margin: EdgeInsets.only(bottom: SPACE_2),
      child: Column(
        children: subMessages
            .map((String message) => MarkdownBody(data: message))
            .toList(),
      ),
    );
  }

  Widget handleHintMessage(List<String> subMessages) {
    subMessages.removeAt(0);
    HintMessage hints = getHintMessage(subMessages);
    return _buildHintMessage(hints);
  }

  Widget _buildHindMessagePayload(HintMessagePayload hintMessagePayload) {
    return Container(
      margin: EdgeInsets.only(bottom: SPACE_1),
      child: Table(
        columnWidths: const <int, TableColumnWidth>{
          0: FlexColumnWidth(0.7),
          1: FlexColumnWidth(1.6),
          2: FlexColumnWidth(0.6),
          3: FlexColumnWidth(0.6),
        },
        children: [
          TableRow(children: [
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                    padding: EdgeInsets.all(SPACE_1),
                    child: Text(hintMessagePayload.position))),
            TableCell(
                verticalAlignment: TableCellVerticalAlignment.middle,
                child: Container(
                  padding: EdgeInsets.all(SPACE_1),
                  child: _buildPlacementMessageLetters(hintMessagePayload),
                )),
            TableCell(
              verticalAlignment: TableCellVerticalAlignment.middle,
              child: _buildPoints(hintMessagePayload.points),
            ),
            TableCell(
              verticalAlignment: TableCellVerticalAlignment.middle,
              child: Container(
                padding: EdgeInsets.all(SPACE_1),
                child: _buildPlayButton(hintMessagePayload),
              ),
            )
          ])
        ],
      ),
    );
  }

  Widget _buildHintMessage(HintMessage subMessages) {
    return Container(
      margin: EdgeInsets.only(bottom: SPACE_1),
      child: Column(
        children: [
          Text(HINT_MESSAGE),
          ...subMessages.hints
              .map((HintMessagePayload hintMessagePayload) =>
                  _buildHindMessagePayload(hintMessagePayload))
              .toList()
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
                                : _themeColorService
                                    .themeDetails.value.color.colorValue,
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

  Widget _buildPoints(int points) {
    return Container(
      padding: EdgeInsets.all(SPACE_1),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Container(
            padding: EdgeInsets.all(SPACE_1),
            decoration: BoxDecoration(
                color: _themeColorService.themeDetails.value.color.colorValue,
                borderRadius: BorderRadius.all(Radius.circular(6))),
            child: Wrap(
              spacing: 2,
              crossAxisAlignment: WrapCrossAlignment.end,
              children: [
                Text(
                  points.toString(),
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600),
                ),
                Text(
                  "pts",
                  style: TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                      fontWeight: FontWeight.w600),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlayButton(HintMessagePayload hintPayload) {
    return AppButton(
      onPressed: () => //TODO insert lgic here
          _actionService.sendAction(
        ActionType.place,
        hintPayload.toActionPayload(),
      ),
      icon: Icons.play_arrow_rounded,
      size: AppButtonSize.normal,
      type: AppButtonType.normal,
    );
  }
  // Shows only the play message

  bool _isHintMessage(List<String> subMessages) {
    if (subMessages[0] == HINT_MESSAGE) return true;
    return false;
  }
}
