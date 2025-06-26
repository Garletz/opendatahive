# Firebase Security Rules Update

Copiez et collez ces règles dans votre console Firebase (Firestore Database → Rules) :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les octos - MISE À JOUR pour gérer les données existantes
    match /octos/{octoId} {
      allow read: if 
        // Permettre la lecture si le document est public
        (resource.data.keys().hasAll(['isPublic']) && resource.data.isPublic == true) ||
        // Permettre la lecture si l'utilisateur est l'auteur
        (request.auth != null && resource.data.keys().hasAll(['authorId']) && request.auth.uid == resource.data.authorId) ||
        // Permettre la lecture des anciens documents sans ces champs (pour la migration)
        (!resource.data.keys().hasAll(['isPublic']) || !resource.data.keys().hasAll(['authorId']));
        
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.authorId &&
                       request.resource.data.keys().hasAll(['isPublic', 'authorId']);
                       
      allow update: if request.auth != null && 
                       ((resource.data.keys().hasAll(['authorId']) && request.auth.uid == resource.data.authorId) ||
                        (!resource.data.keys().hasAll(['authorId'])));
                        
      allow delete: if request.auth != null && 
                       ((resource.data.keys().hasAll(['authorId']) && request.auth.uid == resource.data.authorId) ||
                        (!resource.data.keys().hasAll(['authorId'])));
    }
    
    // Règles pour les requêtes de données
    match /dataRequests/{requestId} {
      allow read: if 
        (resource.data.keys().hasAll(['isPublic']) && resource.data.isPublic == true) || 
        (request.auth != null && resource.data.keys().hasAll(['authorId']) && request.auth.uid == resource.data.authorId) ||
        (!resource.data.keys().hasAll(['isPublic']) || !resource.data.keys().hasAll(['authorId']));
        
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.authorId;
                       
      allow update, delete: if request.auth != null && 
                               ((resource.data.keys().hasAll(['authorId']) && request.auth.uid == resource.data.authorId) ||
                                (!resource.data.keys().hasAll(['authorId'])));
    }
    
    // Règles pour les soumissions de requêtes de données
    match /dataRequestSubmissions/{submissionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.submitterId;
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.submitterId;
    }
    
    // Règles pour les interactions
    match /interactions/{interactionId} {
      allow read: if true;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
    }
    
    // Règles pour les statistiques des octos (lecture publique, écriture authentifiée)
    match /octoStats/{statId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Explication des changements :

1. **Vérification de l'existence des champs** : Utilisation de `resource.data.keys().hasAll(['fieldName'])` pour vérifier si un champ existe avant de l'utiliser.

2. **Compatibilité avec les anciennes données** : Les documents qui n'ont pas les champs `isPublic` ou `authorId` sont temporairement accessibles en lecture.

3. **Migration progressive** : Les nouvelles données créées doivent respecter la structure complète, mais les anciennes données restent accessibles.

## Prochaines étapes :

1. Appliquez ces règles dans Firebase Console
2. Testez que l'application fonctionne
3. Optionnel : Migrez vos données existantes pour ajouter les champs manquants (`isPublic: true`, `authorId`, etc.)