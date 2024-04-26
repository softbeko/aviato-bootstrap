const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use("/products", productRoutes); // products route'unu yönlendir

mongoose
  .connect("mongodb://127.0.0.1:27017/ecommerce-db")
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

// API Endpoint: Tüm ürünleri getir
app.get("/api/products_all", async (req, res) => {
  try {
    const products_all = await Product.find(); // Tüm ürünleri getir
    res.json({ products_all }); // JSON formatında ürünleri gönder
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const ITEMS_PER_PAGE = 18; // Sayfa başına ürün sayısı
let products_all = [];
app.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  try {
    const totalProducts = await Product.countDocuments({
      SATISFIYATI: { $ne: 0 },
    }); // Fiyatı olan ürünlerin sayısını al
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    const products = await Product.find({ SATISFIYATI: { $ne: 0 } }) // Fiyatı olan ürünleri getir
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const products_all = await Product.find(); // Tüm ürünleri getir

    res.render("index", {
      products_all,
      products,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
