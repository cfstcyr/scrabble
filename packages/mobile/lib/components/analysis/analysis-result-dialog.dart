import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-overview.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/analysis/analysis-overview-widget.dart';
import 'package:mobile/components/analysis/critical-moment-widget.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:rxdart/rxdart.dart';

class AnalysisResultDialog {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  final List<CriticalMoment> criticalMoments;
  final BehaviorSubject<int> _currentSlideIndex$;
  final List<CriticalMomentWidget> _criticalMomentWidgets;

  AnalysisResultDialog({required this.criticalMoments})
      : _currentSlideIndex$ = BehaviorSubject.seeded(0),
        _criticalMomentWidgets = criticalMoments
            .map((CriticalMoment c) => CriticalMomentWidget(criticalMoment: c))
            .toList();

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
            insetPadding: EdgeInsets.symmetric(vertical: 16, horizontal: 16),
            title: Center(
              child: Text(
                ANALYSIS_RESULT_TITLE,
                style: theme.textTheme.headlineMedium
                    ?.copyWith(fontWeight: FontWeight.w500),
              ),
            ),
            titlePadding: EdgeInsets.only(
                left: SPACE_4 * 4,
                right: SPACE_4 * 4,
                top: SPACE_3,
                bottom: SPACE_1 / 2),
            content: SizedBox(
              width: MediaQuery.of(context).size.width,
              height: double.infinity,
              child: CarouselSlider(
                options: CarouselOptions(
                  autoPlay: false,
                  enableInfiniteScroll: false,
                  viewportFraction: 1.0,
                  onPageChanged: (index, _) => _currentSlideIndex$.add(index),
                ),
                items: [
                  AnalysisOverviewWidget(
                    overview:
                        AnalysisOverview.fromCriticalMoments(criticalMoments),
                  ),
                  ..._criticalMomentWidgets
                ],
              ),
            ),
            contentPadding: EdgeInsets.symmetric(vertical: 0),
            actionsPadding: EdgeInsets.only(
                left: SPACE_2, right: SPACE_4, top: 0, bottom: SPACE_2),
            actionsAlignment: MainAxisAlignment.center,
            actions: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Spacer(),
                  Expanded(child: _slideIndicator(theme)),
                  Expanded(
                    child: Row(
                      children: [
                        Spacer(),
                        AppButton(
                          onPressed: () => _closeAnalysisResult(context),
                          text: CLOSE_ANALYSIS_RESULT,
                          theme: AppButtonTheme.secondary,
                          size: AppButtonSize.normal,
                        ),
                      ],
                    ),
                  ),
                ],
              )
            ],
            surfaceTintColor: Colors.white,
            backgroundColor: Colors.white,
          );
        });
  }

  Widget _slideIndicator(ThemeData theme) {
    return StreamBuilder<int>(
        stream: _currentSlideIndex$.stream,
        builder: (context, snapshot) {
          int selectedIndex = snapshot.hasData ? snapshot.data! : 0;
          return Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: List.generate(
                criticalMoments.length + 1,
                (index) => Row(
                      children: [
                        Container(
                          width: 30,
                          height: 10,
                          color: selectedIndex == index
                              ? _themeColorService
                                  .themeDetails.value.color.colorValue
                              : theme.colorScheme.tertiary,
                        ),
                        index <= criticalMoments.length - 1
                            ? SizedBox(
                                width: SPACE_2,
                              )
                            : SizedBox.shrink()
                      ],
                    )),
          );
        });
  }

  void _closeAnalysisResult(BuildContext context) {
    Navigator.pop(context);
  }
}
