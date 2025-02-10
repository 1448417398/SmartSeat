<template>
	<!-- ModelViewer 组件 -->
	<ModelViewer ref="modelViewer" />
	
	<scroll-view>
		<view class="container">
			<!-- 各关节调节卡片 -->
			<view class="card">
				<view class="card-header">
					<span>各关节调节</span>
				</view>
				<view class="section">
					<view class="uni-title">整体前后调节</view>
					<slider min="1" max="5" step="1" show-value :value="overallFrontBack" @change="adjustSeat('overallFrontBack', $event)"></slider>
					<view class="uni-title">整体上下调节</view>
					<slider min="1" max="5" step="1" show-value :value="overallUpDown" @change="adjustSeat('overallUpDown', $event)"></slider>
					<view class="uni-title">靠背角度调节</view>
					<slider 
						min="1" 
						max="5" 
						step="1" 
						show-value 
						:value="backrestAngle" 
						@change="adjustBackRestRotation($event)"
					></slider>
					<view class="uni-title">靠背上部角度调节</view>
					<slider min="1" max="5" step="1" show-value :value="upperBackrestAngle" @change="adjustSeat('upperBackrestAngle', $event)"></slider>
					<view class="uni-title">座椅角度调节</view>
					<slider min="1" max="5" step="1" show-value :value="seatAngle" @change="adjustSeat('seatAngle', $event)"></slider>
					<view class="uni-title">座椅前后调节</view>
					<slider min="1" max="5" step="1" show-value :value="seatFrontBack" @change="adjustSeat('seatFrontBack', $event)"></slider>
					<view class="uni-title">头枕调节</view>
					<slider min="1" max="5" step="1" show-value :value="headrestAdjustment" @change="adjustSeat('headrestAdjustment', $event)"></slider>
					<view class="uni-title">腰部支撑量调节</view>
					<slider min="1" max="5" step="1" show-value :value="lumbarSupport" @change="adjustSeat('lumbarSupport', $event)"></slider>
					<view class="uni-title">腰靠上下调节</view>
					<slider 
						min="1" 
						max="5" 
						step="1" 
						show-value 
						:value="cushionHeight" 
						@change="adjustCushionHeight($event)"
					></slider>
				</view>
			</view>

			<!-- 自适应调节与偏好管理 -->
			<view class="buttons-container">
				<button @click="showAdaptiveAdjustmentModal">开始自适应调节</button>
				<button @click="showPreferenceListModal">查看偏好列表</button>
			</view>

			<!-- 自适应调节提示弹窗 -->
			<uni-popup ref="adaptiveAdjustmentPopup" type="dialog">
				<uni-popup-dialog type="info" title="自适应调节">
					<view>请确保已坐好在椅子上，点击确定开始自适应调节。</view>
				</uni-popup-dialog>
			</uni-popup>

			<!-- 偏好列表弹窗 -->
			<uni-popup ref="preferenceListPopup" type="dialog">
				<uni-popup-dialog type="info" title="偏好列表">
					<view v-for="(preference, index) in preferences" :key="index" class="preference-item">
						<view class="preference-name">{{ preference.name }}</view>
						<button @click="applyPreference(preference.name)">应用</button>
						<button @click="deletePreference(preference.name)">删除</button>
						<button @click="togglePreferenceDetails(preference)">详情</button>
						<view v-if="preference.showDetails" class="preference-details">
							<view>整体前后调节：{{ preference.overallFrontBack }}</view>
							<view>整体上下调节：{{ preference.overallUpDown }}</view>
							<view>靠背角度调节：{{ preference.backrestAngle }}</view>
							<view>座椅角度调节：{{ preference.seatAngle }}</view>
						</view>
					</view>
					<button @click="showSavePreferenceModal">+</button>
				</uni-popup-dialog>
			</uni-popup>

			<!-- 保存偏好弹窗 -->
			<uni-popup ref="savePreferencePopup" type="dialog">
				<uni-popup-dialog type="info" content="请输入偏好名称" >
					<input v-model="preferenceName" placeholder="输入偏好名称" />
				</uni-popup-dialog>
			</uni-popup>
		</view>
	</scroll-view>
</template>

<script>
	import ModelViewer from '@/components/ModelViewer.vue'; // 导入您的 ModelViewer 组件
	
	export default {
		components: {
		    ModelViewer
		  },
		data() {
			return {
				cushionHeight: uni.getStorageSync('cushionHeight') || 1,
				overallFrontBack: uni.getStorageSync('overallFrontBack') || 1,
				overallUpDown: uni.getStorageSync('overallUpDown') || 1,
				backrestAngle: uni.getStorageSync('backrestAngle') || 1,
				upperBackrestAngle: uni.getStorageSync('upperBackrestAngle') || 1,
				seatAngle: uni.getStorageSync('seatAngle') || 1,
				seatFrontBack: uni.getStorageSync('seatFrontBack') || 1,
				headrestAdjustment: uni.getStorageSync('headrestAdjustment') || 1,
				lumbarSupport: uni.getStorageSync('lumbarSupport') || 1,
				preferenceName: '',
				preferences: []
			}
		},
		created() {
			this.loadPreferences();
		},
		methods: {
			adjustCushionHeight(event) {
				const value = event.detail.value; // 获取滑块值
				this.cushionHeight = value; // 更新数据属性
				uni.setStorageSync('cushionHeight', value); // 存储到本地
				this.$refs.modelViewer.adjustCushionHeight(value); // 更新模型视图
				console.log(`调整腰靠高度为 ${value}`);
			},
			adjustBackRestRotation(event) {
			    const value = event.detail.value;
			    this.backrestAngle = value; // 更新数据属性
			    // 调用 ModelViewer 中的旋转函数
			    this.$refs.modelViewer.adjustBackRestRotation(value);
			},
			adjustSeat(part, event) {
				const value = event.detail.value;
				this[part] = value;
				uni.setStorageSync(part, value);
				console.log(`调整 ${part} 到 ${value}`);
			},
			showAdaptiveAdjustmentModal() {
				this.$refs.adaptiveAdjustmentPopup.open();
			},
			closeAdaptiveAdjustmentPopup() {
				this.$refs.adaptiveAdjustmentPopup.close();
			},
			startAdaptiveAdjustment() {
				console.log('开始自适应调节');
				this.closeAdaptiveAdjustmentPopup();
			},
			loadPreferences() {
				const preferences = uni.getStorageSync('preferences') || [];
				this.preferences = preferences;
			},
			savePreference() {
				if (!this.preferenceName) {
					alert('请输入偏好名称');
					return;
				}
				if (this.preferences.some(p => p.name === this.preferenceName)) {
					alert('偏好名称已存在');
					return;
				}
				if (this.preferences.length >= 10) {
					alert('偏好数量已达上限');
					return;
				}
				const preference = {
					name: this.preferenceName,
					overallFrontBack: this.overallFrontBack,
					overallUpDown: this.overallUpDown,
					backrestAngle: this.backrestAngle,
					upperBackrestAngle: this.upperBackrestAngle,
					seatAngle: this.seatAngle,
					seatFrontBack: this.seatFrontBack,
					headrestAdjustment: this.headrestAdjustment,
					lumbarSupport: this.lumbarSupport,
					showDetails: false
				};
				this.preferences.push(preference);
				uni.setStorageSync('preferences', this.preferences);
				console.log(`保存偏好 ${this.preferenceName}`);
				this.preferenceName = '';
				this.$refs.savePreferencePopup.close();
			},
			applyPreference(name) {
				const preference = this.preferences.find(p => p.name === name);
				if (preference) {
					this.overallFrontBack = preference.overallFrontBack;
					this.overallUpDown = preference.overallUpDown;
					this.backrestAngle = preference.backrestAngle;
					this.upperBackrestAngle = preference.upperBackrestAngle;
					this.seatAngle = preference.seatAngle;
					this.seatFrontBack = preference.seatFrontBack;
					this.headrestAdjustment = preference.headrestAdjustment;
					this.lumbarSupport = preference.lumbarSupport;
					console.log(`应用偏好 ${name}`);
				} else {
					console.log(`偏好 ${name} 不存在`);
				}
			},
			deletePreference(name) {
				this.preferences = this.preferences.filter(p => p.name !== name);
				uni.setStorageSync('preferences', this.preferences);
				console.log(`删除偏好 ${name}`);
			},
			togglePreferenceDetails(preference) {
				preference.showDetails = !preference.showDetails;
			},
			showSavePreferenceModal() {
				this.$refs.savePreferencePopup.open();
			},
			showPreferenceListModal() {
				this.$refs.preferenceListPopup.open();
			},
			handleSavePreference(done) {
				if (!this.preferenceName) {
					alert('请输入偏好名称');
					done(false);
				} else {
					this.savePreference();
					done(true);
				}
				this.preferenceName = '';
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
	}
	.section {
		margin-bottom: 20px;
	}
	.card {
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 16px;
	}
	.card-header {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.buttons-container {
		margin-top: 20px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.preference-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.preference-name {
		flex-grow: 1;
	}
	.preference-details {
		margin-top: 8px;
		font-size: 14px;
	}
</style>
