// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVCCV3b5e6aHX-Arb7riK1rnrGy85tmw4",
  authDomain: "bingo-atypique.firebaseapp.com",
  projectId: "bingo-atypique",
  storageBucket: "bingo-atypique.appspot.com",
  messagingSenderId: "30273093295",
  appId: "1:30273093295:web:48007bcc65a4ea242d9e5a",
  measurementId: "G-X2M5NVHMF4",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginScreen = document.getElementById("login-screen");
const bingoScreen = document.getElementById("bingo-screen");
const googleLoginBtn = document.getElementById("google-login");
const twitchLoginBtn = document.getElementById("twitch-login");
const logoutBtn = document.getElementById("logout");
const saveProgressBtn = document.getElementById("save-progress");
const shareCardBtn = document.getElementById("share-card");
const bingoCard = document.querySelector(".bingo-card");

// Events List
const events = [
  "Le streamer dit 'Putain'",
  "Le chat spamme 'LUL'",
  "Quelqu’un fait un don de 5€+",
  "Le streamer boit de l’eau",
  "Un viewer offre un abonnement",
  "Le streamer rit aux éclats",
  "Quelqu’un utilise un emote personnalisé",
  "Le streamer perd contre un jeu",
  "Un mod supprime un message",
  "Le streamer chante",
  "Le streamer rage contre un jeu",
  "Le chat fait un 'KEKW' en masse",
  "Le streamer trébuche sur ses mots",
  "Un viewer demande 'C’est quand le next stream ?'",
  "Le streamer imite un accent",
  "Quelqu’un poste un copypasta",
  "Le streamer fait un troll",
  "Un meme apparaît en chat",
  "Le streamer pleure (de rire)",
  "Un viewer offre un don de 50€+",
  "Le streamer fait un ASMR involontaire",
  "Un animal/objet apparaît à l’écran",
  "Le streamer parle d’un sujet controversé",
  "Quelqu’un gagne un giveaway",
  "Le streamer mange à l’écran",
  "Un viewer fait un raid",
];

// Current user's bingo card
let currentCard = [];

// Shuffle Array (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate Bingo Card
function generateBingoCard() {
  const shuffledEvents = shuffleArray([...events]);
  const card = [];
  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      if (i === 2 && j === 2) {
        row.push({
          text: "CASE GRATUITE",
          isFreeSpace: true,
          checked: true,
          url: "",
        });
      } else {
        row.push({
          text: shuffledEvents.pop(),
          isFreeSpace: false,
          checked: false,
          url: "",
        });
      }
    }
    card.push(row);
  }
  return card;
}

// Render Bingo Card
function renderBingoCard(card) {
  currentCard = card;
  bingoCard.innerHTML = "";
  card.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add("bingo-square");
      if (square.isFreeSpace) {
        squareElement.classList.add("free-space");
      }

      // Event text
      const eventElement = document.createElement("div");
      eventElement.classList.add("bingo-event");
      if (square.isFreeSpace) {
        eventElement.innerHTML = `
          <div class="free-space-text">
            <span class="case">CASE</span>
            <br>
            <span class="gratuite">GRATUITE</span>
          </div>
        `;
      } else {
        eventElement.textContent = square.text;
      }
      squareElement.appendChild(eventElement);

      // Clip URL input and checkbox (skip for free space)
      if (!square.isFreeSpace) {
        // Clip URL input field
        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.classList.add("bingo-url-input");
        urlInput.placeholder = "Lien du clip ici";
        urlInput.value = square.url || "";
        urlInput.addEventListener("change", (e) => {
          card[rowIndex][colIndex].url = e.target.value;
        });
        squareElement.appendChild(urlInput);
      }
      bingoCard.appendChild(squareElement);
    });
  });
}

// Check for Wins (Lines/Columns/Diagonals/Blackout)
function checkForWins(card) {
  let winDetected = false;

  // Check rows
  for (let i = 0; i < 5; i++) {
    if (card[i].every((square) => square.checked)) {
      alert(`Ligne ${i + 1} complète ! 🎉`);
      winDetected = true;
    }
  }

  // Check columns
  for (let j = 0; j < 5; j++) {
    const column = card.map((row) => row[j]);
    if (column.every((square) => square.checked)) {
      alert(`Colonne ${j + 1} complète ! 🎉`);
      winDetected = true;
    }
  }

  // Check diagonals
  const diag1 = [card[0][0], card[1][1], card[2][2], card[3][3], card[4][4]];
  const diag2 = [card[0][4], card[1][3], card[2][2], card[3][1], card[4][0]];
  if (diag1.every((square) => square.checked)) {
    alert("Diagonale complète ! 🎉");
    winDetected = true;
  }
  if (diag2.every((square) => square.checked)) {
    alert("Diagonale complète ! 🎉");
    winDetected = true;
  }

  // Check blackout (all squares checked)
  if (card.every((row) => row.every((square) => square.checked))) {
    alert("BLACKOUT !!! 🎊🎉");
    winDetected = true;
  }

  return winDetected;
}

// Save Progress to Firestore
function saveProgress(card) {
  const user = auth.currentUser;
  if (user) {
    db.collection("users")
      .doc(user.uid)
      .set({
        card: card,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        console.log("Progrès sauvegardé !");
      })
      .catch((error) => {
        console.error("Erreur de sauvegarde : ", error);
      });
  }
}

// Load Progress from Firestore
function loadProgress(userId) {
  db.collection("users")
    .doc(userId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        renderBingoCard(doc.data().card);
      } else {
        const newCard = generateBingoCard();
        renderBingoCard(newCard);
        saveProgress(newCard);
      }
    })
    .catch((error) => {
      console.error("Erreur de chargement : ", error);
      const newCard = generateBingoCard();
      renderBingoCard(newCard);
    });
}

// Login with Google
googleLoginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provider)
    .then((result) => {
      loginScreen.style.display = "none";
      bingoScreen.style.display = "block";
      loadProgress(result.user.uid);
    })
    .catch((error) => {
      console.error("Erreur Google Login : ", error);
      alert("Erreur de connexion avec Google : " + error.message);
    });
});

// Login with Twitch (Placeholder - requires Twitch OAuth setup)
twitchLoginBtn.addEventListener("click", () => {
  alert(
    "La connexion avec Twitch nécessite une configuration supplémentaire. Utilise Google pour l'instant !",
  );
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth
    .signOut()
    .then(() => {
      loginScreen.style.display = "block";
      bingoScreen.style.display = "none";
    })
    .catch((error) => {
      console.error("Erreur de déconnexion : ", error);
    });
});

// Save Progress Button
saveProgressBtn.addEventListener("click", () => {
  saveProgress(currentCard);
  alert("Progrès sauvegardé ! ✅");
});

// Share Card Button
shareCardBtn.addEventListener("click", () => {
  const user = auth.currentUser;
  if (user) {
    const shareText = `Regarde ma carte de bingo pour le stream de Cyriacph ! ${window.location.href}`;
    if (navigator.share) {
      navigator
        .share({
          title: "Bingo Atypique 999",
          text: shareText,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      prompt("Copie ce lien pour partager ta carte :", window.location.href);
    }
  } else {
    alert("Connecte-toi d'abord pour partager ta carte !");
  }
});

// Initialize Auth State
auth.onAuthStateChanged((user) => {
  if (user) {
    loginScreen.style.display = "none";
    bingoScreen.style.display = "block";
    loadProgress(user.uid);
  } else {
    loginScreen.style.display = "block";
    bingoScreen.style.display = "none";
  }
});
