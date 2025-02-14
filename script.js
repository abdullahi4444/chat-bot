const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const container = document.querySelector(".container");

//api setup
const API_KEY = "AIzaSyAceO3j37SEjol7ZqdUL-M-BdH3OI-srAs";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";

const chatHistory = [];

//function to create message elemnts
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML = content;
    return div;
}

//scroll to the bottom of the container
const scrollToBottom = () => container.scrollTo({top: container.scrollHeight, behavior: "smooth"});

//simulate typing effect for bot response
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    //set an interval to type each word
    const typingInterval = setInterval(() => {
        if(wordIndex < words.length){
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            botMsgDiv.classList.remove("loading");
            scrollToBottom();
        }
        else{
            clearInterval(typingInterval)
        }
    }, 40)
};

//make the api call and generate the bot's response
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");
    //add user message to the chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    })
    try{
        //send the chat history to the api to get a response
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"content-Type": "application/json"},
            body: JSON.stringify({ contents: chatHistory})
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        typingEffect(responseText, textElement, botMsgDiv);
    }catch(error){
        console.log(error);
    }
}

//handle the form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage) return;

    promptInput.value = "";

    //general user message HTML and add in the chats container
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();
    
    setTimeout(() => {
        //general bot message HTML and add in the chats container after 600ms
        const botMsgHTML = `<img src="../../chat.png" class="avatar"><p class="message-text">Just a sec...</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message" , "loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);
    },600);
}
promptForm.addEventListener("submit", handleFormSubmit);