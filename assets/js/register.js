(function(){
  "use strict";

  const form = document.getElementById("aoreRegisterForm");
  const errBox = document.getElementById("aoreFormError");

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const confEl = document.getElementById("confirmPassword");

  const msgEl = document.getElementById("message");
  const msgCount = document.getElementById("msgCount");

  function setError(msg){
    errBox.textContent = msg || "";
  }

  function isEmailValid(v){
    // Simple and reliable enough for client-side
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function updateCount(){
    if (!msgEl || !msgCount) return;
    msgCount.textContent = String(msgEl.value.length);
  }

  updateCount();
  if (msgEl){
    msgEl.addEventListener("input", updateCount);
  }

  form.addEventListener("submit", function(e){
    setError("");

    const name = (nameEl.value || "").trim();
    const email = (emailEl.value || "").trim();
    const p1 = passEl.value || "";
    const p2 = confEl.value || "";

    if (!name){
      e.preventDefault();
      return setError("Name is required.");
    }
    if (!email || !isEmailValid(email)){
      e.preventDefault();
      return setError("A valid email is required.");
    }
    if (p1.length < 8){
      e.preventDefault();
      return setError("Password must be at least 8 characters.");
    }
    if (p1 !== p2){
      e.preventDefault();
      return setError("Passwords do not match.");
    }

    // Note: Turnstile token is validated server-side in Phase 3.
    // If Turnstile is not solved, Cloudflare widget will usually block submit anyway.
  });
})();
