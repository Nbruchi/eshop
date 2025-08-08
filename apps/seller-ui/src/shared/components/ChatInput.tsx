import { PickerProps } from 'emoji-picker-react';
import { Image, Send, Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ChangeEvent, Dispatch, FC, SetStateAction, useState } from 'react';

const EmojiPicker = dynamic(
  () =>
    import('emoji-picker-react').then((mod) => mod.default as FC<PickerProps>),
  { ssr: false }
);

interface ChatInputProps {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  onSendMessage: (e: any) => void;
}

const ChatInput = ({ message, setMessage, onSendMessage }: ChatInputProps) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  };

  return (
    <form
      className="border-t border-t-gray-200 bg-white px-4 py-3 flex items-center gap-2 relative"
      onSubmit={onSendMessage}
    >
      <label className="cursor-pointer p-2 rounded-md hover:bg-gray-100 transition">
        <Image className="size-5 text-gray-600" />
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleImageUpload}
        />
      </label>
      {/* Emoji picker toggler */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Smile className="size-5 text-gray-600" />
        </button>
        {showEmoji && (
          <div className="absolute bottom-12 left-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
      <input
        type="text"
        className="flex-1 px-4 py-2 text-sm border outline-none bg-gray-200 rounded-md"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 transition text-white p-2 rounded"
      >
        <Send className="size-4" />
      </button>
    </form>
  );
};

export default ChatInput;
