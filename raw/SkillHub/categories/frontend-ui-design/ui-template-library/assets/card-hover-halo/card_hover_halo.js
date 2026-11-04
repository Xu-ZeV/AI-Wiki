/**
 * 列表卡片悬停面板阴影跟随动效控制器 (Card Hover Follower Controller)
 * 物理引擎：Inertia Damped Lerp (阻尼线性插值) + Micro-Parallax (卡片内微视差追踪)
 */
(function (window, document) {
    'use strict';

    if (!window || !document || (window.matchMedia && window.matchMedia('(hover: none)').matches)) {
        return;
    }

    const CARD_SELECTOR = '.list-card, .meeting-card, .summary-card, .card';
    const containerStates = new Map();

    // 核心物理惯性阻尼系数：0.11 赋予阴影显著的高级物理滞后追随与滑行质感
    const DAMPING = 0.11;
    const OPACITY_DAMPING = 0.15;

    function getContainerState(container) {
        let state = containerStates.get(container);
        if (!state) {
            const cPos = window.getComputedStyle(container).position;
            if (cPos === 'static') {
                container.style.position = 'relative';
            }

            let halo = container.querySelector(':scope > .card-hover-halo, :scope > .nangua-card-hover-halo');
            if (!halo) {
                halo = document.createElement('div');
                halo.className = 'card-hover-halo';
                halo.setAttribute('aria-hidden', 'true');
                container.prepend(halo);
            }

            state = {
                container: container,
                halo: halo,
                currX: 0, currY: 0, currW: 0, currH: 0,
                currRadius: 16, currOpacity: 0,
                targetX: 0, targetY: 0, targetW: 0, targetH: 0,
                targetRadius: 16, targetOpacity: 0,
                rafId: null,
                activeCard: null
            };
            containerStates.set(container, state);
        } else if (!container.contains(state.halo)) {
            container.prepend(state.halo);
        }
        return state;
    }

    function stepAnimation(state) {
        if (!state.container.contains(state.halo)) {
            state.container.prepend(state.halo);
        }
        const dx = state.targetX - state.currX;
        const dy = state.targetY - state.currY;
        const dw = state.targetW - state.currW;
        const dh = state.targetH - state.currH;
        const dr = state.targetRadius - state.currRadius;
        const dop = state.targetOpacity - state.currOpacity;

        const isMoving = Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08 ||
                         Math.abs(dw) > 0.08 || Math.abs(dh) > 0.08 ||
                         Math.abs(dop) > 0.003;

        if (isMoving) {
            state.currX += dx * DAMPING;
            state.currY += dy * DAMPING;
            state.currW += dw * DAMPING;
            state.currH += dh * DAMPING;
            state.currRadius += dr * DAMPING;
            state.currOpacity += dop * OPACITY_DAMPING;

            state.halo.style.transform = `translate3d(${state.currX.toFixed(2)}px, ${state.currY.toFixed(2)}px, 0)`;
            state.halo.style.width = `${state.currW.toFixed(2)}px`;
            state.halo.style.height = `${state.currH.toFixed(2)}px`;
            state.halo.style.borderRadius = `${state.currRadius.toFixed(1)}px`;
            state.halo.style.opacity = state.currOpacity.toFixed(3);

            state.rafId = requestAnimationFrame(() => stepAnimation(state));
        } else {
            state.currX = state.targetX;
            state.currY = state.targetY;
            state.currW = state.targetW;
            state.currH = state.targetH;
            state.currRadius = state.targetRadius;
            state.currOpacity = state.targetOpacity;

            state.halo.style.transform = `translate3d(${state.currX.toFixed(2)}px, ${state.currY.toFixed(2)}px, 0)`;
            state.halo.style.width = `${state.currW.toFixed(2)}px`;
            state.halo.style.height = `${state.currH.toFixed(2)}px`;
            state.halo.style.borderRadius = `${state.currRadius.toFixed(1)}px`;
            state.halo.style.opacity = state.currOpacity.toFixed(3);

            if (state.currOpacity <= 0.005) {
                state.halo.style.opacity = '0';
            }
            state.rafId = null;
        }
    }

    function triggerLoop(state) {
        if (!state.rafId) {
            state.rafId = requestAnimationFrame(() => stepAnimation(state));
        }
    }

    function updateHalo(card, mouseX, mouseY) {
        const container = card.parentElement;
        if (!container) return;

        const state = getContainerState(container);
        state.activeCard = card;

        const cRect = container.getBoundingClientRect();
        const r = card.getBoundingClientRect();
        const offset = 14; // 外扩 14px，确保弥散光晕在纯白卡片背后充分透出

        // 卡片内微视差位移追踪 (Micro-Parallax)
        let mxOffset = 0, myOffset = 0;
        if (typeof mouseX === 'number' && typeof mouseY === 'number') {
            const centerX = r.left + r.width / 2;
            const centerY = r.top + r.height / 2;
            mxOffset = (mouseX - centerX) * 0.05;
            myOffset = (mouseY - centerY) * 0.05;
        }

        const cardRadius = parseInt(window.getComputedStyle(card).borderRadius, 10) || 16;

        state.targetX = r.left - cRect.left + container.scrollLeft - offset + mxOffset;
        state.targetY = r.top - cRect.top + container.scrollTop - offset + myOffset;
        state.targetW = r.width + offset * 2;
        state.targetH = r.height + offset * 2;
        state.targetRadius = cardRadius + offset;
        state.targetOpacity = 1;

        // 若初次进入，立即对准目标位置淡入，消除从远方飘来的穿帮动画
        if (state.currOpacity < 0.03) {
            state.currX = state.targetX;
            state.currY = state.targetY;
            state.currW = state.targetW;
            state.currH = state.targetH;
            state.currRadius = state.targetRadius;
        }

        triggerLoop(state);
    }

    function handlePointerMove(e) {
        if (document.body.classList.contains('modal-open')) return;
        let el = e.target;
        while (el && el !== document.body) {
            if (el.matches && el.matches(CARD_SELECTOR)) {
                updateHalo(el, e.clientX, e.clientY);
                break;
            }
            el = el.parentElement;
        }
    }

    function handlePointerLeave(e) {
        containerStates.forEach(state => {
            state.activeCard = null;
            state.targetOpacity = 0;
            triggerLoop(state);
        });
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave, { passive: true });
})(window, document);