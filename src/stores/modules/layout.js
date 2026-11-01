export const useLayoutStore = defineStore('layout', () => {
  const refsh = ref(false)
  const handleRefshStatus = () => {
    refsh.value = !refsh.value;
  }

  return {
    refsh,
    handleRefshStatus
  }
})
