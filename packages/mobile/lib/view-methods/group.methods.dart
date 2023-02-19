import 'package:mobile/classes/group.dart';
import 'package:rxdart/rxdart.dart';

BehaviorSubject<List<Group>> groups$ = BehaviorSubject.seeded(List.empty());

Stream<List<Group>> get groupStream => groups$.stream;
