const SERVER_URL = "https://pacis-link.onrender.com";

// --- DOM Elements
const textInput = document.getElementById("textInput");
const sendTextBtn = document.getElementById("sendTextBtn");
const textList = document.getElementById("textList");

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileList = document.getElementById("fileList");

// --- Load Texts
async function loadTexts() {
  const res = await fetch(`${SERVER_URL}/api/text`);
  const data = await res.json();
  textList.innerHTML = data.map(t => `<p>${t.content}</p>`).join("");
}

// --- Send Text
sendTextBtn.addEventListener("click", async () => {
  const text = textInput.value.trim();
  if (!text) return alert("Enter text first!");

  await fetch(`${SERVER_URL}/api/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text })
  });

  textInput.value = "";
  loadTexts();
});

// --- Load Files
async function loadFiles() {
  const res = await fetch(`${SERVER_URL}/api/files`);
  const files = await res.json();

  fileList.innerHTML = files
    .map(
      f => `<p><a href="${SERVER_URL}${f.url}" target="_blank">${f.originalName}</a></p>`
    )
    .join("");
}

// --- Upload File
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Choose a file first!");

  const form = new FormData();
  form.append("file", file);

  await fetch(`${SERVER_URL}/api/files/upload`, {
    method: "POST",
    body: form
  });

  fileInput.value = "";
  loadFiles();
});

// --- Initial Load
loadTexts();
loadFiles();
