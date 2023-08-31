import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";

const API_KEY = "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";

function App() {
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([{
    message: "Hello", 
    sender: "bot"
  }])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]
    // update messages state
    setMessages(newMessages)

    // set typing indicator (shows who is typing)
    setTyping(true)

    // process message with bot
    await processMessage(newMessages)
  }

  async function processMessage(chatMessages) {
    //format message for API
    let apiMessages = chatMessages.map((messageObject) => {
      let role = ""
      if (messageObject.sender === "bot") {
        role = "assistant"
      } else {
        role = "user"
      }
      return {role: role, content: messageObject.message}
    })

    //initial message to determine role
    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am 10 years old."
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [systemMessage, ...apiMessages]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json() 
    }).then((data) => {
      let responseStr = data["choices"][0].message.content
      console.log(responseStr)
      setMessages(
        [...chatMessages, {
          message: responseStr,
          sender: "bot"
        }]
      )
      // remove typing indicator
      setTyping(false)
    })
  }

  return (
    <div className="ChatBot">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList scrollBehavior='smooth' typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing"/> : null }>
              {messages.map((message, index) => {
                return <Message key={index} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
      
        
    </div>
  )
}

export default App
