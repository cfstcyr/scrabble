class Channel {
  final String id;
  final String name;
  final bool canQuit;

  Channel({required this.id, required this.name, required this.canQuit});

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      id: json['id'] as String,
      name: json['name'] as String,
      canQuit: json['canQuite'] as bool,
    );
  }
}
