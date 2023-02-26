import 'dart:async';

import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/group.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';
import '../classes/virtual-player-level.dart';
import '../constants/create-lobby-constants.dart';

Group testGroup = Group(
    groupId: '1',
    users: [
      PublicUser(username: 'Thomas'),
      PublicUser(username: 'Charles-François'),
    ],
    maxRoundTime: 60,
    virtualPlayerLevel: VirtualPlayerLevel.beginner,
    gameVisibility: GameVisibility.public);
BehaviorSubject<List<Group>> groups$ = BehaviorSubject.seeded(List.of([
  testGroup,
  testGroup,
  testGroup,

]));

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
  groups$.add([...groups$.value, ...receivedGroups]);
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
