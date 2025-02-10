<template>
	<view class="heatmap-container">
		<canvas :id="containerId" class="heatmap"></canvas>
	</view>
</template>

<script>
	import h337 from 'heatmap.js';

	export default {
		props: {
			pressureData: {
				type: Array,
				required: true
			},
			// 一行/列上压力块的数量，目前靠背是9（3*3），坐垫是12（2）
			blockNum: {
				type: Number,
				required: true
			},
			containerId: {
				type: String,
				required: true
			},
			backgroundImage: {
				type: String,
				default: ''
			}
		},
		mounted() {
			this.drawHeatmap();
		},
		watch: {
			pressureData(newData) {
				console.log('PressureData updated:', newData);
				this.drawHeatmap();
			}
		},
		methods: {
			drawHeatmap() {
				const canvas = this.$el.querySelector('canvas');
				const data = this.pressureData;
				const ctx = canvas.getContext('2d');

				if (this.backgroundImage) {
					const img = new Image();
					img.onload = () => {
						
						ctx.drawImage(img, 0, 0, img.width, img.height, 0, 15, img.width, img.height);
						console.log(img.width, img.height);
						console.log(canvas.width, canvas.height);
						this.drawHeatmapOverlay(ctx, data);
					};
					img.src = this.backgroundImage;
				} else {
					this.drawHeatmapOverlay(ctx, data);
				}
			},
			drawHeatmapOverlay(ctx, data) {
				const heatmapInstance = h337.create({
					container: document.getElementById(this.containerId),
					radius: 30,
					maxOpacity: 0.6,
					minOpacity: 0,
					blur: 0.85,
					gradient: {
						'0': '#D3D3D3',
						'.2': '#A2C2A1',
						'.4': '#1F77B4',
						'.6': '#FFD700',
						'.9': '#FF4500'
					}
				});

				const formattedData = {
					max: 3000,
					data: []
				};

				const cellSize = 240 / this.blockNum; // 每个方块的大小

				for (let i = 0; i < data.length; i++) {
					for (let j = 0; j < data[i].length; j++) {
						formattedData.data.push({
							x: j * cellSize + cellSize / 2,
							y: i * cellSize + cellSize / 2,
							value: data[i][j]
						});
					}
				}
				heatmapInstance.setData(formattedData);
			}
		}
	}
</script>

<style>
	.heatmap-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 240px;
		height: 240px;
	}

	.heatmap {
		width: 240px;
		/* 根据实际需要调整 */
		height: 240px;
		/* 根据实际需要调整 */
	}
</style>