<template>
  <view class="register-container">
    <text>注册</text>
    <input v-model="username" placeholder="用户名" />
    <input v-model="email" placeholder="邮箱" />
    <input v-model="password" placeholder="密码" type="password" />
    <input v-model="confirmPassword" placeholder="确认密码" type="password" />
    <button @click="register">注册</button>
    <text @click="navigateToLogin" class="login-link">已有账号？去登录</text>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    register() {
      // 注册逻辑
      if (this.password !== this.confirmPassword) {
        uni.showToast({
          title: '两次密码输入不一致',
          icon: 'none'
        });
        return;
      }
      // 简单模拟注册成功
      uni.setStorageSync('userInfo', {
        username: this.username,
        email: this.email
      });
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      });
      // 注册成功后跳转到登录页面
      uni.navigateTo({
        url: '/pages/User/User'
      });
    },
    navigateToLogin() {
      // 跳转到登录页面
      uni.navigateTo({
        url: '/pages/User/User'
      });
    }
  }
}
</script>

<style>
.register-container {
  padding: 20px;
}
.register-container text {
  font-size: 20px;
  margin-bottom: 20px;
  display: block;
}
.register-container input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  box-sizing: border-box;
}
.register-container button {
  width: 100%;
  padding: 10px;
  background-color: #4ab3df;
  color: white;
  border: none;
  text-align: center;
  margin-top: 10px;
}
.login-link {
  color: #4ab3df;
  margin-top: 10px;
  display: block;
  text-align: right;
  cursor: pointer;
}
</style>
