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
					<view class="uni-title">座垫高度调节</view>
					<slider min="1" max="5" step="0.01" show-value :value="seatHeight" @change="adjustSeatHeight($event)"></slider>
					<view class="uni-title">座垫倾角调节</view>
					<slider min="1" max="5" step="0.01" show-value :value="seatAngle" @change="adjustSeatAngle($event)"></slider>
					<view class="uni-title">靠背倾角调节</view>
					<slider 
						min="1" 
						max="5" 
						step="0.01" 
						show-value 
						:value="backrestAngle" 
						@change="adjustBackRestRotation($event)"
					></slider>
					<view class="uni-title">腰托高度调节</view>
					<slider 
						min="1" 
						max="5" 
						step="0.01" 
						show-value 
						:value="lumbarHeight" 
						@change="adjustLumbarHeight($event)"
					></slider>
					<view class="uni-title">腰托角度调节</view>
					<slider min="1" max="5" step="0.01" show-value :value="lumbarAngle" @change="adjustLumbarAngle($event)"></slider>
					<view class="uni-title">头枕高度调节</view>
					<slider min="1" max="5" step="0.01" show-value :value="headrestHeight" @change="adjustHeadrestHeight($event)"></slider>
					<view class="uni-title">头枕角度调节</view>
					<slider min="1" max="5" step="0.01" show-value :value="headrestAngle" @change="adjustHeadrestAngle($event)"></slider>
					<view class="uni-title">靠背上部角度调节</view>
					<slider min="1" max="5" step="1" show-value :value="upperBackrestAngle" @change="adjustSeat('upperBackrestAngle', $event)"></slider>
					<view class="uni-title">座椅前后调节</view>
					<slider min="1" max="5" step="1" show-value :value="seatFrontBack" @change="adjustSeat('seatFrontBack', $event)"></slider>

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
				seatHeight: uni.getStorageSync('seatHeight') || 1,
				seatAngle: uni.getStorageSync('seatAngle') || 1,
				backrestAngle: uni.getStorageSync('backrestAngle') || 1,
				lumbarHeight: uni.getStorageSync('lumbarHeight') || 1,
				lumbarAngle: uni.getStorageSync('lumbarAngle') || 1,
				headrestHeight: uni.getStorageSync('headrestHeight') || 1,
				headrestAngle: uni.getStorageSync('headrestAngle') || 1,
				upperBackrestAngle: uni.getStorageSync('upperBackrestAngle') || 1,
				seatFrontBack: uni.getStorageSync('seatFrontBack') || 1,
				preferenceName: '',
				preferences: [],
			}
		},
		created() {
			this.loadPreferences();
		},
		methods: {
			handleAdjustment(propName, storageKey, modelViewerMethod, event) {
			    const value = event.detail.value;
			    // 更新本地 data（propName 与 storageKey 可相同或不同）
			    this[propName] = value;
			    uni.setStorageSync(storageKey, value);
			    // 如果有对应的 ModelViewer 方法，则调用
			    if (modelViewerMethod && this.$refs.modelViewer && typeof this.$refs.modelViewer[modelViewerMethod] === 'function') {
			      this.$refs.modelViewer[modelViewerMethod](value);
			    }
			    console.log(`调整 ${propName} 为 ${value}`);
			},
			// 之后各个调整方法就可以调用这个通用方法：
			adjustLumbarHeight(event) {
			    this.handleAdjustment('lumbarHeight', 'lumbarHeight', 'adjustLumbarHeight', event);
			},
			adjustBackRestRotation(event) {
			    this.handleAdjustment('backrestAngle', 'backrestAngle', 'adjustBackRestRotation', event);
			},
			adjustSeatHeight(event) {
			    // 注意：data 属性命名为 seatHeight，但存储键名为 sitHeight，这里建议统一为同一个名称
			    this.handleAdjustment('seatHeight', 'seatHeight', 'adjustSeatHeight', event);
			},
			adjustHeadrestHeight(event) {
			    this.handleAdjustment('headrestHeight', 'headrestHeight', 'adjustHeadrestHeight', event);
			},
			adjustHeadrestAngle(event) {
			    this.handleAdjustment('headrestAngle', 'headrestAngle', 'adjustHeadrestAngle', event);
			},
			adjustLumbarAngle(event) {
			    this.handleAdjustment('lumbarAngle', 'lumbarAngle', 'adjustLumbarAngle', event);
			},
			adjustSeatAngle(event) {
				this.handleAdjustment('seatAngle', 'seatAngle', 'adjustSeatAngle', event);
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
