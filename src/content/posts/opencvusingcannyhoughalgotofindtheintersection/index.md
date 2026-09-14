---
title: Using Canny & Hough algo to find the intersection
slug: opencvusingcannyhoughalgotofindtheintersection
date: '2021-07-02T23:05:20Z'
categories:
- Notes
tags:
- OpenCV
cover: ./download (1)-16341997c087421b919f01200c200ae0.png
original_permalink: /archives/opencvusingcannyhoughalgotofindtheintersection
---


## 1. Threshold -> RGB to Gray
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625274757824.jpg -->
## 2. Denoise and filtering

   Mean filtering: good effect on Gaussian noise. But poor in pepper noise.
   Box filtering: similar with the one above (need normalization).
   Gaussian filtering: high weight to the middle.
   Median filtering: good for pepper noise.
   **Another way to deal with the small white noise:**
   *FindContours, then blacken the area with small size.*

## 3. Morphological Processing
  ``` python
      cv2.erode(img, kernel1,iterations=1)
      cv2.dilate(erotion, kernel2, iterations=1)
      # open：erode then dilate
      open_calc = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel1)
      # colse: dilate then erode
      close_calc = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel1)
   ```
## 4. Canny edge detection
   ``` python
        edge_img = cv2.Canny(gray, 80, 150)
   ```
![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625276931180.jpg -->

## 5. Hough: find lines. We could group these lines. Those with similar slopes and intercepts are divided into the same group. Here are my examples:
   ``` python
        # Hough直线检测
            lines = cv2.HoughLines(edge_img, 1, np.pi / 180, 36)
            lines1 = lines[:, 0, :]  # 提取为为二维

            debug_img = self.img_color.copy()
            # 从左上到右下的线组
            line_group_lt2rb = []

            # 从左下到右上的线组
            line_group_lb2rt = []
            for rho, theta in lines1[:]:
                a = np.cos(theta)
                b = np.sin(theta)
                x0 = a * rho
                y0 = b * rho
                x1 = int(x0 + 1000 * (-b))
                y1 = int(y0 + 1000 * (a))
                x2 = int(x0 - 1000 * (-b))
                y2 = int(y0 - 1000 * (a))

                # 整理线组 - 按角度分类
                k = (int(y2) - int(y1)) / (int(x2) - int(x1))
                # -17 deg ~ -78 deg （opencv坐标系和传统坐标系关于x对称，斜率相反）
                if 0 < k < 1.2:
                    line_group_lt2rb.append([(x1, y1), (x2, y2)])

                # 0 ～ 50 deg
                elif -0.3 > k > -5:
                    line_group_lb2rt.append([(x1, y1), (x2, y2)])
   ```
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625277035390.jpg -->
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625277149151.jpg -->

## 6. Find the *center lines* of two parallel yellow lines. The intersection point of the two *center lines* is the intersection point.
   ![](./placeholder.png)
<!-- original image (unavailable): https://blackmesa-canteen.github.io//post-images/1625277225016.jpg -->
