import { readStream, createReader } from "./stream";
import {
    ChatMessage,
} from "@/types/chat"
import { v4 as uuidv4 } from 'uuid';


export const processStreamChatResponse = async (
    response: Response, setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>, chatID: string
) => {
    let idx = 0;
    const reader = createReader(response.body);
    const chunks = readStream(reader);
    let lastChunk: any;
    let isFollowUp = false;

    for await (const chunk of chunks) {

        const newData = chunk.choices[0].delta.content.substring(lastChunk?.choices[0].delta.content.length||0);
        const markerIndex = newData.indexOf("<<");
        
        if(markerIndex !== -1&&!isFollowUp){
            isFollowUp = true;
        }

        if (!isFollowUp) {
            setChatMessages(prevChatMessages => {
                const updatedMessages = [...prevChatMessages];
                if (idx === 0) {
                    updatedMessages.push({
                        message: {
                            chat_id: chunk.metadata?.chat_id,
                            content: chunk.choices[0].delta.content,
                            created_at: new Date(),
                            id: uuidv4(),
                            role: chunk.metadata.role,
                            updated_at: new Date(),
                            user_id: chunk.metadata.user_id
                        },
                        fileItems: chunk.choices[0].delta.context?.data_points?.points || [],
                        followUpQuestions: []
                    });
                    idx++;
                } else {
                    const lastMessage = updatedMessages[updatedMessages.length - 1];
                    lastMessage.message.content = chunk.choices[0].delta.content;
                    lastMessage.message.updated_at = new Date();
                }
                return updatedMessages;
            });
        }
        lastChunk = chunk;
    }
    const questions = extractQuestions(lastChunk.choices[0].delta.content);
    setChatMessages(prevChatMessages => {
        const updatedMessages = [...prevChatMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        lastMessage.message.updated_at = new Date();
        lastMessage.followUpQuestions = questions;
        localStorage.setItem(chatID, JSON.stringify(updatedMessages));
        return updatedMessages;
    });
};

function extractQuestions(text: string): string[] {

    // Regular expression to match text between << and >>
    const questionRegex = /<<(.*?)>>/g;

    // Array to store the extracted questions
    const questions: string[] = [];

    // Match all occurrences and push them into the questions array
    let match: RegExpExecArray | null;
    while ((match = questionRegex.exec(text)) !== null) {
        const question = match[1].trim(); // Trim to remove any extra spaces
        questions.push(question);
    }

    return questions;
}
