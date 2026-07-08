const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const { productsData } = require('./seedProducts');

async function main() {
  console.log('Seeding database...');

  // 1. Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      fullName: 'Demo Admin',
      phone: '0987654321',
      address: '456 Admin St',
      role: 'admin',
    },
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPasswordHash,
      fullName: 'Demo Admin',
      phone: '0987654321',
      address: '456 Admin St',
      role: 'admin',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      username: 'customer',
      passwordHash: customerPasswordHash,
      fullName: 'Demo Customer',
      phone: '0123456789',
      address: '123 Customer St',
      role: 'customer',
    },
    create: {
      email: 'customer@example.com',
      username: 'customer',
      passwordHash: customerPasswordHash,
      fullName: 'Demo Customer',
      phone: '0123456789',
      address: '123 Customer St',
      role: 'customer',
    },
  });

  console.log('Users seeded successfully:', {
    admin: adminUser.email,
    customer: customerUser.email,
  });

  // 2. Create Categories
  const categoriesData = [
    { name: 'Smartphones', description: 'Latest mobile devices and smartphones' },
    { name: 'Laptops', description: 'High-performance laptops for work and play' },
    { name: 'Smartwatches', description: 'Modern smartwatches and fitness trackers' },
    { name: 'Accessories', description: 'Essential electronics accessories' },
  ];

  const seededCategories = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: { name: cat.name, description: cat.description },
    });
    seededCategories[cat.name] = category.id;
  }
  console.log('Categories seeded successfully:', Object.keys(seededCategories));

  // 3. Create Products
  for (const prod of productsData) {
    const categoryId = seededCategories[prod.categoryName];
    if (!categoryId) continue;

    // Idempotent product seeding: find by name & brand, then update or create
    const existingProduct = await prisma.product.findFirst({
      where: { name: prod.name, brand: prod.brand },
    });

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          description: prod.description,
          price: prod.price,
          quantity: prod.quantity,
          imageUrl: prod.imageUrl,
          categoryId: categoryId,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: prod.name,
          brand: prod.brand,
          description: prod.description,
          price: prod.price,
          quantity: prod.quantity,
          imageUrl: prod.imageUrl,
          categoryId: categoryId,
        },
      });
    }
  }

  console.log('Products seeded successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
