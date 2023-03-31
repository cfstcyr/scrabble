import 'package:flutter/cupertino.dart';
import 'package:mobile/classes/analysis/action-shown.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/app-toggle-button.dart';
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
    return Column(
      children: [
        // Toggle action
        AppToggleButton<ActionShownValue, ActionShown>(
            defaultValue: ActionShown.played,
            optionsToValue: ACTION_SHOWN_OPTIONS_TO_VALUES,
            toggleOptionWidget: generateActionShownWidget),
        // Points
        Container(
            decoration: BoxDecoration(
                borderRadius: BorderRadius.all(Radius.circular(8.0)),
                color: _themeColorService.themeDetails.value.color.colorValue ),
            child:
                Text('${widget.criticalMoment.playedPlacement?.score ?? 0}')),
        // Board
        // Tilerack
      ],
    );
  }
}

Widget generateActionShownWidget(ActionShownValue actionShown) => Center(
        child: Padding(
      padding: const EdgeInsets.all(SPACE_2),
      child: Text(actionShown.name),
    ));
