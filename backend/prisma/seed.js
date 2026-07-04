const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

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
  const productsData = [
    {
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      description: 'Titanium design, A17 Pro chip, 48MP Main camera, and USB-C.',
      price: 999.00,
      quantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
      categoryName: 'Smartphones',
    },
    {
      name: 'Galaxy S24 Ultra',
      brand: 'Samsung',
      description: 'Galaxy AI is here. 200MP camera, Snapdragon 8 Gen 3.',
      price: 1199.00,
      quantity: 40,
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
      categoryName: 'Smartphones',
    },
    {
      name: 'MacBook Pro 16 M3',
      brand: 'Apple',
      description: 'M3 Max chip, 36GB unified memory, 1TB SSD, 16-inch Liquid Retina XDR display.',
      price: 2499.00,
      quantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      categoryName: 'Laptops',
    },
    {
      name: 'ROG Zephyrus G14',
      brand: 'ASUS',
      description: 'AMD Ryzen 9, RTX 4070, 16GB DDR5, 1TB SSD, 120Hz OLED.',
      price: 1599.00,
      quantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
      categoryName: 'Laptops',
    },
    {
      name: 'Apple Watch Ultra 2',
      brand: 'Apple',
      description: 'Rugged titanium case, dual-frequency GPS, up to 36-hour battery life.',
      price: 799.00,
      quantity: 30,
      imageUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
      categoryName: 'Smartwatches',
    },
    {
      name: 'Galaxy Watch 6 Classic',
      brand: 'Samsung',
      description: 'Rotating bezel, personalized heart rate zones, sleep coaching.',
      price: 399.00,
      quantity: 35,
      imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500',
      categoryName: 'Smartwatches',
    },
  ];

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
