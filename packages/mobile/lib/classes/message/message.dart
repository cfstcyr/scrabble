class Message {
  final String content;
  final String senderId;
  final String gameId;
  final bool? isClickable;

  Message({
    required this.content,
    required this.senderId,
    required this.gameId,
    this.isClickable,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      content: json['content'] as String,
      senderId: json['senderId'] as String,
      gameId: json['gameId'] as String,
      isClickable: json['isClickable'] as bool?,
    );
  }
}
