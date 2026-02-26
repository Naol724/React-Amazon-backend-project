const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Debug: Log which Stripe account is being used
console.log("Backend using Stripe account:", process.env.STRIPE_SECRET_KEY?.substring(0, 20) + "...");

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.json({ message: "success" });
});

app.post("/payment/create", async (req, res) => {
    console.log("=== PAYMENT REQUEST ===");
    console.log("REQUEST BODY:", req.body);
    console.log("REQUEST QUERY:", req.query);

    const total = Math.round(Number(req.query?.total));
    console.log("PARSED TOTAL (rounded):", total);

    if (!total || total <= 0 || isNaN(total)) {
        console.log("ERROR: Invalid total amount");
        return res.status(400).json({
            message: "total must be a valid positive integer",
        });
    }

    try {
        console.log("Creating payment intent for amount:", total);
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total, // already in cents from frontend
            currency: "usd",
            // Remove automatic_payment_methods for localhost development
            // automatic_payment_methods: {
            //     enabled: true,
            // },
        });

        console.log("PAYMENT INTENT CREATED:");
        console.log("- ID:", paymentIntent.id);
        console.log("- Amount:", paymentIntent.amount);
        console.log("- Status:", paymentIntent.status);
        console.log("- Client Secret:", paymentIntent.client_secret);

        res.status(201).json({
            clientSecret: paymentIntent.client_secret,
        });
        
    } catch (error) {
        console.error("=== STRIPE ERROR ===");
        console.error("Error message:", error.message);
        console.error("Error type:", error.type);
        console.error("Full error:", error);
        
        res.status(500).json({ 
            error: error.message,
            type: error.type 
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
