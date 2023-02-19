class PublicUser {
  final String username;
  final String avatar;

  // TODO WHEN WE DEAL WITH AVATARS BACKEND, FOR NOW DEFAULT VALUE
  PublicUser({required this.username, this.avatar = "images/avatar-12.png"});

  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
      username: json['username'] as String,
    );
  }
  Map<String, dynamic> toJson() => {
        "username": username,
        "avatar": avatar,
      };
}

// TODO AUTHENTIFICATION
// export interface PublicUser {
//   username: string;
//   avatar: string;
// }

// class User {
//   final String idUser;
//   final String email;
//   final String password;
//   final String username;
// }

// class Credentials {
//   final String username,
//   final String password,
// }
