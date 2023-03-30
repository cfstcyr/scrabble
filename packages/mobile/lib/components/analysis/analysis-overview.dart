import 'package:flutter/material.dart';
import 'package:mobile/components/AppCircularSpinner.dart';
import 'package:mobile/constants/layout.constants.dart';

class AnalysisOverview extends StatefulWidget {
  AnalysisOverview({required this.value, required this.maximum, this.title});

  final String? title;
  final double value;
  final double maximum;

  @override
  State<AnalysisOverview> createState() => _AnalysisOverviewState();
}

class _AnalysisOverviewState extends State<AnalysisOverview> {
  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        widget.title != null
            ? Text(
                widget.title!,
                style: theme.textTheme.titleMedium!
                    .copyWith(fontWeight: FontWeight.w600),
              )
            : SizedBox.shrink(),
        SizedBox(
          height: SPACE_4,
        ),
        Stack(
          children: [
            AppCircularSpinner(
              isLoading: false,
              value: widget.value,
              maximumValue: widget.maximum,
              size: AppCircularSpinnerSize.large,
              strokeWidth: 18.0,
            ),
            Positioned.fill(
              child: Align(
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(widget.value.toInt().toString(),
                        style: theme.textTheme.displayMedium!
                            .copyWith(fontWeight: FontWeight.bold)),
                    Opacity(
                      opacity: 0.6,
                      child: Text('/ ${widget.maximum.toInt().toString()}',
                          style: theme.textTheme.titleLarge!
                              .copyWith(fontWeight: FontWeight.w600)),
                    )
                  ],
                ),
              ),
            ),
          ],
        )
      ],
    );
  }
}
