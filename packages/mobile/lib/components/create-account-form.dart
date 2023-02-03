// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/account.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/constants/create-account-errors.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/pages/login-page.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:email_validator/email_validator.dart';

import '../constants/create-account-constants.dart';
import '../pages/home-page.dart';
import '../services/account-authentification-service.dart';

class CreateAccountForm extends StatefulWidget {
  @override
  _CreateAccountFormState createState() => _CreateAccountFormState();
}

class _CreateAccountFormState extends State<CreateAccountForm> {
  bool isPasswordShown = false;
  bool isFirstSubmit = true;
  bool get isButtonEnabled => isFirstSubmit || isFormValid();
  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  AccountAuthenticationService accountService = getIt.get<AccountAuthenticationService>();

  final emailHandler = TextFieldHandler();
  final usernameHandler = TextFieldHandler();
  final passwordHandler = TextFieldHandler();
  final passwordMatchHandler = TextFieldHandler();

  final EdgeInsetsGeometry textFieldPadding = EdgeInsets.only(left: 15.0, right: 15.0, top: 15.0, bottom: 0);

  @override
  void initState() {
    super.initState();

    emailHandler.addListener(validateEmail);
    usernameHandler.addListener(validateUsername);
    passwordHandler.addListener(validatePassword);
    passwordMatchHandler.addListener(validatePasswordMatch);
  }

  @override
  void dispose() {
    usernameHandler.dispose();
    passwordHandler.dispose();
    passwordMatchHandler.dispose();
    emailHandler.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 600,
      width: 500,
      decoration: BoxDecoration(
          border: Border.all(
            color: themeColor,
          ),
          borderRadius: BorderRadius.circular(5)),
      child: Column(
        children: [
          Padding(
            padding: textFieldPadding,
            child: TextField(
              controller: emailHandler.controller,
              focusNode: emailHandler.focusNode,
              obscureText: false,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: EMAIL_LABEL_FR,
                errorText: emailHandler.errorMessage.isEmpty ? null : emailHandler.errorMessage,
              ),
            ),
          ),
          Padding(
            padding: textFieldPadding,
            child: TextField(
              controller: usernameHandler.controller,
              focusNode: usernameHandler.focusNode,
              obscureText: false,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: USERNAME_LABEL_FR,
                errorText: usernameHandler.errorMessage.isEmpty ? null : usernameHandler.errorMessage,
              ),
            ),
          ),
          Padding(
            padding: textFieldPadding,
            child: TextField(
              controller: passwordHandler.controller,
              focusNode: passwordHandler.focusNode,
              keyboardType: TextInputType.visiblePassword,
              autocorrect: false,
              enableSuggestions: false,
              obscureText: !isPasswordShown,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: PASSWORD_LABEL_FR,
                helperText: PASSWORD_HELPER_TEXT_FR,
                helperMaxLines: 3,
                errorText: passwordHandler.errorMessage.isEmpty ? null : passwordHandler.errorMessage,
              ),
            ),
          ),
          Padding(
            padding: textFieldPadding,
            child: TextField(
              controller: passwordMatchHandler.controller,
              focusNode: passwordMatchHandler.focusNode,
              autocorrect: false,
              keyboardType: TextInputType.visiblePassword,
              enableSuggestions: false,
              obscureText: !isPasswordShown,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: PASSWORD_MATCH_LABEL_FR,
                errorText: passwordMatchHandler.errorMessage.isEmpty ? null : passwordMatchHandler.errorMessage,
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
            padding: textFieldPadding,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (context) => LoginPage()));
                  },
                  child: const Text(
                    REDIRECT_LOGIN_LABEL_FR,
                    style: TextStyle(color: Colors.black, fontSize: 15),
                  ),
                ),
                ElevatedButton(
                  onPressed: isButtonEnabled ? () => {createAccount()} : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeColor,
                    shadowColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(3.0),
                    ),
                  ),
                  child: Text(
                    CREATE_ACCOUNT_LABEL_FR,
                    style: isButtonEnabled
                        ? TextStyle(color: Colors.white, fontSize: 15)
                        : TextStyle(color: Color.fromARGB(255, 87, 87, 87), fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void validatePassword() {
    if (!validatePasswordStructure(passwordHandler.controller.text)) {
      setState(() {
        passwordHandler.errorMessage = PASSWORD_INVALID_FORMAT_FR;
      });
    } else {
      setState(() {
        passwordHandler.errorMessage = "";
      });
    }
  }

  void validatePasswordMatch() {
    if (passwordHandler.controller.text != passwordMatchHandler.controller.text) {
      setState(() {
        passwordMatchHandler.errorMessage = PASSWORD_NOT_MATCHING_FR;
      });
    } else {
      setState(() {
        passwordMatchHandler.errorMessage = "";
      });
    }
  }

  Future<void> validateEmail() async {
    if (emailHandler.controller.text.isEmpty) {
      setState(() {
        emailHandler.errorMessage = EMAIL_EMPTY_FR;
      });
    } else if (!EmailValidator.validate(emailHandler.controller.text, true)) {
      setState(() {
        emailHandler.errorMessage = EMAIL_INVALID_FORMAT_FR;
      });
    } else if (!await accountService.isEmailUnique(emailHandler.controller.text)) {
      setState(() {
        emailHandler.errorMessage = EMAIL_ALREADY_USED_FR;
      });
    } else {
      setState(() {
        emailHandler.errorMessage = "";
      });
    }
  }

  Future<void> validateUsername() async {
    if (usernameHandler.controller.text.isEmpty) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_EMPTY_FR;
      });
    } else if (!validateUsernameStructure(usernameHandler.controller.text)) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_INVALID_FORMAT_FR;
      });
    } else if (!await accountService.isUsernameUnique(usernameHandler.controller.text)) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_ALREADY_USED_FR;
      });
    } else {
      setState(() {
        usernameHandler.errorMessage = "";
      });
    }
  }

  bool isFormValid() {
    return emailHandler.isValid() && usernameHandler.isValid() && passwordHandler.isValid() && passwordMatchHandler.isValid();
  }

  Future<void> createAccount() async {
    setState(() {
      isFirstSubmit = false;
    });
    if (!isFormValid()) {
      return;
    }
    Account newAccount =
        Account(username: usernameHandler.controller.text, password: passwordHandler.controller.text, email: emailHandler.controller.text);

    if (await accountService.createAccount(newAccount)) {
      Navigator.push(context, MaterialPageRoute(builder: (context) => HomePage()));
    }
  }

  static bool validatePasswordStructure(String value) {
    RegExp regExp = RegExp(PASSWORD_REGEX_PATTERN);
    return regExp.hasMatch(value);
  }

  static bool validateUsernameStructure(String value) {
    RegExp regExp = RegExp(USERNAME_REGEX_PATTERN);
    return regExp.hasMatch(value);
  }
}
