<template>
  <MyDialog
    v-model="visible"
    title="修改密码"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <el-form label-width="80" :model="formData" ref="formRef" :rules="rules">
      <!-- 旧密码 -->
      <el-form-item label="旧密码：" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入旧密码"
        ></el-input>
      </el-form-item>
      <!-- 新密码 -->
      <el-form-item label="新密码：" prop="new_password">
        <el-input
          v-model="formData.new_password"
          type="password"
          placeholder="请输入新密码"
        ></el-input>
      </el-form-item>
      <!-- 确认密码 -->
      <el-form-item label="确认密码：" prop="confirm_new_password">
        <el-input
          v-model="formData.confirm_new_password"
          type="password"
          placeholder="请输入确认密码"
        ></el-input>
      </el-form-item>
    </el-form>
  </MyDialog>
</template>

<script setup>
import { useDialog } from "@/hooks/useDialog";
import { updatePassword } from "@/api/user/user";
import { useUserStore } from "@/stores/modules/user";

const formRef = ref(null);
const userStore = useUserStore();

const { visible, openDialog, handleConfirm, handleCancel } = useDialog({
  onOpen: async () => {
    formData.password = undefined;
    formData.new_password = undefined;
    formData.confirm_new_password = undefined;
  },
  onConfirm: async () => {
    try {
      // 表单验证
      await formRef.value.validate();
      // 是否确认
      const confirm = await ElMessageBox.confirm("确认修改密码?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      });
      if (confirm !== "confirm") return;

      await updatePassword(toRaw(formData));
      ElMessage.success("修改密码成功");
      userStore.userLogout();
    } catch (err) {
      return Promise.reject(err);
    }
  },
});

const formData = reactive({
  new_password: undefined,
  password: undefined,
  confirm_new_password: undefined,
});

const rules = reactive({
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  new_password: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirm_new_password: [
    { required: true, message: "请输入确认密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (value !== formData.new_password) {
          callback(new Error("两次输入的密码不一致"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
});

defineExpose({ openDialog });
</script>

<style lang="scss" scoped></style>
