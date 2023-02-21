import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/classes/game/player.dart' as c;

class Player extends StatelessWidget {
  ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  bool invertedLayout;
  bool isPlaying;
  c.Player player;

  Player({
    required this.player,
    this.invertedLayout = false,
    this.isPlaying = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
        color: isPlaying ? _themeColorService.themeColor : null,
        child: Container(
          padding: EdgeInsets.all(SPACE_2),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: _getContent(),
          ),
        ));
  }

  List<Widget> _getContent() {
    List<Widget> content = [
      Expanded(
          child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: _getPlayerAvatarContent(),
      )),
      Text(
        '${player.points}',
        style: TextStyle(
          fontWeight: FontWeight.w800,
          fontSize: 16,
          height: 1,
          color: isPlaying ? Colors.white : null,
        ),
      ),
    ];

    return invertedLayout ? content.reversed.toList() : content;
  }

  List<Widget> _getPlayerAvatarContent() {
    List<Widget> content = [
      Container(
        height: 22,
        width: 22,
        margin: _getMargin(SPACE_1),
        decoration: BoxDecoration(
          color: Colors.grey,
          borderRadius: BorderRadius.all(Radius.circular(22)),
        ),
      ),
      Expanded(
          child: Container(
        margin: _getMargin(SPACE_2),
        child: Text(
          player.name,
          overflow: TextOverflow.ellipsis,
          textAlign: invertedLayout ? TextAlign.right : TextAlign.left,
          style: TextStyle(
            fontSize: 15,
            height: 1,
            color: isPlaying ? Colors.white : null,
          ),
        ),
      )),
    ];

    return invertedLayout ? content.reversed.toList() : content;
  }

  EdgeInsets _getMargin(double margin) {
    return invertedLayout
        ? EdgeInsets.only(left: margin)
        : EdgeInsets.only(right: margin);
  }
}
