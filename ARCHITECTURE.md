# Architecture du Projet OpenDataHive (édition allégée 2025)

## Vue d'ensemble
OpenDataHive est une plateforme communautaire de partage de jeux de données (« octos ») visualisés sur une carte hexagonale interactive. L'application est écrite en **React 18 + TypeScript** et utilise **Firebase** pour l'authentification / la persistance et **GunDB** comme option de synchronisation pair-à-pair.  
L'architecture vise la simplicité : composants isolés, contexte global centralisé, types stricts.

---

## Structure des dossiers (post-nettoyage)
```text
src/
├── components/          # Composants React par domaine
│   ├── archivist/
│   ├── auth/
│   ├── dataRequests/
│   ├── grid/
│   ├── icons/
│   ├── layout/
│   ├── modals/
│   └── settings/
├── context/             # Providers & hooks de contexte (Auth, Firebase, Gun, Hive…)
├── hexmap/              # Moteur de rendu hexagonal (core, shared, components)
├── pages/               # Pages (router entry points)
├── types/               # Interfaces & enums partagées
├── utils/               # Fonctions utilitaires (date, id, firebase error…)
├── styles/              # Fichiers CSS globaux / Tailwind
├── App.tsx              # Point d'entrée App + routing wrapper
└── main.tsx             # Bootstrap Vite/React
```

*Les dossiers `config`, `services`, `hooks`, `shared`, `components/ui` et les MD annexes ont été supprimés car redondants ou inactifs.*

---

## Couches de l'application
| Couche | Rôle principal | Dossiers clés |
| ------ | -------------- | ------------- |
| Présentation | UI déclarative, interaction utilisateur | `components/`, `pages/`, `styles/` |
| Logique | Gestion d'état global, règles métier légères | `context/`, `utils/` |
| Données | Persistance, requêtes, typage strict | Firebase, GunDB, `types/` |

---

## Principes d'architecture
1. **Séparation des responsabilités** : chaque composant fait une seule chose, la logique transversale vit dans `context` ou `utils`.
2. **Type safety** : les types stricts garantissent la cohérence entre UI et back-end.
3. **Lisibilité > Abstraction** : les helpers et les hooks locaux suffisent, pas besoin de services génériques.
4. **Flexibilité** : possibilité d'activer/désactiver GunDB sans changer le reste du code.

---

## Flux de données simplifié
```text
[Composant] ⇄ (Context API) ⇄ Firebase / GunDB ⇄ Carte Hexagonale (hexmap)
```
Exemple :
1. L'utilisateur ajoute un « Octo » via un formulaire (`components/grid/AddOctoForm.tsx`).
2. Le composant appelle `useFirebase().addOcto()` → écrit dans Firestore.
3. `HiveContext` écoute les changements et met à jour la liste d'octos.
4. `Map.tsx` se re-rend avec les nouveaux hexagones.

---

## Tests & assurance qualité
- **TypeScript** : `npx tsc --noEmit` pour le typage.
- **ESLint / Prettier** : cohérence de style.
- **Vitest / React Testing Library (à venir)** : tests unitaires / intégration.

---

## Déploiement
```
npm run dev      # dev server
npm run build    # build production
npm run preview  # prévisualisation locale
```
Le projet peut être déployé sur Netlify, Vercel ou toute plateforme statique avec configuration Firebase.

---

## Notes finales
Cette documentation reflète l’état courant du code après un grand nettoyage (juillet 2025). Pour toute évolution majeure, mettre à jour ce fichier plutôt que d’ajouter de nouveaux fichiers Markdown dispersés.

## Vue d'ensemble

OpenDataHive est une plateforme de partage de données décentralisée construite avec React, TypeScript, Firebase et GunDB. L'architecture a été conçue pour être modulaire, évolutive et maintenable.

## Structure des dossiers

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI réutilisables
│   ├── auth/           # Composants d'authentification
│   ├── layout/         # Composants de mise en page
│   ├── modals/         # Modales
│   └── ...
├── context/            # Contextes React
├── hooks/              # Hooks personnalisés
├── pages/              # Pages de l'application
├── services/           # Services métier
├── types/              # Types TypeScript
├── utils/              # Utilitaires
├── shared/             # Ressources partagées
│   └── constants/      # Constantes
├── config/             # Configuration
└── hexmap/             # Module de cartographie hexagonale
```

## Architecture des couches

### 1. Couche Présentation (UI)
- **Composants UI** (`src/components/ui/`) : Composants réutilisables (Button, Input, Modal, etc.)
- **Pages** (`src/pages/`) : Pages principales de l'application
- **Layout** (`src/components/layout/`) : Composants de mise en page

### 2. Couche Logique Métier (Services)
- **Services** (`src/services/`) : Logique métier centralisée
  - `errorService.ts` : Gestion des erreurs
  - `validationService.ts` : Validation des données
- **Contextes** (`src/context/`) : État global de l'application
- **Hooks** (`src/hooks/`) : Logique réutilisable

### 3. Couche Données
- **Firebase** : Base de données principale
- **GunDB** : Base de données décentralisée
- **Types** (`src/types/`) : Définitions TypeScript

### 4. Couche Configuration
- **Config** (`src/config/`) : Configuration centralisée
- **Constants** (`src/shared/constants/`) : Constantes de l'application

## Principes d'architecture

### 1. Séparation des responsabilités
- Chaque composant a une responsabilité unique
- Les services gèrent la logique métier
- Les contextes gèrent l'état global

### 2. Réutilisabilité
- Composants UI génériques
- Hooks personnalisés
- Services centralisés

### 3. Type Safety
- Types TypeScript stricts
- Interfaces bien définies
- Validation des données

### 4. Gestion d'erreurs
- Service d'erreur centralisé
- Messages d'erreur utilisateur
- Logging en développement

## Services principaux

### ErrorService
```typescript
// Gestion centralisée des erreurs
errorService.createError('network', 'Connection failed');
errorService.subscribe((error) => console.log(error));
```

### ValidationService
```typescript
// Validation des données
const result = validationService.validateOcto(octoData);
if (!result.isValid) {
  console.log(result.errors);
}
```

## Hooks personnalisés

### useLocalStorage
```typescript
const [value, setValue] = useLocalStorage('key', defaultValue);
```

### useDebounce
```typescript
const debouncedValue = useDebounce(searchTerm, 300);
```

### useAsync
```typescript
const { data, loading, error, execute } = useAsync();
```

## Composants UI

### Button
```typescript
<Button variant="primary" size="md" loading={isLoading}>
  Submit
</Button>
```

### Modal
```typescript
<Modal isOpen={isOpen} onClose={onClose} title="Title">
  Content
</Modal>
```

### Alert
```typescript
<Alert type="success" message="Operation completed" />
```

## Configuration

### Variables d'environnement
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Configuration centralisée
```typescript
import { CONFIG } from './config';

// Utilisation
const apiKey = CONFIG.firebase.apiKey;
```

## Gestion des erreurs

### Types d'erreurs
- `network` : Erreurs de réseau
- `auth` : Erreurs d'authentification
- `validation` : Erreurs de validation
- `server` : Erreurs serveur
- `unknown` : Erreurs inconnues

### Messages d'erreur
- Messages utilisateur conviviaux
- Logging détaillé en développement
- Statistiques d'erreurs

## Validation

### Règles de validation
- Validation côté client
- Règles personnalisables
- Messages d'erreur clairs

### Schémas de validation
- Validation d'Octo
- Validation de DataRequest
- Validation d'utilisateur

## Performance

### Optimisations
- Lazy loading des composants
- Debouncing des recherches
- Mémoisation des calculs coûteux

### Monitoring
- Métriques de performance
- Logging des erreurs
- Statistiques d'utilisation

## Sécurité

### Validation des entrées
- Sanitisation des données
- Validation côté client et serveur
- Protection contre les injections

### Authentification
- Gestion sécurisée des tokens
- Vérification des permissions
- Logout automatique

## Tests

### Structure des tests
```
tests/
├── unit/           # Tests unitaires
├── integration/    # Tests d'intégration
└── e2e/           # Tests end-to-end
```

### Outils de test
- Jest pour les tests unitaires
- React Testing Library
- Cypress pour les tests E2E

## Déploiement

### Environnements
- Development : `npm run dev`
- Production : `npm run build`
- Preview : `npm run preview`

### Configuration
- Variables d'environnement
- Configuration Firebase
- Configuration GunDB

## Maintenance

### Code Quality
- ESLint pour le linting
- Prettier pour le formatage
- TypeScript pour le type checking

### Documentation
- JSDoc pour les fonctions
- README pour chaque module
- Architecture documentée

## Évolutivité

### Ajout de fonctionnalités
1. Créer les types nécessaires
2. Implémenter la logique métier
3. Créer les composants UI
4. Ajouter les tests
5. Documenter les changements

### Refactoring
- Extraction de composants
- Centralisation de la logique
- Amélioration des performances
- Mise à jour des dépendances 