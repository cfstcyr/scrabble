import 'package:mobile/classes/channel.dart';
import 'package:mobile/classes/chat-message.dart';

class ChannelMessage {
  final ChatMessage message;
  final Channel channel;

  ChannelMessage({required this.message, required this.channel});

  factory ChannelMessage.fromJson(Map<String, dynamic> json) {
    return ChannelMessage(
      message: json['message'] as ChatMessage,
      channel: json['channel'] as Channel,
    );
  }

  Map<String, dynamic> toJson() => {
        "message": message,
        "channel": channel,
      };
}
