const maxAttempts = 5;
const lockMinutes = 5;

// Funzione per formattare ora
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Al caricamento pagina: controlla blocco
let lockUntil = localStorage.getItem("lockUntil");
if (lockUntil && Date.now() < lockUntil) {
    document.getElementById("errorMsg").innerText =
        "Accesso bloccato fino alle " + formatTime(parseInt(lockUntil));
}

document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    // Ricarica info blocco
    lockUntil = localStorage.getItem("lockUntil");
    if (lockUntil && Date.now() < lockUntil) {
        document.getElementById("errorMsg").innerText =
            "Accesso bloccato fino alle " + formatTime(parseInt(lockUntil));
        return;
    }

    let loginAttempts = parseInt(localStorage.getItem("loginAttempts")) || 0;

    const username = document.getElementById("username").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    // Carica database dipendenti
    const response = await fetch("employees.json");
    const employees = await response.json();

    if (employees[username] && employees[username].password === password) {

        // Reset tentativi e blocco
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("lockUntil");

        // Vai alla cartella assegnata
        window.location.href = employees[username].folder;
        return;
    }

    // Credenziali errate
    loginAttempts++;
    localStorage.setItem("loginAttempts", loginAttempts);

    const remaining = maxAttempts - loginAttempts;

    if (remaining > 0) {
        document.getElementById("errorMsg").innerText =
            "Credenziali errate. Tentativi rimanenti: " + remaining;
    } else {
        // Imposta blocco
        const unlockTime = Date.now() + lockMinutes * 60000;
        localStorage.setItem("lockUntil", unlockTime);

        document.getElementById("errorMsg").innerText =
            "Troppi tentativi. Accesso bloccato fino alle " + formatTime(unlockTime);
    }
});
