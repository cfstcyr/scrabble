import '../classes/actions/action-data.dart';

class ActionService {
  ActionService._privateConstructor();

  static final ActionService _instance =
  ActionService._privateConstructor();

  factory ActionService() {
    return _instance;
  }

  void sendAction(String gameId, ActionData actionData) {

  }
}
