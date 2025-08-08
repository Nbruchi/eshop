import kafka from '../kafka';

const producer = kafka.producer();

type LogType = {
  type?: 'info' | 'error' | 'warning' | 'success' | 'debug';
  message: string;
  source?: string;
};

export async function sendLog({
  type = 'info',
  message,
  source = 'unknown-service',
}: LogType) {
  const logPayload = {
    type,
    message,
    timestamp: new Date().toISOString(),
    source,
  };

  await producer.connect();
  await producer.send({
    topic: 'logs',
    messages: [{ value: JSON.stringify(logPayload) }],
  });
  await producer.disconnect();
}
