/**
 * ============================================================================
 * 公共胶囊导航按钮与导航栏客户端交互控制器 (odoo-common-plugin: nav_capsule.js)
 * 遵循 ui-ux-pro-max 与 ui-component-performance-guide 规范：
 *
 * 【双模式差异化精准交互】：
 * 1. 导航栏展开状态 (未吸顶常态)：
 *    - 鼠标悬浮其他项时，仅文字浅高亮，底色胶囊绝不乱跑；
 *    - 只有点击其他菜单时才触发动画：底色的颜色从原位置有延迟感地平滑滑移到目标菜单，
 *      且目标菜单图标顺滑旋转 360°；
 * 2. 导航栏收缩状态 (吸顶折叠态 .is-scrolled)：
 *    - 隐藏全局滑动底色 Glider；
 *    - 未激活项收缩为 38px 居中正圆图标，当前激活项保持 108px 展开；
 *    - 鼠标悬浮非激活项时：图标顺时针旋转 360°，按钮从中间缓慢往两边展开显示标题 (108px 绝对居中)；
 *    - 原激活项收拢让位为 38px 正圆；鼠标离开后自动收拢复原。
 *
 * 【移动端横向滚动与生命周期几何对齐规范】：
 * - 核心定位采用 offsetLeft/offsetWidth 单一定位真理源，消除滚动瞬态与亚像素扰动；
 * - 监听 header 展开状态切换，在 0ms/50ms/150ms/300ms/650ms 执行全生命周期多阶段补齐校准；
 * - 结合 ResizeObserver 与容器 scroll 监听，杜绝移动端收缩转展开时的文字与背景框错位。
 * ============================================================================
 */

(function () {
    'use strict';

    function initNavCapsules() {
        const navBars = document.querySelectorAll('.common-nav-capsule-bar, .app-nav');
        if (!navBars.length) return;

        navBars.forEach(navBar => {
            if (navBar.dataset.capsuleInitialized === 'true') return;
            navBar.dataset.capsuleInitialized = 'true';

            const header = navBar.closest('.app-header');

            function isScrolledMode() {
                return header ? header.classList.contains('is-scrolled') : false;
            }

            // 1. 挂载常态展开模式专用的滑动底色指示器 (Nav Capsule Glider)
            let glider = navBar.querySelector('.nav-capsule-glider');
            if (!glider) {
                glider = document.createElement('div');
                glider.className = 'nav-capsule-glider';
                glider.id = 'navCapsuleGlider';
                glider.setAttribute('aria-hidden', 'true');
                navBar.prepend(glider);
            }
            navBar.classList.add('has-glider');

            const items = navBar.querySelectorAll('.common-nav-capsule, .nav-item');
            if (!items.length) return;

            let activeItem = navBar.querySelector('.common-nav-capsule.active, .nav-item.active') || items[0];
            let hoverTimer = null;
            let resizeTimer = null;

            // 2. 指示器几何计算与位移动画 (仅在常态展开模式下生效)
            // 遵循 ui-component-performance-guide：使用 offsetLeft 作为容器内绝对定位真理源
            function updateGlider(targetEl, isImmediate) {
                if (!targetEl || !glider || isScrolledMode()) return;
                const width = targetEl.offsetWidth;
                const height = targetEl.offsetHeight;
                const x = targetEl.offsetLeft;
                const y = targetEl.offsetTop;
                if (width <= 0) return;

                if (isImmediate) {
                    glider.style.transition = 'none';
                } else {
                    // 点击与平滑切换时的延迟惯性感
                    glider.style.transition = 'transform 0.42s cubic-bezier(0.25, 1, 0.3, 1), width 0.38s cubic-bezier(0.25, 1, 0.3, 1), height 0.3s ease, top 0.3s ease';
                }

                glider.style.transform = `translateX(${x}px)`;
                glider.style.width = `${width}px`;
                glider.style.height = `${height}px`;
                glider.style.top = `${y}px`;
                glider.style.opacity = '1';
            }

            // 挂载全局主动校准方法，供外部逻辑（如移动端 centerActiveNav）随时触发
            window.refreshNavCapsuleGlider = function () {
                if (!isScrolledMode() && activeItem) {
                    updateGlider(activeItem, false);
                }
            };

            // 初始化常态展开模式的底色胶囊
            requestAnimationFrame(() => {
                if (!isScrolledMode()) {
                    updateGlider(activeItem, true);
                    setTimeout(() => updateGlider(activeItem, false), 60);
                }
            });

            // 3. 监听导航项的悬浮、点击与键盘聚焦
            items.forEach(item => {
                // 鼠标移入 (Hover) - 遵循 ui-ux-pro-max: 仅在具备精准指针与悬浮能力的设备上触发，杜绝移动触屏粘滞 (Sticky Hover)
                item.addEventListener('mouseenter', () => {
                    const hasHoverPointer = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : true;
                    if (!hasHoverPointer) return;

                    if (isScrolledMode()) {
                        // 【收缩模式】：悬浮触发“按钮从中间缓慢往两边展开” + 图标旋转 (零延迟即刻进入 620ms 缓慢舒展动效)
                        clearTimeout(hoverTimer);
                        hoverTimer = setTimeout(() => {
                            if (!item.classList.contains('active')) {
                                navBar.classList.add('has-inactive-hover');
                                item.classList.add('is-hover-expanded');
                            }
                        }, 20);
                    }
                });

                // 鼠标移出 (Mouseleave)
                item.addEventListener('mouseleave', () => {
                    if (isScrolledMode()) {
                        clearTimeout(hoverTimer);
                        item.classList.remove('is-hover-expanded');
                        setTimeout(() => {
                            const stillHovered = navBar.querySelector('.common-nav-capsule:not(.active):hover, .common-nav-capsule.is-hover-expanded');
                            if (!stillHovered) {
                                navBar.classList.remove('has-inactive-hover');
                            }
                        }, 30);
                    }
                });

                // 点击事件 (Click)
                item.addEventListener('click', (e) => {
                    // 1. 如果点击的是当前已激活菜单项，拦截默认行为，杜绝重复整页刷新
                    if (item.classList.contains('active')) {
                        e.preventDefault();
                        return;
                    }

                    clearTimeout(hoverTimer);
                    items.forEach(it => {
                        it.classList.remove('active');
                        it.classList.remove('is-hover-expanded');
                    });
                    item.classList.add('active');
                    activeItem = item;

                    if (!isScrolledMode()) {
                        // 【展开模式】：核心动效触发点！
                        // 1. 底色胶囊从原菜单位置有延迟感地平滑移动到点击的目标菜单
                        updateGlider(item, false);
                        // 2. 目标项图标顺畅旋转 360°
                        const icon = item.querySelector('.nav-capsule-icon, svg');
                        if (icon) {
                            icon.style.transform = 'rotate(360deg)';
                        }
                    } else {
                        // 【收缩模式】：重置悬浮让位态
                        navBar.classList.remove('has-inactive-hover');
                    }

                    // 2. 预留 320ms 动效观赏窗口：确保底色平滑滑向目标菜单的物理惯性动画清晰展现后再执行页面跳转
                    const targetUrl = item.getAttribute('href');
                    if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:')) {
                        e.preventDefault();
                        setTimeout(() => {
                            window.location.href = targetUrl;
                        }, 320);
                    }
                });

                // 键盘 Tab 键焦点无障碍支持
                item.addEventListener('focus', () => {
                    if (isScrolledMode()) {
                        if (!item.classList.contains('active')) {
                            navBar.classList.add('has-inactive-hover');
                            item.classList.add('is-hover-expanded');
                        }
                    }
                });

                item.addEventListener('blur', () => {
                    if (isScrolledMode()) {
                        item.classList.remove('is-hover-expanded');
                        setTimeout(() => {
                            const hasFocus = navBar.querySelector('.common-nav-capsule:focus-visible');
                            if (!hasFocus) {
                                navBar.classList.remove('has-inactive-hover');
                            }
                        }, 30);
                    }
                });
            });

            // 4. 鼠标离开整个导航栏兜底
            navBar.addEventListener('mouseleave', () => {
                if (isScrolledMode()) {
                    clearTimeout(hoverTimer);
                    navBar.classList.remove('has-inactive-hover');
                    items.forEach(it => it.classList.remove('is-hover-expanded'));
                }
            });

            // 5. 窗口尺寸调整监听
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (!isScrolledMode()) updateGlider(activeItem, true);
                }, 50);
            });

            // 6. 核心重构：吸顶折叠与展开全生命周期多阶段校准
            // 解决问题二：收缩态转展开态时，前面项 620ms 缓慢展开会持续将后续按钮推向右侧，
            // 必须在 0ms/50ms/150ms/300ms/650ms 持续多帧校准，杜绝文字与按钮框偏移！
            if (header) {
                const observer = new MutationObserver(() => {
                    if (!isScrolledMode()) {
                        [0, 50, 150, 300, 650].forEach(delay => {
                            setTimeout(() => {
                                if (!isScrolledMode()) {
                                    updateGlider(activeItem, delay === 0);
                                }
                            }, delay);
                        });
                    }
                });
                observer.observe(header, { attributes: true, attributeFilter: ['class'] });
            }

            // 7. 现代 ResizeObserver 动态响应尺寸收敛
            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                    if (!isScrolledMode()) {
                        updateGlider(activeItem, false);
                    }
                });
                resizeObserver.observe(navBar);
                items.forEach(it => resizeObserver.observe(it));
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavCapsules);
    } else {
        initNavCapsules();
    }

    window.initNavCapsules = initNavCapsules;
})();