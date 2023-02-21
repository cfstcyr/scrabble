import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';

class UserService {
  UserService._privateConstructor();
  BehaviorSubject<PublicUser?> user = BehaviorSubject<PublicUser?>();
  static final UserService _instance = UserService._privateConstructor();
  factory UserService() {
    return _instance;
  }
  PublicUser getUser() {
    return user.value!;
  }
}
