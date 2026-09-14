---
title: 蔡勒公式 -- 快速将日期转换为星期数
slug: cai-lei-gong-shi---kuai-su-jiang-ri-qi-zhuan-huan-wei-xing-qi-shu
date: '2022-01-03T11:05:00.811Z'
categories:
- Notes
- Improvement
- Utilities
tags:
- Algorithm
- Improvement
- Notes
- Theories
original_permalink: /archives/cai-lei-gong-shi---kuai-su-jiang-ri-qi-zhuan-huan-wei-xing-qi-shu
---

# 情景
我们有时候会遇到这样的问题：
- 看到一个日期想知道这一天是星期几;
- 看到一个历史日期或纪念日，我们想快速的知道这一天是星期几。

对于此类问题，如果懂得蔡勒公式，那就只需将年月日等数据代入公式，然后计算出结果，这一结果就是目标日期对应的星期数。

# 公式
<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mtable columnalign="right left right left right left right left right left right left" rowspacing="1.16em 0.3em" columnspacing="0em 2em 0em 2em 0em 2em 0em 2em 0em 2em 0em" displaystyle="true">
    <mtr>
      <mtd>
        <mi>D</mi>
      </mtd>
      <mtd>
        <mi></mi>
        <mo>=</mo>
        <mrow>
          <mo>[</mo>
          <mfrac>
            <mi>c</mi>
            <mn>4</mn>
          </mfrac>
          <mo>]</mo>
        </mrow>
        <mo>&#x2212;<!-- − --></mo>
        <mn>2</mn>
        <mi>c</mi>
        <mo>+</mo>
        <mi>y</mi>
        <mo>+</mo>
        <mrow>
          <mo>[</mo>
          <mfrac>
            <mi>y</mi>
            <mn>4</mn>
          </mfrac>
          <mo>]</mo>
        </mrow>
        <mo>+</mo>
        <mrow>
          <mo>[</mo>
          <mfrac>
            <mrow>
              <mn>13</mn>
              <mo stretchy="false">(</mo>
              <mi>m</mi>
              <mo>+</mo>
              <mn>1</mn>
              <mo stretchy="false">)</mo>
            </mrow>
            <mn>5</mn>
          </mfrac>
          <mo>]</mo>
        </mrow>
        <mo>+</mo>
        <mi>d</mi>
        <mo>&#x2212;<!-- − --></mo>
        <mn>1</mn>
      </mtd>
    </mtr>
    <mtr>
      <mtd>
        <mi>W</mi>
      </mtd>
      <mtd>
        <mi></mi>
        <mo>=</mo>
        <mi>D</mi>
        <mo lspace="thickmathspace" rspace="thickmathspace">mod</mo>
        <mn>7</mn>
      </mtd>
    </mtr>
  </mtable>
</math>

其中：

- W 是星期数。
- c 是世纪数减一，也就是年份的前两位。
- y 是年份的后两位。
- m 是月份。m 的取值范围是 3 至 14，因为某年的 1、2 月要看作上一年的 13、14月，比如 2019 年的 1 月 1 日要看作 2018 年的 13 月 1 日来计算。
- d 是日数。
- [] 是取整运算。
- mod 是求余运算。

**补充说明：**

- 在计算机编程中，W 的计算结果有可能是负数。我们需要注意，数学中的求余运算和编程中的求余运算不是完全相同的，数学上余数不能是负数，而编程中余数可以是负数。因此，在计算机中 W 是负数时，我们需要进行修正。修正方法十分简单：让 W 加上一个足够大的 7 的整数倍，使其成为正数，得到的结果再对 7 取余即可。比如 -15，我可以让其加上 70，得到 55，再除以 7 余 6，通过余数可知这一天是星期六。
- 此公式只适用于格里高利历（也就是现在的公历)。

# 原理简介

先找到一个知道是星期几的日子，把这个日期作为“原点”，然后计算目标日期和这个原点相差几天，将相差的天数对 7 取余，再根据余数判断星期数。

Eg. 比如我们知道 2019 年 5 月 1 日是星期三，把这一天当作原点，现在我们想知道 2019 年 5 月 17 日是星期几，显然这两个日期之间相差 16 天，用 16 除 7 余 2，因为原点是星期三，加上作为偏移量的余数 2，可知 2019 年 5 月 17 日是星期五。

# 应用
```C++
class Calc {
public:
    string dayOfTheWeek(int d, int m, int y) {
        vector<string> weeks = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        if(m < 3) m += 12, y -=1;
        int c = y/100;
        y %= 100;
        int D = c/4 - 2*c + y + y/4 + 13*(m+1)/5 + d - 1 + 210;//加上30*7防止出现负数
        return weeks[D%7];
    }
};
```


