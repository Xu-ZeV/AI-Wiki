/**
 * 公共磨砂流光搜索框：QWeb 结构 + 原生 JS 行为。
 * 业务模块通过 data-*-callback 暴露白名单函数名，组件不执行任何字符串代码。
 */
(function (window, document) {
    "use strict";

    if (!window || !document) {
        return;
    }

    const ROOT_SELECTOR = "[data-glass-search-root]";
    const INPUT_SELECTOR = "[data-glass-search-input]";
    const CLEAR_SELECTOR = "[data-glass-search-clear]";
    const CALLBACK_PATTERN = /^[A-Za-z_$][\w$]*$/;
    const rootStates = new WeakMap();
    const delegatedRoots = new WeakSet();
    const warnedKeys = new Set();

    function warnOnce(key, message) {
        if (warnedKeys.has(key)) {
            return;
        }
        warnedKeys.add(key);
        window.console.warn(`[GlassSearchBar] ${message}`);
    }

    function isElement(node) {
        return Boolean(node && node.nodeType === 1 && typeof node.closest === "function");
    }

    function refreshClearState(state) {
        if (!state.clear) {
            return;
        }
        state.clear.hidden = !state.input.value.trim();
    }

    function resolveCallback(state, type) {
        const element = type === "input" ? state.input : state.clear;
        if (!element) {
            return null;
        }
        const attribute = type === "input" ? "inputCallback" : "clearCallback";
        const name = (element.dataset[attribute] || "").trim();
        if (!name) {
            return null;
        }
        if (!CALLBACK_PATTERN.test(name)) {
            warnOnce(
                `invalid:${name}`,
                `回调名 "${name}" 非法；仅允许顶层 JavaScript 标识符。`
            );
            return null;
        }
        const callback = window[name];
        if (typeof callback !== "function") {
            warnOnce(
                `missing:${name}`,
                `回调 "${name}" 尚未定义，本次交互按空操作处理。`
            );
            return null;
        }
        return callback;
    }

    function invokeCallback(state, type) {
        const callback = resolveCallback(state, type);
        if (!callback) {
            return false;
        }
        callback.call(window, state.input);
        return true;
    }

    function getStateForNode(node) {
        if (!isElement(node)) {
            return null;
        }
        const root = node.closest(ROOT_SELECTOR);
        if (!root) {
            return null;
        }
        if (!rootStates.has(root)) {
            initializeRoot(root);
        }
        return rootStates.get(root) || null;
    }

    function handleInput(event) {
        if (event.__glassSearchDelegated) {
            return;
        }
        event.__glassSearchDelegated = true;
        const input = isElement(event.target) ? event.target.closest(INPUT_SELECTOR) : null;
        if (!input) {
            return;
        }
        const state = getStateForNode(input);
        if (!state || state.input !== input) {
            return;
        }
        refreshClearState(state);
        invokeCallback(state, "input");
    }

    function handleClick(event) {
        if (event.__glassSearchDelegated) {
            return;
        }
        event.__glassSearchDelegated = true;
        const clearButton = isElement(event.target)
            ? event.target.closest(CLEAR_SELECTOR)
            : null;
        if (!clearButton) {
            return;
        }
        const state = getStateForNode(clearButton);
        if (!state || state.clear !== clearButton) {
            return;
        }
        event.preventDefault();
        invokeCallback(state, "clear");
    }

    function ensureDelegatedEvents(root) {
        if (!root || delegatedRoots.has(root) || typeof root.addEventListener !== "function") {
            return;
        }
        delegatedRoots.add(root);
        root.addEventListener("input", handleInput);
        root.addEventListener("click", handleClick);
    }

    function initializeRoot(root) {
        if (!root || rootStates.has(root)) {
            return false;
        }
        const input = root.querySelector(INPUT_SELECTOR);
        if (!input) {
            warnOnce(
                `root-without-input:${root.id || root.className || "anonymous"}`,
                "搜索根节点缺少输入框，已跳过初始化。"
            );
            return false;
        }
        const clear = root.querySelector(CLEAR_SELECTOR);
        const state = { root, input, clear };
        rootStates.set(root, state);
        refreshClearState(state);
        return true;
    }

    function findInput(inputId) {
        const input = document.getElementById(inputId);
        if (!input || !input.matches(INPUT_SELECTOR)) {
            return null;
        }
        return input;
    }

    function stateForInput(input) {
        const root = input.closest(ROOT_SELECTOR);
        if (!root) {
            return null;
        }
        if (!rootStates.has(root)) {
            initializeRoot(root);
        }
        return rootStates.get(root) || null;
    }

    function init(root = document) {
        const scope = root || document;
        if (!scope || typeof scope.querySelectorAll !== "function") {
            return 0;
        }
        const roots = [];
        if (isElement(scope) && scope.matches(ROOT_SELECTOR)) {
            roots.push(scope);
        }
        scope.querySelectorAll(ROOT_SELECTOR).forEach((element) => {
            if (!roots.includes(element)) {
                roots.push(element);
            }
        });
        roots.forEach(initializeRoot);
        ensureDelegatedEvents(scope);
        return roots.length;
    }

    function initAll() {
        return init(document);
    }

    function getValue(inputId) {
        const input = findInput(inputId);
        return input ? input.value : "";
    }

    function setValue(
        inputId,
        value,
        { dispatchInput = false, focus = false } = {}
    ) {
        const input = findInput(inputId);
        if (!input) {
            return false;
        }
        const nextValue = value == null ? "" : String(value);
        if (input.value !== nextValue) {
            input.value = nextValue;
        }
        const state = stateForInput(input);
        if (state) {
            refreshClearState(state);
        }
        if (focus) {
            input.focus();
        }
        if (dispatchInput) {
            input.dispatchEvent(new window.Event("input", { bubbles: true }));
        }
        return true;
    }

    function refreshClear(inputId) {
        const input = findInput(inputId);
        if (!input) {
            return false;
        }
        const state = stateForInput(input);
        if (!state) {
            return false;
        }
        refreshClearState(state);
        return true;
    }

    function clear(inputId, { focus = true, notify = true } = {}) {
        const input = findInput(inputId);
        if (!input) {
            return false;
        }
        input.value = "";
        const state = stateForInput(input);
        if (state) {
            refreshClearState(state);
        }
        if (focus) {
            input.focus();
        }
        if (notify && state) {
            invokeCallback(state, "input");
        }
        return true;
    }

    window.GlassSearchBar = Object.freeze({
        init,
        initAll,
        getValue,
        setValue,
        refreshClear,
        clear,
    });

    function autoInit() {
        initAll();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", autoInit, { once: true });
    } else {
        autoInit();
    }
    window.addEventListener("pageshow", autoInit);
})(window, document);
