export interface PublicUser {
  username: string;
  avatar: string;
}

export interface User extends PublicUser {
  email: string;
  hash: string;
  salt: string;
}

export interface UserCredentials extends PublicUser {
  email: string,
  password: string
}