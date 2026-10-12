// RideOn - frontend logic. Data is stored in the browser (localStorage) acting as a simple backend.
const VEHICLES = [
  { id: "bike", name: "Bike", icon: "🏍️", base: 20, perKm: 6 },
  { id: "auto", name: "Auto", icon: "🛺", base: 30, perKm: 10 },
  { id: "mini", name: "Mini", icon: "🚗", base: 50, perKm: 13 },
  { id: "sedan", name: "Sedan", icon: "🚘", base: 70, perKm: 16 },
  { id: "suv", name: "SUV", icon: "🚙", base: 100, perKm: 20 },
];
const CARS = [
  { name: "Maruti Swift", icon: "🚗", seats: 5, fuel: "Petrol", day: 1499 },
  { name: "Honda City", icon: "🚘", seats: 5, fuel: "Petrol", day: 2299 },
  { name: "Toyota Innova", icon: "🚙", seats: 7, fuel: "Diesel", day: 3499 },
  { name: "Tata Nexon EV", icon: "⚡", seats: 5, fuel: "Electric", day: 2799 },
];

const $ = (id) => document.getElementById(id);
const db = {
  get: (k, d) => JSON.parse(localStorage.getItem(k)) ?? d,
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
let selected = "mini";
let signupMode = false;

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

function calcFare(v, km) {
  return Math.round(v.base + v.perKm * km);
}

function renderVehicles() {
  const km = Number($("distance").value) || 0;
  $("vehicles").innerHTML = VEHICLES.map(
    (v) => `<div class="vehicle ${v.id === selected ? "active" : ""}" data-id="${v.id}">
      <div class="ic">${v.icon}</div><b>${v.name}</b><small>₹${calcFare(v, km)}</small></div>`
  ).join("");
  document.querySelectorAll(".vehicle").forEach((el) =>
    el.addEventListener("click", () => { selected = el.dataset.id; renderVehicles(); })
  );
  const v = VEHICLES.find((x) => x.id === selected);
  $("fare").textContent = "₹" + calcFare(v, km);
}

function renderCars() {
  $("cars").innerHTML = CARS.map(
    (c, i) => `<div class="card car"><div class="ic">${c.icon}</div><h3>${c.name}</h3>
      <p>${c.seats} seats · ${c.fuel}</p><div class="price">₹${c.day}/day</div>
      <button class="btn full" onclick="rentCar(${i})">Rent Now</button></div>`
  ).join("");
}

function currentUser() { return db.get("currentUser", null); }

function requireLogin() {
  if (!currentUser()) { openModal(); toast("Please login first"); return false; }
  return true;
}

function addRide(ride) {
  const rides = db.get("rides", []);
  rides.unshift({ id: Date.now(), user: currentUser().email, status: "Confirmed", date: new Date().toLocaleString(), ...ride });
  db.set("rides", rides);
  renderRides();
}

window.rentCar = (i) => {
  if (!requireLogin()) return;
  const days = Number(prompt("For how many days?", "1"));
  if (!days || days < 1) return;
  const c = CARS[i];
  addRide({ title: `${c.icon} ${c.name} rental`, detail: `${days} day(s)`, fare: c.day * days });
  toast("Car rented successfully!");
};

window.cancelRide = (id) => {
  const rides = db.get("rides", []).map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r));
  db.set("rides", rides);
  renderRides();
  toast("Ride cancelled");
};

function renderRides() {
  const u = currentUser();
  if (!u) { $("rideList").innerHTML = `<p class="empty">Login to see your rides.</p>`; return; }
  const rides = db.get("rides", []).filter((r) => r.user === u.email);
  $("rideList").innerHTML = rides.length
    ? rides.map((r) => `<div class="card ride"><div><b>${r.title}</b><br><small>${r.detail} · ${r.date}</small></div>
        <div><b>₹${r.fare}</b> <span class="status ${r.status === "Cancelled" ? "cancelled" : ""}">${r.status}</span>
        ${r.status === "Confirmed" ? `<button class="cancel" onclick="cancelRide(${r.id})">Cancel</button>` : ""}</div></div>`).join("")
    : `<p class="empty">No rides yet. Book your first ride!</p>`;
}

function updateAuthBtn() {
  const u = currentUser();
  $("authBtn").textContent = u ? `Logout (${u.name})` : "Login";
}

function openModal() { $("modal").classList.remove("hidden"); }
function setMode(signup) {
  signupMode = signup;
  $("authTitle").textContent = $("authSubmit").textContent = signup ? "Sign up" : "Login";
  $("nameWrap").classList.toggle("hidden", !signup);
  $("toggleAuth").textContent = signup ? "Login" : "Sign up";
}

$("authBtn").onclick = () => {
  if (currentUser()) { localStorage.removeItem("currentUser"); updateAuthBtn(); renderRides(); toast("Logged out"); }
  else openModal();
};
$("closeModal").onclick = () => $("modal").classList.add("hidden");
$("toggleAuth").onclick = (e) => { e.preventDefault(); setMode(!signupMode); };

$("authForm").onsubmit = (e) => {
  e.preventDefault();
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  const users = db.get("users", []);
  if (signupMode) {
    if (users.find((u) => u.email === email)) return toast("Account already exists");
    const user = { name: $("name").value.trim() || "Rider", email, password };
    users.push(user); db.set("users", users); db.set("currentUser", user);
    toast("Welcome, " + user.name + "!");
  } else {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return toast("Wrong email or password");
    db.set("currentUser", user); toast("Logged in!");
  }
  $("modal").classList.add("hidden"); $("authForm").reset();
  updateAuthBtn(); renderRides();
};

$("distance").oninput = renderVehicles;
$("rideForm").onsubmit = (e) => {
  e.preventDefault();
  if (!requireLogin()) return;
  const v = VEHICLES.find((x) => x.id === selected);
  const km = Number($("distance").value);
  addRide({ title: `${v.icon} ${v.name}: ${$("pickup").value} → ${$("drop").value}`, detail: `${km} km`, fare: calcFare(v, km) });
  toast("Ride booked! Driver arriving in 3 min");
  $("rideForm").reset(); renderVehicles();
  location.hash = "rides";
};

renderVehicles(); renderCars(); renderRides(); updateAuthBtn();
