---
title: AWS SAA 突擊複習全攻略
slug: aws-saa-tu-ji-fu-xi-quan-gong-lue
date: 2026-10-22
categories:
- Notes
- Learning
tags:
- AWS
- Notes
ai_assisted: true
---

> English version: [AWS SAA Crash Review Guide](/posts/aws-saa-crash-review-guide/)

## 考試概覽與答題技巧

目前考試代號仍是 SAA-C03：65 題（50 題計分 + 15 題不計分），130 分鐘，滿分 1000、720 分及格，報名費 150 美元。題型只有單選和複選（Choose two / three）。網路上有些網站聲稱已改版為 SAA-C04，但 AWS 官方認證頁面（2026 年 10 月）連結的仍是 SAA-C03 考試指南，以官方為準 [↗](https://aws.amazon.com/certification/certified-solutions-architect-associate/)。

| 領域 | 比重 | 涵蓋內容 |
| --- | --- | --- |
| Domain 1：Design Secure Architectures | 30% | IAM、加密、網路隔離、合規 |
| Domain 2：Design Resilient Architectures | 26% | 高可用、解耦、災難復原 |
| Domain 3：Design High-Performing Architectures | 24% | 選對儲存、資料庫、運算、網路、快取 |
| Domain 4：Design Cost-Optimized Architectures | 20% | 購買選項、儲存分層、rightsizing |

資料來源：[KodeKloud SAA-C03 exam guide 整理](https://notes.kodekloud.com/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Solutions-Architecture-Exam-guide-What-to-focus-on/page)、[Training Camp 2026 指南](https://trainingcamp.com/what-is-aws-solutions-architect/)。

### 答題五步法

1. **先看最後一句**：問的是 MOST cost-effective、LEAST operational overhead、MOST secure、最高效能，還是 HIGHLY available？這決定了答案方向。
2. **圈出硬性限制**：例如「不能走公網」「超過 15 分鐘」「毫秒延遲」「既有 SQL」「不能改程式碼」。
3. **刪掉明顯錯的服務**：功能根本不符（例如用 RAM 去限制權限、用 Inspector 算成本）。
4. **剩下的比「題目要的那個形容詞」**：兩個都能做到時，選最符合那個形容詞的。
5. **複選題**：兩個答案通常是同一流程的不同環節（例如一個負責接收、一個負責處理），不是兩個獨立方案。

### 形容詞 → 選擇傾向

| 題目形容詞 | 傾向選擇 |
| --- | --- |
| LEAST operational overhead | 全託管、serverless、AWS 原生功能；避開 EC2 自建、自己寫腳本 |
| MOST cost-effective | Spot、Savings Plans、S3 生命週期、gateway endpoint、serverless 按用量計費 |
| MOST secure | 最小權限、IAM role 而非 access key、KMS、私有網路、不共用帳號 |
| Highly available / fault tolerant | Multi-AZ、Auto Scaling 跨 AZ、ELB、Aurora、DynamoDB |
| Lowest latency / high performance | 快取（ElastiCache、DAX、CloudFront）、io2、Global Accelerator |
| Decouple | SQS、SNS、EventBridge |
| Without code changes | 用設定或託管功能解決（例如 RDS Proxy、Multi-AZ、CloudFront）而非改應用程式 |

### 通則

- 答案通常是 AWS 託管服務，很少是「在 EC2 上自己架」。
- 「Cron job on EC2」幾乎都是錯的，換成 EventBridge Scheduler + Lambda。
- 「把 access key 寫在程式或 instance 裡」永遠是錯的，用 IAM role。
- 選項裡出現大量手動步驟、自己寫腳本輪詢 → 通常是陷阱。

## 身分與帳號治理

核心原則：最小權限、用 role 取代長期 access key、多帳號用 Organizations 集中管。

### IAM 基本元素

| 元素 | 說明 | 要點 |
| --- | --- | --- |
| Root user | 帳號的最高權限，用建立帳號的 email 登入 | 開 MFA、不建 access key、日常不用 |
| IAM User | 一個人或程式的長期身分 | 有密碼和 access key，盡量少用 |
| IAM Group | 把同帳號的 user 分組套權限 | 不能跨帳號、不能被 assume、不能當 principal |
| IAM Role | 可被「assume」的臨時身分（像一頂帽子） | 給 EC2、Lambda、跨帳號、聯合登入用 |
| Policy | JSON 權限文件 | Effect / Action / Resource / Condition |

### Policy 類型

| 類型 | 掛在哪 | 作用 |
| --- | --- | --- |
| Identity-based policy | user、group、role | 這個身分能做什麼 |
| Resource-based policy | 資源上（S3 bucket policy、SQS policy、KMS key policy） | 誰能存取這個資源，可直接授權給其他帳號 |
| Trust policy | role 上 | 誰可以 assume 這個 role |
| Permissions boundary | user、role | 權限上限（給開發者自己建 role 時防止越權） |
| SCP | Organizations 的 OU 或帳號 | 帳號層級的權限天花板，本身不給權限 |

**權限判斷規則：** 明確 Deny > 明確 Allow > 預設 Deny。實際權限 = IAM 允許 ∩ SCP 允許 ∩ boundary 允許。

### 跨帳號存取

- 在「要被存取的帳號」建 role，trust policy 寫「信任哪個帳號」，來源帳號再授權特定人 `sts:AssumeRole`。
- 口訣：**Role 跟著資源走，Trust 指向來的人。**
- S3、SQS、SNS、KMS 等也可以直接用 resource-based policy 授權給其他帳號，不用 assume。
- 給第三方廠商存取時加 External ID，防止 confused deputy 問題。
- Trust policy 的 principal 不能是 IAM group；要信任的是帳號或 role。
- 「只允許自己 Organization 內的帳號存取」→ bucket policy 用 `aws:PrincipalOrgID` 條件，不必逐一列帳號 ID。
- 一個帳號同一時間只能屬於一個 Organization；換組織要先離開，再接受新組織的邀請，不必重建帳號。

### 多帳號治理

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| AWS Organizations | 把多個帳號歸成一個組織，合併帳單、用 OU 分組 | multiple accounts、consolidated billing、volume discount |
| SCP | 對 OU 或帳號設權限天花板 | deny across all accounts、prevent region usage、restrict instance types |
| AWS Control Tower | 一鍵建立符合最佳實踐的多帳號環境（landing zone），內建 guardrails | set up multi-account quickly、governance at scale、guardrails |
| IAM Identity Center（舊名 AWS SSO） | 員工一次登入就能進多個帳號和應用程式，可接 Active Directory / 外部 IdP | single sign-on、workforce、多帳號登入 |
| AWS RAM | 跨帳號分享資源（subnet、Transit Gateway、Route 53 Resolver rules） | share resources，不是限制權限 |
| Tag policies | 統一標籤規範 | enforce tagging |
| Control Tower controls | 三種：preventive（SCP）、detective（Config，事後發現）、proactive（CloudFormation hooks，部署前就擋） | 部署前擋掉不合規資源 → proactive |
| IAM Access Analyzer | 找出分享給外部的資源、從沒用過的權限 | unused access、over-permissive |
| IAM Roles Anywhere | 地端伺服器用 X.509 憑證換 AWS 臨時憑證 | on-premises workloads、no long-term keys |
| Customer-managed prefix list | 一組 CIDR，用 RAM 分享後 security group 可直接參照 | 各帳號共用的辦公室 IP 清單 |

### 使用者身分（應用程式端）

| 服務 | 說明 |
| --- | --- |
| Cognito User Pools | App 的註冊、登入（帳密、社群登入、MFA），給 JWT token；可接 API Gateway / ALB 驗證 |
| Cognito Identity Pools | 把登入過的使用者（或訪客）換成臨時 AWS 憑證，直接存取 S3、DynamoDB |
| AWS Directory Service | 託管的 Microsoft AD（AWS Managed Microsoft AD），或用 AD Connector 連回地端 AD |

口訣：**User Pool 管「你是誰」（登入），Identity Pool 管「你能碰哪些 AWS 資源」（憑證）。**

### 必背陷阱

- EC2 上的程式要存取 S3 → 掛 IAM role（instance profile），不是放 access key。
- 「Root email 收不到通知」→ root email 用公司管理的 distribution list，並設定 alternate contacts（billing、operations、security）。
- 「禁止所有帳號用某 Region / 某服務」→ SCP。
- 「新帳號自動套用規範」→ Control Tower 或 Organizations + SCP。
- SCP 不影響 management account，也不影響 service-linked role。
- 「資源必須帶某個 tag，值只能從清單選」→ tag policy 規範值，再用 SCP 的 `aws:RequestTag` 條件拒絕沒帶 tag 的建立動作。tag policy 本身擋不了「沒加 tag」。
- 「新資源自動加上建立者的成本中心 tag」→ EventBridge（CloudTrail 事件）+ Lambda。SCP 只能允許或拒絕，不會加 tag。
- 「預算到門檻就自動禁止開新資源」→ AWS Budgets actions，透過 IAM role 套用 IAM policy 或 SCP。
- 已經在用 IAM Identity Center → 用 permission sets + groups 指派帳號，新人加進 group 即可，不要自己建 role 或 IAM user。
- Root user 最多可註冊 8 個 MFA 裝置，避免單一裝置遺失就進不去；Organizations 也能集中管理 member account 的 root 存取。

## 安全、加密與合規

這是比重最高的領域（30%），重點是分清楚每個安全服務「看什麼」：漏洞、威脅、敏感資料、設定，還是 API 紀錄。

### 偵測與合規服務（最容易混淆）

| 服務 | 偵測對象 | 關鍵字 |
| --- | --- | --- |
| Amazon Inspector | EC2、ECR 映像、Lambda 的**軟體漏洞（CVE）**和網路暴露 | vulnerabilities、CVE、patch assessment |
| Amazon GuardDuty | 用 CloudTrail、VPC Flow Logs、DNS logs 偵測可疑行為和威脅 | threat detection、malicious IP、crypto mining、compromised instance |
| Amazon Macie | 掃描 S3 內容找出敏感資料 | PII、credit card、sensitive data discovery |
| AWS Config | 記錄資源設定變更並檢查是否合規，可自動修復 | configuration history、compliance rules、drift |
| AWS CloudTrail | 記錄誰在何時呼叫了哪個 API | audit、who deleted、governance |
| AWS Security Hub | 彙整上面各服務的發現，統一儀表板和合規標準評分 | single pane of glass、aggregate findings |
| Amazon Detective | 深入調查安全事件的根因 | investigate、root cause |
| AWS Audit Manager | 自動收集稽核證據（2026 年 4 月 30 日起不再接受新客戶）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) | audit evidence |
| AWS Artifact | 下載 AWS 的合規報告（SOC、PCI、ISO） | compliance reports、agreements |
| Amazon Security Lake | 把各帳號的安全日誌集中成 OCSF 格式的 data lake | security data lake、OCSF |

口訣：**Inspector 看漏洞、GuardDuty 抓壞人、Macie 找個資、Config 看設定、CloudTrail 記操作、Security Hub 收總帳。**

- GuardDuty 也有 RDS Protection，偵測 Aurora / RDS 的異常登入。
- 容器映像的 CVE → ECR scan on push（enhanced scanning 由 Inspector 處理）。

### 網路攻擊防護

| 服務 | 層級 | 說明 |
| --- | --- | --- |
| AWS WAF | 第 7 層 | 擋 SQL injection、XSS、限制 IP、地理封鎖、rate-based rule 防暴力請求；可掛在 CloudFront、ALB、API Gateway REST API、AppSync、Cognito user pool、App Runner、Amplify、Verified Access [↗](https://docs.aws.amazon.com/waf/latest/APIReference/Welcome.html) |
| AWS Shield Standard | 第 3、4 層 | 免費自動開啟，基本 DDoS 防護 |
| AWS Shield Advanced | 第 3、4、7 層 | 付費，進階 DDoS 防護、24/7 DDoS 應變團隊、攻擊造成的費用暴增可申請補償 |
| AWS Firewall Manager | 跨帳號 | 在 Organizations 內統一管理 WAF、Shield、Security Group、Network Firewall 規則 |
| AWS Network Firewall | VPC 層 | 託管的 VPC 防火牆，深層封包檢查、網域過濾 |

注意：WAF 不能直接掛在 NLB 或 EC2 上。

- WAF 也不能掛在 Global Accelerator 上。要保護 GA、NLB、EIP → Shield Advanced；要 WAF 就掛在後面的 ALB。
- 一個 WAF IP set 最多 10,000 個 CIDR，大量白名單用它而不是 NACL；只允許特定國家 → geo match rule。
- 快速封鎖幾個已知的攻擊 IP → NACL deny。前面有 CloudFront 時 NACL 看不到使用者 IP，改用 WAF IP set。
- 「private subnet 只能連到核准的網域」→ Network Firewall 的 domain list。Security group 不能依網域過濾。
- NLB 可以掛 security group，但只能在建立時加上，事後要加只能重建。

### 加密與金鑰

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| AWS KMS | 託管金鑰服務，大多數 AWS 服務的加密都靠它 | encryption at rest、key rotation、key policy |
| AWS CloudHSM | 專屬的硬體安全模組，金鑰完全由你控制 | FIPS 140-2 Level 3、single-tenant、full control of keys |
| KMS External Key Store (XKS) | KMS 金鑰實際放在 AWS 以外的金鑰管理系統（CloudHSM 的金鑰仍在 AWS 內） | keys must stay outside AWS |
| AWS Certificate Manager (ACM) | 免費的公開 SSL/TLS 憑證，自動續約 | HTTPS、encryption in transit；可用於 ELB、CloudFront、API Gateway（預設的免費憑證不能匯出、不能直接裝在 EC2 上；2025 年 6 月起可付費申請「可匯出」的公開憑證給 EC2 用，但考題仍以「不能裝在 EC2」為準 [↗](https://aws.amazon.com/about-aws/whats-new/2025/06/aws-certificate-manager-public-certificates-use-anywhere)） |
| AWS Secrets Manager | 存密碼、API key，可自動輪替（原生支援 RDS、Redshift、DocumentDB） | rotate database credentials automatically |
| SSM Parameter Store | 存設定值和密碼，便宜（標準層免費），沒有內建自動輪替 | configuration、cheap |

口訣：**要自動輪替密碼 → Secrets Manager；只是存設定、要便宜 → Parameter Store。**

KMS 重點：

- 金鑰類型：AWS owned key（看不到）、AWS managed key（`aws/s3` 這種，自動輪替）、Customer managed key（自己建，可控制 key policy、輪替、跨帳號分享）。
- 題目要「控制誰能用金鑰」「稽核金鑰使用紀錄」「跨帳號共用加密資料」→ Customer managed key。
- KMS 金鑰屬於單一 Region；跨 Region 要用 multi-Region keys 或在目標 Region 重新加密。
- 直接加密資料上限 4 KB，更大的資料用 envelope encryption（data key）。
- 自動輪替週期可設 90-2560 天（預設 365 天），也能 on-demand 輪替；AWS managed key 每年輪替，不能改。「要能控制輪替」→ customer managed key。
- 分享加密的 RDS snapshot 或 AMI 給其他帳號 → 必須是 customer managed key，在 key policy 加入對方帳號再分享。用 AWS managed key 加密的不能分享。
- Lambda、EC2 用 KMS 解密 → role 要有 `kms:Decrypt`，key policy 也要允許這個 role，兩邊都要。
- 刪除 key 有 7-30 天等待期，期間可取消。防止誤刪 → EventBridge 抓刪除排程的 API 呼叫 → 自動取消 + SNS 通知。

### S3 加密選項

| 方式 | 誰管金鑰 | 何時選 |
| --- | --- | --- |
| SSE-S3 | AWS 全管 | 預設，最簡單（新物件預設就是加密的） |
| SSE-KMS | KMS | 需要稽核紀錄、控制金鑰權限 |
| DSSE-KMS | KMS，雙層加密 | 合規要求雙層加密 |
| SSE-C | 你提供金鑰，AWS 不保存 | 必須自己保管金鑰 |
| Client-side | 上傳前自己加密 | 資料不能以明文到達 AWS |

SSE-KMS 請求量大、KMS 費用太高 → 開 S3 Bucket Key。題目要求 KMS 時，不能改成 SSE-S3 來省錢。

### 必背陷阱

- 「加密已存在的未加密 RDS」→ 建 snapshot → 複製 snapshot 時加密 → 從加密 snapshot 還原。（EBS 同理）
- 「強制 S3 只走 HTTPS」→ bucket policy 用 `aws:SecureTransport` 條件拒絕 HTTP。
- 「強制上傳一定要加密」→ bucket policy 檢查加密 header，或直接靠預設加密。
- 「偵測有人關掉 CloudTrail / 改設定並自動修復」→ Config rules + 自動修復（SSM Automation）或 EventBridge + Lambda。
- CloudTrail 要防竄改 → 開啟 log file integrity validation，log 存到另一個帳號的 S3 並鎖住（S3 Object Lock）。
- 「資料到 AWS 之前就要加密」「DBA 也不能看到明文」→ client-side encryption。任何 SSE 都是資料到了 AWS 才加密。
- 「所有新的 EBS 一定要加密」→ EBS encryption by default（帳號層級，每個 Region 各設一次）。Config rule 只能事後偵測。
- RDS 傳輸加密 → RDS 的 CA 憑證 + 參數強制 SSL（`rds.force_ssl` / `require_secure_transport`）。IAM database authentication 只管登入。
- EKS 的 Kubernetes Secrets（存在 etcd）要用自己的金鑰加密 → EKS envelope encryption + KMS。
- ACM 匯入的第三方憑證不會自動續約，ACM 會在到期前發 EventBridge 事件，可接 SNS 提醒。ACM 發的公開憑證用 DNS validation 才能全自動續約（email validation 每次都要有人點）。
- App 使用者的自適應 MFA → Cognito user pool threat protection（舊名 advanced security）。

## 網路 VPC

VPC 是每個領域都會碰到的基礎。記住一條主線：public subnet 有路由到 IGW；private subnet 要出網走 NAT；要私下連 AWS 服務走 VPC endpoint；要連其他 VPC 或地端則看規模選 Peering、Transit Gateway、VPN、Direct Connect。

### 基本元件

| 元件 | 說明 | 要點 |
| --- | --- | --- |
| VPC | 你在 AWS 的私有網路，跨同 Region 的所有 AZ | CIDR 建好後可再加，但不能重疊才能互連 |
| Subnet | VPC 切出的子網，一個 subnet 只在一個 AZ | 高可用要在多個 AZ 各放一個 subnet |
| Internet Gateway (IGW) | VPC 對外上網的門 | 一個 VPC 一個；public subnet = 路由表有 0.0.0.0/0 → IGW |
| NAT Gateway | 讓 private subnet 主動出網，外面連不進來 | 放在 public subnet；單一 AZ，高可用要每個 AZ 各一個；收時數 + 流量費 |
| Private NAT Gateway | 只用於 VPC 對 VPC 或連地端 | 不能讓 instance 上網 |
| NAT Instance | 自己用 EC2 做 NAT | 舊方案，要關 source/dest check，考題通常是錯的選項 |
| Egress-only IGW | IPv6 版的 NAT（只出不進） | 看到 IPv6 + 只出網 |
| Route Table | 決定流量往哪走 | 每個 subnet 關聯一個 |
| Elastic IP | 固定的公有 IPv4 | 沒在用也收費；2024 年 2 月起所有公有 IPv4（含使用中的）每個每小時 0.005 美元 [↗](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights) |
| Bastion host | 在 public subnet 的跳板機 | 現在更推薦 SSM Session Manager（不用開 22 port、不用金鑰） |

### Security Group vs NACL（必考）

|  | Security Group | Network ACL |
| --- | --- | --- |
| 作用層級 | instance（ENI） | subnet |
| 狀態 | Stateful（允許進來，回應自動放行） | Stateless（進出都要各自設定，包括 ephemeral ports 1024-65535） |
| 規則 | 只有 Allow | Allow 和 Deny 都有 |
| 評估方式 | 所有規則一起看 | 按編號順序，第一個符合就停 |
| 預設 | 拒絕所有進入、允許所有出去 | 預設 NACL 全部允許 |
| 可參照 | 可以參照另一個 Security Group | 只能寫 IP / CIDR |

口訣：**要「封鎖特定 IP」→ NACL（SG 不能 Deny）。要「只允許 ALB 連到 EC2」→ EC2 的 SG 來源設成 ALB 的 SG。**

### 私下連 AWS 服務：VPC Endpoint

| 類型 | 支援服務 | 費用 | 怎麼運作 |
| --- | --- | --- | --- |
| Gateway endpoint | 只有 S3 和 DynamoDB | 免費 | 在路由表加一條路由 |
| Interface endpoint（PrivateLink） | 大部分 AWS 服務（含 S3） | 每小時 + 每 GB 收費 | 在 subnet 建一個有私有 IP 的 ENI；地端透過 VPN / DX 也能用 |

- 「private subnet 存取 S3、不走公網、最便宜」→ S3 gateway endpoint。
- 「地端要私下存取 S3」→ S3 interface endpoint（gateway endpoint 地端用不了）。
- 可用 bucket policy 的 `aws:SourceVpce` 限制只能從某個 endpoint 存取。
- 只有 S3 和 DynamoDB 有 gateway endpoint；SQS 等其他服務要私下連 → interface endpoint。
- Gateway endpoint 屬於路由表，不屬於某個 AZ，也不能掛 security group；interface endpoint 是 subnet 裡的 ENI，可以掛 SG。
- 純 private 的 EKS 叢集，節點加不進叢集 → 補 interface endpoints（ECR api / dkr、EC2、STS、CloudWatch Logs）+ S3 gateway endpoint。

### VPC 對 VPC

| 方案 | 說明 | 要點 |
| --- | --- | --- |
| VPC Peering | 兩個 VPC 一對一直連 | 不能傳遞（A-B、B-C 不代表 A-C）；CIDR 不能重疊；可跨帳號跨 Region |
| Transit Gateway | 星狀中樞，連接大量 VPC 和地端網路 | 可傳遞路由，取代網狀 peering；支援跨 Region peering、multicast |
| PrivateLink（endpoint service） | 把某一個服務透過 NLB 私下開放給其他 VPC | 只暴露服務、不打通整個網路；CIDR 重疊也可以；SaaS 供應商常用 |
| VPC Lattice | 跨 VPC、跨帳號的服務對服務連線，含服務探索和驗證 | 微服務跨帳號互連 |

口訣：**少量 VPC → Peering；大量 VPC + 地端 → Transit Gateway；只分享一個服務 → PrivateLink。**

跨 Region 的 peering 不能在 security group 參照對方的 SG，只能寫對方的 CIDR（同 Region 可以）。

### 連回地端

| 方案 | 說明 | 要點 |
| --- | --- | --- |
| Site-to-Site VPN | 走公網的 IPsec 加密通道 | 幾分鐘到幾小時就能建好、便宜；頻寬和延遲不穩定 |
| Direct Connect (DX) | 專線，不走公網 | 頻寬穩定、低延遲；建置要數週以上；預設不加密 |
| DX + VPN | 在 DX 上跑 IPsec | 專線 + 加密 |
| VPN 當 DX 備援 | DX 主線、VPN 備援 | 「便宜的備援」 |
| 兩條 DX（不同地點） | 最高可用性 | 「maximum resiliency」 |
| Direct Connect Gateway | 一條 DX 連到多個 Region 的 VPC | multiple regions via DX |
| DX gateway + transit VIF + Transit Gateway | 一條 DX 接多個帳號的多個 VPC，VPC 之間也能互通 | DX + 大量 VPC（只用 DX gateway + VGW 的話 VPC 之間不互通） |
| AWS Client VPN | 讓個人電腦連進 VPC | remote employees |
| VPN CloudHub | 多個分公司透過 VPN 互連 | hub-and-spoke for branch offices |

- 1 Gbps 以下的頻寬 → 透過 DX Partner 開 hosted connection（自己申請的 dedicated 連線從 1 Gbps 起）。

### 其他網路考點

- VPC Flow Logs：記錄 IP 流量（允許 / 拒絕），送到 CloudWatch Logs、S3 或 Firehose；排查「連不上」用它。
- Route 53 Resolver endpoints：混合雲 DNS。Inbound = 地端查 AWS 的私有網域；Outbound = AWS 查地端網域。
- Reachability Analyzer：分析兩個資源之間為什麼連不通。
- Traffic Mirroring：複製流量給檢測設備分析。
- 同 AZ 內流量免費；跨 AZ、跨 Region 流量收費；資料流入 AWS 免費、流出收費。
- VPC 的 IP 快用完 → 加 secondary CIDR，在新 CIDR 建 subnet。VPC 大小只能是 /16 到 /28。

## 運算

選運算服務的順序：能 serverless 就 serverless（Lambda → Fargate），有特殊需求才用 EC2。Lambda 的 15 分鐘上限是最常見的分水嶺。

### EC2 instance 家族

| 字首 | 用途 | 關鍵字 |
| --- | --- | --- |
| T（t3、t4g） | 可突發，便宜 | 低負載偶爾尖峰、開發測試 |
| M | 一般用途 | 平衡 |
| C | 運算優化 | 批次運算、遊戲伺服器、HPC、影片轉碼 |
| R、X | 記憶體優化 | 記憶體資料庫、大型快取、即時大數據 |
| I、D | 儲存優化（本機 NVMe） | 高 IOPS、NoSQL、資料倉儲 |
| P、G、Inf、Trn | 加速運算（GPU / 專用晶片） | 機器學習、圖形處理 |

### EC2 購買選項（必考）

| 選項 | 折扣 | 何時選 |
| --- | --- | --- |
| On-Demand | 無 | 短期、不可中斷、無法預測 |
| Reserved Instances | 最高約 72% | 穩定長期（1 或 3 年），鎖定 instance 類型；Convertible RI 可換類型但折扣較少 |
| Savings Plans | 最高約 72% | 承諾每小時花費；Compute Savings Plans 最彈性（跨家族、Region、也涵蓋 Fargate 和 Lambda）；EC2 Instance Savings Plans 折扣較高但鎖定家族和 Region |
| Spot Instances | 最高約 90% | 可中斷的工作：批次、大數據、CI/CD、無狀態網頁；會收到 2 分鐘中斷通知 |
| Dedicated Hosts | 無折扣（貴） | 軟體授權綁實體 socket / core（BYOL）、合規要求整台主機 |
| Dedicated Instances | 較貴 | 硬體不與其他客戶共用，但不能控制實體主機 |
| Capacity Reservations | 無折扣 | 保證某 AZ 有容量，可隨時開 |

口訣：**穩定 → Savings Plans / RI；可中斷 → Spot；授權綁核心 → Dedicated Hosts；保證有機器 → Capacity Reservation。**

- Regional RI、Savings Plans 只給折扣，不保留容量。要保證某個 AZ 開得出機器 → Capacity Reservation。

### Placement Groups

| 類型 | 擺法 | 用途 |
| --- | --- | --- |
| Cluster | 同一 AZ、靠很近 | 最低延遲、最高網速（HPC），但同一個故障點 |
| Spread | 每台放不同硬體 | 少量關鍵 instance 避免同時故障（每 AZ 最多 7 台） |
| Partition | 分成多個分區，分區之間不共用機架 | 大型分散式系統：Hadoop、Cassandra、Kafka |

### EC2 其他考點

- User data：開機時執行的腳本（只在第一次開機時跑）。
- Instance metadata：`169.254.169.254`，程式從這裡拿 role 憑證、instance 資訊。
- AMI：映像檔，屬於單一 Region，要跨 Region 用需複製。
- Hibernate：把記憶體存到加密的 EBS root volume，開機更快（回到休眠前狀態）。
- EC2 Instance Connect / Session Manager：不用管理 SSH 金鑰也能登入。
- Elastic Network Adapter / EFA：EFA 給 HPC 和緊密耦合的平行運算（MPI）。
- 一台 EC2 只能掛一個 IAM role（一個 instance profile）。
- 從 AMI 開出的 volume 第一次讀很慢 → EBS fast snapshot restore。

### Auto Scaling

| 擴展方式 | 說明 | 何時選 |
| --- | --- | --- |
| Target tracking | 維持某指標在目標值（例如 CPU 50%） | 最常見、最簡單 |
| Step scaling | 根據警報程度分段增減 | 需要細緻控制 |
| Simple scaling | 一個警報觸發一次調整，有冷卻時間 | 舊方式 |
| Scheduled scaling | 在固定時間調整 | 可預期的尖峰（每週一早上 9 點） |
| Predictive scaling | 用機器學習預測週期性流量，提前擴展 | 有規律的週期流量 |

- Launch Template（建議）取代舊的 Launch Configuration。
- 健康檢查可用 ELB health check，讓應用層壞掉的 instance 也被替換。
- Warm pools：預先準備好已初始化的 instance，縮短開機時間。
- 「開機很慢導致擴展來不及」→ 預先做好 AMI（golden image）、warm pools、或 scheduled / predictive scaling。
- Lifecycle hooks：instance 啟動或終止前先執行動作（例如終止前先把 log 傳出去）。
- ASG 不能跨 Region。
- Stateful、隨時至少要 2 台 → 兩個 AZ 各 2 台 On-Demand，一個 AZ 掛了還剩 2 台。Stateful 不用 Spot。

### Lambda

| 項目 | 數字 / 重點 |
| --- | --- |
| 最長執行時間 | 15 分鐘 |
| 記憶體 | 128 MB 到 10 GB（CPU 跟記憶體成正比） |
| 暫存空間 /tmp | 最多 10 GB |
| 部署套件 | zip 或容器映像（最大 10 GB） |
| 冷啟動 | 用 Provisioned Concurrency 解決 |
| 併發限制 | 帳號預設每 Region 1,000，可申請提高；Reserved Concurrency 保留或限制某函式的併發 |
| 連 RDS | 用 RDS Proxy 避免大量連線打爆資料庫 |
| 進 VPC | 可以掛進 VPC 存取私有資源；要上網需 NAT Gateway |
| 觸發來源 | S3、DynamoDB Streams、Kinesis、SQS、SNS、EventBridge、API Gateway、ALB |
| Java 冷啟動 | SnapStart，比 Provisioned Concurrency 便宜 |
| 只要一個 HTTPS endpoint | Function URL（可用 `AWS_IAM` 驗證），webhook 不必架 API Gateway |
| 被 EventBridge、S3、SNS 呼叫 | 靠 Lambda 的 resource-based policy 授權，不是 execution role |
| 容器映像 | 只支援 Linux；Windows 容器改用 ECS on Fargate |

Lambda@Edge / CloudFront Functions：在 CloudFront 邊緣執行程式。CloudFront Functions 更輕量便宜（改 header、URL 重寫）；Lambda@Edge 功能較多（可呼叫網路、執行較久）。

### 容器

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| Amazon ECS | AWS 自家的容器編排 | 簡單、與 AWS 深度整合 |
| Amazon EKS | 託管的 Kubernetes | 題目提到 Kubernetes、從地端 K8s 遷移 |
| AWS Fargate | 容器的 serverless 運算引擎，可搭 ECS 或 EKS | 不想管伺服器、長時間任務（超過 15 分鐘） |
| ECS on EC2 | 自己管 EC2 叢集 | 需要 GPU、特殊 instance、精細成本控制 |
| Amazon ECR | 容器映像倉庫 | 存 Docker image |
| EKS Anywhere / ECS Anywhere | 在地端跑 | 地端資料中心 |
| EKS on Fargate | 不用管節點的 Kubernetes | 不想管 worker node |
| EKS Connector | 把任何 Kubernetes 叢集顯示在 EKS console | 地端叢集統一檢視 |
| App2Container | 把舊的 .NET / Java 應用容器化 | containerize legacy apps |

**ECS 權限：** Task role 是容器內程式存取 AWS 用的權限；Task execution role 是 ECS 拉映像、寫 log 用的權限。

- EKS pod 要 AWS 權限 → IRSA 或 EKS Pod Identity，不要把權限給整個 node role。
- EKS 擴展：HPA 擴 pod，Cluster Autoscaler（或 Karpenter、EKS Auto Mode）擴節點。用 Ingress 掛 ALB → AWS Load Balancer Controller。
- Fargate ephemeral storage 最多 200 GiB；要更大或要共享 → 掛 EFS。

### 其他運算

| 服務 | 說明 |
| --- | --- |
| Elastic Beanstalk | 上傳程式碼，AWS 自動處理部署、擴展、負載平衡；「開發者不想管基礎架構」 |
| AWS App Runner | 從原始碼或容器映像直接部署網頁服務，比 Beanstalk 更簡單（2026 年 4 月 30 日起不再接受新客戶）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| AWS Batch | 大量批次工作的排程和資源配置，可用 Spot 省錢 |
| AWS Outposts | 把 AWS 機櫃放進你的資料中心（低延遲、資料必須留在地端） |
| AWS Wavelength | 在 5G 電信網路邊緣跑應用（超低延遲行動應用） |
| AWS Local Zones | 靠近特定大城市的延伸據點（低延遲給當地使用者） |

## 儲存

先分三種儲存：物件（S3）、區塊（EBS、Instance Store）、檔案（EFS、FSx）。題目說「共享檔案系統」就不是 EBS；說「開機磁碟」就不是 S3。

### S3 儲存類別（必考）

| 類別 | 存取頻率 | 取回時間 | 最短計費天數 | 要點 |
| --- | --- | --- | --- | --- |
| S3 Standard | 經常 | 毫秒 | 無 | 預設 |
| S3 Intelligent-Tiering | 不知道 / 會變動 | 毫秒（封存層除外） | 無 | 自動搬移，收小額監控費，沒有取回費 |
| S3 Express One Zone | 極頻繁、極低延遲 | 個位數毫秒 | 無 | 單一 AZ、directory bucket，給 ML 和高效能分析 |
| S3 Standard-IA | 不常存取，但要立刻拿到 | 毫秒 | 30 天 | 有取回費；多 AZ |
| S3 One Zone-IA | 不常存取、可重建的資料 | 毫秒 | 30 天 | 只在一個 AZ，AZ 壞了資料就沒了 |
| S3 Glacier Instant Retrieval | 約每季一次 | 毫秒 | 90 天 | 封存但要即時取回 |
| S3 Glacier Flexible Retrieval | 一年一兩次 | Expedited 1-5 分鐘、Standard 3-5 小時、Bulk 5-12 小時 | 90 天 | 經典封存 |
| S3 Glacier Deep Archive | 幾乎不碰 | Standard 12 小時內、Bulk 48 小時內 | 180 天 | 最便宜，長期法規保存（7-10 年） |

口訣：**不知道存取模式 → Intelligent-Tiering；可重建 → One Zone-IA；封存要毫秒 → Glacier Instant；最便宜、可等 12 小時以上 → Deep Archive。**

### S3 生命週期與資料保護

- Lifecycle rules：依天數自動轉換儲存類別或刪除；也可刪除舊版本、清掉未完成的 multipart upload。
- 從 Standard 轉到 Standard-IA / One Zone-IA，物件要至少放 30 天。
- 2024 年 9 月起，Lifecycle 預設不轉換小於 128 KB 的物件 [↗](https://aws.amazon.com/about-aws/whats-new/2024/09/amazon-s3-default-minimum-object-size-lifecycle-transition-rules)。大量小檔要先打包，或在規則加 object size filter。
- 開了 versioning 後，lifecycle「刪除」current version 只會加 delete marker；要真的省空間還要設 noncurrent version expiration（`NewerNoncurrentVersions` 可保留最近幾版）。
- Versioning：防誤刪、誤覆蓋；刪除只是加上 delete marker。開啟後只能暫停，不能關閉。
- MFA Delete：刪除版本或改 versioning 狀態需 MFA（只有 root 能設定）。
- Object Lock（WORM，寫一次讀多次）：Governance mode 有特殊權限的人可解除；Compliance mode 連 root 都不能刪，直到保留期結束。Legal hold 無期限保留。
- Object Lock 需要 versioning。既有物件要補上保留設定 → S3 Batch Operations。Legal hold 要授權 `s3:PutObjectLegalHold` 給需要解除的人。
- Glacier Vault Lock：封存庫（vault）的 WORM 政策，鎖定後不能改。它屬於舊的獨立 Amazon Glacier 服務，2025 年 11 月起不再接受新客戶；新設計直接用 S3 Glacier 儲存類別 + Object Lock（S3 Glacier 儲存類別本身不受影響）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html)。

口訣：**法規要求「任何人都不能刪除」→ Object Lock Compliance mode。**

### S3 複製

- CRR（跨 Region）：災難復原、就近存取、合規。SRR（同 Region）：彙整 log、正式和測試帳號間同步。
- 來源和目的 bucket 都要開 versioning。
- 只複製開啟之後的新物件；既有物件要用 S3 Batch Replication。
- S3 RTC（Replication Time Control）：保證 15 分鐘內複製完 99.99% 的物件。
- 多 Region 就近寫入、單一全球 endpoint、可切換 → S3 Multi-Region Access Points + 雙向 CRR。

### S3 存取與安全

| 功能 | 說明 |
| --- | --- |
| Block Public Access | 帳號或 bucket 層級一鍵禁止公開（預設開啟） |
| Bucket policy | resource-based policy，可授權跨帳號、限制來源 IP、VPC endpoint、強制 HTTPS |
| Presigned URL | 給沒有 AWS 權限的人限時上傳或下載單一物件 |
| S3 Access Points | 為不同團隊或應用建立各自的存取入口和政策，簡化大型共用 bucket |
| Object Ownership（Bucket owner enforced） | 停用 ACL，bucket 擁有者擁有所有物件（建議） |
| CloudFront + OAC | 只讓 CloudFront 讀 S3，使用者不能直接連 bucket |

### S3 效能與功能

- 每個 prefix 每秒約 3,500 次寫入、5,500 次讀取；用多個 prefix 平行提升。
- 單一物件最大 50 TB（2025 年 12 月從 5 TB 提高，舊題庫寫 5 TB）[↗](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/)；單次 PUT 最大 5 GB；超過 100 MB 建議用 multipart upload。
- S3 Transfer Acceleration：透過 CloudFront 邊緣節點加速遠距離上傳。
- Byte-range fetch：平行下載物件的不同區段。
- Event Notifications：物件建立或刪除時通知 SQS、SNS、Lambda 或 EventBridge。
- S3 Select：用 SQL 只撈單一物件中的部分資料（2024 年 7 月起不再開放新客戶，AWS 建議改用 Athena；舊考題仍可能出現）[↗](https://docs.aws.amazon.com/AmazonS3/latest/userguide/selecting-content-from-objects.html)。
- S3 Batch Operations：對大量物件批次操作（複製、加標籤、加密、呼叫 Lambda）。
- Requester Pays：下載費由請求者付。
- Static website hosting：放靜態網站；要 HTTPS 就搭配 CloudFront。
- S3 提供強一致性（寫入後立即讀得到最新資料）。
- S3 Inventory：列出物件和加密狀態；搭配 Batch Operations 可批次加密既有物件。
- 全球使用者上傳又下載 → 上傳用 Transfer Acceleration，下載走 CloudFront。

### EBS 與 Instance Store

| 類型 | 說明 | 關鍵字 |
| --- | --- | --- |
| gp3 | 預設首選 SSD，IOPS 和 throughput 可獨立調整；上限 80,000 IOPS、2,000 MiB/s、64 TiB（2025 年 9 月提高，舊題庫為 16,000 IOPS）[↗](https://aws.amazon.com/about-aws/whats-new/2025/09/amazon-ebs-size-provisioned-performance-gp3-volumes) | 一般用途、省錢（從 gp2 換過來） |
| io2 Block Express / io1 | 高 IOPS SSD，可 Multi-Attach | 關鍵資料庫、低延遲 |
| st1 | 高 throughput HDD | 大數據、log、連續讀取 |
| sc1 | 最便宜 HDD | 冷資料 |
| Instance Store | 主機本機磁碟，最高 IOPS | 暫存、快取、buffer；停機資料就消失 |

- EBS 綁定單一 AZ；換 AZ 或 Region → 透過 snapshot。
- 自動備份 snapshot → Data Lifecycle Manager 或 AWS Backup。
- 加密未加密的 volume → snapshot → 加密複製 → 建新 volume。
- HDD（st1、sc1）不能當開機磁碟。
- Multi-Attach 只有 io1 / io2，只能在同一個 AZ，檔案系統還要支援叢集。
- io1 不夠快 → io2 Block Express，或多顆 volume 做 RAID 0。
- Snapshot 長期保存 → EBS Snapshots Archive（約省 75%，最少 90 天，還原要 24-72 小時）。Snapshot 不能直接搬進 Glacier。
- 誤刪 snapshot、AMI → Recycle Bin（保留規則，刪了還能救回）；要「根本刪不掉」→ EBS Snapshot Lock。

### 檔案儲存

| 服務 | 協定 / 平台 | 關鍵字 |
| --- | --- | --- |
| Amazon EFS | NFS，Linux | 多台 EC2 / 容器 / Lambda 跨 AZ 共享、自動擴展；有 IA 和 Archive 層，生命週期自動搬移 |
| FSx for Windows File Server | SMB，Windows，整合 Active Directory | Windows 共享資料夾、DFS、SharePoint |
| FSx for Lustre | 高效能平行檔案系統 | HPC、機器學習訓練、直接連 S3 處理資料 |
| FSx for NetApp ONTAP | NFS、SMB、iSCSI 多協定 | 從地端 NetApp 遷移、Linux 和 Windows 都要用 |
| FSx for OpenZFS | NFS | 從地端 ZFS 遷移 |

口訣：**Linux 共享 → EFS；Windows 共享 → FSx for Windows；HPC → FSx for Lustre；NetApp → FSx for ONTAP。**

- EFS 要唯讀 → file system policy 拒絕 `elasticfilesystem:ClientWrite`。
- FSx for Lustre：scratch 便宜但資料不複製；要高可用、長期使用 → persistent。Snowball 不能直接匯入 FSx，要先進 S3，再讓 Lustre 連結 S3。
- FSx for NetApp ONTAP：跨 Region DR 用 SnapMirror；也能透過 iSCSI 提供 Multi-AZ 的區塊儲存。

### Storage Gateway（混合雲儲存）

| 類型 | 地端看到的 | 資料存到 | 用途 |
| --- | --- | --- | --- |
| S3 File Gateway | NFS / SMB 檔案共享 | S3 | 地端應用把檔案存進 S3，本機有快取 |
| FSx File Gateway | SMB 共享 | FSx for Windows | 地端低延遲存取 FSx（新客戶已不提供，考題仍可能出現） |
| Volume Gateway – Cached | iSCSI 磁碟 | S3（常用資料快取在地端） | 擴充地端容量 |
| Volume Gateway – Stored | iSCSI 磁碟 | 完整資料在地端，非同步備份到 S3 | 地端要低延遲存取全部資料 |
| Tape Gateway | 虛擬磁帶庫（VTL） | S3 / Glacier | 取代實體磁帶備份，不改既有備份軟體 |

## 資料庫

選資料庫先看資料模型：關聯式 → RDS / Aurora；key-value、超大規模、毫秒延遲 → DynamoDB；快取 → ElastiCache；其他專用模型各有對應服務。

### Multi-AZ vs Read Replica（最常考）

|  | Multi-AZ | Read Replica |
| --- | --- | --- |
| 目的 | 高可用、自動 failover | 擴展讀取效能 |
| 複製方式 | 同步 | 非同步 |
| 備用機能讀嗎 | 傳統 Multi-AZ 不能（Multi-AZ DB cluster 的兩台 standby 可讀） | 可以 |
| 跨 Region | 不行 | 可以（也可當 DR，手動 promote） |
| 故障切換 | 自動，DNS 不變 | 要手動 promote 成獨立資料庫 |

口訣：**Multi-AZ 保命，Read Replica 分流。** 題目說「報表查詢拖慢主資料庫」→ Read Replica；說「AZ 故障也要能用」→ Multi-AZ。

- Multi-AZ DB cluster（只有 MySQL、PostgreSQL）：1 個 writer + 2 個可讀 standby，failover 通常 35 秒內。要「高可用 + 多一點讀取 + 便宜」時，比 Multi-AZ instance + 2 個 Read Replica 划算。
- 建 Read Replica 之前要開自動備份（保留期 > 0）。Replica 是唯讀的，寫入不能導過去。

### Amazon RDS

- 引擎：MySQL、PostgreSQL、MariaDB、Oracle、SQL Server、Db2。
- 自動備份：保留 1-35 天，可 point-in-time restore；手動 snapshot 永久保留直到刪除。
- 加密要在建立時決定；事後加密要走 snapshot 複製流程。
- Storage autoscaling：空間不夠時自動擴充。
- RDS Proxy：連線池，解決 Lambda 大量連線打爆資料庫的問題，failover 更快，可搭配 IAM 驗證和 Secrets Manager。
- IAM database authentication：用 IAM token 登入資料庫（MySQL、PostgreSQL）。
- RDS Custom：需要存取作業系統的 Oracle 或 SQL Server（RDS Custom for Oracle 已於 2026 年 3 月進入 Sunset 階段，SQL Server 版仍提供）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html)。
- Blue/Green Deployments：升級或改架構時建一套綠色環境，快速安全切換。
- 自動備份最多 35 天；要保留 90 天、7 年 → AWS Backup。
- 停止的 RDS 7 天後會自己開機。一個月只用幾天 → 做 snapshot 後刪除，要用再還原；每天固定時段用 → 排程起停。
- 寫入很重、加快取也沒用（快取只幫讀取）→ Provisioned IOPS（io1 / io2）。
- 搬到 Aurora、最少停機 → 先建一個 Aurora read replica，同步後 promote。
- SQL Server 搬到 Aurora PostgreSQL 又不想大改程式 → Babelfish。持續複製但負載變化大 → DMS Serverless。
- Lambda 大量寫入打爆資料庫，或升級期間不能掉資料 → 前面放 SQS 緩衝。RDS Proxy 只會短暫保留連線，不會幫你存寫入。

### Amazon Aurora

| 特色 | 要點 |
| --- | --- |
| 相容性 | MySQL、PostgreSQL 相容，效能比一般 RDS 高 |
| 儲存 | 自動擴展到 256 TiB（2025 年從 128 TiB 提高，舊教材寫 128 TiB）[↗](https://aws.amazon.com/es/about-aws/whats-new/2025/07/amazon-aurora-postgresql-database-clusters-256-tib-storage-volume/)，6 份副本分佈在 3 個 AZ |
| Replica | 最多 15 個 Aurora Replica，failover 通常 30 秒內 |
| Endpoints | Writer endpoint、Reader endpoint（自動分散讀取）、Custom endpoint（指定某些 replica，例如給報表用） |
| Aurora Serverless v2 | 流量難預測、間歇性負載，自動調整容量；2024 年 11 月起可降到 0 ACU 自動暫停 [↗](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-aurora-serverless-v2-scaling-zero-capacity)（v1 已終止，題目寫 Aurora Serverless 就當 v2） |
| Aurora Global Database | 跨 Region 複製延遲通常 1 秒內，次要 Region 可快速提升為主要；RPO 秒級、RTO 分鐘級的跨 Region DR |
| Aurora Cloning | 快速複製一份資料庫給測試用，不必完整複製 |
| Backtrack | 把資料庫「倒帶」到某個時間點（MySQL 相容版） |
| I/O-Optimized | I/O 費用超過總花費約 25% 時改用，不另收 I/O 費 |
| Headless secondary | Global Database 的次要 Region 只有儲存、不開 instance，最便宜的跨 Region DR，代價是 RTO 較長 |

### Amazon DynamoDB

| 特色 | 要點 |
| --- | --- |
| 類型 | serverless 的 key-value / document NoSQL，個位數毫秒延遲，自動擴展 |
| 容量模式 | On-demand（流量不可預測）、Provisioned + Auto Scaling（可預測，較便宜） |
| 單筆上限 | 每個 item 400 KB；大檔放 S3、DynamoDB 存指標 |
| DAX | DynamoDB 專用快取，微秒級讀取；不用改太多程式 |
| Global Tables | **多 Region、多主（active-active）**複製 |
| DynamoDB Streams | 資料變更事件流，可觸發 Lambda |
| TTL | 到期自動刪除項目（session、暫存資料） |
| 備份 | PITR（最多 35 天）、隨選備份；開 PITR 後可匯出到 S3，不消耗 RCU，再用 Athena / Glue 分析 |
| 索引 | GSI 隨時可加、不同 partition key；LSI 只能建表時建、相同 partition key |
| 交易 | 支援 ACID transactions |
| 一致性 | 預設 eventually consistent；讀到舊資料 → strongly consistent read |
| Deletion protection | 防止誤刪 table |

### Amazon ElastiCache

| 引擎 | 特色 | 何時選 |
| --- | --- | --- |
| Redis / Valkey | 持久化、複製和 Multi-AZ 自動 failover、備份、進階資料結構（sorted set 排行榜）、pub/sub | 需要高可用、排行榜、session 持久保存 |
| Memcached | 簡單、多執行緒、沒有複製和持久化 | 最單純的快取、可水平分片 |

- 常見用途：資料庫查詢快取、session store（讓 EC2 變成無狀態）。
- 快取策略：Lazy loading（查不到才寫入快取，可能過期）、Write-through（寫資料庫時同步更新快取）、搭配 TTL。
- Amazon MemoryDB：Redis 相容、持久化的主資料庫（不只是快取）。

### 其他專用資料庫

| 服務 | 資料模型 | 關鍵字 |
| --- | --- | --- |
| Amazon DocumentDB | 文件 | MongoDB 相容 |
| Amazon Keyspaces | 寬欄位 | Apache Cassandra 相容 |
| Amazon Neptune | 圖形 | 社群網路、推薦系統、詐騙偵測、知識圖譜 |
| Amazon Timestream | 時間序列 | IoT 感測資料、監控指標（原本的 Timestream for LiveAnalytics 2025 年 6 月起不再接受新客戶，新部署用 Timestream for InfluxDB）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| Amazon OpenSearch | 搜尋引擎 | 全文搜尋、log 分析 |
| Amazon Redshift | 資料倉儲（OLAP） | 大量資料分析、BI |
| Amazon QLDB | 不可竄改的帳本 | 舊考題可能出現；已於 2025 年 7 月 31 日終止服務，遷移目標是 Aurora PostgreSQL [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |

### 選擇口訣

- 「既有 SQL、交易」→ RDS；「要更高效能 / 高可用的 MySQL、PostgreSQL」→ Aurora。
- 「每秒百萬請求、毫秒延遲、serverless、schema 彈性」→ DynamoDB。
- 「DynamoDB 還要更快（微秒）」→ DAX；「RDS 讀取太慢」→ ElastiCache 或 Read Replica。
- 「全球使用者都要低延遲寫入」→ DynamoDB Global Tables；「全球讀取 + 跨 Region DR 的關聯式」→ Aurora Global Database。
- 「Lambda 連 RDS 連線數爆掉」→ RDS Proxy。

## 流量入口：負載平衡、DNS、CDN

使用者的請求通常依序經過 Route 53（DNS）→ CloudFront 或 Global Accelerator（邊緣）→ ELB → 後端。每一層解決不同問題。

### Elastic Load Balancing

| 類型 | 層級 | 關鍵字 |
| --- | --- | --- |
| Application Load Balancer (ALB) | 第 7 層 HTTP / HTTPS / gRPC | 依路徑、host、header、query string 路由、微服務、容器、Lambda 當目標、WebSocket、可掛 WAF、可整合 Cognito 登入 |
| Network Load Balancer (NLB) | 第 4 層 TCP / UDP / TLS | 極高效能、超低延遲、每個 AZ 固定 IP / Elastic IP、非 HTTP 協定、PrivateLink 後端 |
| Gateway Load Balancer (GWLB) | 第 3 層 | 把流量導給第三方防火牆、IDS/IPS 等虛擬設備（GENEVE 協定） |

口訣：**HTTP 路由 → ALB；要固定 IP、TCP/UDP、最快 → NLB；防火牆設備 → GWLB。**

ELB 考點：

- Cross-zone load balancing：ALB 預設開啟；NLB、GWLB 預設關閉。
- Sticky sessions：同一使用者黏在同一台 instance（用 cookie）；更好的做法是把 session 放 ElastiCache / DynamoDB。
- Connection draining（deregistration delay）：下線前讓進行中的請求做完。
- SSL offloading：在 ELB 終止 HTTPS（憑證放 ACM），減輕後端負擔；多個網域用 SNI。
- ALB 後端想拿到使用者真實 IP → 看 `X-Forwarded-For` header。
- 「ALB 需要固定 IP」→ 在 ALB 前面放 NLB 或 Global Accelerator。
- HTTP 轉 HTTPS → ALB listener 的 redirect rule。
- 某幾台後端被打爆 → 改用 least outstanding requests 演算法，或檢查是不是 sticky sessions 造成的。
- 調查異常流量 → ALB access logs 存 S3 + Athena。CloudTrail 不記錄 HTTP 請求。
- ALB 用的 ACM 憑證要在同一個 Region。

### Route 53

| 路由策略 | 說明 | 何時選 |
| --- | --- | --- |
| Simple | 回傳一筆或多筆紀錄，無健康檢查 | 單一資源 |
| Weighted | 按權重分配流量 | 藍綠部署、A/B 測試、漸進式遷移 |
| Latency | 導到延遲最低的 Region | 全球使用者要最快回應 |
| Failover | 主要不健康時切到備援 | 主動-被動 DR |
| Geolocation | 依使用者所在地（國家、洲） | 內容在地化、法規限制特定國家 |
| Geoproximity | 依地理距離，可用 bias 調整範圍 | 想把流量往某個 Region 偏移（需 Traffic Flow） |
| Multivalue answer | 回傳最多 8 個健康的紀錄 | 簡易的用戶端負載平衡（不是 ELB 的替代品） |
| IP-based | 依使用者 IP 段路由 | 特定 ISP 或網段走特定端點 |

Route 53 考點：

- Alias record：指向 AWS 資源（ELB、CloudFront、S3 網站、API Gateway），可用在根網域（zone apex，例如 example.com），查詢免費。CNAME 不能用在根網域。
- Health checks：可檢查端點、其他健康檢查（calculated），或 CloudWatch 警報（用於私有資源）。
- Private hosted zone：VPC 內部的私有 DNS。
- 混合雲 DNS → Route 53 Resolver inbound / outbound endpoints。
- 從別的 DNS 供應商搬過來 → 建 hosted zone，匯入 zone file。
- Geolocation 依國家或洲劃分；依距離導到最近的 Region → geoproximity 或 latency。

### CloudFront

- 全球 CDN，快取靜態和動態內容，降低延遲和來源負載。
- 來源（origin）可以是 S3、ALB、EC2、API Gateway、任何 HTTP 伺服器。
- OAC（Origin Access Control）：只讓 CloudFront 讀 S3，bucket 不必公開（取代舊的 OAI）。
- Signed URL / Signed Cookie：付費或私有內容。單一檔案 → signed URL；多個檔案（整個會員區）→ signed cookie。
- Geo restriction：封鎖或只允許特定國家。
- Field-level encryption：在邊緣加密特定表單欄位（例如信用卡號）。
- Origin failover（origin group）：主要來源故障時自動切到次要來源。
- 搭配 WAF、Shield 做邊緣防護；邊緣運算用 CloudFront Functions / Lambda@Edge。
- Cache invalidation：更新內容後清除快取；或檔名加版本號。
- CloudFront 用的 ACM 憑證必須在 us-east-1。
- 不快取 `Cache-Control: private` 的回應。
- 依語言、裝置給不同內容 → cache key 加 header（例如 `Accept-Language`），或用 Lambda@Edge 看 `User-Agent`。
- 不支援 UDP，也早就不支援 RTMP。

### Global Accelerator vs CloudFront

|  | CloudFront | Global Accelerator |
| --- | --- | --- |
| 做什麼 | 快取內容在邊緣 | 不快取，透過 AWS 骨幹網路加速連線 |
| 協定 | HTTP / HTTPS | TCP / UDP（也適用 HTTP） |
| IP | 動態 | 2 個固定 Anycast IP |
| 適合 | 網站、影片、靜態檔案、API 快取 | 遊戲、IoT、VoIP、需要固定 IP 白名單、跨 Region 快速 failover（秒級，不受 DNS 快取影響） |

口訣：**能快取 → CloudFront；不能快取、要固定 IP、非 HTTP、要快速跨 Region 切換 → Global Accelerator。**

Global Accelerator 的 endpoint 只能是 ALB、NLB、EC2、EIP，不能是 S3。要 WAF 又要固定 IP → GA 在前、ALB 在後，WAF 掛在 ALB。

## 解耦與整合

看到「突發流量讓後端掛掉」「元件彼此依賴」「訂單不能遺失」，答案通常是在中間放 SQS；要「一份事件通知很多人」就是 SNS 或 EventBridge。

### SQS / SNS / EventBridge / Kinesis 比較

| 服務 | 模式 | 消費者數量 | 關鍵字 |
| --- | --- | --- | --- |
| SQS | 佇列（pull） | 一個（處理完就刪除） | decouple、buffer、削峰、非同步處理 |
| SNS | 發布 / 訂閱（push） | 多個訂閱者同時收到 | fan-out、通知（email、SMS、Lambda、SQS、HTTP） |
| EventBridge | 事件匯流排 + 規則路由 | 多個目標，依內容過濾 | AWS 服務事件、SaaS 事件、排程、跨帳號事件 |
| Kinesis Data Streams | 串流 | 多個消費者讀同一份，可重播 | 即時、大量、順序、replay |

### SQS 重點

| 項目 | Standard | FIFO |
| --- | --- | --- |
| 吞吐量 | 幾乎無限 | 每秒 300 則（batch 可到 3,000；high throughput 模式更高） |
| 順序 | 盡量但不保證 | 嚴格順序（依 message group） |
| 重複 | 至少一次（可能重複） | 恰好一次處理 |
| 名稱 | 任意 | 結尾必須是 `.fifo` |

- Visibility timeout：訊息被取走後對其他消費者隱藏的時間（預設 30 秒，最長 12 小時）；處理時間比它長就會被重複處理，要調長。
- 保留期間：預設 4 天，最長 14 天。
- Long polling（最多 20 秒）：減少空回應、降低成本。
- Dead-letter queue (DLQ)：處理失敗多次的訊息移到另一個佇列，方便除錯。
- Delay queue：延遲最多 15 分鐘才可見。
- 訊息大小上限：2025 年 8 月起提高到 1 MiB（舊教材和題庫寫 256 KB）[↗](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib)；更大的檔案用 S3 存內容、SQS 放指標（Extended Client Library）。
- 依佇列長度擴展 EC2：用 CloudWatch 指標 `ApproximateNumberOfMessagesVisible`（或每台 instance 的待處理量）做 target tracking。
- Lambda 消費 SQS 時，visibility timeout 建議設為函式 timeout 的 6 倍。Long polling 解決不了重複處理。
- FIFO 的去重視窗是 5 分鐘（deduplication ID 或內容雜湊）。

### SNS 重點

- SNS + SQS fan-out：一個事件同時送到多個 SQS 佇列，各自獨立處理（例如訂單同時給出貨、帳務、分析）。
- Message filtering：訂閱者只收符合條件的訊息。
- SNS FIFO topic：搭配 SQS FIFO 保持順序。
- 投遞失敗的訊息要留下來 → subscription DLQ（SQS）。Lambda 非同步呼叫失敗 → on-failure destination。
- SNS 的 email 只有純文字；要寄 HTML 報表 → SES。

### EventBridge 重點

- 規則依事件內容路由到 Lambda、Step Functions、SQS、SNS、ECS task 等。
- EventBridge Scheduler：取代 EC2 上的 cron job（serverless 排程）。
- SaaS 整合：Zendesk、Datadog、Shopify 等事件直接進 AWS。
- Archive & replay：保存並重播事件。
- Pipes：點對點連接來源和目標，中間可過濾和轉換。
- 常見用法：「EC2 狀態改變 / GuardDuty 發現 / S3 物件建立時自動處理」→ EventBridge rule + Lambda。
- Input transformer：只把需要的欄位送給目標（SNS filter 只挑訊息，不裁欄位）。
- API destinations：把事件送到外部 HTTP API（含 basic auth、API key）。
- 一個 S3 事件要送多個目標 → 開啟 S3 → EventBridge。S3 原生通知每個事件類型 / prefix 只能有一個目的地。
- 檢查 rule 有沒有觸發、目標有沒有失敗 → CloudWatch 的 `AWS/Events` 指標（TriggeredRules、Invocations、FailedInvocations）。

### Step Functions

- 把多個步驟串成有狀態的工作流程，內建重試、錯誤處理、平行分支、等待、人工審核（callback）。
- Standard workflow：最長 1 年、恰好一次執行，適合長流程、審核流程。
- Express workflow：最長 5 分鐘、高吞吐量，適合大量短事件。
- 關鍵字：orchestrate、workflow、多個 Lambda 依序執行、需要人工批准。
- Distributed Map：大量平行處理 S3 物件（最多 10,000 個平行子流程）；inline Map 的併發約 40。

### API Gateway

| 類型 | 說明 |
| --- | --- |
| REST API | 功能最完整：API key、usage plan、請求驗證、快取、WAF |
| HTTP API | 更便宜、更低延遲，功能較少 |
| WebSocket API | 雙向即時通訊（聊天室、即時通知） |

- 端點類型：Edge-optimized（經 CloudFront，全球使用者）、Regional、Private（只能從 VPC 透過 interface endpoint 存取）。
- Throttling、usage plans + API keys：限制每個客戶的請求量。
- Caching：快取回應，降低後端負擔。
- 驗證：IAM、Cognito User Pool authorizer、Lambda authorizer（自訂 token 邏輯）。
- 整合逾時預設 29 秒（2024 年 6 月起 Regional / Private REST API 可申請調高）[↗](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-api-gateway-integration-timeout-limit-29-seconds/)；長時間工作仍建議改為非同步（送進 SQS / Step Functions 後立即回應）。
- 經典 serverless 架構：API Gateway + Lambda + DynamoDB。
- 新版本先給一小部分流量 → canary release；連到 private subnet 的容器 → VPC link；限制來源 IP → resource policy（`aws:SourceIp`）。
- 自訂網域的 ACM 憑證：edge-optimized 要在 us-east-1，Regional 要在同一個 Region。

### 其他整合服務

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| Amazon MQ | 託管的 ActiveMQ / RabbitMQ | 從地端遷移、不改程式、AMQP、MQTT、STOMP、OpenWire 等標準協定 |
| AWS AppSync | 託管的 GraphQL API | GraphQL、即時資料同步、離線行動 App |
| Amazon SES | 寄送大量 email | transactional email、行銷信 |
| AWS AppFlow | SaaS（Salesforce、SAP、Slack）和 AWS 之間的資料傳輸，可走 PrivateLink 不經公網 | SaaS 資料整合、無程式碼 |

口訣：**新系統用 SQS / SNS；地端已有 ActiveMQ / RabbitMQ 要搬上來不改程式 → Amazon MQ。**

## 大數據與分析

記住資料流的四段：進來（Ingest）→ 處理（Process）→ 存放（Store）→ 分析（Analyze），每段挑對服務就能解大部分題目。

### 串流資料進來

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| Kinesis Data Streams | 即時串流管道，資料保留可重讀（預設 24 小時，最長 365 天）；provisioned（shard）或 on-demand 模式 | real-time、多個 consumer、replay、自訂處理 |
| Amazon Data Firehose（舊名 Kinesis Data Firehose） | 全託管搬運工，自動送到 S3、Redshift、OpenSearch、Splunk；可用 Lambda 轉換、轉成 Parquet | near-real-time、least operational overhead、不能重讀 |
| Managed Service for Apache Flink（舊名 Kinesis Data Analytics） | 對串流做即時 SQL / 計算 | 即時分析、時間視窗統計 |
| Amazon MSK | 託管 Apache Kafka（也有 serverless） | 題目提到 Kafka |
| Kinesis Video Streams | 影像串流 | 攝影機、影片分析 |
| AWS IoT Core | 大量 IoT 裝置連線（MQTT） | IoT devices |

口訣：**要即時、要重播 → Data Streams；要省事送進 S3 / Redshift → Firehose；Kafka → MSK。**

- Firehose 不能送進 DynamoDB；要寫 DynamoDB → Data Streams + Lambda。
- Firehose 內建轉成 Parquet / ORC（record format conversion，用 Glue Data Catalog 的 schema）。

### 處理與轉換

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| AWS Glue | serverless ETL；Crawler 自動掃描資料建立 Data Catalog | ETL、schema discovery、CSV 轉 Parquet |
| Glue DataBrew | 視覺化資料清理，不用寫程式 | 資料分析師清理資料 |
| Amazon EMR | 託管 Hadoop / Spark / Hive / Presto 叢集（也有 EMR Serverless） | 大規模資料處理、題目提到 Spark、Hadoop |
| AWS Lambda | 輕量即時轉換 | 單筆事件處理、15 分鐘內 |
| AWS Batch | 批次運算 | 大量平行工作 |

- Glue job 每次都重跑舊資料 → job bookmarks。
- EMR 叢集：primary 和 core node（存 HDFS）用 On-Demand，task node 用 Spot。

### 存放與分析

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| Amazon S3 | Data Lake 核心 | 原始資料、任何格式、便宜 |
| AWS Lake Formation | 快速建立 data lake，集中管理細緻權限：data filters 做列、欄、儲存格層級；LF-TBAC 用 tag 跨帳號授權；blueprints 從資料庫匯入 | build data lake、fine-grained access control |
| Amazon Athena | serverless，直接用 SQL 查 S3，按掃描量計費 | ad-hoc 查詢、查 log（CloudTrail、ALB、VPC Flow Logs） |
| Amazon Redshift | 資料倉儲（OLAP，欄式儲存），PB 級；有 Redshift Serverless | complex analytics、BI、data warehouse |
| Redshift Spectrum | Redshift 直接查 S3，不用載入 | 倉儲資料 + S3 資料一起查 |
| Amazon QuickSight | BI 儀表板、視覺化（2025 年 10 月起併入 Amazon Quick Suite，2026 年再簡稱 Amazon Quick，BI 功能叫 Quick Sight；考題仍用 QuickSight）[↗](https://aws.amazon.com/blogs/business-intelligence/reimagine-business-intelligence-amazon-quicksight-evolves-to-amazon-quick-suite) | dashboard、報表 |
| Amazon OpenSearch | 搜尋和 log 分析 | full-text search、log analytics |

**Athena 省錢技巧：** 資料轉成 Parquet / ORC（欄式）、壓縮、分割（partition），讓查詢掃描更少資料。

Redshift 考點：

- 是 OLAP（分析），不是 OLTP（交易）；日常交易用 RDS / Aurora。
- 可以做跨 Region snapshot 複製當 DR。
- Zero-ETL integration：Aurora、RDS、DynamoDB 的資料自動同步到 Redshift，不用自己寫 ETL。
- Concurrency scaling：查詢尖峰時自動加容量。
- Redshift ML：直接用 SQL 建立和使用機器學習模型。

### Data Lake vs Data Warehouse

|  | Data Lake（S3） | Data Warehouse（Redshift） |
| --- | --- | --- |
| 資料 | 原始、任何格式（結構化、半結構化、非結構化） | 整理過、結構化 |
| Schema | 讀取時才定義（schema-on-read） | 寫入時就定義（schema-on-write） |
| 成本 | 便宜 | 較貴 |
| 典型工具 | Glue + Athena + Lake Formation | Redshift + QuickSight |

### 常見架構組合

- 串流 → S3 → 查詢：Firehose → S3 → Athena
- 串流 → 資料倉儲：Firehose → Redshift
- 即時處理：Kinesis Data Streams → Lambda
- 標準 Data Lake：S3 + Glue Crawler / Data Catalog + Athena + QuickSight，權限用 Lake Formation
- 點擊流分析：Kinesis Data Streams → Managed Flink → Firehose → S3 / Redshift
- 查 AWS log：log 存 S3 → Athena
- IoT：IoT Core → Kinesis / Firehose → S3 → Athena / QuickSight
- 帳單分析：CUR（現為 Data Exports / CUR 2.0）存 S3 → Athena → QuickSight

## 監控與維運

分清楚：CloudWatch 看效能和 log、CloudTrail 看誰做了什麼、Config 看設定是否合規、Systems Manager 管機器。

### CloudWatch

| 功能 | 說明 | 要點 |
| --- | --- | --- |
| Metrics | 效能指標 | EC2 預設 5 分鐘一次，detailed monitoring 1 分鐘；記憶體、磁碟使用率不是預設指標，要裝 CloudWatch agent |
| Alarms | 指標超過門檻時動作 | 可觸發 SNS、Auto Scaling、EC2 動作（停止、重開、復原）；composite alarm 組合多個警報減少誤報 |
| Logs | 集中 log | 可設保留期、匯出到 S3、subscription filter 即時送到 Lambda / Firehose / OpenSearch；metric filter 從 log 產生指標 |
| Logs Insights | 用查詢語法分析 log | 快速查錯 |
| Dashboards | 儀表板 | 可跨帳號、跨 Region |
| Synthetics | 定時模擬使用者操作的 canary 腳本 | 主動監控網站可用性 |
| Container Insights / Lambda Insights | 容器、Lambda 的細部指標 | ECS、EKS 監控 |
| Dashboard sharing | 分享給沒有 AWS 帳號的人（email、公開連結） | 不必為對方建 IAM user |
| Cross-account observability | 一個 monitoring account 集中看多個帳號 | 多帳號監控 |

- 「EC2 記憶體使用率」→ CloudWatch agent（不是預設指標）。
- 「EC2 硬體故障自動復原」→ CloudWatch alarm + recover action（保留 IP 和 instance ID）。
- X-Ray：分散式追蹤，找出微服務中哪個環節慢或出錯。

### CloudTrail

- 記錄所有 API 呼叫（誰、何時、從哪裡、做了什麼）；預設保留 90 天的管理事件。
- 要長期保存 → 建 trail 存到 S3；organization trail 一次收集所有帳號。
- Data events（S3 物件層、Lambda 呼叫）預設不記錄，要另外開。
- CloudTrail Insights：偵測異常的 API 活動量。
- 題目「誰刪了這個資源」→ CloudTrail。
- 「誰改了 security group」→ CloudTrail；「有沒有 SG 對 0.0.0.0/0 開 22 port」→ Config managed rule `restricted-ssh`。

### Systems Manager（SSM）

| 功能 | 說明 |
| --- | --- |
| Session Manager | 不開 SSH port、不用金鑰就能登入 instance，有稽核紀錄；連線紀錄可直接存到 S3 / CloudWatch Logs |
| Run Command | 一次對大量 instance 執行指令（「現在立刻」修補第三方軟體也用它；Patch Manager 是依 baseline 排程修補 OS） |
| Patch Manager | 自動修補 Windows / Linux 作業系統 |
| Inventory | 收集 instance 上的軟體和設定清單 |
| State Manager | 讓 instance 維持指定設定 |
| Automation | 自動化維運流程（runbook），也用於 Config 自動修復 |
| Parameter Store | 存設定和密碼 |
| Maintenance Windows | 排定維護時段 |
| Default Host Management Configuration | 帳號層級設定，不必逐台改 instance profile 就能讓 SSM 管理 |

- 管理地端伺服器也可以（裝 SSM Agent，註冊為 hybrid managed node）。
- 「自動修補 + 盤點 + 漏洞報告」→ Patch Manager + Inspector。

### 基礎架構即程式碼與部署

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| CloudFormation | 用 YAML / JSON 範本建立整套資源 | infrastructure as code、可重複部署 |
| StackSets | 一次部署到多帳號、多 Region | multi-account / multi-region 部署 |
| AWS CDK | 用程式語言寫 IaC，產生 CloudFormation | TypeScript、Python 寫基礎架構 |
| AWS SAM | serverless 專用的 CloudFormation 擴充 | Lambda + API Gateway 部署 |
| AWS Service Catalog | 管理員預先核准的產品目錄，使用者自助部署 | 自助服務、符合規範 |
| CodePipeline / CodeBuild / CodeDeploy | CI/CD 流程、建置、部署（含藍綠、canary） | CI/CD |

### 其他維運工具

| 服務 | 說明 |
| --- | --- |
| AWS Trusted Advisor | 依最佳實踐檢查成本、效能、安全、容錯、服務上限並給建議（完整檢查需 Business 以上支援方案） |
| AWS Health Dashboard | AWS 服務事件和影響你資源的維護通知；可用 EventBridge 自動處理 |
| Service Quotas | 查看和申請提高服務上限 |
| AWS Compute Optimizer | 用使用數據給 EC2、EBS、Lambda、ECS on Fargate 的 rightsizing 建議和預估節省金額（Lambda CPU 不夠 → 調高記憶體，vCPU 會跟著增加） |
| AWS Well-Architected Tool | 依六大支柱審查架構 |
| Resource Groups Tag Editor | 跨 Region、跨服務找出並編輯帶某個 tag 的資源 |
| Workload Discovery on AWS | 畫出跨帳號、跨 Region 的資源關係圖 |

**Well-Architected 六大支柱：** 卓越營運（Operational Excellence）、安全（Security）、可靠性（Reliability）、效能效率（Performance Efficiency）、成本優化（Cost Optimization）、永續性（Sustainability）。

## 高可用與災難復原

**高可用（HA）防 AZ 故障，靠 Multi-AZ；災難復原（DR）防整個 Region 故障，靠跨 Region。** 先判斷題目防的是哪一種。

### RPO 與 RTO

- RPO（Recovery Point Objective）：最多能丟失多久的資料。看備份 / 複製頻率。
- RTO（Recovery Time Objective）：最多能停機多久。看恢復速度。
- 口訣：**RPO 往回看（資料），RTO 往前看（時間）。** 數字越小越貴。

### 四種 DR 策略（必考）

| 策略 | 做法 | RPO / RTO | 成本 |
| --- | --- | --- | --- |
| Backup & Restore | 只定期備份到另一個 Region，出事才重建 | 小時級 | 最便宜 |
| Pilot Light | 核心資料持續複製（例如資料庫 replica），其他伺服器關著或極小，出事才開起來擴展 | 數十分鐘 | 低 |
| Warm Standby | 另一個 Region 有縮小版但完整運作的環境，出事就擴大 | 分鐘級 | 中 |
| Multi-site Active/Active | 兩個 Region 同時全量服務 | 接近零 | 最貴 |

口訣（從便宜到貴）：**備份 → 小火苗 → 溫機 → 雙活。** 題目說「最低成本且 RTO 可接受數小時」→ Backup & Restore；說「資料庫一直同步，但應用伺服器平時不開」→ Pilot Light；說「縮小版環境一直在跑」→ Warm Standby。

### 各服務的 HA / DR 做法

| 服務 | 高可用（AZ 層級） | 災難復原（Region 層級） |
| --- | --- | --- |
| EC2 | Auto Scaling group 跨多 AZ + ELB | AMI 複製到其他 Region、AWS Elastic Disaster Recovery |
| EBS | snapshot（本身綁單一 AZ） | snapshot 跨 Region 複製 |
| RDS | Multi-AZ | 跨 Region read replica、snapshot 跨 Region 複製 |
| Aurora | 6 份副本跨 3 AZ、replica 自動 failover | Aurora Global Database |
| DynamoDB | 預設跨多 AZ | Global Tables |
| S3 | 預設跨至少 3 個 AZ（One Zone 類別除外） | CRR 跨 Region 複製 |
| EFS | Regional 預設跨多 AZ | EFS replication 到其他 Region |
| ElastiCache | Redis / Valkey Multi-AZ 自動 failover | Global Datastore |
| DNS 切換 | Route 53 health check | Route 53 failover routing |
| 全球入口 | ELB | Global Accelerator、CloudFront origin failover |

### 備份與 DR 服務

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| AWS Backup | 集中管理多種服務（EC2、EBS、RDS、Aurora、DynamoDB、EFS、FSx、S3）的備份計畫；選 EC2 instance 會建 AMI；可設 lifecycle 轉 cold storage | centralized backup、跨帳號、跨 Region 複製、長期保留 |
| AWS Backup Vault Lock | 備份不可刪除（WORM）；compliance mode 誰都解不開，governance mode 有權限的人可解除 | 防勒索軟體、法規 |
| AWS Elastic Disaster Recovery (DRS) | 持續複製伺服器（地端或雲端）到 AWS，秒級 RPO、分鐘級 RTO | 伺服器層級 DR、地端 DR 到 AWS |
| Data Lifecycle Manager | 自動建立 EBS snapshot 和 AMI（不含 RDS） | EBS snapshot 排程 |

- RPO / RTO 都是 24 小時的 RDS → 把自動 snapshot 複製到另一個 Region 就夠，不需要跨 Region replica。
- Stateless 的 tier 不必備份 EBS，保留最新的 AMI 即可。

### 高可用設計口訣

- **無狀態**：session 放 ElastiCache / DynamoDB，EC2 才能隨意增減。
- **至少兩個 AZ**：subnet、NAT Gateway、instance 都要多 AZ。
- **解耦**：中間放 SQS，一端掛了另一端不受影響。
- **自動恢復**：Auto Scaling 健康檢查換掉壞的 instance。
- **單點故障要消除**：單一 NAT Gateway、單一 EC2、單一 AZ 的資料庫都是常見的錯誤答案。

## 遷移與傳輸

先判斷搬的是什麼：伺服器 → MGN；資料庫 → DMS（+ SCT）；檔案 → DataSync；大量離線資料 → Snowball；持續 SFTP 傳檔 → Transfer Family。

### 遷移策略（7R）

| 策略 | 意思 | 典型工具 |
| --- | --- | --- |
| Rehost | 原封不動搬（lift and shift） | AWS Application Migration Service (MGN) |
| Replatform | 小改（lift, tinker and shift），例如資料庫改用 RDS | DMS、Elastic Beanstalk |
| Repurchase | 改用 SaaS | — |
| Refactor / Re-architect | 重寫成雲原生（serverless、微服務） | Lambda、容器 |
| Relocate | 整個 VMware 環境搬過去 | VMware Cloud on AWS |
| Retire | 下線不用的系統 | — |
| Retain | 暫時保留在地端 | — |

### 伺服器與資料庫遷移

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| AWS Application Migration Service (MGN) | 持續複製地端伺服器到 AWS，最少停機切換（2026 年 6 月更名為 AWS Transform MGN，考題仍用 MGN / Application Migration Service）[↗](https://aws.amazon.com/de/about-aws/whats-new/2026/06/aws-transform-mgn-rebrand/) | lift-and-shift、rehost、大量 VM |
| AWS Application Discovery Service | 盤點地端伺服器、相依性、使用率（2025 年 11 月起不再接受新客戶，新專案改用 AWS Transform）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) | 遷移前評估 |
| AWS Migration Hub | 集中追蹤遷移進度（2025 年 11 月起不再接受新客戶，新專案改用 AWS Transform）[↗](https://docs.aws.amazon.com/migrationhub/latest/ug/migrationhub-availability-change.html) | track migration |
| AWS DMS | 資料庫遷移，來源在遷移期間持續可用；CDC 持續同步變更 | minimal downtime、ongoing replication |
| AWS SCT / DMS Schema Conversion | 轉換資料庫 schema（例如 Oracle → Aurora PostgreSQL） | 異質資料庫遷移 |

口訣：**同種資料庫（MySQL → RDS MySQL）只要 DMS；不同種（Oracle → PostgreSQL）要 SCT 轉 schema + DMS 搬資料。**

- MGN 流程：裝 replication agent → 持續複製 → test launch → cutover。

### 資料傳輸

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| AWS DataSync | 透過網路自動化傳輸檔案（NFS、SMB、HDFS、物件儲存）到 S3、EFS、FSx，也能 AWS 服務之間互傳；有加密、驗證、排程 | online transfer、定期同步、搬 NAS |
| AWS Transfer Family | 託管的 SFTP / FTPS / FTP / AS2 伺服器，後端是 S3 或 EFS；可接 AD 或 Lambda 自訂 IdP；VPC 型 endpoint 可用 EIP + SG 限制來源 IP；managed workflows 處理上傳後的步驟 | 合作夥伴用 SFTP 上傳檔案 |
| Snowball Edge | 離線的實體搬運裝置，TB 到 PB 級；Compute Optimized 版可在邊緣運算（2025 年 11 月 7 日起不再接受新客戶）[↗](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html) | 網路太慢、要好幾週、沒有網路、偏遠地點 |
| S3 Transfer Acceleration | 遠距離上傳 S3 加速 | 全球使用者上傳到單一 bucket |
| Direct Connect | 長期穩定專線 | 持續大量傳輸 |

Snow 家族已大幅縮減：Snowcone、Snowmobile 已停用，Snowball Edge 也從 2025 年 11 月 7 日起不再接受新客戶。AWS 給新客戶的替代方案是：線上傳輸用 DataSync、實體搬運用 AWS Data Transfer Terminal、邊緣運算用 Outposts。但 SAA-C03 題庫仍以 Snowball Edge 作為「大量離線搬運」的標準答案。

- 判斷要不要用 Snowball：算一下「資料量 ÷ 可用頻寬」，網路要傳超過一週或頻寬會影響正常業務 → Snowball。
- 「一次性搬 + 之後持續同步」→ 先 Snowball 搬大批，再用 DataSync 或 DMS 同步增量。
- 「地端 NAS 定期同步到 EFS / S3」→ DataSync（不是 Storage Gateway；Storage Gateway 是讓地端長期使用雲端儲存）。
- 頻寬換算：Mbps ÷ 8 = MB/s。100 Mbps ≈ 每天 1 TB；1 Gbps ≈ 每天 10.8 TB（理論值，實際約打七八折）。例：600 TB 走 100 Mbps 要一年半以上。
- 新拉 Direct Connect 要數週，短期內要搬完的題目不能指望新專線。
- DataSync 可限制頻寬、只傳有變動的檔案、內建完整性驗證；搬到 FSx for Windows 可保留 ACL。

### DataSync vs Storage Gateway vs Transfer Family

|  | DataSync | Storage Gateway | Transfer Family |
| --- | --- | --- | --- |
| 目的 | 搬移 / 同步資料 | 地端應用持續使用雲端儲存 | 外部夥伴用 SFTP / FTP 傳檔 |
| 模式 | 一次性或排程任務 | 長期混合架構 | 長期檔案交換 |

## 成本優化

成本題的套路很固定：穩定負載買承諾折扣、可中斷用 Spot、不常用的資料往下層搬、用量不定改 serverless、網路流量避開 NAT 和跨 AZ。

### 運算省錢

| 情境 | 答案 |
| --- | --- |
| 24/7 穩定跑、長期使用 | Savings Plans 或 Reserved Instances |
| 未來可能換 instance 類型、或混用 EC2 / Fargate / Lambda | Compute Savings Plans |
| 批次、可中斷、可重試 | Spot Instances（或 Spot Fleet、Auto Scaling 混合 On-Demand + Spot） |
| 開發測試環境晚上和週末不用 | 排程關機（Instance Scheduler、EventBridge + Lambda） |
| 用量很低或間歇 | Lambda、Fargate、Aurora Serverless v2 |
| instance 太大、使用率低 | Compute Optimizer rightsizing |
| 改用 Graviton（ARM）instance | 同等效能更便宜 |
| 每週固定某天跑幾小時 | 排程起停或 Savings Plans（Scheduled Reserved Instances 已停售） |
| Fargate 穩定流量 + 突發 | capacity provider：Fargate 打底、Fargate Spot 吃突發 |

### 儲存省錢

| 情境 | 答案 |
| --- | --- |
| 存取模式未知 | S3 Intelligent-Tiering |
| 存取模式可預測，舊資料很少用 | S3 Lifecycle 轉到 IA / Glacier |
| 法規保存多年、幾乎不讀 | Glacier Deep Archive |
| 可重建的資料 | One Zone-IA |
| EBS 用 gp2 | 換成 gp3（更便宜，效能可獨立調整） |
| 沒掛載的 EBS volume、舊 snapshot | 刪除或用 snapshot archive |
| EFS 中不常用的檔案 | EFS lifecycle 到 IA / Archive |
| 下載流量太貴 | CloudFront 快取（減少來源流出）、S3 Requester Pays |

### 網路省錢

- private subnet 存取 S3 / DynamoDB → Gateway endpoint（免費），避免 NAT Gateway 處理費。
- 減少跨 AZ 流量：盡量讓相互溝通的元件在同 AZ（但不要犧牲高可用）。
- 每個 VPC 一個 NAT Gateway 很貴時，可考慮集中化（Transit Gateway 共用出口），但題目若要高可用，仍要每個 AZ 一個。
- 長期大量資料傳輸 → Direct Connect 的資料流出費率比網際網路低。
- 兩個大陸下載 S3 內容太貴 → CloudFront（S3 到 CloudFront 的傳輸免費，CloudFront 流出單價比 S3 低）。Transfer Acceleration 是加錢加速上傳，不是省錢。

### 成本管理工具

| 服務 | 說明 | 關鍵字 |
| --- | --- | --- |
| AWS Cost Explorer | 視覺化分析過去花費，預測未來（也有 API），給 Savings Plans / RI 購買建議 | analyze costs、forecast |
| AWS Budgets | 設定預算，超過或預測會超過時通知，可自動執行動作（套用 IAM policy 或 SCP、停止 instance）；也能監控 Savings Plans / RI 的涵蓋率 | alert when exceeding budget |
| AWS Cost and Usage Report (CUR) / Data Exports | 最細的帳單明細，可用 Athena 分析 | detailed billing data |
| Cost Allocation Tags | 用標籤把費用分到部門或專案 | chargeback、按部門分攤 |
| AWS Cost Anomaly Detection | 用機器學習偵測異常花費 | unexpected spend |
| AWS Compute Optimizer | rightsizing 建議 + 預估每月節省 | over-provisioned |
| Trusted Advisor | 找出閒置資源（閒置 EC2、未用 EIP、低使用率 EBS） | idle resources |
| AWS Pricing Calculator | 上雲前估算成本 | estimate before deploying |

口訣：**看過去 → Cost Explorer；管未來 → Budgets；找異常 → Anomaly Detection；調規格 → Compute Optimizer；分部門 → Cost Allocation Tags。**

Organizations 的省錢功能：

- Consolidated billing：所有帳號合併計費，用量合計享階梯折扣。
- RI 和 Savings Plans 的折扣可在組織內帳號間共用。
- Savings Plans 的範圍：Compute SP = EC2 + Fargate + Lambda；EC2 Instance SP = 單一 Region 的單一 instance 家族；SageMaker SP 只涵蓋 SageMaker；RDS 用 RDS Reserved Instances。
- Savings Plans 不能轉賣；某個帳號用不完 → 在 management account 開啟 discount sharing。
- 自訂的 cost allocation tag 要在 management account 啟用，才會出現在帳單和 Cost Explorer。

## AI / ML 服務對照

SAA 只考「哪個服務做哪件事」，不考模型細節。題目描述一個功能，你對到服務名稱即可。

| 服務 | 做什麼 | 題目關鍵字 |
| --- | --- | --- |
| Amazon Rekognition | 圖片、影片辨識：人臉、物件、不當內容；低信心的結果可交給 Amazon A2I 人工複核 | image / video analysis、face detection、content moderation |
| Amazon Textract | 從掃描文件擷取文字、表格、表單欄位 | extract text from scanned documents、forms、invoices |
| Amazon Comprehend | 文字分析：情緒、關鍵字、實體、語言 | sentiment analysis、NLP |
| Amazon Comprehend Medical | 醫療文字擷取（病歷中的藥名、病症） | medical records |
| Amazon Transcribe | 語音轉文字；可自動遮蔽個資（PII redaction）、分辨不同說話者（speaker diarization） | speech-to-text、字幕、通話紀錄 |
| Amazon Polly | 文字轉語音 | text-to-speech |
| Amazon Translate | 翻譯 | translate languages |
| Amazon Lex | 聊天機器人（語音、文字對話） | chatbot、conversational interface |
| Amazon Kendra | 企業內部文件的智慧搜尋（2026 年 7 月 30 日起不再接受新客戶）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) | enterprise search、自然語言問答 |
| Amazon Personalize | 個人化推薦 | recommendations |
| Amazon Forecast | 時間序列預測（新客戶已不提供，舊題可能出現；現在改用 SageMaker Canvas） | demand forecasting |
| Amazon Fraud Detector | 線上詐騙偵測（新客戶已不提供，舊題可能出現） | fraud |
| Amazon SageMaker AI | 自己建立、訓練、部署機器學習模型的平台 | build / train / deploy custom ML models |
| Amazon Bedrock | 透過 API 使用生成式 AI 基礎模型（含 Claude） | generative AI、foundation models、RAG |
| Amazon Q | 生成式 AI 助手（Q Developer 給開發者；Q Business 2026 年 7 月 30 日起不再接受新客戶，功能併入 Amazon Quick）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) | AI assistant |
| AWS Elemental MediaConvert | 影片轉檔（取代 2025 年 11 月 13 日停止服務的 Elastic Transcoder）[↗](https://aws.amazon.com/blogs/media/support-for-amazon-elastic-transcoder-ending-soon) | video transcoding |
| AWS End User Messaging | 簡訊、語音、推播 API（Pinpoint 2026 年 10 月 30 日終止支援後的去處）[↗](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html) | SMS、push notifications |

口訣：**看圖 → Rekognition；讀文件 → Textract；懂文字 → Comprehend；聽 → Transcribe；說 → Polly；翻 → Translate；聊 → Lex；搜 → Kendra；推薦 → Personalize；自己訓練 → SageMaker；生成式 → Bedrock。**

多語客服通話做情緒分析 → Transcribe → Translate → Comprehend。

## 情境題：拿不定主意時怎麼選

前面各章是「需求 → 服務」的對照，單一需求的題目靠它就能直接選。情境題難在一題同時給好幾個條件，而且常有兩個選項看起來都能動。這一章整理這類題目的判斷方法：先用固定流程刪選項，再用決策卡分辨相似的選項，最後用混合練習自我測驗。

### 這一章怎麼用

- 決策卡先遮住右欄，看左欄的線索自己回答，再對答案。答錯的卡片做記號，隔一天再看一次。
- 自我測驗故意不按主題排列。混在一起練，練的是「分辨相似選項」，這正是情境題考的能力（interleaving）。先想好答案再展開。
- 考前把「刪選項用的硬限制」再掃一次。考場上最省時間的是直接刪掉不符合事實的選項，而不是比較兩個都對的選項。

### 判斷流程：先刪，再比

1. **刪掉描述錯誤的選項**：只要有一個細節不成立（功能不存在、放錯位置、超過限制），整個選項出局，其他部分再合理都沒用。拿來對照的硬限制見下一節。
2. **明確的數字和動詞優先**：「每年輪替」「12 小時內取回」「RPO 30 秒」「單一 writer」「所有資料立即可用」比 DR 層級表和形容詞都優先。
3. **注意現況描述**：「目前用 On-Demand」「在 console 建的 Lambda」「bucket 裡已經有物件」「已經有 Direct Connect」這類句子，通常就是答案要改、或要利用的地方。
4. **一題多筆資料就拆開**：例如「處理中的資料要最高 I/O，成品要耐久，舊資料要封存」是三筆資料，各自對應（instance store、S3、Glacier）。
5. **兩個目標同時出現**（「成本最低且維運最少」）：先刪掉任一目標不滿足的，再比剩下的。只靠自訂腳本或改程式才便宜的選項，遇到「最少工作量」就輸。
6. **最後才用形容詞比**：LEAST overhead 選託管、一步到位的；MOST cost-effective 選夠用就好的，不要多建（只說高可用，就不必跨 Region）。
7. **資訊不夠時**：選不需要額外假設就成立的選項。

複選題的正確組合通常是下面三種形狀之一。選完檢查兩個答案沒有重疊，而且合起來涵蓋題目的每個條件。

| 形狀 | 例子 |
| --- | --- |
| 各自涵蓋不同對象 | 不能用 cookie 的用戶端 → signed URL；URL 寫死的使用者 → signed cookie |
| 每層一個 | 資料庫一個 + 運算一個；接收一個 + 處理一個 |
| 預防 + 補救 | EBS 預設加密 + SCP 拒絕未加密；Intelligent-Tiering + 清掉未完成的 multipart upload |

### 刪選項用的硬限制

讀選項時拿來對照的事實。選項的描述和這些事實不符，就可以刪掉。

| 項目 | 事實 |
| --- | --- |
| Gateway endpoint | 掛在路由表上，不屬於任何 AZ，也沒有 security group |
| ASG、subnet | ASG 在單一 Region 內；subnet 在單一 AZ 內 |
| EC2 的 IAM 權限 | 透過一個 instance profile 掛一個 role |
| Security group | 只有 allow 規則；要 deny 用 NACL |
| 跨 Region peering | SG 規則寫對方的 CIDR |
| 加密既有的 RDS、EBS | Snapshot → 加密複製 → 還原成新的 |
| 還原 RDS snapshot | 一定建立新的 instance |
| RDS event notification | 通知維運事件：failover、備份、維護 |
| Multi-AZ DB cluster | 支援 MySQL、PostgreSQL |
| Aurora Global Database | 一個 writer Region，其他 Region 唯讀 |
| Data Lifecycle Manager | 管 EBS snapshot 和 AMI；RDS 備份用 AWS Backup |
| WAF | 關聯到 CloudFront、ALB、API Gateway、AppSync、Cognito 等資源；Global Accelerator、NLB 用 Shield Advanced 保護 |
| Snowball 和 FSx | 先匯入 S3，FSx for Lustre 再連結 S3 |
| Firehose 的目的地 | S3、Redshift、OpenSearch、Splunk、HTTP endpoint 等；寫 DynamoDB 用 Data Streams + Lambda |
| S3 原生事件通知 | 目標是 SNS、SQS Standard、Lambda；其他目標經 EventBridge |
| Lambda | 最長 15 分鐘；容器映像是 Linux |
| Savings Plans | 用 discount sharing 在組織內共用；Standard RI 才能在 Marketplace 轉賣 |
| 第三方 CA 的憑證 | 在外部簽好，再匯入 ACM |
| Lambda function URL | 使用 AWS 產生的網址和憑證；要自訂網域就用 API Gateway 或 CloudFront |
| Lifecycle 轉到 IA | 物件放滿 30 天才能轉；轉換日期要早於刪除日期 |
| Legal hold | 一直有效，直到被移除；要固定期限用 retention period |
| 規範 tag | Tag policy 規範值；擋下缺 tag 的建立用 SCP（`aws:RequestTag`）；自動加 tag 用 EventBridge + Lambda |
| 排程維運工作 | State Manager、Automation 或 EventBridge Scheduler；Session Manager 用來登入 |
| 寄 HTML email | SES；SNS 的 email 是純文字 |
| STS | 發 IAM 臨時憑證；免金鑰登入 instance 用 Session Manager |
| API Gateway 的 API key | 用於計量和節流；授權用 IAM、Cognito 或 Lambda authorizer |

### 決策卡

每張卡比較一組常被搞混的選項。左欄是題目裡的線索，右欄是答案。

**1. 訊息和事件**

| 線索 | 選 |
| --- | --- |
| 尖峰時請求不能掉、後端可以晚點處理 | SQS 放在中間緩衝 |
| 通知「人」、一則訊息給多個訂閱者 | SNS |
| 多個系統各自持久保存同一個事件 | SNS → 多個 SQS（fan-out） |
| 依事件內容路由、AWS 服務事件、呼叫外部 API、元件要最少 | EventBridge |
| 多個應用讀同一份資料、要重播、依 shard 保序 | Kinesis Data Streams |
| 只要把資料送進 S3、Redshift、OpenSearch | Firehose |
| 同一則訊息被 Lambda 處理好幾次 | 加長 visibility timeout（不是改用 FIFO） |
| 生產端自己重複送、要嚴格順序 | SQS FIFO |

- 「最少維運」又要依內容過濾：每個目標一條 EventBridge rule，比 SNS + 多個 SQS + 輪詢的 Lambda 元件少。題目要求緩衝或持久性時才選 SNS + SQS。
- 資料庫升級期間不能掉寫入 → SQS。RDS Proxy 只處理連線，不保存寫入。

**2. 讀取慢、連線多**

| 線索 | 選 |
| --- | --- |
| 要「減少」打到資料庫的讀取 | ElastiCache |
| 報表拖慢主資料庫、要把讀取分出去 | Read Replica |
| 連線數爆掉、Lambda 連線風暴、failover 要快 | RDS Proxy |
| Replica lag 要很小 | Aurora Replica（共用儲存，lag 通常 100 ms 內） |
| DynamoDB 要微秒讀取、不想改程式 | DAX |
| 高可用 + 多一點讀取能力 + 便宜 | Multi-AZ DB cluster（MySQL、PostgreSQL） |

- Read Replica 只是把讀取分出去，總讀取量不變。題目說 reduce reads → 快取。
- 寫入被節流、請求被丟掉 → 用 SQS 緩衝寫入。DAX 和快取只幫得了讀取。

**3. 跨 Region 的資料庫**

| 線索 | 選 |
| --- | --- |
| 只說「高可用、自動 failover」 | Multi-AZ（不必跨 Region） |
| 「另一個 Region 也要能讀」 | Cross-Region Read Replica 或 Aurora Global Database |
| 單一 writer、全球讀取、複製 1 秒內 | Aurora Global Database |
| 多個 Region 同時寫入 | DynamoDB Global Tables |
| 只要複製到第二個 Region、成本最低、沒提 RTO | Aurora Global Database headless secondary |

**4. DR：先看數字，再看形容詞**

| 線索 | 選 |
| --- | --- |
| RTO、RPO 以小時計 | AWS Backup 跨 Region 複製（Backup & Restore） |
| RTO 數十分鐘、MOST cost-effective | Pilot Light（資料持續複製，伺服器靠 IaC 或維持最小規模） |
| LEAST downtime、RTO 幾分鐘 | Warm Standby：另一個 Region 已有縮小版 ASG + ALB，資料用 Global Database 或 Global Tables，Route 53 failover |
| 地端 VM、RPO 秒級、RTO 一小時內、要便宜 | Elastic Disaster Recovery |
| 幾乎不能停機 | Multi-site Active/Active |

- 具體服務的實際 RPO 比層級表準。DRS 的價格像 Pilot Light，RPO 卻是秒級。
- 「主要 Region 正常時不必服務流量」→ 不是 Active/Active。
- 用 CloudWatch alarm + Lambda 改 DNS，等於在重做 Route 53 health check + failover routing。

**5. 擴展的時機**

| 線索 | 選 |
| --- | --- |
| 已知的時間點（上班前、週末），而且知道要幾台 | Scheduled scaling（調 desired，不要設 min = max） |
| 有規律，但「沒人有空分析」 | Predictive scaling |
| 一天內無法預測的突發 | Target tracking |
| 依佇列處理工作 | 依每台的 backlog 做 target tracking |

- 「只有每天一開始很慢」→ 要事前擴展；調低門檻、縮短冷卻時間都還是事後反應。
- 要省錢就改 ASG 的 min、desired、max。只把 instance 從 target group 拿掉，機器照樣計費。

**6. 運算平台**

| 線索 | 選 |
| --- | --- |
| 15 分鐘內、事件觸發 | Lambda |
| 超過 15 分鐘、已容器化、定期執行 | ECS Fargate scheduled task |
| 長時間、大量平行、多種語言的批次 | AWS Batch |
| 大規模格式轉換（CSV → Parquet）、最少維運 | Glue ETL |
| 容器 + 最少維運 | ECS 或 EKS managed node group，不要自己用 ASG 跑容器 |
| 保留大部分既有程式碼、拆給不同團隊 | 容器化後放到 ECS（改用 Lambda、Amplify 等於重寫） |

**7. 購買方式**

| 線索 | 選 |
| --- | --- |
| 24/7 穩定運作（包括資料庫） | RI 或 Savings Plans |
| 之後可能換家族、換 Region，或混用 Fargate、Lambda | Compute Savings Plans |
| 可中斷，而且前面有 SQS | Spot（中斷只會延遲，工作不會丟） |
| 突發不能中斷，前面也沒有緩衝 | On-Demand |
| 一個月只用幾天的資料庫 | Snapshot 後刪除（停止的 RDS 7 天後會自動開機） |

**8. S3 儲存類別**

| 線索 | 選 |
| --- | --- |
| 知道放幾天後就少用 | Lifecycle rule（Intelligent-Tiering 有監控費） |
| 存取模式未知或會變 | Intelligent-Tiering（不要開 Archive 層，否則就不是立即取回） |
| 立即取回、偶爾用、不能遺失 | Standard-IA |
| 立即取回、一季一次以下 | Glacier Instant Retrieval |
| 可以等幾分鐘到幾小時 | Glacier Flexible Retrieval |
| 12 小時內取回即可 | Glacier Deep Archive |

- 「不能遺失」「無法重建」「高可用」→ 排除 One Zone-IA。
- 「幾分鐘內交付 GB 等級的檔案」→ IA 類別。Expedited 對大檔不保證 1-5 分鐘。
- 最短計費天數是按比例收費，不是禁止提早刪除。第 30 天轉 Glacier、第 90 天刪除，仍可能比一直放在 Standard-IA 便宜。

**9. 加密與金鑰**

| 線索 | 選 |
| --- | --- |
| 只說「靜態加密」、最少維運 | SSE-S3（2023 年起預設） |
| 明確的輪替週期（「每年」） | KMS customer managed key + 自動輪替 |
| 要控制誰能用金鑰、要稽核 | Customer managed key + key policy |
| 「同一把金鑰」在兩個 Region 都要能解密 | Multi-Region key |
| 既有物件要加密 | S3 Inventory + Batch Operations（預設加密只管新物件） |
| 既有物件要複製到另一個 bucket | S3 Batch Replication（CRR、SRR 只管新物件） |

- 明說的需求（每年輪替）壓過「最少維運」：SSE-S3 的輪替無法設定，也沒有公開週期。
- 注意步驟順序：先放資料、後開加密或複製，既有物件就漏掉了。

**10. 防刪除**

| 線索 | 選 |
| --- | --- |
| 防止誤刪 | Versioning + MFA Delete |
| 固定期限內誰都不能刪（包括 root） | Object Lock compliance mode |
| 固定期限，但特定的人可以解除 | Object Lock governance mode |
| 沒有期限，「直到公司決定」 | Legal hold |
| 備份不能被刪 | AWS Backup Vault Lock（compliance mode） |

- 用 IAM policy 或 bucket policy 擋刪除不算 WORM，管理員可以把 policy 改掉。

**11. 搬資料：先算時間**

| 線索 | 選 |
| --- | --- |
| 資料量小、頻寬夠、只搬一次 | `aws s3 sync` 等 CLI 指令（本身走 HTTPS） |
| 大量、定期、要驗證、要限頻寬 | DataSync |
| 傳輸時間超過期限，或沒有多餘頻寬 | Snowball |
| 長期持續傳輸、不想占用網際網路頻寬 | Direct Connect（要數週才拉得好） |
| 地端應用之後還要繼續用雲端儲存 | Storage Gateway（它不是搬遷工具） |
| 全球使用者上傳、下載各不相同的大檔 | S3 Transfer Acceleration（每個檔案都不同，CloudFront 快取幫不上） |

- 頻寬換算見〈遷移與傳輸〉：100 Mbps ≈ 每天 1 TB。
- Volume Gateway：「所有資料都要立即可用」→ stored；本機空間有限、只留熱資料 → cached。

**12. 共享檔案**

| 線索 | 選 |
| --- | --- |
| Linux、多台 EC2 共用、可寫入的目錄 | EFS |
| SMB、Windows、AD | FSx for Windows File Server |
| 同一份資料同時要 SMB 和 NFS | FSx for NetApp ONTAP |
| HPC、次毫秒延遲、搭配 S3 | FSx for Lustre |
| 地端應用存取 S3 | S3 File Gateway |
| 合作夥伴用 SFTP 傳檔 | Transfer Family（後端是 S3 或 EFS） |

- 用戶端都在 AWS 裡時，不需要 File Gateway。
- 要「修改應用程式」的選項，輸給功能相同但不用改的選項。

**13. 流量入口**

| 線索 | 選 |
| --- | --- |
| HTTP(S)、靜態加動態內容、全球使用者 | CloudFront（S3 和 ALB 兩個 origin），一個 Region 就夠 |
| UDP、非 HTTP 的 TCP、固定 IP、秒級跨 Region failover | Global Accelerator（UDP 要接 NLB） |
| 資料要留在當地、各區獨立、要 Region 層級的韌性 | 多 Region + Route 53 latency 或 failover |
| 依國家導到不同後端（版權、在地內容） | Route 53 geolocation |
| 封鎖或只允許某些國家 | CloudFront geo restriction 或 WAF geo match |
| 「隨機」回傳健康的 IP | Route 53 multivalue answer |

- CloudFront 也能加速沒被快取的動態請求（邊緣節點 + AWS 骨幹網路 + 重用連線）。
- API 的跨 Region failover 用 Route 53；CloudFront origin failover 只適用 GET、HEAD、OPTIONS。

**14. 治理：事前擋下，還是事後發現**

| 線索 | 選 |
| --- | --- |
| 「不允許」「禁止」（包括 member account 的 root） | SCP 或 Control Tower preventive control |
| 部署前擋掉不合規的 CloudFormation 資源 | Control Tower proactive control |
| 「偵測」「通知」「稽核」 | AWS Config（+ EventBridge + SNS） |
| 單一帳號擋 SQL injection | WAF |
| 「跨多個帳號」統一管理 WAF 規則 | Firewall Manager（每個 Region 各一份 policy） |

### 自我測驗

每題先想好答案和決定性的線索，再展開。

<details>
<summary>1. 訂單服務在促銷時偶爾被打爆，訂單一筆都不能少，但出貨系統晚幾分鐘處理沒關係。</summary>

SQS 放在訂單服務和出貨系統之間。線索：「不能少」+「晚點處理可以」。
</details>

<details>
<summary>2. 影音平台的使用者從世界各地上傳原始檔、下載自己的檔案，每個檔案都不一樣，速度很慢。</summary>

S3 Transfer Acceleration。線索：每個檔案都不同，CloudFront 快取沒有用。
</details>

<details>
<summary>3. 每晚執行一個已容器化的對帳程式，約 40 分鐘，失敗可以重跑，不想管機器。</summary>

EventBridge Scheduler 觸發 ECS Fargate task（可用 Fargate Spot）。線索：超過 15 分鐘 + 容器 + 不管機器 + 可重跑。
</details>

<details>
<summary>4. 法規要求報表保存 7 年，期間任何人（包括 root）都不能修改或刪除。</summary>

S3 Object Lock compliance mode，retention period 7 年。線索：「包括 root」+ 固定期限。
</details>

<details>
<summary>5. MySQL 主資料庫被分析師的查詢拖慢，應用程式不想大改。</summary>

建 Read Replica，分析師改連 replica。線索：要的是把讀取分出去，不是減少讀取。
</details>

<details>
<summary>6. 遊戲伺服器用 UDP，玩家遍布全球，Region 故障時要在幾秒內切換。</summary>

Global Accelerator + 各 Region 的 NLB。線索：UDP + 秒級切換（不受 DNS 快取影響）。
</details>

<details>
<summary>7. 兩個 Region 的使用者都要寫入個人設定，資料結構經常改。</summary>

DynamoDB Global Tables。線索：多 Region 寫入 + schema 常變。
</details>

<details>
<summary>8. 資安規定 S3 的加密金鑰每年輪替一次，而且要能證明確實輪替過。</summary>

SSE-KMS + customer managed key，開啟自動輪替（輪替紀錄可在 CloudTrail 查到）。線索：明確的週期 + 要能證明，壓過「最少維運」。
</details>

<details>
<summary>9. 地端 VM 上的 ERP 要做 DR，RPO 要秒級，RTO 一小時內，平常不想花太多。</summary>

AWS Elastic Disaster Recovery。線索：地端 VM + 秒級 RPO + 便宜。
</details>

<details>
<summary>10. 地端有 600 TB 資料要在 6 週內搬到 S3，對外頻寬 200 Mbps，白天還要給業務用。</summary>

Snowball。200 Mbps 全速約每天 2 TB，6 週不到 90 TB。線索：先算時間。
</details>

<details>
<summary>11. 公司要禁止所有帳號開 GPU instance，包括各帳號的 root。</summary>

SCP（用 instance type 條件拒絕）。線索：「禁止」+「包括 root」。
</details>

<details>
<summary>12. Bucket 裡已經有五千萬個未加密的物件，現在要求全部加密，之後的新物件也要加密。</summary>

開啟預設加密（新物件），再用 S3 Inventory 列出未加密物件，交給 Batch Operations 複製加密。線索：「已經有」。
</details>

<details>
<summary>13. Lambda 處理 SQS 訊息時，偶爾同一筆訂單被處理兩次。函式 timeout 是 5 分鐘，佇列的 visibility timeout 是預設值。</summary>

把 visibility timeout 調到函式 timeout 的 6 倍（30 分鐘）。線索：預設 30 秒比處理時間短，訊息又出現了；不是改用 FIFO。
</details>

<details>
<summary>14. 每週一早上 9 點流量固定暴增三倍，現在用 target tracking，每次都要 10 分鐘才跟上。</summary>

Scheduled scaling 在 9 點前調高 desired，平常仍保留 target tracking。線索：已知時間點 + 事後反應太慢。
</details>

<details>
<summary>15. Windows 和 Linux 的應用要存取同一份檔案資料，都在 AWS 裡。</summary>

FSx for NetApp ONTAP。線索：同一份資料要 SMB + NFS。
</details>

<details>
<summary>16. 合作夥伴需要一個 HTTPS webhook 呼叫某個 Lambda，只要 IAM 驗證，不需要節流或快取。</summary>

Lambda function URL，auth type 設 `AWS_IAM`。線索：單一函式 + 沒有 API Gateway 才有的需求。
</details>

## 關鍵字速查表

考前最後一小時看這張表：看到左邊的描述，直接想到右邊的答案。

### 安全與身分

| 題目描述 | 答案 |
| --- | --- |
| 多帳號統一禁止某些動作 | SCP |
| 快速建立合規的多帳號環境 | Control Tower |
| 員工一次登入多個帳號 | IAM Identity Center |
| App 使用者註冊登入 | Cognito User Pool |
| App 使用者直接存取 S3 / DynamoDB | Cognito Identity Pool |
| 另一個帳號要存取資源 | 目標帳號建 IAM role + trust policy |
| EC2 程式存取 AWS 服務 | IAM role（instance profile） |
| 資料庫密碼自動輪替 | Secrets Manager |
| 金鑰完全自己控制、單一租戶硬體 | CloudHSM |
| 免費 HTTPS 憑證 | ACM |
| SQL injection、XSS、限制請求頻率 | WAF |
| DDoS 防護 + 費用保護 + 應變團隊 | Shield Advanced |
| 跨帳號統一管理 WAF / SG 規則 | Firewall Manager |
| 軟體漏洞、CVE | Inspector |
| 惡意活動、異常 API、挖礦 | GuardDuty |
| S3 中的個資 | Macie |
| 資源設定合規、設定歷史 | Config |
| 誰呼叫了 API、誰刪了資源 | CloudTrail |
| 彙整所有安全發現 | Security Hub |
| 下載 AWS 合規報告 | Artifact |
| 金鑰要放在 AWS 以外 | KMS External Key Store |
| 地端伺服器拿臨時 AWS 憑證 | IAM Roles Anywhere |
| 找出沒用到的權限 | IAM Access Analyzer |

### 網路與入口

| 題目描述 | 答案 |
| --- | --- |
| private subnet 存取 S3、不走公網、最便宜 | S3 gateway endpoint |
| 地端私下存取 S3 或其他 AWS 服務 | Interface endpoint（PrivateLink） |
| private subnet 要上網下載更新 | NAT Gateway（每個 AZ 一個） |
| 封鎖特定 IP | NACL |
| 大量 VPC 和地端互連 | Transit Gateway |
| 只把一個服務開放給其他 VPC / 客戶 | PrivateLink（endpoint service + NLB） |
| 快速建立加密的地端連線 | Site-to-Site VPN |
| 穩定頻寬、低延遲的專線 | Direct Connect |
| 一條 DX 連多個 Region | Direct Connect Gateway |
| 依 URL 路徑路由 | ALB |
| 固定 IP、TCP/UDP、極高效能 | NLB |
| 第三方防火牆設備 | Gateway Load Balancer |
| 根網域指向 ELB | Route 53 Alias record |
| 漸進式切換流量、A/B 測試 | Route 53 weighted |
| 導到延遲最低的 Region | Route 53 latency |
| 依國家顯示不同內容 / 法規限制 | Route 53 geolocation |
| 全球快取靜態內容 | CloudFront |
| 只讓 CloudFront 讀 S3 | OAC |
| 遊戲 / UDP / 固定 Anycast IP / 快速跨 Region failover | Global Accelerator |
| 混合雲 DNS 解析 | Route 53 Resolver endpoints |

### 運算

| 題目描述 | 答案 |
| --- | --- |
| 短任務、事件觸發、serverless | Lambda |
| 超過 15 分鐘 + serverless | Fargate（ECS / EKS） |
| Kubernetes | EKS |
| 可中斷的批次工作、最便宜 | Spot Instances |
| 授權綁實體核心 | Dedicated Hosts |
| HPC、最低延遲 instance 間通訊 | Cluster placement group（+ EFA） |
| 少量關鍵 instance 不能同時故障 | Spread placement group |
| 取代 EC2 上的 cron | EventBridge Scheduler + Lambda |
| Lambda 冷啟動 | Provisioned Concurrency |
| 不管基礎架構，上傳程式就部署 | Elastic Beanstalk |
| 可預測的流量尖峰 | Scheduled scaling |
| 不登入 SSH 也能管理 instance | SSM Session Manager |
| Java Lambda 冷啟動 | SnapStart |
| 保證某個 AZ 有容量 | On-Demand Capacity Reservation |

### 儲存與資料庫

| 題目描述 | 答案 |
| --- | --- |
| 存取模式未知 | S3 Intelligent-Tiering |
| 法規多年保存、最便宜 | S3 Glacier Deep Archive |
| 封存但要毫秒取回 | S3 Glacier Instant Retrieval |
| 任何人都不能刪除（WORM） | S3 Object Lock Compliance mode |
| 防誤刪 | S3 Versioning（+ MFA Delete） |
| 跨 Region 複製 S3 | CRR（兩邊都要開 versioning） |
| 給外部人限時上傳 / 下載 | Presigned URL |
| 遠距離快速上傳 S3 | S3 Transfer Acceleration |
| Linux 多台共享檔案 | EFS |
| Windows 共享檔案、AD | FSx for Windows File Server |
| HPC 檔案系統、連 S3 | FSx for Lustre |
| 地端應用把檔案存到 S3 | S3 File Gateway |
| 取代實體磁帶 | Tape Gateway |
| 最高 IOPS 的暫存空間 | Instance Store |
| 關鍵資料庫、高 IOPS EBS | io2 Block Express |
| 資料庫 AZ 故障自動切換 | RDS Multi-AZ |
| 讀取太多拖慢主資料庫 | Read Replica |
| Lambda 連 RDS 連線太多 | RDS Proxy |
| 高效能 MySQL / PostgreSQL | Aurora |
| 跨 Region 關聯式 DR，秒級 RPO | Aurora Global Database |
| 流量不可預測的關聯式資料庫 | Aurora Serverless v2 |
| key-value、毫秒延遲、無限擴展 | DynamoDB |
| DynamoDB 微秒快取 | DAX |
| 多 Region 同時寫入 | DynamoDB Global Tables |
| 資料自動過期 | DynamoDB TTL |
| session store、資料庫查詢快取 | ElastiCache |
| MongoDB | DocumentDB |
| Cassandra | Keyspaces |
| 社群關係、推薦、圖形 | Neptune |
| IoT 時間序列 | Timestream |
| 長期保存 EBS snapshot | EBS Snapshots Archive |
| 誤刪 snapshot / AMI 要救回 | Recycle Bin |
| 高可用 + 可讀 standby 的 MySQL / PostgreSQL | RDS Multi-AZ DB cluster |
| SQL Server 搬 PostgreSQL 少改程式 | Babelfish for Aurora PostgreSQL |

### 整合、分析與維運

| 題目描述 | 答案 |
| --- | --- |
| 解耦、削峰、訂單不能遺失 | SQS |
| 嚴格順序、不重複 | SQS FIFO |
| 一個事件通知多個系統 | SNS（+ SQS fan-out） |
| SaaS 事件、依內容路由、排程 | EventBridge |
| 多步驟工作流程、人工審核 | Step Functions |
| 地端 ActiveMQ / RabbitMQ 不改程式上雲 | Amazon MQ |
| GraphQL | AppSync |
| 即時串流、可重播 | Kinesis Data Streams |
| 串流自動送進 S3 / Redshift | Firehose |
| Kafka | MSK |
| ETL、資料目錄 | Glue |
| Spark / Hadoop | EMR |
| SQL 直接查 S3 | Athena |
| 資料倉儲、複雜分析 | Redshift |
| Data lake 細緻權限 | Lake Formation |
| BI 儀表板 | QuickSight |
| EC2 記憶體指標 | CloudWatch agent |
| 微服務追蹤延遲 | X-Ray |
| 自動修補 OS | SSM Patch Manager |
| 多帳號多 Region 部署範本 | CloudFormation StackSets |
| 集中備份多種服務 | AWS Backup |
| 伺服器層級持續複製 DR | Elastic Disaster Recovery |
| lift-and-shift 搬伺服器 | Application Migration Service (MGN)，現名 AWS Transform MGN |
| 資料庫遷移、最少停機 | DMS（異質加 SCT） |
| 網路定期同步 NAS 到 AWS | DataSync |
| 合作夥伴用 SFTP 傳檔 | Transfer Family |
| 網路太慢、TB-PB 級離線搬運（考題答案；現況新客戶改用 Data Transfer Terminal） | Snowball Edge |
| 預算超支通知 | Budgets |
| 分析過去花費 | Cost Explorer |
| rightsizing + 預估節省 | Compute Optimizer |
| 找出 bucket 未開 versioning、S3 全組織分析 | S3 Storage Lens |
| 大量平行處理 S3 物件 | Step Functions Distributed Map |
| 事件送到外部 HTTP API | EventBridge API destinations |

## 易混淆陷阱與必背數字

這些是最常讓人選錯的組合。每一組先記「差在哪一個字」。

### 易混淆組合

| 容易搞混 | 分辨方法 |
| --- | --- |
| Multi-AZ vs Read Replica | Multi-AZ 同步、保高可用；Read Replica 非同步、分擔讀取 |
| Security Group vs NACL | SG 有狀態、只有 Allow、在 instance；NACL 無狀態、可 Deny、在 subnet |
| Gateway endpoint vs Interface endpoint | Gateway 只有 S3 / DynamoDB、免費、地端不能用；Interface 收費、多數服務、地端可用 |
| NAT Gateway vs IGW | IGW 讓 public subnet 雙向上網；NAT 讓 private subnet 只出不進 |
| VPC Peering vs Transit Gateway | Peering 不可傳遞、適合少量；TGW 中樞、可傳遞、適合大量 |
| CloudFront vs Global Accelerator | CloudFront 快取 HTTP 內容；GA 不快取、固定 IP、TCP/UDP |
| ALB vs NLB | ALB 第 7 層路由；NLB 第 4 層、固定 IP、極速 |
| SQS vs SNS vs EventBridge | SQS 佇列一對一；SNS 推播一對多；EventBridge 依內容路由、SaaS、排程 |
| Kinesis Data Streams vs Firehose | KDS 即時、可重播、自寫 consumer；Firehose 近即時、全託管、送到目的地 |
| Athena vs Redshift | Athena 直接查 S3、偶爾查；Redshift 資料倉儲、經常複雜分析 |
| Secrets Manager vs Parameter Store | 自動輪替選 Secrets Manager；便宜存設定選 Parameter Store |
| KMS vs CloudHSM | KMS 託管多租戶；CloudHSM 專屬硬體、自己完全掌控金鑰 |
| Inspector vs GuardDuty | Inspector 漏洞；GuardDuty 威脅行為 |
| Config vs CloudTrail | Config「資源現在長什麼樣、合不合規」；CloudTrail「誰做了什麼」 |
| CloudWatch vs CloudTrail | CloudWatch 效能和 log；CloudTrail API 稽核 |
| EFS vs FSx vs EBS | EFS Linux 共享；FSx Windows / HPC / NetApp；EBS 單機區塊儲存 |
| DataSync vs Storage Gateway | DataSync 搬資料；Storage Gateway 長期混合使用 |
| Cognito User Pool vs Identity Pool | User Pool 登入；Identity Pool 換 AWS 臨時憑證 |
| Signed URL vs Signed Cookie | 一個檔案用 URL；多個檔案用 Cookie |
| Pilot Light vs Warm Standby | Pilot Light 只有資料在跑；Warm Standby 縮小版完整環境在跑 |
| Savings Plans vs RI | Compute Savings Plans 最彈性（含 Fargate、Lambda）；Standard RI 鎖定類型 |
| Dedicated Host vs Dedicated Instance | Host 能看到實體 socket / core（授權用）；Instance 只是不跟別人共用 |
| Organizations vs RAM | Organizations 管帳號和政策；RAM 分享資源 |
| Shield Standard vs Advanced | Standard 免費自動；Advanced 付費、第 7 層、應變團隊、費用保護 |
| Tag policy vs SCP | Tag policy 規範 tag 的值；要擋「沒加 tag」得用 SCP |
| Multi-AZ instance vs Multi-AZ DB cluster | instance 的 standby 不能讀；DB cluster 有 2 個可讀 standby，failover 更快 |
| Recycle Bin vs Snapshot Lock | Recycle Bin 刪了還能救；Snapshot Lock 根本刪不掉 |

### 必背數字

| 項目 | 數字 |
| --- | --- |
| Lambda 最長執行時間 | 15 分鐘 |
| Lambda 記憶體 | 128 MB - 10 GB |
| API Gateway 整合逾時（預設） | 29 秒（REST API 可申請調高） |
| SQS 訊息保留 | 預設 4 天，最長 14 天 |
| SQS visibility timeout | 預設 30 秒，最長 12 小時 |
| SQS long polling | 最長 20 秒 |
| SQS FIFO 吞吐量 | 每秒 300（batch 3,000） |
| SQS / SNS 訊息大小（右欄為考題常見值；現況 SQS 已提高到 1 MiB〔2025-08〕，SNS 可設定到 1 MiB〔2026-09〕） | 256 KB |
| DynamoDB item 上限 | 400 KB |
| DynamoDB PITR | 35 天 |
| RDS 自動備份保留 | 1-35 天 |
| Aurora 副本 | 6 份、3 個 AZ |
| Aurora / RDS MySQL Read Replica | 最多 15 個 |
| S3 單一物件 | 最大 50 TB（2025-12 起；舊題庫為 5 TB） |
| S3 單次 PUT | 最大 5 GB（超過 100 MB 建議 multipart） |
| S3 每個 prefix 每秒 | 3,500 寫、5,500 讀 |
| S3 Standard-IA / One Zone-IA 最短計費 | 30 天 |
| Glacier Instant / Flexible 最短計費 | 90 天 |
| Glacier Deep Archive 最短計費 | 180 天 |
| Glacier Flexible Expedited 取回 | 1-5 分鐘 |
| Deep Archive 取回 | 12 小時（Bulk 48 小時） |
| Kinesis Data Streams 保留 | 預設 24 小時，最長 365 天 |
| Spot 中斷通知 | 2 分鐘 |
| Spread placement group | 每 AZ 最多 7 台 |
| gp3 基本效能 | 3,000 IOPS、125 MiB/s（上限 80,000 IOPS、2,000 MiB/s、64 TiB） |
| KMS 直接加密上限 | 4 KB（更大用 envelope encryption） |
| CloudTrail 事件歷史 | 90 天 |
| EC2 基本監控 / 詳細監控 | 5 分鐘 / 1 分鐘 |
| Global Accelerator 固定 IP | 2 個 Anycast IP |
| SQS FIFO 去重視窗 | 5 分鐘 |
| KMS key 刪除等待期 | 7-30 天 |
| RDS Multi-AZ DB cluster failover | 通常 35 秒內 |
| 停止的 RDS 自動重新啟動 | 7 天後 |
| S3 Lifecycle 預設最小轉換物件 | 128 KB（2024-09 起） |
| WAF 單一 IP set | 最多 10,000 個 CIDR |
| Fargate ephemeral storage | 最多 200 GiB |
| Root user MFA 裝置 | 最多 8 個 |
| VPC CIDR 大小 | /16 到 /28 |
| 公有 IPv4 費用 | 每個每小時 0.005 美元（2024-02 起） |

### 常見錯誤選項（看到就先懷疑）

- 在 EC2 上自己架資料庫、自己架 Kafka、自己寫 cron → 通常有託管服務可替代。
- 把 access key 存在 EC2、程式碼或 S3 → 改用 IAM role。
- 只部署在單一 AZ 卻號稱高可用。
- 用 Lambda 處理超過 15 分鐘的工作。
- 用 Read Replica 做自動 failover（要 Multi-AZ）。
- 用 Multi-AZ 來提升讀取效能（要 Read Replica）。
- WAF 掛在 NLB 或 EC2 上（WAF 只能掛 CloudFront、ALB、API Gateway REST API、AppSync、Cognito user pool、App Runner、Amplify、Verified Access）。
- 用 CNAME 指向根網域（要用 Alias）。
- 用 Security Group 封鎖特定 IP（SG 不能 Deny，要用 NACL）。
- 用 Storage Gateway 做一次性大量搬移（要 DataSync 或 Snowball）。
- 用 RAM 限制權限、用 Inspector 算成本、用 Shield 打補丁：功能根本不對。
- 一個 ASG 跨兩個 Region、一個 subnet 跨兩個 AZ、一台 EC2 掛兩個 IAM role：都不存在。
- 用 Lambda 跑 Windows 容器（Lambda 的容器映像只支援 Linux）。

## 考題 vs 現況：2024-2026 服務變動總表

SAA-C03 題庫多半寫於這些變動之前。考試時照題庫的「標準答案」作答；這張表讓你知道實務上已經不同，避免被新舊資訊混淆。（2026 年 11 月核對；點 ↗ 看該項變動的來源）

| 服務 / 項目 | 考題常見說法 | 現況 |
| --- | --- | --- |
| SQS 訊息大小 | 256 KB | 1 MiB（2025-08）[↗](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib) |
| SNS 訊息大小 | 256 KB | 可設定到 1 MiB，限 SQS / Lambda / Firehose 訂閱（2026-09）[↗](https://dev.classmethod.jp/articles/amazon-sns-1mib-support/) |
| S3 單一物件 | 5 TB | 50 TB（2025-12）[↗](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/) |
| EBS gp3 上限 | 16,000 IOPS、1,000 MiB/s、16 TiB | 80,000 IOPS、2,000 MiB/s、64 TiB（2025-09）[↗](https://aws.amazon.com/about-aws/whats-new/2025/09/amazon-ebs-size-provisioned-performance-gp3-volumes) |
| Aurora 儲存上限 | 128 TiB | 256 TiB（2025-07）[↗](https://aws.amazon.com/es/about-aws/whats-new/2025/07/amazon-aurora-postgresql-database-clusters-256-tib-storage-volume/) |
| API Gateway 整合逾時 | 29 秒硬上限 | REST API 可申請調高（2024-06）[↗](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-api-gateway-integration-timeout-limit-29-seconds/) |
| ACM 公開憑證 | 不能用在 EC2 | 可付費申請可匯出憑證用在 EC2（2025-06）[↗](https://aws.amazon.com/about-aws/whats-new/2025/06/aws-certificate-manager-public-certificates-use-anywhere) |
| Snowball Edge | 大量離線搬運首選 | 不再接受新客戶（2025-11），改用 DataSync / Data Transfer Terminal / Outposts [↗](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html) |
| Snowcone、Snowmobile | Snow 家族成員 | 已停用 |
| Migration Hub、Application Discovery Service | 遷移追蹤與盤點 | 不再接受新客戶（2025-11），改用 AWS Transform [↗](https://docs.aws.amazon.com/migrationhub/latest/ug/migrationhub-availability-change.html) |
| Application Migration Service (MGN) | lift-and-shift | 更名為 AWS Transform MGN（2026-06），功能相同 [↗](https://aws.amazon.com/de/about-aws/whats-new/2026/06/aws-transform-mgn-rebrand/) |
| 獨立 Amazon Glacier（vault、Vault Lock） | 封存與 WORM | 不再接受新客戶（2025-11）；S3 Glacier 儲存類別不受影響 [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| S3 Select | 查單一物件部分資料 | 不再開放新客戶（2024-07），改用 Athena [↗](https://docs.aws.amazon.com/AmazonS3/latest/userguide/selecting-content-from-objects.html) |
| FSx File Gateway | 地端存取 FSx | 不再接受新客戶（2024-10）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| QLDB | 不可竄改帳本 | 已終止（2025-07-31），改用 Aurora PostgreSQL [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| Timestream（LiveAnalytics） | 時間序列 | 不再接受新客戶（2025-06），改用 Timestream for InfluxDB [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| RDS Custom for Oracle | OS 層存取 | 進入 Sunset（2026-03）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| App Runner、Audit Manager | 簡易部署、稽核證據 | 不再接受新客戶（2026-04-30）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| Kendra、Q Business | 企業搜尋、企業 AI 助手 | 不再接受新客戶（2026-07-30）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| Forecast、Fraud Detector | 預測、詐騙偵測 | 不再接受新客戶（2024-07、2025-11）[↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| QuickSight | BI 儀表板 | 改名 Amazon Quick（BI 部分叫 Quick Sight）[↗](https://aws.amazon.com/blogs/business-intelligence/reimagine-business-intelligence-amazon-quicksight-evolves-to-amazon-quick-suite) |
| Kinesis Data Firehose | 串流搬運 | 已改名 Amazon Data Firehose |
| Kinesis Data Analytics | 串流 SQL 分析 | 改名 Managed Service for Apache Flink，舊的 SQL 應用已停用 |
| Aurora Serverless v1 | 間歇性負載、可暫停 | 2025-03-31 終止，改用 v2；v2 自 2024-11 可降到 0 ACU [↗](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-aurora-serverless-v2-scaling-zero-capacity) |
| Scheduled Reserved Instances | 固定時段的折扣 | 已停售，改用 Savings Plans 或排程起停 |
| S3 Lifecycle 小物件 | 任何大小都能轉換 | 預設不轉換 128 KB 以下的物件（2024-09）[↗](https://aws.amazon.com/about-aws/whats-new/2024/09/amazon-s3-default-minimum-object-size-lifecycle-transition-rules) |
| S3 Object Lambda | 讀取時轉換、遮蔽資料 | 不再接受新客戶（2025-11-07）[↗](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazons3-ol-change.html) |
| Elastic Transcoder | 影片轉檔 | 已停止服務（2025-11-13），改用 MediaConvert [↗](https://aws.amazon.com/blogs/media/support-for-amazon-elastic-transcoder-ending-soon) |
| Pinpoint | 簡訊、推播、行銷旅程 | 終止支援（2026-10-30），訊息 API 改由 AWS End User Messaging 提供 [↗](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html) |
| Inspector Classic | 裝 agent 掃描 EC2 | 終止支援（2026-05-20），新版 Inspector 透過 SSM Agent 或無 agent 掃描 [↗](https://docs.aws.amazon.com/inspector/v1/userguide/inspector-migration.html) |
| 公有 IPv4 | 只有閒置的 EIP 收費 | 所有公有 IPv4 都收費（2024-02）[↗](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights) |
| CloudFront OAI | 只讓 CloudFront 讀 S3 | 舊做法，改用 OAC |
| EC2 Launch Configuration | ASG 的啟動設定 | 新帳號已無法建立，改用 Launch Template |

## 資料來源

- [AWS Certified Solutions Architect – Associate 官方頁面](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
- [KodeKloud：SAA-C03 考試指南整理](https://notes.kodekloud.com/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Solutions-Architecture-Exam-guide-What-to-focus-on/page)
- [Amazon EBS gp3 上限提高（2025-09）](https://aws.amazon.com/about-aws/whats-new/2025/09/amazon-ebs-size-provisioned-performance-gp3-volumes)
- [Amazon SQS 訊息上限 1 MiB（2025-08）](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib)
- [Amazon SNS 支援 1 MiB（2026-09，classmethod 實測整理）](https://dev.classmethod.jp/articles/amazon-sns-1mib-support/)
- [Amazon S3 單一物件上限 50 TB（2025-12）](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/)
- [Aurora PostgreSQL 儲存上限 256 TiB（2025-07）](https://aws.amazon.com/es/about-aws/whats-new/2025/07/amazon-aurora-postgresql-database-clusters-256-tib-storage-volume/)
- [API Gateway 整合逾時可超過 29 秒（2024-06）](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-api-gateway-integration-timeout-limit-29-seconds/)
- [ACM 可匯出公開憑證（2025-06）](https://aws.amazon.com/about-aws/whats-new/2025/06/aws-certificate-manager-public-certificates-use-anywhere)
- [AWS WAF 支援的資源類型](https://docs.aws.amazon.com/waf/latest/APIReference/Welcome.html)
- [Snowball Edge 可用性變更](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html)
- [Migration Hub 可用性變更](https://docs.aws.amazon.com/migrationhub/latest/ug/migrationhub-availability-change.html)
- [Application Migration Service 更名為 AWS Transform MGN（2026-06）](https://aws.amazon.com/de/about-aws/whats-new/2026/06/aws-transform-mgn-rebrand/)
- [S3 Select 不再開放新客戶](https://docs.aws.amazon.com/AmazonS3/latest/userguide/selecting-content-from-objects.html)
- [QuickSight 演進為 Amazon Quick Suite](https://aws.amazon.com/blogs/business-intelligence/reimagine-business-intelligence-amazon-quicksight-evolves-to-amazon-quick-suite)
- [AWS 退役與停止新客戶服務時間表（彙整 AWS 官方公告）](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html)
- [S3 Lifecycle 預設最小轉換物件 128 KB（2024-09）](https://aws.amazon.com/about-aws/whats-new/2024/09/amazon-s3-default-minimum-object-size-lifecycle-transition-rules)
- [Aurora Serverless v2 可降到 0 ACU（2024-11）](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-aurora-serverless-v2-scaling-zero-capacity)
- [S3 Object Lambda 可用性變更](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazons3-ol-change.html)
- [Elastic Transcoder 停止服務公告](https://aws.amazon.com/blogs/media/support-for-amazon-elastic-transcoder-ending-soon)
- [Amazon Pinpoint 終止支援](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html)
- [Amazon Inspector Classic 終止支援](https://docs.aws.amazon.com/inspector/v1/userguide/inspector-migration.html)
- [公有 IPv4 位址收費（2024-02）](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights)
