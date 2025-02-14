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
				lumbarNode: null, // 存储 Lumbar 节点引用
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
			      console.log(`Picked Point: x=${point.x+1}, y=${point.y+1.5}, z=${point.z}`);
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
					"/static/models/chair2.2.glb", // 替换为模型路径
					(gltf) => {
						const model = gltf.scene;
						model.traverse((child) => {
							// 为 Lumbar 添加位置控制
							if (child.name === "Lumbar_Supprot") {
								this.lumbarNode = child; // 保存 Lumbar 节点引用
								console.log(this.lumbarNode.position.y); // 输出当前 Lumbar 节点的 y 坐标
							}
							// 为 Pillow 添加位置控制
							if (child.name === "Pillow") {
								this.pillowNode = child; 
								console.log(this.pillowNode.position.y); 
							}
							// 为 Back 添加位置控制
							if (child.name === "Back") {
								this.backMeshNode = child;
								console.log(this.backMeshNode.position.y);
							}
							if (child.isMesh) {
								// 解决模型导入为黑色
								child.frustumCulled = false;
								child.castShadow = true;// 模型阴影
								// 模型自发光
								child.material.emissive =  child.material.color;
								child.material.emissiveMap = child.material.map;
								// 为 back 和 seat 添加热力图
								if (child.name === "Back") {
									this.addHeatmapToMesh(child, "back");
								}
								if (child.name === "Sit") {
									this.addHeatmapToMesh(child, "seat");
								}
							}
						});
						// 调整模型大小
						model.scale.set(3,3,3);
						model.position.y -= 1.5;
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
			adjustLumbarHeight(value) {
				if (this.lumbarNode) {
					const minY = 2.0; // Lumbar 高度最小值
					const maxY = 2.8;  // Lumbar 高度最大值
					const newY = THREE.MathUtils.lerp(minY, maxY, value / 5);
					this.lumbarNode.position.y = newY; // 设置新的高度
				} else {
					console.warn("Lumbar node is not available.");
				}
			},
			adjustBackRestRotation(value) {
			  if (this.backMeshNode && this.pillowNode && this.lumbarNode) {
			    // 定义角度范围（单位：度）
			    const minAngle = -20;
			    const maxAngle = 5;
			    // 检查 slider 的取值范围是否正确
			    if (value < 1 || value > 5) {
			      console.warn("Value should be between 1 and 5.");
			      return;
			    }
			    // 计算当前 value 对应的角度（线性插值）
			    const targetAngleDegree = minAngle + (value - 1) * ((maxAngle - minAngle) / (5 - 1));
			    // 将角度从度转换为弧度
			    const targetAngle = THREE.MathUtils.degToRad(targetAngleDegree);
			
			    // 固定点（椅背绕此点旋转）
			    const fixedPoint = new THREE.Vector3(0, 1.4, 1.3);
				
			    // 旋转轴（本例中为 x 轴）
			    // const rotationAxis = new THREE.Vector3(1, 0, 0);
				// 调整：使用椅背局部 X 轴作为旋转轴
				const rotationAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(this.backMeshNode.quaternion).normalize();
			
			    // 根据旋转轴和目标角度生成四元数
			    const rotationQuaternion = new THREE.Quaternion();
			    rotationQuaternion.setFromAxisAngle(rotationAxis, targetAngle);
			
			    // 在第一次调用时记录各个节点的初始位置和旋转状态
			    if (!this.initialBackMeshPosition) {
			      this.initialBackMeshPosition = this.backMeshNode.position.clone();
			      this.initialBackMeshQuaternion = this.backMeshNode.quaternion.clone();
			
			      this.initialBackOutlinePosition = this.pillowNode.position.clone();
			      this.initialBackOutlineQuaternion = this.pillowNode.quaternion.clone();
			
			      this.initialLumbarPosition = this.lumbarNode.position.clone();
			      this.initialLumbarQuaternion = this.lumbarNode.quaternion.clone();
			    }
			
			    // 辅助函数：将某个节点按绝对角度进行调整
			    const applyAbsoluteRotation = (node, initialPos, initialQuat) => {
			      // 恢复到初始状态
			      node.position.copy(initialPos);
			      node.quaternion.copy(initialQuat);
			      // 先将节点位置转换到固定点坐标系
			      node.position.sub(fixedPoint);
			      // 应用旋转四元数
			      node.position.applyQuaternion(rotationQuaternion);
			      // 转换回世界坐标系
			      node.position.add(fixedPoint);
			      // 叠加旋转：注意 premultiply 顺序可能会影响最终结果
			      node.quaternion.premultiply(rotationQuaternion);
			    };
			
			    // 分别更新各个节点
			    applyAbsoluteRotation(this.backMeshNode, this.initialBackMeshPosition, this.initialBackMeshQuaternion);
			    applyAbsoluteRotation(this.pillowNode, this.initialBackOutlinePosition, this.initialBackOutlineQuaternion);
			    applyAbsoluteRotation(this.lumbarNode, this.initialLumbarPosition, this.initialLumbarQuaternion);
			  } else {
			    console.warn("backMeshNode, pillowNode, or lumbarNode is not available.");
			  }
			},
			adjustSeatHeight(value) {
			  // 定义 slider 的最小/最大值和对应的垂直偏移范围（单位：米，可根据需要调整）
			  const minValue = -6;
			  const maxValue = 5;
			  const minOffset = -0.2; // slider = 1 时的偏移量（例如座垫降低）
			  const maxOffset = 0.2;  // slider = 5 时的偏移量（例如座垫升高）
			
			  // 根据 slider 数值进行线性插值，计算当前的垂直偏移量
			  const offset = minOffset + (value - minValue) * (maxOffset - minOffset) / (maxValue - minValue);
			
			  // 如果还没有保存初始位置，则保存除 Bottom 以外所有组件的初始位置
			  if (!this.initialLumbarPositions) {
			    this.initialLumbarPositions = {};
			    // 假设所有座垫相关组件存放在 this.seatComponents 数组中
			   this.scene.traverse((child) => {
			      if (child.name !== "Bottom") {
			        // 用组件的 uuid 作为 key 保存其初始位置
			        this.initialLumbarPositions[child.uuid] = child.position.clone();
			      }
			    });
			  }
			
			  // 遍历所有座垫组件，更新除 Bottom 之外组件的 y 坐标
			  this.scene.traverse((child) => {
			    if (child.isMesh && child.name !== "Bottom") {
			      const initialPos = this.initialLumbarPositions[child.uuid];
			      if (initialPos) {
			        // 更新 y 坐标：在初始位置上加上偏移量
			        child.position.y = initialPos.y + offset;
			      }
			    }
			  });
			},
			adjustHeadrestHeight(value) {
			    // 定义 slider 的取值范围与对应的偏移范围（单位：米，根据实际需求调整）
			    const minValue = 1;
			    const maxValue = 5;
			    const minOffset = -0.1; // slider 为 1 时头枕降低 0.1 米
			    const maxOffset = 0.1;  // slider 为 5 时头枕升高 0.1 米
			
			    // 线性插值计算当前偏移量
			    const offset = minOffset + (value - minValue) * (maxOffset - minOffset) / (maxValue - minValue);
			
			    // 通过名称查找头枕组件
			    const headrest = this.pillowNode;
			
			    // 保存初始位置，防止多次累加偏移
			    if (!headrest.userData.initialPosition) {
			      headrest.userData.initialPosition = headrest.position.clone();
			    }
			
			    // 根据初始位置和计算的偏移调整头枕的 y 轴坐标
			    headrest.position.y = headrest.userData.initialPosition.y + offset;
			},
			adjustHeadrestAngle(value) {
			    // 通过名称获取头枕组件（假设名称为 "Pillow"）
			    const headrest = this.pillowNode;
			    
			    // 第一次调用时保存头枕初始的四元数，防止累积误差
			    if (!headrest.userData.initialQuaternion) {
			      headrest.userData.initialQuaternion = headrest.quaternion.clone();
			    }
			    
			    // 定义旋转角度范围（单位：度），例如：-5° 到 5°
			    const minAngle = -15;
			    const maxAngle = 15;
			    
			    // 计算 slider 数值对应的角度（线性插值）
			    const targetAngleDeg = minAngle + (value - 1) * (maxAngle - minAngle) / (5 - 1);
			    const targetAngleRad = THREE.MathUtils.degToRad(targetAngleDeg);
			    
			    // 定义绕 x 轴旋转的四元数
			    const rotationAxis = new THREE.Vector3(1, 0, 0);
			    const deltaQuat = new THREE.Quaternion();
			    deltaQuat.setFromAxisAngle(rotationAxis, targetAngleRad);
			    
			    // 恢复初始旋转，再叠加本次旋转，使调整总是基于初始状态
			    headrest.quaternion.copy(headrest.userData.initialQuaternion);
			    headrest.quaternion.multiply(deltaQuat);
			},
			adjustLumbarAngle(value) {
			    // 通过名称获取腰靠组件（假设名称为 "LumbarSupport"）
			    const lumbar = this.lumbarNode;
			    
			    // 第一次调用时保存初始旋转，防止累积误差
			    if (!lumbar.userData.initialQuaternion) {
			      lumbar.userData.initialQuaternion = lumbar.quaternion.clone();
			    }
			    
			    // 定义旋转角度范围（单位：度），例如 -10° 到 10°
			    const minAngle = -20;
			    const maxAngle = 20;
			    
			    // 计算 slider 数值对应的角度（线性插值）
			    const targetAngleDeg = minAngle + (value - 1) * (maxAngle - minAngle) / (5 - 1);
			    const targetAngleRad = THREE.MathUtils.degToRad(targetAngleDeg);
			    
			    // 定义绕 x 轴旋转的四元数
			    const rotationAxis = new THREE.Vector3(1, 0, 0);
			    const deltaQuat = new THREE.Quaternion();
			    deltaQuat.setFromAxisAngle(rotationAxis, targetAngleRad);
			    
			    // 恢复初始旋转，再叠加本次旋转（这样调整总是基于初始状态）
			    lumbar.quaternion.copy(lumbar.userData.initialQuaternion);
			    lumbar.quaternion.multiply(deltaQuat);
			},
			adjustSeatAngle(value) {
			    // 根据组件名称获取座垫对象
			    const seat = this.scene.getObjectByName("Sit");
			    if (!seat) {
			      console.warn("座垫组件 'Sit' 未找到");
			      return;
			    }
			    
			    // 第一次调用时保存初始旋转，避免累积误差
			    if (!seat.userData.initialQuaternion) {
			      seat.userData.initialQuaternion = seat.quaternion.clone();
			    }
			    
			    // 定义旋转角度范围（单位：度），例如：-15° 到 15°
			    const minAngle = -10;
			    const maxAngle = 10;
			    
			    // 线性映射 slider 数值到旋转角度
			    const targetAngleDeg = minAngle + (value - 1) * (maxAngle - minAngle) / (5 - 1);
			    const targetAngleRad = THREE.MathUtils.degToRad(targetAngleDeg);
			    
			    // 创建表示绕 z 轴旋转的四元数
			    const rotationAxis = new THREE.Vector3(0, 0, 1);
			    const deltaQuat = new THREE.Quaternion();
			    deltaQuat.setFromAxisAngle(rotationAxis, targetAngleRad);
			    
			    // 恢复初始状态，再叠加本次旋转
			    seat.quaternion.copy(seat.userData.initialQuaternion);
			    seat.quaternion.multiply(deltaQuat);
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

