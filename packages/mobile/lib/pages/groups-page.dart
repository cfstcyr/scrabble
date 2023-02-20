import 'package:flutter/material.dart';
import 'package:mobile/components/chatbox.dart';

import '../components/group-selection.dart';
import '../components/invalid-connection-popup.dart';
import 'create-lobby.dart';

// NavBar
  // Back to home
  // Title
  // Créer une partie

// Liste des parties
  // Partie
    // Nom joueurs + avatars
    // Durée round
    // Niveau JV
    // Bouton pour join

class GroupPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Sélection de groupe")),
      body: Center(
        child: GroupSelection()
      )
    );
  }
}
