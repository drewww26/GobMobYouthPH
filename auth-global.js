import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvu4PhDb_9TsijzlL4Hy9s2gXyhevv264",
  authDomain: "govmob-portal.firebaseapp.com",
  projectId: "govmob-portal",
  storageBucket: "govmob-portal.firebasestorage.app",
  messagingSenderId: "15495270960",
  appId: "1:15495270960:web:acde6f3e78d3b7982f93f5",
  measurementId: "G-LCE5NWSDVB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Keep track of the last logged-in user ID to prevent the toast from popping up on every single page refresh
let lastSessionUid = sessionStorage.getItem('active_session_uid');

onAuthStateChanged(auth, async (user) => {
  const authBtnContainer = document.getElementById('auth-btn-container');
  const adminNavContainer = document.getElementById('admin-nav-container');
  
  if (!authBtnContainer) return;

  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : { role: 'User' };
    
    // Fallback to email username if profile name isn't stored
    const displayName = userData.name || user.email.split('@')[0];
    const initial = user.email.charAt(0).toUpperCase();

    // Trigger Welcome Toast if this is a fresh login event
    if (lastSessionUid !== user.uid) {
      sessionStorage.setItem('active_session_uid', user.uid);
      showWelcomeToast(displayName, userData.role);
    }

    // Render Dropdown Structure
    authBtnContainer.innerHTML = `
      <div class="profile-dropdown-wrapper">
        <button id="profile-badge-btn" class="profile-badge">${initial}</button>
        <div id="profile-menu-dropdown" class="profile-dropdown">
          <div class="dropdown-header">
            <p class="dropdown-email">${user.email}</p>
            <p class="dropdown-role">${userData.role}</p>
          </div>
          <hr class="dropdown-divider">
          <button id="logout-btn" class="dropdown-item logout-item">Log Out</button>
        </div>
      </div>
    `;

    if (userData.role === 'Administrator' && adminNavContainer) {
      adminNavContainer.innerHTML = `<a href="admin.html" class="nav-link admin-nav-item">Admin Console</a>`;
    }

    const badgeBtn = document.getElementById('profile-badge-btn');
    const dropdownMenu = document.getElementById('profile-menu-dropdown');
    
    badgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
    
    document.getElementById('logout-btn').addEventListener('click', () => {
      sessionStorage.removeItem('active_session_uid');
      signOut(auth);
    });

  } else {
    // --- LOGGED OUT STATE (Updated with modern premium "Log In" button layout) ---
    const hasModalSetup = document.getElementById('auth-modal') !== null;

    if (hasModalSetup) {
      authBtnContainer.innerHTML = `<button id="join-now-btn" class="nav-btn premium-login-btn">Log In</button>`;
      const joinBtn = document.getElementById('join-now-btn');
      if (joinBtn) {
        joinBtn.addEventListener('click', () => {
          const modal = document.getElementById('auth-modal');
          if (modal) modal.classList.add('active');
        });
      }
    } else {
      authBtnContainer.innerHTML = `<a href="index.html" class="nav-btn premium-login-btn" style="text-decoration:none; text-align:center;">Log In</a>`;
    }

    if (adminNavContainer) adminNavContainer.innerHTML = '';
  }
});

// --- Beautiful Toast Animation Engine ---
function showWelcomeToast(name, role) {
  // Create toast container element dynamically so you don't have to add HTML manually to every page
  const toast = document.createElement('div');
  toast.className = 'welcome-toast';
  toast.innerHTML = `
    <div class="toast-icon">✨</div>
    <div class="toast-body">
      <h3>Maligayang Bati, ${name}!</h3>
      <p>Welcome back to GovMob Portal as our <strong>${role}</strong>.</p>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animate In
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Auto Dismiss and clean up DOM after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
