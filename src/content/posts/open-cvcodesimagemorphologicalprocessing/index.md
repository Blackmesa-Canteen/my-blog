---
title: 'Open-CV Codes: Image Morphological Processing'
slug: open-cvcodesimagemorphologicalprocessing
date: '2021-07-05T05:53:38Z'
categories:
- Notes
tags:
- OpenCV
cover: ./download (1)-16341997c087421b919f01200c200ae0.png
original_permalink: /archives/open-cvcodesimagemorphologicalprocessing
---


These codes are useful when we deal with noise and cavities.

```python
import cv2
import matplotlib.pyplot as plt
import numpy as np

if __name__ == '__main__':
    img = cv2.imread('lena.jpg', 0)
    cv2.imshow('image1', img)
    cv2.waitKey(5000)
    cv2.destroyAllWindows()

    ### 图像阈值

    # 阈值函数
    # ret, dst = cv2.threshold(src, thresh, maxval, type)
    # src: 输入图，只能是单通道
    img_gray = cv2.imread('lena.jpg', cv2.IMREAD_GRAYSCALE)
    # dst: 输出图
    # thresh: 阈值
    # maxval: 当像素超过阈值或小于阈值，所赋予的值
    # type： 二值化操作类型： BINARY 超过阈值取maxval，否则0， BINARY_INV 反转
    #                      TRUNC 大于阈值部分设置成阈值，否则设为0
    #                      TOZERO 大于阈值部分不改变，否则设为0
    ret, thresh1 = cv2.threshold(img_gray, 127, 255, cv2.THRESH_BINARY)
    ret, thresh2 = cv2.threshold(img_gray, 127, 255, cv2.THRESH_BINARY_INV)
    ret, thresh3 = cv2.threshold(img_gray, 127, 255, cv2.THRESH_TRUNC)
    ret, thresh4 = cv2.threshold(img_gray, 127, 255, cv2.THRESH_TOZERO)
    ret, thresh5 = cv2.threshold(img_gray, 127, 255, cv2.THRESH_TOZERO_INV)

    titles = ['original', 'binary', 'bi_inv', 'trunc', 'tozero', 'tozero-inv']
    images = [img_gray, thresh1, thresh2, thresh3, thresh4, thresh5]

    for i in range(6):
        plt.subplot(2, 3, i + 1)
        plt.imshow(images[i], 'gray')
        plt.title(titles[i])
        plt.xticks([])
        plt.yticks([])

    plt.show()

    ### 图像平滑：去掉噪音点
    # 图像滤波，即在尽量保留图像细节特征的条件下
    # 对目标图像的噪声进行抑制，是图像预处理中不可缺少的操作，
    # 其处理效果的好坏将直接影响到后续图像处理和分析的有效性和可靠性。
    img = cv2.imread('lena.jpg', cv2.IMREAD_COLOR)
    cv2.imshow('origin', img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # 均值滤波：简单平衡卷积操作，对高斯噪声效果好，
    # 但是对椒盐噪声效果差
    blur = cv2.blur(img, (3, 3))
    cv2.imshow('blur', blur)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # 方框滤波：归一化后基本和均值滤波一样(不归一化，可能像素会越界)
    box = cv2.boxFilter(img, -1, (3, 3), normalize=True)
    cv2.imshow('box', box)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # 高斯滤波：高斯分布，重视中间的
    gaussian = cv2.GaussianBlur(img, (5,5), 1)
    cv2.imshow('gauss', gaussian)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # 中值滤波：用排序后的中位数代替，对椒盐噪声效果好
    median = cv2.medianBlur(img, 5)
    cv2.imshow('median', median)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # tip: 显示所有的图, numpy拼接三个图像三维矩阵
    res = np.hstack((blur, gaussian, median))
    cv2.imshow("median vs average", res)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
```
