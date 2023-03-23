import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/create-game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/utils/duration-format.dart';

class TimerSelector extends StatefulWidget {

  TimerSelector({super.key, this.duration = const Duration(seconds: 60)});

  Duration duration;

  @override
  State<TimerSelector> createState() => _TimerSelectorState();
}

class _TimerSelectorState extends State<TimerSelector> {
  ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: Text(
            'Choisissez votre temps par tour',
            style: theme.textTheme.labelLarge
                ?.copyWith(color: Colors.grey.shade700),
          ),
        ),
        Container(
          decoration: BoxDecoration(
              borderRadius: BorderRadius.all(Radius.circular(8.0)),
              border: Border.all(color: theme.colorScheme.tertiary),
              color: theme.colorScheme.background),
          padding: EdgeInsets.zero,
          margin: EdgeInsets.zero,
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                        color: _themeColorService.tertiaryButton,
                        // border: Border.all(width: 0.5, color: theme.colorScheme.tertiary, style: BorderStyle.solid),
                        borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(8),
                            bottomLeft: Radius.circular(8))),
                    child: AppButton(
                      onPressed: () {
                        setState(() {
                          _decrementTimer();
                        });
                      },
                      icon: Icons.remove,
                      theme: AppButtonTheme.secondary,
                      type: AppButtonType.ghost,
                      size: AppButtonSize.extraLarge,
                      iconOnly: true,
                    ),
                  ),
                ),
                Expanded(
                  child: Center(
                      child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.hourglass_bottom_rounded, size: 36),
                        SizedBox(width: SPACE_1,),
                        Text(formatTime(widget.duration.inSeconds), style: theme.textTheme.headlineSmall,),
                      ],
                    ),
                  )),
                ),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                        color: _themeColorService.tertiaryButton,
                        // border: Border.all(width: 0.5, color: theme.colorScheme.tertiary, style: BorderStyle.solid),
                        borderRadius: BorderRadius.only(
                            topRight: Radius.circular(8),
                            bottomRight: Radius.circular(8))),
                    child: AppButton(
                      onPressed: () {
                        setState(() {
                          _incrementTimer();
                        });
                      },
                      theme: AppButtonTheme.secondary,
                      type: AppButtonType.ghost,
                      icon: Icons.add,
                      size: AppButtonSize.extraLarge,
                      iconOnly: true,
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _incrementTimer() {
    widget.duration = Duration(seconds: min<int>(widget.duration.inSeconds + INCREMENT_TIME.inSeconds, MAX_TIME.inSeconds));
  }

  void _decrementTimer() {
    widget.duration = Duration(seconds: max<int>(widget.duration.inSeconds - INCREMENT_TIME.inSeconds, MIN_TIME.inSeconds));
  }
}
