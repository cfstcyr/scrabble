import 'package:flutter/material.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:rxdart/rxdart.dart';

class PuzzleLevelSelector extends StatefulWidget {
  PuzzleLevelSelector()
      : puzzleLevel$ = BehaviorSubject.seeded(
            getPuzzleLevelFromName(PuzzleLevelName.advanced));

  BehaviorSubject<PuzzleLevel> puzzleLevel$;

  @override
  State<PuzzleLevelSelector> createState() => _PuzzleLevelSelectorState();
}

class _PuzzleLevelSelectorState extends State<PuzzleLevelSelector> {
  Stream<List<bool>> _selectedLevel =
      Stream.value(List.of([false, false, false]));

  @override
  void initState() {
    super.initState();

    _selectedLevel = widget.puzzleLevel$.stream
        .switchMap<List<bool>>((PuzzleLevel currentLevel) {
      return Stream.value(PUZZLE_LEVELS.keys
          .toList()
          .map((PuzzleLevelName levelName) =>
              currentLevel.name == levelName.name)
          .toList());
    });
  }

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return StreamBuilder<List<bool>>(
        stream: _selectedLevel,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return SizedBox.shrink();

          return ToggleButtons(
              direction: Axis.horizontal,
              isSelected: snapshot.data!,
              onPressed: (int index) =>
                  widget.puzzleLevel$.add(getPuzzleLevelFromIndex(index)),
              color: Colors.black,
              selectedColor: Colors.white,
              fillColor: theme.primaryColor,
              children: PUZZLE_LEVELS.values
                  .map((PuzzleLevel level) =>
                      PuzzleLevelWidget(puzzleLevel: level))
                  .toList());
        });
  }
}

class PuzzleLevelWidget extends StatefulWidget {
  PuzzleLevelWidget({required this.puzzleLevel});

  final PuzzleLevel puzzleLevel;

  @override
  State<PuzzleLevelWidget> createState() => _PuzzleLevelWidgetState();
}

class _PuzzleLevelWidgetState extends State<PuzzleLevelWidget> {
  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(minWidth: 128),
      padding: const EdgeInsets.symmetric(horizontal: SPACE_3, vertical: SPACE_2),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: widget.puzzleLevel.icons
                .map((IconData icon) => Icon(icon, size: 32,))
                .toList(),
          ),
          SizedBox(height: SPACE_1,),
          Text(
            widget.puzzleLevel.name,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          SizedBox(height: SPACE_1,),
          Opacity(
              opacity: 0.54,
              child: Text(
                widget.puzzleLevel.description,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ))
        ],
      ),
    );
  }
}
