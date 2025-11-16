// // --- Auto-detect backend URL (Render will provide the host)
// const BACKEND_URL = window.location.hostname.includes('localhost') 
//   ? 'http://localhost:5000'
//   : 'https://pacis-link.onrender.com'; // replace with your Render URL

// // --- Socket.io setup
// const socket = io(BACKEND_URL);

// // --- DOM elements
// const roomInput = document.getElementById('room');
// const joinBtn = document.getElementById('joinBtn');
// const messagesDiv = document.getElementById('messages');
// const sendBtn = document.getElementById('sendBtn');
// const nameInput = document.getElementById('name');
// const messageInput = document.getElementById('message');

// const fileInput = document.getElementById('fileInput');
// const uploadBtn = document.getElementById('uploadBtn');
// const fileList = document.getElementById('files');

// let currentRoom = 'lobby';

// // --- Join room
// joinBtn.addEventListener('click', async () => {
//   currentRoom = roomInput.value || 'lobby';
//   socket.emit('join-room', currentRoom);

//   // Load previous messages
//   const resText = await fetch(`${BACKEND_URL}/api/text/list?room=${currentRoom}`);
//   const texts = await resText.json();
//   messagesDiv.innerHTML = '';
//   texts.reverse().forEach(t => addMessage(t.sender, t.content));

//   // Load files
//   const resFiles = await fetch(`${BACKEND_URL}/api/files`);
//   const files = await resFiles.json();
//   fileList.innerHTML = '';
//   files.forEach(f => addFile(f.originalName, `${BACKEND_URL}${f.url}`));
// });

// // --- Send text
// sendBtn.addEventListener('click', async () => {
//   const sender = nameInput.value || 'Anonymous';
//   const content = messageInput.value.trim();
//   if (!content) return;

//   // Emit socket message
//   socket.emit('chat-message', { room: currentRoom, sender, message: content });

//   // Show locally
//   addMessage('You', content);
//   messageInput.value = '';

//   // Save to backend
//   await fetch(`${BACKEND_URL}/api/text/send`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ room: currentRoom, sender, content })
//   });
// });

// // --- Receive text
// socket.on('chat-message', data => {
//   addMessage(data.sender, data.message);
// });

// // --- Upload file
// uploadBtn.addEventListener('click', async () => {
//   if (!fileInput.files.length) return alert('Select a file');
  
//   const form = new FormData();
//   form.append('file', fileInput.files[0]);

//   const res = await fetch(`${BACKEND_URL}/api/files/upload`, {
//     method: 'POST',
//     body: form
//   });

//   const fileMeta = await res.json();

//   // Emit socket event
//   socket.emit('file-shared', { room: currentRoom, ...fileMeta });

//   // Show in UI
//   addFile(fileMeta.originalName, `${BACKEND_URL}${fileMeta.url}`);
//   fileInput.value = '';
// });

// // --- Receive file
// socket.on('file-shared', file => {
//   addFile(file.originalName, `${BACKEND_URL}${file.url}`);
// });

// // --- Helper functions
// function addMessage(sender, message) {
//   const div = document.createElement('div');
//   div.textContent = `${sender}: ${message}`;
//   messagesDiv.prepend(div);
// }

// function addFile(name, url) {
//   const li = document.createElement('li');
//   const a = document.createElement('a');
//   a.href = url;
//   a.textContent = name;
//   a.download = name; // force download when clicked
//   li.appendChild(a);
//   fileList.prepend(li);
// }
// function getQueryParam(name) {
//   const params = new URLSearchParams(window.location.search);
//   return params.get(name);
// }

// // on load
// const urlRoom = getQueryParam('room');
// if (urlRoom) {
//   roomInput.value = urlRoom;
//   joinRoom(urlRoom); // implement joinRoom to perform join actions
// }
// document.getElementById('shareBtn').addEventListener('click', () => {
//   const room = (roomInput.value || 'lobby').trim();
//   const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}`;
//   document.getElementById('shareLink').value = link;
//   document.getElementById('shareBox').style.display = 'block';
//   QRCode.toCanvas(document.getElementById('qrCanvas'), link, err => { if (err) console.error(err); });
// });



// // peer to peer
// let pc = null;
// let dataChannel = null;
// async function startP2P(isCaller) {
//   pc = new RTCPeerConnection();
//   pc.ondatachannel = e => setupDataChannel(e.channel);
//   pc.onicecandidate = e => { if (e.candidate) socket.emit('webrtc-candidate', { room: currentRoom, candidate: e.candidate }); };

//   if (isCaller) {
//     dataChannel = pc.createDataChannel('filetube');
//     setupDataChannel(dataChannel);
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
//     socket.emit('webrtc-offer', { room: currentRoom, offer });
//   }
// }

// function setupDataChannel(dc){
//   dc.onopen = () => console.log('DC open');
//   dc.onmessage = (ev) => handleIncomingData(ev.data);
// }

// socket.on('webrtc-offer', async ({offer}) => {
//   if (!pc) startP2P(false);
//   await pc.setRemoteDescription(offer);
//   const ans = await pc.createAnswer();
//   await pc.setLocalDescription(ans);
//   socket.emit('webrtc-answer', { room: currentRoom, answer: ans });
// });

// socket.on('webrtc-answer', async ({answer}) => {
//   await pc.setRemoteDescription(answer);
// });

// socket.on('webrtc-candidate', ({candidate}) => {
//   pc.addIceCandidate(candidate);
// });
// Replace this with your backend URL deployed on Render
// Replace this with your backend URL deployed on Render
// Replace this with your backend URL deployed on Render
const BACKEND_URL = "https://pacis-link.onrender.com"; 

const socket = io(BACKEND_URL);

let currentRoom = null;

// Elements
const roomInput = document.getElementById("room");
const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinRoomBtn");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const messagesDiv = document.getElementById("messages");
const fileListDiv = document.getElementById("fileList");

// --- Join room
joinBtn.addEventListener("click", () => {
  const room = roomInput.value.trim();
  const username = usernameInput.value.trim();
  if (!room || !username) return alert("Enter room and name");

  currentRoom = room;
  socket.emit("join-room", room);

  messageInput.disabled = false;
  sendBtn.disabled = false;
  fileInput.disabled = false;
  uploadBtn.disabled = false;

  fetchFiles();
  appendMessage(`✅ You joined room: ${room}`);
});

// --- Send chat message
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const data = {
    room: currentRoom,
    username: usernameInput.value,
    message: text
  };

  socket.emit("chat-message", data);
  messageInput.value = "";
});

// --- Receive chat messages
socket.on("chat-message", data => {
  appendMessage(`${data.username}: ${data.message}`);
});

// --- File shared via socket
socket.on("file-shared", data => {
  appendFile(data.filename, data.fileId);
});

// --- Upload file
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("room", currentRoom);

  try {
    const res = await fetch(`${BACKEND_URL}/api/files/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      appendFile(result.filename, result.fileId);
      socket.emit("file-shared", {
        room: currentRoom,
        filename: result.filename,
        fileId: result.fileId
      });
      fileInput.value = "";
    } else {
      alert("Upload failed");
    }
  } catch (err) {
    console.error(err);
  }
});

// --- Append message to UI
function appendMessage(msg) {
  const div = document.createElement("div");
  div.className = "message";
  div.textContent = msg;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// --- Append file link to UI
function appendFile(name, id) {
  const a = document.createElement("a");
  a.href = `${BACKEND_URL}/api/files/download/${id}`;
  a.textContent = name;
  a.download = name;
  a.style.display = "block";
  fileListDiv.appendChild(a);
}

// --- Fetch existing files in room
async function fetchFiles() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/files/room/${currentRoom}`);
    const files = await res.json();
    fileListDiv.innerHTML = "";
    files.forEach(f => appendFile(f.filename, f._id));
  } catch (err) {
    console.error(err);
  }
}
