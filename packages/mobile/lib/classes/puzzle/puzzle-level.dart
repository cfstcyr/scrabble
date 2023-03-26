// ignore_for_file: non_constant_identifier_names

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

enum PuzzleLevelName {
  beginner,
  advanced,
  expert;

  String get name => PUZZLE_LEVEL_NAMES[this] ?? 'Inconnu';
}

class PuzzleLevel {
  final String id;
  final String name;
  final String description;
  final Duration roundDuration;
  final List<IconData> icons;

  PuzzleLevel(
      {required this.id,
      required this.name,
      required this.description,
      required this.roundDuration,
      required this.icons});
}

final Map<PuzzleLevelName, String> PUZZLE_LEVEL_NAMES = {
  PuzzleLevelName.beginner: 'Débutant',
  PuzzleLevelName.advanced: 'Avancé',
  PuzzleLevelName.expert: 'Expert',
};

final PuzzleLevel beginnerPuzzleLevel = PuzzleLevel(
    id: '1',
    name: PuzzleLevelName.beginner.name,
    description: '5 min',
    roundDuration: Duration(minutes: 5),
    icons: [Icons.bolt]);

final PuzzleLevel advancedPuzzleLevel = PuzzleLevel(
    id: '2',
    name: PuzzleLevelName.advanced.name,
    description: '2 min',
    roundDuration: Duration(minutes: 2),
    icons: [Icons.bolt, Icons.bolt]);

final PuzzleLevel expertPuzzleLevel = PuzzleLevel(
    id: '3',
    name: PuzzleLevelName.expert.name,
    description: '30 sec',
    roundDuration: Duration(seconds: 30),
    icons: [Icons.bolt, Icons.bolt, Icons.bolt]);


final Map<PuzzleLevelName, PuzzleLevel> PUZZLE_LEVELS = {
  PuzzleLevelName.beginner: beginnerPuzzleLevel,
  PuzzleLevelName.advanced: advancedPuzzleLevel,
  PuzzleLevelName.expert: expertPuzzleLevel,
};

PuzzleLevel getPuzzleLevelFromIndex(int index) {
  if (index < 0 || PUZZLE_LEVELS.isEmpty || index >= PUZZLE_LEVELS.values.length) return advancedPuzzleLevel;

  return PUZZLE_LEVELS.values.toList()[index];
}

PuzzleLevel getPuzzleLevelFromName(PuzzleLevelName name) {
  return PUZZLE_LEVELS[name] ?? advancedPuzzleLevel;
}
