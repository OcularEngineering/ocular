"use client"

import { ChatUI } from '@/components/chat/chat-ui'
import ChatLayout from '@/components/chat-layout'
// import withAuth from '@/components/with-auth';

function Chat() {
  return (
    <ChatLayout>
      <ChatUI/>
    </ChatLayout>
  );
}

export default Chat;

