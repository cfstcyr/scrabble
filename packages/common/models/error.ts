export interface StatusError {
    message: string;
    status: number;
}

export interface ErrorResponse {
    message: string;
    error: string;
    stack?: string[];
}