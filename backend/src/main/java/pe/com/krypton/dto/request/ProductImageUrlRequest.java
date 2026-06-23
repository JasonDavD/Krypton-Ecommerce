package pe.com.krypton.dto.request;

import jakarta.validation.constraints.NotBlank;

/** Alta de una imagen de galería por URL externa. */
public record ProductImageUrlRequest(@NotBlank String url) {
}
