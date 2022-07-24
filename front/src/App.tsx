import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Button from './components/Button'
import TextBox from './components/TextBox'
import { getUserInfo, getAccessToken } from './api-utils'

function App() {
  const [lambdaResponse, setLambdaResponse] = useState('')
  const [lineResponse, setLineResponse] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  const displayAccessToken = useCallback(async (code: string) => {
    getAccessToken(code)
      .then((result) => {
        const resultJson = JSON.parse(result.body)
        setLambdaResponse(result.body)
        if (resultJson.access_token) {
          setAccessToken(resultJson.access_token)
        } else {
          setLambdaResponse('認証に失敗しました')
        }
      })
      .catch((error) => {
        setLambdaResponse('エラーが発生しました')
      })
  }, [])

  const displayUserInfo = useCallback(() => {
    getUserInfo(accessToken)
      .then((result) => {
        setLineResponse(JSON.stringify(result))
      })
      .catch((error) => {
        setLineResponse('エラーが発生しました')
      })
  }, [accessToken])

  const navigateLogin = useCallback(() => {
    window.location.href =
      'https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=' +
      (import.meta.env.VITE_LINE_CLIENT_ID ?? '') +
      '&redirect_uri=' +
      (import.meta.env.VITE_S3_DOMAIN ?? '') +
      '&state=' +
      Math.random().toString(32).substring(2) +
      '&scope=profile%20openid'
  }, [])

  useEffect(() => {
    if (code) {
      displayAccessToken(code)
    }
  }, [])

  return (
    <div className="App">
      <h1>rust on lambda authorizer</h1>
      <TextBox>
        {lambdaResponse == '' ? 'ログインして下さい' : lambdaResponse}
      </TextBox>
      <Button width="80px" onClick={navigateLogin}>
        Login
      </Button>
      {accessToken == '' ? (
        <></>
      ) : (
        <>
          <TextBox>{lineResponse}</TextBox>
          <Button width="160px" onClick={displayUserInfo}>
            ユーザー情報取得
          </Button>
        </>
      )}
    </div>
  )
}

export default App
