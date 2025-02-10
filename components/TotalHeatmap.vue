<template>
	<view class="total-heatmap-container">
		<!-- 靠背的压力数据 -->
		<heatmap :pressureData="combinedBackrestData" :blockNum="8" containerId="heatmap-backrest" :backgroundImage="backrestImage" class="heatmap-backrest"></heatmap>

		<!-- 坐垫的压力数据 -->
		<heatmap :pressureData="combinedSeatData" :blockNum="12" containerId="heatmap-seat" :backgroundImage="seatImage" class="heatmap-seat"></heatmap>
	</view>
</template>

<script>
	import Heatmap from '@/components/Heatmap.vue';

	export default {
		components: {
			Heatmap
		},
		computed: {
			combinedBackrestData() {
				return this.generateHeatmapData(8, 8);
			},
			combinedSeatData() {
				return this.generateHeatmapData(12, 12);
			}
			// combinedBackrestData() {
			// 	const combined = [];
			// 	for (let i = 0; i < 4; i++) {
			// 		combined.push([...this.backrestData0[i], ...this.backrestData1[i]]);
			// 	}
			// 	for (let i = 0; i < 4; i++) {
			// 		combined.push([...this.backrestData2[i], ...this.backrestData3[i]]);
			// 	}
			// 	return combined;
			// },
			// combinedSeatData() {
			// 	const combined = [];
			// 	for (let i = 0; i < 4; i++) {
			// 		combined.push([...this.seatData0[i], ...this.seatData1[i], ...this.seatData2[i]]);
			// 	}
			// 	for (let i = 0; i < 4; i++) {
			// 		combined.push([...this.seatData3[i], ...this.seatData4[i], ...this.seatData5[i]]);
			// 	}
			// 	for (let i = 0; i < 4; i++) {
			// 		combined.push([...this.seatData6[i], ...this.seatData7[i], ...this.seatData8[i]]);
			// 	}
			// 	return combined;
			// }
		},
		methods: {
			generateHeatmapData(rows, cols) {
				const centerX = cols / 2;
				const centerY = rows / 2;
				const maxPressure = 3000;
				const minPressure = 0;
				const combined = [];
				const scaleX = cols / 2;  // X轴尺度因子
				const scaleY = rows / 2;  // Y轴尺度因子
	
				for (let i = 0; i < rows; i++) {
					const row = [];
					for (let j = 0; j < cols; j++) {
						// 计算每个点到中心点的“有效距离”，以此来模仿边缘的不规则性
						const distX = Math.abs(j - centerX) / scaleX;
						const distY = Math.abs(i - centerY) / scaleY;
						
						// 结合X轴和Y轴的距离计算压力值，模拟矩形区域的不均匀边缘
						const distance = Math.sqrt(distX * distX + distY * distY);
						
						// 根据距离计算压力值
						const pressure = Math.max(minPressure, maxPressure - (distance * maxPressure));
						row.push(Math.round(pressure));
					}
					combined.push(row);
				}
	
				return combined;
			}
		},
		data() {
			const matrix = [
				[1026, 1596, 1323, 1237],
				[1113, 512, 599, 840],
				[0, 0, 1051, 0],
				[0, 0, 0, 0]
			];

			return {
				backrestImage: '../static/backrest.png',
				seatImage: '../static/seatView.png',
				backrestData0: matrix,
				backrestData1: matrix,
				backrestData2: matrix,
				backrestData3: matrix,

				seatData0: matrix,
				seatData1: matrix,
				seatData2: matrix,
				seatData3: matrix,
				seatData4: matrix,
				seatData5: matrix,
				seatData6: matrix,
				seatData7: matrix,
				seatData8: matrix,
			};
		}
	}
</script>

<style>
	.total-heatmap-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.heatmap-backrest {
		width: 240px;
		/* 根据实际需要调整 */
		height: 240px;
		/* 根据实际需要调整 */
		margin: 10px;
	}

	.heatmap-seat {
		width: 240px;
		/* 根据实际需要调整 */
		height: 240px;
		/* 根据实际需要调整 */
		margin: 10px;
	}
</style>