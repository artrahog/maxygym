const pages = ['home','login','signup','attendance','about','contact','admin'];
let currentUser = null;
let pendingAttendance = [];

const today = new Date();
const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function showPage(page) {
  pages.forEach(p => document.getElementById(p).classList.add('hidden'));
  document.getElementById(page).classList.remove('hidden');

  if (page === 'attendance') {
    if (!currentUser) {
      alert("Please login first");
      showPage('login');
      return;
    }
    buildCalendar();
    updateMemberStatus();
  }

  if (page === 'login') {
    loginUser.value = "";
    loginPass.value = "";
  }
}

/* STORAGE */
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/* AUTH */
function signup() {
  const users = getUsers();
  users.push({
    username: signUser.value,
    password: signPass.value,
    member: false,
    attendance: []
  });
  saveUsers(users);
  alert("Account created");
  showPage('login');
}

function login() {
  const u = loginUser.value;
  const p = loginPass.value;

  if (u === "admin" && p === "admin123") {
    logoutBtn.classList.remove("hidden");
    loadAdmin();
    return;
  }

  const user = getUsers().find(x => x.username === u && x.password === p);
  if (!user) return alert("Invalid login");

  currentUser = user;
  logoutBtn.classList.remove("hidden");
  showPage('home');
}

function logout() {
  currentUser = null;
  logoutBtn.classList.add("hidden");
  showPage('login');
}

/* MEMBERSHIP */
function updateMemberStatus() {
  memberStatus.textContent = currentUser.member
    ? "Status: MEMBER"
    : "Status: CUSTOMER";
}

function toggleMembership() {
  currentUser.member = !currentUser.member;
  saveCurrentUser();
  updateMemberStatus();
  buildCalendar();
}

function saveCurrentUser() {
  const users = getUsers();
  const i = users.findIndex(u => u.username === currentUser.username);
  users[i] = currentUser;
  saveUsers(users);
}

/* CALENDAR */
function buildCalendar() {
  calendar.innerHTML = "";
  pendingAttendance = [];

  const month = today.getMonth();
  const year = today.getFullYear();
  monthYear.textContent = `${monthNames[month]} ${year}`;

  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const day = document.createElement("div");
    day.textContent = d;

    if (currentUser.attendance.includes(d)) {
      day.style.background = currentUser.member ? "#fdd835" : "#4dd0e1";
    }

    day.onclick = () => {
      if (!pendingAttendance.includes(d)) {
        pendingAttendance.push(d);
        day.style.outline = "3px solid #26c6da";
      }
    };

    calendar.appendChild(day);
  }
}

function submitAttendance() {
  if (!pendingAttendance.length) return alert("Select a date");

  pendingAttendance.forEach(d => {
    if (!currentUser.attendance.includes(d))
      currentUser.attendance.push(d);
  });

  saveCurrentUser();
  buildCalendar();
  alert("Attendance saved");
}

/* ADMIN */
function loadAdmin() {
  showPage('admin');
  adminTable.innerHTML = "";

  getUsers().forEach((u, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.username}</td>
      <td>${u.member ? "MEMBER" : "CUSTOMER"}</td>
      <td>${u.attendance.length}</td>
      <td>
        <button onclick="toggleUser(${i})">Toggle Member</button>
        <button onclick="removeUser(${i})" style="background:#ff5252;margin-left:6px">Remove</button>
      </td>
    `;
    adminTable.appendChild(row);
  });
}

function toggleUser(i) {
  const users = getUsers();
  users[i].member = !users[i].member;
  saveUsers(users);
  loadAdmin();
}

function removeUser(i) {
  const users = getUsers();
  users.splice(i, 1);
  saveUsers(users);
  loadAdmin();
}
function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("show");
}

/* START */
showPage('home');
