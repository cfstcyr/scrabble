import 'package:mobile/classes/user.dart';

class UserSession {
  final String token;
  final PublicUser user;

  UserSession({
    required this.token,
    required this.user,
  });

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      token: json['token'] as String,
      user: json['user'] as PublicUser,
    );
  }
}
