---
title: 'Optus 5G ZTE Bridge Mode: Turn Off the Modem''s NAT Too'
slug: optus-5g-zte-bridge-mode-nat-fix
date: 2026-10-02
categories:
- Utilities
tags:
- Network
- Optus
- IPv6
---

[中文版在下面](#中文版)

I use my own router behind an Optus 5G ZTE modem. Bridge mode was on and
everything was plugged in correctly, but long-running connections on my work
laptop kept getting reset.

What fixed it was turning off NAT on the modem by hand and restarting it, even
though bridge mode was already enabled. Later I switched on IPv6 on my router,
and what its WAN page showed explained a fair bit about why.

## My setup

I enabled bridge mode through **Settings → Modem Settings → Maintenance →
Bridge Mode**, then connected **LAN 1 on the ZTE modem** to the **WAN port on my
own router**. The router's WAN connection was set to **DHCP**.

I expected that to be enough: the modem provides the 5G connection, my router
runs the home network.

## What went wrong

Long-running connections on my work laptop kept failing, and my work's Zero
Trust client failed with connection reset errors.

The same laptop on my phone's hotspot had no problem, and the same router had
worked fine before this modem arrived. That pointed at the modem or its bridge
mode. It wasn't proof, but it was somewhere to start.

## What fixed it

1. **Enable bridge mode.** **Settings → Modem Settings → Maintenance → Bridge
   Mode**, follow the prompts, accept the change.
2. **Turn off NAT on the ZTE modem.** **Settings → Network → Port Forwarding**,
   disable **NAT**, and save.
3. **Restart the modem.** Let it reconnect, then check that the router gets a
   WAN address through DHCP.

The NAT setting is on the **ZTE modem**, not on your own router. In my setup
the modem's admin page still answered at `http://192.168.0.1` from behind my
router after bridge mode was on, so I didn't have to re-cable anything to reach
it.

After this the long-running connections and the Zero Trust client both worked.

## What the router's WAN page showed

With IPv6 enabled, my router's WAN status looked like this (IPv6 addresses
replaced with the documentation prefix):

- **IPv4:** address `192.0.0.2`, gateway `192.0.0.1`.
- **IPv6:** two addresses in the same /64, `2001:db8:1:2:…::2/128` from DHCPv6
  and `2001:db8:1:2:…/64` from SLAAC. The gateway is `fe80::…`, the modem's
  link-local address.

`192.0.0.2` is the interesting part. It isn't a public address, and it isn't an
ordinary private one either. `192.0.0.0/29` is reserved for IPv4/IPv6
transition mechanisms, and `192.0.0.2` is the address a 464XLAT or DS-Lite
client conventionally gets. So the service is IPv6-only underneath. IPv4 is
translated to IPv6 in the modem and back to IPv4 inside the carrier network.

<svg data-diagram viewBox="0 0 640 275" role="img" aria-label="IPv4 traffic is translated at my router, at the modem and again in the Optus network; IPv6 traffic passes through the same devices without translation">
  <text x="12" y="20" class="d-title">IPv4 path</text>
  <text x="128" y="42" text-anchor="middle" class="d-label">192.168.x.x</text>
  <text x="256" y="42" text-anchor="middle" class="d-label">192.0.0.2</text>
  <text x="384" y="42" text-anchor="middle" class="d-label">IPv6</text>
  <text x="512" y="42" text-anchor="middle" class="d-label">shared IPv4</text>
  <rect x="12" y="50" width="104" height="52" class="d-box-muted"/>
  <text x="64" y="81" text-anchor="middle">Laptop</text>
  <rect x="140" y="50" width="104" height="52" class="d-box"/>
  <text x="192" y="73" text-anchor="middle">My router</text>
  <text x="192" y="91" text-anchor="middle" class="d-label">NAT44</text>
  <rect x="268" y="50" width="104" height="52" class="d-box"/>
  <text x="320" y="73" text-anchor="middle">ZTE modem</text>
  <text x="320" y="91" text-anchor="middle" class="d-label">464XLAT 4→6</text>
  <rect x="396" y="50" width="104" height="52" class="d-box"/>
  <text x="448" y="73" text-anchor="middle">Optus</text>
  <text x="448" y="91" text-anchor="middle" class="d-label">NAT64 6→4</text>
  <rect x="524" y="50" width="104" height="52" class="d-box-muted"/>
  <text x="576" y="81" text-anchor="middle">Internet</text>
  <path d="M116 76 H131" class="d-line"/>
  <polygon points="131,71 140,76 131,81" class="d-arrow"/>
  <path d="M244 76 H259" class="d-line"/>
  <polygon points="259,71 268,76 259,81" class="d-arrow"/>
  <path d="M372 76 H387" class="d-line"/>
  <polygon points="387,71 396,76 387,81" class="d-arrow"/>
  <path d="M500 76 H515" class="d-line"/>
  <polygon points="515,71 524,76 515,81" class="d-arrow"/>
  <path d="M320 102 V114" class="d-line-muted"/>
  <rect x="205" y="114" width="230" height="30" class="d-box-alt"/>
  <text x="320" y="133" text-anchor="middle" class="d-label">extra NAT: the setting I turned off</text>
  <text x="12" y="184" class="d-title">IPv6 path</text>
  <rect x="12" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="64" y="227" text-anchor="middle">Laptop</text>
  <rect x="140" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="192" y="219" text-anchor="middle">My router</text>
  <text x="192" y="237" text-anchor="middle" class="d-label">routes</text>
  <rect x="268" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="320" y="219" text-anchor="middle">ZTE modem</text>
  <text x="320" y="237" text-anchor="middle" class="d-label">bridges</text>
  <rect x="396" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="448" y="219" text-anchor="middle">Optus</text>
  <text x="448" y="237" text-anchor="middle" class="d-label">routes</text>
  <rect x="524" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="576" y="227" text-anchor="middle">Internet</text>
  <path d="M116 222 H131" class="d-line-accent"/>
  <polygon points="131,217 140,222 131,227" class="d-arrow-accent"/>
  <path d="M244 222 H259" class="d-line-accent"/>
  <polygon points="259,217 268,222 259,227" class="d-arrow-accent"/>
  <path d="M372 222 H387" class="d-line-accent"/>
  <polygon points="387,217 396,222 387,227" class="d-arrow-accent"/>
  <path d="M500 222 H515" class="d-line-accent"/>
  <polygon points="515,217 524,222 515,227" class="d-arrow-accent"/>
  <text x="320" y="268" text-anchor="middle" class="d-label">same public IPv6 address end to end, no translation</text>
</svg>

A few things follow from that:

- Bridge mode can't hand my router a public IPv4 address, because the modem
  never had one. IPv4 port forwarding and IPv4 dynamic DNS are pointless on
  this service.
- IPv4 always crosses at least two stateful translators: my own router and the
  carrier's NAT64. I can't remove either.
- IPv6 is the only native path. Anything that can use it skips all of the
  above.

## Why I think turning off NAT helped

My guess is that the modem's NAT toggle is one more stateful layer in front of
its 464XLAT step, and that enabling bridge mode didn't switch it off. Every
stateful layer keeps its own connection table with its own idle timeout, and a
connection that sits quiet for a while is exactly what gets dropped from one.
That matches the symptom: short requests were fine, long-lived ones were reset.

I haven't proven it. I changed the NAT setting and restarted the modem in the
same go, so I can't say which of the two cleared the problem. What I can say is
that bridge mode alone didn't work properly in my setup, and bridge mode plus
NAT off plus a restart did.

## Notes on the IPv6 side

- A `fe80::` gateway is normal. It is link-local, so it only exists on the
  cable between the router and the modem. You can't use it to open the modem's
  admin page from a laptop on the LAN.
- My router's WAN got addresses but no delegated prefix, and at first my laptop
  only had a `fd…` local address. Mobile networks commonly hand out a single
  /64 with no prefix delegation, so the router setting to look for is IPv6
  relay or passthrough rather than native.
- IPv6 has no NAT in front of it. Every device gets a public address, so check
  that the router's IPv6 firewall is on.
- The prefix changes when the 5G connection is re-established. Don't treat
  those addresses as fixed.

Menu paths are from my modem and may differ by model or firmware version.

## 中文版

我在 Optus 5G 的 ZTE 猫后面接了自己的路由器。桥接模式开了，线也接对了，但工作笔记本上的长连接总是被重置。

最后的解决办法是：在猫上手动把 NAT 关掉，然后重启。桥接模式本来就已经开着，这一步还是要做。后来我在路由器上打开了
IPv6，WAN 页面显示的内容正好解释了其中的原因。

### 我的环境

桥接模式的位置在 **Settings → Modem Settings → Maintenance → Bridge Mode**。开启之后，把 **ZTE 猫的
LAN 1** 接到**自己路由器的 WAN 口**，路由器 WAN 设为 **DHCP**。

我原本以为这样就够了：猫负责 5G 上网，路由器负责家里的网络。

### 出了什么问题

工作笔记本上的长连接不断失败，公司的 Zero Trust 客户端报连接被重置。

同一台笔记本连手机热点就没问题，同一台路由器在换这个猫之前也一直正常。所以我怀疑是猫或者它的桥接设置。这算不上证据，但至少有了排查的方向。

### 解决步骤

1. **开启桥接模式。** 进入 **Settings → Modem Settings → Maintenance → Bridge
   Mode**，按提示确认。
2. **关闭 ZTE 猫上的 NAT。** 进入 **Settings → Network → Port Forwarding**，关闭 **NAT** 并保存。
3. **重启猫。** 等它重新连上，再确认路由器通过 DHCP 拿到了 WAN 地址。

注意 NAT 开关在 **ZTE 猫**上，不在你自己的路由器上。在我的环境里，开了桥接以后，从路由器后面访问
`http://192.168.0.1` 仍然能打开猫的管理页，不用重新接线。

做完这几步，长连接和 Zero Trust 客户端都恢复正常了。

### 路由器 WAN 页面显示了什么

开了 IPv6 之后，路由器的 WAN 状态是这样的(IPv6 地址已换成文档专用前缀)：

- **IPv4：** 地址 `192.0.0.2`，网关 `192.0.0.1`。
- **IPv6：** 同一个 /64 下有两个地址，`2001:db8:1:2:…::2/128` 来自 DHCPv6，`2001:db8:1:2:…/64` 来自
  SLAAC。网关是 `fe80::…`，也就是猫的链路本地地址。

关键是 `192.0.0.2`。它不是公网地址，也不是普通的私网地址。`192.0.0.0/29` 是专门留给 IPv4/IPv6
过渡技术用的，`192.0.0.2` 通常就是 464XLAT 或 DS-Lite 客户端拿到的地址。也就是说，这条线路底层是纯 IPv6
的：IPv4 流量先在猫里转成 IPv6，到了运营商网络里再转回 IPv4。

<svg data-diagram viewBox="0 0 640 275" role="img" aria-label="IPv4 流量在我的路由器、猫和 Optus 网络里各被转换一次；IPv6 流量经过同样的设备，但不做任何转换">
  <text x="12" y="20" class="d-title">IPv4 路径</text>
  <text x="128" y="42" text-anchor="middle" class="d-label">192.168.x.x</text>
  <text x="256" y="42" text-anchor="middle" class="d-label">192.0.0.2</text>
  <text x="384" y="42" text-anchor="middle" class="d-label">IPv6</text>
  <text x="512" y="42" text-anchor="middle" class="d-label">共享 IPv4</text>
  <rect x="12" y="50" width="104" height="52" class="d-box-muted"/>
  <text x="64" y="81" text-anchor="middle">笔记本</text>
  <rect x="140" y="50" width="104" height="52" class="d-box"/>
  <text x="192" y="73" text-anchor="middle">我的路由器</text>
  <text x="192" y="91" text-anchor="middle" class="d-label">NAT44</text>
  <rect x="268" y="50" width="104" height="52" class="d-box"/>
  <text x="320" y="73" text-anchor="middle">ZTE 猫</text>
  <text x="320" y="91" text-anchor="middle" class="d-label">464XLAT 4→6</text>
  <rect x="396" y="50" width="104" height="52" class="d-box"/>
  <text x="448" y="73" text-anchor="middle">Optus</text>
  <text x="448" y="91" text-anchor="middle" class="d-label">NAT64 6→4</text>
  <rect x="524" y="50" width="104" height="52" class="d-box-muted"/>
  <text x="576" y="81" text-anchor="middle">互联网</text>
  <path d="M116 76 H131" class="d-line"/>
  <polygon points="131,71 140,76 131,81" class="d-arrow"/>
  <path d="M244 76 H259" class="d-line"/>
  <polygon points="259,71 268,76 259,81" class="d-arrow"/>
  <path d="M372 76 H387" class="d-line"/>
  <polygon points="387,71 396,76 387,81" class="d-arrow"/>
  <path d="M500 76 H515" class="d-line"/>
  <polygon points="515,71 524,76 515,81" class="d-arrow"/>
  <path d="M320 102 V114" class="d-line-muted"/>
  <rect x="205" y="114" width="230" height="30" class="d-box-alt"/>
  <text x="320" y="133" text-anchor="middle" class="d-label">多出来的 NAT：我关掉的那个开关</text>
  <text x="12" y="184" class="d-title">IPv6 路径</text>
  <rect x="12" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="64" y="227" text-anchor="middle">笔记本</text>
  <rect x="140" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="192" y="219" text-anchor="middle">我的路由器</text>
  <text x="192" y="237" text-anchor="middle" class="d-label">路由</text>
  <rect x="268" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="320" y="219" text-anchor="middle">ZTE 猫</text>
  <text x="320" y="237" text-anchor="middle" class="d-label">桥接</text>
  <rect x="396" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="448" y="219" text-anchor="middle">Optus</text>
  <text x="448" y="237" text-anchor="middle" class="d-label">路由</text>
  <rect x="524" y="196" width="104" height="52" class="d-box-muted"/>
  <text x="576" y="227" text-anchor="middle">互联网</text>
  <path d="M116 222 H131" class="d-line-accent"/>
  <polygon points="131,217 140,222 131,227" class="d-arrow-accent"/>
  <path d="M244 222 H259" class="d-line-accent"/>
  <polygon points="259,217 268,222 259,227" class="d-arrow-accent"/>
  <path d="M372 222 H387" class="d-line-accent"/>
  <polygon points="387,217 396,222 387,227" class="d-arrow-accent"/>
  <path d="M500 222 H515" class="d-line-accent"/>
  <polygon points="515,217 524,222 515,227" class="d-arrow-accent"/>
  <text x="320" y="268" text-anchor="middle" class="d-label">全程同一个公网 IPv6 地址，不做转换</text>
</svg>

由此可以得出几点：

- 桥接模式给不了路由器公网 IPv4，因为猫自己就没有。在这条线路上，IPv4 的端口转发和 IPv4 的 DDNS 都没有意义。
- IPv4 至少要经过两层有状态的转换：我自己的路由器，和运营商的 NAT64。这两层我都去不掉。
- 只有 IPv6 是原生直连的。能走 IPv6 的流量可以绕开上面所有转换。

### 为什么我认为关掉 NAT 有用

我的猜测是：猫上的 NAT 开关是 464XLAT 之前又多出来的一层有状态转换，开启桥接模式并没有把它一起关掉。每一层有状态转换都有自己的连接表和空闲超时，一条连接只要安静一会儿，就可能被其中一层清掉。这和现象对得上：短请求没事，长连接被重置。

这一点我没有证实。我是改了 NAT 设置之后紧接着重启的，分不清到底是哪一步起了作用。我能确定的只有：在我的环境里，只开桥接不行；桥接加上关
NAT 再重启，就好了。

### IPv6 方面的几点记录

- 网关是 `fe80::` 开头的地址是正常的。它是链路本地地址，只在路由器和猫之间那根线上有效，所以没法从 LAN
  里的电脑用它打开猫的管理页。
- 我的路由器 WAN 拿到了地址，但没有拿到委派前缀，一开始笔记本只有 `fd` 开头的内网地址。移动网络通常只给一个
  /64，不做前缀委派，所以路由器的 IPv6 模式要找的是中继(Relay)或穿透(Passthrough)，而不是原生(Native)。
- IPv6 前面没有 NAT，每台设备都是公网地址，要确认路由器的 IPv6 防火墙是开着的。
- 5G 重新连接后前缀会变，不要把这些地址当成固定地址。

菜单路径来自我自己的猫，不同型号或固件版本可能不一样。
