import 'package:flutter/material.dart';

import 'chat-management.dart';

class MyScaffold extends StatelessWidget {
  final Widget body;
  final String title;

  MyScaffold({required this.body, required this.title});
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
        actions: [
          Builder(
            builder: (context) => IconButton(
              icon: Icon(Icons.chat),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
        ],
      ),
      endDrawer: Container(width: 350, child: const ChatManagement()),
    );
  }
}
