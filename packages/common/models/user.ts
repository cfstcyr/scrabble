export interface User {
  idUser: number;
  hash: string;
  salt: string;
  email: string;
  username: string;
  avatar: string;
}

export interface UserSignupInformation extends Pick<User, 'email' | 'username' | 'avatar'> {
  password: string;
}

export interface UserLoginCredentials extends Omit<UserSignupInformation, 'username' | 'avatar'> {}

export type PublicUser = Omit<User, 'idUser' | 'hash' | 'salt'>;

export interface UserDatabase extends UserSignupInformation, Pick<User, 'idUser'> {
  avatar: string
}

export interface UserSession {
  token: string;
  user: PublicUser;
}