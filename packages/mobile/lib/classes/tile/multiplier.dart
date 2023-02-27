import 'package:flutter/material.dart';
import 'package:mobile/constants/game.constants.dart';

enum MultiplierType {
  letter,
  word,
}

class Multiplier {
  Multiplier({
    required this.value,
    required this.type,
  });

  final int value;

  final MultiplierType type;

  String getType() {
    switch (type) {
      case MultiplierType.letter:
        return LETTER;
      case MultiplierType.word:
        return WORD;
    }
  }

  Color getColor() {
    switch (type) {
      case MultiplierType.letter:
        switch (value) {
          case 2:
            return Color.fromRGBO(160, 213, 243, 1);
          case 3:
            return Color.fromRGBO(34, 162, 236, 1);
        }
        break;
      case MultiplierType.word:
        switch (value) {
          case 2:
            return Color.fromRGBO(245, 173, 170, 1);
          case 3:
            return Color.fromRGBO(248, 100, 95, 1);
        }
    }

    return Colors.transparent;
  }
}
