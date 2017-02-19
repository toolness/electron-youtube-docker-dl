export function stringifyError(error: any): string {
  let message: string = 'Unknown error';

  if (typeof(error) === 'string') {
    message = error;
  } else if (error && typeof(error.message) === 'string') {
    message = error.message;
  }

  return message;
}
