import 'dart:async';

import 'package:mobile/classes/group.dart';
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
