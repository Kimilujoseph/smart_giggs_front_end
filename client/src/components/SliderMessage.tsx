import { useState, useEffect } from 'react';

const messages = [
  {
    id: 1,
    time: '09:00 AM',
    userId: 'system',
    message: 'Reminder: Update inventory by 5 PM.',
  },
  {
    id: 2,
    time: '09:30 AM',
    userId: 'manager',
    message: 'Weekly sales meeting at 3 PM in Conference Room.',
  },
  {
    id: 3,
    time: '10:00 AM',
    userId: 'system',
    message: 'New stock of accessories arriving tomorrow.',
  },
];

const SlidingMessages = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const messageLength = messages[currentMessageIndex].message.length;
    const displayDuration = messageLength * 100; // Adjust timing per character
    const timeout = setTimeout(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, displayDuration); 

    return () => clearTimeout(timeout);
  }, [currentMessageIndex]);

  return (
    <div className="overflow-hidden flex items-center">
      <div
        className="whitespace-nowrap animate-slide-in text-white text-xl px-4"
        key={messages[currentMessageIndex].id}
      >
        <span className="mr-4 text-sm text-gray-400">
          {/* {messages[currentMessageIndex].time} */}
        </span>
        <span className="mr-4 font-bold">
          {/* {messages[currentMessageIndex].userId} */}
        </span>
        <span className="text-success text-sm">
          {messages[currentMessageIndex].message}
        </span>
      </div>
    </div>
  );
};

export default SlidingMessages;
