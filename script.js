const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");




//api setup
const API_KEY = "AIzaSyDbkiQs0D_ZKTSSi5uQt5Qia-kQGqsUan0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
    message : null,
    file:{
        data:null,
        mime_type:null
    }
}
//create message element with dynamic classes and return it
const createMessageElement =(content,...classes)=>{
    const div = document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML = content;
    return div;
}



//generate bot response using api
const generateBotResponse = async (incomingMessageDiv)=>{
    const messageElement = incomingMessageDiv.querySelector(".message-text");
// api request options
    const requestOptions = {
        method : "POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            contents:[{
                parts: [{text: userData.message}, ...(userData.file.data ? [{ inline_data:userData.file }] : [])],
            }]
        })
    }
    try{
        //fetch bot response using
        const response = await fetch(API_URL,requestOptions)
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message)
        
            //extract and display bot's response text
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
        messageElement.innerText = apiResponseText;
    } catch(error){
        //Handle error in api response
        console.log(error);
        messageElement.innerText = error.message;
        messageElement.style.color="#ff0000";
    } finally{
        //reset users file data , removing thinking indicator and scroll to bottom
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({top: chatBody.scrollHeight,behavior: "smooth"});
    }
}

//handling outgoing user messages
const handleOutgoingMesssage = (e)=>{
    e.preventDefault();

    userData.message = messageInput.value.trim();
    messageInput.value = "";

    //create and display usermessage
    const messageContent = `
    <div class="message-text">${userData.message}</div>
    ${userData.file?.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}
  `;
  
    const outgoingmessageDiv=createMessageElement(messageContent,"user-message");
    outgoingmessageDiv.querySelector(".message-text").textContent = userData.message
    chatBody.appendChild(outgoingmessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight,behavior: "smooth"});

    //simulate bot response thinking indicator after a delay
    setTimeout(()=>{
            //create and display usermessage
        const messageContent =`                <svg  class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5z"></path>
                </svg>
                <div class="message-text">
                   <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                   </div>
                </div>`;

        const incomingMessageDiv=createMessageElement(messageContent,"bot-message","thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({top: chatBody.scrollHeight,behavior: "smooth"});
        generateBotResponse(incomingMessageDiv);
    },600);
}

// Handle enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        handleOutgoingMesssage(e);

    }
});


// Handle file input change and preview selected file
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];

        // Store file data in user data
        userData.file = {
            data: base64String,
            mime_type: file.type
        };

        fileInput.value = "";

        // Show cancel button when file is uploaded
        document.querySelector("#cancel-upload").style.display = "inline-block";
    };
    reader.readAsDataURL(file);
});

// Cancel file upload
document.querySelector("#cancel-upload").addEventListener("click", () => {
    // Reset file input and preview
    userData.file = {}; // Clear file data
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = "";
    fileUploadWrapper.classList.remove("file-uploaded");

    // Hide the cancel button
    document.querySelector("#cancel-upload").style.display = "none";
});

const darkModeToggle = document.getElementById('dark-mode-toggle');

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    // Store user preference in localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});

// Apply saved theme on page load
window.addEventListener('load', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
});



sendMessageButton.addEventListener("click",(e)=>handleOutgoingMesssage(e));
document.querySelector("#file-upload").addEventListener("click",()=>fileInput.click() );
