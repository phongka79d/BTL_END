const app = require('./app');
const http = require('http');

async function runTest() {
  const server = http.createServer(app);
  
  // Lắng nghe trên một cổng ngẫu nhiên/còn trống
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Kiểm tra GET /api/cart (phải từ chối yêu cầu ẩn danh với 401)
    const resGet = await fetch(`http://localhost:${port}/api/cart`);
    console.log(`GET /api/cart status: ${resGet.status}`);
    const dataGet = await resGet.json();
    console.log('GET /api/cart body:', dataGet);
    if (resGet.status !== 401) {
      throw new Error(`Expected status 401 for anonymous GET /api/cart, got ${resGet.status}`);
    }

    // 2. Kiểm tra POST /api/cart/items (phải từ chối yêu cầu ẩn danh với 401)
    const resPost = await fetch(`http://localhost:${port}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'some-id', quantity: 1 })
    });
    console.log(`POST /api/cart/items status: ${resPost.status}`);
    const dataPost = await resPost.json();
    console.log('POST /api/cart/items body:', dataPost);
    if (resPost.status !== 401) {
      throw new Error(`Expected status 401 for anonymous POST /api/cart/items, got ${resPost.status}`);
    }

    // 3. Kiểm tra PUT /api/cart/items/some-id (phải từ chối yêu cầu ẩn danh với 401)
    const resPut = await fetch(`http://localhost:${port}/api/cart/items/some-id`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 2 })
    });
    console.log(`PUT /api/cart/items/some-id status: ${resPut.status}`);
    const dataPut = await resPut.json();
    console.log('PUT /api/cart/items/some-id body:', dataPut);
    if (resPut.status !== 401) {
      throw new Error(`Expected status 401 for anonymous PUT /api/cart/items/some-id, got ${resPut.status}`);
    }

    // 4. Kiểm tra DELETE /api/cart/items/some-id (phải từ chối yêu cầu ẩn danh với 401)
    const resDelete = await fetch(`http://localhost:${port}/api/cart/items/some-id`, {
      method: 'DELETE'
    });
    console.log(`DELETE /api/cart/items/some-id status: ${resDelete.status}`);
    const dataDelete = await resDelete.json();
    console.log('DELETE /api/cart/items/some-id body:', dataDelete);
    if (resDelete.status !== 401) {
      throw new Error(`Expected status 401 for anonymous DELETE /api/cart/items/some-id, got ${resDelete.status}`);
    }

    console.log('All anonymous access protection tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTest();
