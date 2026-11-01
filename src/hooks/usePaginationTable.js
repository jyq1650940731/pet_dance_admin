/**
 * 分页表格通用Hook
 * @param {Function} fetchData - 获取表格数据的异步函数，接收查询参数，返回 { data: { rows: [], count: number }, status: boolean }
 * @param {Object} initialForm - 初始搜索表单状态
 * @param {Object} initialPageParams - 初始分页参数
 * @returns {Object} 包含表格相关的状态和方法
 */
export function usePaginationTable(fetchData, initialForm = {}, initialPageParams = { size: 10, page: 1 }) {
  // 搜索表单状态
  const formState = reactive({ ...initialForm });

  // 分页参数
  const params = reactive({
    size: initialPageParams.size || 10,
    page: initialPageParams.page || 1,
  });

  // 表格数据相关
  const tableData = ref([]);
  const total = ref(0);
  const loading = ref(false);

  /**
   * 获取表格数据
   * @param {Object} extraParams - 额外的查询参数
   */
  let requestId = 0;

  const getTableData = async (extraParams = {}) => {
    const currentId = ++requestId;
    loading.value = true;
    try {
      const queryParams = {
        ...JSON.parse(JSON.stringify(formState)),
        ...JSON.parse(JSON.stringify(params)),
        ...extraParams,
        page: params.page - 1,
      };

      const body = (await fetchData(queryParams)) || {};
      if (currentId !== requestId) return;

      const rows = body.data?.rows || [];
      total.value = body.data?.pagination?.total || 0;
      tableData.value = rows;
    } catch (error) {
      if (currentId !== requestId) return;
      console.error('获取表格数据失败：', error);
    } finally {
      if (currentId === requestId) loading.value = false;
    }
  };

  /**
   * 重置搜索表单并重新获取数据
   */
  const resetForm = () => {
    Object.keys(formState).forEach(key => {
      formState[key] = initialForm[key] ?? undefined;
    });
    // 重置分页到第一页
    params.page = 1;
    getTableData();
  };

  /**
   * 处理每页条数改变
   * @param {number} val - 新的每页条数
   */
  const handleSizeChange = async (val) => {
    params.size = val;
    await nextTick();
    getTableData();
  };

  /**
   * 处理当前页改变
   * @param {number} val - 新的当前页
   */
  const handleCurrentChange = (val) => {
    params.page = val;
    getTableData();
  };

  return {
    // 状态
    formState,
    params,
    tableData,
    total,
    loading,
    // 方法
    getTableData,
    resetForm,
    handleSizeChange,
    handleCurrentChange,
  };
}