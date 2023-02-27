class Channel {
  final int idChannel;
  final String name;
  final bool canQuit;
  final bool private;

  Channel(
      {required this.idChannel,
      required this.name,
      required this.canQuit,
      required this.private});

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      idChannel: json['id'] as int,
      name: json['name'] as String,
      canQuit: json['canQuit'] as bool,
      private: json['private'] as bool,
    );
  }
  Map<String, dynamic> toJson() => {
        "id": idChannel,
        "name": name,
        "canQuit": canQuit,
        "private": private,
      };
}
