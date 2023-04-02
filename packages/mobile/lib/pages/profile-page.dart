import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/user-profile/user-profile-game-history.dart';
import 'package:mobile/components/user-profile/user-profile-info.dart';
import 'package:mobile/components/user-profile/user-profile-server-actions.dart';
import 'package:mobile/components/user-profile/user-profile-statistics.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../locator.dart';
import '../services/user.service.dart';

class ProfilePage extends StatelessWidget {
  ProfilePage({super.key, required this.userSearchResult});
  final UserService _userService = getIt.get<UserService>();
  final PublicUser userSearchResult;

  BehaviorSubject<PublicUser?> user = BehaviorSubject.seeded(null);
  bool isLocalUser = false;

  @override
  Widget build(BuildContext context) {
    user.add(userSearchResult);
    if (_userService.user.value?.username == userSearchResult.username) {
      user.add(_userService.user.value);
      isLocalUser = true;
    }

    return MyScaffold(
      title: 'Mon profile',
      body: Container(
        color: Colors.grey.shade100,
        child: SingleChildScrollView(
            child: Container(
          padding: EdgeInsets.all(SPACE_3),
          child: Column(children: [
            UserProfileInfo(user: user, isLocalUser: isLocalUser),
            UserProfileStatistics(
              statistics: _userService.getUserStatistics(),
            ),
            UserProfileGameHistory(),
            UserProfileServerActions(),
          ]),
        )),
      ),
    );
  }
}
