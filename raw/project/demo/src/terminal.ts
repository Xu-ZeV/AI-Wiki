import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * ============================================================================
 * 武汉交投 · 自助交易终端（Self-Service Transaction Terminal）3D 数字孪生精细化工程
 * V3.0 重大工业机电逻辑重构：
 * 1. 投卡抽屉动力学：根据真实机电原理，蓝色 RFID 触碰后，下方投卡托盘如抽屉般平滑向前伸出（0.16m），
 *    彻底移除上部生硬开缝，司机直接将卡投进伸出的凹槽托盘中，支持自动延时缩回与滑块无级控制。
 * 2. 前脸底色重构：前立面内凹底板彻底纠正为工程浅灰色（#c8cbd0），与深黑工位区域形成鲜明工业反差，
 *    中间椭圆正式确立为对讲播放器（Speaker / Intercom）独立构件。
 * 3. 门控系统精准修正：根据工程图纸核实，前脸为固定刚性承重面板，后部为单扇大开门；
 *    彻底移除图三误标的「前主检修门」与「后右检修门」，保留真正的「后检修门」、「左侧票据门」与「右侧展板门」。
 * ============================================================================
 */

// 1. 视口与基础参数
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
if (!canvas) {
  throw new Error('未找到 canvas.webgl 元素');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181a1f);
scene.fog = new THREE.FogExp2(0x181a1f, 0.035);

// 2. 摄像机系统
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3.0, 2.0, 3.8);
scene.add(camera);

// 3. 渲染器系统
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

// 4. 轨道控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.25, 0);
controls.maxPolarAngle = Math.PI / 2 + 0.02;
controls.minDistance = 1.0;
controls.maxDistance = 12;

// 5. 光照系统
const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
scene.add(ambientLight);

// 主平行光
const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
mainLight.position.set(4, 6, 3.5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(1024, 1024);
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 16;
mainLight.shadow.camera.left = -3;
mainLight.shadow.camera.right = 3;
mainLight.shadow.camera.top = 3.5;
mainLight.shadow.camera.bottom = -1;
mainLight.shadow.bias = -0.0003;
mainLight.shadow.normalBias = 0.02;
scene.add(mainLight);

// 侧方冷色轮廓光
const rimLight = new THREE.DirectionalLight(0x7bc4ff, 1.4);
rimLight.position.set(-4, 3, -3);
scene.add(rimLight);

// 底部暖光补光
const bounceLight = new THREE.DirectionalLight(0xffb077, 0.5);
bounceLight.position.set(0, -2, 2);
scene.add(bounceLight);

// 6. 展示地面与圆形科技感展台
const floorGeo = new THREE.PlaneGeometry(24, 24);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x111317,
  roughness: 0.85,
  metalness: 0.2,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.01;
floor.receiveShadow = true;
scene.add(floor);

// 圆形展台
const podiumGeo = new THREE.CylinderGeometry(2.2, 2.3, 0.04, 64);
const podiumMat = new THREE.MeshStandardMaterial({
  color: 0x1d222a,
  roughness: 0.6,
  metalness: 0.4,
});
const podium = new THREE.Mesh(podiumGeo, podiumMat);
podium.position.y = 0.02;
podium.receiveShadow = true;
scene.add(podium);

const podiumRingGeo = new THREE.RingGeometry(2.15, 2.22, 64);
const podiumRingMat = new THREE.MeshBasicMaterial({
  color: 0x00ff66,
  side: THREE.DoubleSide,
});
const podiumRing = new THREE.Mesh(podiumRingGeo, podiumRingMat);
podiumRing.rotation.x = -Math.PI * 0.5;
podiumRing.position.y = 0.042;
scene.add(podiumRing);

/**
 * ============================================================================
 * 7. 静态截图资源加载管线（对接 public/textures/）
 * ============================================================================
 */
const textureLoader = new THREE.TextureLoader();

function loadSRGBTexture(path: string): THREE.Texture {
  const tex = textureLoader.load(path);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

const textures = {
  stationScreen: loadSRGBTexture('/textures/station-screen.png'),         // 小麦机器人与收费系统界面
  stationPanelDetail: loadSRGBTexture('/textures/station-card-slot.png'), // 中间固定区域专享：纯净“↓ 请投卡 ↓”      // 抽屉前封板（故障/求助/RFID指示）
  frontBrand: loadSRGBTexture('/textures/brand-text.png'),              // 武汉交投标牌与竖排文字
  rightView: loadSRGBTexture('/textures/right-view.png'),                // 投卡缴费 绿色通行大展板
  backView: loadSRGBTexture('/textures/back-view.png'),                  // 后单门百叶窗与英文标识
  leftView: loadSRGBTexture('/textures/left-view.png'),                  // 左侧辅助屏幕与发票槽
};

/**
 * ============================================================================
 * 8. 材质库配置（PBR Metallic-Roughness 标准工程材质）
 * ============================================================================
 */
const materials = {
  // 机身经典工程安全橙（静电粉末喷涂哑光金属）
  cabinetOrange: new THREE.MeshStandardMaterial({
    color: 0xdf661e,
    roughness: 0.32,
    metalness: 0.15,
  }),
  // 前立面左侧工位面板底色（标准工程中冷灰，严格对齐图 2 图纸箭头标注“灰色”）
  fasciaGrey: new THREE.MeshStandardMaterial({
    color: 0x45484c,
    roughness: 0.48,
    metalness: 0.22,
  }),
  // 坚固深灰黑色构件（工位外框、底座）
  darkMetal: new THREE.MeshStandardMaterial({
    color: 0x20242a,
    roughness: 0.45,
    metalness: 0.65,
  }),
  // 工位区域深黑哑光底色
  stationBlack: new THREE.MeshStandardMaterial({
    color: 0x141619,
    roughness: 0.55,
    metalness: 0.2,
  }),
  // 电动抽屉内部收纳凹槽金属
  drawerInterior: new THREE.MeshStandardMaterial({
    color: 0x2a2f36,
    roughness: 0.3,
    metalness: 0.7,
  }),
  // 机柜内部镀锌角钢导轨
  internalWall: new THREE.MeshStandardMaterial({
    color: 0x14181e,
    roughness: 0.7,
    metalness: 0.3,
    side: THREE.DoubleSide,
  }),
  internalChassis: new THREE.MeshStandardMaterial({
    color: 0x8a929b,
    roughness: 0.35,
    metalness: 0.8,
  }),
  // 荧光绿自发光导光条
  neonGreen: new THREE.MeshStandardMaterial({
    color: 0x00ff44,
    emissive: 0x00ff44,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.1,
  }),
  // 红色警示灯罩
  beaconRedGlass: new THREE.MeshStandardMaterial({
    color: 0xff0022,
    emissive: 0xff0022,
    emissiveIntensity: 1.4,
    transparent: true,
    opacity: 0.85,
    roughness: 0.1,
    metalness: 0.2,
  }),
  // 镀铬不锈钢把手与吊环
  chrome: new THREE.MeshStandardMaterial({
    color: 0xeef1f5,
    roughness: 0.15,
    metalness: 0.95,
  }),
  // 红色物理按键材质（故障）
  buttonRed: new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.1,
  }),
  // 黄色物理按键材质（求助）
  buttonYellow: new THREE.MeshStandardMaterial({
    color: 0xeab308,
    emissive: 0x713f12,
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.1,
  }),
  // 扫码窗发光白玻璃
  scannerGlass: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.2,
  }),
  // RFID 刷卡感应与受卡插口发光浅蓝（图 3 红框中间）
  rfidBlue: new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.25,
    metalness: 0.2,
  }),
};

/**
 * ============================================================================
 * 9. 参数化 3D 机柜整体架构搭建
 * ============================================================================
 */
const kioskRoot = new THREE.Group();
scene.add(kioskRoot);

const mainCabinetHeight = 2.15;
const mainCabinetWidth = 1.08;
const mainCabinetDepth = 0.78;

// ----------------------------------------------------------------------------
// 9.1 底座总成（Base Foundation）
// ----------------------------------------------------------------------------
const baseGroup = new THREE.Group();
kioskRoot.add(baseGroup);

const plinthGeo = new THREE.BoxGeometry(1.22, 0.12, 0.94);
const plinthMesh = new THREE.Mesh(plinthGeo, materials.darkMetal);
plinthMesh.position.y = 0.06;
plinthMesh.castShadow = true;
plinthMesh.receiveShadow = true;
baseGroup.add(plinthMesh);

const plinthStepGeo = new THREE.BoxGeometry(1.14, 0.08, 0.86);
const plinthStepMesh = new THREE.Mesh(plinthStepGeo, materials.darkMetal);
plinthStepMesh.position.y = 0.16;
plinthStepMesh.castShadow = true;
baseGroup.add(plinthStepMesh);

const baseNeonGeo = new THREE.BoxGeometry(0.5, 0.024, 0.03);
const baseNeon = new THREE.Mesh(baseNeonGeo, materials.neonGreen);
baseNeon.position.set(0, 0.12, 0.475);
baseGroup.add(baseNeon);

// ----------------------------------------------------------------------------
// 9.2 固定机身与内部结构（Internal Structure）
// ----------------------------------------------------------------------------
const bodyGroup = new THREE.Group();
bodyGroup.position.y = 0.2;
kioskRoot.add(bodyGroup);

// 机舱内底板与内顶板（空心框架）
const chassisFloor = new THREE.Mesh(
  new THREE.BoxGeometry(mainCabinetWidth - 0.04, 0.03, mainCabinetDepth - 0.04),
  materials.internalWall
);
chassisFloor.position.y = 0.015;
bodyGroup.add(chassisFloor);

const chassisCeiling = new THREE.Mesh(
  new THREE.BoxGeometry(mainCabinetWidth - 0.04, 0.03, mainCabinetDepth - 0.04),
  materials.internalWall
);
chassisCeiling.position.y = mainCabinetHeight - 0.015;
bodyGroup.add(chassisCeiling);

// 四个角钢橙色转角立柱（形成框架立骨）
const cornerPillarGeo = new THREE.BoxGeometry(0.06, mainCabinetHeight, 0.06);
const cornerPositions = [
  [-mainCabinetWidth * 0.5 + 0.03, mainCabinetDepth * 0.5 - 0.03],
  [mainCabinetWidth * 0.5 - 0.03, mainCabinetDepth * 0.5 - 0.03],
  [-mainCabinetWidth * 0.5 + 0.03, -mainCabinetDepth * 0.5 + 0.03],
  [mainCabinetWidth * 0.5 - 0.03, -mainCabinetDepth * 0.5 + 0.03],
];

for (const [cx, cz] of cornerPositions) {
  const pMesh = new THREE.Mesh(cornerPillarGeo, materials.cabinetOrange);
  pMesh.position.set(cx, mainCabinetHeight * 0.5, cz);
  pMesh.castShadow = true;
  bodyGroup.add(pMesh);
}

// 内部 19 寸机柜镀锌安装导轨
const railGeo = new THREE.BoxGeometry(0.04, mainCabinetHeight * 0.88, 0.04);
const railPositions = [
  [-0.38, 0.26],
  [0.38, 0.26],
  [-0.38, -0.26],
  [0.38, -0.26],
];
for (const [rx, rz] of railPositions) {
  const rail = new THREE.Mesh(railGeo, materials.internalChassis);
  rail.position.set(rx, mainCabinetHeight * 0.5, rz);
  bodyGroup.add(rail);
}

// 内部设备隔板与工控机盒
const internalShelf = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 0.02, 0.55),
  materials.internalChassis
);
internalShelf.position.set(0, 1.15, 0);
bodyGroup.add(internalShelf);

const internalIpcBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.16, 0.36),
  new THREE.MeshStandardMaterial({ color: 0x333a42, roughness: 0.4, metalness: 0.6 })
);
internalIpcBox.position.set(0, 1.25, 0);
bodyGroup.add(internalIpcBox);

// 内部维修照明 LED 灯条
const internalLed = new THREE.PointLight(0xffffff, 1.5, 2.5);
internalLed.position.set(0, 1.8, 0);
bodyGroup.add(internalLed);

// ----------------------------------------------------------------------------
// 9.3 核心精简重构：仅中间“↓ 请投卡 ↓”使用贴图，第 2 层与第 4 层彻底移除贴图采用纯几何建模
// ----------------------------------------------------------------------------
interface StationParts {
  group: THREE.Group;
  drawerGroup: THREE.Group; // 图 3 红框指定的伸缩抽屉托盘
  rfidPlate: THREE.Mesh;    // RFID / 插卡槽点击感应触发器
  redButton: THREE.Mesh;
  yellowButton: THREE.Mesh;
  setDrawerOpen: (ratio: number) => void;
  triggerAutoDrawer: () => void;
}

const allStations: StationParts[] = [];
const interactiveRfidPlates: THREE.Mesh[] = [];
const interactiveButtons: THREE.Mesh[] = [];

function createInteractionStation(yCenter: number): StationParts {
  const station = new THREE.Group();
  station.position.set(-0.16, yCenter, 0.035);

  // 1. 工位区域深黑保护外框
  const frameGeo = new THREE.BoxGeometry(0.56, 0.68, 0.03);
  const frame = new THREE.Mesh(frameGeo, materials.stationBlack);
  frame.castShadow = true;
  station.add(frame);

  // 2. 液晶显示屏总成（小麦机器人收费界面）
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.50, 0.28),
    new THREE.MeshBasicMaterial({ map: textures.stationScreen })
  );
  screenMesh.position.set(0, 0.175, 0.016);
  station.add(screenMesh);

  // ==================== 第 2 层：扫码付款区（纯几何建模，无任何贴图） ====================
  const scanPanelGeo = new THREE.BoxGeometry(0.50, 0.065, 0.015);
  const scanPanel = new THREE.Mesh(scanPanelGeo, materials.darkMetal);
  scanPanel.position.set(0, -0.015, 0.015);
  station.add(scanPanel);

  // 扫码窗发光白玻璃（中间发光白色扫码口，无贴图）
  const scannerWindow = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.045, 0.008),
    materials.scannerGlass
  );
  scannerWindow.position.set(0, -0.015, 0.023);
  station.add(scannerWindow);

  // ==================== 第 3 层：中间固定区域（专属贴图：纯净“↓ 请投卡 ↓”） ====================
  const fixedSlotPanelGeo = new THREE.BoxGeometry(0.50, 0.125, 0.02);
  const fixedSlotPanel = new THREE.Mesh(fixedSlotPanelGeo, materials.stationBlack);
  fixedSlotPanel.position.set(0, -0.12, 0.015);
  station.add(fixedSlotPanel);

  // 中间区域专用贴图：“↓ 请投卡 ↓”（无任何多余扫码窗或按钮）
  const slotPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.12),
    new THREE.MeshStandardMaterial({ map: textures.stationPanelDetail, roughness: 0.4 })
  );
  slotPlate.position.set(0, -0.12, 0.026);
  station.add(slotPlate);

  // ==================== 第 4 层：下方电动伸缩抽屉机构（纯几何建模，无任何贴图） ====================
  const drawerChamberGeo = new THREE.BoxGeometry(0.50, 0.08, 0.22);
  const drawerChamber = new THREE.Mesh(drawerChamberGeo, materials.darkMetal);
  drawerChamber.position.set(0, -0.235, -0.08);
  station.add(drawerChamber);

  const drawerGroup = new THREE.Group();
  drawerGroup.position.set(0, -0.235, 0.015);
  station.add(drawerGroup);

  // 抽屉前封板（深黑哑光实体板，无贴图）
  const drawerFrontPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.075, 0.02),
    materials.stationBlack
  );
  drawerFrontPanel.position.set(0, 0, 0.01);
  drawerFrontPanel.castShadow = true;
  drawerGroup.add(drawerFrontPanel);

  // 抽屉内部下凹受卡托盘（Bucket / Tray，司机真正把卡投进这里！）
  const trayDepth = 0.16; // 伸出行程约 16 厘米
  const trayWidth = 0.44;
  const trayHeight = 0.055;

  const trayCavity = new THREE.Mesh(
    new THREE.BoxGeometry(trayWidth, trayHeight, trayDepth),
    materials.drawerInterior
  );
  trayCavity.position.set(0, 0.01, -trayDepth * 0.5);
  trayCavity.castShadow = true;
  drawerGroup.add(trayCavity);

  // 托盘内部绿色导光提示条
  const trayGuideLed = new THREE.Mesh(
    new THREE.BoxGeometry(trayWidth * 0.8, 0.005, 0.01),
    new THREE.MeshBasicMaterial({ color: 0x00ff88 })
  );
  trayGuideLed.position.set(0, 0.035, -0.02);
  drawerGroup.add(trayGuideLed);

  // 抽屉前板实体构件（纯几何材质，无贴图）：
  // 1. 左侧：红色【故障】机械按钮
  const redBtnBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.026, 0.012, 24),
    materials.darkMetal
  );
  redBtnBase.rotation.x = Math.PI * 0.5;
  redBtnBase.position.set(-0.14, 0, 0.021);
  drawerGroup.add(redBtnBase);

  const redButton = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.016, 24),
    materials.buttonRed
  );
  redButton.rotation.x = Math.PI * 0.5;
  redButton.position.set(-0.14, 0, 0.028);
  drawerGroup.add(redButton);
  interactiveButtons.push(redButton);

  // 2. 中间：浅蓝色【RFID 刷卡感应与受卡插口】实体块（纯物理发光材质，点击触发抽屉自动滑出！）
  const rfidPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.048, 0.014),
    materials.rfidBlue
  );
  rfidPlate.position.set(0, 0, 0.022);
  drawerGroup.add(rfidPlate);
  interactiveRfidPlates.push(rfidPlate);

  // 3. 右侧：黄色【求助】机械按钮
  const yellowBtnBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.026, 0.012, 24),
    materials.darkMetal
  );
  yellowBtnBase.rotation.x = Math.PI * 0.5;
  yellowBtnBase.position.set(0.14, 0, 0.021);
  drawerGroup.add(yellowBtnBase);

  const yellowButton = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.016, 24),
    materials.buttonYellow
  );
  yellowButton.rotation.x = Math.PI * 0.5;
  yellowButton.position.set(0.14, 0, 0.028);
  drawerGroup.add(yellowButton);
  interactiveButtons.push(yellowButton);

  // 抽屉无级平移函数（0: 完全收拢, 1: 完全伸出 0.16m）
  const setDrawerOpen = (ratio: number) => {
    drawerGroup.position.z = 0.015 + ratio * trayDepth;
  };

  // 自动模拟投卡交互流程：触碰 RFID -> 自动平滑滑出 -> 停留 3 秒 -> 自动缩回
  let autoTimer: number | null = null;
  const triggerAutoDrawer = () => {
    if (autoTimer) clearTimeout(autoTimer);
    let p = 0;
    const slideOut = () => {
      p += 0.06;
      setDrawerOpen(Math.min(p, 1));
      if (p < 1) {
        requestAnimationFrame(slideOut);
      } else {
        // 停顿 3 秒模拟司机将通行卡投入托盘内
        autoTimer = window.setTimeout(() => {
          let b = 1;
          const slideBack = () => {
            b -= 0.05;
            setDrawerOpen(Math.max(b, 0));
            if (b > 0) requestAnimationFrame(slideBack);
          };
          slideBack();
        }, 3000);
      }
    };
    slideOut();
  };

  const stationData: StationParts = {
    group: station,
    drawerGroup,
    rfidPlate,
    redButton,
    yellowButton,
    setDrawerOpen,
    triggerAutoDrawer,
  };
  allStations.push(stationData);
  return stationData;
}

// ----------------------------------------------------------------------------
// 9.4 前立面总成（工程中灰操作区 + 右侧橙色展板 + 真实平滑反 C 型流线导光条）
// ----------------------------------------------------------------------------
const frontGroup = new THREE.Group();
frontGroup.position.set(0, 0.2, mainCabinetDepth * 0.5);
kioskRoot.add(frontGroup);

// 1. 左侧工程中灰操作面板（工位背景底板，覆盖上下工位及底部，严格吻合图 2 标注的“灰色”）
// 宽 0.70m，从最左边缘 x=-0.52 延伸至交界线 x=0.18
const frontLeftFascia = new THREE.Mesh(
  new THREE.BoxGeometry(0.70, mainCabinetHeight * 0.94, 0.025),
  materials.fasciaGrey
);
frontLeftFascia.position.set(-0.17, mainCabinetHeight * 0.5, 0.012);
frontGroup.add(frontLeftFascia);

// 2. 右侧工程安全橙品牌展板底座（宽 0.36m，从 x=0.18 延伸至 x=0.54）
const frontRightOrangePanel = new THREE.Mesh(
  new THREE.BoxGeometry(0.36, mainCabinetHeight * 0.94, 0.025),
  materials.cabinetOrange
);
frontRightOrangePanel.position.set(0.36, mainCabinetHeight * 0.5, 0.012);
frontGroup.add(frontRightOrangePanel);

// 3. 右侧武汉交投品牌标牌贴图（使用纯净透明贴图，开启 depthWrite: false 彻底杜绝闪烁 bug）
const brandBoardMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(0.32, 1.82),
  new THREE.MeshStandardMaterial({
    map: textures.frontBrand,
    transparent: true,
    depthWrite: false, // 彻底消除深度缓冲区重叠闪烁
    roughness: 0.35,
  })
);
brandBoardMesh.position.set(0.36, mainCabinetHeight * 0.5, 0.026);
frontGroup.add(brandBoardMesh);

// 4. 标志性三维平滑荧光绿流线导光条（严格对齐图 2 图纸走势）：
// 走势为反 C 型包边：工位上方水平段 -> 右上角圆弧 -> 沿灰/橙分界线垂直向下 -> 右下角圆弧 -> 工位底部水平段
// 注意：机柜左侧边缘没有任何垂直灯带！
const neonPath = new THREE.CurvePath<THREE.Vector3>();

// 4.1 顶部水平导光段（从左侧 x=-0.48 延伸至右上转弯点 x=0.14）
neonPath.add(new THREE.LineCurve3(new THREE.Vector3(-0.48, 1.98, 0), new THREE.Vector3(0.14, 1.98, 0)));

// 4.2 右上角平滑圆弧弯折（向右下方圆滑转折，半径约 4cm）
neonPath.add(new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(0.14, 1.98, 0),
  new THREE.Vector3(0.18, 1.98, 0),
  new THREE.Vector3(0.18, 1.94, 0)
));

// 4.3 纵向主导光条（沿着中灰工位与安全橙展板的分界线 x=0.18，垂直贯穿上下）
neonPath.add(new THREE.LineCurve3(new THREE.Vector3(0.18, 1.94, 0), new THREE.Vector3(0.18, 0.34, 0)));

// 4.4 右下角平滑圆弧弯折（向左下方圆滑转折）
neonPath.add(new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(0.18, 0.34, 0),
  new THREE.Vector3(0.18, 0.30, 0),
  new THREE.Vector3(0.14, 0.30, 0)
));

// 4.5 底部水平导光段（沿着下工位底部向左延伸至 x=-0.48）
neonPath.add(new THREE.LineCurve3(new THREE.Vector3(0.14, 0.30, 0), new THREE.Vector3(-0.48, 0.30, 0)));

// 构建连续平滑的实体导光条管体
const neonContourGeo = new THREE.TubeGeometry(neonPath, 96, 0.012, 12, false);
const neonContourMesh = new THREE.Mesh(neonContourGeo, materials.neonGreen);
neonContourMesh.position.z = 0.024;
frontGroup.add(neonContourMesh);

// 5. 顶部监控摄像头总成（对准工位中轴 x=-0.16）
const cameraHousing = new THREE.Mesh(
  new THREE.CylinderGeometry(0.038, 0.048, 0.035, 24),
  materials.darkMetal
);
cameraHousing.rotation.x = Math.PI * 0.5;
cameraHousing.position.set(-0.16, 2.02, 0.035);
frontGroup.add(cameraHousing);

const cameraLens = new THREE.Mesh(
  new THREE.SphereGeometry(0.022, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.1, metalness: 0.95 })
);
cameraLens.position.set(-0.16, 2.02, 0.052);
frontGroup.add(cameraLens);

// 6. 装配上层与下层双工位交互单元（上层货车 1.58m，下层客车 0.76m）
const upperStation = createInteractionStation(1.58);
frontGroup.add(upperStation.group);

// 7. 中间对讲播放器（Speaker / Intercom）独立实体构件，居中在 x=-0.16
const speakerGroup = new THREE.Group();
speakerGroup.position.set(-0.16, 1.17, 0.028);
frontGroup.add(speakerGroup);

// 对讲播放器外框（跑道圆角形长方体）
const speakerBezel = new THREE.Mesh(
  new THREE.BoxGeometry(0.44, 0.08, 0.015),
  materials.darkMetal
);
speakerGroup.add(speakerBezel);

// 细密冲孔金属网面
const speakerGrill = new THREE.Mesh(
  new THREE.PlaneGeometry(0.40, 0.06),
  new THREE.MeshStandardMaterial({
    color: 0x111315,
    roughness: 0.8,
    metalness: 0.5,
  })
);
speakerGrill.position.z = 0.009;
speakerGroup.add(speakerGrill);

const lowerStation = createInteractionStation(0.76);
frontGroup.add(lowerStation.group);

// 8. 下工位下方偏左的检修锁孔盖板（严格依照图 2 正视图细节）
const keyholeHatch = new THREE.Mesh(
  new THREE.BoxGeometry(0.07, 0.07, 0.01),
  materials.darkMetal
);
keyholeHatch.position.set(-0.35, 0.40, 0.026);
frontGroup.add(keyholeHatch);

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// 9.5 真实后立面总成（永久左侧固定立柱标识+百叶窗，右侧真实【后检修门】控件）
// ----------------------------------------------------------------------------
const rearGroup = new THREE.Group();
rearGroup.position.set(0, 0.2, -mainCabinetDepth * 0.5);
kioskRoot.add(rearGroup);

// 1. 固定左侧立柱（宽 0.32m，永久展示“SELF-SERVICE PAYMENT DEVICE”与百叶窗，开门关门均可见！）
const rearLeftPillarWidth = 0.32;
const rearPillarGroup = new THREE.Group();
rearPillarGroup.position.set(-mainCabinetWidth * 0.5 + rearLeftPillarWidth * 0.5, mainCabinetHeight * 0.5, 0);
rearGroup.add(rearPillarGroup);

const rearPillarMesh = new THREE.Mesh(
  new THREE.BoxGeometry(rearLeftPillarWidth, mainCabinetHeight, 0.04),
  materials.cabinetOrange
);
rearPillarMesh.castShadow = true;
rearPillarGroup.add(rearPillarMesh);

// 固定立柱贴图面（英文标识与百叶窗排气孔，面向外侧 -Z）
const rearPillarFace = new THREE.Mesh(
  new THREE.PlaneGeometry(rearLeftPillarWidth * 0.95, mainCabinetHeight * 0.95),
  new THREE.MeshStandardMaterial({ map: textures.backView, roughness: 0.4 })
);
rearPillarFace.rotation.y = Math.PI;
rearPillarFace.position.set(0, 0, -0.022);
rearPillarGroup.add(rearPillarFace);

// 2. 真实的【后检修门控件】（覆盖右侧 0.72m 门洞，带门轴铰链、门扇、内部衬板与锁栓）
const rearDoorWidth = mainCabinetWidth - rearLeftPillarWidth - 0.04;
const rearDoorHeight = mainCabinetHeight * 0.96;

// 铰链轴心位于门框右外边缘（x = +mainCabinetWidth*0.5 - 0.02），向后外方顺畅打开 0°~110°
const rearDoorHinge = new THREE.Group();
rearDoorHinge.position.set(mainCabinetWidth * 0.5 - 0.02, mainCabinetHeight * 0.5, 0);
rearGroup.add(rearDoorHinge);

// 门扇本体（从铰链向左偏移半宽）
const rearDoorLeaf = new THREE.Group();
rearDoorLeaf.position.set(-rearDoorWidth * 0.5, 0, 0);
rearDoorHinge.add(rearDoorLeaf);

// 门扇橙色外壳钣金
const rearDoorMesh = new THREE.Mesh(
  new THREE.BoxGeometry(rearDoorWidth, rearDoorHeight, 0.025),
  materials.cabinetOrange
);
rearDoorMesh.castShadow = true;
rearDoorLeaf.add(rearDoorMesh);

// 门内侧深色工业衬板（开门时呈现专业钣金折边质感）
const rearDoorLining = new THREE.Mesh(
  new THREE.PlaneGeometry(rearDoorWidth * 0.96, rearDoorHeight * 0.96),
  materials.internalWall
);
rearDoorLining.position.set(0, 0, 0.014);
rearDoorLeaf.add(rearDoorLining);

// 门正面橙色压边框线（微凸 2 毫米，面向外侧 -Z）
const rearDoorTrim = new THREE.Mesh(
  new THREE.BoxGeometry(rearDoorWidth * 0.92, rearDoorHeight * 0.92, 0.006),
  materials.cabinetOrange
);
rearDoorTrim.position.set(0, 0, -0.015);
rearDoorLeaf.add(rearDoorTrim);

// 镀铬垂直执手门锁（位于门左侧开启边缘）
const rearLockHandle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.012, 0.012, 0.16, 16),
  materials.chrome
);
rearLockHandle.position.set(-rearDoorWidth * 0.42, 0, -0.026);
rearDoorLeaf.add(rearLockHandle);

// ----------------------------------------------------------------------------
// 9.6 真实的【左侧检修/票据门控件】（Left Side Door Component）
// ----------------------------------------------------------------------------
// 左侧门宽 0.64m，门轴铰链位于前柱内侧（z = +mainCabinetDepth*0.5 - 0.06），向左前方开合 0°~95°
const leftDoorWidth = mainCabinetDepth * 0.84;
const leftDoorHeight = mainCabinetHeight * 0.94;

const leftDoorHinge = new THREE.Group();
leftDoorHinge.position.set(-mainCabinetWidth * 0.5, 0.2 + mainCabinetHeight * 0.5, mainCabinetDepth * 0.5 - 0.06);
kioskRoot.add(leftDoorHinge);

const leftDoorLeaf = new THREE.Group();
leftDoorLeaf.position.set(0, 0, -leftDoorWidth * 0.5);
leftDoorHinge.add(leftDoorLeaf);

// 左侧门扇钣金
const leftDoorMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0.025, leftDoorHeight, leftDoorWidth),
  materials.cabinetOrange
);
leftDoorMesh.castShadow = true;
leftDoorLeaf.add(leftDoorMesh);

// 门内侧深色工业衬板
const leftDoorLining = new THREE.Mesh(
  new THREE.PlaneGeometry(leftDoorWidth * 0.96, leftDoorHeight * 0.96),
  materials.internalWall
);
leftDoorLining.rotation.y = Math.PI * 0.5;
leftDoorLining.position.set(0.014, 0, 0);
leftDoorLeaf.add(leftDoorLining);

// 左侧原图贴图面（副屏与票据出钞口，面向外侧 -X）
const leftViewFace = new THREE.Mesh(
  new THREE.PlaneGeometry(leftDoorWidth * 0.96, leftDoorHeight * 0.96),
  new THREE.MeshStandardMaterial({ map: textures.leftView, roughness: 0.4 })
);
leftViewFace.rotation.y = -Math.PI * 0.5;
leftViewFace.position.set(-0.014, 0, 0);
leftDoorLeaf.add(leftViewFace);

// 左侧门把手（位于门后边缘开门口，方向朝外）
const leftHandle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.01, 0.01, 0.14, 16),
  materials.chrome
);
leftHandle.position.set(-0.025, -0.32, -leftDoorWidth * 0.38);
leftDoorLeaf.add(leftHandle);

// 左后侧外挂保护箱（固定在外壳柱上）
const sideJunctionBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.12, 0.36, 0.28),
  new THREE.MeshStandardMaterial({ color: 0xdddddf, roughness: 0.3 })
);
sideJunctionBox.position.set(-mainCabinetWidth * 0.5 - 0.06, 1.25, -mainCabinetDepth * 0.28);
sideJunctionBox.castShadow = true;
kioskRoot.add(sideJunctionBox);

// ----------------------------------------------------------------------------
// 9.7 真实的【右侧展示/维护门控件】（Right Side Door Component）
// ----------------------------------------------------------------------------
// 右侧门宽 0.64m，门轴铰链位于前柱内侧（z = +mainCabinetDepth*0.5 - 0.06），向右前方开合 0°~95°
const rightDoorWidth = mainCabinetDepth * 0.84;
const rightDoorHeight = mainCabinetHeight * 0.94;

const rightDoorHinge = new THREE.Group();
rightDoorHinge.position.set(mainCabinetWidth * 0.5, 0.2 + mainCabinetHeight * 0.5, mainCabinetDepth * 0.5 - 0.06);
kioskRoot.add(rightDoorHinge);

const rightDoorLeaf = new THREE.Group();
rightDoorLeaf.position.set(0, 0, -rightDoorWidth * 0.5);
rightDoorHinge.add(rightDoorLeaf);

// 右侧门扇钣金
const rightDoorMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0.025, rightDoorHeight, rightDoorWidth),
  materials.cabinetOrange
);
rightDoorMesh.castShadow = true;
rightDoorLeaf.add(rightDoorMesh);

// 门内侧深色工业衬板
const rightDoorLining = new THREE.Mesh(
  new THREE.PlaneGeometry(rightDoorWidth * 0.96, rightDoorHeight * 0.96),
  materials.internalWall
);
rightDoorLining.rotation.y = -Math.PI * 0.5;
rightDoorLining.position.set(-0.014, 0, 0);
rightDoorLeaf.add(rightDoorLining);

// 右侧大幅“投卡缴费 绿色通行”贴图面（面向外侧 +X）
const rightViewFace = new THREE.Mesh(
  new THREE.PlaneGeometry(rightDoorWidth * 0.96, rightDoorHeight * 0.96),
  new THREE.MeshStandardMaterial({ map: textures.rightView, roughness: 0.4 })
);
rightViewFace.rotation.y = Math.PI * 0.5;
rightViewFace.position.set(0.014, 0, 0);
rightDoorLeaf.add(rightViewFace);

// 右侧门把手（位于门后边缘开门口，方向朝外）
const rightHandle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.01, 0.01, 0.14, 16),
  materials.chrome
);
rightHandle.position.set(0.025, 0, -rightDoorWidth * 0.38);
rightDoorLeaf.add(rightHandle);

// 9.8 顶盖与警示灯总成（Roof Panel, Beacon Light & Eyebolts）
// ----------------------------------------------------------------------------
const roofGroup = new THREE.Group();
roofGroup.position.set(0, 0.2 + mainCabinetHeight, 0);
kioskRoot.add(roofGroup);

const roofCapGeo = new THREE.BoxGeometry(mainCabinetWidth * 1.04, 0.06, mainCabinetDepth * 1.04);
const roofCap = new THREE.Mesh(roofCapGeo, materials.darkMetal);
roofCap.position.y = 0.03;
roofCap.castShadow = true;
roofGroup.add(roofCap);

// 四角起重机吊装圆环
const eyeboltCoords = [
  [-0.46, 0.32],
  [0.46, 0.32],
  [-0.46, -0.32],
  [0.46, -0.32],
];

for (const [x, z] of eyeboltCoords) {
  const eyeboltBase = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.04, 16), materials.chrome);
  eyeboltBase.position.set(x, 0.07, z);
  roofGroup.add(eyeboltBase);

  const ringGeo = new THREE.TorusGeometry(0.03, 0.008, 12, 24);
  const ringMesh = new THREE.Mesh(ringGeo, materials.chrome);
  ringMesh.rotation.y = Math.PI * 0.25;
  ringMesh.position.set(x, 0.11, z);
  roofGroup.add(ringMesh);
}

// 顶部高亮度旋转警示灯
const beaconGroup = new THREE.Group();
beaconGroup.position.set(0.14, 0.06, 0.15);
roofGroup.add(beaconGroup);

const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.048, 0.06, 24), materials.darkMetal);
beaconBase.position.y = 0.03;
beaconGroup.add(beaconBase);

const beaconGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.038, 0.14, 24), materials.beaconRedGlass);
beaconGlass.position.y = 0.13;
beaconGroup.add(beaconGlass);

const beaconLightCore = new THREE.Mesh(
  new THREE.BoxGeometry(0.02, 0.08, 0.04),
  new THREE.MeshBasicMaterial({ color: 0xff3344 })
);
beaconLightCore.position.y = 0.13;
beaconGroup.add(beaconLightCore);

const beaconPointLight = new THREE.PointLight(0xff0022, 2.0, 5, 2);
beaconPointLight.position.set(0.14, 0.2 + mainCabinetHeight + 0.2, 0.15);
kioskRoot.add(beaconPointLight);

/**
 * ============================================================================
 * 10. lil-gui 控制中枢（核心改动 3：去除前主门与后右门，增加投卡抽屉控制）
 * ============================================================================
 */
const gui = new GUI({ title: '武汉交投 · 工业级精细化 3D 渲染台' });

// 10.1 电动投卡抽屉控制组（核心改动 1）
const drawerFolder = gui.addFolder('📥 电动投卡抽屉动力学 (Card Drawer)');
const drawerParams = {
  upperDrawer: 0,
  lowerDrawer: 0,
  triggerUpper: () => upperStation.triggerAutoDrawer(),
  triggerLower: () => lowerStation.triggerAutoDrawer(),
};

drawerFolder
  .add(drawerParams, 'upperDrawer', 0, 1, 0.01)
  .name('上层货车抽屉伸缩')
  .onChange((v: number) => upperStation.setDrawerOpen(v));

drawerFolder
  .add(drawerParams, 'lowerDrawer', 0, 1, 0.01)
  .name('下层轿车抽屉伸缩')
  .onChange((v: number) => lowerStation.setDrawerOpen(v));

drawerFolder.add(drawerParams, 'triggerUpper').name('模拟上工位感应投卡 💳');
drawerFolder.add(drawerParams, 'triggerLower').name('模拟下工位感应投卡 💳');

// 10.2 真实工业机门开合（核心改动 3：已剔除前主门与后右门，仅保留真实的三扇门）
const doorAngles = {
  rearDoor: 0,
  leftDoor: 0,
  rightDoor: 0,
};

const doorFolder = gui.addFolder('🚪 工业机门真实开合 (Door Controls)');

doorFolder
  .add(doorAngles, 'rearDoor', 0, 110, 1)
  .name('后检修门 (°)')
  .onChange((v: number) => {
    rearDoorHinge.rotation.y = (v * Math.PI) / 180;
  });

doorFolder
  .add(doorAngles, 'leftDoor', 0, 95, 1)
  .name('左侧票据门 (°)')
  .onChange((v: number) => {
    leftDoorHinge.rotation.y = (v * Math.PI) / 180;
  });

doorFolder
  .add(doorAngles, 'rightDoor', 0, 95, 1)
  .name('右侧展板门 (°)')
  .onChange((v: number) => {
    rightDoorHinge.rotation.y = -(v * Math.PI) / 180;
  });

const doorActions = {
  openAll: () => {
    let t = 0;
    const animOpen = () => {
      t += 0.05;
      const angle = Math.min(t, 1);
      doorAngles.rearDoor = angle * 105;
      doorAngles.leftDoor = angle * 90;
      doorAngles.rightDoor = angle * 90;

      rearDoorHinge.rotation.y = (doorAngles.rearDoor * Math.PI) / 180;
      leftDoorHinge.rotation.y = (doorAngles.leftDoor * Math.PI) / 180;
      rightDoorHinge.rotation.y = -(doorAngles.rightDoor * Math.PI) / 180;

      doorFolder.controllers.forEach((c) => c.updateDisplay());
      if (t < 1) requestAnimationFrame(animOpen);
    };
    animOpen();
  },
  closeAll: () => {
    let t = 0;
    const startRear = doorAngles.rearDoor;
    const startLeft = doorAngles.leftDoor;
    const startRight = doorAngles.rightDoor;

    const animClose = () => {
      t += 0.05;
      const factor = Math.max(1 - t, 0);
      doorAngles.rearDoor = startRear * factor;
      doorAngles.leftDoor = startLeft * factor;
      doorAngles.rightDoor = startRight * factor;

      rearDoorHinge.rotation.y = (doorAngles.rearDoor * Math.PI) / 180;
      leftDoorHinge.rotation.y = (doorAngles.leftDoor * Math.PI) / 180;
      rightDoorHinge.rotation.y = -(doorAngles.rightDoor * Math.PI) / 180;

      doorFolder.controllers.forEach((c) => c.updateDisplay());
      if (t < 1) requestAnimationFrame(animClose);
    };
    animClose();
  },
};

doorFolder.add(doorActions, 'openAll').name('一键全部打开 👐');
doorFolder.add(doorActions, 'closeAll').name('一键全部关合 🔒');

// 10.3 三视图机位切换
const viewFolder = gui.addFolder('工程三视图机位切换');

function switchCameraView(viewName: string): void {
  const target = new THREE.Vector3(0, 1.25, 0);
  controls.target.copy(target);

  switch (viewName) {
    case '主视图 (Front)':
      camera.position.set(0, 1.25, 4.6);
      break;
    case '后视图 (Back)':
      camera.position.set(0, 1.25, -4.6);
      break;
    case '左视图 (Left)':
      camera.position.set(-4.6, 1.25, 0);
      break;
    case '右视图 (Right)':
      camera.position.set(4.6, 1.25, 0);
      break;
    case '俯视图 (Top)':
      camera.position.set(0, 5.5, 0.01);
      break;
    default:
      camera.position.set(3.0, 2.0, 3.8);
      break;
  }
  controls.update();
}

viewFolder
  .add({ view: '3D透视全景' }, 'view', [
    '3D透视全景',
    '主视图 (Front)',
    '后视图 (Back)',
    '左视图 (Left)',
    '右视图 (Right)',
    '俯视图 (Top)',
  ])
  .name('切换视点')
  .onChange((v: string) => {
    switchCameraView(v);
  });

// 10.4 外观与灯光控制
const styleFolder = gui.addFolder('外观色彩与灯光');
styleFolder
  .addColor({ color: '#df661e' }, 'color')
  .name('机身橙色')
  .onChange((color: string) => {
    materials.cabinetOrange.color.set(color);
  });
styleFolder
  .add({ intensity: 1.2 }, 'intensity', 0, 3, 0.1)
  .name('绿色光带辉光')
  .onChange((val: number) => {
    materials.neonGreen.emissiveIntensity = val;
  });

const animFolder = gui.addFolder('展示巡检动画');
const animParams = { autoRotate: false, rotateSpeed: 0.6, beaconRotate: true };
animFolder.add(animParams, 'autoRotate').name('360° 全景自转');
animFolder.add(animParams, 'rotateSpeed', 0.1, 3, 0.1).name('自转速度');

/**
 * ============================================================================
 * 11. 光线投射交互（点击 RFID 触发抽屉伸出，点击红黄按键微动效）
 * ============================================================================
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-1000, -1000);

window.addEventListener('mousemove', (e: MouseEvent): void => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});

window.addEventListener('click', (): void => {
  raycaster.setFromCamera(mouse, camera);

  // 1. 点击蓝色 RFID 区域触发抽屉自动向外滑出
  const rfidHits = raycaster.intersectObjects(interactiveRfidPlates);
  if (rfidHits.length > 0) {
    const hitPlate = rfidHits[0].object as THREE.Mesh;
    const targetStation = allStations.find((s) => s.rfidPlate === hitPlate);
    if (targetStation) {
      console.log('[磁卡交互] 磁卡触碰蓝色 RFID 感应区，伺服电机驱动投卡抽屉平滑伸出...');
      targetStation.triggerAutoDrawer();
    }
    return;
  }

  // 2. 点击红黄按钮微动效
  const btnHits = raycaster.intersectObjects(interactiveButtons);
  if (btnHits.length > 0) {
    const hitBtn = btnHits[0].object as THREE.Mesh;
    hitBtn.position.z -= 0.006;
    setTimeout(() => {
      hitBtn.position.z += 0.006;
    }, 150);
  }
});

window.addEventListener('resize', (): void => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener('dblclick', (): void => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

/**
 * ============================================================================
 * 12. 渲染循环
 * ============================================================================
 */
const clock = new THREE.Clock();
let prevTime = 0;

const tick = (): void => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  if (animParams.autoRotate) {
    kioskRoot.rotation.y += animParams.rotateSpeed * deltaTime;
  }

  if (animParams.beaconRotate) {
    beaconLightCore.rotation.y += 8 * deltaTime;
    const pulse = Math.sin(elapsedTime * 10) * 0.5 + 0.5;
    materials.beaconRedGlass.emissiveIntensity = 0.8 + pulse * 1.6;
    beaconPointLight.intensity = 1.2 + pulse * 1.5;
  }

  const neonBreath = Math.sin(elapsedTime * 2.5) * 0.2 + 1.0;
  materials.neonGreen.emissiveIntensity = 1.2 * neonBreath;

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();