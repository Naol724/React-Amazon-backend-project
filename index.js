const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

// CORS configuration - restrict in production
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size

// Security: Don't expose sensitive info in logs for production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction && process.env.STRIPE_SECRET_KEY) {
    console.log("Backend using Stripe account:", process.env.STRIPE_SECRET_KEY.substring(0, 20) + "...");
}

// test route
app.get("/", (req, res) => {
    res.json({ message: "success" });
});

app.post("/payment/create", async (req, res) => {
    if (!isProduction) {
        console.log("=== PAYMENT REQUEST ===");
        console.log("REQUEST BODY:", req.body);
        console.log("REQUEST QUERY:", req.query);
    }

    const total = Math.round(Number(req.query?.total));
    
    if (!isProduction) {
        console.log("PARSED TOTAL (rounded):", total);
    }

    // Validate amount
    if (!total || total <= 0 || isNaN(total)) {
        if (!isProduction) {
            console.log("ERROR: Invalid total amount");
        }
        return res.status(400).json({
            message: "total must be a valid positive integer",
        });
    }

    // Security: Limit maximum transaction amount (e.g., $10,000)
    const MAX_AMOUNT = 1000000; // $10,000 in cents
    if (total > MAX_AMOUNT) {
        return res.status(400).json({
            message: "Transaction amount exceeds maximum allowed",
        });
    }

    try {
        if (!isProduction) {
            console.log("Creating payment intent for amount:", total);
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total,
            currency: "usd",
        });

        if (!isProduction) {
            console.log("PAYMENT INTENT CREATED:");
            console.log("- ID:", paymentIntent.id);
            console.log("- Amount:", paymentIntent.amount);
            console.log("- Status:", paymentIntent.status);
        }

        res.status(201).json({
            clientSecret: paymentIntent.client_secret,
        });
        
    } catch (error) {
        console.error("=== STRIPE ERROR ===");
        console.error("Error type:", error.type);
        
        // Don't expose detailed error messages in production
        res.status(500).json({ 
            error: isProduction ? "Payment processing failed" : error.message,
            type: error.type 
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Validate required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("ERROR: STRIPE_SECRET_KEY is not set!");
        process.exit(1);
    }
});
