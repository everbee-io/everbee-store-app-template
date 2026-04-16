import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Link } from 'react-router-dom'

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(),
  })

  const products = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button className="btn btn-primary">Add Product</button>
      </div>

      {isLoading ? (
        <div>Loading products...</div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No products yet. Create your first product!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-4"></div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {product.attributes?.name || 'Untitled Product'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {product.attributes?.variants_count || 0} variants
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  ${product.attributes?.master_variant?.price || '0.00'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.attributes?.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {product.attributes?.status || 'draft'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
