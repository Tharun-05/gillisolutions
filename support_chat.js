/**
 * Enhanced Support Chat with Interactive Bot Functionality
 */
export function initSupportChat() {
    const supportChat = document.getElementById('supportChat');
    if (!supportChat) return;
    
    const chatHeader = supportChat.querySelector('.chat-header');
    const minimizeBtn = supportChat.querySelector('.minimize-chat');
    const chatInput = supportChat.querySelector('.chat-input input');
    const sendBtn = supportChat.querySelector('.chat-input button');
    const chatMessages = supportChat.querySelector('.chat-messages');
    
    // Chat state
    const chatState = {
        context: 'initial',
        userName: '',
        userInterests: [],
        askedForContact: false,
        productDiscussed: null
    };
    
    // Toggle chat open/closed
    chatHeader.addEventListener('click', function() {
        supportChat.classList.toggle('open');
        
        // If opening for the first time, show welcome message
        if (supportChat.classList.contains('open') && chatMessages.children.length === 0) {
            setTimeout(() => {
                addMessage('bot', "Hello! 👋 I'm your kitchen equipment assistant. How can I help you today?");
            }, 300);
        }
    });
    
    // Minimize chat
    minimizeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        supportChat.classList.remove('open');
    });
    
    // Send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage('user', message);
        
        // Clear input
        chatInput.value = '';
        
        // Process message and generate response
        processMessage(message);
    }
    
    // Process user message and generate appropriate response
function processMessage(message) {
    // Convert to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Show typing indicator
    showTypingIndicator();
    
    setTimeout(() => {
        // Remove typing indicator
        hideTypingIndicator();
        
        // If we're in greeting context and expecting a name
        if (chatState.context === 'greeting' && !chatState.userName) {
            const nameMatch = findName(message);
            if (nameMatch) {
                chatState.userName = nameMatch;
                addMessage('bot', `Nice to meet you, ${chatState.userName}! How can I help you with your kitchen equipment needs today?`);
                chatState.context = 'introduction_complete';
                return;
            }
        }
        
        // If we don't have the user's name yet and this isn't a greeting, try to get it
        if (!chatState.userName && chatState.context !== 'greeting' && !isGreeting(lowerMessage)) {
            const nameMatch = findName(message);
            if (nameMatch) {
                chatState.userName = nameMatch;
                addMessage('bot', `Nice to meet you, ${chatState.userName}! How can I help you with your kitchen equipment needs today?`);
                chatState.context = 'introduction_complete';
                return;
            }
        }
        
        // Check for product mentions in pricing context
        if (chatState.context === 'pricing') {
            // Check if they mentioned a specific product
            const productKeywords = {
                'oven': 'ovens',
                'stove': 'stoves',
                'refrigerator': 'refrigerators',
                'fridge': 'refrigerators',
                'dishwasher': 'dishwashers',
                'mixer': 'mixers',
                'blender': 'blenders',
                'microwave': 'microwaves',
                'cooktop': 'cooktops',
                'range': 'ranges',
                'hood': 'range hoods',
                'freezer': 'freezers',
                'coffee': 'coffee machines',
                'espresso': 'espresso machines',
                'grill': 'grills',
                'fryer': 'fryers',
                'toaster': 'toasters'
            };
            
            for (const [keyword, product] of Object.entries(productKeywords)) {
                if (lowerMessage.includes(keyword)) {
                    chatState.productDiscussed = product;
                    addMessage('bot', `Our ${product} range in price depending on the model and specifications. Entry-level models start around $1,200, while our professional-grade options can go up to $5,000. Would you like me to arrange for a detailed quote based on your specific requirements?`);
                    return;
                }
            }
        }
        
        // Check for greetings
        if (isGreeting(lowerMessage)) {
            handleGreeting();
            return;
        }
        
        // Check for product inquiries
        if (isProductInquiry(lowerMessage)) {
            handleProductInquiry(lowerMessage);
            return;
        }
        
        // Check for pricing questions
        if (isPricingQuestion(lowerMessage)) {
            handlePricingQuestion(lowerMessage);
            return;
        }
        
        // Check for installation questions
        if (isInstallationQuestion(lowerMessage)) {
            handleInstallationQuestion();
            return;
        }
        
        // Check for warranty questions
        if (isWarrantyQuestion(lowerMessage)) {
            handleWarrantyQuestion();
            return;
        }
        
        // Check for contact request
        if (isContactRequest(lowerMessage)) {
            handleContactRequest();
            return;
        }
        
        // Check for thank you
        if (isThankYou(lowerMessage)) {
            handleThankYou();
            return;
        }
        
        // Check for goodbye
        if (isGoodbye(lowerMessage)) {
            handleGoodbye();
            return;
        }
        
        // If we've discussed a product and they're asking for more info
        if (chatState.productDiscussed && isMoreInfoRequest(lowerMessage)) {
            provideMoreProductInfo(chatState.productDiscussed);
            return;
        }
        
        // Default response if we don't understand
        handleUnknownQuery(message);
    }, 1000); // Simulate thinking time
}
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot', 'typing-indicator');
        
        const typingContent = document.createElement('div');
        typingContent.classList.add('message-content');
        typingContent.innerHTML = '<span></span><span></span><span></span>';
        
        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Add message to chat
    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        // Check if content contains HTML
        if (content.includes('<')) {
            messageContent.innerHTML = content;
        } else {
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Pattern matching functions
    function isGreeting(message) {
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'];
        return greetings.some(greeting => message.includes(greeting));
    }
    
    function findName(message) {
        // First check for explicit name patterns
        const explicitPatterns = [
            /my name is ([A-Za-z]+)/i,
            /i am ([A-Za-z]+)/i,
            /i'm ([A-Za-z]+)/i,
            /call me ([A-Za-z]+)/i
        ];
        
        for (const pattern of explicitPatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                // Capitalize first letter
                return match[1].charAt(0).toUpperCase() + match[1].slice(1);
            }
        }
        
        // If the context is greeting and we're expecting a name, 
        // and the message is just 1-2 words, treat it as a name
        if (chatState.context === 'greeting') {
            const words = message.trim().split(/\s+/);
            if (words.length <= 2) {
                // Take the first word as the name
                const name = words[0].replace(/[^A-Za-z]/g, '');
                if (name.length > 1) { // Ensure it's at least 2 characters
                    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                }
            }
        }
        
        return null;
    }
    
    function isProductInquiry(message) {
        const productKeywords = [
            'oven', 'stove', 'refrigerator', 'fridge', 'dishwasher', 'mixer', 
            'blender', 'microwave', 'cooktop', 'range', 'hood', 'freezer', 
            'coffee', 'espresso', 'grill', 'fryer', 'toaster', 'product', 'equipment'
        ];
        return productKeywords.some(keyword => message.includes(keyword));
    }
    
    function isPricingQuestion(message) {
        const pricingKeywords = ['pricing','price', 'cost', 'how much', 'expensive', 'cheap', 'affordable', 'discount', 'offer', 'deal', 'package'];
        return pricingKeywords.some(keyword => message.includes(keyword));
    }
    
    function isInstallationQuestion(message) {
        const installKeywords = ['install', 'setup', 'set up', 'mounting', 'connect', 'assemble', 'installation'];
        return installKeywords.some(keyword => message.includes(keyword));
    }
    
    function isWarrantyQuestion(message) {
        const warrantyKeywords = ['warranty', 'guarantee', 'repair', 'service', 'maintenance', 'broken', 'fix', 'support'];
        return warrantyKeywords.some(keyword => message.includes(keyword));
    }
    
    function isContactRequest(message) {
        const contactKeywords = ['contact', 'call', 'email', 'phone', 'speak', 'representative', 'person', 'human', 'agent', 'sales'];
        return contactKeywords.some(keyword => message.includes(keyword));
    }
    
    function isThankYou(message) {
        const thankYouKeywords = ['thank', 'thanks', 'appreciate', 'grateful', 'helpful'];
        return thankYouKeywords.some(keyword => message.includes(keyword));
    }
    
    function isGoodbye(message) {
        const goodbyeKeywords = ['bye', 'goodbye', 'see you', 'talk later', 'have a good', 'have a nice'];
        return goodbyeKeywords.some(keyword => message.includes(keyword));
    }
    
    function isMoreInfoRequest(message) {
        const moreInfoKeywords = ['more info', 'details', 'specifications', 'specs', 'features', 'tell me more', 'more about'];
        return moreInfoKeywords.some(keyword => message.includes(keyword));
    }
    
    // Response handlers
    function handleGreeting() {
        chatState.context = 'greeting';
        
        if (chatState.userName) {
            addMessage('bot', `Hello again, ${chatState.userName}! How can I assist you today?`);
        } else {
            addMessage('bot', "Hello there! I'm your kitchen equipment assistant. May I know your name?");
        }
    }
    
    function handleProductInquiry(message) {
        // Identify which product they're asking about
        const productKeywords = {
            'oven': 'ovens',
            'stove': 'stoves',
            'refrigerator': 'refrigerators',
            'fridge': 'refrigerators',
            'dishwasher': 'dishwashers',
            'mixer': 'mixers',
            'blender': 'blenders',
            'microwave': 'microwaves',
            'cooktop': 'cooktops',
            'range': 'ranges',
            'hood': 'range hoods',
            'freezer': 'freezers',
            'coffee': 'coffee machines',
            'espresso': 'espresso machines',
            'grill': 'grills',
            'fryer': 'fryers',
            'toaster': 'toasters'
        };
        
        let productDiscussed = null;
        
        for (const [keyword, product] of Object.entries(productKeywords)) {
            if (message.includes(keyword)) {
                productDiscussed = product;
                break;
            }
        }
        
        chatState.context = 'product_inquiry';
        chatState.productDiscussed = productDiscussed || 'kitchen equipment';
        
        if (productDiscussed) {
            addMessage('bot', `We offer a range of high-quality ${productDiscussed} for both commercial and home kitchens. Our ${productDiscussed} are known for their durability and energy efficiency. Would you like to know about specific features or pricing?`);
        } else {
            addMessage('bot', "We offer a complete range of professional kitchen equipment including ovens, refrigerators, dishwashers, and food preparation tools. Is there a specific type of equipment you're interested in?");
        }
    }
    
    function handlePricingQuestion(message) {
        chatState.context = 'pricing';
        
        // Check if they're asking about a specific product
        if (chatState.productDiscussed && message.includes(chatState.productDiscussed)) {
            addMessage('bot', `Our ${chatState.productDiscussed} range in price depending on the model and specifications. Entry-level models start around $1,200, while our professional-grade options can go up to $5,000. Would you like me to arrange for a detailed quote based on your specific requirements?`);
        } else {
            addMessage('bot', "Our pricing varies based on the equipment type, specifications, and whether you need installation services. We offer solutions for various budgets, from entry-level to premium professional-grade equipment. Could you tell me which specific products you're interested in so I can provide more accurate pricing information?");
        }
    }
    
    function handleInstallationQuestion() {
        chatState.context = 'installation';
        
        addMessage('bot', "We provide professional installation services for all our kitchen equipment. Our certified technicians ensure proper setup, connection, and testing. Installation costs depend on the complexity of the job and your location. Would you like me to include installation in your quote?");
    }
    
    function handleWarrantyQuestion() {
        chatState.context = 'warranty';
        
        addMessage('bot', "All our kitchen equipment comes with a standard 2-year warranty covering parts and labor. We also offer extended warranty options up to 5 years. Our service team provides quick response times and we have a nationwide network of certified technicians. Would you like more details about our maintenance plans?");
    }
    
    function handleContactRequest() {
        chatState.context = 'contact';
        chatState.askedForContact = true;
        
        addMessage('bot', `I'd be happy to connect you with one of our kitchen equipment specialists. Could you please provide your email or phone number, and a brief description of your needs? A team member will contact you within 24 hours.`);
    }
    
    function handleThankYou() {
        addMessage('bot', "You're welcome! I'm glad I could help. Is there anything else you'd like to know about our kitchen equipment?");
    }
    
    function handleGoodbye() {
        addMessage('bot', "Thank you for chatting with us today! If you have any more questions later, feel free to come back. Have a great day!");
        
        // Close chat after a delay
        setTimeout(() => {
            supportChat.classList.remove('open');
        }, 1000);
    }
    
    function provideMoreProductInfo(product) {
        const productInfo = {
            'ovens': "Our ovens feature precise temperature control, multiple cooking modes, and energy-efficient designs. The premium models include steam cooking functionality, self-cleaning, and smart connectivity for remote monitoring.",
            'refrigerators': "Our refrigerators are designed for optimal food preservation with adjustable temperature zones, humidity control, and energy-efficient operation. Commercial models offer rapid cooling and large capacity storage.",
            'dishwashers': "Our dishwashers combine powerful cleaning performance with water efficiency. They feature multiple wash cycles, adjustable racks, and quiet operation. Commercial models can complete cycles in as little as 30 minutes.",
            'mixers': "Our professional mixers come with various attachments for different food preparation tasks. They feature powerful motors, multiple speed settings, and durable construction for heavy-duty use.",
            'blenders': "Our high-performance blenders feature powerful motors, multiple speed settings, and durable blades that can handle everything from smoothies to hot soups.",
            'microwaves': "Our microwaves combine fast heating with even cooking results. Professional models include convection functionality and programmable settings for consistent results.",
            'cooktops': "Our cooktops are available in gas, electric, and induction options. They feature precise temperature control, easy-to-clean surfaces, and safety features.",
            'ranges': "Our ranges combine cooktop and oven functionality in one unit. They're available in gas, electric, and dual-fuel options with various configurations to suit your cooking style.",
            'range hoods': "Our range hoods effectively remove smoke, steam, and odors from your kitchen. They feature powerful ventilation, adjustable fan speeds, and stylish designs.",
            'freezers': "Our freezers maintain consistent temperatures for optimal food preservation. Commercial models offer rapid freezing capabilities and large storage capacity.",
            'coffee machines': "Our coffee machines deliver barista-quality coffee with programmable settings, built-in grinders, and milk frothers for perfect espresso-based drinks.",
            'espresso machines': "Our espresso machines feature precise pressure and temperature control for extracting the perfect shot. Professional models include multiple group heads for high-volume service.",
            'grills': "Our grills provide even heat distribution for perfect cooking results. They feature temperature control, easy cleaning, and durable construction.",
            'fryers': "Our fryers maintain consistent oil temperature for crispy results. They feature rapid recovery times, oil filtration systems, and safety features.",
            'toasters': "Our commercial toasters handle high-volume toasting with consistent results. They feature adjustable browning controls and durable construction."
        };
        
        const defaultInfo = "Our professional kitchen equipment is designed for durability, performance, and energy efficiency. Each product undergoes rigorous testing to ensure it meets the demands of busy kitchens.";
        
        addMessage('bot', productInfo[product] || defaultInfo);
        
        // Follow up with a question
        setTimeout(() => {
            addMessage('bot', "Would you like information about pricing or installation for this equipment?");
        }, 2000);
    }
    
    function handleUnknownQuery(message) {
        // Try to extract context from the message
        const messageLower = message.toLowerCase();
        
        if (messageLower.includes('yes') || messageLower.includes('sure') || messageLower.includes('okay')) {
            // Affirmative response to previous question
            if (chatState.context === 'product_inquiry') {
                addMessage('bot', `Great! For our ${chatState.productDiscussed}, we offer various models with different features. Would you prefer information about entry-level or professional-grade options?`);
            } else if (chatState.context === 'pricing') {
                addMessage('bot', "Excellent! To provide you with an accurate quote, could you tell me a bit more about your kitchen setup and specific requirements?");
            } else if (chatState.context === 'installation') {
                addMessage('bot', "Perfect! Our installation team will ensure your equipment is properly set up and functioning optimally. Would you like to schedule a site assessment to get a precise installation quote?");
            } else if (chatState.context === 'warranty') {
                addMessage('bot', "I'll be happy to send you detailed information about our warranty and maintenance plans. Could you provide your email address?");
            } else {
                // Generic affirmative response
                addMessage('bot', "Great! What specific information would you like me to provide about our kitchen equipment?");
            }
            return;
        }
        
        if (messageLower.includes('no') || messageLower.includes('not') || messageLower.includes('nope')) {
            // Negative response to previous question
            addMessage('bot', "No problem! Is there something else about our kitchen equipment that you'd like to know?");
            return;
        }
        
        // If we've asked for contact info and they might be providing it
        if (chatState.askedForContact && (messageLower.includes('@') || messageLower.match(/\d{3}[-\.\s]?\d{3}[-\.\s]?\d{4}/))) {
            addMessage('bot', "Thank you for providing your contact information. A member of our team will reach out to you shortly to discuss your kitchen equipment needs. Is there anything specific you'd like them to prepare for your conversation?");
            return;
        }
        
        // Default fallback response
        const fallbackResponses = [
            "I'm not sure I understand. Could you rephrase your question about our kitchen equipment?",
            "I'd like to help you with that. Could you provide more details about what you're looking for in kitchen equipment?",
            "That's an interesting question. To better assist you, could you tell me more about your kitchen setup and requirements?",
            "I want to make sure I provide the right information. Are you looking for commercial or residential kitchen equipment?",
            "I'm here to help with your kitchen equipment needs. Could you clarify what specific information you're looking for?"
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        addMessage('bot', randomResponse);
    }
    
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add CSS for typing indicator
    const style = document.createElement('style');
    style.textContent = `
        .typing-indicator .message-content {
            display: flex;
            align-items: center;
            height: 30px;
        }
        
        .typing-indicator span {
            height: 8px;
            width: 8px;
            background: var(--primary-color);
            border-radius: 50%;
            display: block;
            margin: 0 2px;
            opacity: 0.4;
        }
        
        .typing-indicator span:nth-child(1) {
            animation: pulse 1s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(2) {
            animation: pulse 1s infinite ease-in-out 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
            animation: pulse 1s infinite ease-in-out 0.4s;
        }
        
        @keyframes pulse {
            0% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0.4; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Open chat automatically after delay (uncomment to enable)
    
    // setTimeout(() => {
    //     if (!supportChat.classList.contains('open')) {
    //         supportChat.classList.add('open');
            
    //         // // Add initial bot message
    //         // setTimeout(() => {
    //         //     addMessage('bot', "Hello! 👋 I'm your kitchen equipment assistant. How can I help you today?");
    //         // }, 500);
    //     }
    // }, 8000);
    
}