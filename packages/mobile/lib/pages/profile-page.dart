import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/user-profile/user-profile-game-history.dart';
import 'package:mobile/components/user-profile/user-profile-info.dart';
import 'package:mobile/components/user-profile/user-profile-server-actions.dart';
import 'package:mobile/components/user-profile/user-profile-statistics.dart';
import 'package:mobile/constants/layout.constants.dart';

class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: 'Mon profile',
      body: Container(
        color: Colors.grey.shade100,
        child: SingleChildScrollView(
            child: Container(
          padding: EdgeInsets.all(SPACE_3),
          child: Column(children: [
            UserProfileInfo(),
            UserProfileStatistics(),
            UserProfileGameHistory(),
            UserProfileServerActions(),
          ]),
        )),
      ),
    );
  }
}