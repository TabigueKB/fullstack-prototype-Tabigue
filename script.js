function navigateTo(sectionId) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.add("d-none"));
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("d-none");
}

function showUserDropdown(account) {
  const authLinks = document.getElementById("authLinks");
  const userDropdown = document.createElement("ul");
  userDropdown.className = "navbar-nav";
  userDropdown.innerHTML = `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button"
         data-bs-toggle="dropdown" aria-expanded="false">${account.firstname} ${account.lastname}</a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUserDropdown">
        <li><a class="dropdown-item" href="#" onclick="navigateTo('profile')">Profile</a></li>
        ${account.role === "Admin" ? `
          <li><a class="dropdown-item" href="#" onclick="navigateTo('employees')">Employees</a></li>
          <li><a class="dropdown-item" href="#" onclick="navigateTo('accounts')">Accounts</a></li>
          <li><a class="dropdown-item" href="#" onclick="navigateTo('departments')">Departments</a></li>
        ` : ""}
        <li><a class="dropdown-item" href="#" onclick="navigateTo('requests')">My Requests</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
      </ul>
    </li>
  `;
  authLinks.replaceWith(userDropdown);
}

function logout() {
  alert("Logged out!");
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  // Registration form logic
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const firstname = document.getElementById("firstname").value.trim();
      const lastname = document.getElementById("lastname").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!firstname || !lastname || !email || !password) {
        alert("Please fill in all fields.");
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }

      if (!window.db) window.db = { accounts: [] };
      const exists = window.db.accounts.some(acc => acc.email === email);
      if (exists) {
        alert("Email already registered.");
        return;
      }

      // Default role: Admin if email is admin@example.com, else User
      const role = email === "admin@example.com" ? "Admin" : "User";

      window.db.accounts.push({ firstname, lastname, email, password, verified: false, role });
      localStorage.setItem("unverified_email", email);

      navigateTo("verify-email");
      document.getElementById("verificationMessage").textContent = `Verification sent to ${email}`;
    });
  }

  // Verification logic
  const verifyBtn = document.getElementById("verifyBtn");
  if (verifyBtn) {
    verifyBtn.addEventListener("click", () => {
      const email = localStorage.getItem("unverified_email");
      if (!email) {
        alert("No email found. Please register first.");
        return;
      }

      const account = window.db.accounts.find(acc => acc.email === email);
      if (account) {
        account.verified = true;
        alert(`Email ${email} verified successfully!`);
        localStorage.removeItem("unverified_email");
        navigateTo("login");
        document.getElementById("loginAlert").classList.remove("d-none");
      } else {
        alert("Account not found.");
      }
    });
  }

  // Login logic
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!window.db || !window.db.accounts) {
        alert("No accounts found. Please register first.");
        return;
      }

      const account = window.db.accounts.find(acc => acc.email === email && acc.password === password);
      if (!account) {
        alert("Invalid email or password.");
        return;
      }

      if (!account.verified) {
        alert("Please verify your email before logging in.");
        return;
      }

      // Show profile info
      document.getElementById("profileName").textContent = `${account.firstname} ${account.lastname}`;
      document.getElementById("profileEmail").textContent = account.email;
      document.getElementById("profileRole").textContent = account.role;

      showUserDropdown(account);
      navigateTo("profile");
    });
  }
});
