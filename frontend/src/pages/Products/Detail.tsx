import { useParams } from 'react-router-dom'

export default function ProductDetailPage() {
  const { id } = useParams()
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Details</h1>
      <div className="card">
        <p className="text-gray-600">Product ID: {id}</p>
        <p className="text-sm text-gray-500 mt-2">
          Use AI to build out this page: "Add product details view with variants, images, and edit functionality"
        </p>
      </div>
    </div>
  )
}
