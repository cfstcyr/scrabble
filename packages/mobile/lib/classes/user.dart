class User {
  int idUser;
  String hash;
  String salt;
  String email;
  String username;
  String avatar;

  User(
      {required this.idUser,
      required this.hash,
      required this.salt,
      required this.email,
      required this.username,
      required this.avatar});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      idUser: json['idUser'],
      hash: json['hash'],
      salt: json['salt'],
      email: json['email'],
      username: json['username'],
      avatar: json['avatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'idUser': idUser,
      'hash': hash,
      'salt': salt,
      'email': email,
      'username': username,
      'avatar': avatar,
    };
  }
}

class UserLoginCredentials {
  String email;
  String password;

  UserLoginCredentials({required this.email, required this.password});

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

class PublicUser {
  String email;
  String username;
  String avatar;
  PublicUser({
    required this.username,
    this.avatar = "images/avatar-12.png",
    this.email = '',
  });

  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
      email: json['email'] as String,
      username: json['username'] as String,
      avatar: json['avatar'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'username': username,
      'avatar': avatar,
    };
  }

  static List<PublicUser> usersFromJson(Map<String, dynamic> json) {
    return List<PublicUser>.from([
      json['user1'],
      json['user2'],
      json['user3'],
      json['user4']
    ].map((dynamic publicUser) => PublicUser.fromJson(publicUser)).toList());
  }
}

class UserSession {
  String token;
  PublicUser user;

  UserSession({required this.token, required this.user});

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'user': user.toJson(),
    };
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      token: json['token'] as String,
      user: PublicUser.fromJson(json['user']),
    );
  }
}

class EditableUserFields {
  String username;
  String avatar;

  EditableUserFields({required this.username, required this.avatar});

  Map<String, String> toJson() {
    return {
      'username': username,
      'avatar': avatar,
    };
  }
}
