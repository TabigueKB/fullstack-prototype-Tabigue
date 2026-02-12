const STORAGE_KEY = "ipt_demo_v1";

/* =========================
   NAVIGATION
========================= */
function navigateTo(sectionId) {

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
  }
}

/* =========================
   USER DROPDOWN
========================= */
function showUserDropdown(account) {
  window.currentAccount = account;

  const authLinks = document.getElementById("authLinks");

  authLinks.innerHTML = `
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown"
         role="button" data-bs-toggle="dropdown">
        ${account.role === "Admin" ? "Admin" : account.firstname}
      </a>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="#" onclick="navigateTo('profile')">Profile</a></li>
        <li><a class="dropdown-item" href="#" onclick="navigateTo('requests')">My Requests</a></li>

        ${account.role === "Admin" ? `
          <li><a class="dropdown-item" href="#" onclick="navigateTo('employees')">Employees</a></li>
          <li><a class="dropdown-item" href="#" onclick="navigateTo('accounts')">Accounts</a></li>
          <li><a class="dropdown-item" href="#" onclick="navigateTo('departments')">Departments</a></li>
        ` : ""}

        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
      </ul>
    </li>
  `;
}

function logout() {
  window.currentAccount = null;
  document.getElementById("authLinks").innerHTML = `
    <li class="nav-item">
      <a class="nav-link" href="#" onclick="navigateTo('login')">Login</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#" onclick="navigateTo('register')">Register</a>
    </li>
  `;
  navigateTo("home");
}

/* =========================
   STORAGE
========================= */
function loadFromStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (data) {
    window.db = data;
  } else {
    window.db = {
      accounts: [],
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
  }

  // Ensure admin always exists
  const adminExists = window.db.accounts.some(
    acc => acc.email === "admin@example.com"
  );

  if (!adminExists) {
    window.db.accounts.push({
      firstname: "Admin",
      lastname: "User",
      email: "admin@example.com",
      password: "123456789",
      verified: true,
      role: "Admin"
    });
  }

  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

/* =========================
   EMPLOYEE FUNCTIONS
========================= */
function renderEmployees() {
  const tableBody = document.getElementById("employeesTableBody");
  if (!tableBody) return;

  const employees = window.db.employees || [];

  tableBody.innerHTML = "";

  if (employees.length === 0) {
    tableBody.innerHTML =
      `<tr><td colspan="6" class="text-center">No employees.</td></tr>`;
    return;
  }

  employees.forEach((emp, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${emp.id}</td>
        <td>${emp.name}</td>
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
  const name = document.getElementById("empName").value.trim();
  const email = document.getElementById("empEmail").value.trim();
  const position = document.getElementById("empPosition").value.trim();
  const department = document.getElementById("empDepartment").value;
  const hireDate = document.getElementById("empHireDate").value;

  if (!id || !name || !email || !position || !department || !hireDate) {
    alert("Please fill in all fields.");
    return;
  }

  if (!window.db.employees) {
    window.db.employees = [];
  }

  const form = document.getElementById("empForm");
  const editingIndex = form.dataset.editIndex;

  const employeeData = {
    id,
    name,
    email,
    position,
    department,
    hireDate
  };

  if (editingIndex !== undefined && editingIndex !== "") {
    window.db.employees[editingIndex] = employeeData;
    form.dataset.editIndex = "";
  } else {
    window.db.employees.push(employeeData);
  }

  saveToStorage();
  renderEmployees();
  form.reset();
}

function editEmployee(index) {
  const emp = window.db.employees[index];

  document.getElementById("empId").value = emp.id;
  document.getElementById("empName").value = emp.name;
  document.getElementById("empEmail").value = emp.email;
  document.getElementById("empPosition").value = emp.position;
  document.getElementById("empDepartment").value = emp.department;
  document.getElementById("empHireDate").value = emp.hireDate;

  document.getElementById("empForm").dataset.editIndex = index;
}

function deleteEmployee(index) {
  if (!confirm("Delete this employee?")) return;

  window.db.employees.splice(index, 1);
  saveToStorage();
  renderEmployees();
}

/* =========================
   DOM LOADED
========================= */
document.addEventListener("DOMContentLoaded", () => {

  loadFromStorage();

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const firstname = firstname.value.trim();
      const lastname = lastname.value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!firstname || !lastname || !email || !password) {
        alert("Please fill in all fields.");
        return;
      }

      const exists = window.db.accounts.some(acc => acc.email === email);
      if (exists) {
        alert("Email already registered.");
        return;
      }

      window.db.accounts.push({
        firstname,
        lastname,
        email,
        password,
        verified: false,
        role: "User"
      });

      saveToStorage();
      navigateTo("verify-email");
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      const account = window.db.accounts.find(
        acc => acc.email === email && acc.password === password
      );

      if (!account) {
        alert("Invalid email or password.");
        return;
      }

      showUserDropdown(account);
      navigateTo("profile");
    });
  }

  const empForm = document.getElementById("empForm");
  if (empForm) {
    empForm.addEventListener("submit", function (e) {
      e.preventDefault();
      saveEmployee();
    });
  }
});
