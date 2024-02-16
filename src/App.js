import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { useState } from 'react';

const apiKey = process.env.REACT_APP_API_KEY;

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: 'Hello! I\'m ChatGPT',
      sender: 'ChatGPT'
    }
  ]);

  const handleSend = async (message) => {
    setTyping(true);
    const newMessage = {
      message,
      sender: 'user',
      direction: 'outgoing'
    }
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    await processMessageToChatGPT(newMessages);
  };

  const processMessageToChatGPT = async (chatMessages) => {
    const apiMessages = chatMessages?.map((messageObj) => {
      let role = 'user';
      if (messageObj.sender === 'ChatGPT') role = 'assistant';
      return {
        role,
        content: messageObj.message
      }
    });

    // const systemMessage = {
    //   role: "system",
    //   content: "Explain all concepts like I am 10 yrs old."
    // };

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        // systemMessage,
        ...apiMessages
      ]
    }
    await fetch('https://api.openai.com/v1/chat/completions', {
      // mode: 'no-cors',
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => data.json())
      .then((data) => {
        setTyping(false);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: 'ChatGPT'
          }
        ])
      })
  }

  return (
    <div className="App">
      <div style={{
        position: 'relative',
        height: '100vh',
        width: '100vw'
      }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={typing ? (<TypingIndicator content="ChatGPT is typing" />) : null}
            >
              {
                messages?.map((message, index) => (
                  <Message key={index} model={message} />
                ))
              }
            </MessageList>
            <MessageInput placeholder='Type your message here...' onSend={(message) => handleSend(message)} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
