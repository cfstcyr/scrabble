import 'package:http/http.dart';

import '../environments/environment.dart';

class DatabaseController {
  DatabaseController._privateConstructor();
  static final DatabaseController _instance =
      DatabaseController._privateConstructor();
  final String endpoint = "${Environment().config.apiUrl}/database";
  factory DatabaseController() {
    return _instance;
  }

  Future<void> ping() async {
    Response res = await get(Uri.parse("${endpoint}/database/is-connected"));
  }
}

    // ping(): Observable<void> {
    //     return this.http.get(`${environment.serverUrl}/database/is-connected`).pipe(
    //         map(() => {
    //             /* map to void because we don't want a return type. Its either a response or an error. */
    //         }),
    //     );
    // }