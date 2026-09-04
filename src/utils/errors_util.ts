const ERRORS_NAME = [ 
  'NotFound', 'CreationFailedError', 'ConflictError', 'Forbidden', 
  'PermissionError', 'InputValidationError', 'InvalidEmailConfirmError', 
  'InvalidPasswordError', 'MicroserviceError', 'UnauthorizedError', 'ResourceNotFoundError', "ValidationError"
] as const;

type ErrorName = typeof ERRORS_NAME[number];
type ErrorInstance = Error & { status?: number };
type ErrorConstructor = new (msg?: string, status?: number) => ErrorInstance;

export const ErrorsUtil = ERRORS_NAME.reduce((acc, className) => { 
  const customClass = ({ 
    [className]: class extends Error { 
      public status?: number; 
      constructor(msg?: string, status?: number) { 
        super(msg); 
        this.message = msg || ''; 
        this.status = status; 
        this.name = className; 
      } 
    } 
  })[className] as ErrorConstructor; 

  acc[className] = customClass; 
  return acc;
}, {} as Record<ErrorName, ErrorConstructor>);

export default ErrorsUtil;