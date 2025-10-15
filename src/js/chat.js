import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.min.js';
import { getBasePath, normalizeImageUrl } from './utils.mjs';

const chatToggle = document.getElementById('chat-toggle');
const chatBox = document.getElementById('chat-box');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

let hasWelcomed = false;
let clocksData = [];
let fuse;
const basePath = getBasePath();

// Load clocks.json
fetch(`${basePath}src/json/clocks.json`)
  .then(response => response.json())
  .then(data => {
    clocksData = data.map(c => ({
      ...c,
      pageUrl: basePath + c.pageUrl.replace(/^\/+/, ''),
      Images: c.Images.map(img => ({
        Url: basePath + normalizeImageUrl(img.Url.replace(/^\/+/, ''))
      }))
    }));
    fuse = new Fuse(clocksData, { keys: ['name', 'maker'], threshold: 0.5 });
  })
  .catch(err => console.error('Error loading clocks database:', err));

function addMessage(text, sender) {
  const message = document.createElement('div');
  message.classList.add('chat-message', sender);
  message.innerHTML = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator(duration = 3000) {
  return new Promise((resolve) => {
    const typingBubble = document.createElement('div');
    typingBubble.classList.add('chat-typing');
    typingBubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    chatMessages.appendChild(typingBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      typingBubble.remove();
      resolve();
    }, duration);
  });
}

// Open chat
chatToggle.addEventListener('click', () => {
  chatBox.style.display = 'flex';
  chatToggle.style.display = 'none';

  if (!hasWelcomed) {
    addMessage("👋 Welcome! How can I help you today? Ask me about old clocks.", 'bot');
    hasWelcomed = true;
  }
});

// Close chat
chatClose.addEventListener('click', () => {
  chatBox.style.display = 'none';
  chatToggle.style.display = 'block';
});

// User input
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && chatInput.value.trim() !== '') {
    const userText = chatInput.value.trim();
    addMessage(userText, 'user');
    chatInput.value = '';
    handleUserMessage(userText);
  }
});

function preprocess(text) {
  return text.toLowerCase()
             .replace(/[^a-z0-9\s]/g, '')
             .replace(/\b(yo|do|you|know|anything|about|the|a|an|please|me|today)\b/g, '')
             .trim();
}

async function handleUserMessage(text) {
  if (!fuse) {
    await showTypingIndicator();
    addMessage("⏳ Loading clock database, please try again in a moment...", "bot");
    return;
  }

  const processed = preprocess(text);
  const results = fuse.search(processed);

  await showTypingIndicator(2000);

  if (results.length > 0) {
    const clock = results[0].item;
    const reply = `
      ✅ We have <strong>${clock.name}</strong> in our database.<br>
      Click <a href="${clock.pageUrl}" target="_blank" style="text-decoration: underline;">here</a> to go to the product page.
    `;
    addMessage(reply, 'bot');
  } else if (processed.includes('clock') || /clock/i.test(text)) {
    const cleanedText = text.trim().replace(/[?!.]$/, '');
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanedText)}`;
    addMessage(
      `🕰️ Sorry, we don't have that clock. You can search for it on Google here: <a href="${googleUrl}" target="_blank" style="text-decoration: underline;">${cleanedText}</a>`,
      'bot'
    );
  } else {
    addMessage("❌ Sorry, I only answer questions about old clocks.", 'bot');
  }
}
