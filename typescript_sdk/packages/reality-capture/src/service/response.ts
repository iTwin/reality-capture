import { DetailedErrorResponse } from './error';

export class Response<T> extends Array<any> {
    status_code: number;
    error?: DetailedErrorResponse | null;
    value?: T | null;

    /**
     * A tuple containing a Service response.
     * @param status_code HTTP Status Code returned by the service.
     * @param error Optional error if the request failed.
     * @param value Optional object if the request succeeded.
     */
    constructor(status_code: number, error?: DetailedErrorResponse | null, value?: T | null) {
        super();
        this.status_code = status_code;
        this.error = error ?? null;
        this.value = value ?? null;
        this.push(status_code, error ?? null, value ?? null);
    }

    /**
     * Return the HTTP response status_code
     * @returns int. The HTTP response status_code
     */
    getResponseStatusCode(): number {
        return this.status_code;
    }

    /**
     * Checks whether the response is an error response.
     * @returns True if the response contains a valid error.
     */
    isError(): boolean {
        return this.error !== null && this.error !== undefined;
    }
}