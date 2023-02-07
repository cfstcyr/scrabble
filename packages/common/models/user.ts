export interface PublicUser {
  username: string;
  avatar: string;
}

export interface User {
  idUser: number;
  email: string;
  password: string;
  username: string;
}

export interface Credentials {
  email: string,
  password: string
}

export interface UserSession {
  token: string;
  user: PublicUser;
}