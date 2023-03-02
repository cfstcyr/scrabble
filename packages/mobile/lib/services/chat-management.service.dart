import 'package:mobile/controllers/chat-management.controller.dart';

import '../locator.dart';

class ChatManagementService {
  ChatManagementService._privateConstructor();

  static final ChatManagementService _instance =
      ChatManagementService._privateConstructor();

  factory ChatManagementService() {
    return _instance;
  }
  final chatManagementController = getIt.get<ChatManagementController>();

  Future<void> createChannel(String channelName) async {
    chatManagementController.createChannel(channelName);
  }

  Future<void> joinChannel(int idChannel) async {
    chatManagementController.joinChannel(idChannel);
  }

  Future<void> quitChannel(int idChannel) async {
    chatManagementController.quitChannel(idChannel);
  }

  Future<void> getAllChannels() async {
    chatManagementController.getAllChannels();
  }
}
