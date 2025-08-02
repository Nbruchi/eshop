import { Kafka } from 'kafkajs';

const username = process.env.KAFKA_API_KEY;
const password = process.env.KAFKA_API_SECRET;

if (!username || !password) {
  throw new Error(
    'KAFKA_API_KEY and KAFKA_API_SECRET must be set in environment variables'
  );
}

const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers: [process.env.KAFKA_BROCKER!],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username,
    password,
  },
});

export default kafka;
