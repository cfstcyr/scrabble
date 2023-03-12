// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

import '../constants/create-game.constants.dart';
import '../controllers/account-authentification-controller.dart';
import 'home-page.dart';

class CreateGameForm extends StatefulWidget {
  @override
  CreateGameFormState createState() => CreateGameFormState();
}

@visibleForTesting
class CreateGameFormState extends State<CreateGameForm> {
  bool isPasswordShown = false;
  String? _playerLevel = 'Debutant';
  bool isFirstSubmit = true;
  bool get isButtonEnabled => isFirstSubmit || isFormValid();
  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  AccountAuthenticationController accountController =
      getIt.get<AccountAuthenticationController>();

  final emailHandler = TextFieldHandler();
  String? _visibility = 'Public';
  Duration _timePerTurn = Duration(minutes: 1);

  @override
  void initState() {
    super.initState();

    //emailHandler.addListener(validateEmail);
  }

  @override
  void dispose() {
    // emailHandler.dispose();
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
              width: 500,
              constraints: BoxConstraints(minHeight: 540),
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
                                  title: Text('Débutant'),
                                  value: 'Debutant',
                                  groupValue: _playerLevel,
                                  onChanged: (value) =>
                                      setState(() => _playerLevel = value),
                                ),
                              ),
                              Expanded(
                                child: RadioListTile(
                                  title: Text('Expert'),
                                  value: 'Expert',
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
                                    Icon(Icons.public)
                                  ]),
                                  value: 'Public',
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
                                  value: 'Protegée',
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
                                  value: 'Privée',
                                  groupValue: _visibility,
                                  onChanged: (value) =>
                                      setState(() => _visibility = value),
                                ),
                              ),
                            ],
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

  bool isFormValid() {
    return emailHandler.isValid();
  }

  void validatePassword() {}

  Future<void> CreateGame() async {}
}
