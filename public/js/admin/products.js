function confirmDelete(productId) {
    if (confirm('Ürünü silmek istediğinizden emin misiniz?')) {
        // AJAX isteği gönder
        $.ajax({
            url: "/products/" + productId + "/delete",
            type: "DELETE",
            success: function(data) {
                alert("Ürün başarıyla silindi!");
                // İsteğin başarıyla tamamlanması durumunda yapılacak işlemleri buraya ekleyebilirsiniz.
            },
            error: function(xhr, status, error) {
                console.error(error);
                alert("Ürün silinirken bir hata oluştu!");
                // Hata durumunda yapılacak işlemleri buraya ekleyebilirsiniz.
            }
        });
    } else {
        alert('Silme işlemi iptal edildi.');
    }
}