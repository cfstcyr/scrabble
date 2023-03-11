import 'package:mobile/controllers/user-controller.dart';
import 'package:mobile/locator.dart';
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

  UserController _userController = getIt.get<UserController>();

  ValueStream<PublicUser?> get user => _user.stream;

  PublicUser getUser() {
    assert(_user.valueOrNull != null, USER_NOT_INITIALIZED);
    return _user.value!;
  }

  void setUser(PublicUser user) {
    _user.add(user);
  }

  Future<PublicUser> editUser(EditableUserFields edits) async {
    PublicUser user = await _userController.editUser(edits);
    _user.add(user);
    return user;
  }
}
