<template>
  <view>
    <view v-if="isLoggedIn">
      <uni-card title="Davian" sub-title="davian@qq.com" @click="onClick"></uni-card>
    </view>
    <view v-else>
      <view v-if="isRegistering" class="register-container">
        <uni-easyinput v-model="registerUsername" placeholder="用户名"></uni-easyinput>
        <uni-easyinput v-model="registerEmail" placeholder="邮箱"></uni-easyinput>
        <uni-easyinput v-model="registerPassword" placeholder="密码" type="password"></uni-easyinput>
        <uni-easyinput v-model="confirmPassword" placeholder="确认密码" type="password"></uni-easyinput>
        <button size="mini" @click="register">注册</button>
        <text @click="toggleView" class="login-link">已有账号？去登录</text>
      </view>
      <view v-else class="login-container">
        <uni-easyinput v-model="username" placeholder="用户名"></uni-easyinput>
        <uni-easyinput v-model="password" placeholder="密码" type="password"></uni-easyinput>
        <button size="mini" @click="login">登录</button>
        <text @click="toggleView" class="register-link">没有账号？去注册</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      isRegistering: false,
      username: '',
      password: '',
      registerUsername: '',
      registerEmail: '',
      registerPassword: '',
      confirmPassword: ''
    }
  },
  onLoad() {
    // 在页面加载时检查登录状态
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      // 检查登录状态逻辑，这里简单模拟
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    },
    onClick() {
      // 用户信息点击事件逻辑
    },
    login() {
      // 登录逻辑
      if (this.username && this.password) {
        // 假设登录成功
        uni.setStorageSync('userInfo', { username: this.username });
        this.isLoggedIn = true;
      } else {
        uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none'
        });
      }
    },
    register() {
      // 注册逻辑
      if (this.registerPassword !== this.confirmPassword) {
        uni.showToast({
          title: '两次密码输入不一致',
          icon: 'none'
        });
        return;
      }
      // 假设注册成功
      uni.setStorageSync('userInfo', {
        username: this.registerUsername,
        email: this.registerEmail
      });
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      });
      // 注册成功后更新登录状态
      this.isLoggedIn = true;
    },
    toggleView() {
      this.isRegistering = !this.isRegistering;
    }
  }
}
</script>

<style>
.login-container, .register-container {
  padding: 20px;
}
.login-container text, .register-container text {
  font-size: 20px;
  margin-bottom: 20px;
  display: block;
}
.login-container input, .register-container input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  box-sizing: border-box;
}
.login-container button, .register-container button {
  width: 100%;
  padding: 10px;
  background-color: #4ab3df;
  color: white;
  border: none;
  text-align: center;
  margin-top: 10px;
}
.register-link, .login-link {
  color: #4ab3df;
  margin-top: 10px;
  display: block;
  text-align: right;
  cursor: pointer;
}
</style>
