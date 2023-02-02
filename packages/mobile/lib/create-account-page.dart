// ignore_for_file: prefer_const_constructors

import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'home-page.dart';

class CreateAccountPage extends StatefulWidget {
  @override
  _CreateAccountState createState() => _CreateAccountState();
}

class _CreateAccountState extends State<CreateAccountPage> {
  bool isPasswordHidden = true;
  Color themeColor = Color.fromRGBO(27, 94, 32, 1);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Création d'un compte"),
      ),
      body: SingleChildScrollView(
        // height: double.infinity,
        // width: double.infinity,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Center(
              child: Column(
                children: [
                  Container(
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
                            obscureText: false,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Courriel',
                            ),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                          child: TextField(
                            obscureText: false,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Pseudonyme',
                            ),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                          child: TextField(
                            keyboardType: TextInputType.visiblePassword,
                            autocorrect: false,
                            enableSuggestions: false,
                            obscureText: isPasswordHidden,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Mot de passe',
                              helperText: 'Utilisez au moins huit caractères comprenant un mélange de lettres, de chiffres et de symboles',
                              helperMaxLines: 3,
                            ),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.only(left: 15.0, right: 15.0, top: 15, bottom: 0),
                          child: TextField(
                            autocorrect: false,
                            keyboardType: TextInputType.visiblePassword,
                            enableSuggestions: false,
                            obscureText: isPasswordHidden,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: 'Confirmer',
                            ),
                          ),
                        ),
                        CheckboxListTile(
                          title: Text("Afficher le mot de passe"),
                          value: isPasswordHidden,
                          onChanged: (bool? value) {
                            setState(() {
                              isPasswordHidden = value!;
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
                                child: const Text(
                                  'Créer son compte',
                                  style: TextStyle(color: Colors.white, fontSize: 15),
                                ),
                                onPressed: () {
                                  //TODO Send to server
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: themeColor,
                                  shadowColor: Colors.black,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(3.0),
                                  ),
                                ),
                              ),
                            ),
                            // style: ElevatedButton.styleFrom(elevation: 12.0, textStyle: const TextStyle(color: Colors.white)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
