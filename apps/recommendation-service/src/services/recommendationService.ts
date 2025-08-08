import * as tf from '@tensorflow/tfjs-node';

import { products } from '@prisma/client';
import { fetchUserActivity } from './fetchUserActivity';
import { preProcessData } from '../utils/preProcessData';

const EMBEDDING_DM = 50;

interface UserAction {
  userId: string;
  productId: string;
  actionType: 'product_view' | 'add_to_cart' | 'add_to_wishlist' | 'purchase';
}

interface Interaction {
  userId: string;
  productId: string;
  actionType: UserAction['actionType'];
}

interface RecommendedProduct {
  productId: string;
  score: number;
}

async function fetchActivity(userId: string): Promise<UserAction[]> {
  const userActions = await fetchUserActivity(userId);

  return Array.isArray(userActions)
    ? (userActions as unknown as UserAction[])
    : [];
}

export const recommendProducts = async (
  userId: string,
  allProducts: products[]
): Promise<string[]> => {
  const userActions: UserAction[] = await fetchActivity(userId);
  if (userActions.length === 0) return [];

  const processedData = preProcessData(userActions, allProducts);

  if (!processedData || !processedData.interactions || !processedData.products)
    return [];

  const { interactions } = processedData as { interactions: Interaction[] };

  const userMap: Record<string, number> = {};
  const productMap: Record<string, number> = {};
  let userCount = 0,
    productCount = 0;

  interactions.forEach(({ userId, productId }) => {
    if (!(userId in userMap)) {
      userMap[userId] = userCount++;
    }
    if (!(productId in productMap)) {
      productMap[productId] = productCount++;
    }
  });

  // Define model input layers
  const userInput = tf.input({
    shape: [1],
    dtype: 'int32',
  }) as tf.SymbolicTensor;

  const productInput = tf.input({
    shape: [1],
    dtype: 'int32',
  }) as tf.SymbolicTensor;

  // Create embedding layer (like lookup tables) to learn the relationships
  const userEmbedding = tf.layers
    .embedding({
      inputDim: userCount,
      outputDim: EMBEDDING_DM,
    })
    .apply(userInput) as tf.SymbolicTensor;

  const productEmbedding = tf.layers
    .embedding({
      inputDim: productCount,
      outputDim: EMBEDDING_DM,
    })
    .apply(productInput) as tf.SymbolicTensor;

  // Flatten the 2D embeddings into 1D feature vectors;
  const userVector = tf.layers
    .flatten()
    .apply(userEmbedding) as tf.SymbolicTensor;
  const productVector = tf.layers.flatten.apply(
    productEmbedding
  ) as tf.SymbolicTensor;

  // Dot product combines user and product vectors (user-product affinity)
  const merged = tf.layers
    .dot({ axes: 1 })
    .apply([userVector, productVector]) as tf.SymbolicTensor;

  // Final layer: outputs probability of interaction
  const output = tf.layers
    .dense({ units: 1, activation: 'sigmoid' })
    .apply(merged) as tf.SymbolicTensor;

  // Compile the recommendation model
  const model = tf.model({
    inputs: [userInput, productInput],
    outputs: output,
  });

  model.compile({
    optimizer: tf.train.adam(),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  // Convert user and product interactions into tensors from training
  const userTensor = tf.tensor1d(
    interactions.map((d) => userMap[d.userId] ?? 0),
    'int32'
  );
  const productTensor = tf.tensor1d(
    interactions.map((d) => productMap[d.productId] ?? 0),
    'int32'
  );

  const weightLabels = tf.tensor2d(
    interactions.map((d) => {
      switch (d.actionType) {
        case 'purchase':
          return [1.0];
        case 'add_to_cart':
          return [0.7];
        case 'add_to_wishlist':
          return [0.5];
        case 'product_view':
          return [0.1];
        default:
          return [0];
      }
    }),
    [interactions.length, 1]
  );

  await model.fit([userTensor, productTensor], weightLabels, {
    epochs: 5,
    batchSize: 32,
  });

  const productTensorAll = tf.tensor1d(Object.values(productMap), 'int32');

  const predictions = model.predict([
    tf.tensor1d([userMap[userId] ?? 0], 'int32'),
    productTensorAll,
  ]) as tf.Tensor;

  const scores = (await predictions.array()) as number[];

  // Sort and select top 10 recommended products based on score
  const recommendedProducts: RecommendedProduct[] = Object.keys(productMap)
    .map((productId, index) => ({
      productId,
      score: scores[index] ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return recommendedProducts.map((p) => p.productId);
};
