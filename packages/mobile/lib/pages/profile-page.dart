import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/components/user-profile/user-profile-game-history.dart';
import 'package:mobile/components/user-profile/user-profile-info.dart';
import 'package:mobile/components/user-profile/user-profile-server-actions.dart';
import 'package:mobile/components/user-profile/user-profile-statistics.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/game-history.dart';
import '../classes/user.dart';
import '../locator.dart';
import '../services/user.service.dart';

class ProfilePage extends StatelessWidget {
  ProfilePage({super.key, required this.userSearchResult});
  final UserService _userService = getIt.get<UserService>();
  final PublicUser userSearchResult;

  BehaviorSubject<PublicUser?> user = BehaviorSubject.seeded(null);
  bool isLocalUser = false;
  BehaviorSubject<UserStatistics> statistics = BehaviorSubject.seeded(
      UserStatistics(
          averagePointsPerGame: -1,
          averageTimePerGame: -1,
          gamesPlayedCount: -1,
          gamesWonCount: -1));
  BehaviorSubject<List<GameHistory>> gameHistory = BehaviorSubject.seeded([]);

  @override
  Widget build(BuildContext context) {
    if (_userService.user.value?.username == userSearchResult.username) {
      user.add(_userService.user.value);
      isLocalUser = true;
      _userService.getUserStatistics().then((event) => statistics.add(event));
      _userService.getGameHistory().then((event) => gameHistory.add(event));
    } else {
      user.add(userSearchResult);
      _userService
          .getProfileByUsername(userSearchResult.username)
          .then((value) {
        statistics.add(value.statistics);
        gameHistory.add(value.gameHistory);
      });
    }

    return MyScaffold(
      title: 'Mon profile',
      isLocalProfile: isLocalUser,
      body: Container(
        color: Colors.grey.shade100,
        child: SingleChildScrollView(
            child: Container(
          padding: EdgeInsets.all(SPACE_3),
          child: Column(children: [
            UserProfileInfo(user: user, isLocalUser: isLocalUser),
            UserProfileStatistics(statistics: statistics),
            UserProfileGameHistory(gameHistory: gameHistory),
            isLocalUser ? UserProfileServerActions() : Container(),
          ]),
        )),
      ),
    );
  }
}
