// Remove all React-related code
let messageHistory = [];
let debounceTimeout;

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat.js loaded successfully'); // Debug log

    const textarea = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    if (!textarea || !sendButton) {
        console.error('Required elements not found');
        return;
    }

    // Initialize textarea
    textarea.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(autoResizeTextarea, 100);
    });

    // Handle Enter key
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Handle send button click
    sendButton.addEventListener('click', sendMessage);

    // Focus textarea on load
    textarea.focus();
});

function autoResizeTextarea() {
    const textarea = document.getElementById('user-input');
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = newHeight + 'px';
}

function clearInput() {
    const textarea = document.getElementById('user-input');
    if (!textarea) return;

    textarea.value = '';
    textarea.style.height = '50px';
}

function createMessageElement(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (content.includes('```')) {
        const parts = content.split('```');
        parts.forEach((part, index) => {
            if (index % 2 === 0) {
                if (part.trim()) {
                    const textDiv = document.createElement('div');

                    const formattedText = part
                        .split('\n')
                        .map(line => {
                            const trimmedLine = line.trim();
                            const leadingSpaces = line.match(/^\s*/)[0].length;
                            const indentLevel = Math.floor(leadingSpaces / 2);

                            if (trimmedLine.match(/^\d+\./)) {
                                return '    '.repeat(indentLevel) + trimmedLine;
                            } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                                return '    '.repeat(indentLevel) + trimmedLine;
                            }

                            return '    '.repeat(indentLevel) + trimmedLine;
                        })
                        .join('\n');

                    textDiv.style.whiteSpace = 'pre-wrap';
                    textDiv.textContent = formattedText;
                    contentDiv.appendChild(textDiv);
                }
            } else {
                // Code block handling
                const codeWrapper = document.createElement('div');
                codeWrapper.className = 'code-block-wrapper';

                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                `;

                const codeText = part.trim();
                copyButton.addEventListener('click', () => copyToClipboard(copyButton, codeText));

                const pre = document.createElement('pre');
                const code = document.createElement('code');

                // Extract language if specified
                let language = 'plaintext';
                const firstLine = codeText.split('\n')[0].trim();
                if (firstLine.startsWith('language-') || firstLine.match(/^[a-zA-Z]+$/)) {
                    language = firstLine.replace('language-', '');
                    code.textContent = codeText.split('\n').slice(1).join('\n');
                } else {
                    code.textContent = codeText;
                }

                code.className = `language-${language}`;
                pre.appendChild(code);

                codeWrapper.appendChild(copyButton);
                codeWrapper.appendChild(pre);
                contentDiv.appendChild(codeWrapper);

                // Apply highlighting
                hljs.highlightElement(code);
            }
        });
    } else {
        const formattedText = content
            .split('\n')
            .map(line => {
                const trimmedLine = line.trim();
                const leadingSpaces = line.match(/^\s*/)[0].length;
                const indentLevel = Math.floor(leadingSpaces / 2);

                if (trimmedLine.match(/^\d+\./)) {
                    return '    '.repeat(indentLevel) + trimmedLine;
                } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    return '    '.repeat(indentLevel) + trimmedLine;
                }

                return '    '.repeat(indentLevel) + trimmedLine;
            })
            .join('\n');

        contentDiv.style.whiteSpace = 'pre-wrap';
        contentDiv.textContent = formattedText;
    }

    messageDiv.appendChild(contentDiv);
    return messageDiv;
}
function copyToClipboard(button, text) {
    // Clean the code by removing language identifier at the start
    let cleanText = text;
    const languageIdentifierRegex = /^[a-zA-Z]+\n/;
    if (languageIdentifierRegex.test(text)) {
        cleanText = text.replace(languageIdentifierRegex, '');
    }

    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(cleanText, button);
        return;
    }

    navigator.clipboard.writeText(cleanText)
        .then(() => {
            const originalContent = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            button.classList.add('copied');

            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyTextToClipboard(cleanText, button);
        });
}

function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const originalContent = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
            `;
            button.classList.add('copied');

            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);
        } else {
            console.error('Failed to copy text');
        }
    } catch (err) {
        console.error('Failed to copy:', err);
    }

    document.body.removeChild(textArea);
}

function appendMessage(message, isUser) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = createMessageElement(isUser ? 'user' : 'bot', message);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    messageHistory.push({
        role: isUser ? 'user' : 'assistant',
        content: message
    });
}

function updateStatus(status) {
    const statusText = document.getElementById('status-text');
    if (!statusText) return;

    statusText.textContent = status;
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, true);
    updateStatus('Thinking...');
    clearInput();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: messageHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
            appendMessage(data.message, false);
        } else {
            appendMessage('Sorry, there was an error processing your request.', false);
        }
    } catch (error) {
        console.error('Error:', error);
        appendMessage('Sorry, there was an error connecting to the server.', false);
    } finally {
        updateStatus('Ready');
    }
}

function suggestQuery(suggestion) {
    const input = document.getElementById('user-input');
    if (!input) return;

    input.value = suggestion;
    autoResizeTextarea();
    input.focus();
}

// Error handling for fetch requests
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// Theme switcher functionality
const initTheme = () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
};

// Initialize theme when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}
