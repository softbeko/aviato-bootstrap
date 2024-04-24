const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  URUNKARTIID: Number,
  URUNID: Number,
  STOKKODU: String,
  URUNADI: String,
  BREADCRUMBKAT: String,
  KATEGORILER: String,
  SEO_SAYFABASLIK: String,
  SEO_ANAHTARKELIME: String,
  SEO_SAYFAACIKLAMA: String,
  MARKA: String,
  TEDARIKCI: String,
  SATISFIYATI: Number,
  PARABIRIMI: String
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
