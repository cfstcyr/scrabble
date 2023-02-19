import 'package:mobile/classes/user.dart';
import 'package:mobile/controllers/game-creation-controller.dart';

import '../controllers/group-join-controller.dart';
import '../locator.dart';

class GroupJoinService {
  final groupJoinController = getIt.get<GroupJoinController>();

  GroupJoinService._privateConstructor();

  static final GroupJoinService _instance =
  GroupJoinService._privateConstructor();

  factory GroupJoinService() {
    return _instance;
  }

  void handleGetGroups() async {
    await groupJoinController.handleGetGroups();
  }
}
