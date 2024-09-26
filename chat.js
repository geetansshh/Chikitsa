document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');

    const apiUrl = 'https://47b9-34-105-34-164.ngrok-free.app/predict'; // Replace with your Ngrok URL

    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'ai-message');
        messageElement.textContent = message;

        const dateElement = document.createElement('div');
        dateElement.classList.add('date-separator');
        dateElement.textContent = new Date().toLocaleString();

        chatMessages.appendChild(dateElement);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function fetchAIResponse(userMessage) {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        chatMessages.appendChild(typingIndicator);
        const dots = ['.', '..', '...'];
        let dotIndex = 0;

        const typingInterval = setInterval(() => {
            typingIndicator.textContent = 'AI is typing' + dots[dotIndex];
            dotIndex = (dotIndex + 1) % dots.length;
        }, 500); // Change the interval duration as needed

        try {
            const instruction = "Respond to the user query";

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instruction: instruction,
                    input_text: userMessage
                })
            });

            const data = await response.json();
            const fullResponse = data.output;

            // Extract the part after "Output:"
            const outputParts = fullResponse.split('Output:');
            const aiResponse = outputParts.length > 1 ? outputParts[1].trim() : fullResponse.trim();
            
            clearInterval(typingInterval);
            chatMessages.removeChild(typingIndicator); // Remove the typing indicator
            addMessage(aiResponse, false);

        } catch (error) {
            console.error('Error fetching AI response:', error);
            clearInterval(typingInterval);
            chatMessages.removeChild(typingIndicator); // Remove the typing indicator
            addMessage('Sorry, an error occurred. Please try again later.', false);
        }
    }

    function handleUserInput() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            fetchAIResponse(message);
        }
    }

    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    addMessage("Hello! How can I assist you today?");
});
