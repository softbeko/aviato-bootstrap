const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const productRoutes = require("./routes/productRoutes");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

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

// Giriş sayfasını göster
app.get("/admin/login", (req, res) => {
  res.render("admin/login");
});

app.get("/admin", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Sayfa numarasını al, eğer belirtilmemişse varsayılan olarak 1. sayfayı kullan
  const perPage = 20; // Her sayfada kaç ürün gösterileceği

  try {
    const totalProducts = await Product.countDocuments(); // Toplam ürün sayısını al
    const totalPages = Math.ceil(totalProducts / perPage); // Toplam sayfa sayısını hesapla

    const products_all = await Product.find()
      .skip((page - 1) * perPage) // Sayfalamak için gerekli olan başlangıç kaydını belirle
      .limit(perPage); // Sayfalamak için gerekli olan ürün sayısını belirle

    if (req.session && req.session.user) {
      res.render("admin/admin", {
        products_all,
        totalPages,
        currentPage: page,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// Giriş bilgilerini doğrula
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kullanıcıyı veritabanından bul
    const user = await UserModel.findOne({ username }); // UserModel kullan

    if (user) {
      // Kullanıcının şifresini doğrula
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.user = user;
        res.redirect("/admin");
      } else {
        // Şifre yanlışsa sadece bir alert göster
        res.send(
          '<script>alert("Sifre Yanlis"); window.location="/admin/login";</script>'
        );
      }
    } else {
      // Kullanıcı bulunamazsa sadece bir alert göster
      res.send(
        '<script>alert("Kullanici adi bulunamadi"); window.location="/admin/login";</script>'
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// User modelini oluştur
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Şifre hash'leme
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const UserModel = mongoose.model("User", userSchema); // User modelini oluştur

// İlk kullanıcıyı oluştur
const createInitialUser = async () => {
  try {
    const existingUser = await UserModel.findOne({ username: "admin" });
    if (!existingUser) {
      const newUser = new UserModel({
        // UserModel kullan
        username: "admin1234",
        password: "admin1234", // Burada gerçek şifrenizi güvenli bir şekilde saklamalısınız.
      });
      await newUser.save();
      console.log("Initial user created successfully.");
    } else {
      console.log("Initial user already exists.");
    }
  } catch (error) {
    console.error("Error creating initial user:", error);
  }
};

// İlk kullanıcıyı oluştur
createInitialUser();

app.get("/admin/createProduct.ejs", async (req, res) => {
  if (req.session && req.session.user) {
    res.render("admin/section/createProduct");
  } else {
    res.redirect("/admin/login");
  }
});

app.get("/admin/deleteProduct.ejs", async (req, res) => {
  if (req.session && req.session.user) {
    res.render("admin/section/deleteProduct");
  } else {
    res.redirect("/admin/login");
  }
});


// app.js veya routes dosyanızdaki ilgili yerde
app.post("/add-product", async (req, res) => {
  try {
    const {
      urunAdi,
      stokKodu,
      urunKartiId,
      kategori,
      marka,
      tedarikci,
      satisFiyati,
      paraBirimi,
      aciklama,
      resim,
    } = req.body;

    // Yeni ürün oluştur
    const newProduct = new Product({
      URUNADI: urunAdi,
      STOKKODU: stokKodu,
      URUNKARTIID: urunKartiId,
      KATEGORILER: kategori,
      MARKA: marka,
      TEDARIKCI: tedarikci,
      SATISFIYATI: satisFiyati,
      PARABIRIMI: paraBirimi,
      SEO_SAYFAACIKLAMA: aciklama,
      RESIM: resim, // Bu kısmı gerekirse düzenleyin, örneğin resmin URL'sini buraya ekleyin
    });

    // Yeni ürünü veritabanına kaydet
    await newProduct.save();

    res.redirect("/admin"); // İşlem başarılıysa ana sayfaya yönlendir
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Önce router'ı oluşturun
const router = express.Router();

// Ürünü silme endpoint'i
router.delete("/products/:id/delete", async (req, res) => {
  const productId = req.params.id;

  try {
    // Ürünü veritabanından bul ve sil
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Ürün başarıyla silindi!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ürün silinirken bir hata oluştu!" });
  }
});

// Son olarak, router'ı kullanmanız gereken yere router'ı ekleyin
app.use(router);
