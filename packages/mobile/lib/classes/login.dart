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

class LoginResponse {
  UserSession? userSession;
  bool authorized;
  String errorMessage;

  LoginResponse(
      {this.userSession, required this.authorized, required this.errorMessage});
}

enum TokenValidation {
  Ok,
  NoToken,
  AlreadyConnected,
  UnknownError,
}
