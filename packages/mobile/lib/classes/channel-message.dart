import 'package:mobile/classes/chat-message.dart';

class ChannelMessage {
  final ChatMessage message;
  final int idChannel;

  ChannelMessage({required this.message, required this.idChannel});

  factory ChannelMessage.fromJson(Map<String, dynamic> json) {
    return ChannelMessage(
      message: json['message'] as ChatMessage,
      idChannel: json['idChannel'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        "message": message,
        "idChannel": idChannel,
      };
}
