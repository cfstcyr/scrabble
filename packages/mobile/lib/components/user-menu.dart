import 'package:flutter/material.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/edit-theme.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/user.service.dart';

void openUserMenu(BuildContext context) {
  triggerDialogBox(
      "Menu",
      [
        AppButton(
          onPressed: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, PROFILE_ROUTE,
                arguments: getIt.get<UserService>().user.value);
          },
          text: "Mon profil",
          icon: Icons.person_2_rounded,
          width: 220,
        ),
        AppButton(
          onPressed: () {
            Navigator.pop(context);
            openEditTheme(context);
          },
          text: "Paramètres",
          icon: Icons.settings,
          width: 220,
        ),
        AppButton(
          onPressed: () {
            Navigator.pop(context);
            getIt.get<AccountAuthenticationController>().signOut();
            Navigator.pushNamed(context, LOGIN_ROUTE);
          },
          text: "Déconnexion",
          icon: Icons.logout_rounded,
          width: 220,
        )
      ],
      [
        DialogBoxButtonParameters(
            content: "Annuler",
            theme: AppButtonTheme.secondary,
            closesDialog: true)
      ],
      dismissOnBackgroundTouch: true);
}
