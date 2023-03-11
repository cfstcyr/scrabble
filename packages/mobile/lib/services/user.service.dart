import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';

const USER_NOT_INITIALIZED = "User not initialized";

class UserService {
  UserService._privateConstructor();
  BehaviorSubject<PublicUser?> _user = BehaviorSubject<PublicUser?>();
  static final UserService _instance = UserService._privateConstructor();
  factory UserService() {
    return _instance;
  }

  ValueStream<PublicUser?> get user => _user.stream;

  PublicUser getUser() {
    assert(_user.valueOrNull != null, USER_NOT_INITIALIZED);
    return _user.value!;
  }

  void setUser(PublicUser user) {
    assert(_user.valueOrNull != null, USER_NOT_INITIALIZED);
    _user.add(user);
  }
}
