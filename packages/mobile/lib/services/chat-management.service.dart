import 'package:flutter/material.dart';
import 'package:mobile/controllers/chat-management.controller.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/channel.dart';
import '../locator.dart';

class ChatManagementService {
  ChatManagementService._privateConstructor();

  static final ChatManagementService _instance =
      ChatManagementService._privateConstructor();

  factory ChatManagementService() {
    return _instance;
  }
  final _chatManagementController = getIt.get<ChatManagementController>();

  List<Channel> get channels => _chatManagementController.channels;
  List<Channel> get myChannels => _chatManagementController.myChannels;
  BehaviorSubject<List<Channel>> get channels$ =>
      _chatManagementController.channels$;
  BehaviorSubject<List<Channel>> get myChannels$ =>
      _chatManagementController.myChannels$;
  BehaviorSubject<bool> get shouldOpen$ =>
      _chatManagementController.shouldOpen$;
  BehaviorSubject<Channel> get channelToOpen$ =>
      _chatManagementController.channelToOpen$;
  BehaviorSubject<List<Channel>> get channelSearchResult$ =>
      _chatManagementController.channelSearchResult$;
  GlobalKey<ScaffoldState> get scaffoldKey =>
      _chatManagementController.scaffoldKey;

  Future<void> createChannel(String channelName) async {
    _chatManagementController.createChannel(channelName);
  }

  Future<void> joinChannel(int idChannel) async {
    _chatManagementController.joinChannel(idChannel);
  }

  Future<void> quitChannel(int idChannel) async {
    _chatManagementController.quitChannel(idChannel);
  }

  Future<void> getAllChannels() async {
    _chatManagementController.getAllChannels();
  }

  List<Channel> handleUnjoinedChannels() {
    return handleUnjoinedChannels();
  }
}
