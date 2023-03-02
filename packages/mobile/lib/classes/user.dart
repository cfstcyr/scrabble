class PublicUser {
  final String username;
  final String avatar;
  final String email;

  // TODO WHEN WE DEAL WITH AVATARS BACKEND, FOR NOW DEFAULT VALUE -- todo email quand auth
  PublicUser(
      {required this.username,
      this.avatar = "images/avatar-12.png",
      this.email = ''});

  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
      username: json['username'],
      email: json['email'],
      avatar: json["avatar"],
    );
  }

  Map<String, dynamic> toJson() => {
        "username": username,
        "avatar": avatar,
        "email": email,
      };
}

List<PublicUser> usersFromJson(Map<String, dynamic> json) {
  return List<PublicUser>.from([
    json['user1'],
    json['user2'],
    json['user3'],
    json['user4']
  ].map((dynamic publicUser) => PublicUser.fromJson(publicUser)).toList());
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
