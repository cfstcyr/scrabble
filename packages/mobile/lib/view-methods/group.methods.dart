import 'dart:async';

import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/group.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../classes/virtual-player-level.dart';
import '../constants/game-constants.dart';

Group testGroup = Group(groupId: '1', users: [PublicUser(username: 'Thomas'), PublicUser(username: 'Charles-François')], maxRoundTime: 60, virtualPlayerLevel: VirtualPlayerLevel.beginner, gameVisibility: GameVisibility.private);
BehaviorSubject<List<Group>> groups$ = BehaviorSubject.seeded(List.of([testGroup, testGroup, testGroup, testGroup, testGroup, testGroup, testGroup, testGroup]));

Stream<List<Group>> get groupStream {
  return groups$.map((List<Group> groups) {
    for (Group group in groups) {
      group.canJoin = group.users.length > MAX_GROUP_SIZE;
    }
    return groups;
  });
}

void handleGroupsUpdate(dynamic newGroupsJson) {
  List<Group> receivedGroups = List<Group>.from(newGroupsJson.map((dynamic group) => Group.fromJson(group)).toList());
  groups$.add([...groups$.value, ...receivedGroups]);
}

Subject<Group> acceptedJoinRequest$ = BehaviorSubject();
Subject<String> rejectedJoinRequest$ = BehaviorSubject();
Subject<String> canceledGroup$ = BehaviorSubject();
