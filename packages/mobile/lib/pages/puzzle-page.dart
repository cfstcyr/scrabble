import 'package:flutter/material.dart';
import 'package:mobile/classes/puzzle/puzzle.dart';
import 'package:mobile/components/game/game_board.dart';
import 'package:mobile/components/game/game_timer.dart';
import 'package:mobile/components/puzzle/puzzle_actions.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/puzzle/puzzle-tile-rack.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/puzzle-service.dart';

import '../components/game/game_messages.dart';

class PuzzlePage extends StatefulWidget {
  @override
  State<PuzzlePage> createState() => _PuzzlePageState();
}

class _PuzzlePageState extends State<PuzzlePage> {
  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    PuzzleService puzzleService = getIt.get<PuzzleService>();

    return StreamBuilder<PuzzleGame?>(
        stream: puzzleService.puzzleStream,
        builder: (context, snapshot) {
          return MyScaffold(
            title: "Mode Entraînement",
            body: Container(
              color: Colors.grey.shade100,
              padding: EdgeInsets.all(SPACE_1),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IntrinsicWidth(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(
                              child: GameBoard(
                                  gameStream: puzzleService.puzzleStream)),
                          PuzzleTileRack(
                              gameStream: puzzleService.puzzleStream),
                        ],
                      ),
                    ),
                    SizedBox(
                      width: 425,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          GameTimer(),
                          Expanded(child: GameMessages()),
                          PuzzleActions(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        });
  }
}
