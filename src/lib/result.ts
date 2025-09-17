export type Result<T = unknown> = { success: true; data: T } | { success: false; error: string };

export function success<T>(data: T): Result<T> {
    return { success: true, data };
}

export function failure(error: string): Result<never> {
    return { success: false, error };
}
