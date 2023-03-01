import 'package:flutter/material.dart';

import 'chat-management.dart';

class MyScaffold extends StatelessWidget {
  final Widget body;
  final String title;

  MyScaffold({required this.body, required this.title});
  final PageStorageBucket _bucket = PageStorageBucket();
  final Widget b =
      const ChatManagement(key: PageStorageKey<String>('chatManager'));
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: body,
      appBar: AppBar(
        title: Text(title),
        shadowColor: Colors.black,
        backgroundColor: Colors.white,
        elevation: 1,
        automaticallyImplyLeading: false,
        centerTitle: true,
      ),
      endDrawer:
          Container(width: 300, child: PageStorage(bucket: _bucket, child: b)),
    );
  }
}
