import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt4TS5DpJQjLwRgiHSWBkbSkX5tQJSXK0",
  authDomain: "doctor-assistant-6934b.firebaseapp.com",
  databaseURL: "https://doctor-assistant-6934b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "doctor-assistant-6934b",
  storageBucket: "doctor-assistant-6934b.firebasestorage.app",
  messagingSenderId: "82637889324",
  appId: "1:82637889324:web:2bda4d7e17e821d68a5689"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let formData = {};
const { jsPDF } = window.jspdf;

// 🔊 Speak function
function speak(text, indicatorId = "voiceIndicator") {
  const indicator = document.getElementById(indicatorId);
  if (indicator) indicator.style.display = "block";

  let speech = new SpeechSynthesisUtterance(text);
  const lang = document.getElementById("languageSelect").value;
  speech.lang = lang;
  speech.onend = () => { if (indicator) indicator.style.display = "none"; };
  window.speechSynthesis.speak(speech);
}

// 📝 Submit Form
async function submitForm() {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const gender = document.getElementById("gender").value;
  const address = document.getElementById("address").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const lang = document.getElementById("languageSelect").value;

  if (!name || !age || !gender || !address || !whatsapp) {
    if (lang === "hi-IN") speak("कृपया सभी विवरण भरें।");
    else if (lang === "mr-IN") speak("कृपया सर्व माहिती भरा.");
    else speak("Please fill in all required fields.");
    alert("Please fill in all required fields.");
    return;
  }

  // Token logic with daily reset
  const today = new Date().toISOString().split('T')[0];
  let tokenData = localStorage.getItem("tokenData");
  tokenData = tokenData ? JSON.parse(tokenData) : { token: 0, date: '1970-01-01' };

  let newToken = (tokenData.date !== today) ? 1 : tokenData.token + 1;
  if (newToken > 50) newToken = 1;

  localStorage.setItem("tokenData", JSON.stringify({ token: newToken, date: today }));

  const now = new Date();
  const formattedDateTime = now.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true
  });

  formData = { name, age, gender, address, whatsapp, token: newToken, dateTime: formattedDateTime };

  try {
    await set(ref(database, 'patients/' + newToken), formData);

    document.getElementById("formSection").style.display = "none";
    document.getElementById("thankYouBox").style.display = "block";

    document.getElementById("tokenDisplay").textContent   = "Your Token: " + newToken;
    document.getElementById("nameDisplay").textContent    = "Name: " + name;
    document.getElementById("ageDisplay").textContent     = "Age: " + age;
    document.getElementById("genderDisplay").textContent  = "Gender: " + gender;
    document.getElementById("addressDisplay").textContent = "Address: " + address;
    document.getElementById("whatsappDisplay").textContent= "WhatsApp: " + whatsapp;
    document.getElementById("dateTimeDisplay").textContent= "Date & Time: " + formattedDateTime;

    if (lang === "hi-IN") speak(`पंजीकरण सफल। आपका टोकन नंबर ${newToken} है। स्वागत है ${name} जी।`, "voiceIndicator2");
    else if (lang === "mr-IN") speak(`नोंदणी यशस्वी. तुमचा टोकन नंबर ${newToken} आहे. स्वागत आहे ${name}!`, "voiceIndicator2");
    else speak(`Registration successful. Token number ${newToken}. Hi, Welcome to Hospital, ${name}. Kindly check your details.`, "voiceIndicator2");

  } catch (error) {
    console.error("Error saving patient data:", error);
    alert("Failed to save registration data. Please try again.");
  }
}

// 📄 Download PDF
function downloadPDF() {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text("Patient Registration Details", 20, 20);
  doc.setFontSize(12);
  doc.text(`Token Number: ${formData.token}`, 20, 40);
  doc.text(`Name: ${formData.name}`, 20, 50);
  doc.text(`Age: ${formData.age}`, 20, 60);
  doc.text(`Gender: ${formData.gender}`, 20, 70);
  doc.text(`Address: ${formData.address}`, 20, 80);
  doc.text(`WhatsApp: ${formData.whatsapp}`, 20, 90);
  doc.text(`Date & Time: ${formData.dateTime}`, 20, 100);
  doc.save(`Patient-Token-${formData.token}-${formData.name}.pdf`);
}

// ✏ Edit Details
function editDetails() {
  document.getElementById('thankYouBox').style.display = 'none';
  document.getElementById('formSection').style.display = 'block';
  document.getElementById('name').value = formData.name;
  document.getElementById('age').value = formData.age;
  document.getElementById('gender').value = formData.gender;
  document.getElementById('address').value = formData.address;
  document.getElementById('whatsapp').value = formData.whatsapp;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submitBtn')?.addEventListener('click', submitForm);
  document.getElementById('downloadPdfBtn')?.addEventListener('click', downloadPDF);
  document.getElementById('editDetailsBtn')?.addEventListener('click', editDetails);
});
