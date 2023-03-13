// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/classes/virtual-player-level.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/user.service.dart';

import '../../classes/group.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/create-game.constants.dart';
import '../../controllers/game-creation-controller.dart';
import '../../pages/home-page.dart';

class CreateGameForm extends StatefulWidget {
  @override
  CreateGameFormState createState() => CreateGameFormState();
}

@visibleForTesting
class CreateGameFormState extends State<CreateGameForm> {
  String _password = "";
  String? _playerLevel = VirtualPlayerLevel.beginner.levelName;
  bool isFirstSubmit = true;
  bool get isButtonEnabled => isFirstSubmit || isFormValid();
  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  GameCreationController gameCreationController =
      getIt.get<GameCreationController>();
  UserService userService = getIt.get<UserService>();

  final emailHandler = TextFieldHandler();
  String? _visibility = GameVisibility.public.name;
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
                                    Text(GameVisibility.public.name),
                                    Icon(Icons.public),
                                  ]),
                                  value: GameVisibility.public.name,
                                  groupValue: _visibility,
                                  onChanged: (value) =>
                                      setState(() => _visibility = value),
                                ),
                              ),
                              Expanded(
                                child: RadioListTile(
                                  title: Wrap(children: [
                                    Text(GameVisibility.protected.name),
                                    Icon(Icons.security)
                                  ]),
                                  value: GameVisibility.protected.name,
                                  groupValue: _visibility,
                                  onChanged: (value) =>
                                      setState(() => _visibility = value),
                                ),
                              ),
                              Expanded(
                                child: RadioListTile(
                                  title: Wrap(children: [
                                    Text(GameVisibility.private.name),
                                    Icon(Icons.lock)
                                  ]),
                                  value: GameVisibility.private.name,
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
                              visible:
                                  _visibility == GameVisibility.protected.name),
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
                            visible:
                                _visibility == GameVisibility.protected.name,
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
                                  _timePerTurn -= Duration(seconds: MIN_TIME);
                                  if (_timePerTurn <
                                      Duration(seconds: MIN_TIME)) {
                                    _timePerTurn = Duration(seconds: MIN_TIME);
                                  }
                                }),
                              ),
                              Text(
                                  '${_timePerTurn.inMinutes}:${_timePerTurn.inSeconds.remainder(DEFAULT_TIME).toString().padLeft(2, ZERO)}'),
                              IconButton(
                                icon: Icon(Icons.add),
                                onPressed: () => setState(() {
                                  _timePerTurn += Duration(seconds: MIN_TIME);
                                  if (_timePerTurn >
                                      Duration(minutes: MAX_TIME)) {
                                    _timePerTurn = Duration(minutes: MAX_TIME);
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
      password: _visibility == GameVisibility.protected.name ? _password : '',
    );
    GroupCreationResponse createdGroup =
        await gameCreationController.handleCreateGame(groupData);
    createdGroup.isCreated
        ? Navigator.pushNamed(context, CREATE_LOBBY_ROUTE)
        : {};
  }

  bool isFormValid() {
    if (_visibility == GameVisibility.protected.name) {
      return passwordHandler.controller.text.isNotEmpty;
    }
    return true;
  }
}