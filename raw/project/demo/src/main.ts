import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * ============================================================================
 * 类型定义（TypeScript Interfaces）
 * ============================================================================
 */
interface Sizes {
  width: number;
  height: number;
}

type LightType = 'DirectionalLight' | 'PointLight' | 'SpotLight' | 'HemisphereLight';
type ShadowMapAlgorithm = 'PCFSoftShadowMap' | 'PCFShadowMap' | 'BasicShadowMap';

interface DebugParams {
  cubeColor: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  // 光照控制
  activeLightType: LightType;
  mainLightIntensity: number;
  mainLightColor: string;
  showHelper: boolean;
  showShadowCamera: boolean;
  ambientIntensity: number;
  flyFireLight: boolean;
  // 阴影系统算法与参数控制
  shadowAlgorithm: ShadowMapAlgorithm;
  shadowRadius: number;
  // 动画控制
  autoRotate: boolean;
  rotationSpeed: number;
}

/**
 * ============================================================================
 * 1. WebGL 环境可用性检测与优雅降级
 * ============================================================================
 * 在初始化 Three.js 前探查浏览器是否支持 WebGL 上下文。
 * 若不支持（如极老旧硬件或被禁用的 GPU），激活 DOM 提示卡片并优雅阻断后续逻辑。
 */
function checkWebGLSupport(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && gl);
  } catch {
    return false;
  }
}

const fallbackElement = document.getElementById('webgl-fallback');
if (!checkWebGLSupport()) {
  if (fallbackElement) {
    fallbackElement.classList.add('active');
  }
  throw new Error('当前环境无法创建 WebGL 上下文，Three.js 应用程序已终止运行。');
}

/**
 * ============================================================================
 * 2. 基础 DOM 画布与视口尺寸初始化
 * ============================================================================
 */
const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
if (!canvas) {
  throw new Error('未找到 canvas.webgl 元素，Three.js 初始化失败。');
}

const sizes: Sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * ============================================================================
 * 3. 场景（Scene）与空间辅助工具
 * ============================================================================
 * Scene 是所有 3D 物体、光源和相机的顶层容器。
 * AxesHelper 用于在开发阶段直观辨认空间方向：红轴为 X、绿轴为 Y、蓝轴为 Z。
 */
const scene: THREE.Scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(3); // 辅助坐标轴长度设为 3 米
scene.add(axesHelper);

/**
 * ============================================================================
 * 4. 纹理资产加载系统（Texture Loading Pipeline）
 * ============================================================================
 * 针对外部贴图采用 LoadingManager 全局监控，配合 TextureLoader 实现异步加载。
 * 避坑要点：
 * 1. 颜色贴图需显式指定 SRGBColorSpace，防止色彩泛白灰暗。
 * 2. 若需平铺重复（repeat），必须同时开启 RepeatWrapping，否则只会产生边缘拉伸。
 * 3. 静态贴图放置于 public/textures/ 目录下，在 Vite 中通过根路径 /textures/... 访问。
 */
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
  console.log(`[纹理加载] 开始请求: ${url} (进度: ${itemsLoaded}/${itemsTotal})`);
};

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const progressRatio = itemsLoaded / itemsTotal;
  console.log(`[纹理加载] 载入进度: ${(progressRatio * 100).toFixed(1)}% -> ${url}`);
};

loadingManager.onLoad = () => {
  console.log('[纹理加载] 全部纹理资产加载完毕！');
};

loadingManager.onError = (url) => {
  console.error(`[纹理加载失败] 无法获取资产: ${url}，请确认 public/textures/ 目录下是否存在对应文件`);
};

// 实例化纹理加载器
const textureLoader = new THREE.TextureLoader(loadingManager);

// 载入地面木纹颜色贴图（锁定 public/textures/floor-wood.jpg）
const floorColorTexture = textureLoader.load('/textures/floor-wood.jpg');
// 设置色彩空间为 sRGB，还原真实色彩
floorColorTexture.colorSpace = THREE.SRGBColorSpace;
// 启用双向平铺包裹模式（U 轴水平，V 轴垂直）
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;
// 设置横纵平铺重复次数（4x4 网格平铺）
floorColorTexture.repeat.set(4, 4);

/**
 * ============================================================================
 * 5. 网格模型（Meshes）与材质装配（Materials）
 * ============================================================================
 */
// 5.1 核心展示模型：圆环结（Torus Knot）搭配 PBR 标准物理材质
const cubeMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
  color: 0x1e88e5, // 主体天蓝色
  roughness: 0.35, // 表面粗糙度（0 镜面反光，1 粗糙漫反射）
  metalness: 0.25, // 金属度（决定反光高光的高反质感）
});

const cubeGeometry: THREE.TorusKnotGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 128, 32);
const cube: THREE.Mesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.y = 0;
cube.castShadow = true; // 投射动态阴影
scene.add(cube);

// 5.2 地面参考平面：铺设平铺纹理并接收投影
const floorMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
  map: floorColorTexture, // 绑定地面纹理贴图
  roughness: 0.8,
  metalness: 0.1,
});

const floorGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(12, 12);
const floor: THREE.Mesh = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI * 0.5; // 绕 X 轴旋转 90 度平铺为水平地面
floor.position.y = -0.5;          // 置于物体下方
floor.receiveShadow = true;       // 接收来自物体的投影
scene.add(floor);

// 5.3 空间层级示例：编组对象（Group）演示父子变换继承
const carGroup = new THREE.Group();
scene.add(carGroup);

// 零件 1：左侧红色立方体（局部坐标 X = -1）
const box1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xff4444 })
);
box1.position.x = -1;
box1.castShadow = true;
box1.receiveShadow = true;
carGroup.add(box1);

// 零件 2：右侧绿色立方体（局部坐标 X = 1）
const box2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.MeshStandardMaterial({ color: 0x44ff44 })
);
box2.position.x = 1;
box2.castShadow = true;
box2.receiveShadow = true;
carGroup.add(box2);

// 5.4 海量散布实验：100 个随机漂浮的甜甜圈（Torus，共享几何体与材质单例）
const donutGeometry = new THREE.TorusGeometry(0.25, 0.12, 16, 32);
const donutMaterial = new THREE.MeshStandardMaterial({
  color: 0xffaa00, // 诱人的金橙色
  roughness: 0.3,
  metalness: 0.4,
});

const donuts: THREE.Mesh[] = [];

for (let i = 0; i < 100; i++) {
  const donut = new THREE.Mesh(donutGeometry, donutMaterial);

  // 随机分布在以中心为原点、边长为 14 米的立方体空间内
  donut.position.x = (Math.random() - 0.5) * 14;
  donut.position.y = (Math.random() - 0.5) * 14 + 2;
  donut.position.z = (Math.random() - 0.5) * 14;

  donut.rotation.x = Math.random() * Math.PI;
  donut.rotation.y = Math.random() * Math.PI;

  const scale = Math.random() * 0.7 + 0.3;
  donut.scale.set(scale, scale, scale);

  donut.castShadow = true;
  donut.receiveShadow = true;

  scene.add(donut);
  donuts.push(donut);
}

/**
 * ============================================================================
 * 6. 多功能光照系统（Lights）与辅助可视化（Helpers）
 * ============================================================================
 */
// 6.1 全向基础环境光（底光，可在调试面板中自由调节强弱或关闭）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// 6.2 主光源库（供控制台随时无缝动态切换）

// A. 平行太阳光（DirectionalLight）：远距离直射光，产生全向平行阴影
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.position.set(3, 4, 2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -6;
directionalLight.shadow.camera.right = 6;
directionalLight.shadow.camera.top = 6;
directionalLight.shadow.camera.bottom = -6;
// 关键：手动更新阴影相机的投影矩阵，否则 CameraHelper 顶点坐标未换算会导致塌缩不可见
directionalLight.shadow.camera.updateProjectionMatrix();
directionalLight.shadow.radius = 1;

scene.add(directionalLight);
const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.8);
scene.add(dirLightHelper);

// 太阳光阴影相机的视锥体可视化（黄色/白色线框盒子）
const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(shadowCameraHelper);
shadowCameraHelper.update();

// B. 点光源（PointLight）：球形灯泡向四面八方辐射，有距离衰减
const pointLight = new THREE.PointLight(0xffffff, 2.5, 12, 1.5);
pointLight.position.set(0, 3, 2);
pointLight.castShadow = true;
pointLight.shadow.mapSize.set(1024, 1024);
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 15;
pointLight.shadow.radius = 1;
scene.add(pointLight);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.35);
scene.add(pointLightHelper);

// C. 聚光灯（SpotLight）：手电筒/舞台圆锥聚光
const spotLight = new THREE.SpotLight(0xffffff, 3.5, 15, Math.PI / 5, 0.3, 1.5);
spotLight.position.set(0, 4.5, 3);
spotLight.target.position.set(0, 0, 0); // 朝向场景中心
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 15;
spotLight.shadow.radius = 1;
scene.add(spotLight);
scene.add(spotLight.target);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// D. 半球天光（HemisphereLight）：模拟天空与地面的漫射自然光（超写实、开销低、无阴影）
const hemisphereLight = new THREE.HemisphereLight(0x70a5ff, 0x3d2b1f, 1.2);
hemisphereLight.position.set(0, 5, 0);
scene.add(hemisphereLight);
const hemiLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.8);
scene.add(hemiLightHelper);

// 6.3 灵动的暖橙色穿梭小点光源（萤火虫效果）
const fireLight = new THREE.PointLight(0xff6600, 2.2, 8, 2);
fireLight.position.set(0, 1, 0);
scene.add(fireLight);
const fireLightHelper = new THREE.PointLightHelper(fireLight, 0.2);
scene.add(fireLightHelper);

// 光源与辅助器映射字典
interface LightBundle {
  light: THREE.Light;
  helper: THREE.Object3D;
}

const lightsMap: Record<LightType, LightBundle> = {
  DirectionalLight: { light: directionalLight, helper: dirLightHelper },
  PointLight: { light: pointLight, helper: pointLightHelper },
  SpotLight: { light: spotLight, helper: spotLightHelper },
  HemisphereLight: { light: hemisphereLight, helper: hemiLightHelper },
};

/**
 * ============================================================================
 * 7. 摄像机系统（Perspective Camera）
 * ============================================================================
 */
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  40,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2.5, 2, 4.5);
scene.add(camera);

/**
 * ============================================================================
 * 8. 渲染器配置（WebGL Renderer）
 * ============================================================================
 */
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * 阴影贴图三大算法映射表与说明
 * 1. BasicShadowMap: 未过滤，边缘像素锯齿硬边，性能最高
 * 2. PCFShadowMap: 百分比渐进过滤，边缘抗锯齿平滑，性能均衡（Three.js 默认）
 * 3. PCFSoftShadowMap: 泊松圆盘采样，边缘极度柔和且半影渐变自然，画质最佳
 */
const shadowAlgorithmMap: Record<ShadowMapAlgorithm, { type: THREE.ShadowMapType; desc: string }> = {
  PCFSoftShadowMap: {
    type: THREE.PCFSoftShadowMap,
    desc: '泊松圆盘采样（Poisson Disk），边缘最柔和自然，画质最高',
  },
  PCFShadowMap: {
    type: THREE.PCFShadowMap,
    desc: '百分比渐进过滤（PCF），抗锯齿平滑边缘，性能均衡',
  },
  BasicShadowMap: {
    type: THREE.BasicShadowMap,
    desc: '未过滤硬阴影（Basic），像素马赛克硬边，性能极速',
  },
};

/**
 * 动态切换阴影算法并强制重新编译场景着色器材质
 * 避坑重点：
 * Three.js 的 Shader 阴影采样指令在初次渲染时便已硬编码。
 * 运行时若修改 renderer.shadowMap.type，必须遍历场景将受光网格的 material.needsUpdate 设为 true，
 * 否则 GPU 会一直沿用旧着色器，视口中阴影算法不会发生改变！
 */
function updateShadowMapAlgorithm(algoName: ShadowMapAlgorithm): void {
  const algoConfig = shadowAlgorithmMap[algoName];
  if (!algoConfig) return;

  renderer.shadowMap.type = algoConfig.type;

  // 遍历整个场景树，通知所有网格材质重新编译 Shadow Shader
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => {
          mat.needsUpdate = true;
        });
      } else if (child.material) {
        child.material.needsUpdate = true;
      }
    }
  });

  console.log(`[阴影系统] 切换阴影贴图算法: ${algoName} - ${algoConfig.desc}`);
}

/**
 * ============================================================================
 * 9. 轨道控制器（OrbitControls）与全屏手势交互
 * ============================================================================
 */
const controls: OrbitControls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// 垂直仰俯角约束
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 2;
controls.maxDistance = 15;

// 双击画布切换全屏与常规窗口视图
window.addEventListener('dblclick', (): void => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

/**
 * ============================================================================
 * 10. 响应式视口自适应监听（Window Resize Handling）
 * ============================================================================
 */
window.addEventListener('resize', (): void => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * ============================================================================
 * 11. 交互式调试控制台（lil-gui）
 * ============================================================================
 */
const debugParams: DebugParams = {
  // 材质属性
  cubeColor: '#1e88e5',
  roughness: 0.35,
  metalness: 0.25,
  wireframe: false,
  // 光照控制
  activeLightType: 'DirectionalLight',
  mainLightIntensity: 1.8,
  mainLightColor: '#ffffff',
  showHelper: true,
  showShadowCamera: true,
  ambientIntensity: 0.3,
  flyFireLight: true,
  // 阴影系统参数
  shadowAlgorithm: 'PCFSoftShadowMap',
  shadowRadius: 1,
  // 动画控制
  autoRotate: true,
  rotationSpeed: 0.8,
};

const gui: GUI = new GUI({ title: 'Three.js 教学调试台' });

// 11.1 材质调试折叠组
const materialFolder = gui.addFolder('主体材质参数');
materialFolder
  .addColor(debugParams, 'cubeColor')
  .name('材质颜色')
  .onChange((value: string) => {
    cubeMaterial.color.set(value);
  });
materialFolder
  .add(debugParams, 'roughness', 0, 1, 0.01)
  .name('表面粗糙度')
  .onChange((value: number) => {
    cubeMaterial.roughness = value;
  });
materialFolder
  .add(debugParams, 'metalness', 0, 1, 0.01)
  .name('金属度')
  .onChange((value: number) => {
    cubeMaterial.metalness = value;
  });
materialFolder
  .add(debugParams, 'wireframe')
  .name('线框模式')
  .onChange((value: boolean) => {
    cubeMaterial.wireframe = value;
  });

// 11.2 物体空间位置调试组
const transformFolder = gui.addFolder('空间变换 (Transform)');
transformFolder
  .add(cube.position, 'x', -3, 3, 0.01)
  .name('位置 X');
transformFolder
  .add(cube.position, 'y', -0.5, 3, 0.01)
  .name('高度 Y');
transformFolder
  .add(cube.position, 'z', -3, 3, 0.01)
  .name('位置 Z');

// 11.3 光源系统与动态切换控制台（核心新特性）
const lightFolder = gui.addFolder('光源系统 (Lights)');

// 动态应用光源显隐与参数的统一同步函数
function applyLightState(): void {
  for (const [key, item] of Object.entries(lightsMap)) {
    const isCurrent = key === debugParams.activeLightType;
    item.light.visible = isCurrent;
    item.helper.visible = isCurrent && debugParams.showHelper;

    if (isCurrent) {
      item.light.intensity = debugParams.mainLightIntensity;
      if ('color' in item.light && !(item.light instanceof THREE.HemisphereLight)) {
        (item.light.color as THREE.Color).set(debugParams.mainLightColor);
      }
    }
  }

  // 环境光与萤火虫光
  ambientLight.intensity = debugParams.ambientIntensity;
  fireLight.visible = debugParams.flyFireLight;
  fireLightHelper.visible = debugParams.flyFireLight && debugParams.showHelper;

  // 阴影相机辅助长方体仅在平行光激活且开启开关时可见
  shadowCameraHelper.visible = (debugParams.activeLightType === 'DirectionalLight') && debugParams.showShadowCamera;
}

// 下拉菜单：自由切换当前主光源种类
lightFolder
  .add(debugParams, 'activeLightType', ['DirectionalLight', 'PointLight', 'SpotLight', 'HemisphereLight'])
  .name('主光源种类')
  .onChange(() => {
    applyLightState();
  });

lightFolder
  .add(debugParams, 'mainLightIntensity', 0, 6, 0.1)
  .name('主光强度')
  .onChange((value: number) => {
    const active = lightsMap[debugParams.activeLightType];
    active.light.intensity = value;
  });

lightFolder
  .addColor(debugParams, 'mainLightColor')
  .name('主光颜色')
  .onChange((color: string) => {
    const active = lightsMap[debugParams.activeLightType];
    if ('color' in active.light && !(active.light instanceof THREE.HemisphereLight)) {
      (active.light.color as THREE.Color).set(color);
    }
  });

lightFolder
  .add(debugParams, 'showHelper')
  .name('显示光路辅助线')
  .onChange(() => {
    applyLightState();
  });

lightFolder
  .add(debugParams, 'showShadowCamera')
  .name('显示阴影相机视锥体')
  .listen()
  .onChange(() => {
    applyLightState();
  });

lightFolder
  .add(debugParams, 'ambientIntensity', 0, 1.5, 0.05)
  .name('环境光底光')
  .onChange((value: number) => {
    ambientLight.intensity = value;
  });

lightFolder
  .add(debugParams, 'flyFireLight')
  .name('萤火虫副光源')
  .onChange(() => {
    applyLightState();
  });

// 首次执行状态同步
applyLightState();

// 11.4 阴影系统与三大算法控制台（核心新特性）
const shadowFolder = gui.addFolder('阴影系统 (Shadows)');

// 下拉菜单：自由切换三大阴影贴图算法（即时触发 Shader 材质重新编译）
shadowFolder
  .add(debugParams, 'shadowAlgorithm', ['PCFSoftShadowMap', 'PCFShadowMap', 'BasicShadowMap'])
  .name('柔和度算法')
  .onChange((value: ShadowMapAlgorithm) => {
    updateShadowMapAlgorithm(value);
  });

// 虚化半径：调节阴影边缘模糊扩散程度（主要在 PCF 算法下生效）
shadowFolder
  .add(debugParams, 'shadowRadius', 1, 15, 0.5)
  .name('虚化半径 (PCF)')
  .onChange((value: number) => {
    directionalLight.shadow.radius = value;
    pointLight.shadow.radius = value;
    spotLight.shadow.radius = value;
  });

// 阴影相机视锥体线框显隐
shadowFolder
  .add(debugParams, 'showShadowCamera')
  .name('显示视锥体线框')
  .listen()
  .onChange(() => {
    applyLightState();
  });

// 11.5 动画行为调试组
const animFolder = gui.addFolder('旋转动画');
animFolder.add(debugParams, 'autoRotate').name('开启自转');
animFolder.add(debugParams, 'rotationSpeed', 0, 3, 0.1).name('自转基准速度');

/**
 * ============================================================================
 * 12. 渲染循环与帧增量时钟系统（Tick Loop）
 * ============================================================================
 */
const clock: THREE.Clock = new THREE.Clock();
let previousTime = 0;

const tick = (): void => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // 12.1 驱动物体自转与编组公转
  if (debugParams.autoRotate) {
    cube.rotation.y += debugParams.rotationSpeed * deltaTime;
    cube.rotation.x += debugParams.rotationSpeed * 0.5 * deltaTime;

    carGroup.rotation.y += 1 * deltaTime;

    box1.rotation.y += 3 * deltaTime;
    box2.rotation.x += 3 * deltaTime;
  }

  // 12.2 让 100 个甜甜圈在空中轻盈翻滚
  for (const donut of donuts) {
    donut.rotation.x += 0.2 * deltaTime;
    donut.rotation.y += 0.3 * deltaTime;
  }

  // 12.3 萤火虫副光源环绕游弋
  if (debugParams.flyFireLight) {
    fireLight.position.x = Math.sin(elapsedTime * 1.2) * 3.5;
    fireLight.position.z = Math.cos(elapsedTime * 1.2) * 3.5;
    fireLight.position.y = Math.sin(elapsedTime * 2.5) * 1.2 + 1.2;
  }

  // 12.4 动态更新辅助线锥体
  if (debugParams.showHelper) {
    if (debugParams.activeLightType === 'SpotLight') {
      spotLightHelper.update();
    } else if (debugParams.activeLightType === 'DirectionalLight') {
      dirLightHelper.update();
    }
  }

  // 动态更新阴影相机视锥体盒子
  if (debugParams.showShadowCamera && debugParams.activeLightType === 'DirectionalLight') {
    shadowCameraHelper.update();
  }

  // 12.5 更新轨道控制器阻尼
  controls.update();

  // 12.6 单帧渲染输出
  renderer.render(scene, camera);

  // 12.7 递归下一帧
  window.requestAnimationFrame(tick);
};

// 启动渲染循环
tick();
