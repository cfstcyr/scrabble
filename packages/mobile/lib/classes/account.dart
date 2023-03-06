import 'dart:math';

class Account {
  final String username;
  final String password;
  final String email;
  final String avatar = "https://placedog.net/${Random().nextInt(1000)}";

  Account({
    required this.username,
    required this.password,
    required this.email,
  });

  factory Account.fromJson(Map<String, dynamic> json) {
    return Account(
      username: json['username'] as String,
      password: json['password'] as String,
      email: json['email'] as String,
    );
  }

  Map toJson() => {
        'username': username,
        'password': password,
        'email': email,
        'avatar': avatar
      };
}
