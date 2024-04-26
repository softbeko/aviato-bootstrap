$(document).ready(function () {
  $.ajax({
    url: "http://localhost:3000/api/products_all",
    method: "GET",
    success: function (data) {
      const products = data.products_all;
      const categoryTree = {};
    console.log(products)
    },
    error: function (error) {
      console.error(error);
    },
  });
});