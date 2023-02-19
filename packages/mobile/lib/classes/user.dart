class PublicUser {
  final String username;
  final String avatar;

  // TODO WHEN WE DEAL WITH AVATARS BACKEND, FOR NOW DEFAULT VALUE
  PublicUser({required this.username, this.avatar = "images/avatar-12.png"});

  factory PublicUser.fromJson(Map<String, dynamic> json) {
    return PublicUser(
      username: json['username'],
      avatar: json["avatar"],
    );
  }
  Map<String, dynamic> toJson() => {
        "username": username,
        "avatar": avatar,
      };
}
