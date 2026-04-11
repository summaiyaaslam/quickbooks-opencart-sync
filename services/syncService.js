/**
 * syncService.js
 * Mock QuickBooks → OpenCart Sync Service
 */

import fs from "fs";

/* -----------------------------
   LOAD MOCK PRODUCTS (optional helper)
------------------------------ */
export function loadProducts() {
  const data = fs.readFileSync("./products.json", "utf-8");
  return JSON.parse(data);
}

/* -----------------------------
   SIMULATED QUICKBOOKS FETCH
------------------------------ */
export async function fetchFromQuickBooks() {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 500));

  // Mock response (like QuickBooks inventory)
  return [
    { sku: "SKU-1", qty: 10 },
    { sku: "SKU-2", qty: 5 },
    { sku: "SKU-3", qty: 20 }
  ];
}


//    SIMULATED OPENCART SYNC API

export async function pushToOpenCart(product, attempt = 1) {
  console.log(`Syncing SKU ${product.sku}, attempt ${attempt}`);

  // simulate success/failure randomly
  const success = Math.random() > 0.4;

  if (success) {
    return {
      status: "success",
      sku: product.sku,
      updatedQty: product.qty,
      attempt
    };
  }

  // retry logic (max 2 attempts)
  if (attempt < 2) {
    await new Promise((r) => setTimeout(r, 1000));
    return pushToOpenCart(product, attempt + 1);
  }

  return {
    status: "error",
    sku: product.sku,
    message: "Failed to sync after 2 attempts",
    attempt
  };
}


//    MAIN SYNC FUNCTION

export async function syncProducts() {
  try {
    console.log("Starting QuickBooks → OpenCart Sync...");

    const qbProducts = await fetchFromQuickBooks();

    const results = [];

    for (const product of qbProducts) {
      const result = await pushToOpenCart(product);
      results.push(result);
    }

    const summary = {
      status: "completed",
      total: qbProducts.length,
      success: results.filter(r => r.status === "success").length,
      failed: results.filter(r => r.status === "error").length,
      results
    };

    console.log("Sync Completed:", summary);

    return summary;
  } catch (err) {
    console.error("Sync Error:", err);

    return {
      status: "error",
      message: err.message
    };
  }
}