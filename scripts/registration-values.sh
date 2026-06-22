#!/bin/bash
#
# Print every value the EverBee Developer portal (dev.everbee.io) asks for, so you
# can copy-paste your way through registration in minutes.
#
#   ./scripts/registration-values.sh                         # localhost dev values
#   ./scripts/registration-values.sh https://api.myapp.com https://myapp.com
#
# Args: [API_BASE] [WEB_BASE]  (WEB_BASE defaults to API_BASE if omitted)

API="${1:-http://localhost:4900}"
WEB="${2:-${1:-http://localhost:4901}}"
[ -z "$2" ] && [ -n "$1" ] && WEB="$1"   # if only one arg, reuse it for web too

cat <<EOF

  EverBee App Store — registration values
  ════════════════════════════════════════════════════════════════

  TECHNICAL DETAILS
    Website URL ............ $WEB
    Redirection URL ........ $API/api/auth/callback
    Uninstallation URL ..... $API/api/auth/uninstall
    Storefront? ............ Yes  (if app touches the buyer storefront)
      JavaScript URL ....... $API/track.js
      CSS URL .............. (blank)
      Page ................. All pages

  APP DEMO
    Production URL ......... $WEB
    Login user/pass ........ (blank — app auto-logs-in a demo)

  LISTING DETAILS
    Developer Name ......... EverBee
    Support Email .......... dev@everbee.io
    Privacy Policy URL ..... https://www.everbee.io/privacy-policy
    Logo ................... frontend/public/logo-512.png  (square PNG)

  SCOPE ACCESS (check only what you call — least privilege)
    products R · orders R · discounts R+W · webhooks R+W
    (optional: customers R · store R)

  AFTER YOU CREATE THE APP — store creds in Keychain:
    Copy Client ID  -> security add-generic-password -U -s "cody-os/<app>-client-id"     -a "\$USER@cody-os" -w "\$(pbpaste)"
    Copy Secret     -> security add-generic-password -U -s "cody-os/<app>-client-secret" -a "\$USER@cody-os" -w "\$(pbpaste)"

  Full runbook: ./EVERBEE-SUBMISSION.md
  ════════════════════════════════════════════════════════════════

EOF
