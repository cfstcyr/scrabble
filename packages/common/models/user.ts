export interface User {
    idUser: number;
    email: string;
    username: string;
    password: string;
    avatar: string;
}

export type UserSignupInformation = Omit<User, 'idUser'>;

export type UserLoginCredentials = Omit<UserSignupInformation, 'username' | 'avatar'>;

export type PublicUser = Omit<User, 'idUser' | 'password'>;

export type EditableUserFields = Partial<Pick<User, 'avatar' | 'username'>>;

export interface UserSession {
    token: string;
    user: PublicUser;
}

export interface UserFieldValidation {
    isAvailable: boolean;
}

export const UNKOWN_USER: PublicUser = { email: '', username: 'Inconnu', avatar: '' };
