export interface ErrorResponse {
    message: string;
    error: string;
    stack?: string[];
}

export interface SocketErrorResponse extends ErrorResponse {
    status: number;
}