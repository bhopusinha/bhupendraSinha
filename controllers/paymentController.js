const catchAsyncerror = require('../middleware/catchAsyncerror');

const stripe = require('stripe')(process.env.STRIP_SECRET_KEY);

exports.processPayment = catchAsyncerror(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        description: "Payment for goods/services",
        metadata: {
            company: "Ecommerce"
        },
    })

    res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret
    })
})

exports.sendStripApiKey = catchAsyncerror(async (req, res, next) => {
    res.status(200).json({
        stripApiKey:process.env.STRIP_PUBLIC_KEY
    })
})