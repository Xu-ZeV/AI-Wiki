---
title: 硬件与网络工程
category_slug: hardware-network
tags:
  - SKILL/category
---
# 硬件与网络工程

面向工业硬件、嵌入式外设、扫码支付设备及局域网跨网段通信的网络透传与桥接能力。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[hardware-network-bridge]] | 硬件设备跨网段网络透传与桥接 | `hardware-network-bridge` | 涵盖物理串口（COM/TTY）TCP透传与PTY虚拟串口桥接、物理网线UDP组播（224.1.1.1）跨网段双向中继代理、多网卡回环死锁规避与客户端IP自适应学习。 |

## 使用建议

- 遇到扫码枪、POS 机等串口硬件，优先按阶段 1 进行 TCP 专线与 PTY 虚拟串口映射。
- 遇到网线直连且芯片限制组播（如 W5500）的硬件，按阶段 2 部署宿主机双向中继代理，利用命令字动态跟踪客户端 IP。
- 排查刷屏死循环或收不到包时，查阅阶段 3 的 Windows 默认网关跃点数机制与组播反射避坑指南。
