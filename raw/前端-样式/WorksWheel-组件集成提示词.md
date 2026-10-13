# WorksWheel 组件集成提示词

## 任务目标

你的任务是将一个现有的 React 组件集成到当前代码库中。

## 环境支持要求

当前代码库需要支持：
- **shadcn** 项目结构
- **Tailwind CSS**
- **TypeScript**

> **注意**：如果不满足上述条件，请提供如何通过 shadcn CLI 初始化项目，以及如何安装配置 Tailwind 或 TypeScript 的详细步骤指引。

## 路径与目录说明

请确认组件与样式的默认路径：
- 如果组件的默认路径不是 `/components/ui`，请说明创建该文件夹的重要性及具体操作。
- 将以下组件代码复制保存到 `/components/ui` 目录下。

---

## 组件代码

### 1. `works-wheel.tsx`
> 路径：`/components/ui/works-wheel.tsx`

```tsx
"use client";

// 采用转轮交互形态构建的作品集（Portfolio）索引组件。
//
// 静止状态下，所有作品卡片环绕标题排列成圆环，每张卡片与圆周相切。
// 滚轮滚动的第一个刻度会将圆环展开为一个垂直转鼓（Drum）：
// 正前方的卡片平铺且以全尺寸显示，上方和下方的卡片则以强透视效果向后旋转，
// 并延伸超出视口的顶部和底部。继续转动转轮，转鼓就会将下一件作品带到正前方。
//
// 整个交互由单个数值驱动——`turn`——通过单个 rAF（requestAnimationFrame）循环读取，
// 并直接将变换（transform）写入 DOM。0 代表圆环形态，1 代表正前方为第 0 个项目的转鼓形态，
// 此后每增加一个整数，就代表多转过一个项目。
import * as React from "react";

import { cn } from "@/lib/utils";

export interface WorksWheelItem {
  /** 项目名称。显示在正前方卡片旁以及右侧索引列表中。 */
  title: string;
  /** 封面图。支持 <img> 标签接受的任意 src 地址。 */
  image: string;
  /** 卡片跳转链接。若省略则仅作为仅供浏览的转轮。 */
  href?: string;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** 位于圆环中心的标题/标签。@default undefined */
  label?: string;
  /** 卡片悬停操作提示文本。省略则不显示。@default undefined */
  action?: string;
}

/* 几何尺寸计算。卡片尺寸相对于舞台（Stage）进行测量；其余所有元素均相对于
   卡片进行测量。因此在狭窄的舞台上（卡片尺寸受限于宽度而非高度），整个转轮会
   随之等比缩小，避免出现小卡片在巨大转鼓上晃动的不协调感。
   其中三个关键参数相互协同微调：
   STEP 与 DRUM 共同决定相邻卡片旋转离开的剧烈程度；
   DRUM 与 LENS 共同决定卡片是落在画框内还是延伸至画框外。 */
const CARD_H = 0.38; // 正前方卡片高度（占舞台高度的比例）
const CARD_MAX_W = 0.34; // ……但卡片宽度绝不超过舞台宽度的该比例
const CARD_RATIO = 1.45; // 卡片宽高比（width / height）
const STEP = 40; // 转鼓上相邻卡片之间的夹角（度）
const DRUM = 2.22; // 转鼓半径（以卡片高度为基准倍数，以下参数同理）
const LENS = 2.7; // 透视视距（perspective distance）
const RING_R = 1.14; // 圆环半径
/* 单纯的转鼓会让作品呈垂直铅垂线分布。但实际上并非如此：整条卡片带沿着一段圆弧向后弯曲，
   该圆弧的圆心位于偏左侧，因此正前方的卡片位于圆弧的最近点（正中心），
   而其相邻卡片除了上下旋转外，还向左后方摆动。
   BOW 即该圆弧的曲率半径；正是它将“一叠卡片”与“侧视转轮”的视觉质感区分开来。 */
const BOW = 1.82;
const TITLE = 0.124; // 圆环标签与正前方卡片标题字号比例
const INDEX = 0.04; // 右侧索引列表字号比例
/** 正前方两侧仍值得渲染的项目数量。超过此范围的卡片已处于侧面视角，再往后会堆叠在视平线消失点上。 */
const CULL = 1.6;

/** 滚轮刻度或拖拽像素对应切换一个项目的换算单位。 */
const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
/** 最后一个滚轮事件触发后的静止等待时间（毫秒），之后转轮将吸附对齐到当前项目。 */
const SETTLE = 140;
/** 每帧缩减剩余距离的缓动比例。1 = 无平滑过渡。 */
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** 计算偏离正前方 `drumDeg` 角度时，圆弧将卡片向左推移的水平位移。
    在正前方时偏移量为 0，确保当前浏览的卡片保持居中。 */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** 在同一个变换链中整合两种形态：当 `m` 接近转鼓形态时，圆环变换分量衰减至零；
    而圆环显示时，转鼓分量仍为零。
    弧度位移（bow）优先应用在转轮自身平面上，使其在侧向平移而非随之旋转，
    同时在远距离下通过透视自然缩小。 */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export function WorksWheel({
  items,
  label = "Works '26",
  action = "View",
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  // 转轮的当前位置与目标位置。只有 `active` 是 React 状态——
  // 其余所有变换直接写入 DOM，因此转动转轮不会触发组件重新渲染。
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });

  const count = items.length;
  const last = Math.max(count - 1, 0);

  // 在挂载后读取而非在渲染期间读取：服务端没有 matchMedia，在行内进行分支判断会导致 Hydration 不匹配。
  // 减少动画偏好（reduced motion）会停用缓动过渡，使转轮直接到位而不是平滑滑行。
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    // 无论转轮包含多少件作品，均按比例缩放圆环卡片，使其呈现闭合圆环效果而非散落的珠串。
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: cardH * TITLE,
      index: cardH * INDEX,
    };
  }, [stage, count]);

  // 每帧执行一次：向目标值缓动插值，随后写入所有 DOM 变换。
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      // 转鼓向后退避，使正面刚好落在视平面（picture plane）上。
      // 该后退位移必须随转鼓形态同步施加，否则圆环会停留在透视远端并以半尺寸渲染。
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          // 基于距离剔除而非角度剔除：在完整转动时，背面会再次转到正对视角，
          // 超出相邻范围的卡片会全部堆叠在灭点上，因此需要隐藏。
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
    },
    [last],
  );

  // 使用原生事件监听器，因为滚轮事件必须可被阻止默认行为（cancelable）——
  // 且仅在转轮尚有可转动空间时拦截，从而使页面在两端能够继续正常滚动，避免困住用户浏览。
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const next = target.current + event.deltaY / WHEEL_UNITS;
      if (next > 0 && next < last + 1) event.preventDefault();
      to(next);
      // 滚轮手势会触发一系列突发的连续事件，自身没有明确的结束标记，
      // 若不做处理，停止位置可能会停留在任意间隙，导致转鼓停在两张卡片中间。
      // 此处在停止滚动后进行延迟对齐，吸附到最近的项目上。
      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(
        () => to(Math.round(target.current)),
        SETTLE,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [to, last]);

  const drag = React.useRef<number | null>(null);
  const settling = React.useRef(0);

  return (
    <section
      aria-label={label}
      className={cn(
        "bg-background text-foreground relative h-full min-h-[24rem] w-full overflow-hidden select-none",
        className,
      )}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`works-wheel-${active}`}
        className="focus-visible:outline-foreground absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing"
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          drag.current = event.clientY;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current === null) return;
          to(target.current + (drag.current - event.clientY) / DRAG_UNITS);
          drag.current = event.clientY;
        }}
        onPointerUp={() => {
          // 吸附到某个具体项目上，避免停留在两张卡片中间。
          drag.current = null;
          if (target.current > 1) to(Math.round(target.current));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") to(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") to(Math.round(target.current) - 1);
          else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {items.map((item, i) => {
            const Tag = (item.href ? "a" : "div") as "a";
            return (
              <React.Fragment key={item.title}>
                <Tag
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={item.href}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  className="group absolute [backface-visibility:hidden]"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <span className="bg-muted shadow-foreground/12 relative block size-full overflow-hidden rounded-lg shadow-[0_18px_40px_-18px_var(--tw-shadow-color)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      className="size-full object-cover"
                    />
                    {action && item.href ? (
                      <span className="bg-background/80 text-foreground pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] opacity-0 backdrop-blur-sm transition group-hover:translate-y-0 group-hover:opacity-100">
                        <svg
                          viewBox="0 0 12 12"
                          className="size-2.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 9 9 3M4 3h5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {action}
                      </span>
                    ) : null}
                  </span>
                </Tag>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 圆环标题与正前方卡片标题在过渡过程中互换位置。
          字体大小基于舞台测得尺寸而非 vh 进行计算，确保转轮在卡片容器内或全屏下均保持比例。 */}
      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 grid place-items-center tracking-tight"
        style={{ fontSize: metrics.title }}
      >
        {label}
      </div>
      <div
        ref={titleRef}
        className="pointer-events-none absolute top-1/2 left-[8%] -translate-y-1/2 tracking-tight opacity-0"
        style={{ fontSize: metrics.title }}
      >
        {items[active]?.title}
      </div>

      <ol
        className="text-muted-foreground absolute top-[7.5%] right-[2.5%] text-right leading-[1.75]"
        style={{ fontSize: metrics.index }}
      >
        {items.map((item, i) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => to(i + 1)}
              className={cn(
                "focus-visible:outline-foreground cursor-pointer transition-colors outline-none focus-visible:outline-1",
                i === active && "text-foreground font-medium",
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default WorksWheel;
```

### 2. `demo.tsx`
> 演示使用示例

```tsx
"use client";

import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";

// 占位图片直接由 crafterui CDN 提供，安装后即可直接运行演示——
// 无需将图片资源复制到 public/ 目录。可以替换为自己的作品名称与标题——
// 转轮会根据传入的作品数量自动调整圆环尺寸。
const ART = (name: string) => `https://www.crafterui.com/art/${name}.jpg`;

const WORKS: WorksWheelItem[] = [
  {
    title: "Prismatic Rift",
    image: ART("prismatic-rift-anime"),
    href: "#prismatic-rift",
  },
  {
    title: "Ember Clouds",
    image: ART("black-hole-ember-clouds"),
    href: "#ember-clouds",
  },
  {
    title: "Neon Portal",
    image: ART("neon-cave-portal-silhouette"),
    href: "#neon-portal",
  },
  {
    title: "Red Ribbon",
    image: ART("red-ribbon-typography"),
    href: "#red-ribbon",
  },
  {
    title: "Celestial",
    image: ART("celestial-light-figure"),
    href: "#celestial",
  },
  { title: "Uplight", image: ART("neon-portrait-uplight"), href: "#uplight" },
  {
    title: "Indigo Marble",
    image: ART("indigo-liquid-marble"),
    href: "#indigo-marble",
  },
  {
    title: "Launch Window",
    image: ART("rocket-launch-gradient"),
    href: "#launch-window",
  },
  {
    title: "Cosmic Wave",
    image: ART("astronaut-cosmic-wave"),
    href: "#cosmic-wave",
  },
];

export default function WorksWheelDemo() {
  return (
    <div className="bg-background text-foreground w-full h-screen">
      <WorksWheel items={WORKS} label="Works '26" action="View" />
    </div>
  );
}
```

---

## 实现指南

1. **分析结构与依赖**：分析组件结构并确定所有必需的外部依赖项。
2. **审查参数与状态**：审查组件的入参（Props）与内部状态（State）。
3. **识别 Context 与 Hooks**：确定是否需要特定的 Context Provider 或自定义 Hook，并进行安装或配置。
4. **需要确认的问题**：
   - 将传递给该组件哪些数据/属性（Props）？
   - 是否有特定的状态管理需求？
   - 是否需要特定的素材资源（图片、图标等）？
   - 预期的响应式（Responsive）表现是怎样的？
   - 在应用中的哪个位置使用该组件最合适？

---

## 集成步骤

0. 将上述所有代码复制粘贴到正确的目录中（如 `/components/ui/works-wheel.tsx`）。
1. 安装所需外部依赖项。
2. 使用已知有效的 Unsplash 图库素材填充图片资源。
3. 如果组件需要 SVG 或 Logo，请使用 `lucide-react` 图标库。

---

## 性能优化记录（2026-10-13）

> 组件首次在真实工程（`D:\Study\works-wheel`，Next.js + React 19 + Tailwind v4 + shadcn，无 `src/`，UI 目录即 `components/ui`）中集成后做的运行性能调优。目标是压掉「环形 ⇄ 鼓面」形变的卡顿，不改视觉。

### 1. 用户反馈

1. **滚轮灵敏度太钝**：`WHEEL_UNITS` 由 `900` 改为 `700`，约三格滚轮切换一件作品，手感合适。
2. **切图动画卡顿**：尤其「环形展开成转鼓」与「转鼓收拢回环形」这两个方向。

### 2. 归因：不是掉帧，而是单帧画面变化量过大

用 Chromium 合成器 trace 实测（脚本见第 6 节）：

| 指标 | 实测值 |
| --- | --- |
| `requestAnimationFrame` 帧间隔 | 16.55–16.59ms（≈60Hz）／31.25ms（32Hz，远程显示协商） |
| `Display::DrawAndSwap` | mean 16.49ms（另一轮 31.12ms） |
| 单帧合成耗时 | mean 6.29ms（每帧预算 16–31ms） |
| 帧间隔超过 40ms 的次数 | 0 |
| 跨形变单帧最大像素变化量 | 25.0（相邻两张卡切换约为它的 1/4） |

结论：

- **一帧都没有丢**，帧率是满的。卡顿感来自**每帧画面变化量（ink）太大**——环形展开时九张卡同时经过「最大、最侧向」的姿态，眼睛会把这种大步进读成「一顿」。
- 实测环境为 QEMU 虚拟机 + 微软远程显示适配器，**无 GPU、纯软件光栅化**；显示节拍在 32Hz ↔ 60Hz 之间漂移（远程会话重连/分辨率协商所致），与代码改动无关。

### 3. 改动清单

| # | 改动 | 位置 | 作用 |
| --- | --- | --- | --- |
| 1 | **形变专用软弹簧** `OMEGA_MORPH = 3.4` | `works-wheel.tsx:141` | 只在跨环形/鼓面这 1 个 turn 单位内降低弹簧刚度，把形变从约 3 帧的大跳摊到约 10 帧；相邻两卡之间的转动仍用 `OMEGA = 10`，响应依旧干脆 |
| 2 | **三层阶梯矩形阴影替代 40px 模糊** | `works-wheel.tsx:561-565` | `blur()` 是软件光栅化最贵的操作，而卡片每帧都在缩放旋转、必须重绘；改用三块阶梯矩形 `box-shadow`，两次填充即可，该透明度下视觉几乎无差 |
| 3 | `will-change-transform` | `works-wheel.tsx:545` | 提示合成器为卡片提升独立图层，避免每帧重新分层 |
| 4 | **样式写入去重** | `written / faded / stacked / labelFade / titleFade` 等缓存 | 变换、透明度、`z-index` 只有在真正变化时才写 DOM，避免每帧无意义的样式失效与重排 |
| 5 | **BOW 权重衰减** `BOW_REACH / bowWeight()` | `works-wheel.tsx:73-75` | 越过剔除点（`CULL`）的离场卡不再按满半径横向滑出，消除「开环看起来像堆叠」的横向扫掠 |
| 6 | **连续淡出** `FADE_FROM / FADE_TO / FADE_SPREAD / FADE_REACH` | `works-wheel.tsx:85-90` | 把「在某一帧同时消失七张卡」的 0/1 硬切摊到一段窗口内，后排先走、前排后走，读起来像圆环解开而不是溶解 |
| 7 | 悬浮按钮图标改用 `lucide-react` 的 `ArrowUpRight` | `works-wheel.tsx:15`、`works-wheel.tsx:575` | 替换内联 SVG，满足第 3 步「图标一律用 lucide-react」的约定 |

### 4. 实测数据（弹簧刚度对照）

口径：合成器自身帧上的「每帧亮度变化量」，取跨形变段内的峰值与中位数，越低越顺。

| 刚度 | 环形→鼓面 峰值 | 鼓面→环形 峰值 | 形变耗时 |
| --- | --- | --- | --- |
| 5.5（改前） | 25.0 | 17.1 | 0.7s |
| 4.2 | 19.5 | 12.5 | 0.9s |
| **3.4（现用）** | **18.2** | **7.1** | 1.1s |

- 开环在 4.2 之后**饱和**（3.4 只再降 7%）：峰值来自九张卡恰好同时处于「最大最侧向」的姿态，任何弹簧都绕不过去。
- 闭环没有这个凸起，**一直降到 7.1（-59%）仍在获益**，因此最终按闭环取 `3.4`。
- 代价：形变时长由约 0.7s 变为约 1.1s。若要更快，把 `OMEGA_MORPH` 调回 `4.2` 即可（19.5 / 12.5 / 0.9s）。

抓帧对照图（保存在实际工程内）：

- `D:\Study\works-wheel\.perfcheck\crossing-open.png`
- `D:\Study\works-wheel\.perfcheck\crossing-close.png`

### 5. 试过但无效的手段（避免重走）

1. **给形变进度加曲线**（`m ** 1.8`、smoothstep）：峰值只是从 `m = 0.29` 挪到 `0.32`，大小不变。因为那一帧是卡片穿过「最大最侧向」的姿态，而不是弹簧跑到最快的一刻。
2. **缩小图片**（Unsplash `w=480`）：无收益，已回退 `w=1200`。
3. **把淡出钉死为 1**：与基线同量级，证明淡出不是卡顿来源。
4. **`OMEGA_MORPH` 继续降到 3.4 以下**：开环已饱和，只会让动画更慢。

### 6. 复现方式

实际工程内 `.perfcheck/` 保留了一组测量脚本：

```powershell
cd D:\Study\works-wheel
node .perfcheck\film.mjs <tag>                     # 抓帧到 .perfcheck\film\<tag>\
$env:BACK='1'; node .perfcheck\film.mjs <tag>      # 反向：鼓面 -> 环形
node .perfcheck\jerk.mjs <tag...>                  # 归一出每帧画面变化量，写 .perfcheck\jerk.txt
node .perfcheck\chart.mjs <tag...> <out.png>       # 生成对比柱状图
node .perfcheck\present.mjs <tag>                  # 真窗口合成器 trace，写 .perfcheck\<tag>.txt
```

其中 `film.mjs` 支持 `HEADED=1`（真窗口）、`PIN=1`（钉死淡出以隔离变量）、`BACK=1`（反向测闭环）三个环境开关。
