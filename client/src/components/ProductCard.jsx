export default function ProductCard({ product }) {
  const discount = product.originalPrice && product.outletPrice
    ? Math.round((1 - product.outletPrice / product.originalPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col border border-stone-100 bg-white transition hover:border-stone-300">
      {product.imageUrl && (
        <div className="relative aspect-square overflow-hidden bg-white">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-stone-900 px-2 py-0.5 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.brand && (
          <p className="text-[11px] font-medium tracking-widest text-stone-400 uppercase">{product.brand}</p>
        )}
        <h3 className="text-sm font-semibold leading-snug text-stone-900">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-base font-bold text-stone-900">{product.outletPrice} kr</span>
          {product.originalPrice && product.originalPrice !== product.outletPrice && (
            <span className="text-xs text-stone-400 line-through">{product.originalPrice} kr</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {product.bGrade && (
            <span className="border border-stone-300 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-stone-500 uppercase">
              B-grade
            </span>
          )}
        </div>
        {product.href && (
          <a
            href={`https://www.elkjop.no${product.href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-full items-center justify-center bg-stone-900 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-800"
          >
            Se på Elkjøp &rsaquo;
          </a>
        )}
      </div>
    </div>
  );
}
