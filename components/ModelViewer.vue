<template>
	<div class="model-viewer-container"></div>
</template>

<script>
	import * as THREE from "three";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

	export default {
		data() {
			return {
				cushionNode: null, // 存储 Cushion 节点引用
			};
		},
		mounted() {
			this.initScene();
			this.initCamera();
			this.initRenderer();
			this.addControls();
			this.addLight();
			this.loadModel();
			this.animate();
			
			// 绑定鼠标点击事件
			this.renderer.domElement.addEventListener("click", this.onPointerClick);
		},
		methods: {
			onPointerClick(event) {
			    // 获取鼠标在画布上的位置
			    const rect = this.renderer.domElement.getBoundingClientRect();
			    const mouse = new THREE.Vector2(
			      ((event.clientX - rect.left) / rect.width) * 2 - 1,
			      -((event.clientY - rect.top) / rect.height) * 2 + 1
			    );
			
			    // 创建 Raycaster
			    const raycaster = new THREE.Raycaster();
			    raycaster.setFromCamera(mouse, this.camera);
			
			    // 检测交点
			    const intersects = raycaster.intersectObject(this.scene, true);
			    if (intersects.length > 0) {
			      const point = intersects[0].point; // 获取交点的坐标
			      console.log(`Picked Point: x=${point.x+1}, y=${point.y+2.5}, z=${point.z}`);
			    } else {
			      console.log("No intersection detected.");
			    }
			},
			initScene() {
				this.scene = new THREE.Scene();
				this.scene.background = new THREE.Color(0xf0f0f0);
			},
			initCamera() {
				this.camera = new THREE.PerspectiveCamera(
					75,
					this.$el.offsetWidth / this.$el.offsetHeight,
					0.1,
					1000
				);
				this.camera.position.set(3.4, 1.52, 2.91);
			},
			initRenderer() {
				this.renderer = new THREE.WebGLRenderer({
					antialias: true
				});
				this.renderer.setSize(this.$el.offsetWidth, this.$el.offsetHeight);
				this.$el.appendChild(this.renderer.domElement);
			},
			addControls() {
				this.controls = new OrbitControls(this.camera, this.renderer.domElement);
				this.controls.enableDamping = true;
				this.controls.dampingFactor = 0.25;
			},
			addLight() {
				const light = new THREE.DirectionalLight(0xffffff, 1);
				light.position.set(5, 10, 7.5);
				this.scene.add(light);
			},
			loadModel() {
				const loader = new GLTFLoader();
				loader.load(
					"/static/models/test.glb", // 替换为模型路径
					(gltf) => {
						const model = gltf.scene;
						model.traverse((child) => {
							// 为 Cushion 添加位置控制
							if (child.name === "Cushion") {
								this.cushionNode = child; // 保存 Cushion 节点引用
								console.log(this.cushionNode.position.y); // 输出当前 Cushion 节点的 y 坐标
							}
							if (child.isMesh) {
								// 为 back 和 seat 添加热力图
								if (child.name === "Back_mesh") {
									this.addHeatmapToMesh(child, "back");
									this.backMeshNode = child;
								}
								if (child.name === "Seat_mesh") {
									this.addHeatmapToMesh(child, "seat");
								}
								if (child.name === "Back_outline_frame") {
								    this.backOutlineNode = child;
								}
							}
						});
						model.position.y -= 2.5;
						model.position.x -= 1;
						this.scene.add(model);
					},
					undefined,
					(error) => console.error("Error loading the model:", error)
				);
			},
			animate() {
				requestAnimationFrame(this.animate.bind(this));
				this.controls.update();
				this.renderer.render(this.scene, this.camera);
			},
			adjustCushionHeight(value) {
				if (this.cushionNode) {
					const minY = 2.6; // Cushion 高度最小值
					const maxY = 3.1;  // Cushion 高度最大值
					const newY = THREE.MathUtils.lerp(minY, maxY, value / 5);
					this.cushionNode.position.y = newY; // 设置新的高度
				} else {
					console.warn("Cushion node is not available.");
				}
			},
			adjustBackRestRotation(value) {
			  if (this.backMeshNode && this.backOutlineNode && this.cushionNode) {
			    // 定义 value 与绝对旋转角度之间的映射（单位：度）
			    // 这里假设：前倾为负角，后倾为正角
			    const angles = [-20, -10, 0, 10, 20]; 
			    if (value < 1 || value > 5) {
			      console.warn("Value should be between 1 and 5.");
			      return;
			    }
			    // 将度转换为弧度
			    const targetAngle = THREE.MathUtils.degToRad(angles[value - 1]);
			
			    // 固定点（椅背绕此点旋转）
			    const fixedPoint = new THREE.Vector3(0.85, 2, -1.5);
			    // 旋转轴（本例中为 x 轴）
			    const rotationAxis = new THREE.Vector3(1, 0, 0);
			
			    // 生成目标旋转对应的四元数
			    const rotationQuaternion = new THREE.Quaternion();
			    rotationQuaternion.setFromAxisAngle(rotationAxis, targetAngle);
			
			    // 在第一次调用时记录各个节点的初始位置和旋转
			    if (!this.initialBackMeshPosition) {
			      this.initialBackMeshPosition = this.backMeshNode.position.clone();
			      this.initialBackMeshQuaternion = this.backMeshNode.quaternion.clone();
			
			      this.initialBackOutlinePosition = this.backOutlineNode.position.clone();
			      this.initialBackOutlineQuaternion = this.backOutlineNode.quaternion.clone();
			
			      this.initialCushionPosition = this.cushionNode.position.clone();
			      this.initialCushionQuaternion = this.cushionNode.quaternion.clone();
			    }
			
			    // 定义一个辅助函数，用于对单个节点按绝对角度进行调整
			    const applyAbsoluteRotation = (node, initialPos, initialQuat) => {
			      // 恢复初始状态
			      node.position.copy(initialPos);
			      node.quaternion.copy(initialQuat);
			      // 将位置转换到固定点坐标系，应用旋转，再转换回世界坐标系
			      node.position.sub(fixedPoint);
			      node.position.applyQuaternion(rotationQuaternion);
			      node.position.add(fixedPoint);
			      // 叠加旋转：注意 premultiply 顺序与模型的旋转设置有关
			      node.quaternion.premultiply(rotationQuaternion);
			    };
			
			    // 分别更新各个节点
			    applyAbsoluteRotation(this.backMeshNode, this.initialBackMeshPosition, this.initialBackMeshQuaternion);
			    applyAbsoluteRotation(this.backOutlineNode, this.initialBackOutlinePosition, this.initialBackOutlineQuaternion);
			    applyAbsoluteRotation(this.cushionNode, this.initialCushionPosition, this.initialCushionQuaternion);
			  } else {
			    console.warn("backMeshNode, backOutlineNode, or cushionNode is not available.");
			  }
			},
			addHeatmapToMesh(mesh, type) {
				// 创建 Canvas 作为热力图纹理
				const canvas = document.createElement("canvas");
				const resolution = type === "back" ? 2 : 3; // 根据传感器分布调整分辨率
				canvas.width = resolution * 100;
				canvas.height = resolution * 100;
				const context = canvas.getContext("2d");

				// 绘制热力图（示例数据）
				const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
				gradient.addColorStop(0, "blue");
				gradient.addColorStop(0.5, "green");
				gradient.addColorStop(1, "red");

				context.fillStyle = gradient;
				context.fillRect(0, 0, canvas.width, canvas.height);

				// 创建材质
				const texture = new THREE.CanvasTexture(canvas);
				const material = new THREE.MeshBasicMaterial({ map: texture });

				// 应用到 Mesh
				mesh.material = material;

				// 可根据实际需求动态更新热力图数据
				this.updateHeatmap(context, texture, type);
			},
			updateHeatmap(context, texture, type) {
				const sensorData =
					type === "back"
						? [
								[0.1, 0.3],
								[0.6, 0.8],
						  ]
						: [
								[0.2, 0.4, 0.7],
								[0.5, 0.9, 0.6],
								[0.3, 0.1, 0.2],
						  ];

				const rows = sensorData.length;
				const cols = sensorData[0].length;

				const cellWidth = context.canvas.width / cols;
				const cellHeight = context.canvas.height / rows;

				for (let i = 0; i < rows; i++) {
					for (let j = 0; j < cols; j++) {
						const value = sensorData[i][j];
						const gradient = context.createLinearGradient(
							j * cellWidth,
							i * cellHeight,
							(j + 1) * cellWidth,
							(i + 1) * cellHeight
						);
						gradient.addColorStop(0, this.getHeatmapColor(value * 0.8));
						gradient.addColorStop(1, this.getHeatmapColor(value));
						context.fillStyle = gradient;
						context.fillRect(
							j * cellWidth,
							i * cellHeight,
							cellWidth,
							cellHeight
						);
					}
				}

				texture.needsUpdate = true;
			},
			getHeatmapColor(value) {
				const r = Math.floor(value * 255);
				const g = Math.floor((1 - value) * 255);
				const b = 0;
				return `rgb(${r}, ${g}, ${b})`;
			},
		},
		beforeDestroy() {
			cancelAnimationFrame(this.animationFrame);
			this.renderer.dispose();
			this.scene = null;
			this.camera = null;
			this.controls.dispose();
			this.renderer.domElement.removeEventListener("click", this.onPointerClick);
		},
	};
</script>

<style scoped>
	.model-viewer-container {
		width: 100%;
		height: 300px;
		background: #ccc;
	}
</style>

