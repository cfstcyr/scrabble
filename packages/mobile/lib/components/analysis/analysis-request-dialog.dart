import 'package:flutter/material.dart';
import 'package:mobile/components/AppCircularSpinner.dart';
import 'package:mobile/components/LoadingDots.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';

class AnalysisRequestDialog {
  final String title;
  String message;
  Duration? minimumDelay;

  AnalysisRequestDialog(
      {required this.title, required this.message, this.minimumDelay});

  void openAnalysisRequestDialog(BuildContext context) {
    ThemeData theme = Theme.of(context);

    showDialog(
        context: context,
        barrierDismissible: true,
        builder: (BuildContext context) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(8.0)),
            ),
            insetPadding: EdgeInsets.symmetric(vertical: 196, horizontal: 344),
            title: Center(
              child: Text(
                title,
                style: theme.textTheme.headlineMedium
                    ?.copyWith(fontWeight: FontWeight.w500),
              ),
            ),
            titlePadding: EdgeInsets.symmetric(
                horizontal: SPACE_4 * 4, vertical: SPACE_4),
            content: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                AppCircularSpinner(
                  isLoading: true,
                  size: AppCircularSpinnerSize.large,
                ),
                SizedBox(
                  height: SPACE_4,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      message,
                      style: theme.textTheme.titleMedium,
                    ),
                    LoadingDots(style: theme.textTheme.titleMedium!),
                  ],
                )
              ],
            ),
            actions: [
              AppButton(
                onPressed: () => _cancelAnalysisRequest(context),
                text: 'Annuler',
                theme: AppButtonTheme.secondary,
                size: AppButtonSize.normal,
              )
            ],
            surfaceTintColor: Colors.white,
            backgroundColor: Colors.white,
          );
        });
  }

  void _cancelAnalysisRequest(BuildContext context) {
    Navigator.pop(context);
  }
}
