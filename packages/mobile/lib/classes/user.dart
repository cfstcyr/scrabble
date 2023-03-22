import 'package:mobile/constants/avatars-constants.dart';

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

class UserRequest {
  PublicUser publicUser;
  bool isObserver;
  UserRequest({
    required this.publicUser,
    this.isObserver = false,
  });

  factory UserRequest.fromJson(Map<String, dynamic> json) {
    return UserRequest(
      publicUser: PublicUser.fromJson(json['publicUser']),
      isObserver: json['isObserver'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'publicUser': publicUser,
      'isObserver': isObserver,
    };
  }
}

class RequestingUsers {
  List<PublicUser> requestingPlayers;
  List<PublicUser> requestingObservers;
  RequestingUsers({
    required this.requestingPlayers,
    required this.requestingObservers,
  });

  factory RequestingUsers.fromJson(Map<String, dynamic> json) {
    return RequestingUsers(
      requestingPlayers:
          PublicUser.usersFromJsonList(json['requestingPlayers']),
      requestingObservers:
          PublicUser.usersFromJsonList(json['requestingObservers']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'requestingPlayers': requestingPlayers,
      'requestingObservers': requestingObservers,
    };
  }
}

class PublicUser {
  String email;
  String username;
  String avatar;
  PublicUser({
    required this.username,
    this.avatar = '',
    this.email = '',
  });

  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
      email: json['email'] ?? '',
      username: json['username'] as String,
      avatar: json['avatar'] ?? AVATARS.first,
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
    List<PublicUser> users = [];

    for (int i = 1; i <= 4; i++) {
      if (json['user$i'] != null) {
        users.add(PublicUser.fromJson(json['user$i']));
      }
    }
    return users;
  }

  static List<PublicUser> usersFromJsonList(List<dynamic> json) {
    List<PublicUser> users = [];

    for (int i = 0; i < json.length; i++) {
      users.add(PublicUser.fromJson(json[i]));
    }
    return users;
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

class UserStatistics {
  int gamesPlayedCount;
  int gamesWonCount;
  double averagePointsPerGame;
  double averageTimePerGame;

  UserStatistics(
      {required this.averagePointsPerGame,
      required this.averageTimePerGame,
      required this.gamesPlayedCount,
      required this.gamesWonCount});

  UserStatistics.fromJson(Map<String, dynamic> json)
      : this(
            averagePointsPerGame: json['averagePointsPerGame'],
            averageTimePerGame: json['averageTimePerGame'],
            gamesPlayedCount: json['gamesPlayedCount'],
            gamesWonCount: json['gamesWonCount']);
}
