package pe.com.krypton.mapper;

import org.springframework.stereotype.Component;
import pe.com.krypton.dto.response.ProductResponse;
import pe.com.krypton.model.Product;

/** Traduce la entidad Product a su DTO de salida. Nunca expone la entidad fuera del servicio. */
@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.isActive(),
                product.getCategory().getId(),
                product.getCategory().getName());
    }
}
