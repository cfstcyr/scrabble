import { Message } from '@app/classes/communication/message';
import { SYSTEM_ID } from './game-constants';
import { InitializeState } from '@app/classes/connection-state-service/connection-state';
import { environment } from 'src/environments/environment';

export const MISSING_PLAYER_DATA_TO_INITIALIZE = 'Certaines informations sont manquantes pour créer le joueur';
export const NO_LOCAL_PLAYER = "Aucun joueur local n'a encore été défini";
export const INVALID_PAYLOAD_FOR_ACTION_TYPE = 'Payload invalide pour ce type de commande';
export const NO_CURRENT_ROUND = "Aucune round n'est active présentement";
export const NO_START_GAME_TIME = "La partie n'et pas encore commencée, alors il n'y a pas encore de temps de départ";
export const SOCKET_ID_UNDEFINED = "L'identifiant du socket n'est pas défini";
export const INVALID_ROUND_DATA_PLAYER = 'Impossible de convertir le round data avec ce joueur';
export const EXPIRED_COOKIE_AGE = '-99999999';
export const NO_SUBJECT_FOR_EVENT = "Il n'y a aucun Subject associé à l'événement demandé";
export const IS_NOT_BEHAVIOR_OBJECT = "Le Subject n'est pas un BehaviourSubject et n'a donc pas de valeur";
export const PLAYER_NUMBER_INVALID = (playerNumber: number) => `Il n'y a pas de joueur #${playerNumber} dans la partie`;
export const ACTIVE_PLAYER_NOT_FOUND = 'Aucun joueur actif trouvé';

export const WAIT_FOR_COMMAND_CONFIRMATION_MESSAGE = (gameId: string): Message => {
    return {
        content: "Veuillez attendre la confirmation de votre commande précédente avant d'en envoyer une autre.",
        senderId: SYSTEM_ID,
        gameId,
    };
};

export const DB_CONNECTED_ENDPOINT = `${environment.serverUrl}/database/is-connected`;
export const DEFAULT_STATE_VALUE: InitializeState = InitializeState.Loading;
