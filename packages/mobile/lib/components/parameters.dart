import 'package:flutter/material.dart';
import 'package:mobile/classes/virtual-player-level.dart';

import '../utils/duration-format.dart';
import '../view-methods/create-lobby-methods.dart';

class Parameters extends StatelessWidget {
  const Parameters(
      {super.key,
      this.maxRoundTime,
      this.virtualPlayerLevel,
      this.backgroundColor});

  final Color? backgroundColor;
  final int? maxRoundTime;
  final VirtualPlayerLevel? virtualPlayerLevel;

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(left: 0, right: 0, top: 10.0, bottom: 25.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: EdgeInsets.only(left: 0, right: 25.0, top: 0, bottom: 0),
            child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                  color: backgroundColor ?? theme.colorScheme.tertiary,
                  borderRadius: BorderRadius.all(Radius.circular(8))),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.hourglass_bottom),
                    SizedBox(width: 8),
                    Text(formatTime(maxRoundTime == null ? 60 : maxRoundTime!),
                        style: TextStyle(fontSize: 15)),
                  ],
                ),
              ),
            ),
          ),
          Container(
            alignment: Alignment.center,
            decoration: BoxDecoration(
                color: backgroundColor ?? theme.colorScheme.tertiary,
                borderRadius: BorderRadius.all(Radius.circular(8))),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.precision_manufacturing),
                  SizedBox(width: 8),
                  Text(
                    virtualPlayerLevel == null
                        ? VirtualPlayerLevel.expert.levelName
                        : virtualPlayerLevel!.levelName,
                    style: TextStyle(fontSize: 15),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
