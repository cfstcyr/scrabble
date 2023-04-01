import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/action-shown.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/analysis/no-interaction-tile-rack.dart';
import 'package:mobile/components/app-toggle-button.dart';
import 'package:mobile/components/game/game_board.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

class CriticalMomentWidget extends StatefulWidget {
  CriticalMomentWidget({required this.criticalMoment});

  final CriticalMoment criticalMoment;

  @override
  State<CriticalMomentWidget> createState() => _CriticalMomentState();
}

class _CriticalMomentState extends State<CriticalMomentWidget> {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    AppToggleButton<ActionShownValue, ActionShown> actionShownToggle =
        AppToggleButton<ActionShownValue, ActionShown>(
      defaultValue: ActionShown.played,
      optionsToValue: ACTION_SHOWN_OPTIONS_TO_VALUES,
      toggleOptionWidget: generateActionShownWidget,
      orientation: Axis.vertical,
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Transform.translate(
            offset: Offset(32, 0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                actionShownToggle,
                // Points
                SizedBox(
                  height: SPACE_2,
                ),
                StreamBuilder<ActionShownValue>(
                    stream: actionShownToggle.selectedStream,
                    builder: (context, snapshot) {
                      bool isGreenBackground = !snapshot.hasData ||
                          snapshot.data!.getEnumName() == ActionShown.best.name;
                      return Container(
                          decoration: BoxDecoration(
                              borderRadius:
                                  BorderRadius.all(Radius.circular(8.0)),
                              color: isGreenBackground
                                  ? _themeColorService
                                      .themeDetails.value.color.colorValue
                                  : Colors.grey.shade500),
                          padding: EdgeInsets.all(SPACE_1),
                          child: Text(
                            '${widget.criticalMoment.playedPlacement?.score ?? 0} pts',
                            style: theme.textTheme.titleSmall!
                                .copyWith(color: Colors.white),
                          ));
                    }),
              ],
            ),
          ),
        ),
        Column(
          children: [
            SizedBox(
                width: 560,
                height: 560,
                child: GameBoard(
                    gameStream: widget.criticalMoment.convertToGameStream)),
            SizedBox(
                height: 60,
                child: NoInteractionTileRack(
                    gameStream: widget.criticalMoment.convertToGameStream,
                    tileSize: TILE_SIZE - 10)),
            // Board
            // Tilerack
          ],
        ),
        Spacer(),
      ],
    );
  }
}

Widget generateActionShownWidget(ActionShownValue actionShown) => Center(
        child: Padding(
      padding: const EdgeInsets.all(SPACE_2),
      child: Text(actionShown.name),
    ));
