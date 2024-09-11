import React, { useContext, useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { UserContext } from './UserContext';
import uniqBy from 'lodash/uniqBy';
import axios from 'axios';
import Contact from './Contact';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlineUser, setOnlineUser] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [offlinePeople, setOfflinePeople] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { userName, id, setId, setUserName } = useContext(UserContext);
  const messageBoxRef = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket('ws://localhost:4000');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        connectToWs();
      }, 1000);
    });
  }

  function showPeopleOnline(peopleArray) {
    const people = {};
    peopleArray.forEach(({ username, userId }) => {
      people[userId] = username;
    });
    setOnlineUser(people);
  }

  function handleMessage(ev) {
    const MessageData = JSON.parse(ev.data);
    console.log("Message received in frontend:", MessageData);
    if ('onlineUser' in MessageData) {
      showPeopleOnline(MessageData.onlineUser);
    } else if ('text' in MessageData || 'file' in MessageData) {
      if(selectedUserId === MessageData.sender){
        setMessages((prev) => [...prev, { ...MessageData }]);
      }
      
    }
  }

  function handleSubmit(ev, file = null) {
    if (ev) ev.preventDefault();
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessage,
      file,
    }));
    

    if (file) {
      axios.get('/messages/'+selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
    else{
      setNewMessage('');
    setMessages((prev) => [
      ...prev,
      { text: newMessage, sender: id, recipient: selectedUserId, _id: Date.now() },
    ]);

    }
  }

  

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUserName(null);
    });
  }

  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      handleSubmit(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    const div = messageBoxRef.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get(`/messages/${selectedUserId}`).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const peopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((op) => !Object.keys(onlineUser).includes(op._id));

      const offlinePeople = {};
      peopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlineUser]);

  const messagesWithoutDupes = uniqBy(messages, '_id');
  const onlinePeopleExcludingOurUser = { ...onlineUser };
  delete onlinePeopleExcludingOurUser[id];

  return (
    <div className='flex h-screen'>
      <div className='bg-white w-1/3 flex flex-col'>
        <div className='p-2'>
          <Logo />
        </div>
        <div className='flex flex-col flex-grow overflow-y-auto'>
          {Object.keys(onlinePeopleExcludingOurUser).map((userId) => (
            <Contact
              key={userId}
              userId={userId}
              onClick={() => setSelectedUserId(userId)}
              selectedUserId={selectedUserId === userId}
              username={onlinePeopleExcludingOurUser[userId]}
              online={true}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              userId={userId}
              onClick={() => setSelectedUserId(userId)}
              selectedUserId={selectedUserId === userId}
              username={offlinePeople[userId].username}
              online={false}
            />
          ))}
        </div>
        <div className='p-4 text-center flex items-center justify-between'>
          <div className='flex items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
            <span className='ml-2 text-sm text-gray-600'>Welcome {userName}</span>
          </div>
          <button onClick={logout} className='text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm'>
            logout
          </button>
        </div>
      </div>

      <div className='flex flex-col bg-blue-50 w-2/3 p-2'>
        <div className='flex-grow'>
          {!selectedUserId && (
            <div className='h-full flex items-center justify-center p-2 text-gray-400'>
              &larr; Select a person from the list
            </div>
          )}
          {selectedUserId && (
            <div className='relative h-full'>
              <div className='overflow-y-scroll absolute inset-0'>
                {messagesWithoutDupes.map((message) => (
                  <div className={message.sender === id ? 'text-right' : 'text-left'}>
                    <div className={"inline-block p-2 my-2 rounded-sm text-sm " + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>
                      {message.text}
                      {message.file && (
                        <div className=''>
                          <a className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + "/uploads/" + message.file} target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                          <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                          </svg>
                          {message.file} 
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messageBoxRef}></div>
              </div>
            </div>
          )}
        </div>

        {selectedUserId && (
          <form className='flex gap-2' onSubmit={handleSubmit}>
            <input
              value={newMessage}
              onChange={(ev) => setNewMessage(ev.target.value)}
              type='text'
              placeholder='Type your message here'
              className='bg-white flex-grow border p-2 rounded-sm'
            />
            <label className='bg-blue-100 rounded-sm p-2 text-gray-800 border border-blue cursor-pointer'>
              <input type="file" className="hidden" onChange={sendFile}></input>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
              </svg>
            </label>
            <button type='submit' className='bg-blue-500 rounded-sm p-2 text-white'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;
