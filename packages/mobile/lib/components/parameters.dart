import 'package:flutter/material.dart';
import 'package:mobile/classes/virtual-player-level.dart';

import '../utils/duration-format.dart';
import '../view-methods/create-lobby-methods.dart';

class Parameters extends StatelessWidget {
  const Parameters({super.key, this.maxRoundTime, this.virtualPlayerLevel});

  final int? maxRoundTime;
  final VirtualPlayerLevel? virtualPlayerLevel;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 0, right: 0, top: 10.0, bottom: 25.0),
      child: Container(
          child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: EdgeInsets.only(left: 0, right: 25.0, top: 0, bottom: 0),
            child: ElevatedButton.icon(
                onPressed: null,
                style: setStyleButtonToText(),
                icon: Icon(
                  Icons.timer,
                  size: 25,
                ),
                // TODO remove:: pas en cst car ne va plus exister quand on recoit info from backend
                label: Text(
                    maxRoundTime == null ? '1:00' : formatTime(maxRoundTime!),
                    style: TextStyle(fontSize: 15))),
          ),
          ElevatedButton.icon(
              onPressed: null,
              style: setStyleButtonToText(),
              icon: Icon(Icons.precision_manufacturing_outlined, size: 25),
              label: Text(
                  virtualPlayerLevel == null
                      ? 'Expert'
                      : virtualPlayerLevel!.levelName,
                  style: TextStyle(fontSize: 15))),
        ],
      )),
    );
  }
}
