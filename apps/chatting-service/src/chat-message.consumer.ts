import prisma from '@packages/libs/prisma';
import { incrementUnseenCount } from '@packages/libs/redis/message.redis';
import kafka from '@packages/utils/kafka';
import { Consumer, EachMessagePayload } from 'kafkajs';

interface BufferedMessage {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
}

const TOPIC = 'chat.new_message';
const GROUP_ID = 'chat-message-db-writer';
const BATCH_INTERVAL_MS = 3000;

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// Initialize kafka consumer
export async function startConsumer() {
  const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  console.log(`Kafka consumer connected and subscribed to ${TOPIC}`);

  // Start consuming
  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;

      try {
        const parsed: BufferedMessage = JSON.parse(message.value.toString());
        buffer.push(parsed);

        // If this is the first message in an empty array then start the timer
        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDB, BATCH_INTERVAL_MS);
        }
      } catch (error) {
        console.error(`Failed to parse kafka message: ${error}`);
      }
    },
  });
}

// Flush the buffer to the database and reset the timer
async function flushBufferToDB() {
  const toInsert = buffer.splice(0, buffer.length);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (toInsert.length === 0) return;

  try {
    const prismaPayload = toInsert.map((message) => ({
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderType: message.senderType,
      content: message.content,
      createdAt: new Date(message.createdAt),
    }));

    await prisma.messages.createMany({ data: prismaPayload });

    // Redis unseen counter (only if DB insert was successful)
    for (const message of prismaPayload) {
      const receiverType = message.senderType === 'user' ? 'seller' : 'user';
      await incrementUnseenCount(receiverType, message.conversationId);
    }
    console.log(`Flushed ${prismaPayload.length} to DB and redis`);
  } catch (error) {
    console.error(`Error inserting message to DB ${error}`);
    buffer.unshift(...toInsert);
    if (!flushTimer) {
      flushTimer = setTimeout(flushBufferToDB, BATCH_INTERVAL_MS);
    }
  }
}

