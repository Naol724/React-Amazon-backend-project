const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Stripe initialization
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors({ origin: true }));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.status(200).json({ 
        message: "success!" });
});

app.post("/payments/create", async (req, res) => {
    const total = req.query.total;
if (total > 0) {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "usd",
    });

    res.status(201).json({
        clientSecret: paymentIntent.client_secret,
    });
}   else {
    res.status(403).json({
        message: "total must be greater than 0",
    });
}
});


app.listen(5000, (err) => {
    if (err) throw err;
    console.log("Amazon server running on port: 5000, http://localhost:5000");
});

