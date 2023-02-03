// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/account.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/pages/login-page.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:email_validator/email_validator.dart';

import '../controllers/account-authentification-controller.dart';
import '../pages/home-page.dart';
import '../services/account-authentification-service.dart';

class CreateAccountForm extends StatefulWidget {
  @override
  _CreateAccountFormState createState() => _CreateAccountFormState();
}

class _CreateAccountFormState extends State<CreateAccountForm> {
  bool isPasswordShown = false;
  Color themeColor = getIt.get<ThemeColorService>().themeColor;
  AccountAuthenticationService accountService = getIt.get<AccountAuthenticationService>();
  String _emailErrorMessage = '';
  String _usernameErrorMessage = '';
  String _passwordErrorMessage = '';
  String _passwordMatchErrorMessage = '';

  late FocusNode emailFocusNode;
  late FocusNode usernameFocusNode;
  late FocusNode passwordFocusNode;
  late FocusNode passwordMatchFocusNode;
  final emailController = TextEditingController();
  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  final passwordMatchController = TextEditingController();

  @override
  void initState() {
    super.initState();

    emailFocusNode = FocusNode();
    emailFocusNode.addListener(() {
      if (emailFocusNode.hasFocus) {
        _emailErrorMessage = "";
      } else {
        validateEmail();
      }
    });

    usernameFocusNode = FocusNode();
    usernameFocusNode.addListener(() {
      if (usernameFocusNode.hasFocus) {
        _usernameErrorMessage = "";
      } else {
        validateUsername();
      }
    });

    passwordFocusNode = FocusNode();
    passwordFocusNode.addListener(() {
      if (passwordFocusNode.hasFocus) {
        setState(() {
          _passwordErrorMessage = "";
        });
      } else {
        validatePassword();
      }
    });

    passwordMatchFocusNode = FocusNode();
    passwordMatchFocusNode.addListener(() {
      if (passwordMatchFocusNode.hasFocus) {
        // setState(() {
        //   _passwordErrorMessage = "";
        // });
      } else {
        validatePasswordMatch();
      }
    });
  }

  @override
  void dispose() {
    // Clean up the focus node when the Form is disposed.
    emailFocusNode.dispose();
    usernameFocusNode.dispose();
    passwordFocusNode.dispose();
    passwordMatchFocusNode.dispose();
    emailController.dispose();
    usernameController.dispose();
    passwordController.dispose();
    passwordMatchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 500,
      width: 500,
      decoration: BoxDecoration(
          border: Border.all(
            color: themeColor,
          ),
          borderRadius: BorderRadius.circular(5)),
      child: Column(
        children: [
          Padding(
            padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
            child: TextField(
              controller: emailController,
              focusNode: emailFocusNode,
              obscureText: false,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Courriel',
                errorText: _emailErrorMessage.isEmpty ? null : _emailErrorMessage,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
            child: TextField(
              controller: usernameController,
              focusNode: usernameFocusNode,
              obscureText: false,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Pseudonyme',
                errorText: _usernameErrorMessage.isEmpty ? null : _usernameErrorMessage,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
            child: TextField(
              controller: passwordController,
              focusNode: passwordFocusNode,
              keyboardType: TextInputType.visiblePassword,
              autocorrect: false,
              enableSuggestions: false,
              obscureText: !isPasswordShown,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Mot de passe',
                helperText: 'Au moins huit caractères comprenant au moins 1 lettre minuscule, 1 lettre majuscule, 1 chiffre et 1 symbole',
                helperMaxLines: 3,
                errorText: _passwordErrorMessage.isEmpty ? null : _passwordErrorMessage,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
            child: TextField(
              controller: passwordMatchController,
              focusNode: passwordMatchFocusNode,
              autocorrect: false,
              keyboardType: TextInputType.visiblePassword,
              enableSuggestions: false,
              obscureText: !isPasswordShown,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Confirmer',
                errorText: _passwordMatchErrorMessage.isEmpty ? null : _passwordMatchErrorMessage,
              ),
            ),
          ),
          CheckboxListTile(
            title: Text("Afficher le mot de passe"),
            value: isPasswordShown,
            onChanged: (bool? value) {
              setState(() {
                isPasswordShown = value!;
              });
            },
            controlAffinity: ListTileControlAffinity.leading,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 15.0),
                child: TextButton(
                  onPressed: () {
                    //TODO Redirect to connection page
                    Navigator.push(context, MaterialPageRoute(builder: (context) => LoginPage()));
                  },
                  child: const Text(
                    'Vous connecter à un compte existant',
                    style: TextStyle(color: Colors.black, fontSize: 15),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 15.0),
                child: ElevatedButton(
                  onPressed: checkIfFormValid() ? () => {createAccount()} : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeColor,
                    shadowColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(3.0),
                    ),
                  ),
                  child: const Text(
                    'Créer son compte',
                    style: TextStyle(color: Colors.white, fontSize: 15),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void validatePassword() {
    if (!validatePasswordStructure(passwordController.text)) {
      setState(() {
        _passwordErrorMessage = "Le mot de passe doit respecter le format attendu";
      });
    } else {
      setState(() {
        _passwordErrorMessage = "";
      });
    }
    return;
  }

  void validatePasswordMatch() {
    if (passwordController.text != passwordMatchController.text) {
      setState(() {
        _passwordMatchErrorMessage = "Les mots de passe ne correspondent pas. Réessayez.";
      });
    } else {
      setState(() {
        _passwordMatchErrorMessage = "";
      });
    }
    return;
  }

  Future<void> validateEmail() async {
    if (emailController.text.isEmpty) {
      setState(() {
        _emailErrorMessage = "L'adresse courriel ne peut pas être vide";
      });
    } else if (!EmailValidator.validate(emailController.text, true)) {
      setState(() {
        _emailErrorMessage = "Adresse courriel invalide";
      });
    } else if (!await accountService.isEmailUnique(emailController.text)) {
      setState(() {
        _emailErrorMessage = "Cette adresse courriel est déjà utilisée";
      });
    } else {
      setState(() {
        _emailErrorMessage = "";
      });
    }
  }

  Future<void> validateUsername() async {
    if (usernameController.text.isEmpty) {
      setState(() {
        _usernameErrorMessage = "Le nom d'utilisateur ne peut pas être vide";
      });
    } else if (!validateUsernameStructure(usernameController.text)) {
      setState(() {
        _usernameErrorMessage = "Le nom d'utilisateur doit respecté le format attendu";
      });
    } else if (!await accountService.isUsernameUnique(usernameController.text)) {
      setState(() {
        _usernameErrorMessage = "Ce nom d'utilisateur est déjà utilisé";
      });
    } else {
      setState(() {
        _usernameErrorMessage = "";
      });
    }
  }

  bool checkIfFormValid() {
    bool isEmailValid = emailController.text.isNotEmpty && _emailErrorMessage.isEmpty;
    bool isUsernameValid = usernameController.text.isNotEmpty && _usernameErrorMessage.isEmpty;
    bool isPasswordValid = passwordController.text.isNotEmpty && _passwordErrorMessage.isEmpty;
    bool isPasswordMatchValid = passwordMatchController.text.isNotEmpty && _passwordMatchErrorMessage.isEmpty;

    return isEmailValid && isUsernameValid && isPasswordValid && isPasswordMatchValid;
  }

  Future<void> createAccount() async {
    Account newAccount = Account(username: usernameController.text, password: passwordController.text, email: emailController.text);
    if (await accountService.createAccount(newAccount)) {
      Navigator.push(context, MaterialPageRoute(builder: (context) => HomePage()));
    }
  }

  bool validatePasswordStructure(String value) {
    String pattern = r'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#\$&*~]).{8,}$';
    RegExp regExp = new RegExp(pattern);
    return regExp.hasMatch(value);
  }

  bool validateUsernameStructure(String value) {
    String pattern = r'^.{5,15}$';
    RegExp regExp = new RegExp(pattern);
    return regExp.hasMatch(value);
  }
}
