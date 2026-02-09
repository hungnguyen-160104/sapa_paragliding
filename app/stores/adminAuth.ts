import { defineStore } from 'pinia'

interface AdminState {
  token: string | null
  username: string | null
}

export const useAdminAuthStore = defineStore('admin-auth', {
  state: (): AdminState => ({
    token: null,
    username: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    hydrate() {
      if (process.server) {
        return
      }
      const storedToken = localStorage.getItem('adminToken')
      const storedUsername = localStorage.getItem('adminUsername')
      this.token = storedToken
      this.username = storedUsername
    },
    login(token: string, username: string) {
      this.token = token
      this.username = username
      if (process.client) {
        localStorage.setItem('adminToken', token)
        localStorage.setItem('adminUsername', username)
      }
    },
    logout() {
      this.token = null
      this.username = null
      if (process.client) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUsername')
      }
    }
  }
})
