import 'package:flutter/material.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/classes/puzzle/puzzle-player.dart' as c;
import 'package:mobile/constants/user-constants.dart';

class PuzzlePlayer extends StatelessWidget {
  PuzzlePlayer({
    required this.player,
  });

  final c.PuzzlePlayer player;

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Card(
        color: theme.primaryColor,
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: SPACE_2,
            vertical: SPACE_1,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Avatar(
                  avatar: player.user.avatar,
                  forceInitials: player.user.avatar.isEmpty,
                  initials: getUsersInitials(player.user.username),
                  background: theme.colorScheme.onBackground,
                  radius: 16,
                  size: 44),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    player.user.username,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        fontSize: 24,
                        height: 1,
                        fontWeight: FontWeight.w500,
                        color: Colors.white),
                  ),
                  Opacity(
                    opacity: 0.64,
                    child: SizedBox(
                      width: 120,
                      child: Text(
                        '${player.streakPoints} / ${player.streakMaxPoints} pts',
                        style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                            height: 1,
                            color: Colors.white),
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.right,
                      ),
                    ),
                  ),
                ],
              )
            ],
          ),
        ));
  }
}
