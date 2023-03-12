// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/classes/virtual-player-level.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/user.service.dart';

import '../../classes/group.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/create-game.constants.dart';
import '../../controllers/game-creation-controller.dart';
import '../../pages/create-lobby.dart';
import '../../pages/home-page.dart';

class CreateGameForm extends StatefulWidget {
  @override
  CreateGameFormState createState() => CreateGameFormState();
}

@visibleForTesting
class CreateGameFormState extends State<CreateGameForm> {
  String _password = "";
  String? _playerLevel = VP_LEVEL_BEGINNER_LABEL_FR;
  bool isFirstSubmit = true;
  bool get isButtonEnabled => isFirstSubmit || isFormValid();
  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  GameCreationController gameCreationController =
      getIt.get<GameCreationController>();
  UserService userService = getIt.get<UserService>();

  final emailHandler = TextFieldHandler();
  String? _visibility = PUBLIC_LABEL_FR;
  Duration _timePerTurn = Duration(minutes: 1);
  late PublicUser _user;
  final passwordHandler = TextFieldHandler();

  @override
  void initState() {
    super.initState();
    _user = userService.getUser();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: SPACE_3),
        child: Column(
          children: [
            Container(
              width: 600,
              constraints: BoxConstraints(minHeight: 400),
              child: Card(
                child: Padding(
                  padding: EdgeInsets.all(SPACE_3),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Wrap(
                        runSpacing: SPACE_2,
                        children: [
                          Text(VP_LEVEL_FIELD_TITLE_FR),
                          Row(
                            children: [
                              Expanded(
                                child: RadioListTile(
                                  title: Text(
                                      VirtualPlayerLevel.beginner.levelName),
                                  value: VirtualPlayerLevel.beginner.levelName,
                                  groupValue: _playerLevel,
                                  onChanged: (value) =>
                                      setState(() => _playerLevel = value),
                                ),
                              ),
                              Expanded(
                                child: RadioListTile(
                                  title:
                                      Text(VirtualPlayerLevel.expert.levelName),
                                  value: VirtualPlayerLevel.expert.levelName,
                                  groupValue: _playerLevel,
                                  onChanged: (value) =>
                                      setState(() => _playerLevel = value),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 16.0),
                          Text(VISIBILITY_FIELD_TITLE_FR),
                          Row(
                            children: [
                              Expanded(
                                child: RadioListTile(
                                  title: Wrap(children: [
                                    Text(PUBLIC_LABEL_FR),
                                    Icon(Icons.public),
                                  ]),
                                  value: PUBLIC_LABEL_FR,
                                  groupValue: _visibility,
                                  onChanged: (value) =>
                                      setState(() => _visibility = value),
                                ),
                              ),
                              Expanded(
                                child: RadioListTile(
                                  title: Wrap(children: [
                                    Text(PROTECTED_LABEL_FR),
                                    Icon(Icons.security)
                                  ]),
                                  value: PROTECTED_LABEL_FR,
                                  groupValue: _visibility,
                                  onChanged: (value) =>
                                      setState(() => _visibility = value),
                                ),
                              ),
                              Expanded(
                                child: RadioListTile(
                                  title: Wrap(children: [
                                    Text(PRIVATE_LABEL_FR),
                                    Icon(Icons.lock)
                                  ]),
                                  value: PRIVATE_LABEL_FR,
                                  groupValue: _visibility,
                                  onChanged: (value) =>
                                      setState(() => _visibility = value),
                                ),
                              ),
                            ],
                          ),
                          Visibility(
                              child: SizedBox(
                                height: SPACE_1,
                                width: double.maxFinite,
                              ),
                              visible: _visibility == PROTECTED_LABEL_FR),
                          Visibility(
                            child: TextField(
                              controller: passwordHandler.controller,
                              focusNode: passwordHandler.focusNode,
                              keyboardType: TextInputType.visiblePassword,
                              autocorrect: false,
                              enableSuggestions: false,
                              decoration: InputDecoration(
                                border: OutlineInputBorder(),
                                labelText: PASSWORD_LABEL_FR,
                                errorText: passwordHandler.errorMessage.isEmpty
                                    ? null
                                    : passwordHandler.errorMessage,
                              ),
                            ),
                            visible: _visibility == PROTECTED_LABEL_FR,
                          ),
                          SizedBox(height: 16.0),
                          Wrap(children: [
                            Text(ROUND_TIME_FIELD_TITLE_FR),
                            Icon(Icons.hourglass_top)
                          ]),
                          Row(
                            children: [
                              IconButton(
                                icon: Icon(Icons.remove),
                                onPressed: () => setState(() {
                                  _timePerTurn -= Duration(seconds: 30);
                                  if (_timePerTurn < Duration(seconds: 30)) {
                                    _timePerTurn = Duration(seconds: 30);
                                  }
                                }),
                              ),
                              Text(
                                  '${_timePerTurn.inMinutes}:${_timePerTurn.inSeconds.remainder(60).toString().padLeft(2, '0')}'),
                              IconButton(
                                icon: Icon(Icons.add),
                                onPressed: () => setState(() {
                                  _timePerTurn += Duration(seconds: 30);
                                  if (_timePerTurn > Duration(minutes: 5)) {
                                    _timePerTurn = Duration(minutes: 5);
                                  }
                                }),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => HomePage()));
                            },
                            child: const Text(
                              CANCEL_CREATION_LABEL_FR,
                              style:
                                  TextStyle(color: Colors.black, fontSize: 15),
                            ),
                          ),
                          ElevatedButton(
                            onPressed:
                                isButtonEnabled ? () => {CreateGame()} : null,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: themeColor,
                              shadowColor: Colors.black,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(3.0),
                              ),
                            ),
                            child: Text(
                              CREATE_GAME_LABEL_FR,
                              style: isButtonEnabled
                                  ? TextStyle(color: Colors.white, fontSize: 15)
                                  : TextStyle(
                                      color: Color.fromARGB(255, 87, 87, 87),
                                      fontSize: 15),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> CreateGame() async {
    List<PublicUser> _users = [_user];
    Group groupData = Group(
      users: _users,
      maxRoundTime: _timePerTurn.inSeconds,
      virtualPlayerLevel: VirtualPlayerLevel.fromString(_playerLevel!),
      gameVisibility: GameVisibility.fromString(_visibility!),
      password: _visibility == PROTECTED_LABEL_FR ? _password : '',
    );
    GroupCreationResponse createdGroup =
        await gameCreationController.handleCreateGame(groupData);
    createdGroup.isCreated
        ? {
            Navigator.push(context,
                MaterialPageRoute(builder: (context) => CreateLobbyPage()))
          }
        : {};
  }

  bool isFormValid() {
    if (_visibility == PROTECTED_LABEL_FR) {
      return passwordHandler.controller.text.isNotEmpty;
    }
    return true;
  }
}
