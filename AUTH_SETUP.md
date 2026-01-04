# Configuration de l'authentification

## Configuration initiale requise

Pour que l'authentification fonctionne, le projet utilise un script de configuration automatique.

### Installation automatique :

```bash
# Étape 1 : Installer les dépendances (le script setup s'exécute automatiquement)
npm install

# Étape 2 : Lancer le serveur
npm run dev
```

Le script `postinstall` configure automatiquement :
- ✅ Crée `data.json` depuis `data.json.example`
- ✅ Génère le hash bcrypt pour le mot de passe admin par défaut
- ✅ Génère un `JWT_SECRET` sécurisé dans `.env.local`
- ✅ Valide la structure des fichiers

### Identifiants par défaut

Le script configure automatiquement les identifiants suivants dans `data.json` :

- **Email** : `loicmazagran2007@gmail.com`
- **Mot de passe** : `CRyTDXCGhADE4`

⚠️ **Important** : Ces identifiants sont configurés automatiquement lors de l'installation. Le mot de passe est hashé avec bcrypt.

### Reconfiguration manuelle

Si vous souhaitez reconfigurer le projet :

```bash
npm run setup
```

### Structure du fichier data.json

```json
{
  "admin": {
    "email": "votre-email@example.com",
    "password": "$2b$10$hashedPasswordHere"
  },
  "projects": []
}
```

### Identifiants par défaut

Le fichier `data.json.example` contient les identifiants suivants :

- **Email** : `loicmazagran2007@gmail.com`
- **Mot de passe** : `CRyTDXCGhADE4`

⚠️ **Important** : Le mot de passe dans `data.json` doit être hashé avec bcrypt. Le fichier exemple contient déjà le hash correct.

### Générer un nouveau hash de mot de passe

Si vous souhaitez changer le mot de passe :

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('VOTRE_NOUVEAU_MOT_DE_PASSE', 10, (err, hash) => { if(err) console.error(err); else console.log('Hash:', hash); });"
```

Copiez le hash généré dans le champ `password` de votre `data.json`.

### Variables d'environnement

En plus du fichier `data.json`, assurez-vous de configurer :

```env
JWT_SECRET=votre-secret-jwt-tres-securise
```

Le `JWT_SECRET` est utilisé pour signer les tokens d'authentification. Il doit être :
- Unique et aléatoire
- Au moins 32 caractères
- Gardé secret (ne jamais le committer dans Git)

### Vérification

Pour vérifier que tout est correctement configuré :

1. Démarrez le serveur : `npm run dev`
2. Accédez à `/admin/login`
3. Connectez-vous avec les identifiants configurés
4. Vérifiez les logs du serveur pour des messages détaillés

Les logs afficheront des informations détaillées sur :
- La lecture du fichier data.json
- La validation des identifiants
- La génération du token JWT
- Toute erreur rencontrée

### Dépannage

#### "data.json file not found"
- Vérifiez que `data.json` existe à la racine du projet
- Vérifiez les permissions du fichier

#### "Invalid JSON syntax"
- Vérifiez la syntaxe JSON avec un validateur
- Assurez-vous qu'il n'y a pas de virgules en trop

#### "Identifiant incorrect" ou "Mot de passe incorrect"
- Vérifiez que l'email correspond exactement
- Vérifiez que le mot de passe hashé est correct
- Consultez les logs serveur pour plus de détails

#### "Erreur serveur interne"
- Consultez les logs du serveur (console)
- Les logs contiennent des informations détaillées sur l'erreur
