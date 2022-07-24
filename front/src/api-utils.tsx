type callApiFunction = (accessToken: string) => void

export async function getUserInfo(accessToken: string) {
  const response = await fetch('https://api.line.me/v2/profile/', {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.json()
}

export async function getAccessToken(code: string) {
  const postParams = {
    code: code,
  }
  const response = await fetch(
    (import.meta.env.VITE_LAMBDA_ENDPOINT ?? '').toString(),
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: (import.meta.env.LAMBDA_AUTH_TOKEN ?? '').toString(),
      },
      body: JSON.stringify(postParams),
    }
  )
  return response.json()
}
