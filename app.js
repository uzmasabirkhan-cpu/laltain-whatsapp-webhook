// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', async (req, res) => {

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // Safely get the incoming WhatsApp message
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  // Ignore webhook events that do not contain a customer message
  if (!message) {
    console.log('No customer message in this webhook.');
    return res.status(200).end();
  }

  // Get customer message and number
  const customerMessage = message?.text?.body?.toLowerCase().trim();
  const customerNumber = message?.from;

  console.log('Customer message:', customerMessage);
  console.log('Customer number:', customerNumber);

  // Default reply
  let reply = "Hello! Thank you for contacting Laltain Studio.";

  // Pricing response
  if (
    customerMessage === "2" ||
    customerMessage.includes("price") ||
    customerMessage.includes("pricing")
  ) {
    reply = `Single-Camera Setup — PKR 6,000/hour
Two-Camera Setup — PKR 8,000/hour
Three-Camera Setup — PKR 10,000/hour

5+ Hours — 10% OFF
10+ Hours — 20% OFF

Discount is available on advance bookings.`;
  }

  // Send reply through WhatsApp Cloud API
  const response = await fetch(
    `https://graph.facebook.com/v26.0/1265929269945988/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: customerNumber,
        type: "text",
        text: {
          body: reply
        }
      })
    }
  );

  console.log("Meta response status:", response.status);
  console.log("Meta response:", await response.text());

  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
