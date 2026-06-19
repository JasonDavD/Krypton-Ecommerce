import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useComingSoon } from './coming-soon/ComingSoon';
import { PLACEHOLDER_IMAGE, type ProductResponse } from '../models/product';
import './product-card.css';

const pen = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });

/** Card de producto reutilizable (catálogo, destacados, etc.). */
export function ProductCard({ product }: { product: ProductResponse }) {
  const comingSoon = useComingSoon();
  return (
    <article className="pc-card">
      <Link to={`/catalogo/${product.id}`} className="pc-media">
        <img src={product.imageUrl ?? PLACEHOLDER_IMAGE} alt={product.name} />
      </Link>
      <div className="pc-body">
        <span className="pc-cat">{product.categoryName}</span>
        <Link to={`/catalogo/${product.id}`} className="pc-name-link"><h3 className="pc-name">{product.name}</h3></Link>
        <div className="pc-foot">
          <span className="pc-price">{pen.format(product.price)}</span>
          <button className="pc-add" type="button" aria-label="Agregar al carrito" onClick={() => comingSoon.show('Carrito')}>
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
