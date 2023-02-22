import 'package:mobile/locator.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';

const SESSION_NOT_INITIALIZED_ASSERT = 'User session not initialized';

class UserSessionService {
  BehaviorSubject<UserSession?> _userSession = BehaviorSubject<UserSession?>();
  final storageService = getIt.get<StorageHandlerService>();
  UserSessionService._privateConstructor();
  static final UserSessionService _instance =
      UserSessionService._privateConstructor();
  factory UserSessionService() {
    return _instance;
  }

  UserSession get userSession {
    assert(_userSession != null, SESSION_NOT_INITIALIZED_ASSERT);
    return _userSession.value!;
  }

  void initializeUserSession(UserSession session) {
    storageService.setToken(session.token);
  }

  void clearUserSession() {
    _userSession.add(null);
    storageService.clearStorage();
  }

  Future<String?> getToken() async {
    return await storageService.getToken();
  }
}
