export const PLAYER_NAME_REQUIRED = 'Le corps de la requête doit contenir un playerName';
export const GAME_TYPE_REQUIRED = 'Le corps de la requête doit contenir un gameType';
export const GAME_MODE_REQUIRED = 'Le corps de la requête doit contenir un gameMode';
export const MAX_ROUND_TIME_REQUIRED = 'Le corps de la requête doit contenir un maxRoundTime';
export const DICTIONARY_REQUIRED = 'Le corps de la requête doit contenir un dictionary';
export const VIRTUAL_PLAYER_NAME_REQUIRED = 'Le corps de la requête pour une partie solo doit contenir un virtualPlayerName';
export const VIRTUAL_PLAYER_LEVEL_REQUIRED = 'Le corps de la requête pour une partie solo doit contenir un virtualPlayerLevel';
export const NAME_IS_INVALID = "L'identifiant du joueur est invalide";
export const GAME_IS_OVER = 'La partie est maintenant terminée. Impossible de la joindre';
export const PLAYER_LEFT_GAME = (isGameOver: boolean): string =>
    isGameOver ? ' a quitté la partie.' : ' a quitté la partie.<br>Un joueur virtuel débutant a pris sa place.';

export const CONTENT_REQUIRED = 'message content is required';
export const SENDER_REQUIRED = 'message sender is required';

export const NO_LOGIN = 'Could not login with credentials';
export const NO_SIGNUP = 'Could not sign up with credentials';
export const NO_TOKEN = 'Token Not valid';
export const ALREADY_LOGGED = 'User already logged';
