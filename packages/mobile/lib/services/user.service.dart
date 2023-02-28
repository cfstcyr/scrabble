import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';

const USER_NOT_INITIALIZED = "User not initialized";

class UserService {
  UserService._privateConstructor();
  BehaviorSubject<PublicUser?> user = BehaviorSubject<PublicUser?>();
  static final UserService _instance = UserService._privateConstructor();
  factory UserService() {
    return _instance;
  }
  PublicUser getUser() {
    assert(user != null, USER_NOT_INITIALIZED);
    return user.value!;
  }
}
