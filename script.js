function navigateTo(sectionId) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.add("d-none"));
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("d-none");

  // Update profile info when navigating to profile
  if (sectionId === "profile" && window.currentAccount) {
    document.getElementById("profileName").textContent =
      `${window.currentAccount.firstname} ${window.currentAccount.lastname}`;
    document.getElementById("profileEmail").textContent = window.currentAccount.email;
    document.getElementById("profileRole").textContent = window.currentAccount.role;
  }

  // Refresh employees list when navigating to Employees
  if (sectionId === "employees") {
    renderEmployees();
  }
}

function showUserDropdown(account) {
  window.currentAccount = account;
  const authLinks = document.getElementById("authLinks");

  authLinks.innerHTML = `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button"
         data-bs-toggle="dropdown" aria-expanded="false">
        ${account.role === "Admin" ? "Admin" : account.firstname}
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUserDropdown">
        <li><a class="dropdown-item" href="#" onclick="navigateTo('profile')">Profile</a></li>
        <li><a class="dropdown-item" href="#" onclick="navigateTo('requests')">My Requests</a></li>
        ${account.role === "Admin" ? `
          <li><a class="dropdown-item role-admin" href="#" onclick="navigateTo('employees')">Employees</a></li>
          <li><a class="dropdown-item role-admin" href="#" onclick="navigateTo('accounts')">Accounts</a></li>
          <li><a class="dropdown-item role-admin" href="#" onclick="navigateTo('departments')">Departments</a></li>
        ` : ""}
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
      </ul>
    </li>
  `;
}

function logout() {
  window.currentAccount = null;
  const authLinks = document.getElementById("authLinks");
  authLinks.innerHTML = `
    <li class="nav-item">
      <a class="nav-link" href="#" onclick="navigateTo('login')">Login</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#" onclick="navigateTo('register')">Register</a>
    </li>
  `;
  navigateTo("home");
}

// -------------------- Accounts in localStorage --------------------
function getAccounts() {
  return JSON.parse(localStorage.getItem("accounts")) || [];
}
function saveAccounts(accounts) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

document.addEventListener("DOMContentLoaded", () => {
  // Registration
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

      let accounts = getAccounts();
      const exists = accounts.some(acc => acc.email === email);
      if (exists) {
        alert("Email already registered.");
        return;
      }

      const role = email === "admin@example.com" ? "Admin" : "User";
      accounts.push({ firstname, lastname, email, password, verified: false, role });
      saveAccounts(accounts);

      localStorage.setItem("unverified_email", email);
      navigateTo("verify-email");
      document.getElementById("verificationMessage").textContent = `Verification sent to ${email}`;
    });
  }

  // Verification
  const verifyBtn = document.getElementById("verifyBtn");
  if (verifyBtn) {
    verifyBtn.addEventListener("click", () => {
      const email = localStorage.getItem("unverified_email");
      if (!email) {
        alert("No email found. Please register first.");
        return;
      }

      let accounts = getAccounts();
      const account = accounts.find(acc => acc.email === email);
      if (account) {
        account.verified = true;
        saveAccounts(accounts);
        alert(`Email ${email} verified successfully!`);
        localStorage.removeItem("unverified_email");
        navigateTo("login");
        document.getElementById("loginAlert").classList.remove("d-none");
      } else {
        alert("Account not found.");
      }
    });
  }

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      let accounts = getAccounts();
      const account = accounts.find(acc => acc.email === email && acc.password === password);
      if (!account) {
        alert("Invalid email or password.");
        return;
      }
      if (!account.verified) {
        alert("Please verify your email before logging in.");
        return;
      }

      showUserDropdown(account);
      navigateTo("profile");
    });
  }

  // -------------------- Employees in localStorage --------------------
  const empForm = document.getElementById("empForm");
  if (empForm) {
    empForm.addEventListener("submit", (e) => {
      e.preventDefault();
      saveEmployee();
    });
  }
});

// Employees helpers
function getEmployees() {
  return JSON.parse(localStorage.getItem("employees")) || [];
}
function saveEmployees(employees) {
  localStorage.setItem("employees", JSON.stringify(employees));
}

function renderEmployees() {
  const tableBody = document.getElementById("employeesTableBody");
  if (!tableBody) return;

  const employees = getEmployees();
  tableBody.innerHTML = "";

  if (employees.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No employees.</td></tr>`;
    return;
  }

  employees.forEach((emp, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${emp.id}</td>
        <td>${emp.email}</td>
        <td>${emp.position}</td>
        <td>${emp.department}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editEmployee(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function saveEmployee() {
  const id = document.getElementById("empId").value.trim();
  const email = document.getElementById("empEmail").value.trim();
  const position = document.getElementById("empPosition").value.trim();
  const department = document.getElementById("empDepartment").value.trim();
  const hireDate = document.getElementById("empHireDate").value.trim();

  if (!id || !email || !position || !department || !hireDate) {
    alert("Please fill in all fields.");
    return;
  }

  let employees = getEmployees();
  const editingIndex = document.getElementById("empForm").dataset.editIndex;

  if (editingIndex !== undefined && editingIndex !== "") {
    employees[editingIndex] = { id, email, position, department, hireDate };
    document.getElementById("empForm").dataset.editIndex = "";
  } else {
    employees.push({ id, email, position, department, hireDate });
  }

  saveEmployees(employees);
  renderEmployees();
  document.getElementById("empForm").reset();
}

function editEmployee(index) {
  const employees = getEmployees();
  const emp = employees[index];
  document.getElementById("empId").value = emp.id;
  document.getElementById("empEmail").value = emp.email;
  document.getElementById("empPosition").value = emp.position;
  document.getElementById("empDepartment").value = emp.department;
  document.getElementById("empHireDate").value = emp.hireDate;
  document.getElementById("empForm").dataset.editIndex = index;
}

function deleteEmployee(index) {
  let employees = getEmployees();
  if (confirm("Are you sure you want to delete this employee?")) {
    employees.splice(index, 1);
    saveEmployees(employees);
    renderEmployees();
  }
}
