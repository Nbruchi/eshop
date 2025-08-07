import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.siteConfig.findFirst();

    if (!existingConfig) {
      await prisma.siteConfig.create({
        data: {
          categories: [
            'Electronics',
            'Fashion',
            'Home & Kitchen',
            'Beauty & Personal Care',
            'Sports & Outdoors',
            'Toys & Games',
            'Health & Wellness',
            'Automotive',
            'Books & Media',
            'Other',
          ],
          subCategories: JSON.stringify({
            Electronics: [
              'Mobile Phones',
              'Laptops',
              'Tablets',
              'Smart Home',
              'Gaming',
              'Audio',
              'Cameras',
              'Other',
            ],
            Fashion: [
              "Men's Clothing",
              "Women's Clothing",
              "Kids' Clothing",
              'Shoes',
              'Bags',
              'Jewelry',
              'Accessories',
              'Other',
            ],
            'Home & Kitchen': [
              'Furniture',
              'Home Decor',
              'Kitchen Appliances',
              'Cleaning Supplies',
              'Other',
            ],
            'Beauty & Personal Care': [
              'Skincare',
              'Makeup',
              'Hair Care',
              'Personal Care',
              'Other',
            ],
            'Sports & Outdoors': [
              'Sports Equipment',
              'Outdoor Gear',
              'Fitness',
              'Other',
            ],
            'Toys & Games': ['Toys', 'Board Games', 'Puzzles', 'Other'],
            'Health & Wellness': [
              'Vitamins & Supplements',
              'Health Care',
              'Other',
            ],
            Automotive: ['Car Parts', 'Accessories', 'Other'],
            'Books & Media': ['Books', 'Magazines', 'Newspapers', 'Other'],
            Other: ['Other'],
            logo: '',
            banner: '',
          }),
        },
      });
    }
  } catch (error) {
    console.error('Error initializing site config:', error);
  }
};

export default initializeSiteConfig;
