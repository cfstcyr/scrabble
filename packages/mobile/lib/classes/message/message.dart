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
}
