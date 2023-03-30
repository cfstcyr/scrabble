import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-overview.dart';
import 'package:mobile/components/analysis/analysis-overview-widget.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';

AnalysisOverview overview = AnalysisOverview(majorMistakeCount: 2, mediumMistakeCount: 5, minorMistakeCount: 10);

class AnalysisResultDialog {
    void openAnalysisResultDialog(BuildContext context) {
    ThemeData theme = Theme.of(context);

    showDialog(
        context: context,
        barrierDismissible: true,
        builder: (BuildContext context) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(8.0)),
            ),
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
            content: AnalysisOverviewWidget(overview: overview,),
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
