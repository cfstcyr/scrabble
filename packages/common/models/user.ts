export interface User {
  idUser: number;
  email: string;
  username: string;
  password: string;
  avatar: string;
}

export interface UserSignupInformation extends Omit<User, 'idUser'> { }

export interface UserLoginCredentials extends Omit<UserSignupInformation, 'username' | 'avatar'> { }

export type PublicUser = Omit<User, 'idUser' | 'password'>;

export interface UserSession {
  token: string;
  user: PublicUser;
}

export interface UserFieldValidation {
  isAvailable: boolean;
}

export const UNKOWN_USER: PublicUser = { email: '', username: 'Inconnu', avatar: '' };
