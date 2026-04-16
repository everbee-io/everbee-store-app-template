import axios from 'axios'

const EVERBEE_AUTH_URL = process.env.EVERBEE_AUTH_URL || 'https://auth.everbee.com/oauth'
const CLIENT_ID = process.env.EVERBEE_CLIENT_ID!
const CLIENT_SECRET = process.env.EVERBEE_CLIENT_SECRET!
const REDIRECT_URI = process.env.EVERBEE_REDIRECT_URI!

export interface EverBeeOAuthTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
  created_at: number
}

export async function exchangeCodeForToken(code: string): Promise<EverBeeOAuthTokenResponse> {
  try {
    const response = await axios.post(
      `${EVERBEE_AUTH_URL}/token`,
      {
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('OAuth token exchange error:', error.response?.data || error.message)
    throw new Error('Failed to exchange authorization code for token')
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<EverBeeOAuthTokenResponse> {
  try {
    const response = await axios.post(
      `${EVERBEE_AUTH_URL}/token`,
      {
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Token refresh error:', error.response?.data || error.message)
    throw new Error('Failed to refresh access token')
  }
}

export function buildAuthorizationUrl(state: string, token: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
    token,
  })

  return `${EVERBEE_AUTH_URL}/authorize?${params.toString()}`
}
