class Player {
  final String username;

  Player({
    required this.username,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      username: json['username'] as String,
    );
  }

  Map toJson() => {
        'username': username,
      };
}
