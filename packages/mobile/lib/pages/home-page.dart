import 'package:flutter/material.dart';
import 'package:mobile/classes/tile/tile.dart' as c;
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/image.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/tile/tile.dart';
import 'package:mobile/routes/routes.dart';
import 'package:url_launcher/url_launcher.dart';

import '../constants/home-page.constants.dart';
import '../constants/login-constants.dart';
import '../controllers/account-authentification-controller.dart';
import '../controllers/game-creation-controller.dart';
import '../locator.dart';

class HomePage extends StatelessWidget {
  @override
  final AccountAuthenticationController authService =
      getIt.get<AccountAuthenticationController>();

  final gameCreationController = getIt.get<GameCreationController>();
  final gameJoinController = getIt.get<GroupJoinController>();
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
                  height: 600,
                ),
              ),
              SizedBox(
                width: 250,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppButton(
                      onPressed: () {
                        Navigator.pushNamed(context, CREATE_LOBBY_ROUTE);
                      },
                      size: AppButtonSize.large,
                      child: Text(CREATE_PAGE_MESSAGE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                    SizedBox(height: 10),
                    AppButton(
                      onPressed: () {
                        Navigator.pushNamed(context, JOIN_LOBBY_ROUTE);
                      },
                      size: AppButtonSize.large,
                      child: Text(JOIN_PAGE_MESSAGE,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                    SizedBox(height: 10),
                    AppButton(
                      onPressed: () {
                        authService.signOut();
                        Navigator.pushNamed(context, MAIN_PAGE);
                      },
                      size: AppButtonSize.large,
                      child: Text(SIGNOUT_LABEL_FR,
                          style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 30),
              Text('Équipe 103', style: TextStyle(fontWeight: FontWeight.bold)),
              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      tile('T',
                          'https://www.linkedin.com/in/thomas-tr%C3%A9panier/'),
                      Text('homas Trépanier'),
                      tile('R',
                          'https://www.linkedin.com/in/rachad-chazbek-a06489212/'),
                      Text('achad Chazbek'),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      tile('C', 'https://www.linkedin.com/in/cfstcyr/'),
                      Text('harles-François St-Cyr'),
                      tile('A',
                          'https://www.linkedin.com/in/ahmed-mewloud-b0a481195/'),
                      Text('hmed Mewloud'),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      tile('R', 'https://www.linkedin.com/in/raphael-salvas/'),
                      Text('aphael Salvas'),
                      tile('A',
                          'https://www.linkedin.com/in/bourdache-amine-26b67a22a/'),
                      Text('mine Bourdache'),
                    ],
                  )
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

Widget tile(String letter, String link) {
  return TextButton(
    style: TextButton.styleFrom(
      minimumSize: Size.zero,
      padding: EdgeInsets.zero,
    ),
    onPressed: () => _launchURL(link),
    child: Tile(
      tile: c.Tile(letter: letter),
      size: 30,
    ),
  );
}
