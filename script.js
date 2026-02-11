document.addEventListener("DOMContentLoaded", () => {
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

      // Simulate registration
      console.log("Registered:", { firstname, lastname, email, password });
      alert(`Welcome, ${firstname}! Registration successful.`);

      // Redirect back to home page
      window.location.href = "index.html";
    });
  }
});
