<template>
    <view class="container">
        <view class="header">
            <text class="title">语音交互界面</text>
        </view>
        <view class="content">
            <!-- 使用语音图标，并添加动画效果 -->
            <button class="voice-btn" @click="startListening" :disabled="isRecording">
                <uni-icon :type="isRecording ? 'mic-fill' : 'mic'"></uni-icon>
            </button>
            <!-- 显示语音识别结果 -->
            <text class="result" v-if="resultText">{{ resultText }}</text>
            <!-- 显示录音状态 -->
            <text v-if="isRecording" class="status">正在录音...</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            resultText: '',
            isRecording: false  // 标记是否正在录音
        };
    },
    methods: {
        startListening() {
            if (this.isRecording) return;

            this.isRecording = true;  // 开始录音时设置状态

            uni.startRecord({
                success: (res) => {
                    this.resultText = '正在处理语音...';
                    this.recognizeVoice(res.tempFilePath);
                },
                fail: (err) => {
                    console.error('录音失败', err);
                    this.isRecording = false;  // 录音失败时重置状态
                }
            });
        },
        recognizeVoice(filePath) {
            // 接入大模型语音识别API
            uni.uploadFile({
                url: 'https://api.example.com/voice-recognize',  // 大模型的语音识别接口
                filePath: filePath,
                name: 'file',
                success: (res) => {
                    const data = JSON.parse(res.data);
                    this.resultText = data.text;  // 显示语音识别结果
                },
                fail: (err) => {
                    console.error('语音识别失败', err);
                    this.resultText = '语音识别失败，请重试。';
                },
                complete: () => {
                    this.isRecording = false;  // 完成后重置录音状态
                }
            });
        }
    }
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f0f0f0;
}
.header {
    margin-bottom: 20px;
}
.title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}
.content {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.voice-btn {
    font-size: 50px;
    color: #4CAF50;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 20px;
    transition: transform 0.3s ease;
}

.voice-btn:active {
    transform: scale(0.9);
}

.result {
    font-size: 18px;
    color: #333;
}

.status {
    font-size: 16px;
    color: #ff9800;
    font-weight: bold;
}
</style>
