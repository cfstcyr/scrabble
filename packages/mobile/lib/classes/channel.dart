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
      idChannel: json['idChannel'] as int,
      name: json['name'] as String,
      canQuit: json['canQuit'] as bool,
      private: json['private'] as bool,
    );
  }
  Map<String, dynamic> toJson() => {
        "idChannel": idChannel,
        "name": name,
        "canQuit": canQuit,
        "private": private,
      };
}

class ChannelName {
  final String name;

  ChannelName({required this.name});

  factory ChannelName.fromJson(Map<String, dynamic> json) {
    return ChannelName(
      name: json['name'] as String,
    );
  }
  Map<String, dynamic> toJson() => {
        "name": name,
      };
}
