import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';

import 'create-game-level.dart';

class DifficultyLevelWidget extends StatelessWidget {
  DifficultyLevelWidget({required this.difficultyLevel});

  final VirtualPlayerToggle difficultyLevel;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(minWidth: 128),
      padding:
          const EdgeInsets.symmetric(horizontal: SPACE_3, vertical: SPACE_2),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: difficultyLevel.icons
                .map((IconData icon) => Icon(
                      icon,
                      size: 32,
                    ))
                .toList(),
          ),
          SizedBox(
            height: SPACE_1,
          ),
          Text(
            difficultyLevel.name,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

Widget generateDifficultyLevelWidget(VirtualPlayerToggle level) =>
    DifficultyLevelWidget(difficultyLevel: level);
