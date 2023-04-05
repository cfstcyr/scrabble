// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/classes/virtual-player-level.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-creation-service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:mobile/utils/duration-format.dart';
import 'package:mobile/view-methods/create-lobby-methods.dart';
import 'package:rxdart/rxdart.dart';

import '../../classes/group.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/create-game.constants.dart';
import '../../pages/home-page.dart';

class CreateGameForm extends StatefulWidget {
  @override
  CreateGameFormState createState() => CreateGameFormState();
}

@visibleForTesting
class CreateGameFormState extends State<CreateGameForm> {
  GameCreationService gameCreationService = getIt.get<GameCreationService>();
  UserService userService = getIt.get<UserService>();

  BehaviorSubject<String?> _playerLevel =
      BehaviorSubject<String?>.seeded(VirtualPlayerLevel.beginner.levelName);
  BehaviorSubject<String?> _visibility =
      BehaviorSubject<String?>.seeded(GameVisibility.public.name);
  BehaviorSubject<Duration> _timePerTurn =
      BehaviorSubject<Duration>.seeded(Duration(minutes: 1));
  late PublicUser _user;
  final BehaviorSubject<TextFieldHandler> _passwordHandler =
      BehaviorSubject<TextFieldHandler>.seeded(TextFieldHandler());

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
                          StreamBuilder(
                              stream: _playerLevel.stream,
                              builder: (context, snapshot) {
                                String? playerLevel =
                                    snapshot.data ?? _playerLevel.value;
                                return Row(
                                  children: [
                                    Expanded(
                                      child: RadioListTile(
                                        title: Text(VirtualPlayerLevel
                                            .beginner.levelName),
                                        value: VirtualPlayerLevel
                                            .beginner.levelName,
                                        groupValue: playerLevel,
                                        onChanged: (value) =>
                                            _playerLevel.add(value),
                                      ),
                                    ),
                                    Expanded(
                                      child: RadioListTile(
                                        title: Text(VirtualPlayerLevel
                                            .expert.levelName),
                                        value:
                                            VirtualPlayerLevel.expert.levelName,
                                        groupValue: playerLevel,
                                        onChanged: (value) =>
                                            _playerLevel.add(value),
                                      ),
                                    ),
                                  ],
                                );
                              }),
                          SizedBox(height: 16.0),
                          Text(VISIBILITY_FIELD_TITLE_FR),
                          StreamBuilder(
                              stream: _visibility.stream,
                              builder: (context, snapshot) {
                                String? visibility =
                                    snapshot.data ?? _visibility.value;

                                return Row(
                                  children: [
                                    Expanded(
                                      child: RadioListTile(
                                        title: Wrap(children: [
                                          Text(GameVisibility.public.name),
                                          Icon(Icons.public),
                                        ]),
                                        value: GameVisibility.public.name,
                                        groupValue: visibility,
                                        onChanged: (value) =>
                                            _visibility.add(value),
                                      ),
                                    ),
                                    Expanded(
                                      child: RadioListTile(
                                        title: Wrap(children: [
                                          Text(GameVisibility.protected.name),
                                          Icon(Icons.security)
                                        ]),
                                        value: GameVisibility.protected.name,
                                        groupValue: visibility,
                                        onChanged: (value) =>
                                            _visibility.add(value),
                                      ),
                                    ),
                                    Expanded(
                                      child: RadioListTile(
                                        title: Wrap(children: [
                                          Text(GameVisibility.private.name),
                                          Icon(Icons.lock)
                                        ]),
                                        value: GameVisibility.private.name,
                                        groupValue: visibility,
                                        onChanged: (value) =>
                                            _visibility.add(value),
                                      ),
                                    ),
                                  ],
                                );
                              }),
                          StreamBuilder(
                              stream: CombineLatestStream.list<dynamic>([
                                _visibility.stream,
                                _passwordHandler.stream
                              ]),
                              builder: (context, snapshot) {
                                if (snapshot.data == null) return Container();

                                String? visibility = snapshot.data![0];
                                TextFieldHandler passwordHandler =
                                    snapshot.data![1];

                                return Padding(
                                  padding: const EdgeInsets.only(top: SPACE_1),
                                  child: Visibility(
                                    visible: visibility ==
                                        GameVisibility.protected.name,
                                    child: TextField(
                                      controller: passwordHandler.controller,
                                      focusNode: passwordHandler.focusNode,
                                      keyboardType:
                                          TextInputType.visiblePassword,
                                      autocorrect: false,
                                      enableSuggestions: false,
                                      onChanged: (_) =>
                                          _passwordHandler.add(passwordHandler),
                                      decoration: InputDecoration(
                                        border: OutlineInputBorder(),
                                        labelText: PASSWORD_LABEL_FR,
                                        errorText:
                                            passwordHandler.errorMessage.isEmpty
                                                ? null
                                                : passwordHandler.errorMessage,
                                      ),
                                    ),
                                  ),
                                );
                              }),
                          SizedBox(height: 16.0),
                          Wrap(children: [
                            Text(ROUND_TIME_FIELD_TITLE_FR),
                            Icon(Icons.hourglass_top)
                          ]),
                          StreamBuilder<Duration>(
                              stream: _timePerTurn.stream,
                              builder: (context, snapshot) {
                                Duration time =
                                    snapshot.data ?? _timePerTurn.value;
                                return Row(
                                  children: [
                                    IconButton(
                                      icon: Icon(Icons.remove),
                                      onPressed: time > MIN_TIME
                                          ? () => _timePerTurn
                                              .add(time -= INCREMENT_TIME)
                                          : null,
                                    ),
                                    Text(formatTime(time.inSeconds)),
                                    IconButton(
                                      icon: Icon(Icons.add),
                                      onPressed: time < MAX_TIME
                                          ? () => _timePerTurn
                                              .add(time += INCREMENT_TIME)
                                          : null,
                                    ),
                                  ],
                                );
                              }),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          AppButton(
                              onPressed: () {
                                Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => HomePage()));
                              },
                              theme: AppButtonTheme.secondary,
                              text: CANCEL_CREATION_LABEL_FR),
                          StreamBuilder(
                              stream: isFormValid(),
                              builder: (context, snapshot) {
                                return AppButton(
                                    onPressed:
                                        snapshot.hasData && snapshot.data!
                                            ? () async => await createGame()
                                            : null,
                                    text: CREATE_GAME_LABEL_FR);
                              })
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

  Future<void> createGame() async {
    List<PublicUser> _users = [_user];
    Group groupData = Group(
      users: _users,
      maxRoundTime: _timePerTurn.value.inSeconds,
      virtualPlayerLevel: VirtualPlayerLevel.fromString(_playerLevel.value!),
      gameVisibility: GameVisibility.fromString(_visibility.value!),
      password: _visibility.value == GameVisibility.protected.name
          ? _passwordHandler.value.controller.text
          : '',
    );
    bool isCreated = await gameCreationService.handleCreateGame(groupData);
    if (context.mounted) {
      isCreated
          ? {
              userService.isObserver = false,
              reInitialize(),
              Navigator.pushNamed(context, CREATE_LOBBY_ROUTE,
                  arguments: groupData)
            }
          : {};
    }
  }

  Stream<bool> isFormValid() {
    return CombineLatestStream<dynamic, bool>(
        [_visibility.stream, _passwordHandler.stream], (values) {
      String? visibility = values[0];
      TextFieldHandler passwordHandler = values[1];

      if (visibility == GameVisibility.protected.name) {
        return passwordHandler.controller.text.isNotEmpty;
      }
      return true;
    });
  }
}
