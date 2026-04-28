import { AppError } from "../errors/app-error";

type SupabaseLikeError = {
  message: string;
  status?: number;
  code?: string;
};

export function throwIfSupabaseError(error: SupabaseLikeError | null) {
  if (!error) {
    return;
  }

  const status = typeof error.status === "number" && error.status >= 400 ? error.status : 400;
  throw new AppError(status, error.message, error.code);
}
