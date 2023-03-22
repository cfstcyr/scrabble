import 'package:flutter/material.dart';
import 'package:mobile/classes/game/player.dart' as c;
import 'package:mobile/components/player/abstract_player.dart';
import 'package:mobile/constants/layout.constants.dart';

import '../../locator.dart';
import '../../services/user.service.dart';
import '../animation/pulse.dart';

class Player extends AbstractPlayer {
  Player({
    required c.Player player,
    bool isPlaying = false,
    bool isObserved = false,
  }) : super(player: player, isPlaying: isPlaying, isObserved: isObserved);

  @override
  Widget getContent(BuildContext context) {
    return Card(
        color: getColor(),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: SPACE_2,
            vertical: SPACE_1,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              getIt.get<UserService>().isObserver
                  ? Pulse(
                      duration: Duration(milliseconds: 350),
                      active: isObserved,
                      child: Icon(
                        Icons.visibility,
                        color: getTextColor(),
                      ),
                    )
                  : Container(),
              SizedBox(
                width: 2,
              ),
              Expanded(child: getPlayerInfo()),
              Text(
                '${player.score}',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                  height: 1,
                  color: getTextColor(),
                ),
              ),
            ],
          ),
        ));
  }
}
