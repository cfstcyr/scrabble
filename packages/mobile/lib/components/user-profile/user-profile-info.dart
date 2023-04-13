import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/notification.service.dart';
import 'package:mobile/services/theme-color-service.dart';

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
                ? Column(
                    children: [
                      AppButton(
                        onPressed: () {
                          Navigator.popAndPushNamed(
                              context, PROFILE_EDIT_ROUTE);
                        },
                        icon: Icons.manage_accounts_rounded,
                      ),
                      StreamBuilder<bool>(
                          stream: getIt
                              .get<NotificationService>()
                              .isNotificationEnabled,
                          builder: (context, snapshot) {
                            bool isEnabled = snapshot.data ?? true;
                            return AppButton(
                              onPressed: () => getIt
                                  .get<NotificationService>()
                                  .toggleNotifications(),
                              icon: isEnabled
                                  ? Icons.notifications
                                  : Icons.notifications_off_rounded,
                            );
                          }),
                      AppButton(
                        onPressed: () {
                          _authService.signOut();
                          Navigator.pushNamed(context, LOGIN_ROUTE);
                        },
                        icon: Icons.logout_rounded,
                      ),
                      AppButton(
                        onPressed: () => {
                          triggerDialogBox('Veuillez choisir un thème', [
                            EditTheme()
                          ], [
                            DialogBoxButtonParameters(
                                content: 'Confirmer',
                                theme: AppButtonTheme.primary,
                                closesDialog: true)
                          ])
                        },
                        icon: Icons.color_lens,
                      ),
                    ],
                  )
                : Container(),
          ],
        ),
      ),
    );
  }
}

class EditTheme extends StatelessWidget {
  const EditTheme({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        child: StreamBuilder(
            stream: getIt.get<ThemeColorService>().themeDetails.stream,
            builder: (context, snapshot) {
              ThemeColor themeColor = snapshot.data?.color ?? ThemeColor.green;
              return Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      ColorOption(
                        themeColor: themeColor,
                        optionColor: ThemeColor.green,
                      ),
                      SizedBox(width: 20),
                      ColorOption(
                        themeColor: themeColor,
                        optionColor: ThemeColor.blue,
                      ),
                      SizedBox(width: 20),
                      ColorOption(
                        themeColor: themeColor,
                        optionColor: ThemeColor.purple,
                      ),
                    ],
                  ),
                  SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      ColorOption(
                        themeColor: themeColor,
                        optionColor: ThemeColor.pink,
                      ),
                      SizedBox(width: 20),
                      ColorOption(
                        themeColor: themeColor,
                        optionColor: ThemeColor.red,
                      ),
                      SizedBox(width: 20),
                      ColorOption(
                        themeColor: themeColor,
                        optionColor: ThemeColor.black,
                      ),
                    ],
                  ),
                ],
              );
            }));
  }
}

class ColorOption extends StatelessWidget {
  const ColorOption({
    super.key,
    required this.themeColor,
    required this.optionColor,
  });

  final ThemeColor themeColor;
  final ThemeColor optionColor;

  @override
  Widget build(BuildContext context) {
    return Transform.scale(
      scale: themeColor == optionColor ? 1.1 : 1,
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
              color: themeColor == optionColor
                  ? Colors.blueGrey.shade600
                  : Colors.transparent,
              width: 2),
          borderRadius: BorderRadius.all(Radius.circular(100)),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () {
            getIt
                .get<ThemeColorService>()
                .themeDetails
                .add(setTheme(optionColor));
          },
          splashColor: Colors.transparent,
          child: Opacity(
            opacity: themeColor == optionColor ? 1 : 0.8,
            child: Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                    shape: BoxShape.circle, color: optionColor.colorValue)),
          ),
        ),
      ),
    );
  }
}
