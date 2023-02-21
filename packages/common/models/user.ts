export interface User {
  idUser: number;
  email: string;
  username: string;
  avatar: string;
}

export interface UserSignupInformation extends Pick<User, 'email' | 'username' | 'avatar'> {
  password: string;
}

export interface UserLoginCredentials extends Omit<UserSignupInformation, 'username' | 'avatar'> { }

export type PublicUser = Omit<User, 'idUser'>;

export interface UserSession {
  token: string;
  user: PublicUser;
}

export interface UserFieldValidation {
  isAvailable: boolean;
}

export const UNKOWN_USER: PublicUser = { email: '', username: 'Inconnu', avatar: '' };
