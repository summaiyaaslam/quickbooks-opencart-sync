import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

// fetch product
const products = JSON.parse(fs.readFileSync("./products.json", "utf-8"));

// failure log 
const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}


  //  LOGGER FUNCTION (BONUS 1)

function logApiFailure({ attempt, payload, error }) {
  const logFile = path.join(logDir, "api-failures.log");

  const logEntry = {
    timestamp: new Date().toISOString(),
    attempt,
    payload,
    error: error?.message || error
  };

  fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");
}


  //  GROUP ITEMS (BONUS 2)

function groupItemsByType(items) {
  return items.reduce((acc, item) => {
    const type = item.type || "Unknown";

    if (!acc[type]) {
      acc[type] = {
        items: [],
        totalQty: 0
      };
    }

    acc[type].items.push(item);
    acc[type].totalQty += item.qty;

    return acc;
  }, {});
}

// App CHECK

app.get("/", (req, res) => {
  res.send("QuickBooks → OpenCart Sync Service Running");
});

// Get Product 
app.get("/products", (req, res) => {
  res.json({
    status: "success",
    count: products.length,
    products
  });
});


// VALIDATE ORDER

app.post("/validate-order", (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      status: "error",
      message: "Items array is required"
    });
  }

  // Step 1: check stock (NO CHANGE)
  for (let item of items) {
    const product = products.find(p => p.sku === item.sku);

    if (!product) {
      return res.json({
        status: "error",
        message: `SKU ${item.sku} not found`
      });
    }
     // NEW CONDITION
  if (product.qty === 0) {
    return res.json({
      status: "error",
      message: `Item ${item.sku} is out of stock`
    });
  }

    if (item.qty > product.qty) {
      return res.json({
        status: "error",
        message: `Insufficient stock for ${item.sku}. Available: ${product.qty}`
      });
    }
  }
 
  //  REMOVE WRONG  1 STEP  COMPLETELY
// Step 3: final verification
// for (let item of items) {
//   const product = products.find(p => p.sku === item.sku);

//   if (item.qty > product.qty) {
//     return res.json({
//       status: "error",
//       message: "Stock changed due to another order",
//       conflict: {
//         sku: item.sku,
//         available_now: product.qty
//       }
//     });
//   }
// }
  // Step 2: deduct stock AFTER validation
  for (let item of items) {
    const product = products.find(p => p.sku === item.sku);
    product.qty -= item.qty;
  }

  // BONUS 2: Group items
  const groupedItems = groupItemsByType(items);

  res.json({
    status: "success",
    message: "Order validated successfully",
    items,
    groupedItems
  });
});


  //  MOCK OPEN CART SUBMIT

async function submitToOpenCart(payload, attempt = 1) {
  const success = Math.random() > 0.5;

  if (success) {
    return {
      status: "success",
      orderId: "ORD-" + Math.floor(Math.random() * 1000),
      attempt
    };
  }

  // Log failure (BONUS 1)
  logApiFailure({
    attempt,
    payload,
    error: "Mock OpenCart failure"
  });

  if (attempt < 2) {
    await new Promise(r => setTimeout(r, 1000));
    return submitToOpenCart(payload, attempt + 1);
  }

  return {
    status: "error",
    message: "Failed after 2 attempts",
    attempt
  };
}


  //  SUBMIT ORDER

app.post("/submit-order", async (req, res) => {
  try {
    const result = await submitToOpenCart(req.body);

    if (result.status === "success") {
      return res.json(result);
    }

    return res.status(500).json(result);
  } catch (err) {
    //  Log unexpected error
    logApiFailure({
      attempt: "unknown",
      payload: req.body,
      error: err
    });

    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: err.message
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});