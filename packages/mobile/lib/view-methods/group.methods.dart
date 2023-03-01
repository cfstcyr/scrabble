import 'dart:async';

import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/virtual-player-level.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../constants/create-lobby-constants.dart';

Group publicGroup = Group(groupId: '1', users: [PublicUser(username: 'Thomas')], maxRoundTime: 30, virtualPlayerLevel: VirtualPlayerLevel.beginner, gameVisibility: GameVisibility.public);
Group privateGroup = Group(groupId: '2', users: [PublicUser(username: 'Rachad'), PublicUser(username: 'Amine')], maxRoundTime: 60, virtualPlayerLevel: VirtualPlayerLevel.expert, gameVisibility: GameVisibility.private);
Group protectedGroup = Group(groupId: '3', users: [PublicUser(username: 'Thomas'), PublicUser(username: 'Charles'), PublicUser(username: 'Raphael'), PublicUser(username: 'Ahmed')], maxRoundTime: 90, virtualPlayerLevel: VirtualPlayerLevel.beginner, gameVisibility: GameVisibility.protected);
BehaviorSubject<List<Group>> groups$ = BehaviorSubject.seeded(List.of([publicGroup, privateGroup, protectedGroup]));

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

Subject<Group> acceptedJoinRequest$ = BehaviorSubject();

Stream<Group> get acceptedStream => acceptedJoinRequest$.stream;

Subject<String> rejectedJoinRequest$ = BehaviorSubject();

Stream<String> get rejectedStream => rejectedJoinRequest$.stream;

Subject<String> canceledGroup$ = BehaviorSubject();

Stream<String> get canceledStream => canceledGroup$.stream;

void reOpenSubject<T>(Subject<T> subject, [T? seed]) {
  if (!subject.isClosed) return;

  subject = seed == null ? BehaviorSubject() : BehaviorSubject.seeded(seed);
}

Future<void> closeSubject<T>(Subject<T> subject) async {
  if (subject.isClosed) return;
  await subject.done;
  await subject.drain();
  await subject.close();
}
