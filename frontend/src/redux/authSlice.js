import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  apiData: {
    roleAccess: null,
    menuObjects: null,
    allObjects: null,
    lastFetched: null,
  },
  isDataLoaded: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      localStorage.setItem('token', action.payload.token)
    },
    clearUser(state) {
      state.user = null
      state.token = null
      state.apiData = {
        roleAccess: null,
        menuObjects: null,
        allObjects: null,
        lastFetched: null,
      }
      state.isDataLoaded = false
    },
    setApiData(state, action) {
      state.apiData = {
        ...state.apiData,
        ...action.payload,
        lastFetched: Date.now(),
      }
      state.isDataLoaded = true
    },
    clearApiData(state) {
      state.apiData = {
        roleAccess: null,
        menuObjects: null,
        allObjects: null,
        lastFetched: null,
      }
      state.isDataLoaded = false
    },
    setDataLoaded(state, action) {
      state.isDataLoaded = action.payload
    },
  },
})

export const { setUser, clearUser, setApiData, clearApiData, setDataLoaded } = authSlice.actions
export default authSlice.reducer
