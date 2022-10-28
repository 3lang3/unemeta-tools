/**
 * Help to format errors from the wallet provider
 * @param error
 * @returns string
 */
export const getErrorMessage = (error: any): string => {
  // Log the initial message to help users to debug
  console.error(error);

  // Attempt to extract a readable message from the error
  const message = error.message ? error.message : error;

  try {
    // Contract error
    const match = message.match(/(^.*)(?:\()/m);
    return match && match.length >= 2 ? match[1] : message;
  } catch (err: any) {
    // API error
    if (message.errors) {
      return message.errors.map(
        (errorItem: { message: string }) => errorItem.message,
      );
    }
    try {
      // First fallback - stringify message
      return JSON.stringify(message);
    } catch {
      // Second fallback if stringifying does not succeed - return message
      return message;
    }
  }
};

/**
 * Error to throw when an addres in undefined
 */
export class AddressUndefinedError extends Error {
  constructor(message?: string) {
    const baseMessage = 'Connected address undefined';
    super(message ? `${baseMessage}: ${message}` : baseMessage);
    this.name = 'AddressUndefined';
  }
}
