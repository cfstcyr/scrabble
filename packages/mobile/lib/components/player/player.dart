import 'package:flutter/material.dart';
import 'package:mobile/components/player/abstract_player.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/classes/game/player.dart' as c;

class Player extends AbstractPlayer {
  Player({
    required c.Player player,
    bool isPlaying = false,
  }) : super(player: player, isPlaying: isPlaying);

  @override
  Widget build(BuildContext context) {
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
              Expanded(child: getPlayerInfo()),
              Text(
                '${player.points}',
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
