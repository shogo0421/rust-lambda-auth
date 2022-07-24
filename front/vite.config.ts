import { loadEnv, UserConfigExport } from 'vite'
import react from '@vitejs/plugin-react'
import { certificateFor } from 'devcert'
import path from 'path'

export default async ({
  mode,
}: {
  mode: string
}): Promise<UserConfigExport> => {
  const env = loadEnv(mode, 'env')
  const { key, cert } = await certificateFor('localhost')

  return {
    root: './',
    plugins: [react()],
    resolve: {
      alias: {
        '@/': path.join(__dirname, './src/'),
      },
    },
    server: {
      open: true,
      https: {
        key,
        cert,
      },
    },
  }
}
