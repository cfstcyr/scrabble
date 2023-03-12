import 'dart:async';

import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/user.dart';
import 'package:rxdart/rxdart.dart';

import '../constants/create-lobby-constants.dart';

BehaviorSubject<List<Group>> groups$ = BehaviorSubject.seeded([]);

Stream<List<Group>> get groupStream {
  return groups$.map((List<Group> groups) {
    for (Group group in groups) {
      group.canJoin = group.users.length < MAX_PLAYER_COUNT;
    }
    return groups;
  });
}

void handleGroupsUpdate(dynamic newGroupsJson) {
  List<Group> receivedGroups = List<Group>.from(
      newGroupsJson.map((dynamic group) => Group.fromJson(group)).toList());
  groups$.add(receivedGroups);
}

Subject<Group> currentGroupUpdate$ = PublishSubject();

Stream<Group> get currentGroupUpdateStream => currentGroupUpdate$.stream;

Subject<PublicUser> rejectedJoinRequest$ = PublishSubject();

Stream<PublicUser> get rejectedStream => rejectedJoinRequest$.stream;

Subject<PublicUser> canceledGroup$ = PublishSubject();

Stream<PublicUser> get canceledStream => canceledGroup$.stream;
