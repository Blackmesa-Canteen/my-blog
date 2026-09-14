---
title: 'postfix/smtp[27109]: fatal: bad boolean configuration: smtp_use_tls = false错误'
slug: postfixsmtp27109fatalbadbooleanconfigurationsmtpusetlsfalse-cuo-wu
date: '2021-12-22T03:01:57.410Z'
categories:
- Notes
- Utilities
tags:
- Notes
- Mail
original_permalink: /archives/postfixsmtp27109fatalbadbooleanconfigurationsmtpusetlsfalse-cuo-wu
---

# 问题

rt

# 解决

- 建议补习英语. smtp_use_tls的默认属性是yes, 那么其反义词是no. 写了false当然不识别.
