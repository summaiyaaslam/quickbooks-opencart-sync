------------------------------PROJECT FEATURES
Fetch Products
Loads products from products.json
Provides GET /products endpoint
Validate Orders
Checks SKU existence
Verifies available stock
Simulates stock deduction (race condition)
Re-validates after deduction
Groups ordered items by type (Bonus 2)
Submit Orders
Simulates OpenCart API call
Random 50% success chance
Retries once after 1 second
Logs failures to logs/api-failures.log (Bonus 1)
API Failure Logging (Bonus 1)
Each failure includes timestamp, attempt number, payload, and error message.
Group Items by Type (Bonus 2)
Groups items into categories such as Inventory or Service.
---------------------------------------PROJECT STRUCTURE

index.js
products.json
logs/
api-failures.log (auto-created)
.env (optional)
package.json
README.txt (this file)

-----------------------------------INSTALLATION & SETUP
Install dependencies:
npm install
Optional: Create .env file:
PORT=3000
Start the server:
npm start

Server runs at:
http://localhost:3000

----------------------------------------AVAILABLE API ENDPOINTS
GET /
Health check endpoint.
Returns: "QuickBooks → OpenCart Sync Service Running"
GET /products
Returns all mock products.

POST /validate-order
Validates items passed in request body.
Checks stock → simulates race condition → verifies again.
Also groups items by type (Bonus 2).

Example Request:
{
"items": [
{ "sku": "ITEM-001", "qty": 5 },
{ "sku": "ITEM-004", "qty": 2 }
]
}

POST /submit-order
Attempts to submit an order to a mocked OpenCart API.
50% random failure chance.
Retries once after 1 second.
Logs failures into logs/api-failures.log (Bonus 1).