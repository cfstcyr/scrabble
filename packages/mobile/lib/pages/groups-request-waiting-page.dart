import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart';
import 'package:mobile/components/individual-group.dart';
import 'package:mobile/components/parameters.dart';
import 'package:mobile/pages/join-waiting-page.dart';
import 'package:mobile/services/group-join.service.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/group.dart';
import '../components/group-selection.dart';
import '../constants/locale/group-selection-constants.dart';
import '../locator.dart';
import '../view-methods/create-lobby-methods.dart';

class GroupRequestWaitingPage extends StatefulWidget {
  const GroupRequestWaitingPage({super.key, required this.group});

  final Group group;

  @override
  State<GroupRequestWaitingPage> createState() =>
      _GroupRequestWaitingPageState();
}

class _GroupRequestWaitingPageState extends State<GroupRequestWaitingPage> {
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    GroupJoinService groupJoinService = getIt.get<GroupJoinService>();

    return Scaffold(
        appBar: AppBar(
          title: Text(JOIN_GAME),
          backgroundColor: Colors.white,
          centerTitle: true,
          surfaceTintColor: Colors.white,
          iconTheme: IconThemeData(color: theme.primaryColor),
        ),
        body: Center(
              child: Card(
                surfaceTintColor: Colors.white,
                color: Colors.white,
                borderOnForeground: true,
                child: SizedBox(
                  width: 400,
                  height: 400,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(32, 32, 32, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        Text("En attente de la réponse de l'hôte", style: theme.textTheme.titleLarge),
                        Spacer(),
                        PlayerInGroup(user: widget.group.users[0]),
                        Spacer(),
                        Parameters(maxRoundTime: widget.group.maxRoundTime, virtualPlayerLevel: widget.group.virtualPlayerLevel, backgroundColor: theme.colorScheme.background,),
                        Spacer(),
                        CircularProgressIndicator(),
                        Spacer(flex: 2),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                              onPressed: () {
                                groupJoinService.handleCancelJoinRequest();
                                Navigator.pop(context);
                              },
                              style: setStyleMainActionButtons(),
                              icon: Icon(
                                Icons.keyboard_arrow_left_sharp,
                                size: 20,
                              ),
                              label: Text(
                                CANCEL_REQUEST,
                                style: TextStyle(fontSize: 15),
                              )),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        backgroundColor: theme.colorScheme.background);
  }
}
