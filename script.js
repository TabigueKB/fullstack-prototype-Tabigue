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
  if (sectionId === "employees") {
  renderEmployees();
}
if (sectionId === "requests") {
  renderRequests();
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

        { id: 1, name: "Engineering" },
        { id: 2, name: "Human Resources" },
        { id: 3, name: "Finance" },
        { id: 4, name: "Marketing" },
        { id: 5, name: "IT Support" },
        { id: 6, name: "Operations" }

      ],
      requests: []
    };
  }

  saveToStorage();
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
  const email = document.getElementById("empEmail").value.trim();
  const position = document.getElementById("empPosition").value.trim();
  const deptId = parseInt(document.getElementById("empDepartment").value);
  const hireDate = document.getElementById("empHireDate").value;

  if (!id || !email || !position || !deptId || !hireDate) {
    alert("Please fill all fields.");
    return;
  }

  // Validate email exists in accounts
  const userIndex = window.db.accounts.findIndex(acc => acc.email === email);
  if (userIndex === -1) {
    alert("User email not found in accounts!");
    return;
  }

  window.db.employees.push({
    id,
    userId: userIndex,
    deptId,
    position,
    hireDate
  });

  saveToStorage();
  renderEmployees();
  document.getElementById("empForm").reset();
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
    DEPARTMENT FUNCTIONS
========================= */

function renderDepartments() {
  const tableBody = document.getElementById("departmentsTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (!window.db.departments || window.db.departments.length === 0) {
    tableBody.innerHTML =
      `<tr><td colspan="3" class="text-center">No departments.</td></tr>`;
    return;
  }

  window.db.departments.forEach((dept, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${dept.name}</td>
        <td>${dept.description || "-"}</td>
        <td>
          <button class="btn btn-sm btn-primary"
            onclick="editDepartment(${index})">Edit</button>
          <button class="btn btn-sm btn-danger"
            onclick="deleteDepartment(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function addDepartment() {
  const name = prompt("Enter Department Name:");
  if (!name) return;

  window.db.departments.push({
    id: Date.now(),
    name: name,
    description: ""
  });

  saveToStorage();
  renderDepartments();
  updateDepartmentDropdown();
}

function editDepartment(index) {
  const dept = window.db.departments[index];
  const newName = prompt("Edit department name:", dept.name);
  if (!newName) return;

  dept.name = newName;

  saveToStorage();
  renderDepartments();
  updateDepartmentDropdown();
}

function deleteDepartment(index) {
  if (!confirm("Delete this department?")) return;

  window.db.departments.splice(index, 1);
  saveToStorage();
  renderDepartments();
  updateDepartmentDropdown();
}

function updateDepartmentDropdown() {
  const dropdown = document.getElementById("empDepartment");
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="">Select Department</option>`;

  window.db.departments.forEach(dept => {
    dropdown.innerHTML += `
      <option value="${dept.name}">${dept.name}</option>
    `;
  });
}

/* =========================
    ACCOUNT FUNCTIONS  
========================= */

function renderAccounts() {
  const tableBody = document.getElementById("accountsTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  window.db.accounts.forEach((acc, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${acc.firstname} ${acc.lastname}</td>
        <td>${acc.email}</td>
        <td>${acc.role}</td>
        <td>${acc.verified ? "✔" : "✖"}</td>
        <td>
          <button class="btn btn-sm btn-primary"
            onclick="editAccount(${index})">Edit</button>
          <button class="btn btn-sm btn-warning"
            onclick="resetPassword(${index})">Reset Password</button>
          <button class="btn btn-sm btn-danger"
            onclick="deleteAccount(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function saveAccount(e) {
  e.preventDefault();

  const index = document.getElementById("accountIndex").value;
  const firstname = document.getElementById("accFirstName").value.trim();
  const lastname = document.getElementById("accLastName").value.trim();
  const email = document.getElementById("accEmail").value.trim();
  const password = document.getElementById("accPassword").value.trim();
  const role = document.getElementById("accRole").value;
  const verified = document.getElementById("accVerified").checked;

  if (!firstname || !lastname || !email || !password) {
    alert("Please fill all fields.");
    return;
  }

  const accountData = { firstname, lastname, email, password, role, verified };

  if (index === "") {
    window.db.accounts.push(accountData);
  } else {
    window.db.accounts[index] = accountData;
  }

  saveToStorage();
  renderAccounts();
  resetAccountForm();
}

function editAccount(index) {
  const acc = window.db.accounts[index];

  document.getElementById("accountIndex").value = index;
  document.getElementById("accFirstName").value = acc.firstname;
  document.getElementById("accLastName").value = acc.lastname;
  document.getElementById("accEmail").value = acc.email;
  document.getElementById("accPassword").value = acc.password;
  document.getElementById("accRole").value = acc.role;
  document.getElementById("accVerified").checked = acc.verified;
}

function deleteAccount(index) {
  if (!confirm("Delete this account?")) return;

  window.db.accounts.splice(index, 1);
  saveToStorage();
  renderAccounts();
}
function resetPassword(index) {
  const password = prompt("Enter new password:");
  if (!password) return;
  window.db.accounts[index].password = password;
  saveToStorage();
  alert("Your password has been reset.");
}

function resetAccountForm() {
  document.getElementById("accountForm").reset();
  document.getElementById("accountIndex").value = "";
}

function deleteAccount(index) {
  window.db.accounts.splice(index, 1);
  saveToStorage();
  renderAccounts();
}
/* =========================
   DYNAMIC ITEM FIELDS
========================= */
function addItemField(name = "", qty = 1) {
  const container = document.getElementById("itemsContainer");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "d-flex mb-2";

  div.innerHTML = `
    <input type="text" class="form-control me-2 item-name"
           placeholder="Item name" value="${name}">
    <input type="number" class="form-control me-2 item-qty"
           style="width:90px" min="1" value="${qty}">
    <button type="button"
            class="btn btn-danger btn-sm"
            onclick="this.parentElement.remove()">
      ×
    </button>
  `;

  container.appendChild(div);
}

function renderRequests() {

  const tableBody = document.getElementById("requestsTableBody");
  if (!tableBody) return;

  const currentUser = window.currentAccount;
  if (!currentUser) return;   // ✅ VERY IMPORTANT

  const actionHeader = document.getElementById("requestActionHeader");

  if (currentUser.role === "Admin") {
    actionHeader.classList.remove("d-none");
  } else {
    actionHeader.classList.add("d-none");
  }

  tableBody.innerHTML = "";

  let requestsToShow = [];

  if (currentUser.role === "Admin") {
    requestsToShow = window.db.requests;
  } else {
    requestsToShow = window.db.requests.filter(
      req => req.employeeEmail === currentUser.email
    );
  }

  if (requestsToShow.length === 0) {
    tableBody.innerHTML =
      `<tr><td colspan="5" class="text-center">No requests yet.</td></tr>`;
    return;
  }

  requestsToShow.forEach((req, index) => {

    let badgeClass = "secondary";
    if (req.status === "Pending") badgeClass = "warning";
    if (req.status === "Approved") badgeClass = "success";
    if (req.status === "Rejected") badgeClass = "danger";

    const itemsText = req.items.map(i => `${i.name} (${i.qty})`).join(", ");

    tableBody.innerHTML += `
      <tr>
        <td>${req.date}</td>
        <td>${req.type}</td>
        <td>${itemsText}</td>
        <td><span class="badge bg-${badgeClass}">${req.status}</span></td>
        ${
          currentUser.role === "Admin"
            ? `<td>
                 <button class="btn btn-sm btn-success"
                   onclick="approveRequest(${index})">Approve</button>
                 <button class="btn btn-sm btn-danger"
                   onclick="rejectRequest(${index})">Reject</button>
               </td>`
            : ""
        }
      </tr>
    `;
  });
}

function approveRequest(index) {
  window.db.requests[index].status = "Approved";
  saveToStorage();
  renderRequests();
}

function rejectRequest(index) {
  window.db.requests[index].status = "Rejected";
  saveToStorage();
  renderRequests();
}

function saveRequest(e) {
  e.preventDefault();

  if (!window.currentAccount) {
    alert("You must be logged in.");
    return;
  }

  const type = document.getElementById("requestType").value;
  const itemNames = document.querySelectorAll(".item-name");
  const itemQtys = document.querySelectorAll(".item-qty");

  if (!type) {
    alert("Please select request type.");
    return;
  }

  let items = [];

  for (let i = 0; i < itemNames.length; i++) {
    const name = itemNames[i].value.trim();
    const qty = parseInt(itemQtys[i].value);

    if (name && qty > 0) {
      items.push({ name, qty });
    }
  }

  if (items.length === 0) {
    alert("Please add at least one item.");
    return;
  }

  window.db.requests.push({
    type,
    items,
    status: "Pending",
    date: new Date().toLocaleDateString(),
    employeeEmail: window.currentAccount.email
  });

  saveToStorage();
  renderRequests();

  document.getElementById("requestForm").reset();
  document.getElementById("itemsContainer").innerHTML = "";

  const modalEl = document.getElementById("requestModal");
  const modalInstance = bootstrap.Modal.getInstance(modalEl);

  if (modalInstance) {
    modalInstance.hide();
  }

  alert("Request submitted successfully!");
}

/* =========================
   DOM LOADED
========================= */
document.addEventListener("DOMContentLoaded", () => {

  loadFromStorage();

  renderEmployees();
  renderDepartments();
  updateDepartmentDropdown();
  renderAccounts();

  const registerForm = document.getElementById("registerForm");
  const requestForm = document.getElementById("requestForm");
  const editProfileBtn = document.getElementById("editProfileBtn");

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {

    if (!window.currentAccount) return;

    const newFirst = prompt(
      "Enter new first name:",
      window.currentAccount.firstname
    );

    const newLast = prompt(
      "Enter new last name:",
      window.currentAccount.lastname
    );

    if (newFirst && newLast) {
      window.currentAccount.firstname = newFirst;
      window.currentAccount.lastname = newLast;

      saveToStorage();
      navigateTo("profile");
    }
  });
}

  if (requestForm) {
  requestForm.addEventListener("submit", saveRequest);
}

  if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
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
      role: "User",
      verified: false
    });

    saveToStorage();
    navigateTo("verify-email");
  });
}

const accountForm = document.getElementById("accountForm");
if (accountForm) {
  accountForm.addEventListener("submit", saveAccount);
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

  const requestModal = document.getElementById("requestModal");

if (requestModal) {
  requestModal.addEventListener("shown.bs.modal", () => {
    const container = document.getElementById("itemsContainer");
    container.innerHTML = "";
    addItemField(); // automatically add first field
  });
}

  /* =========================
   EMAIL VERIFICATION
========================= */
const verifyBtn = document.getElementById("verifyBtn");

if (verifyBtn) {
  verifyBtn.addEventListener("click", () => {

    // Get last registered account
    const lastAccount = window.db.accounts[window.db.accounts.length - 1];

    if (!lastAccount) {
      alert("No account to verify.");
      return;
    }

    lastAccount.verified = true;

    saveToStorage();

    alert("Email successfully verified! You can now login.");

    // Show login alert message
    const loginAlert = document.getElementById("loginAlert");
    if (loginAlert) {
      loginAlert.classList.remove("d-none");
    }

    navigateTo("login");
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
