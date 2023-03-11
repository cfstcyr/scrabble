import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/image.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/user.service.dart';

class UserProfileInfo extends StatelessWidget {
  final UserService _userService = getIt.get<UserService>();

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
                          )
                        ],
                      )
                    ],
                  )
                : Container();
          },
        ),
      ),
    );
  }
}
