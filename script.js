function navigateTo(sectionId) {
  const STORAGE_KEY = "ipt_demo_v2";
  document.querySelectorAll("main section")
 .forEach(sec => sec.classList.add("d-none"));

  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("d-none");

  if (sectionId === "profile" && window.currentAccount) {
    profileName.textContent =
      `${window.currentAccount.firstname} ${window.currentAccount.lastname}`;
    profileEmail.textContent = window.currentAccount.email;
    profileRole.textContent = window.currentAccount.role;
  }
  if (sectionId === "employees") {
    renderEmployees();

    function showSection(sectionId) {
  document.querySelectorAll("section").forEach(section => {
    section.classList.add("d-none");
  });

  document.getElementById(sectionId).classList.remove("d-none");
}
  }
}

function showUserDropdown(account) {
  window.currentAccount = account; // track logged-in user
  const authLinks = document.getElementById("authLinks");

  authLinks.innerHTML = `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button"
         data-bs-toggle="dropdown" aria-expanded="false">
        ${account.role === "Admin" ? "Admin" : account.firstname}
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUserDropdown">
        <!-- Always visible when logged in -->
        <li><a class="dropdown-item" href="#" onclick="navigateTo('profile')">Profile</a></li>
        <li><a class="dropdown-item" href="#" onclick="navigateTo('requests')">My Requests</a></li>

        <!-- Admin-only links -->
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

      showUserDropdown(account);
      navigateTo("profile");
    });
    // Utility: get employees from localStorage
  function getEmployees() {
  if (!window.db.employees) {
    window.db.employees = [];
  }
  return window.db.employees;
}

// Utility: save employees to localStorage
function saveEmployees(employees) {
  localStorage.setItem("employees", JSON.stringify(employees));
}

// Render employees table
function renderEmployees() {
  const tableBody = document.getElementById("employeesTableBody");
  if (!tableBody) return;

  const employees = getEmployees();
  tableBody.innerHTML = "";

  if (employees.length === 0) {
    tableBody.innerHTML =
      `<tr><td colspan="5" class="text-center">No employees.</td></tr>`;
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
          <button class="btn btn-sm btn-primary"
            onclick="editEmployee(${index})">Edit</button>
          <button class="btn btn-sm btn-danger"
            onclick="deleteEmployee(${index})">Delete</button>
        </td>
      </tr>
    `;
  });

  window.db.employees.forEach((emp, index) => {
    const row = `
      <tr>
        <td>${emp.id}</td>
        <td>${emp.email}</td>
        <td>${emp.position}</td>
        <td>${emp.department}</td>
        <td>
          <button class="btn btn-sm btn-primary"
            onclick="editEmployee(${index})">Edit</button>
          <button class="btn btn-sm btn-danger"
            onclick="deleteEmployee(${index})">Delete</button>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

function saveEmployee() {
  const id = document.getElementById("empId").value.trim();
  const email = document.getElementById("empEmail").value.trim();
  const position = document.getElementById("empPosition").value.trim();
  const department = document.getElementById("empDepartment").value;
  const hireDate = document.getElementById("empHireDate").value;

  if (!id || !email || !position || !department || !hireDate) {
    alert("Please fill in all fields.");
    return;
  }

  const employees = getEmployees();
  const form = document.getElementById("empForm");
  const editingIndex = form.dataset.editIndex;

  if (editingIndex) {
    employees[editingIndex] = { id, email, position, department, hireDate };
    form.dataset.editIndex = "";
  } else {
    employees.push({ id, email, position, department, hireDate });
  }

  saveToStorage();     // ✅ your required function
  renderEmployees();   // ✅ instantly update table
  form.reset();
}

function editEmployee(index) {
  const emp = getEmployees()[index];

  document.getElementById("empId").value = emp.id;
  document.getElementById("empEmail").value = emp.email;
  document.getElementById("empPosition").value = emp.position;
  document.getElementById("empDepartment").value = emp.department;
  document.getElementById("empHireDate").value = emp.hireDate;

  document.getElementById("empForm").dataset.editIndex = index;
}

function deleteEmployee(index) {
  if (!confirm("Delete this employee?")) return;

  const employees = getEmployees();
  employees.splice(index, 1);

  saveToStorage();
  renderEmployees();
}

function showEmployeeForm() {
  document.getElementById("employeeFormContainer")
    .classList.remove("d-none");
}

function hideEmployeeForm() {
  document.getElementById("employeeFormContainer")
    .classList.add("d-none");
}
const STORAGE_KEY = 'ipt_demo_v1';

function loadFromStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (data) {
    window.db = data;
  } else {
    window.db = {
      accounts: [
        {
          firstname: "Admin",
          lastname: "User",
          email: "admin@example.com",
          password: "Password123!",
          verified: true,
          role: "Admin"
        }
      ],
      employees: [],
      departments: [
        "Engineering",
        "Human Resources",
        "Finance",
        "Marketing",
        "IT Support",
        "Operations"
      ]
    };
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

document.addEventListener("DOMContentLoaded", () => {

loadFromStorage();
renderEmployees();

const empForm = document.getElementById("empForm");
if (empForm) {
  empForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveEmployee();
  });
}

function loadEmployees() {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const tableBody = document.getElementById("employeeTableBody");

  tableBody.innerHTML = "";

  employees.forEach((emp, index) => {
    const row = `
      <tr>
        <td>${emp.name}</td>
        <td>${emp.position}</td>
        <td>${emp.email}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

function addEmployee() {
  const name = document.getElementById("employeeName").value;
  const position = document.getElementById("employeePosition").value;
  const email = document.getElementById("employeeEmail").value;

  const employees = JSON.parse(localStorage.getItem("employees")) || [];

  employees.push({ name, position, email });

  localStorage.setItem("employees", JSON.stringify(employees));

  loadEmployees();
  hideEmployeeForm();
}

  // Render employees when navigating to Employees section
  const employeesSection = document.getElementById("employees");
  if (employeesSection) {
    employeesSection.addEventListener("show", renderEmployees);
  }
  });
  }
});
