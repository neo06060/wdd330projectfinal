  const chatToggle = document.getElementById('chat-toggle');
  const chatBox = document.getElementById('chat-box');
  const chatClose = document.getElementById('chat-close');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  chatToggle.addEventListener('click', () => {
    chatBox.style.display = 'flex';
    chatToggle.style.display = 'none';
  });

  chatClose.addEventListener('click', () => {
    chatBox.style.display = 'none';
    chatToggle.style.display = 'block';
  });

  chatInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter' && chatInput.value.trim() !== '') {
      const message = document.createElement('div');
      message.textContent = chatInput.value;
      message.style.marginBottom = '0.3rem';
      chatMessages.appendChild(message);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

