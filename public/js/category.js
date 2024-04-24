// fetchProducts() fonksiyonu

try {
  const response = await fetch("http://localhost:3000/api/products_all");
  const data = await response.json();

  const products = data.products_all;
  const categoryTree = {}; // Kategori ağacını depolamak için boş bir obje oluştur

  products.forEach((product) => {
    const categories = product.KATEGORILER.split(';').filter(Boolean); // Kategorileri ';' karakterine göre ayır ve boşlukları temizle

    let currentCategoryTree = categoryTree; // Şu anki kategori ağacı, her ürün için baştan oluşturulacak

    // Her kategoriyi kategori ağacına ekleyelim
    categories.forEach((category, index) => {
      if (!currentCategoryTree[category]) {
        currentCategoryTree[category] = {};
      }

      // Son kategoriye geldiysek, ürünü ekle
      if (index === categories.length - 1) {
        if (!currentCategoryTree[category].products) {
          currentCategoryTree[category].products = [];
        }
        currentCategoryTree[category].products.push(product);
      }

      // Bir sonraki kategoriye geç
      currentCategoryTree = currentCategoryTree[category];
    });
  });

  console.log(categoryTree); // Güncellenmiş kategori ağacını göster

  // Kategori ağacını kullanarak accordion menüsü oluşturma
  const accordionContainer = document.querySelector(".widget.product-category");

  Object.keys(categoryTree).forEach((category) => {
    const categoryItem = categoryTree[category];
    const products = categoryItem.products || [];

    const accordionItem = document.createElement("div");
    accordionItem.classList.add("accordion", "mb-1","border");
    accordionItem.innerHTML = `
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
          data-bs-target="#${category.replace(/\s+/g, "-")}" aria-expanded="false" aria-controls="${category.replace(/\s+/g, "-")}">
          ${category}
        </button>
      </h2>
      <div id="${category.replace(/\s+/g, "-")}" class="accordion-collapse collapse">
        <div class="accordion-body">
          <ul class="list-group">
            ${products.map((product) => `<li class="list-group-item">${product.NAME}</li>`).join("")}
          </ul>
          <p>categorytree de olan modellerin > den sonrasını yazdırmasını istiyorum </p>
        </div>
      </div>
    `;

    accordionContainer.appendChild(accordionItem);
  });

} catch (error) {
  console.error(error);
}
