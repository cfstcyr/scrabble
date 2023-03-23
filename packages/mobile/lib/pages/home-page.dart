import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/create-game/timer-selector.dart';
import 'package:mobile/components/error-pop-up.dart';
import 'package:mobile/components/image.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/puzzle-service.dart';
import 'package:url_launcher/url_launcher.dart';

import '../constants/home-page.constants.dart';
import '../constants/login-constants.dart';
import '../controllers/account-authentification-controller.dart';
import '../controllers/game-creation-controller.dart';
import '../controllers/group-join-controller.dart';
import '../locator.dart';

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: "Home",
      body: Container(
        constraints: BoxConstraints.expand(),
        decoration: BoxDecoration(
            image: DecorationImage(
          opacity: 0.3,
          image: AssetImage(BACKGROUND_PATH),
          fit: BoxFit.cover,
        )),
        child: Center(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 100, bottom: 80),
                child: AppImage(
                  src: LOGO_PATH,
                  height: 100,
                ),
              ),
              SizedBox(
                width: 250,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppButton(
                      onPressed: () {
                        Navigator.pushNamed(context, CREATE_GAME);
                      },
                      size: AppButtonSize.large,
                      child: Text(CREATE_PAGE_MESSAGE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                    SizedBox(height: 10),
                    AppButton(
                      onPressed: () {
                        Navigator.pushNamed(context, GROUPS_ROUTE);
                      },
                      size: AppButtonSize.large,
                      child: Text(JOIN_PAGE_MESSAGE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                    SizedBox(height: 10),
                    AppButton(
                      onPressed: () {
                        _handleStartPuzzle(context);
                      },
                      size: AppButtonSize.large,
                      child: Text(START_PUZZLE_MESSAGE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 30),
              Text('Équipe 103', style: TextStyle(fontWeight: FontWeight.bold)),
              SizedBox(
                height: SPACE_2,
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    height: 32,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        tile('T', 'homas Trépanier',
                            'https://www.linkedin.com/in/thomas-tr%C3%A9panier/'),
                        tile('R', 'achad Chazbek',
                            'https://www.linkedin.com/in/rachad-chazbek-a06489212/'),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 32,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        tile('C', 'harles-François St-Cyr',
                            'https://www.linkedin.com/in/cfstcyr/'),
                        tile('A', 'hmed Mewloud',
                            'https://www.linkedin.com/in/ahmed-mewloud-b0a481195/'),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 32,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        tile('R', 'aphael Salvas',
                            'https://www.linkedin.com/in/raphael-salvas/'),
                        tile('A', 'mine Bourdache',
                            'https://www.linkedin.com/in/bourdache-amine-26b67a22a/'),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

_launchURL(String link) async {
  final uri = Uri.parse(link);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri);
  } else {
    throw 'Could not launch $link';
  }
}

Widget tile(String letter, String name, String link) {
  return TextButton(
    style: TextButton.styleFrom(
      minimumSize: Size.zero,
      padding: EdgeInsets.symmetric(vertical: SPACE_1, horizontal: SPACE_2),
    ),
    onPressed: () => _launchURL(link),
    child: Row(children: [
      Tile(
        tile: c.Tile(letter: letter),
        size: 20,
      ),
      SizedBox(width: 2),
      Text(
        name,
        style: TextStyle(color: Colors.black),
      ),
    ]),
  );
}

void _handleStartPuzzle(BuildContext context) {
  showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        ThemeData theme = Theme.of(context);
        final TimerSelector timerSelector = TimerSelector();
        return AlertDialog(
          title: Center(
            child: Text('Mode Entraînement',
                style: theme.textTheme.displayMedium
                    ?.copyWith(fontWeight: FontWeight.w500)),
          ),
          content: SingleChildScrollView(child: timerSelector),
          contentPadding:
              EdgeInsets.symmetric(vertical: 48.0, horizontal: 32.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8.0)),
          ),
          surfaceTintColor: Colors.white,
          backgroundColor: Colors.white,
          actions: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                ConstrainedBox(
                  constraints: BoxConstraints.tightFor(width: 216, height: 60),
                  child: AppButton(
                    onPressed: () => Navigator.pop(context),
                    theme: AppButtonTheme.secondary,
                    child: Text(
                      'Annuler',
                      style: TextStyle(
                          fontSize: 24, overflow: TextOverflow.ellipsis),
                      textAlign: TextAlign.end,
                    ),
                  ),
                ),
                SizedBox(
                  width: SPACE_3 * 4,
                ),
                ConstrainedBox(
                  constraints: BoxConstraints.tightFor(width: 216, height: 60),
                  child: AppButton(
                    onPressed: () {
                      getIt
                          .get<PuzzleService>()
                          .startPuzzle(timerSelector.duration)
                          .then((bool isSuccess) {
                        Navigator.pop(context);
                        if (isSuccess) {
                          // start puzzle and it will push
                          Navigator.pushReplacementNamed(context, PUZZLE_ROUTE);
                        } else {
                          errorSnackBar(context,
                              "Erreur lors du lancement de l'entraînement, veuillez réessayez plus tard");
                        }
                      });
                    },
                    theme: AppButtonTheme.primary,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text('Démarrer',
                            style: TextStyle(
                                fontSize: 24,
                                color: Colors.white,
                                overflow: TextOverflow.ellipsis),
                            textAlign: TextAlign.end),
                        Icon(
                          Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 48,
                        )
                      ],
                    ),
                  ),
                ),
              ],
            )
          ],
          actionsAlignment: MainAxisAlignment.spaceEvenly,
        );
      });
}
