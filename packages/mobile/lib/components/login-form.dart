// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

import '../classes/login.dart';
import '../constants/create-account-constants.dart';
import '../constants/create-account-errors.dart';
import '../constants/login-constants.dart';
import '../pages/create-account-page.dart';
import '../pages/home-page.dart';
import '../pages/prototype-page.dart';
// import '../services/login-authentification.service.dart';

class LoginForm extends StatefulWidget {
  @override
  // ignore: library_private_types_in_public_api
  _LoginFormState createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  bool isPasswordShown = false;
  bool isFirstSubmit = true;
  bool get isButtonEnabled => isFirstSubmit;
  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  // AuthentificationService accountService = getIt.get<AuthentificationService>();

  final usernameHandler = TextFieldHandler();
  final passwordHandler = TextFieldHandler();

  @override
  void initState() {
    super.initState();

    usernameHandler.addListener(validateUsername);
  }

  @override
  void dispose() {
    usernameHandler.dispose();
    passwordHandler.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    var style = theme.textTheme.displayMedium!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    return Column(
      children: [
        SizedBox(height: 20),
        Padding(padding: EdgeInsets.only(top: 1.0)),
        Container(
          height: 330,
          width: 580,
          decoration: BoxDecoration(
              border: Border.all(
                color: theme.colorScheme.onPrimary,
              ),
              borderRadius: BorderRadius.circular(5)),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                children: [
                  Padding(
                    padding: EdgeInsets.only(
                        left: 15.0, right: 15.0, top: 15.0, bottom: 0),
                    child: TextField(
                      controller: usernameHandler.controller,
                      focusNode: usernameHandler.focusNode,
                      obscureText: false,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: USERNAME_LABEL_FR,
                        errorText: usernameHandler.errorMessage.isEmpty
                            ? null
                            : usernameHandler.errorMessage,
                      ),
                    ),
                  ),
                  SizedBox(height: 15),
                  Padding(
                    padding: EdgeInsets.only(
                        left: 15.0, right: 15.0, top: 15.0, bottom: 0),
                    child: TextField(
                      controller: passwordHandler.controller,
                      focusNode: passwordHandler.focusNode,
                      keyboardType: TextInputType.visiblePassword,
                      obscureText: !isPasswordShown,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(),
                        labelText: PASSWORD_LABEL_FR,
                        errorText: passwordHandler.errorMessage.isEmpty
                            ? null
                            : passwordHandler.errorMessage,
                      ),
                    ),
                  ),
                  CheckboxListTile(
                    title: Text(CHECKBOX_SHOW_PASSWORD_LABEL_FR),
                    value: isPasswordShown,
                    onChanged: (bool? value) {
                      setState(() {
                        isPasswordShown = value!;
                      });
                    },
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
                  Padding(
                    padding: EdgeInsets.only(
                        left: 15.0, right: 15.0, top: 15.0, bottom: 15.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Padding(
                          padding: EdgeInsets.only(
                              left: 50.0, right: 0, top: 30, bottom: 0),
                          child: Row(children: [
                            ElevatedButton(
                              onPressed: () {
                                Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => PrototypePage()));
                                isButtonEnabled ? () => {login()} : null;
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: themeColor,
                                shadowColor: Colors.black,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(3.0),
                                ),
                              ),
                              child: Text(
                                LOGIN_LABEL_FR,
                                style: isButtonEnabled
                                    ? TextStyle(
                                        color: Colors.white, fontSize: 15)
                                    : TextStyle(
                                        color: Color.fromARGB(255, 87, 87, 87),
                                        fontSize: 15),
                              ),
                            ),
                            SizedBox(width: 50),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) =>
                                            CreateAccountPage()));
                              },
                              child: Text('Se créer un compte'),
                            )
                          ]),
                        )
                      ],
                    ),
                  )
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> validateUsername() async {
    if (usernameHandler.controller.text.isEmpty) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_EMPTY_FR;
      });
    } else {
      setState(() {
        usernameHandler.errorMessage = "";
      });
    }
  }

  Future<void> login() async {
    LoginData credentials = LoginData(
        username: usernameHandler.controller.text,
        password: passwordHandler.controller.text);

    if (true) {
      // await accountService.login(credentials))
      Navigator.push(
          context, MaterialPageRoute(builder: (context) => HomePage()));
    }
  }
}
