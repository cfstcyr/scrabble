import 'package:flutter/material.dart';
import 'package:mobile/components/app-circular-spinner.dart';
import 'package:mobile/components/LoadingDots.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

class AnalysisRequestDialog {
  final String title;
  String message;
  final bool isLoading;

  AnalysisRequestDialog(
      {required this.title, required this.message, this.isLoading = true});

  void openAnalysisRequestDialog(BuildContext context) {
    ThemeColorService themeColorService = getIt.get<ThemeColorService>();
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
                isLoading
                    ? AppCircularSpinner(
                        isLoading: true,
                        color: themeColorService
                            .themeDetails.value.color.colorValue,
                        size: AppCircularSpinnerSize.large,
                      )
                    : Icon(Icons.error, color: theme.colorScheme.error, size: 96,),
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
                    LoadingDots(style: theme.textTheme.titleMedium!, isPlaying: isLoading,),
                  ],
                )
              ],
            ),
            actions: [
              AppButton(
                onPressed: () => _cancelAnalysisRequest(context),
                text: isLoading ? 'Annuler' : 'Fermer',
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
