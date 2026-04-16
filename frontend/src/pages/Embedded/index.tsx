import { useSearchParams } from 'react-router-dom'

/**
 * Narrow admin UI for the EverBee "Embedded" app type: merchants open your app inside
 * the EverBee admin (often in an iframe). Keep layouts compact; avoid full marketing chrome.
 *
 * Register this URL path in the developer portal when you choose Embedded (e.g. https://your-app.vercel.app/embedded).
 */
export default function EmbeddedPage() {
  const [params] = useSearchParams()
  const previewKeys = ['app_id', 'store_id', 'subdomain', 'user_id']

  return (
    <div className="min-h-[320px] bg-gray-50 p-4 text-gray-900">
      <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold">EverBee embedded app</h1>
        <p className="mt-2 text-sm text-gray-600">
          Build focused admin tools here. This route is a starter shell—add your UI and API calls
          using the same backend as the standalone app.
        </p>
        <p className="mt-3 text-xs text-gray-500">
          Embedded apps often receive context via query parameters when opened from the admin.
        </p>
        <dl className="mt-4 space-y-1 text-xs">
          {previewKeys.map((key) => (
            <div key={key} className="flex gap-2">
              <dt className="w-24 shrink-0 font-mono text-gray-500">{key}</dt>
              <dd className="truncate font-mono text-gray-800">{params.get(key) ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
