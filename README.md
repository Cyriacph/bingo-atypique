# Bingo Atypique 999
Une application de cartes de bingo pour les viewers de mon stream Twitch.

## Fonctionnalités
- Connexion avec Google (Twitch à venir).
- Génération aléatoire de cartes de bingo 5x5.
- Ajout de liens de clips pour chaque case.
- Détection automatique des lignes, colonnes, diagonales et blackout.
- Sauvegarde de la progression avec Firebase.

## Configuration
1. **Firebase** :
   - Créez un projet sur [Firebase Console](https://console.firebase.google.com/).
   - Activez **Authentication** (Google) et **Firestore**.
   - Remplacez `firebaseConfig` dans `app.js` avec vos identifiants Firebase.
   - Mettez Firestore en mode **test** pour le développement.

2. **Déploiement** :
   - Hébergez sur GitHub Pages ou Netlify.

## Auteur
Cyriacph

