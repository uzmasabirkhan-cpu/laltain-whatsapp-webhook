// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;


// ==============================
// GET ROUTE - WEBHOOK VERIFICATION
// ==============================

app.get('/', (req, res) => {

  const {
    'hub.mode': mode,
    'hub.challenge': challenge,
    'hub.verify_token': token
  } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});


// ==============================
// POST ROUTE - WHATSAPP MESSAGES
// ==============================

app.post('/', async (req, res) => {

  const timestamp = new Date()
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19);

  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));


  // Safely get incoming WhatsApp message
  const message =
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];


  // Ignore webhook events without customer message
  if (!message) {
    console.log('No customer message in this webhook.');
    return res.status(200).end();
  }


  // Get customer message and number
  const customerMessage =
    message?.text?.body?.toLowerCase().trim();

  const customerNumber = message?.from;


  // Ignore non-text messages
  if (!customerMessage) {
    console.log('Message is not text.');
    return res.status(200).end();
  }


  console.log('Customer message:', customerMessage);
  console.log('Customer number:', customerNumber);


  // ==============================
  // WELCOME MENU
  // ==============================

  const welcomeMessage = `🎬 Welcome to Laltain Studio!

Where Ideas Come to Life

Please choose an option:

1️⃣ Podcast Packages
2️⃣ Pricing & Discounts
3️⃣ Equipment
4️⃣ Backgrounds & Sets
5️⃣ Location
6️⃣ Visiting Hours
7️⃣ Editing Plans
8️⃣ Book Studio
9️⃣ What's Included

You can reply with a number or type your question.`;


  // ==============================
  // DEFAULT REPLY
  // ==============================

  let reply = welcomeMessage;


  // ==============================
  // HI / HELLO
  // ==============================

  if (
    customerMessage === "hi" ||
    customerMessage === "hello" ||
    customerMessage === "hey"
  ) {

    reply = welcomeMessage;

  }


  // ==============================
  // OPTION 1 - PODCAST PACKAGES
  // ==============================

  else if (
    customerMessage === "1" ||
    customerMessage.includes("podcast")
  ) {

    reply = `🎙️ Podcast Packages

Studio Space Only — PKR 5,000/hour

Podcast Package A
Studio Space + One Camera Setup
PKR 6,000/hour

Podcast Package B
Studio Space + Two Camera Setup
PKR 8,000/hour

Podcast Package C
Studio Space + Three Camera Setup
PKR 10,000/hour`;

  }


  // ==============================
  // OPTION 2 - PRICING & DISCOUNTS
  // ==============================

  else if (
    customerMessage === "2" ||
    customerMessage.includes("price") ||
    customerMessage.includes("pricing") ||
    customerMessage.includes("discount")
  ) {

    reply = `💰 Pricing & Discounts

Single-Camera Setup — PKR 6,000/hour
Two-Camera Setup — PKR 8,000/hour
Three-Camera Setup — PKR 10,000/hour

5+ Hours — 10% OFF
10+ Hours — 20% OFF

Discount is available on advance bookings.`;

  }


  // ==============================
  // OPTION 3 - EQUIPMENT
  // ==============================

  else if (
    customerMessage === "3" ||
    customerMessage.includes("equipment")
  ) {

    reply = `🎥 Equipment

Sony A7iv × 2
Sony 50mm × 2
Sigma 24mm
Gimbal RS4
Hollyland Cordless Mic
Rode Podmic

Amaran 100 × 2
Aperture Light 200 × 2
Dome
Balloon
LED Lights × 4
Texture Light × 2
Teleprompter`;

  }


  // ==============================
  // OPTION 4 - BACKGROUNDS & SETS
  // ==============================

  else if (
    customerMessage === "4" ||
    customerMessage.includes("background") ||
    customerMessage.includes("set")
  ) {

    reply = `🎬 Backgrounds & Sets

Laltain Studio offers multiple premium backgrounds and creative setups for:

• Podcasts
• Interviews
• Reels
• Brand Shoots
• Digital Content

Our studio has a variety of setups to match different content styles.`;

  }


  // ==============================
  // OPTION 5 - LOCATION
  // ==============================

  else if (
    customerMessage === "5" ||
    customerMessage.includes("location") ||
    customerMessage.includes("address")
  ) {

    reply = `📍 Studio Location

Ground Floor, E-16, Block-A
Gulshan-e-Jamal, Karachi

Opposite Millennium Mall
Stadium Road

Google Maps:
https://share.google/IgeLtLkcGx4FKHZkr`;

  }


  // ==============================
  // OPTION 6 - VISITING HOURS
  // ==============================

  else if (
    customerMessage === "6" ||
    customerMessage.includes("visiting") ||
    customerMessage.includes("hours")
  ) {

    reply = `🕒 Visiting Hours

11:00 AM – 11:00 PM

Please message us before visiting
to confirm availability.`;

  }


  // ==============================
  // OPTION 7 - EDITING PLANS
  // ==============================

  else if (
    customerMessage === "7" ||
    customerMessage.includes("editing") ||
    customerMessage.includes("edit")
  ) {

    reply = `🎞️ Editing Plans

1. Essential Podcast Edit — PKR 6,000

Up to 1-hour podcast
Audio & video sync
Smooth cuts & basic transitions
Podcast-ready export


2. Podcast + Social Plan — PKR 10,000

Up to 1 hour
Multi-camera editing
60-sec promo highlight
3 reels
Lower thirds, logo & light animations
Complete audio & video treatment


3. Complete Content Plan — PKR 15,000

Up to 1 hour
Everything in previous plan
Total 5 reels
1 custom ad-style promo reel
Advanced motion graphics
Custom thumbnail
Platform-optimized exports


Add-ons:

Additional Reel / Short Edit — PKR 2,500
Ad Reel — PKR 6,000
Teaser / Trailer Cuts — PKR 3,500
Strategy Support — PKR 3,000`;

  }


  // ==============================
  // OPTION 8 - BOOK STUDIO
  // ==============================

  else if (
    customerMessage === "8" ||
    customerMessage.includes("book") ||
    customerMessage.includes("booking")
  ) {

    reply = `📅 Book Studio

Great! Let's book your studio.

Booking process will be available shortly.

Please choose a package:
1. Single Camera
2. Two Cameras
3. Three Cameras
4. Studio Space Only`;

  }


  // ==============================
  // OPTION 9 - WHAT'S INCLUDED
  // ==============================

  else if (
    customerMessage === "9" ||
    customerMessage.includes("included")
  ) {

    reply = `✅ What's Included?

✓ Professional camera & recording setup
✓ Professional lighting
✓ Quality audio recording
✓ Fully air-conditioned studio
✓ Multiple premium backgrounds & setups
✓ Production assistance during your shoot`;

  }


  // ==============================
  // SEND REPLY THROUGH WHATSAPP
  // ==============================

  const response = await fetch(
    `https://graph.facebook.com/v26.0/1265929269945988/messages`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization":
          `Bearer ${process.env.WHATSAPP_TOKEN}`
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


// ==============================
// START SERVER
// ==============================

app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
