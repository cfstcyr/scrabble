import 'package:mobile/classes/channel.dart';

Channel DEFAULT_CHANNEL =
    Channel(idChannel: 1, name: 'general', canQuit: false, isPrivate: false);

const String ALL_CHANNELS = 'Tous les canaux';
const String MY_CHANNELS = 'Mes canaux';
const String CREATE_CHANNEL = 'Créer un canal';
const String CHANNELS_TITLE = 'Canaux de discussions';

const JOIN_EVENT = 'channel:join';
const QUIT_EVENT = 'channel:quit';
const CREATE_EVENT = 'channel:newChannel';
const INIT_EVENT = 'channel:init';
const INIT_DONE_EVENT = 'channel:initDone';
const MESSAGE_EVENT = 'channel:newMessage';
const ALL_CHANNELS_EVENT = 'channel:joinableChannels';
const HISTORY_EVENT = 'channel:history';
