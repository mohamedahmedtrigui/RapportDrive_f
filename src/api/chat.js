import client from './client'

export function askChat(question) {
  return client.post('/chat', { question })
}
