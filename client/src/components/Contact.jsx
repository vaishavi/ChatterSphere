import React from 'react'
import Avatar from './Avatar';

const Contact = ({userId,onClick,selected,username,online}) => {
  return (
    <div onClick={()=>{onClick(userId)}} key={userId} className={'border-b border-gray-100 flex gap-2 items-center cursor-pointer '+ (selected? 'bg-blue-50' : " ")}>
            {(selected && 
                <div className='w-1 h-12 bg-blue-500 rounded-r-md'></div>
              )}
              <div className='ml-2 flex items-center gap-2 py-2'>
              <Avatar online={online} username={username} userId={userId}></Avatar>
              <span className='text-gray-800'>{username}</span>
              </div>          
          </div>
  )
}

export default Contact