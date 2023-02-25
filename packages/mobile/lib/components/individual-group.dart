import 'package:flutter/material.dart';
import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/user.dart';

import '../utils/duration-format.dart';

class IndividualGroup extends StatelessWidget {
  const IndividualGroup({
    super.key,
    required this.theme,
    required this.group,
  });

  final ThemeData theme;
  final Group group;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
          color: theme.colorScheme.background,
          borderRadius: BorderRadius.all(Radius.circular(8))),
      child: IntrinsicHeight(
        child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
          Row(
              children: List.generate(
            4,
            (index) {
              PublicUser userToShow = group.users.length > index
                  ? group.users[index]
                  : generateVirtualPlayerUser(group.virtualPlayerLevel);
              return PlayerInGroup(user: userToShow);
            },
          )),
          VerticalDivider(
            width: 32,
            thickness: 2,
            indent: 8,
            endIndent: 8,
            color: theme.colorScheme.tertiary,
          ),
          GroupParameters(theme: theme, group: group),
          SizedBox(
            width: 32,
          ),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 16),
                    child: Row(
                      mainAxisSize: MainAxisSize.max,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Observers(),
                        SizedBox(width: 16),
                        GameVisibilityView(
                          gameVisibility: group.gameVisibility,
                        ),
                        SizedBox(width: 24),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 60,
                              height: 60,
                              child: ElevatedButton(
                                  onPressed: () {},
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: theme.primaryColor,
                                      foregroundColor: Colors.white,
                                      padding: EdgeInsets.all(0),
                                      shape: BeveledRectangleBorder(
                                          borderRadius: BorderRadius.all(
                                              Radius.circular(2)))),
                                  child: Icon(Icons.visibility, size: 40)),
                            ),
                          ],
                        ),
                        SizedBox(width: 24),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 90,
                              height: 60,
                              child: ElevatedButton(
                                  onPressed: () {
                                    // testGroups();
                                  },
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: theme.primaryColor,
                                      foregroundColor: Colors.white,
                                      padding: EdgeInsets.all(0),
                                      shape: BeveledRectangleBorder(
                                          borderRadius: BorderRadius.all(
                                              Radius.circular(2)))),
                                  child:
                                      Icon(Icons.play_arrow_rounded, size: 60)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ]),
      ),
    );
  }
}

class GameVisibilityView extends StatelessWidget {
  const GameVisibilityView({super.key, required this.gameVisibility});

  final GameVisibility gameVisibility;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
        message: gameVisibility.description,
        triggerMode: TooltipTriggerMode.tap,
        preferBelow: false,
        showDuration: Duration(seconds: 3),
        child: Icon(gameVisibility.icon, size: 40));
  }
}

class Observers extends StatelessWidget {
  const Observers({
    super.key,
  });

  // TODO: Add dynamic number
  final int numberOfObservers = 0;

  @override
  Widget build(BuildContext context) {
    return numberOfObservers != 0
        ? Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(Icons.visibility_outlined, size: 30),
              SizedBox(width: 4),
              Text(
                numberOfObservers.toString(),
                style: TextStyle(fontSize: 24),
              )
            ],
          )
        : SizedBox.shrink();
  }
}

class GroupParameters extends StatelessWidget {
  const GroupParameters({
    super.key,
    required this.theme,
    required this.group,
  });

  final ThemeData theme;
  final Group group;

  @override
  Widget build(BuildContext context) {
    return IntrinsicWidth(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(height: 8),
          Expanded(
            child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                  color: theme.colorScheme.tertiary,
                  borderRadius: BorderRadius.all(Radius.circular(8))),
              child: Padding(
                padding: const EdgeInsets.all(4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.hourglass_bottom),
                    SizedBox(width: 8),
                    Text(formatTime(group.maxRoundTime)),
                  ],
                ),
              ),
            ),
          ),
          SizedBox(height: 8),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                  color: theme.colorScheme.tertiary,
                  borderRadius: BorderRadius.all(Radius.circular(8))),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 4, 16, 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.precision_manufacturing),
                    SizedBox(width: 8),
                    Text(group.virtualPlayerLevel.levelName),
                  ],
                ),
              ),
            ),
          ),
          SizedBox(height: 8),
        ],
      ),
    );
  }
}

class PlayerInGroup extends StatelessWidget {
  const PlayerInGroup({
    super.key,
    required this.user,
  });

  final PublicUser user;

  @override
  Widget build(BuildContext context) {
    String username = user.username;
    String? avatar = user.avatar.isNotEmpty ? user.avatar : null;

    var theme = Theme.of(context);

    return Container(
      margin: EdgeInsets.fromLTRB(4, 8, 4, 4),
      padding: EdgeInsets.only(bottom: 4),
      child: IntrinsicWidth(
        child: SizedBox(
          width: 100,
          child: Column(
            // crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              FittedBox(
                fit: BoxFit.cover,
                child: getUserAvatar(avatar, getUsersInitials(username), theme.colorScheme.onBackground),
              ),
              SizedBox(
                height: 4,
              ),
              Center(
                  child: Text(
                    username,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                softWrap: true,
              ))
            ],
          ),
        ),
      ),
    );
  }
}
