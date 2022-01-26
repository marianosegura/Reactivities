export interface ServerError {  // for server errors, yeah
    statusCode: number;
    message: string;
    details: string;
}