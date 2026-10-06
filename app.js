```js
// Import Express.js
const express = require("express");

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Port and verification token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// WhatsApp Phone Number ID
const phoneNumberId = "1265929269945988";


// =====================================
// BOOKING STATE
// =====================================

const bookingState = {};


// =====================================
// CAMERA PRICE
// =====================================

function getCameraPrice(cameras) {

  if (cameras === 1) {
    return 6000;
  }

  if (cameras === 2) {
    return 8000;
  }

  if (cameras === 3) {
    return 10000;
  }

  if (cameras === 4) {
    return 5000;
  }

  return 0;
}


// =====================================
// FINAL COST CALCULATION
// =====================================

function calculateFinalCost(hours, cameras) {

  let price = getCameraPrice(cameras);
  let cost = hours * price;
  let finalCost;

  if (hours >= 10) {

    let discount = (cost * 20) / 100;
    finalCost = cost - discount;

  }

  else if (hours >= 5) {

    let discount = (cost * 10) / 100;
    finalCost = cost - discount;

  }

  else {

    finalCost = cost;

  }

  return finalCost;
}


// =====================================
// GET - WEBHOOK VERIFICATION
// =====================================

app.get("/", (req, res) => {

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode === "subscribe" && token === verifyToken) {

    console.log("WEBHOOK VERIFIED");

    return res.status(200).send(challenge);
  }

  return res.status(403).end();
});


// =====================================
// POST - RECEIVE WHATSAPP MESSAGE
// =====================================

app.post("/", async (req, res) => {

  try {

    console.log("\n========== WEBHOOK RECEIVED ==========");

    console.log(
      JSON.stringify(req.body, null, 2)
    );


    // ---------------------------------
    // Get incoming message
    // ---------------------------------

    const message =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];


    if (!message) {

      console.log("No customer message found.");

      return res.status(200).end();
    }


    // ---------------------------------
    // Only process text messages
    // ---------------------------------

    if (message.type !== "text") {

      console.log("Message is not text.");

      return res.status(200).end();
    }


    // ---------------------------------
    // Get customer message
    // ---------------------------------

    const customerMessage =
      message.text?.body?.toLowerCase().trim();

    const customerNumber =
      message.from;


    if (!customerMessage || !customerNumber) {

      console.log("Message or customer number missing.");

      return res.status(200).end();
    }


    console.log(
      "Customer message:",
      customerMessage
    );

    console.log(
      "Customer number:",
      customerNumber
    );


    // =================================
    // WELCOME MENU
    // =================================

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


    // =================================
    // DEFAULT REPLY
    // =================================

    let reply = welcomeMessage;


    // =================================
    // BYE
    // =================================

    if (
      customerMessage === "bye" ||
      customerMessage === "goodbye"
    ) {

      delete bookingState[customerNumber];

      reply = `Thank you for contacting Laltain Studio! 🎬

We hope to see you soon.

Have a great day! 👋`;
    }


    // =================================
    // START NEW BOOKING
    // =================================

    else if (
      !bookingState[customerNumber] &&
      (
        customerMessage === "8" ||
        customerMessage === "book" ||
        customerMessage === "booking"
      )
    ) {

      bookingState[customerNumber] = {

        step: "package",

        cameras: null,

        packageName: "",

        date: "",

        time: "",

        hours: null,

        name: "",

        finalCost: null

      };


      reply = `📅 Book Studio

Great! Let's book your studio.

Please choose a package:

1️⃣ Single Camera — PKR 6,000/hour
2️⃣ Two Cameras — PKR 8,000/hour
3️⃣ Three Cameras — PKR 10,000/hour
4️⃣ Studio Space Only — PKR 5,000/hour`;

    }


    // =================================
    // EXISTING BOOKING FLOW
    // =================================

    else if (bookingState[customerNumber]) {

      const booking =
        bookingState[customerNumber];


      // ---------------------------------
      // STEP 1 - PACKAGE
      // ---------------------------------

      if (booking.step === "package") {

        if (customerMessage === "1") {

          booking.cameras = 1;
          booking.packageName = "Single Camera";
          booking.step = "date";

          reply = `🎥 Single Camera selected.

Please enter your booking date.

Example:
10 October 2026`;

        }

        else if (customerMessage === "2") {

          booking.cameras = 2;
          booking.packageName = "Two Cameras";
          booking.step = "date";

          reply = `🎥 Two Cameras selected.

Please enter your booking date.

Example:
10 October 2026`;

        }

        else if (customerMessage === "3") {

          booking.cameras = 3;
          booking.packageName = "Three Cameras";
          booking.step = "date";

          reply = `🎥 Three Cameras selected.

Please enter your booking date.

Example:
10 October 2026`;

        }

        else if (customerMessage === "4") {

          booking.cameras = 4;
          booking.packageName = "Studio Space Only";
          booking.step = "date";

          reply = `🎬 Studio Space Only selected.

Please enter your booking date.

Example:
10 October 2026`;

        }

        else {

          reply = `Please choose a valid package:

1️⃣ Single Camera — PKR 6,000/hour
2️⃣ Two Cameras — PKR 8,000/hour
3️⃣ Three Cameras — PKR 10,000/hour
4️⃣ Studio Space Only — PKR 5,000/hour`;

        }

      }


      // ---------------------------------
      // STEP 2 - DATE
      // ---------------------------------

      else if (booking.step === "date") {

        booking.date = customerMessage;
        booking.step = "time";

        reply = `📅 Date received: ${customerMessage}

Now please enter your starting time.

Example:
4 PM`;

      }


      // ---------------------------------
      // STEP 3 - TIME
      // ---------------------------------

      else if (booking.step === "time") {

        booking.time = customerMessage;
        booking.step = "hours";

        reply = `🕐 Starting time received: ${customerMessage}

How many hours would you like to book?

Example:
3`;

      }


      // ---------------------------------
      // STEP 4 - HOURS
      // ---------------------------------

      else if (booking.step === "hours") {

        const hours = Number(customerMessage);


        if (
          !Number.isFinite(hours) ||
          hours <= 0
        ) {

          reply = `Please enter a valid number of hours.

Example:
3`;

        }

        else {

          booking.hours = hours;
          booking.step = "name";

          reply = `⏰ ${hours} hour(s) selected.

Finally, please enter your name.`;

        }

      }


      // ---------------------------------
      // STEP 5 - NAME
      // ---------------------------------

      else if (booking.step === "name") {

        booking.name = customerMessage;


        const finalCost =
          calculateFinalCost(
            booking.hours,
            booking.cameras
          );


        booking.finalCost = finalCost;


        const originalCost =
          booking.hours *
          getCameraPrice(booking.cameras);


        const discount =
          originalCost - finalCost;


        reply = `✅ Booking Request Received!

🎬 Laltain Studio

👤 Name: ${booking.name}
📅 Date: ${booking.date}
🕐 Time: ${booking.time}
⏰ Hours: ${booking.hours}
🎥 Package: ${booking.packageName}

💰 Original Cost: PKR ${originalCost.toLocaleString()}
🎁 Discount: PKR ${discount.toLocaleString()}
💵 Final Cost: PKR ${finalCost.toLocaleString()}

Thank you for choosing Laltain Studio! 🎬

Our team will contact you to confirm availability and finalize your booking.`;


        console.log(
          "BOOKING:",
          JSON.stringify(
            booking,
            null,
            2
          )
        );


        // Clear booking state
        delete bookingState[customerNumber];

      }

    }


    // =================================
    // HI / HELLO
    // =================================

    else if (
      customerMessage === "hi" ||
      customerMessage === "hello" ||
      customerMessage === "hey"
    ) {

      reply = welcomeMessage;
    }


    // =================================
    // OPTION 1 - PODCAST PACKAGES
    // =================================

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


    // =================================
    // OPTION 2 - PRICING
    // =================================

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


    // =================================
    // OPTION 3 - EQUIPMENT
    // =================================

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


    // =================================
    // OPTION 4 - BACKGROUNDS
    // =================================

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


    // =================================
    // OPTION 5 - LOCATION
    // =================================

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


    // =================================
    // OPTION 6 - VISITING HOURS
    // =================================

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


    // =================================
    // OPTION 7 - EDITING PLANS
    // =================================

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


    // =================================
    // OPTION 9 - WHAT'S INCLUDED
    // =================================

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


    // =================================
    // SEND REPLY TO WHATSAPP
    // =================================

    console.log("Sending reply to WhatsApp...");


    const response = await fetch(
      `https://graph.facebook.com/v26.0/${phoneNumberId}/messages`,
      {
        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${process.env.WHATSAPP_TOKEN)}`

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


    // ---------------------------------
    // Read Meta response
    // ---------------------------------

    const metaResponse =
      await response.text();


    console.log(
      "Meta response status:",
      response.status
    );

    console.log(
      "Meta response:",
      metaResponse
    );


    // ---------------------------------
    // Check Meta response
    // ---------------------------------

    if (!response.ok) {

      console.error(
        "WHATSAPP API ERROR:",
        metaResponse
      );

    }


    // Always acknowledge webhook
    return res.status(200).end();


  }

  catch (error) {

    console.error(
      "WEBHOOK ERROR:",
      error
    );

    return res.status(200).end();

  }

});


// =====================================
// START SERVER
// =====================================

app.listen(port, () => {

  console.log(
    `\nListening on port ${port}\n`
  );

});
```
