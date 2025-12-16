const pages = ['home','login','signup','attendance','admin','about','contact'];

let currentUser = null;
let pendingAttendance = [];

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

/* NAVIGATION */
function showPage(page) {
  pages.forEach(p => document.getElementById(p).classList.add('hidden'));
  document.getElementById(page).classList.remove('hidden');

  if (page === 'login') {
    loginUser.value = "";
    loginPass.value = "";
  }

  if (page === 'attendance') {
    if (!currentUser) {
      alert("Please login first");
      showPage('login');
      return;
    }
    buildCalendar();
    updateMemberStatus();
  }
}

/* STORAGE */
function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
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

  if (u === 'admin' && p === 'admin123') {
    logoutBtn.classList.remove("hidden");
    loadAdmin();
    return;
  }

  const user = getUsers().find(x => x.username === u && x.password === p);
  if (!user) return alert("Invalid login");

  currentUser = user;
  logoutBtn.classList.remove("hidden");
  alert("Logged in successfully");
  showPage('home');
}

function logout() {
  currentUser = null;
  logoutBtn.classList.add("hidden");
  alert("Logged out");
  showPage('login');
}

/* MEMBERSHIP */
function updateMemberStatus() {
  memberStatus.textContent = currentUser.member
    ? "Status: MEMBER"
    : "Status: CUSTOMER";

  memberBtn.textContent = currentUser.member
    ? "Cancel Membership"
    : "Become Member";
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
function updateMonthYear() {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  monthYear.textContent = `${months[currentMonth]} ${currentYear}`;
}

function buildCalendar() {
  calendar.innerHTML = "";
  pendingAttendance = [];
  updateMonthYear();

  const days = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const el = document.createElement('div');
    el.className = 'day';
    el.textContent = d;

    if (currentUser.attendance.includes(d)) {
      el.classList.add(currentUser.member ? 'member' : 'customer');
    }

    el.onclick = () => toggleDay(d, el);
    calendar.appendChild(el);
  }
}

function toggleDay(day, el) {
  if (pendingAttendance.includes(day)) {
    pendingAttendance = pendingAttendance.filter(x => x !== day);
    el.style.outline = "none";
  } else {
    pendingAttendance.push(day);
    el.style.outline = "3px solid #8e44ad";
  }
}

function submitAttendance() {
  if (!pendingAttendance.length) return alert("Select a day");

  pendingAttendance.forEach(d => {
    if (!currentUser.attendance.includes(d))
      currentUser.attendance.push(d);
  });

  saveCurrentUser();
  buildCalendar();
  alert("Attendance submitted");
}

/* ADMIN */
function loadAdmin() {
  showPage('admin');
  adminTable.innerHTML = "";

  getUsers().forEach((u, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${u.username}</td>
      <td>${u.member ? "MEMBER" : "CUSTOMER"}</td>
      <td>${u.attendance.length}</td>
      <td>
        <button onclick="toggleUserMember(${i})">
          ${u.member ? "Remove Membership" : "Make Member"}
        </button>
        <br><br>
        <button onclick="removeUser(${i})" style="background:#c0392b">
          Remove
        </button>
      </td>
    `;
    adminTable.appendChild(row);
  });
}

function toggleUserMember(i) {
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

/* START */
showPage('home');
