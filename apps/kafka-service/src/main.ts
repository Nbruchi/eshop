import { kafka } from '@packages/utils/kafka';
import { updateUserAnalytics } from './services/analytics.service';

const consumer = kafka.consumer({ groupId: 'user-events-group' });

const eventsQueue = [];

const processQueue = async () => {
  if (eventsQueue.length === 0) return;
  const events = [...eventsQueue];
  eventsQueue.length = 0;
  for (const event of events) {
    if (event.action === 'shop_visit') {
      // update shop analytics
    }

    const validActions = [
      'add_to_wishlist',
      'add_to_cart',
      'product_view',
      'purchase',
      'remove_from_cart',
      'remove_from_wishlist',
    ];

    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log(`Error processing event: ${error}`);
    }
  }
};

setInterval(processQueue, 3000);

// Kafka consumer for user events
export const consumeKafkaMessages = async () => {
  // Connect to the kafka broker
  await consumer.connect();
  await consumer.subscribe({ topic: 'users-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());
      eventsQueue.push(event);
    },
  });
};

consumeKafkaMessages().catch(console.error);
