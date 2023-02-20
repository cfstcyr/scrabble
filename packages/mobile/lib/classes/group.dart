import 'package:mobile/classes/user.dart';
import 'package:mobile/classes/virtual-player-level.dart';

class Group {
  final String groupId;
  final List<PublicUser> users;
  final int maxRoundTime;
  final VirtualPlayerLevel virtualPlayerLevel;
  bool? canJoin;

  Group(
      {required this.groupId,
      required this.users,
      required this.maxRoundTime,
      required this.virtualPlayerLevel,
      this.canJoin});

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
        groupId: json['groupId'] as String,
        users: json['users'] as List<PublicUser>,
        maxRoundTime: json['maxRoundTime'] as int,
        virtualPlayerLevel: json['virtualPlayerLevel'] as VirtualPlayerLevel);
  }

  Map<String, dynamic> toJson() => {
        'groupId': groupId,
        'users': users,
        'maxRoundTime': maxRoundTime,
        'virtualPLayerLevel': virtualPlayerLevel,
      };
}
