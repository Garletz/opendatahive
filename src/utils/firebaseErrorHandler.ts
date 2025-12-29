// Types d'erreurs Firebase courantes
export enum FirebaseErrorType {
  RESOURCE_EXHAUSTED = 'resource-exhausted',
  PERMISSION_DENIED = 'permission-denied',
  UNAVAILABLE = 'unavailable',
  QUOTA_EXCEEDED = 'quota-exceeded',
  UNKNOWN = 'unknown'
}

// Interface pour les erreurs Firebase
export interface FirebaseError {
  type: FirebaseErrorType;
  message: string;
  code?: string;
  originalError?: any;
}

// Fonction pour détecter le type d'erreur Firebase
export function detectFirebaseError(error: any): FirebaseError {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';

  // Vérifier les erreurs de quota/ressources
  if (
    errorMessage.includes('resource-exhausted') ||
    errorMessage.includes('quota-exceeded') ||
    errorCode.includes('resource_exhausted') ||
    errorCode.includes('quota_exceeded') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('rate limit')
  ) {
    return {
      type: FirebaseErrorType.RESOURCE_EXHAUSTED,
      message: 'Service temporarily unavailable due to high traffic',
      code: error.code,
      originalError: error
    };
  }

  // Vérifier les erreurs de permission
  if (
    errorMessage.includes('permission-denied') ||
    errorCode.includes('permission_denied') ||
    errorMessage.includes('insufficient permissions')
  ) {
    return {
      type: FirebaseErrorType.PERMISSION_DENIED,
      message: 'Access denied - please check your permissions',
      code: error.code,
      originalError: error
    };
  }

  // Vérifier les erreurs de disponibilité
  if (
    errorMessage.includes('unavailable') ||
    errorCode.includes('unavailable') ||
    errorMessage.includes('service unavailable') ||
    errorMessage.includes('network error')
  ) {
    return {
      type: FirebaseErrorType.UNAVAILABLE,
      message: 'Service temporarily unavailable',
      code: error.code,
      originalError: error
    };
  }

  // Erreur inconnue
  return {
    type: FirebaseErrorType.UNKNOWN,
    message: error.message || 'An unexpected error occurred',
    code: error.code,
    originalError: error
  };
}

// Fonction pour gérer les erreurs Firebase avec retry
export async function handleFirebaseError<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: FirebaseError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = detectFirebaseError(error);
      
      // Si c'est une erreur de quota, ne pas retry
      if (lastError.type === FirebaseErrorType.RESOURCE_EXHAUSTED) {
        throw lastError;
      }

      // Si c'est la dernière tentative, lancer l'erreur
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Attendre avant de retry
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError!;
}

// Fonction pour afficher un message d'erreur utilisateur-friendly
export function getUserFriendlyMessage(error: FirebaseError): string {
  switch (error.type) {
    case FirebaseErrorType.RESOURCE_EXHAUSTED:
      return "We're experiencing high traffic. Please try again in a few minutes.";
    
    case FirebaseErrorType.PERMISSION_DENIED:
      return "You don't have permission to perform this action.";
    
    case FirebaseErrorType.UNAVAILABLE:
      return "Service is temporarily unavailable. Please try again later.";
    
    case FirebaseErrorType.QUOTA_EXCEEDED:
      return "Service quota exceeded. Please try again later.";
    
    default:
      return "Something went wrong. Please try again.";
  }
}

// Hook pour gérer les erreurs Firebase dans les composants
export function useFirebaseErrorHandler() {
  const handleError = (error: any) => {
    const firebaseError = detectFirebaseError(error);
    console.error('Firebase Error:', firebaseError);
    
    // Si c'est une erreur critique, relancer pour que l'ErrorBoundary la capture
    if (firebaseError.type === FirebaseErrorType.RESOURCE_EXHAUSTED) {
      throw firebaseError;
    }
    
    return firebaseError;
  };

  return { handleError, detectFirebaseError, getUserFriendlyMessage };
} 