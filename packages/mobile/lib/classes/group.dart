import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/classes/virtual-player-level.dart';

class Group {
  final String groupId;
  final List<PublicUser> users;
  final int maxRoundTime;
  final VirtualPlayerLevel virtualPlayerLevel;
  final GameVisibility gameVisibility;
  bool? canJoin;

  Group(
      {required this.groupId,
      required this.users,
      required this.maxRoundTime,
      required this.virtualPlayerLevel,
      required this.gameVisibility,
      this.canJoin});

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
        groupId: json['groupId'] as String,
        users: usersFromJson(json),
        maxRoundTime: json['maxRoundTime'] as int,
        virtualPlayerLevel:
            VirtualPlayerLevel.fromJson(json['virtualPlayerLevel']),
        gameVisibility: GameVisibility.fromJson(json['gameVisibility']));
  }

  Map<String, dynamic> toJson() => {
        'groupId': groupId,
        'user1': users[0],
        'user2': users[1],
        'user3': users[2],
        'user4': users[3],
        'maxRoundTime': maxRoundTime,
        'virtualPLayerLevel': virtualPlayerLevel,
        'gameVisibility': gameVisibility,
      };
}
