document.addEventListener('DOMContentLoaded', () => {

  // Replace with your Render backend URL
  const SERVER_URL = 'https://pacis-link.onrender.com';

  const socket = io(SERVER_URL);

  const roomInput = document.getElementById('room');
  const joinBtn = document.getElementById('joinBtn');
  const messagesDiv = document.getElementById('messages');
  const sendBtn = document.getElementById('sendBtn');
  const nameInput = document.getElementById('name');
  const messageInput = document.getElementById('message');

  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileList = document.getElementById('files');

  let currentRoom = 'lobby';

  // --- Join room
  joinBtn.onclick = async () => {
    currentRoom = roomInput.value || 'lobby';
    socket.emit('join-room', currentRoom);

    // Load previous messages
    try {
      const resText = await fetch(`${SERVER_URL}/api/text/list?room=${currentRoom}`);
      const texts = await resText.json();
      messagesDiv.innerHTML = '';
      texts.reverse().forEach(t => addMessage(t.sender, t.content));
    } catch(e){ console.error(e); }

    // Load files
    try {
      const resFiles = await fetch(`${SERVER_URL}/api/files`);
      const files = await resFiles.json();
      fileList.innerHTML = '';
      files.forEach(f => addFile(f.originalName, `${SERVER_URL}${f.url}`));
    } catch(e){ console.error(e); }
  };

  // --- Send text
  sendBtn.onclick = async () => {
    const sender = nameInput.value || 'Anonymous';
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('chat-message', { room: currentRoom, sender, message });
    addMessage('You', message);

    try {
      await fetch(`${SERVER_URL}/api/text/send`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room: currentRoom, sender, content: message })
      });
    } catch(e){ console.error(e); }

    messageInput.value = '';
  };

  // --- Receive text
  socket.on('chat-message', (data) => addMessage(data.sender, data.message));

  // --- Upload file
  uploadBtn.onclick = async () => {
    if (!fileInput.files.length) return alert('Select a file');
    const form = new FormData();
    form.append('file', fileInput.files[0]);

    try {
      const res = await fetch(`${SERVER_URL}/api/files/upload`, {
        method: 'POST',
        body: form
      });
      const fileMeta = await res.json();
      socket.emit('file-shared', { room: currentRoom, ...fileMeta });
      addFile(fileMeta.originalName, `${SERVER_URL}${fileMeta.url}`);
      fileInput.value = '';
    } catch(e) {
      console.error(e);
      alert('Upload failed');
    }
  };

  // --- Receive file
  socket.on('file-shared', (file) => addFile(file.originalName, `${SERVER_URL}${file.url}`));

  // --- Helper functions
  function addMessage(sender, message) {
    const div = document.createElement('div');
    div.textContent = `${sender}: ${message}`;
    messagesDiv.prepend(div);
  }

  function addFile(name, url) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.textContent = name;
    a.download = name;
    li.appendChild(a);
    fileList.prepend(li);
  }

});
