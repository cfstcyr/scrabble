import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/user.service.dart';

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
                              // raise the [showDialog] widget
                              showDialog(
                                context: context,
                                builder: (context) => AlertDialog(
                                  title: const Text('Pick a theme color!'),
                                  content: SingleChildScrollView(
                                    child: ColorPicker(
                                      pickerColor: pickerColor,
                                      onColorChanged: changeColor,
                                    ),
                                  ),
                                  actions: <Widget>[
                                    ElevatedButton(
                                      child: const Text('Default'),
                                      onPressed: () {
                                        getIt
                                            .get<ThemeColorService>()
                                            .themeDetails
                                            .add(setTheme(ThemeColor.green));
                                        Navigator.of(context).pop();
                                      },
                                    ),
                                    ElevatedButton(
                                      child: const Text('Dark Mode'),
                                      onPressed: () {
                                        getIt
                                            .get<ThemeColorService>()
                                            .themeDetails
                                            .add(setTheme(ThemeColor.green));
                                        Navigator.of(context).pop();
                                      },
                                    ),
                                    ElevatedButton(
                                      child: const Text('Save TODO REMV'),
                                      onPressed: () {
                                        getIt
                                            .get<ThemeColorService>()
                                            .themeDetails
                                            .add(setTheme(ThemeColor.green));
                                        Navigator.of(context).pop();
                                      },
                                    ),
                                  ],
                                ),
                              )
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
