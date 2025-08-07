import kafka from '@packages/utils/kafka';
import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import redis from '@packages/libs/redis';

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  await producer.connect();
  console.log('Kafka producer connected');

  wss.on('connection', (ws: WebSocket) => {
    console.log('New websocket connection');

    let registeredUserId: string | null = null;

    wss.on('message', async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();

        // Regiser the user on first plain message (non-JSON)
        if (!registeredUserId && !messageStr.startsWith('{')) {
          registeredUserId = messageStr;
          connectedUsers.set(registeredUserId, ws);
          console.log(`Registered websocket for userId ${registeredUserId}`);

          const isSeller = registeredUserId.startsWith('seller_');
          const redisKey = isSeller
            ? `online:seller:${registeredUserId.replace('seller_', '')}`
            : `online:user:${registeredUserId}`;
          await redis.set(redisKey, '1');
          await redis.expire(redisKey, 300);
          return;
        }

        //   Process JSON message
        const data: IncomingMessage = JSON.parse(messageStr);

        //   If it's seen, update
        if (data.type === 'MARK_AS_SEEN' && registeredUserId) {
          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unseenCounts.set(seenKey, 0);
          return;
        }

        //   Regular message
        const {
          fromUserId,
          toUserId,
          messageBody,
          conversationId,
          senderType,
        } = data;

        if (!data || !toUserId || !conversationId || !messageBody) {
          console.warn(`Invalid message format: ${data}`);
          return;
        }

        const now = new Date().toISOString();

        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: 'NEW_MESSAGE',
          payload: messagePayload,
        });

        const receiverKey =
          senderType === 'user' ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === 'user' ? `user_${fromUserId}` : `seller_${fromUserId}`;

        //   Update unseen count dynamically
        const unseenKey = `${receiverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        //   Send new message to receiver
        const receiverSocket = connectedUsers.get(receiverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);

          //   Also notify unseen count
          receiverSocket.send(
            JSON.stringify({
              type: 'UNSEEN_COUNT_UPDATE',
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            })
          );
          console.log(`Delivered message and unseen count to ${receiverKey}`);
        } else {
          console.log(`User ${receiverKey} is offline. Message queued!`);
        }

        //   Echo to sender
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message to sender ${senderKey}`);
        }

        //   Push to kafka consumer
        await producer.send({
          topic: 'chat.new_message',
          messages: [
            {
              key: conversationId,
              value: JSON.stringify(messagePayload),
            },
          ],
        });
        console.log(`Message queued to kafka: ${conversationId}`);
      } catch (error) {
        console.error(`Error processing websocket message: ${error}`);
      }
    });

    wss.on('close', async () => {
      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);
        console.log(`Disconnected user ${registeredUserId}`);
        const isSeller = registeredUserId.startsWith('seller_');
        const redisKey = isSeller
          ? `online:seller:${registeredUserId.replace('seller_', '')}`
          : `online:user:${registeredUserId}`;
        await redis.del(redisKey);
      }
    });

    wss.on('error', (error) => {
      console.error(`Websocket Error: ${error}`);
    });
  });
  console.log('Websocket server ready!');
}
