import 'package:flutter/material.dart';

enum GameVisibility {
  public,
  private,
  protected;

  String get name {
    return GAME_VISIBILITY_TO_NAME[this] != null
        ? GAME_VISIBILITY_TO_NAME[this]!
        : '';
  }
  IconData get icon {
    return GAME_VISIBILITY_TO_ICONS[this] != null
        ? GAME_VISIBILITY_TO_ICONS[this]!
        : Icons.question_mark;
  }

  String get description {
    return GAME_VISIBILITY_DESCRIPTION[this] != null
        ? GAME_VISIBILITY_DESCRIPTION[this]!
        : '';
  }

  static GameVisibility fromString(String value) {
    return GameVisibility.values.firstWhere((GameVisibility gameVisibility) => gameVisibility.name.toLowerCase() == value.toLowerCase());
  }

  static GameVisibility fromInteger(int value) {
    return GameVisibility.values[value];
  }

  static GameVisibility fromJson(dynamic value) {
    if (value is String) {
      return GameVisibility.fromString(value);
    } else if (value is int) {
      return GameVisibility.fromInteger(value);
    }
    throw Exception('No GameVisibility match given json value');
  }
}

final Map<GameVisibility, String> GAME_VISIBILITY_TO_NAME = {
  GameVisibility.public: 'Public',
  GameVisibility.private: 'Privé',
  GameVisibility.protected: 'Protégé'
};

final Map<GameVisibility, IconData> GAME_VISIBILITY_TO_ICONS = {
  GameVisibility.public: Icons.public,
  GameVisibility.private: Icons.shield,
  GameVisibility.protected: Icons.lock
};

final Map<GameVisibility, String> GAME_VISIBILITY_DESCRIPTION = {
  GameVisibility.public: 'Partie publique',
  GameVisibility.private: 'Partie privée',
  GameVisibility.protected: 'Partie protégée par mot de passe',
};
