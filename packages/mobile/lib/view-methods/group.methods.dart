import 'package:mobile/classes/group.dart';
import 'package:rxdart/rxdart.dart';

Subject<List<Group>> groups$ = BehaviorSubject.seeded(List.empty());
Subject<String> rejectedJoinRequest$ = BehaviorSubject();
Subject<String> canceledGroup$ = BehaviorSubject();
