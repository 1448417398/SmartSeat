<template>
	<view>
		<uni-list>
			<uni-list-item title="设备名称" :note="deviceName"></uni-list-item>
			<uni-list-item title="连接状态" :note="connectionStatus"></uni-list-item>
		</uni-list>
		<button type="primary" @click="connectToDevice">连接设备</button>
	</view>
</template>

<script>
	import mqtt from 'mqtt';
	import {
		mapState,
		mapActions
	} from 'vuex';

	export default {
		data() {
			return {
				deviceName: 'BUPT智能座椅',
				mqttClient: null,
			};
		},
		computed: {
			...mapState(['connectionStatus', 'heatmapData01']),
		},
		methods: {
			...mapActions(['updateConnectionStatus', 'updatebackrestData0']),
			parseSensorData(rawData) {
			  // 去除首尾的逗号
			  rawData = rawData.replace(/^,|,$/g, '');
			
			  // 分割字符串，去除空白字符，过滤空值和非数字值，转换为数字
			  const values = rawData.split(',')
			    .map(value => value.trim())
			    .filter(value => value !== '' && !isNaN(value))
			    .map(Number);
			
			  const size = 4; 
			  
			  // 确保数据长度正确
			  if (values.length % size !== 0) {
			    console.error('Data length is not compatible with the matrix size.');
			    return [];
			  }
			  
			  // 转换为二维数组
			  const matrix = [];
			  for (let i = 0; i < values.length; i += size) {
			    matrix.push(values.slice(i, i + size));
			  }
			  
			  return matrix;
			},

			connectToDevice() {
				this.updateConnectionStatus({
					isConnected: false,
					connectionStatus: '连接中...',
				});

				const options = {
					clientId: '5a18e069a5cc4aa787560110c7204c89',
					keepalive: 60,
					clean: true, // cleanSession 不保持持久会话
					protocolVersion: 4, // MQTT v3.1.1
				};
				this.mqttClient = mqtt.connect('wxs://bemfa.com:9504/wss', options);

				// 连接到 MQTT 服务器
				this.mqttClient.on('connect', () => {
					this.updateConnectionStatus({
						isConnected: true,
						connectionStatus: '已连接',
					});
					uni.showToast({
						title: '设备连接成功',
						icon: 'success',
					});

					// 订阅主题
					this.mqttClient.subscribe('BUPTSmartSeat01', (err) => {
						if (err) {
							console.log(err);
						}
					});

					// 跳转到传感器数据页面
					uni.navigateTo({
						url: '/pages/index/index',
					});
				});

				this.mqttClient.on('message', (topic, message) => {
					if (topic === 'BUPTSmartSeat01') {
						const data = message.toString();
						const parsedData = this.parseSensorData(data);
						this.updatebackrestData0(parsedData); // 更新 Vuex Store
					}
				});


				this.mqttClient.on('error', (err) => {
					console.error('MQTT Connection Error:', err); // 输出详细的错误信息
					this.updateConnectionStatus({
						isConnected: false,
						connectionStatus: '连接失败',
					});
					uni.showToast({
						title: '设备连接失败',
						icon: 'error',
					});
				});
			},
		},
	};
</script>

<style>
	/* 添加一些样式以美化页面 */
	uni-list-item {
		margin-bottom: 20px;
	}

	uni-button {
		display: block;
		margin: 20px auto;
		width: 80%;
	}
</style>