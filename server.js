const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const Product = require('./models/Product');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/products', productRoutes); // products route'unu yönlendir

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce-db").then(() => {
  console.log("MongoDB Connected");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("MongoDB Connection Error:", err);
});
