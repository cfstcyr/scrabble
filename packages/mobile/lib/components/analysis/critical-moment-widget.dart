import 'package:flutter/cupertino.dart';
import 'package:mobile/classes/analysis/action-shown.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/app-toggle-button.dart';
import 'package:mobile/constants/layout.constants.dart';

class CriticalMomentWidget extends StatefulWidget {
  CriticalMomentWidget({required this.criticalMoment});

  final CriticalMoment criticalMoment;

  @override
  State<CriticalMomentWidget> createState() => _CriticalMomentState();
}

class _CriticalMomentState extends State<CriticalMomentWidget> {
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
        // Board
        // Tilerack
      ],
    );
  }
}

Widget generateActionShownWidget(ActionShownValue actionShown) =>
    Center(child: Padding(
      padding: const EdgeInsets.all(SPACE_2),
      child: Text(actionShown.name),
    ));
