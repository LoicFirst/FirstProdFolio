import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global declaration for mongoose connection cache.
 * We use `var` here because Next.js hot-reloads in development mode cause
 * the module to be re-evaluated, which would create new connections.
 * By storing the connection in `global`, we persist it across hot-reloads.
 */
declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Validates the MongoDB URI format with comprehensive checks
 * @param uri The MongoDB connection URI to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateMongoDBUri(uri: string): { isValid: boolean; error?: string } {
  // Check if URI is empty or just whitespace
  if (!uri || uri.trim().length === 0) {
    return {
      isValid: false,
      error: 'La variable MONGODB_URI est vide ou ne contient que des espaces. Veuillez configurer une URI MongoDB valide dans vos variables d\'environnement.'
    };
  }

  const MONGODB_PROTOCOL_REGEX = /^mongodb(\+srv)?:\/\//;

  // Check for basic MongoDB URI format (mongodb:// or mongodb+srv://)
  if (!MONGODB_PROTOCOL_REGEX.test(uri)) {
    return {
      isValid: false,
      error: 'MONGODB_URI doit commencer par "mongodb://" ou "mongodb+srv://". Format actuel invalide. Format attendu: mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName'
    };
  }

  // Check for presence of credentials pattern (user:password@)
  const parts = uri.split('@');
  const hasCredentials = parts.length > 1;
  
  if (hasCredentials) {
    // Extract the part before the last @ to check credentials format
    const lastAtIndex = uri.lastIndexOf('@');
    const credentialsPart = uri.substring(0, lastAtIndex);
    const protocolRemoved = credentialsPart.replace(MONGODB_PROTOCOL_REGEX, '');
    
    // Check if credentials are empty
    if (!protocolRemoved || protocolRemoved.trim().length === 0) {
      return {
        isValid: false,
        error: 'Les identifiants MongoDB sont manquants. Format attendu: mongodb+srv://username:password@host. Vérifiez que vous avez bien inclus le nom d\'utilisateur et le mot de passe.'
      };
    }
    
    // Check if credentials contain a colon (separating user and password)
    if (!protocolRemoved.includes(':')) {
      return {
        isValid: false,
        error: 'Format des identifiants MongoDB invalide. Un ":" doit séparer le nom d\'utilisateur et le mot de passe. Format attendu: mongodb+srv://username:password@host'
      };
    }

    // Split credentials to check username and password
    const [username, ...passwordParts] = protocolRemoved.split(':');
    const password = passwordParts.join(':'); // Handle passwords with colons
    
    if (!username || username.trim().length === 0) {
      return {
        isValid: false,
        error: 'Le nom d\'utilisateur MongoDB est manquant dans MONGODB_URI. Format attendu: mongodb+srv://username:password@host'
      };
    }
    
    if (!password || password.trim().length === 0) {
      return {
        isValid: false,
        error: 'Le mot de passe MongoDB est manquant dans MONGODB_URI. Format attendu: mongodb+srv://username:password@host'
      };
    }

    // Check for placeholder password patterns
    if (protocolRemoved.includes('<') || protocolRemoved.includes('>')) {
      return {
        isValid: false,
        error: 'MONGODB_URI contient un mot de passe de substitution (ex: <password>). Remplacez-le par votre mot de passe réel MongoDB Atlas. Ne gardez pas les symboles < et >.'
      };
    }
    
    // Check for common placeholder patterns (only exact matches to avoid false positives)
    const lowerPassword = password.toLowerCase();
    const exactPlaceholderPatterns = [
      'password', 'your_password', 'yourpassword', 'your-password',
      'changeme', 'change_me', 'temp', 'test', '123456', '12345678',
      'admin', 'root', 'demo'
    ];
    
    // Only reject if password matches common placeholders EXACTLY (case insensitive)
    // This avoids false positives with legitimate passwords that happen to contain these words
    if (exactPlaceholderPatterns.includes(lowerPassword)) {
      return {
        isValid: false,
        error: 'Le mot de passe MongoDB semble être un placeholder. Remplacez-le par votre mot de passe réel MongoDB Atlas.'
      };
    }
    
    // Check for host presence after credentials
    const hostPart = uri.substring(lastAtIndex + 1);
    if (!hostPart || hostPart.trim().length === 0) {
      return {
        isValid: false,
        error: 'L\'adresse du cluster MongoDB est manquante après les identifiants. Format attendu: mongodb+srv://username:password@cluster.mongodb.net'
      };
    }
    
    // Check if host looks like a valid MongoDB Atlas address
    const hostOnly = hostPart.split('/')[0].split('?')[0];
    if (!hostOnly.includes('.')) {
      return {
        isValid: false,
        error: 'L\'adresse du cluster MongoDB semble invalide. Elle doit contenir un nom de domaine (ex: cluster0.xxxxx.mongodb.net)'
      };
    }
  } else {
    // No credentials, check if there's a host after the protocol
    const withoutProtocol = uri.replace(MONGODB_PROTOCOL_REGEX, '');
    if (!withoutProtocol || withoutProtocol.trim().length === 0) {
      return {
        isValid: false,
        error: 'MONGODB_URI est incomplet - l\'adresse du serveur est manquante après le protocole.'
      };
    }
  }

  return { isValid: true };
}

/**
 * Establishes connection to MongoDB with comprehensive validation and error handling
 * Uses connection pooling and caching for optimal performance in Next.js
 * @returns Promise resolving to mongoose instance
 * @throws Error with detailed, actionable message if connection fails
 */
async function dbConnect(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  // Step 1: Check if environment variable is defined
  if (!MONGODB_URI) {
    const errorMsg = 'La variable d\'environnement MONGODB_URI est manquante ou mal définie. Veuillez la configurer dans votre fichier .env.local (développement) ou dans les paramètres de déploiement Vercel (production).';
    console.error('[DB] ERREUR CRITIQUE:', errorMsg);
    console.error('[DB] Guide: Créez un fichier .env.local à la racine du projet et ajoutez: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName');
    throw new Error(errorMsg);
  }

  // Step 2: Validate MongoDB URI format with detailed diagnostics
  console.log('[DB] Validation du format de l\'URI MongoDB...');
  const validation = validateMongoDBUri(MONGODB_URI);
  if (!validation.isValid) {
    const errorMsg = `Validation MONGODB_URI échouée: ${validation.error}`;
    console.error('[DB] ERREUR CRITIQUE:', errorMsg);
    console.error('[DB] Vérifiez votre MONGODB_URI dans les variables d\'environnement.');
    console.error('[DB] Format attendu: mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName');
    console.error('[DB] Exemple: mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/?appName=Cluster0');
    console.error('[DB] ');
    console.error('[DB] Aide au débogage:');
    console.error('[DB] 1. Assurez-vous que l\'URI commence par mongodb:// ou mongodb+srv://');
    console.error('[DB] 2. Vérifiez que le nom d\'utilisateur et le mot de passe sont corrects');
    console.error('[DB] 3. Remplacez <password> par votre mot de passe réel (sans les crochets < >)');
    console.error('[DB] 4. Vérifiez que l\'adresse du cluster est correcte (se termine par .mongodb.net)');
    throw new Error(errorMsg);
  }
  console.log('[DB] ✓ Format de l\'URI MongoDB validé avec succès');

  // Step 3: Return cached connection if available
  if (cached.conn) {
    console.log('[DB] Utilisation de la connexion en cache');
    return cached.conn;
  }

  // Step 4: Create new connection with retry logic
  if (!cached.promise) {
    console.log('[DB] Création d\'une nouvelle connexion à la base de données...');
    console.log('[DB] Configuration de connexion: timeout serveur=10s, timeout socket=45s, pool max=10, pool min=2');
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for initial connection
      socketTimeoutMS: 45000, // 45 seconds for socket timeout
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('[DB] ✓ Connexion à la base de données établie avec succès');
        console.log('[DB] Connecté à la base de données:', mongoose.connection.name || 'default');
        console.log('[DB] État de la connexion:', mongoose.connection.readyState === 1 ? 'Connecté' : 'État inconnu');
        return mongoose;
      })
      .catch((error) => {
        console.error('[DB] Échec de connexion à la base de données');
        console.error('[DB] Erreur brute:', error);
        
        // Clear the promise so it can be retried
        cached.promise = null;
        
        // Provide specific error messages based on error type
        if (error instanceof Error) {
          console.error('[DB] Message d\'erreur:', error.message);
          console.error('[DB] Type d\'erreur:', error.name);
          
          // Categorize the error for better user feedback
          let userFriendlyMessage = error.message;
          let diagnosticHelp = '';
          
          if (error.message.includes('authentication failed') || 
              error.message.includes('auth failed') || 
              error.message.includes('AuthenticationFailed')) {
            userFriendlyMessage = 'Échec d\'authentification MongoDB. Le nom d\'utilisateur ou le mot de passe dans MONGODB_URI est incorrect.';
            diagnosticHelp = 'Vérifiez vos identifiants MongoDB Atlas:\n' +
                           '1. Connectez-vous à MongoDB Atlas\n' +
                           '2. Allez dans Database Access\n' +
                           '3. Vérifiez que l\'utilisateur existe et que le mot de passe est correct\n' +
                           '4. Assurez-vous que le mot de passe ne contient pas de caractères spéciaux non encodés';
            console.error('[DB] DIAGNOSTIC:', diagnosticHelp);
          } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            userFriendlyMessage = 'Serveur MongoDB introuvable. L\'adresse du cluster dans MONGODB_URI est incorrecte ou le cluster n\'existe pas.';
            diagnosticHelp = 'Vérifications à effectuer:\n' +
                           '1. Connectez-vous à MongoDB Atlas\n' +
                           '2. Allez dans Database > Connect\n' +
                           '3. Copiez la chaîne de connexion exacte\n' +
                           '4. Vérifiez que l\'adresse du cluster est correcte (ex: cluster0.xxxxx.mongodb.net)';
            console.error('[DB] DIAGNOSTIC:', diagnosticHelp);
          } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
            userFriendlyMessage = 'Délai de connexion MongoDB expiré. Problème de connectivité réseau ou liste blanche IP incorrecte.';
            diagnosticHelp = 'Actions à entreprendre:\n' +
                           '1. Vérifiez votre connexion Internet\n' +
                           '2. Dans MongoDB Atlas, allez dans Network Access\n' +
                           '3. Ajoutez 0.0.0.0/0 pour autoriser toutes les IPs (développement)\n' +
                           '4. Pour la production, ajoutez les IPs Vercel spécifiques\n' +
                           '5. Attendez 2-3 minutes après modification de la liste blanche';
            console.error('[DB] DIAGNOSTIC:', diagnosticHelp);
          } else if (error.message.includes('Invalid connection string') || 
                    error.message.includes('Invalid scheme') ||
                    error.message.includes('URI')) {
            userFriendlyMessage = 'Format de la chaîne de connexion MongoDB invalide. La syntaxe de MONGODB_URI est incorrecte.';
            diagnosticHelp = 'Format correct:\n' +
                           'mongodb+srv://username:password@cluster.mongodb.net/?appName=ClusterName\n' +
                           'Vérifiez:\n' +
                           '1. Commence par mongodb+srv:// (avec +srv)\n' +
                           '2. username:password sont séparés par ":"\n' +
                           '3. @ sépare les credentials de l\'hôte\n' +
                           '4. Pas d\'espaces dans l\'URI';
            console.error('[DB] DIAGNOSTIC:', diagnosticHelp);
          } else if (error.name === 'MongoServerSelectionError') {
            userFriendlyMessage = 'Impossible de joindre le serveur MongoDB. Vérifiez la configuration MongoDB Atlas et l\'accès réseau.';
            diagnosticHelp = 'Causes possibles:\n' +
                           '1. Le cluster MongoDB est en pause (gratuit après 60 jours d\'inactivité)\n' +
                           '2. La liste blanche IP est mal configurée\n' +
                           '3. Le cluster n\'existe plus\n' +
                           '4. Problème de réseau temporaire\n' +
                           'Vérifiez MongoDB Atlas pour plus de détails.';
            console.error('[DB] DIAGNOSTIC:', diagnosticHelp);
          } else if (error.message.includes('bad auth')) {
            userFriendlyMessage = 'Authentification MongoDB échouée. Vérifiez que la base de données spécifiée existe et que l\'utilisateur y a accès.';
            diagnosticHelp = 'Vérifications:\n' +
                           '1. Dans MongoDB Atlas, vérifiez que l\'utilisateur a les permissions sur la base de données\n' +
                           '2. Vérifiez le nom de la base de données dans l\'URI\n' +
                           '3. Assurez-vous que l\'utilisateur a le rôle "readWrite" ou "dbAdmin"';
            console.error('[DB] DIAGNOSTIC:', diagnosticHelp);
          }
          
          // Create enhanced error with user-friendly message
          const enhancedError = new Error(userFriendlyMessage);
          enhancedError.name = error.name;
          throw enhancedError;
        }
        
        throw error;
      });
  }

  try {
    console.log('[DB] En attente de la connexion à la base de données...');
    cached.conn = await cached.promise;
    console.log('[DB] ✓ Connexion à la base de données prête et opérationnelle');
  } catch (e) {
    console.error('[DB] Erreur lors de l\'établissement de la connexion:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Track if event listeners have been added to prevent duplicates
let eventListenersAdded = false;

// Add connection event listeners for better debugging (only once)
if (mongoose.connection && !eventListenersAdded) {
  mongoose.connection.on('connected', () => {
    console.log('[DB] Mongoose connecté à la base de données');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Erreur de connexion Mongoose:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[DB] Mongoose déconnecté de la base de données');
  });
  
  mongoose.connection.on('reconnected', () => {
    console.log('[DB] Mongoose reconnecté à la base de données');
  });
  
  mongoose.connection.on('close', () => {
    console.log('[DB] Connexion Mongoose fermée');
  });
  
  eventListenersAdded = true;
}

export default dbConnect;
