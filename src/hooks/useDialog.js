import { ref, unref, watch } from 'vue';

/**
 * 弹窗通用Hook
 * @param {Object} options - 弹窗配置项
 * @param {Function} options.onConfirm - 确认按钮回调函数（支持异步）
 * @param {Function} options.onCancel - 取消按钮回调函数（支持异步）
 * @param {Boolean} options.autoCloseOnConfirm - 确认后是否自动关闭弹窗，默认true
 * @param {Boolean} options.autoCloseOnCancel - 取消后是否自动关闭弹窗，默认true
 * @param {String} options.title - 弹窗标题，默认'提示'
 * @param {String} options.confirmText - 确认按钮文字，默认'确认'
 * @param {String} options.cancelText - 取消按钮文字，默认'取消'
 * @returns {Object} 弹窗控制相关的状态和方法
 */
export function useDialog(options = {}) {
  // 默认配置
  const defaultOptions = {
    onOpen: () => { }, // 弹窗打开回调
    onConfirm: () => { },
    onCancel: () => { },
    autoCloseOnConfirm: true,
    autoCloseOnCancel: true,
    title: '提示',
    confirmText: '确认',
    cancelText: '取消'
  };

  // 合并配置（深合并，避免覆盖原配置）
  const dialogOptions = { ...defaultOptions, ...options };

  // 核心状态：弹窗显隐
  const visible = ref(false);
  // 弹窗标题（支持响应式）
  const title = ref(dialogOptions.title);
  // 按钮文字
  const confirmText = ref(dialogOptions.confirmText);
  const cancelText = ref(dialogOptions.cancelText);

  /**
   * 打开弹窗
   * @param {Object} openOptions - 打开时的动态配置（如编辑模式传标题、回显数据等）
   * @param {String} openOptions.title - 动态标题
   * @param {String} openOptions.confirmText - 动态确认按钮文字
   * @param {Any} openOptions.data - 传递给弹窗的业务数据（如编辑的行数据）
   */
  const openDialog = (openOptions = {}) => {
    // 动态更新标题/按钮文字
    if (openOptions.title) title.value = openOptions.title;
    if (openOptions.confirmText) confirmText.value = openOptions.confirmText;
    if (openOptions.cancelText) cancelText.value = openOptions.cancelText;

    // 打开弹窗
    visible.value = true;
    dialogOptions.onOpen();
    // 暴露打开时的业务数据（供外部获取）
    return { data: openOptions.data };
  };

  /**
   * 关闭弹窗
   */
  const closeDialog = () => {
    visible.value = false;
  };

  /**
   * 处理确认按钮点击
   * @param {Any} data - 需传递给确认回调的参数（如表单数据）
   */
  const handleConfirm = async (data) => {
    try {
      // 执行业务侧的确认回调（支持异步）
      const result = await dialogOptions.onConfirm(data);
      // 配置自动关闭则关闭弹窗

      if (result !== false && dialogOptions.autoCloseOnConfirm) {
        closeDialog();
      }
    } catch (error) {
      console.error('弹窗确认回调执行失败：', error);
      // 确认失败不关闭弹窗（如表单校验失败）
    }
  };

  /**
   * 处理取消按钮点击
   */
  const handleCancel = async () => {
    try {
      // 执行业务侧的取消回调（支持异步）
      await dialogOptions.onCancel();
    } catch (error) {
      console.error('弹窗取消回调执行失败：', error);
    } finally {
      // 配置自动关闭则关闭弹窗（默认必关）
      if (dialogOptions.autoCloseOnCancel) {
        closeDialog();
      }
    }
  };

  /**
   * 重置弹窗配置（如关闭后重置标题、按钮文字）
   */
  const resetDialog = () => {
    title.value = defaultOptions.title;
    confirmText.value = defaultOptions.confirmText;
    cancelText.value = defaultOptions.cancelText;
  };

  // 监听弹窗关闭，自动重置配置
  watch(visible, (newVal) => {
    if (!newVal) resetDialog();
  }, { immediate: false });

  return {
    // 状态
    visible,        // 弹窗显隐状态（绑定到dialog的v-model）
    title,          // 弹窗标题
    confirmText,    // 确认按钮文字
    cancelText,     // 取消按钮文字
    // 方法
    openDialog,     // 打开弹窗（可传动态配置）
    closeDialog,    // 手动关闭弹窗
    handleConfirm,  // 确认按钮点击处理
    handleCancel,   // 取消按钮点击处理
    resetDialog     // 手动重置弹窗配置
  };
}