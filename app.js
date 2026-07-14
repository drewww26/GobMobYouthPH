import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Secret Role PIN Gateways (Change these as you see fit!)
const ROLE_PINS = {
  Member: "1111",
  Officer: "2222",
  Administrator: "3333"
};

// --- DOM Elements ---
const authBtnContainer = document.getElementById('auth-btn-container');
const authModal = document.getElementById('auth-modal');
const closeModal = document.getElementById('close-modal');
const authForm = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const toggleModeLink = document.getElementById('toggle-mode-link');
const roleSelectContainer = document.getElementById('role-select-container');
const roleSelect = document.getElementById('account-role');
const pinContainer = document.getElementById('pin-container');
const pinInput = document.getElementById('auth-pin');
const errorMessage = document.getElementById('error-message');

let isSignUpMode = false;

// --- State UI Synchronization ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Fetch profile data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : { role: 'User' };
    
    let menuHTML = `
      <span class="user-welcome">Hello, <strong>${user.email}</strong> (${userData.role})</span>
      <button id="logout-btn" class="nav-btn logout">Log Out</button>
    `;
    
    if (userData.role === 'Administrator') {
      menuHTML = `<a href="admin.html" class="nav-btn admin-link">Admin Console</a>` + menuHTML;
    }
    
    authBtnContainer.innerHTML = menuHTML;
    document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));
  } else {
    authBtnContainer.innerHTML = `<button id="join-now-btn" class="nav-btn join-now">JOIN NOW</button>`;
    document.getElementById('join-now-btn').addEventListener('click', openModal);
  }
});

// --- Modal Controls ---
function openModal() {
  authModal.classList.add('active');
  resetForm();
}

function closeModalWindow() {
  authModal.classList.remove('active');
}

function resetForm() {
  authForm.reset();
  errorMessage.textContent = "";
  isSignUpMode = false;
  formTitle.textContent = "Sign In";
  submitBtn.textContent = "Sign In";
  toggleModeLink.innerHTML = `Don't have an account? <span class="highlight">Sign Up</span>`;
  roleSelectContainer.style.display = "none";
  pinContainer.style.display = "none";
  pinInput.removeAttribute('required');
}

closeModal.addEventListener('click', closeModalWindow);

toggleModeLink.addEventListener('click', () => {
  isSignUpMode = !isSignUpMode;
  errorMessage.textContent = "";
  authForm.reset();
  
  if (isSignUpMode) {
    formTitle.textContent = "Create Account";
    submitBtn.textContent = "Register";
    toggleModeLink.innerHTML = `Already have an account? <span class="highlight">Sign In</span>`;
    roleSelectContainer.style.display = "block";
    handleRoleSelection();
  } else {
    resetForm();
  }
});

function handleRoleSelection() {
  const selectedRole = roleSelect.value;
  if (isSignUpMode && selectedRole !== 'User') {
    pinContainer.style.display = "block";
    pinInput.setAttribute('required', 'true');
  } else {
    pinContainer.style.display = "none";
    pinInput.removeAttribute('required');
  }
}

roleSelect.addEventListener('change', handleRoleSelection);

// --- Form Submission Integration ---
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMessage.textContent = "";
  
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const role = roleSelect.value;
  const enteredPin = pinInput.value;

  if (isSignUpMode) {
    // Role Authorization Verification
    if (role !== 'User') {
      if (enteredPin !== ROLE_PINS[role]) {
        errorMessage.textContent = `Invalid Authentication PIN for ${role} status access.`;
        return;
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save data structure to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date().toISOString()
      });
      
      closeModalWindow();
    } catch (error) {
      errorMessage.textContent = error.message.replace("Firebase: ", "");
    }
  } else {
    // Process Log In
    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeModalWindow();
    } catch (error) {
      errorMessage.textContent = "Invalid login credentials. Please try again.";
    }
  }
});
