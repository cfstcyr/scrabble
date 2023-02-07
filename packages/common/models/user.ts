export interface User {
  idUser: number;
  hash: string;
  salt: string;
  email: string;
  username: string;
  avatar: string;
}

export interface UserCredentials extends Pick<User, 'email' | 'username'> {
  password: string;
}

export type PublicUser = Omit<User, 'idUser' | 'hash' | 'salt'>;

export interface UserDatabase extends UserCredentials, Pick<User, 'idUser'> {}
