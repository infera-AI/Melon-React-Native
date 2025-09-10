import NetInfo from '@react-native-community/netinfo'

// 检查网络连接
export const checkNetwork = async (): Promise<boolean> => {
  const state = await NetInfo.fetch()
  return state.isConnected ?? false
}

// 监听网络变化
export const addNetworkListener = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener(state => {
    callback(state.isConnected ?? false)
  })
}