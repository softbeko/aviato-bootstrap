// server.js

const express = require('express');
const path = require('path');
const app = express();
const mongoose = require("mongoose");


const PORT = process.env.PORT || 3000;


// EJS view engine setup
app.set('views', path.join(__dirname, 'views')); // EJS dosyalarının bulunduğu dizin
app.set('view engine', 'ejs'); // EJS'yi görünüm motoru olarak kullan

app.use(express.static(path.join(__dirname, 'public'))); // Statik dosyaların (CSS, JS) bulunduğu dizin

// Route for index page
app.get('/', (req, res) => {
    res.render('index'); // index.ejs dosyasını render et
  });

// Sunucuyu dinle
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const Schema = mongoose.Schema;
mongoose.set("strictQuery", false);
//connect DB
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce-db");
//create schema
const PhotoSchema = new Schema({
  title: String,
  description: String,
});
const Photo = mongoose.model("Photo", PhotoSchema);
//create a photo
Photo.create({
  title: "Photo Title 5 ",
  description: "Photo description 6 lorem ipsum",
});


// Product modelini ekleyin
const ProductSchema = new Schema({
    name: String,
    price: Number,
    description: String,
    // Diğer özellikler...
  });
  
  const Product = mongoose.model("Product", ProductSchema);
  
  // Örnek ürünleri veritabanına ekleyin
  Product.create({
    name: "Product 1",
    price: 10.99,
    description: "Lorem ipsum description for Product 1",
  });
  
  // Ürünleri listeleme
  app.get('/products', async (req, res) => {
    try {
      const products = await Product.find(); // Tüm ürünleri getir
      res.render('products', { products }); // products.ejs dosyasına ürünleri gönder
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  


