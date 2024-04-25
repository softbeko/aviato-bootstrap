$(document).ready(function () {
  $.ajax({
    url: "http://localhost:3000/api/products_all",
    method: "GET",
    success: function (data) {
      const products = data.products_all;
      const categoryTree = {};
      products.forEach((product) => {
        const categories = product.BREADCRUMBKAT.split(">");
        let currentLevel = categoryTree;
        categories.forEach((category) => {
          if (!currentLevel[category]) {
            currentLevel[category] = {};
          }
          currentLevel = currentLevel[category];
        });
      });
      const sortedCategoryTree = sortCategoryTree(categoryTree); // Kategorileri alfabetik olarak sırala
      const categoryAccordion = $("#categoryAccordion");
      renderCategoryTree(sortedCategoryTree, categoryAccordion);
    },
    error: function (error) {
      console.error(error);
    },
  });
});
function sortCategoryTree(tree) {
  const sortedTree = {};
  Object.keys(tree)
    .sort()
    .forEach((key) => {
      sortedTree[key] = tree[key];
    });
  return sortedTree;
}
function renderCategoryTree(tree, parentElement) {
  for (const category in tree) {
    if (Object.keys(tree[category]).length > 0) {
      const accordionItem = $("<div>", {
        class: "accordion-item",
      });

      const accordionHeader = $("<h2>", {
        class: "accordion-header",
      });
      const id = generateSafeId(category); // Güvenli ID oluşturma
      const accordionButton = $("<button>", {
        class: "accordion-button collapsed my-1",
        type: "button",
        "data-bs-toggle": "collapse",
        "data-bs-target": `#${id}`,
        "aria-expanded": "false",
        "aria-controls": id,
      }).text(category);
      accordionHeader.append(accordionButton);
      accordionItem.append(accordionHeader);
      const collapseDiv = $("<div>", {
        class: "accordion-collapse collapse",
        id: id,
      });
      const accordionBody = $("<div>", {
        class: "accordion-body",
      });
      renderCategoryTree(tree[category], accordionBody);
      collapseDiv.append(accordionBody);
      accordionItem.append(collapseDiv);
      parentElement.append(accordionItem);
    } else {
      const categoryText = $("<p>").text(category);
      parentElement.append(categoryText);
    }
  }
}
function generateSafeId(text) {
  return text.replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
}
