import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/user.service.dart';

import '../alert-dialog.dart';

class UserProfileInfo extends StatelessWidget {
  final UserService _userService = getIt.get<UserService>();
  final AccountAuthenticationController _authService =
      getIt.get<AccountAuthenticationController>();

  // create some values
  Color pickerColor =
      getIt.get<ThemeColorService>().themeDetails.value.color.colorValue;

// ValueChanged<Color> callback
  void changeColor(Color color) {
    pickerColor = color;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(SPACE_3),
        child: StreamBuilder<PublicUser?>(
          stream: _userService.user,
          builder: (context, snapshot) {
            return snapshot.data != null
                ? Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: SPACE_4,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Avatar(size: 150),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                snapshot.data!.username,
                                style: TextStyle(
                                    fontSize: 48, fontWeight: FontWeight.w600),
                              ),
                              Text(
                                snapshot.data!.email,
                                style: TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey.shade500),
                              ),
                            ],
                          )
                        ],
                      ),
                      Column(
                        children: [
                          AppButton(
                            onPressed: () => Navigator.pushNamed(
                                context, PROFILE_EDIT_ROUTE),
                            icon: Icons.manage_accounts_rounded,
                          ),
                          AppButton(
                            onPressed: () {
                              _authService.signOut();
                              Navigator.pushNamed(context, LOGIN_ROUTE);
                            },
                            icon: Icons.logout_rounded,
                          ),
                          AppButton(
                            onPressed: () => {
                              triggerDialogBox('Pick a theme', [
                                SingleChildScrollView(
                                    child: StreamBuilder(
                                        stream: getIt
                                            .get<ThemeColorService>()
                                            .themeDetails
                                            .stream,
                                        builder: (context, snapshot) {
                                          ThemeColor themeColor =
                                              snapshot.data?.color ??
                                                  ThemeColor.green;
                                          return Column(
                                            children: [
                                              Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .spaceAround,
                                                children: [
                                                  ColorOption(
                                                    themeColor: themeColor,
                                                    optionColor:
                                                        ThemeColor.green,
                                                  ),
                                                  SizedBox(width: 20),
                                                  ColorOption(
                                                    themeColor: themeColor,
                                                    optionColor:
                                                        ThemeColor.blue,
                                                  ),
                                                  SizedBox(width: 20),
                                                  ColorOption(
                                                    themeColor: themeColor,
                                                    optionColor:
                                                        ThemeColor.purple,
                                                  ),
                                                ],
                                              ),
                                              SizedBox(height: 20),
                                              Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .spaceAround,
                                                children: [
                                                  ColorOption(
                                                    themeColor: themeColor,
                                                    optionColor:
                                                        ThemeColor.pink,
                                                  ),
                                                  SizedBox(width: 20),
                                                  ColorOption(
                                                    themeColor: themeColor,
                                                    optionColor: ThemeColor.red,
                                                  ),
                                                  SizedBox(width: 20),
                                                  ColorOption(
                                                    themeColor: themeColor,
                                                    optionColor:
                                                        ThemeColor.black,
                                                  ),
                                                ],
                                              ),
                                            ],
                                          );
                                        }))
                              ], [
                                DialogBoxButtonParameters(
                                    content: 'Ok',
                                    theme: AppButtonTheme.primary,
                                    closesDialog: true)
                              ])
                            },
                            icon: Icons.abc_sharp,
                          ),
                        ],
                      ),
                    ],
                  )
                : Container();
          },
        ),
      ),
    );
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
