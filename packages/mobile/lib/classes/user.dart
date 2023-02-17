class PublicUser {
  final String username;
  final String avatar;

  PublicUser({required this.username, required this.avatar});

  Map<String, dynamic> toJson() => {
        "username": username,
        "avatar": avatar,
      };
  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
      username: json["username"],
      avatar: json["avatar"],
    );
  }
}
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
