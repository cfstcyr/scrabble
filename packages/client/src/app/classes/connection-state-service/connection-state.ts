export enum ConnectionState {
    Loading = 'Loading',
    Connected = 'Connected',
    Error = 'Error',
}

export enum InitializeState {
    Loading = "Chargement de l'application",
    Ready = "L'application est prête",
    ServerNotReachable = "Impossible d'établir une connexion avec le serveur",
    DatabaseNotReachable = "Impossible d'établir une connexion avec la base de donnée",
}
