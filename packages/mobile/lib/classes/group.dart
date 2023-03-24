import 'dart:convert';

import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/classes/virtual-player-level.dart';

class Group {
  String? groupId;
  final List<PublicUser> users;
  final int maxRoundTime;
  final VirtualPlayerLevel virtualPlayerLevel;
  final GameVisibility gameVisibility;
  final String? password;
  bool? canJoin;

  Group(
      {required this.users,
      required this.maxRoundTime,
      required this.virtualPlayerLevel,
      required this.gameVisibility,
      this.canJoin,
      this.groupId,
      this.password});

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
        users: PublicUser.usersFromJson(json),
        maxRoundTime: json['maxRoundTime'] as int,
        virtualPlayerLevel:
            VirtualPlayerLevel.fromJson(json['virtualPlayerLevel']),
        gameVisibility: GameVisibility.fromJson(json['gameVisibility']),
        groupId: json['groupId'] as String);
  }

  Map<String, dynamic> toJson() => {
        'groupId': groupId,
        'user1': users[0],
        'user2': users[1],
        'user3': users[2],
        'user4': users[3],
        'maxRoundTime': maxRoundTime,
        'virtualPlayerLevel': virtualPlayerLevel.levelName,
        'gameVisibility': gameVisibility.name,
      };
  Map<String, dynamic> GroupCreationDatatoJson() => {
        'user1': users[0],
        'maxRoundTime': maxRoundTime,
        'virtualPlayerLevel': virtualPlayerLevel.levelName,
        'gameVisibility': gameVisibility.name,
      };
}

class GroupCreationResponse {
  bool isCreated;
  String groupId;

  GroupCreationResponse({required this.isCreated, required this.groupId});
}
