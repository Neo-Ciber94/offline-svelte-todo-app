export type Result<T, TError> = { success: true; data: T } | { success: false; error: TError };
