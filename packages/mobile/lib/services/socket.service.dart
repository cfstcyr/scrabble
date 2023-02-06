import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  SocketService._privateConstructor();
  static final SocketService _instance = SocketService._privateConstructor();

  factory SocketService() {
    return _instance;
  }
  IO.Socket socket = IO.io('http://localhost:3000', <String, dynamic>{
    'transports': ['websocket'],
    'autoConnect': false,
  });

  Future<void> initSocket() async {
    print('Connecting to chat service');

    socket.connect();
    socket.onConnect((_) {
      print('connected to websocket');
    });
  }

  Future<void> sendMessage(String message) async {
    socket.emit('channel:newMessage', message);
  }
}





// import 'dart:convert';

// import 'package:flutter/material.dart';
// import 'package:flutter/rendering.dart';
// import 'package:flutter/widgets.dart';
// import 'package:web_socket_channel/io.dart';

// class ChatPage extends StatefulWidget{
//   @override
//   State<StatefulWidget> createState() {
//      return ChatPageState();
//   }
// }

// class SocketService extends State<ChatPage>{

//   IOWebSocketChannel channel; //channel varaible for websocket
//   bool connected; // boolean value to track connection status

//   String myid = "222"; //my id
//   String recieverid = "111"; //reciever id
//   // swap myid and recieverid value on another mobile to test send and recieve
//   String auth = "chatapphdfgjd34534hjdfk"; //auth key

//   List<MessageData> msglist = [];

//   TextEditingController msgtext = TextEditingController();

//   @override
//   void initState() {
//     connected = false;
//     msgtext.text = "";
//     channelconnect();
//     super.initState();
//   }

//   channelconnect(){ //function to connect
//     try{
//          channel = IOWebSocketChannel.connect("ws://192.168.0.109:6060/$myid"); //channel IP : Port
//          channel.stream.listen((message) {
//             print(message);
//             setState(() {
//                  if(message == "connected"){
//                       connected = true;
//                       setState(() { });
//                       print("Connection establised.");
//                  }else if(message == "send:success"){
//                       print("Message send success");
//                       setState(() {
//                         msgtext.text = "";
//                       });
//                  }else if(message == "send:error"){
//                      print("Message send error");
//                  }else if (message.substring(0, 6) == "{'cmd'") {
//                      print("Message data");
//                      message = message.replaceAll(RegExp("'"), '"');
//                      var jsondata = json.decode(message);

//                        msglist.add(MessageData( //on message recieve, add data to model
//                               msgtext: jsondata["msgtext"],
//                               userid: jsondata["userid"],
//                               isme: false,
//                           )
//                        );
//                     setState(() { //update UI after adding data to message model

//                     });
//                  }
//             });
//           },
//         onDone: () {
//           //if WebSocket is disconnected
//           print("Web socket is closed");
//           setState(() {
//                 connected = false;
//           });
//         },
//         onError: (error) {
//              print(error.toString());
//         },);
//     }catch (_){
//       print("error on connecting to websocket.");
//     }
//   }

//   Future<void> sendmsg(String sendmsg, String id) async {
//          if(connected == true){
//             String msg = "{'auth':'$auth','cmd':'send','userid':'$id', 'msgtext':'$sendmsg'}";
//             setState(() {
//                msgtext.text = "";
//                msglist.add(MessageData(msgtext: sendmsg, userid: myid, isme: true));
//             });
//             channel.sink.add(msg); //send message to reciever channel
//          }else{
//             channelconnect();
//             print("Websocket is not connected.");
//          }
//   }

