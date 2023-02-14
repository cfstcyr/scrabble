export interface User {
  idUser: number;
  hash: string;
  salt: string;
  email: string;
  username: string;
  avatar: string;
}

export interface UserSignupInformation extends Pick<User, 'email' | 'username'> {
  password: string;
}

export interface UserLoginCredentials extends Omit<UserSignupInformation, 'username'> {}

export type PublicUser = Omit<User, 'idUser' | 'hash' | 'salt'>;

export interface UserDatabase extends UserSignupInformation, Pick<User, 'idUser'> {
  avatar: string
}
