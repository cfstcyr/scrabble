export interface ErrorResponse {
    message: string;
    error: string;
    stack?: string[];
}

export interface SocketErrorResponse extends ErrorResponse {
    status: number;
}

export interface StatusError {
    message: string;
    status: number;
}