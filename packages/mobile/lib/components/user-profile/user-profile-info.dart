import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/edit-theme.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:rxdart/rxdart.dart';

import '../alert-dialog.dart';

class UserProfileInfo extends StatelessWidget {
  UserProfileInfo({required this.user, this.isLocalUser = false});

  final AccountAuthenticationController _authService =
      getIt.get<AccountAuthenticationController>();
  PublicUser user;
  final bool isLocalUser;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(SPACE_3),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: SPACE_4,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Avatar(size: 150, avatar: user.avatar),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.username,
                      style:
                          TextStyle(fontSize: 48, fontWeight: FontWeight.w600),
                    ),
                    Text(
                      user.email,
                      style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade500),
                    ),
                  ],
                )
              ],
            ),
            isLocalUser
                ? Column(children: [
                    AppButton(
                      onPressed: () =>
                          Navigator.pushNamed(context, PROFILE_EDIT_ROUTE),
                      icon: Icons.manage_accounts_rounded,
                    ),
                  ])
                : Container(),
          ],
        ),
      ),
    );
  }
}
