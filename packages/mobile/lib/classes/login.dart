class LoginData {
  final String username;
  final String password;

  LoginData({
    required this.username,
    required this.password,
  });

  factory LoginData.fromJson(Map<String, dynamic> json) {
    return LoginData(
      username: json['username'] as String,
      password: json['password'] as String,
    );
  }
}
