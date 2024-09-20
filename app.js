require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_API_KEY);
const express = require("express");

const app = express();

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://club-clothing-front.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const PAYMENT_CONFIRMATION_URL = `${process.env.FRONT_END_URL}/payment-confirmation`;

const handler = async (req, res) => {
  if (req.method === 'POST') {
    console.log(req.body);
    const items = req.body.products.map((product) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: product.name,
        },
        unit_amount: parseInt(`${product.price}00`),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items: items,
      mode: "payment",
      success_url: `${PAYMENT_CONFIRMATION_URL}?success=true`,
      cancel_url: `${PAYMENT_CONFIRMATION_URL}?canceled=true`,
    });

    res.send({ url: session.url });
  } else {
    res.status(405).end(); // Método não permitido
  }
};

module.exports = allowCors(handler);

