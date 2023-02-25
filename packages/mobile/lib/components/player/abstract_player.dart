import 'package:flutter/material.dart';
import 'package:mobile/components/animation/pulse.dart';
import 'package:mobile/components/player/player.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/classes/game/player.dart' as c;

abstract class AbstractPlayer extends StatelessWidget {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  final bool isPlaying;
  final c.Player player;

  AbstractPlayer({
    required this.player,
    this.isPlaying = false,
  });

  @override
  Widget build(BuildContext context) {
    return Pulse(
      active: isPlaying && player.isLocalPlayer,
      scale: 1.035,
      duration: Duration(milliseconds: 750),
      child: getContent(context),
    );
  }

  Widget getContent(BuildContext context);

  Widget getPlayerInfo({bool large = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          height: large ? 32 : 22,
          width: large ? 32 : 22,
          margin: EdgeInsets.only(right: SPACE_1),
          decoration: BoxDecoration(
            color: Colors.grey,
            image: DecorationImage(
                image: AssetImage(player.user.avatar), fit: BoxFit.cover),
            borderRadius: BorderRadius.all(Radius.circular(22)),
          ),
        ),
        Expanded(
            child: Container(
          margin: EdgeInsets.only(right: SPACE_2),
          child: Text(
            player.user.username,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
                fontSize: large ? 20 : 15,
                height: 1,
                color: getTextColor(),
                fontWeight: FontWeight.w500),
          ),
        )),
      ],
    );
  }

  Color? getColor() {
    return isPlaying ? _themeColorService.themeColor : null;
  }

  Color? getTextColor() {
    return isPlaying ? Colors.white : null;
  }
}
