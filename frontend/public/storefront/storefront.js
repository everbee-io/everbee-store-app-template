/**
 * EverBee storefront script — submit the deployed URL of this file in app settings
 * (Storefront integration → JavaScript URL), e.g. https://your-domain.com/storefront/storefront.js
 *
 * Loaded on relevant storefront pages. Use EverBeeAppAPI / POD SDK when available.
 */
;(function () {
  if (typeof window === 'undefined') return

  function onSdkReady() {
    var api = window.EverBeeAppAPI
    if (!api) return
    // Example: react when a product is selected
    try {
      if (api.events && typeof api.events.on === 'function') {
        api.events.on('sdk.ready', function () {
          /* Add personalization widgets, custom options, etc. */
        })
      }
    } catch (e) {
      console.warn('[EverBee storefront app]', e)
    }
  }

  if (window.EverBeeAppAPI) {
    onSdkReady()
  } else {
    window.addEventListener('everbee-storefront-ready', onSdkReady)
  }
})()
