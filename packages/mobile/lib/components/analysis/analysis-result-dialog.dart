import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/analysis/critical-moment-widget.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';


class AnalysisResultDialog {
  void openAnalysisResultDialog(BuildContext context, List<CriticalMoment> criticalMoments) {
    ThemeData theme = Theme.of(context);

    showDialog(
        context: context,
        barrierDismissible: true,
        builder: (BuildContext context) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(8.0)),
            ),
            insetPadding: EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            title: Center(
              child: Text(
                'Analyse de la partie',
                style: theme.textTheme.headlineMedium
                    ?.copyWith(fontWeight: FontWeight.w500),
              ),
            ),
            titlePadding: EdgeInsets.symmetric(
                horizontal: SPACE_4 * 4, vertical: SPACE_4),
            // content: CarouselSlider(
            //   options: CarouselOptions(
            //     autoPlay: false,
            //
            //   ),
            //   items: [
            //     Text('hi'),
            //     Text('hi')
            //   ],
            // ),
            content: SizedBox(
              width: MediaQuery.of(context).size.width,
              child: CriticalMomentWidget(criticalMoment: criticalMoments[0]),
            ),
            actions: [
              AppButton(
                onPressed: () => _closeAnalysisResult(context),
                text: "Fermer l'analyse",
                theme: AppButtonTheme.secondary,
                size: AppButtonSize.normal,
              )
            ],
            surfaceTintColor: Colors.white,
            backgroundColor: Colors.white,
          );
        });
  }

  void _closeAnalysisResult(BuildContext context) {
    Navigator.pop(context);
  }
}
