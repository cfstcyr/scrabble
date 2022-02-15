/* eslint-disable @typescript-eslint/naming-convention */
interface HelpAction {
    command: string;
    usage?: string;
    description: string;
}

export const HELP_ACTIONS: HelpAction[] = [
    {
        command: 'placer',
        usage: '<ligne><colonne>[(h|v)] <lettres>',
        description: 'jouer un mot',
    },
    {
        command: 'echanger',
        usage: '<lettres>',
        description: 'changer des lettres de son chevalet pour des lettres de la réserve',
    },
    {
        command: 'passer',
        description: 'passer son tour',
    },
    {
        command: 'reserve',
        description: 'affiche les lettres dans la réserve',
    },
];

export const START_TILES_AMOUNT = 7;
export const TILE_RESERVE_THRESHOLD = 7;
export const LETTER_DISTRIBUTION_RELATIVE_PATH = '../../../assets/letter-distribution.json';
export const END_GAME_HEADER_MESSAGE = 'Fin de partie - lettres restantes';
