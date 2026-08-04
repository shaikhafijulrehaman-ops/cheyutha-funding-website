const Razorpay = require('razorpay');
require('dotenv').config();

const useMock = process.env.USE_MOCK_DATA === 'true';

let razorpay = null;

if (!useMock && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } catch (err) {
        console.error("Failed to initialize Razorpay: ", err.message);
    }
}

module.exports = razorpay;
