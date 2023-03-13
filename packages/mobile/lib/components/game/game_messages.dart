import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-messages.service.dart';

import '../../classes/game/game-message.dart';

class GameMessages extends StatelessWidget {
  final GameMessagesService gameMessagesService =
      getIt.get<GameMessagesService>();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<GameMessage?>(
        stream: gameMessagesService.messageEvent,
        builder: (context, snapshot) {
          final children = gameMessagesService.messages;
          return Card(
            child: SingleChildScrollView(
              reverse: false,
              padding: EdgeInsets.symmetric(
                vertical: SPACE_2,
                horizontal: SPACE_3,
              ),
              child: Container(
                child: Column(children: children),
              ),
            ),
          );
        });
  }
}
