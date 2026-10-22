---
title: AWS SAA Crash Review Guide
slug: aws-saa-crash-review-guide
date: 2026-10-22
categories:
- Notes
- Learning
tags:
- AWS
- Notes
---

> 中文版：[AWS SAA 突擊複習全攻略](/posts/aws-saa-tu-ji-fu-xi-quan-gong-lue)

## Exam overview and answering technique

The exam code is still SAA-C03: 65 questions (50 scored + 15 unscored), 130 minutes, scored out of 1000 with 720 to pass, and a USD 150 fee. Question types are only multiple choice and multiple response (Choose two / three). Some sites claim it has moved to SAA-C04, but the official AWS certification page (October 2026) still links the SAA-C03 exam guide, so go with the official source [↗](https://aws.amazon.com/certification/certified-solutions-architect-associate/).

| Domain | Weight | Covers |
| --- | --- | --- |
| Domain 1: Design Secure Architectures | 30% | IAM, encryption, network isolation, compliance |
| Domain 2: Design Resilient Architectures | 26% | High availability, decoupling, disaster recovery |
| Domain 3: Design High-Performing Architectures | 24% | Picking the right storage, database, compute, networking, caching |
| Domain 4: Design Cost-Optimized Architectures | 20% | Purchase options, storage tiering, rightsizing |

Sources: [KodeKloud SAA-C03 exam guide notes](https://notes.kodekloud.com/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Solutions-Architecture-Exam-guide-What-to-focus-on/page), [Training Camp 2026 guide](https://trainingcamp.com/what-is-aws-solutions-architect/).

### Five steps per question

1. **Read the last sentence first**: is it asking for MOST cost-effective, LEAST operational overhead, MOST secure, highest performance, or HIGHLY available? That sets the direction of the answer.
2. **Circle the hard constraints**: e.g. "no public internet", "longer than 15 minutes", "millisecond latency", "existing SQL", "no code changes".
3. **Cross out the obviously wrong services**: ones that simply don't do the job (using RAM to restrict permissions, using Inspector to calculate cost).
4. **Compare what's left against the adjective in the question**: if two options both work, pick the one that best fits that adjective.
5. **Multiple-response questions**: the two answers are usually different stages of the same flow (one receives, one processes), not two independent solutions.

### Adjective → what to lean towards

| Adjective in the question | Lean towards |
| --- | --- |
| LEAST operational overhead | Fully managed, serverless, native AWS features; avoid self-built on EC2 and custom scripts |
| MOST cost-effective | Spot, Savings Plans, S3 lifecycle, gateway endpoints, pay-per-use serverless |
| MOST secure | Least privilege, IAM roles instead of access keys, KMS, private networking, no shared accounts |
| Highly available / fault tolerant | Multi-AZ, Auto Scaling across AZs, ELB, Aurora, DynamoDB |
| Lowest latency / high performance | Caching (ElastiCache, DAX, CloudFront), io2, Global Accelerator |
| Decouple | SQS, SNS, EventBridge |
| Without code changes | Solve it with configuration or a managed feature (RDS Proxy, Multi-AZ, CloudFront) rather than changing the app |

### General rules of thumb

- The answer is usually an AWS managed service, rarely "run it yourself on EC2".
- "Cron job on EC2" is almost always wrong; replace it with EventBridge Scheduler + Lambda.
- "Put the access key in the code or on the instance" is always wrong; use an IAM role.
- Options full of manual steps or hand-written polling scripts → usually a trap.

## Identity and account governance

Core principles: least privilege, roles instead of long-lived access keys, and Organizations to manage multiple accounts centrally.

### IAM building blocks

| Element | What it does | Key points |
| --- | --- | --- |
| Root user | The account's highest privilege, signs in with the email that created the account | Enable MFA, no access keys, don't use day to day |
| IAM User | A long-lived identity for a person or program | Has a password and access keys; use sparingly |
| IAM Group | Groups users in the same account to apply permissions | Can't span accounts, can't be assumed, can't be a principal |
| IAM Role | A temporary identity that can be "assumed" (like a hat) | For EC2, Lambda, cross-account, federated login |
| Policy | JSON permission document | Effect / Action / Resource / Condition |

### Policy types

| Type | Attached to | Purpose |
| --- | --- | --- |
| Identity-based policy | user, group, role | What this identity can do |
| Resource-based policy | The resource (S3 bucket policy, SQS policy, KMS key policy) | Who can access this resource; can grant to other accounts directly |
| Trust policy | A role | Who can assume this role |
| Permissions boundary | user, role | Maximum permissions (stops developers escalating when they create their own roles) |
| SCP | An Organizations OU or account | Account-level permission ceiling; grants nothing by itself |

**Evaluation rule:** explicit Deny > explicit Allow > implicit Deny. Effective permissions = IAM allows ∩ SCP allows ∩ boundary allows.

### Cross-account access

- Create the role in the account *being accessed*; its trust policy names the account it trusts; the source account then grants specific people `sts:AssumeRole`.
- Mnemonic: **the role lives with the resource; the trust points at whoever is coming in.**
- S3, SQS, SNS, KMS and others can also grant other accounts directly through a resource-based policy, no assume needed.
- When giving a third-party vendor access, add an External ID to prevent the confused deputy problem.

### Multi-account governance

| Service | What it does | Keywords |
| --- | --- | --- |
| AWS Organizations | Groups accounts into one organization, consolidated billing, OUs | multiple accounts, consolidated billing, volume discount |
| SCP | Permission ceiling on an OU or account | deny across all accounts, prevent region usage, restrict instance types |
| AWS Control Tower | One-click best-practice multi-account environment (landing zone) with built-in guardrails | set up multi-account quickly, governance at scale, guardrails |
| IAM Identity Center (formerly AWS SSO) | Employees sign in once to reach many accounts and apps; connects to Active Directory / external IdP | single sign-on, workforce, multi-account login |
| AWS RAM | Share resources across accounts (subnets, Transit Gateway, Route 53 Resolver rules) | share resources, not restrict permissions |
| Tag policies | Standardize tags | enforce tagging |

### End-user identity (application side)

| Service | What it does |
| --- | --- |
| Cognito User Pools | Sign-up and sign-in for apps (password, social login, MFA), issues JWT tokens; integrates with API Gateway / ALB auth |
| Cognito Identity Pools | Exchanges a signed-in user (or guest) for temporary AWS credentials to access S3, DynamoDB directly |
| AWS Directory Service | Managed Microsoft AD (AWS Managed Microsoft AD), or AD Connector back to on-prem AD |

Mnemonic: **User Pool handles "who you are" (sign-in); Identity Pool handles "which AWS resources you can touch" (credentials).**

### Must-know traps

- An app on EC2 needs S3 → attach an IAM role (instance profile), not an access key.
- "Root email isn't receiving notifications" → use a company-managed distribution list for the root email and set alternate contacts (billing, operations, security).
- "Block every account from a Region / service" → SCP.
- "New accounts automatically get the guardrails" → Control Tower, or Organizations + SCP.
- SCPs don't affect the management account or service-linked roles.

## Security, encryption and compliance

This is the heaviest domain (30%). The key is knowing what each security service *looks at*: vulnerabilities, threats, sensitive data, configuration, or API history.

### Detection and compliance services (the most confused group)

| Service | What it looks at | Keywords |
| --- | --- | --- |
| Amazon Inspector | **Software vulnerabilities (CVEs)** and network exposure in EC2, ECR images, Lambda | vulnerabilities, CVE, patch assessment |
| Amazon GuardDuty | Suspicious behaviour and threats, from CloudTrail, VPC Flow Logs, DNS logs | threat detection, malicious IP, crypto mining, compromised instance |
| Amazon Macie | Scans S3 contents for sensitive data | PII, credit card, sensitive data discovery |
| AWS Config | Records resource configuration changes and checks compliance; can auto-remediate | configuration history, compliance rules, drift |
| AWS CloudTrail | Who called which API, and when | audit, who deleted, governance |
| AWS Security Hub | Aggregates findings from the services above into one dashboard with compliance scoring | single pane of glass, aggregate findings |
| Amazon Detective | Digs into the root cause of a security incident | investigate, root cause |
| AWS Audit Manager | Collects audit evidence automatically (closed to new customers from 30 April 2026) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) | audit evidence |
| AWS Artifact | Download AWS compliance reports (SOC, PCI, ISO) | compliance reports, agreements |

Mnemonic: **Inspector finds vulnerabilities, GuardDuty catches bad actors, Macie finds personal data, Config watches settings, CloudTrail logs actions, Security Hub keeps the ledger.**

### Protection against network attacks

| Service | Layer | What it does |
| --- | --- | --- |
| AWS WAF | Layer 7 | Blocks SQL injection, XSS, IP restriction, geo-blocking, rate-based rules against floods; attaches to CloudFront, ALB, API Gateway REST API, AppSync, Cognito user pool, App Runner, Amplify, Verified Access [↗](https://docs.aws.amazon.com/waf/latest/APIReference/Welcome.html) |
| AWS Shield Standard | Layers 3, 4 | Free, on automatically, basic DDoS protection |
| AWS Shield Advanced | Layers 3, 4, 7 | Paid; advanced DDoS protection, 24/7 DDoS response team, credits for cost spikes caused by attacks |
| AWS Firewall Manager | Cross-account | Centrally manage WAF, Shield, Security Group, Network Firewall rules across Organizations |
| AWS Network Firewall | VPC level | Managed VPC firewall, deep packet inspection, domain filtering |

Note: WAF cannot attach directly to an NLB or EC2.

### Encryption and keys

| Service | What it does | Keywords |
| --- | --- | --- |
| AWS KMS | Managed key service; most AWS encryption relies on it | encryption at rest, key rotation, key policy |
| AWS CloudHSM | Dedicated hardware security module; you fully control the keys | FIPS 140-2 Level 3, single-tenant, full control of keys |
| AWS Certificate Manager (ACM) | Free public SSL/TLS certificates with auto-renewal | HTTPS, encryption in transit; works with ELB, CloudFront, API Gateway (the default free certs can't be exported or installed directly on EC2; since June 2025 you can pay for an "exportable" public cert for EC2, but exam questions still assume "can't be used on EC2" [↗](https://aws.amazon.com/about-aws/whats-new/2025/06/aws-certificate-manager-public-certificates-use-anywhere)) |
| AWS Secrets Manager | Stores passwords and API keys, with automatic rotation (native for RDS, Redshift, DocumentDB) | rotate database credentials automatically |
| SSM Parameter Store | Stores config values and secrets, cheap (standard tier free), no built-in rotation | configuration, cheap |

Mnemonic: **need automatic password rotation → Secrets Manager; just storing config cheaply → Parameter Store.**

KMS points:

- Key types: AWS owned keys (invisible to you), AWS managed keys (the `aws/s3` kind, auto-rotated), customer managed keys (you create them, control the key policy, rotation and cross-account sharing).
- Question wants "control who can use the key", "audit key usage", "share encrypted data across accounts" → customer managed key.
- KMS keys are Regional; cross-Region needs multi-Region keys or re-encryption in the target Region.
- Direct encryption is capped at 4 KB; larger data uses envelope encryption (data keys).

### S3 encryption options

| Option | Who manages the key | When |
| --- | --- | --- |
| SSE-S3 | AWS entirely | Default, simplest (new objects are encrypted by default) |
| SSE-KMS | KMS | Need an audit trail, control over key permissions |
| DSSE-KMS | KMS, dual-layer | Compliance requires dual-layer encryption |
| SSE-C | You supply the key; AWS doesn't keep it | You must hold the key yourself |
| Client-side | Encrypt before upload | Data must never reach AWS in plaintext |

### Must-know traps

- "Encrypt an existing unencrypted RDS instance" → take a snapshot → encrypt while copying the snapshot → restore from the encrypted snapshot. (Same for EBS.)
- "Force S3 to HTTPS only" → bucket policy denying requests where `aws:SecureTransport` is false.
- "Uploads must be encrypted" → bucket policy checking the encryption header, or just rely on default encryption.
- "Detect someone turning off CloudTrail / changing config, and fix it automatically" → Config rules + auto-remediation (SSM Automation), or EventBridge + Lambda.
- Tamper-proof CloudTrail → enable log file integrity validation, ship logs to S3 in another account and lock them (S3 Object Lock).

## Networking: VPC

VPC underpins every domain. Keep one storyline in mind: a public subnet has a route to the IGW; a private subnet goes out through NAT; private access to AWS services goes through a VPC endpoint; reaching other VPCs or on-prem means choosing Peering, Transit Gateway, VPN or Direct Connect depending on scale.

### Basic components

| Component | What it does | Key points |
| --- | --- | --- |
| VPC | Your private network in AWS, spanning all AZs in a Region | CIDRs can be added later, but must not overlap to interconnect |
| Subnet | A slice of the VPC; one subnet lives in one AZ | For HA, put a subnet in each of several AZs |
| Internet Gateway (IGW) | The VPC's door to the internet | One per VPC; public subnet = route table has 0.0.0.0/0 → IGW |
| NAT Gateway | Lets a private subnet initiate outbound traffic; nothing gets in | Lives in a public subnet; single-AZ, so one per AZ for HA; charged per hour + per GB |
| NAT Instance | DIY NAT on EC2 | Legacy, needs source/dest check off, usually a wrong answer |
| Egress-only IGW | NAT for IPv6 (outbound only) | IPv6 + outbound only |
| Route Table | Decides where traffic goes | One associated per subnet |
| Elastic IP | Static public IPv4 | Charged even when unused |
| Bastion host | Jump box in a public subnet | SSM Session Manager is now preferred (no port 22, no keys) |

### Security Group vs NACL (always tested)

|  | Security Group | Network ACL |
| --- | --- | --- |
| Level | Instance (ENI) | Subnet |
| State | Stateful (return traffic allowed automatically) | Stateless (inbound and outbound each need rules, including ephemeral ports 1024-65535) |
| Rules | Allow only | Allow and Deny |
| Evaluation | All rules together | In numbered order, first match wins |
| Default | Deny all inbound, allow all outbound | Default NACL allows everything |
| References | Can reference another Security Group | IPs / CIDRs only |

Mnemonic: **"block a specific IP" → NACL (SGs can't Deny). "Only the ALB may reach EC2" → set the EC2 SG's source to the ALB's SG.**

### Private access to AWS services: VPC endpoints

| Type | Services | Cost | How it works |
| --- | --- | --- | --- |
| Gateway endpoint | S3 and DynamoDB only | Free | Adds a route to the route table |
| Interface endpoint (PrivateLink) | Most AWS services (including S3) | Per hour + per GB | Creates an ENI with a private IP in the subnet; reachable from on-prem via VPN / DX |

- "Private subnet to S3, no public internet, cheapest" → S3 gateway endpoint.
- "On-prem needs private access to S3" → S3 interface endpoint (gateway endpoints don't work from on-prem).
- A bucket policy with `aws:SourceVpce` can restrict access to a specific endpoint.

### VPC to VPC

| Option | What it does | Key points |
| --- | --- | --- |
| VPC Peering | Direct one-to-one link between two VPCs | Not transitive (A-B and B-C doesn't mean A-C); no overlapping CIDRs; works cross-account and cross-Region |
| Transit Gateway | Hub-and-spoke for many VPCs and on-prem networks | Transitive routing, replaces a peering mesh; supports inter-Region peering, multicast |
| PrivateLink (endpoint service) | Expose one service privately to other VPCs through an NLB | Exposes only the service, not the whole network; overlapping CIDRs are fine; common for SaaS vendors |

Mnemonic: **a few VPCs → Peering; many VPCs + on-prem → Transit Gateway; sharing a single service → PrivateLink.**

### Connecting to on-prem

| Option | What it does | Key points |
| --- | --- | --- |
| Site-to-Site VPN | Encrypted IPsec tunnel over the internet | Up in minutes to hours, cheap; bandwidth and latency vary |
| Direct Connect (DX) | Dedicated line, not over the internet | Stable bandwidth, low latency; takes weeks to provision; not encrypted by default |
| DX + VPN | IPsec over DX | Dedicated line + encryption |
| VPN as DX backup | DX primary, VPN backup | "cheap backup" |
| Two DX connections (different locations) | Highest availability | "maximum resiliency" |
| Direct Connect Gateway | One DX to VPCs in multiple Regions | multiple regions via DX |
| AWS Client VPN | Individual laptops into a VPC | remote employees |
| VPN CloudHub | Branch offices interconnected over VPN | hub-and-spoke for branch offices |

### Other networking points

- VPC Flow Logs: record IP traffic (accepted / rejected) to CloudWatch Logs, S3 or Firehose; the tool for "can't connect".
- Route 53 Resolver endpoints: hybrid DNS. Inbound = on-prem resolving AWS private domains; Outbound = AWS resolving on-prem domains.
- Reachability Analyzer: works out why two resources can't reach each other.
- Traffic Mirroring: copies traffic to inspection appliances.
- Traffic within an AZ is free; cross-AZ and cross-Region is charged; data into AWS is free, data out is charged.

## Compute

Order of preference: serverless where possible (Lambda → Fargate), EC2 only for special requirements. Lambda's 15-minute limit is the most common dividing line.

### EC2 instance families

| Prefix | Purpose | Keywords |
| --- | --- | --- |
| T (t3, t4g) | Burstable, cheap | Low load with occasional spikes, dev/test |
| M | General purpose | Balanced |
| C | Compute optimized | Batch, game servers, HPC, video transcoding |
| R, X | Memory optimized | In-memory databases, large caches, real-time big data |
| I, D | Storage optimized (local NVMe) | High IOPS, NoSQL, data warehousing |
| P, G, Inf, Trn | Accelerated computing (GPU / custom chips) | Machine learning, graphics |

### EC2 purchase options (always tested)

| Option | Discount | When |
| --- | --- | --- |
| On-Demand | None | Short-term, can't be interrupted, unpredictable |
| Reserved Instances | Up to ~72% | Steady long-term (1 or 3 years), locked to an instance type; Convertible RIs can change type for a smaller discount |
| Savings Plans | Up to ~72% | Commit to hourly spend; Compute Savings Plans are the most flexible (across families, Regions, and also cover Fargate and Lambda); EC2 Instance Savings Plans give a bigger discount but lock family and Region |
| Spot Instances | Up to ~90% | Interruptible work: batch, big data, CI/CD, stateless web; 2-minute interruption notice |
| Dedicated Hosts | None (expensive) | Licences tied to physical sockets / cores (BYOL), compliance requiring a whole host |
| Dedicated Instances | More expensive | Hardware not shared with other customers, but no control over the physical host |
| Capacity Reservations | None | Guaranteed capacity in an AZ, launch any time |

Mnemonic: **steady → Savings Plans / RI; interruptible → Spot; licence tied to cores → Dedicated Hosts; guaranteed machines → Capacity Reservation.**

### Placement groups

| Type | Layout | Use |
| --- | --- | --- |
| Cluster | Packed close together in one AZ | Lowest latency, highest throughput (HPC), but a single point of failure |
| Spread | Each instance on distinct hardware | A few critical instances that mustn't fail together (max 7 per AZ) |
| Partition | Split into partitions that don't share racks | Large distributed systems: Hadoop, Cassandra, Kafka |

### Other EC2 points

- User data: script run at launch (only on first boot).
- Instance metadata: `169.254.169.254`, where programs get role credentials and instance info.
- AMI: machine image, Regional; copy it to use in another Region.
- Hibernate: saves RAM to the encrypted EBS root volume for faster start (back to the pre-hibernate state).
- EC2 Instance Connect / Session Manager: log in without managing SSH keys.
- Elastic Network Adapter / EFA: EFA is for HPC and tightly coupled parallel workloads (MPI).

### Auto Scaling

| Policy | What it does | When |
| --- | --- | --- |
| Target tracking | Keep a metric at a target (e.g. CPU 50%) | Most common, simplest |
| Step scaling | Scale in steps by alarm severity | Need fine-grained control |
| Simple scaling | One alarm, one adjustment, then cooldown | Legacy |
| Scheduled scaling | Adjust at fixed times | Predictable peaks (Monday 9 am) |
| Predictive scaling | ML forecasts cyclical traffic and scales ahead | Regular cyclical traffic |

- Launch Templates (recommended) replace the old Launch Configurations.
- Health checks can use the ELB health check so instances broken at the app layer also get replaced.
- Warm pools: pre-initialized instances to cut launch time.
- "Instances boot too slowly to keep up with scaling" → pre-baked AMI (golden image), warm pools, or scheduled / predictive scaling.
- Lifecycle hooks: run an action before an instance launches or terminates (e.g. ship logs before termination).

### Lambda

| Item | Number / key point |
| --- | --- |
| Max execution time | 15 minutes |
| Memory | 128 MB to 10 GB (CPU scales with memory) |
| Ephemeral /tmp | Up to 10 GB |
| Deployment package | zip or container image (up to 10 GB) |
| Cold starts | Solved with Provisioned Concurrency |
| Concurrency | 1,000 per Region per account by default, can be raised; Reserved Concurrency reserves or caps a function's concurrency |
| Connecting to RDS | Use RDS Proxy so a flood of connections doesn't overwhelm the database |
| In a VPC | Can attach to a VPC to reach private resources; needs a NAT Gateway for internet |
| Triggers | S3, DynamoDB Streams, Kinesis, SQS, SNS, EventBridge, API Gateway, ALB |

Lambda@Edge / CloudFront Functions: run code at CloudFront edge locations. CloudFront Functions are lighter and cheaper (header changes, URL rewrites); Lambda@Edge does more (network calls, longer runtime).

### Containers

| Service | What it does | Keywords |
| --- | --- | --- |
| Amazon ECS | AWS's own container orchestrator | Simple, deeply integrated with AWS |
| Amazon EKS | Managed Kubernetes | Question mentions Kubernetes, migrating on-prem K8s |
| AWS Fargate | Serverless compute engine for containers, with ECS or EKS | Don't want to manage servers, long tasks (over 15 minutes) |
| ECS on EC2 | You manage the EC2 cluster | Need GPUs, special instances, fine-grained cost control |
| Amazon ECR | Container image registry | Store Docker images |
| EKS Anywhere / ECS Anywhere | Run on-prem | On-prem data centre |

**ECS permissions:** the task role is what code inside the container uses to call AWS; the task execution role is what ECS uses to pull images and write logs.

### Other compute

| Service | What it does |
| --- | --- |
| Elastic Beanstalk | Upload code; AWS handles deployment, scaling, load balancing; "developers don't want to manage infrastructure" |
| AWS App Runner | Deploy a web service straight from source or a container image, simpler than Beanstalk (closed to new customers from 30 April 2026) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| AWS Batch | Scheduling and provisioning for large batch workloads; can use Spot to save money |
| AWS Outposts | AWS racks in your own data centre (low latency, data must stay on-prem) |
| AWS Wavelength | Run apps at the edge of 5G carrier networks (ultra-low-latency mobile) |
| AWS Local Zones | Extensions close to specific large cities (low latency for local users) |

## Storage

First split storage three ways: object (S3), block (EBS, Instance Store), file (EFS, FSx). "Shared file system" means not EBS; "boot disk" means not S3.

### S3 storage classes (always tested)

| Class | Access frequency | Retrieval time | Minimum billing | Key points |
| --- | --- | --- | --- | --- |
| S3 Standard | Frequent | Milliseconds | None | Default |
| S3 Intelligent-Tiering | Unknown / changing | Milliseconds (except archive tiers) | None | Moves data automatically, small monitoring fee, no retrieval fee |
| S3 Express One Zone | Extremely frequent, ultra-low latency | Single-digit ms | None | Single AZ, directory buckets, for ML and high-performance analytics |
| S3 Standard-IA | Infrequent but needed immediately | Milliseconds | 30 days | Retrieval fee; multi-AZ |
| S3 One Zone-IA | Infrequent, re-creatable data | Milliseconds | 30 days | One AZ only; lose the AZ, lose the data |
| S3 Glacier Instant Retrieval | About once a quarter | Milliseconds | 90 days | Archive with instant retrieval |
| S3 Glacier Flexible Retrieval | Once or twice a year | Expedited 1-5 min, Standard 3-5 h, Bulk 5-12 h | 90 days | The classic archive |
| S3 Glacier Deep Archive | Almost never | Standard within 12 h, Bulk within 48 h | 180 days | Cheapest; long-term regulatory retention (7-10 years) |

Mnemonic: **unknown access pattern → Intelligent-Tiering; re-creatable → One Zone-IA; archive with ms access → Glacier Instant; cheapest and can wait 12+ hours → Deep Archive.**

### S3 lifecycle and data protection

- Lifecycle rules: transition storage class or expire by age; can also delete old versions and clean up incomplete multipart uploads.
- Objects must sit in Standard for at least 30 days before transitioning to Standard-IA / One Zone-IA.
- Versioning: protects against accidental delete/overwrite; a delete just adds a delete marker. Once enabled it can only be suspended, never turned off.
- MFA Delete: deleting versions or changing versioning state requires MFA (only root can configure it).
- Object Lock (WORM, write once read many): Governance mode can be lifted by users with special permissions; Compliance mode can't be deleted even by root until retention ends. Legal hold has no expiry.
- Glacier Vault Lock: WORM policy on a vault, unchangeable once locked. It belongs to the old standalone Amazon Glacier service, which closed to new customers in November 2025; new designs use S3 Glacier storage classes + Object Lock (the S3 Glacier storage classes themselves are unaffected) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html).

Mnemonic: **regulation says "nobody can delete it" → Object Lock Compliance mode.**

### S3 replication

- CRR (cross-Region): disaster recovery, lower-latency access, compliance. SRR (same-Region): log aggregation, syncing between prod and test accounts.
- Versioning must be on for both source and destination buckets.
- Only new objects after enabling are replicated; existing objects need S3 Batch Replication.
- S3 RTC (Replication Time Control): 99.99% of objects replicated within 15 minutes.

### S3 access and security

| Feature | What it does |
| --- | --- |
| Block Public Access | One switch at account or bucket level to block public access (on by default) |
| Bucket policy | Resource-based policy; cross-account grants, source IP restrictions, VPC endpoint restrictions, enforce HTTPS |
| Presigned URL | Time-limited upload or download of a single object for someone without AWS permissions |
| S3 Access Points | Separate entry points and policies per team or app, to tame a big shared bucket |
| Object Ownership (Bucket owner enforced) | Disables ACLs; the bucket owner owns every object (recommended) |
| CloudFront + OAC | Only CloudFront can read S3; users can't hit the bucket directly |

### S3 performance and features

- About 3,500 writes and 5,500 reads per second per prefix; spread across prefixes to scale.
- Max object size 50 TB (raised from 5 TB in December 2025; older question banks say 5 TB) [↗](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/); single PUT up to 5 GB; multipart upload recommended above 100 MB.
- S3 Transfer Acceleration: speeds up long-distance uploads via CloudFront edge locations.
- Byte-range fetch: download different ranges of an object in parallel.
- Event Notifications: notify SQS, SNS, Lambda or EventBridge on object create/delete.
- S3 Select: SQL to pull part of a single object (closed to new customers since July 2024, AWS recommends Athena; may still appear in old questions) [↗](https://docs.aws.amazon.com/AmazonS3/latest/userguide/selecting-content-from-objects.html).
- S3 Batch Operations: bulk actions on many objects (copy, tag, encrypt, invoke Lambda).
- Requester Pays: the requester pays download costs.
- Static website hosting: serve a static site; add CloudFront for HTTPS.
- S3 is strongly consistent (read-after-write returns the latest data).

### EBS and Instance Store

| Type | What it does | Keywords |
| --- | --- | --- |
| gp3 | Default SSD, IOPS and throughput tuned independently; up to 80,000 IOPS, 2,000 MiB/s, 64 TiB (raised in September 2025; older banks say 16,000 IOPS) [↗](https://aws.amazon.com/about-aws/whats-new/2025/09/amazon-ebs-size-provisioned-performance-gp3-volumes) | General purpose, cheaper (migrate from gp2) |
| io2 Block Express / io1 | High-IOPS SSD, supports Multi-Attach | Critical databases, low latency |
| st1 | Throughput-optimized HDD | Big data, logs, sequential reads |
| sc1 | Cheapest HDD | Cold data |
| Instance Store | Host-local disk, highest IOPS | Scratch, cache, buffers; data gone on stop |

- EBS is tied to one AZ; to move AZ or Region → go through a snapshot.
- Automated snapshots → Data Lifecycle Manager or AWS Backup.
- Encrypt an unencrypted volume → snapshot → encrypted copy → new volume.
- HDDs (st1, sc1) can't be boot volumes.

### File storage

| Service | Protocol / platform | Keywords |
| --- | --- | --- |
| Amazon EFS | NFS, Linux | Shared across many EC2 / containers / Lambda across AZs, auto-scaling; IA and Archive tiers with lifecycle |
| FSx for Windows File Server | SMB, Windows, Active Directory integration | Windows file shares, DFS, SharePoint |
| FSx for Lustre | High-performance parallel file system | HPC, ML training, processes S3 data directly |
| FSx for NetApp ONTAP | NFS, SMB, iSCSI multi-protocol | Migrating on-prem NetApp, both Linux and Windows clients |
| FSx for OpenZFS | NFS | Migrating on-prem ZFS |

Mnemonic: **Linux shared → EFS; Windows shared → FSx for Windows; HPC → FSx for Lustre; NetApp → FSx for ONTAP.**

### Storage Gateway (hybrid storage)

| Type | What on-prem sees | Data stored in | Use |
| --- | --- | --- | --- |
| S3 File Gateway | NFS / SMB file share | S3 | On-prem apps write files into S3, with a local cache |
| FSx File Gateway | SMB share | FSx for Windows | Low-latency on-prem access to FSx (no longer offered to new customers; may still appear in questions) |
| Volume Gateway – Cached | iSCSI disk | S3 (hot data cached on-prem) | Extend on-prem capacity |
| Volume Gateway – Stored | iSCSI disk | Full data on-prem, async backup to S3 | On-prem needs low-latency access to all data |
| Tape Gateway | Virtual tape library (VTL) | S3 / Glacier | Replace physical tape without changing backup software |

## Databases

Start from the data model: relational → RDS / Aurora; key-value, massive scale, ms latency → DynamoDB; caching → ElastiCache; other purpose-built models each have their own service.

### Multi-AZ vs Read Replica (the most tested)

|  | Multi-AZ | Read Replica |
| --- | --- | --- |
| Purpose | High availability, automatic failover | Scale read performance |
| Replication | Synchronous | Asynchronous |
| Standby readable? | Classic Multi-AZ: no (the two standbys in a Multi-AZ DB cluster are readable) | Yes |
| Cross-Region | No | Yes (can also serve as DR, manual promote) |
| Failover | Automatic, DNS name unchanged | Manually promote to a standalone database |

Mnemonic: **Multi-AZ keeps you alive; Read Replicas take the load.** "Reporting queries slow the primary down" → Read Replica; "must survive an AZ failure" → Multi-AZ.

### Amazon RDS

- Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Db2.
- Automated backups: 1-35 days retention, point-in-time restore; manual snapshots kept until you delete them.
- Encryption is decided at creation; encrypting later goes through the snapshot-copy process.
- Storage autoscaling: grows storage automatically when it runs low.
- RDS Proxy: connection pooling, fixes Lambda floods overwhelming the database, faster failover, works with IAM auth and Secrets Manager.
- IAM database authentication: log in to the database with an IAM token (MySQL, PostgreSQL).
- RDS Custom: Oracle or SQL Server when you need OS access (RDS Custom for Oracle entered its Sunset phase in March 2026; SQL Server is still offered) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html).
- Blue/Green Deployments: stand up a green environment for upgrades or schema changes, switch over quickly and safely.

### Amazon Aurora

| Feature | Key points |
| --- | --- |
| Compatibility | MySQL- and PostgreSQL-compatible, faster than regular RDS |
| Storage | Auto-grows to 256 TiB (raised from 128 TiB in 2025; older material says 128 TiB) [↗](https://aws.amazon.com/es/about-aws/whats-new/2025/07/amazon-aurora-postgresql-database-clusters-256-tib-storage-volume/), 6 copies across 3 AZs |
| Replicas | Up to 15 Aurora Replicas, failover usually within 30 seconds |
| Endpoints | Writer endpoint, Reader endpoint (load-balances reads), Custom endpoint (a chosen set of replicas, e.g. for reporting) |
| Aurora Serverless v2 | Unpredictable, intermittent load; capacity adjusts automatically |
| Aurora Global Database | Cross-Region replication lag usually under 1 second, secondary Region can be promoted quickly; cross-Region DR with RPO in seconds, RTO in minutes |
| Aurora Cloning | Quickly clone a database for testing without a full copy |
| Backtrack | "Rewind" the database to a point in time (MySQL-compatible edition) |

### Amazon DynamoDB

| Feature | Key points |
| --- | --- |
| Type | Serverless key-value / document NoSQL, single-digit ms latency, auto-scaling |
| Capacity modes | On-demand (unpredictable traffic), Provisioned + Auto Scaling (predictable, cheaper) |
| Item limit | 400 KB per item; store large files in S3 and a pointer in DynamoDB |
| DAX | DynamoDB-specific cache, microsecond reads, few code changes |
| Global Tables | **Multi-Region, multi-active (active-active)** replication |
| DynamoDB Streams | Change event stream, can trigger Lambda |
| TTL | Automatically delete expired items (sessions, temporary data) |
| Backup | PITR (up to 35 days), on-demand backups; export to S3 |
| Indexes | GSI can be added any time, different partition key; LSI only at table creation, same partition key |
| Transactions | Supports ACID transactions |

### Amazon ElastiCache

| Engine | Features | When |
| --- | --- | --- |
| Redis / Valkey | Persistence, replication and Multi-AZ auto-failover, backups, advanced data structures (sorted sets for leaderboards), pub/sub | Need HA, leaderboards, durable sessions |
| Memcached | Simple, multi-threaded, no replication or persistence | The plainest cache, horizontal sharding |

- Common uses: database query caching, session store (makes EC2 stateless).
- Caching strategies: lazy loading (write to cache on a miss; can go stale), write-through (update cache when writing the database), plus TTLs.
- Amazon MemoryDB: Redis-compatible, durable primary database (not just a cache).

### Other purpose-built databases

| Service | Data model | Keywords |
| --- | --- | --- |
| Amazon DocumentDB | Document | MongoDB-compatible |
| Amazon Keyspaces | Wide-column | Apache Cassandra-compatible |
| Amazon Neptune | Graph | Social networks, recommendations, fraud detection, knowledge graphs |
| Amazon Timestream | Time series | IoT sensor data, monitoring metrics (the original Timestream for LiveAnalytics closed to new customers in June 2025; new deployments use Timestream for InfluxDB) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| Amazon OpenSearch | Search engine | Full-text search, log analytics |
| Amazon Redshift | Data warehouse (OLAP) | Large-scale analytics, BI |
| Amazon QLDB | Immutable ledger | May appear in old questions; shut down on 31 July 2025, migration target is Aurora PostgreSQL [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |

### Picking one

- "Existing SQL, transactions" → RDS; "higher-performance / more available MySQL or PostgreSQL" → Aurora.
- "Millions of requests per second, ms latency, serverless, flexible schema" → DynamoDB.
- "DynamoDB but faster (microseconds)" → DAX; "RDS reads are too slow" → ElastiCache or a Read Replica.
- "Low-latency writes for users worldwide" → DynamoDB Global Tables; "relational with global reads + cross-Region DR" → Aurora Global Database.
- "Lambda is exhausting RDS connections" → RDS Proxy.

## Front door: load balancing, DNS, CDN

A user request usually goes Route 53 (DNS) → CloudFront or Global Accelerator (edge) → ELB → backend. Each layer solves a different problem.

### Elastic Load Balancing

| Type | Layer | Keywords |
| --- | --- | --- |
| Application Load Balancer (ALB) | Layer 7 HTTP / HTTPS / gRPC | Routing by path, host, header, query string; microservices, containers, Lambda targets, WebSocket, WAF, Cognito sign-in integration |
| Network Load Balancer (NLB) | Layer 4 TCP / UDP / TLS | Extreme performance, ultra-low latency, static IP / Elastic IP per AZ, non-HTTP protocols, PrivateLink backends |
| Gateway Load Balancer (GWLB) | Layer 3 | Steers traffic to third-party firewalls, IDS/IPS and other virtual appliances (GENEVE) |

Mnemonic: **HTTP routing → ALB; static IP, TCP/UDP, fastest → NLB; firewall appliances → GWLB.**

ELB points:

- Cross-zone load balancing: on by default for ALB; off by default for NLB and GWLB.
- Sticky sessions: pin a user to one instance (via cookie); better to store sessions in ElastiCache / DynamoDB.
- Connection draining (deregistration delay): let in-flight requests finish before deregistering.
- SSL offloading: terminate HTTPS at the ELB (cert in ACM) to lighten the backend; SNI for multiple domains.
- Backend behind an ALB needs the client's real IP → read the `X-Forwarded-For` header.
- "ALB needs a static IP" → put an NLB or Global Accelerator in front of it.

### Route 53

| Routing policy | What it does | When |
| --- | --- | --- |
| Simple | Returns one or more records, no health checks | A single resource |
| Weighted | Split traffic by weight | Blue/green, A/B testing, gradual migration |
| Latency | Route to the lowest-latency Region | Fastest response for global users |
| Failover | Switch to backup when primary is unhealthy | Active-passive DR |
| Geolocation | By user location (country, continent) | Localized content, legal restrictions for specific countries |
| Geoproximity | By geographic distance, with bias to adjust | Shift traffic towards a Region (needs Traffic Flow) |
| Multivalue answer | Returns up to 8 healthy records | Simple client-side load balancing (not a replacement for ELB) |
| IP-based | By client IP range | Specific ISPs or ranges to specific endpoints |

Route 53 points:

- Alias records: point at AWS resources (ELB, CloudFront, S3 website, API Gateway), work at the zone apex (e.g. example.com), and the queries are free. CNAMEs can't be used at the apex.
- Health checks: can check endpoints, other health checks (calculated), or CloudWatch alarms (for private resources).
- Private hosted zone: private DNS inside a VPC.
- Hybrid DNS → Route 53 Resolver inbound / outbound endpoints.

### CloudFront

- Global CDN, caches static and dynamic content to cut latency and origin load.
- Origins can be S3, ALB, EC2, API Gateway, any HTTP server.
- OAC (Origin Access Control): only CloudFront can read S3, the bucket stays private (replaces the older OAI).
- Signed URL / signed cookie: paid or private content. One file → signed URL; many files (a whole members' area) → signed cookie.
- Geo restriction: block or allow specific countries.
- Field-level encryption: encrypt specific form fields at the edge (e.g. card numbers).
- Origin failover (origin group): switch to a secondary origin when the primary fails.
- Pair with WAF and Shield for edge protection; edge compute with CloudFront Functions / Lambda@Edge.
- Cache invalidation: clear the cache after updating content, or version the file names.

### Global Accelerator vs CloudFront

|  | CloudFront | Global Accelerator |
| --- | --- | --- |
| What it does | Caches content at the edge | No caching; speeds up connections over the AWS backbone |
| Protocols | HTTP / HTTPS | TCP / UDP (HTTP too) |
| IPs | Dynamic | 2 static Anycast IPs |
| Good for | Websites, video, static files, API caching | Gaming, IoT, VoIP, static IP allow-lists, fast cross-Region failover (seconds, unaffected by DNS caching) |

Mnemonic: **cacheable → CloudFront; not cacheable, static IPs, non-HTTP, fast cross-Region failover → Global Accelerator.**

## Decoupling and integration

"Traffic spikes take the backend down", "components depend on each other", "orders must not be lost" → usually put SQS in the middle. "One event, many recipients" → SNS or EventBridge.

### SQS / SNS / EventBridge / Kinesis compared

| Service | Model | Consumers per message | Keywords |
| --- | --- | --- | --- |
| SQS | Queue (pull) | One (deleted once processed) | decouple, buffer, absorb spikes, async processing |
| SNS | Publish / subscribe (push) | Many subscribers at once | fan-out, notifications (email, SMS, Lambda, SQS, HTTP) |
| EventBridge | Event bus + rule routing | Many targets, filtered by content | AWS service events, SaaS events, schedules, cross-account events |
| Kinesis Data Streams | Stream | Many consumers read the same data, replayable | real-time, high volume, ordering, replay |

### SQS

| Item | Standard | FIFO |
| --- | --- | --- |
| Throughput | Nearly unlimited | 300 messages/s (3,000 with batching; higher in high-throughput mode) |
| Ordering | Best effort, not guaranteed | Strict (per message group) |
| Duplicates | At-least-once (may duplicate) | Exactly-once processing |
| Name | Anything | Must end in `.fifo` |

- Visibility timeout: how long a received message is hidden from other consumers (default 30 s, max 12 h); if processing takes longer it gets processed twice, so raise it.
- Retention: default 4 days, max 14 days.
- Long polling (up to 20 s): fewer empty responses, lower cost.
- Dead-letter queue (DLQ): messages that fail repeatedly move to another queue for debugging.
- Delay queue: messages invisible for up to 15 minutes.
- Max message size: raised to 1 MiB in August 2025 (older material and question banks say 256 KB) [↗](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib); larger payloads go in S3 with a pointer in SQS (Extended Client Library).
- Scale EC2 on queue depth: target tracking on the CloudWatch metric `ApproximateNumberOfMessagesVisible` (or backlog per instance).

### SNS

- SNS + SQS fan-out: one event to several SQS queues, each processed independently (e.g. an order going to shipping, billing and analytics at once).
- Message filtering: subscribers only receive matching messages.
- SNS FIFO topics: preserve ordering together with SQS FIFO.

### EventBridge

- Rules route events by content to Lambda, Step Functions, SQS, SNS, ECS tasks and more.
- EventBridge Scheduler: replaces cron jobs on EC2 (serverless scheduling).
- SaaS integration: events from Zendesk, Datadog, Shopify and others straight into AWS.
- Archive & replay: store and replay events.
- Pipes: point-to-point source-to-target, with filtering and transformation in between.
- Common pattern: "handle it automatically when EC2 state changes / GuardDuty finds something / an S3 object is created" → EventBridge rule + Lambda.

### Step Functions

- Chains steps into a stateful workflow with built-in retries, error handling, parallel branches, waits and human approval (callbacks).
- Standard workflow: up to 1 year, exactly-once execution; long processes, approvals.
- Express workflow: up to 5 minutes, high throughput; large volumes of short events.
- Keywords: orchestrate, workflow, several Lambdas in sequence, needs human approval.

### API Gateway

| Type | What it does |
| --- | --- |
| REST API | Most complete: API keys, usage plans, request validation, caching, WAF |
| HTTP API | Cheaper, lower latency, fewer features |
| WebSocket API | Two-way real-time communication (chat, live notifications) |

- Endpoint types: Edge-optimized (via CloudFront, global users), Regional, Private (only from a VPC via an interface endpoint).
- Throttling, usage plans + API keys: limit requests per customer.
- Caching: cache responses to reduce backend load.
- Auth: IAM, Cognito User Pool authorizer, Lambda authorizer (custom token logic).
- Integration timeout defaults to 29 seconds (since June 2024, Regional / Private REST APIs can request an increase) [↗](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-api-gateway-integration-timeout-limit-29-seconds/); long jobs should still go async (push to SQS / Step Functions and respond immediately).
- Classic serverless stack: API Gateway + Lambda + DynamoDB.

### Other integration services

| Service | What it does | Keywords |
| --- | --- | --- |
| Amazon MQ | Managed ActiveMQ / RabbitMQ | Migrating from on-prem, no code changes, standard protocols like AMQP, MQTT, STOMP, OpenWire |
| AWS AppSync | Managed GraphQL APIs | GraphQL, real-time data sync, offline mobile apps |
| Amazon SES | Bulk email sending | Transactional email, marketing email |
| AWS AppFlow | Data transfer between SaaS (Salesforce, SAP, Slack) and AWS | SaaS data integration, no code |

Mnemonic: **new systems use SQS / SNS; existing on-prem ActiveMQ / RabbitMQ moving up without code changes → Amazon MQ.**

## Big data and analytics

Remember the four stages of a data flow: Ingest → Process → Store → Analyze. Pick the right service at each stage and most questions solve themselves.

### Ingesting streams

| Service | What it does | Keywords |
| --- | --- | --- |
| Kinesis Data Streams | Real-time streaming pipeline, data retained and re-readable (24 h default, up to 365 days); provisioned (shards) or on-demand | real-time, multiple consumers, replay, custom processing |
| Amazon Data Firehose (formerly Kinesis Data Firehose) | Fully managed delivery to S3, Redshift, OpenSearch, Splunk; Lambda transforms, Parquet conversion | near-real-time, least operational overhead, no replay |
| Managed Service for Apache Flink (formerly Kinesis Data Analytics) | Real-time SQL / computation on streams | Real-time analytics, windowed aggregation |
| Amazon MSK | Managed Apache Kafka (serverless option too) | Question mentions Kafka |
| Kinesis Video Streams | Video streams | Cameras, video analytics |
| AWS IoT Core | Connects large fleets of IoT devices (MQTT) | IoT devices |

Mnemonic: **real-time with replay → Data Streams; just get it into S3 / Redshift with no fuss → Firehose; Kafka → MSK.**

### Processing and transformation

| Service | What it does | Keywords |
| --- | --- | --- |
| AWS Glue | Serverless ETL; Crawlers scan data and build the Data Catalog | ETL, schema discovery, CSV to Parquet |
| Glue DataBrew | Visual data cleaning, no code | Analysts cleaning data |
| Amazon EMR | Managed Hadoop / Spark / Hive / Presto clusters (EMR Serverless too) | Large-scale processing, question mentions Spark or Hadoop |
| AWS Lambda | Lightweight real-time transforms | Per-event processing, under 15 minutes |
| AWS Batch | Batch computing | Large parallel jobs |

### Storage and analysis

| Service | What it does | Keywords |
| --- | --- | --- |
| Amazon S3 | The core of a data lake | Raw data, any format, cheap |
| AWS Lake Formation | Build a data lake fast, central fine-grained permissions (column, row level) | build data lake, fine-grained access control |
| Amazon Athena | Serverless SQL directly on S3, billed by data scanned | Ad-hoc queries, querying logs (CloudTrail, ALB, VPC Flow Logs) |
| Amazon Redshift | Data warehouse (OLAP, columnar), petabyte scale; Redshift Serverless available | complex analytics, BI, data warehouse |
| Redshift Spectrum | Redshift queries S3 directly without loading | Warehouse data + S3 data together |
| Amazon QuickSight | BI dashboards and visualization (folded into Amazon Quick Suite in October 2025, shortened to Amazon Quick in 2026, with the BI part called Quick Sight; exam questions still say QuickSight) [↗](https://aws.amazon.com/blogs/business-intelligence/reimagine-business-intelligence-amazon-quicksight-evolves-to-amazon-quick-suite) | dashboard, reports |
| Amazon OpenSearch | Search and log analytics | full-text search, log analytics |

**Saving money with Athena:** convert data to Parquet / ORC (columnar), compress, and partition so queries scan less.

Redshift points:

- It's OLAP (analytics), not OLTP (transactions); day-to-day transactions go to RDS / Aurora.
- Cross-Region snapshot copy for DR.
- Zero-ETL integration: data from Aurora, RDS, DynamoDB syncs into Redshift automatically, no hand-written ETL.
- Concurrency scaling: adds capacity automatically during query peaks.

### Data lake vs data warehouse

|  | Data lake (S3) | Data warehouse (Redshift) |
| --- | --- | --- |
| Data | Raw, any format (structured, semi-structured, unstructured) | Curated, structured |
| Schema | Defined at read time (schema-on-read) | Defined at write time (schema-on-write) |
| Cost | Cheap | More expensive |
| Typical tools | Glue + Athena + Lake Formation | Redshift + QuickSight |

### Common combinations (just memorize)

- Stream → S3 → query: Firehose → S3 → Athena
- Stream → data warehouse: Firehose → Redshift
- Real-time processing: Kinesis Data Streams → Lambda
- Standard data lake: S3 + Glue Crawler / Data Catalog + Athena + QuickSight, permissions via Lake Formation
- Clickstream analytics: Kinesis Data Streams → Managed Flink → Firehose → S3 / Redshift
- Query AWS logs: logs in S3 → Athena
- IoT: IoT Core → Kinesis / Firehose → S3 → Athena / QuickSight

## Monitoring and operations

Keep them apart: CloudWatch for performance and logs, CloudTrail for who did what, Config for whether settings are compliant, Systems Manager for managing machines.

### CloudWatch

| Feature | What it does | Key points |
| --- | --- | --- |
| Metrics | Performance metrics | EC2 every 5 minutes by default, 1 minute with detailed monitoring; memory and disk usage are not default metrics, they need the CloudWatch agent |
| Alarms | Act when a metric crosses a threshold | Can trigger SNS, Auto Scaling, EC2 actions (stop, reboot, recover); composite alarms combine alarms to cut noise |
| Logs | Centralized logs | Retention settings, export to S3, subscription filters stream to Lambda / Firehose / OpenSearch; metric filters turn logs into metrics |
| Logs Insights | Query language for logs | Fast troubleshooting |
| Dashboards | Dashboards | Cross-account, cross-Region |
| Synthetics | Canary scripts that simulate users on a schedule | Proactive availability monitoring |
| Container Insights / Lambda Insights | Detailed container and Lambda metrics | ECS, EKS monitoring |

- "EC2 memory utilization" → CloudWatch agent (not a default metric).
- "Auto-recover EC2 from hardware failure" → CloudWatch alarm + recover action (keeps the IP and instance ID).
- X-Ray: distributed tracing, finds which hop in a microservice chain is slow or failing.

### CloudTrail

- Records every API call (who, when, from where, what); management events kept 90 days by default.
- For long-term retention → create a trail to S3; an organization trail collects all accounts at once.
- Data events (S3 object-level, Lambda invocations) are off by default and must be enabled.
- CloudTrail Insights: detects unusual API activity volumes.
- "Who deleted this resource?" → CloudTrail.

### Systems Manager (SSM)

| Feature | What it does |
| --- | --- |
| Session Manager | Log in to instances without opening SSH or using keys, with an audit trail |
| Run Command | Run commands across many instances at once |
| Patch Manager | Automated OS patching for Windows / Linux |
| Inventory | Collects software and configuration inventory from instances |
| State Manager | Keeps instances in a defined configuration |
| Automation | Automated runbooks; also used for Config remediation |
| Parameter Store | Stores config and secrets |
| Maintenance Windows | Scheduled maintenance windows |

- Works for on-prem servers too (install the SSM Agent, register as a hybrid managed node).
- "Automated patching + inventory + vulnerability reporting" → Patch Manager + Inspector.

### Infrastructure as code and deployment

| Service | What it does | Keywords |
| --- | --- | --- |
| CloudFormation | Build whole stacks from YAML / JSON templates | infrastructure as code, repeatable deployments |
| StackSets | Deploy to many accounts and Regions at once | multi-account / multi-region deployment |
| AWS CDK | IaC in a programming language, synthesizes CloudFormation | Infrastructure in TypeScript, Python |
| AWS SAM | Serverless extension of CloudFormation | Deploying Lambda + API Gateway |
| AWS Service Catalog | Catalogue of admin-approved products for self-service deployment | Self-service, compliant |
| CodePipeline / CodeBuild / CodeDeploy | CI/CD pipelines, builds, deployments (including blue/green, canary) | CI/CD |

### Other operations tools

| Service | What it does |
| --- | --- |
| AWS Trusted Advisor | Best-practice checks across cost, performance, security, fault tolerance and service limits, with recommendations (full checks need Business support or higher) |
| AWS Health Dashboard | AWS service events and maintenance notices affecting your resources; automate with EventBridge |
| Service Quotas | View and request increases to service limits |
| AWS Compute Optimizer | Rightsizing recommendations and estimated savings for EC2, EBS, Lambda, ECS on Fargate based on usage |
| AWS Well-Architected Tool | Review architectures against the six pillars |

**The six Well-Architected pillars:** Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability.

## High availability and disaster recovery

**High availability (HA) protects against an AZ failure, using Multi-AZ; disaster recovery (DR) protects against a whole Region failing, using cross-Region.** First work out which one the question is about.

### RPO and RTO

- RPO (Recovery Point Objective): how much data you can afford to lose. Driven by backup / replication frequency.
- RTO (Recovery Time Objective): how long you can afford to be down. Driven by recovery speed.
- Mnemonic: **RPO looks back (data), RTO looks forward (time).** Smaller numbers cost more.

### The four DR strategies (always tested)

| Strategy | How | RPO / RTO | Cost |
| --- | --- | --- | --- |
| Backup & Restore | Regular backups to another Region only; rebuild when disaster strikes | Hours | Cheapest |
| Pilot Light | Core data replicated continuously (e.g. a database replica); other servers off or minimal, started and scaled up on disaster | Tens of minutes | Low |
| Warm Standby | A scaled-down but fully working environment in another Region, scaled up on disaster | Minutes | Medium |
| Multi-site Active/Active | Both Regions serve full traffic simultaneously | Near zero | Most expensive |

Mnemonic (cheapest to priciest): **backup → pilot light → warm standby → active/active.** "Lowest cost and an RTO of hours is fine" → Backup & Restore; "database is always in sync, but app servers are normally off" → Pilot Light; "a scaled-down environment is always running" → Warm Standby.

### HA / DR per service

| Service | High availability (AZ level) | Disaster recovery (Region level) |
| --- | --- | --- |
| EC2 | Auto Scaling group across AZs + ELB | Copy AMIs to another Region, AWS Elastic Disaster Recovery |
| EBS | Snapshots (volumes are tied to one AZ) | Copy snapshots cross-Region |
| RDS | Multi-AZ | Cross-Region read replica, cross-Region snapshot copy |
| Aurora | 6 copies across 3 AZs, automatic replica failover | Aurora Global Database |
| DynamoDB | Multi-AZ by default | Global Tables |
| S3 | At least 3 AZs by default (except One Zone classes) | CRR cross-Region replication |
| EFS | Regional, multi-AZ by default | EFS replication to another Region |
| ElastiCache | Redis / Valkey Multi-AZ auto-failover | Global Datastore |
| DNS switching | Route 53 health checks | Route 53 failover routing |
| Global entry point | ELB | Global Accelerator, CloudFront origin failover |

### Backup and DR services

| Service | What it does | Keywords |
| --- | --- | --- |
| AWS Backup | Central backup plans across many services (EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx, S3) | centralized backup, cross-account, cross-Region copy |
| AWS Backup Vault Lock | Backups that can't be deleted (WORM) | Ransomware protection, regulation |
| AWS Elastic Disaster Recovery (DRS) | Continuously replicates servers (on-prem or cloud) to AWS, RPO in seconds, RTO in minutes | Server-level DR, on-prem DR to AWS |

### HA design checklist

- **Stateless**: sessions in ElastiCache / DynamoDB so EC2 can scale in and out freely.
- **At least two AZs**: subnets, NAT Gateways and instances all multi-AZ.
- **Decouple**: SQS in the middle so one side failing doesn't take down the other.
- **Self-healing**: Auto Scaling health checks replace bad instances.
- **Remove single points of failure**: a single NAT Gateway, a single EC2 instance, a single-AZ database are all common wrong answers.

## Migration and transfer

First identify what's moving: servers → MGN; databases → DMS (+ SCT); files → DataSync; large offline data → Snowball; ongoing SFTP file transfer → Transfer Family.

### Migration strategies (the 7 Rs)

| Strategy | Meaning | Typical tools |
| --- | --- | --- |
| Rehost | Move as-is (lift and shift) | AWS Application Migration Service (MGN) |
| Replatform | Small changes (lift, tinker and shift), e.g. moving the database to RDS | DMS, Elastic Beanstalk |
| Repurchase | Switch to SaaS | — |
| Refactor / Re-architect | Rewrite as cloud-native (serverless, microservices) | Lambda, containers |
| Relocate | Move a whole VMware environment | VMware Cloud on AWS |
| Retire | Decommission unused systems | — |
| Retain | Keep on-prem for now | — |

### Server and database migration

| Service | What it does | Keywords |
| --- | --- | --- |
| AWS Application Migration Service (MGN) | Continuously replicates on-prem servers to AWS for a minimal-downtime cutover (renamed AWS Transform MGN in June 2026; exam questions still say MGN / Application Migration Service) [↗](https://aws.amazon.com/de/about-aws/whats-new/2026/06/aws-transform-mgn-rebrand/) | lift-and-shift, rehost, many VMs |
| AWS Application Discovery Service | Inventories on-prem servers, dependencies, utilization (closed to new customers from November 2025; new projects use AWS Transform) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) | Pre-migration assessment |
| AWS Migration Hub | Central migration progress tracking (closed to new customers from November 2025; new projects use AWS Transform) [↗](https://docs.aws.amazon.com/migrationhub/latest/ug/migrationhub-availability-change.html) | track migration |
| AWS DMS | Database migration; source stays available during migration; CDC keeps syncing changes | minimal downtime, ongoing replication |
| AWS SCT / DMS Schema Conversion | Converts database schemas (e.g. Oracle → Aurora PostgreSQL) | Heterogeneous database migration |

Mnemonic: **same engine (MySQL → RDS MySQL) only needs DMS; different engines (Oracle → PostgreSQL) need SCT to convert the schema + DMS to move the data.**

### Data transfer

| Service | What it does | Keywords |
| --- | --- | --- |
| AWS DataSync | Automated online file transfer (NFS, SMB, HDFS, object storage) to S3, EFS, FSx, and between AWS services; encryption, verification, scheduling | online transfer, scheduled sync, moving a NAS |
| AWS Transfer Family | Managed SFTP / FTPS / FTP / AS2 servers backed by S3 or EFS | Partners uploading files over SFTP |
| Snowball Edge | Offline physical transfer device, TB to PB scale; Compute Optimized variant for edge compute (closed to new customers from 7 November 2025) [↗](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html) | Network too slow, would take weeks, no connectivity, remote sites |
| S3 Transfer Acceleration | Faster long-distance uploads to S3 | Global users uploading to one bucket |
| Direct Connect | Long-term dedicated line | Sustained high-volume transfer |

The Snow family has shrunk a lot: Snowcone and Snowmobile are discontinued, and Snowball Edge stopped taking new customers on 7 November 2025. AWS's replacements for new customers are DataSync for online transfer, AWS Data Transfer Terminal for physical transport, and Outposts for edge compute. The SAA-C03 question bank, however, still treats Snowball Edge as the standard answer for "large offline transfer".

- Deciding on Snowball: work out "data volume ÷ available bandwidth"; if the network transfer would take more than a week or would hurt normal business traffic → Snowball.
- "One-off bulk move + ongoing sync afterwards" → Snowball for the bulk, then DataSync or DMS for the deltas.
- "Sync an on-prem NAS to EFS / S3 on a schedule" → DataSync (not Storage Gateway; Storage Gateway is for on-prem using cloud storage long-term).

### DataSync vs Storage Gateway vs Transfer Family

|  | DataSync | Storage Gateway | Transfer Family |
| --- | --- | --- | --- |
| Purpose | Move / sync data | On-prem apps keep using cloud storage | External partners exchange files over SFTP / FTP |
| Mode | One-off or scheduled tasks | Long-term hybrid architecture | Long-term file exchange |

## Cost optimization

Cost questions follow a fixed pattern: commitment discounts for steady load, Spot for interruptible work, push rarely used data to lower tiers, serverless for variable usage, and keep network traffic away from NAT and cross-AZ paths.

### Compute savings

| Scenario | Answer |
| --- | --- |
| Runs 24/7, long-term | Savings Plans or Reserved Instances |
| Might change instance type, or mixes EC2 / Fargate / Lambda | Compute Savings Plans |
| Batch, interruptible, retryable | Spot Instances (or Spot Fleet, Auto Scaling mixing On-Demand + Spot) |
| Dev/test environments idle nights and weekends | Scheduled shutdown (Instance Scheduler, EventBridge + Lambda) |
| Very low or intermittent usage | Lambda, Fargate, Aurora Serverless v2 |
| Oversized, low-utilization instances | Compute Optimizer rightsizing |
| Switch to Graviton (ARM) instances | Same performance, cheaper |

### Storage savings

| Scenario | Answer |
| --- | --- |
| Unknown access pattern | S3 Intelligent-Tiering |
| Predictable pattern, old data rarely used | S3 Lifecycle to IA / Glacier |
| Kept for years by regulation, almost never read | Glacier Deep Archive |
| Re-creatable data | One Zone-IA |
| EBS on gp2 | Move to gp3 (cheaper, performance tuned independently) |
| Unattached EBS volumes, old snapshots | Delete, or use snapshot archive |
| Rarely used files in EFS | EFS lifecycle to IA / Archive |
| Download traffic too expensive | CloudFront caching (less origin egress), S3 Requester Pays |

### Network savings

- Private subnet to S3 / DynamoDB → gateway endpoint (free), avoids NAT Gateway processing charges.
- Cut cross-AZ traffic: keep chatty components in the same AZ (without sacrificing HA).
- If a NAT Gateway per VPC is too expensive, consider centralizing egress (shared via Transit Gateway), but if the question wants HA you still need one per AZ.
- Long-term high-volume transfer → Direct Connect has lower data-out rates than the internet.

### Cost management tools

| Service | What it does | Keywords |
| --- | --- | --- |
| AWS Cost Explorer | Visualize past spend, forecast, Savings Plans / RI purchase recommendations | analyze costs, forecast |
| AWS Budgets | Set budgets, alert on actual or forecast overruns, take automatic actions (apply an IAM policy, stop instances) | alert when exceeding budget |
| AWS Cost and Usage Report (CUR) / Data Exports | The most detailed billing data, queryable with Athena | detailed billing data |
| Cost Allocation Tags | Attribute costs to departments or projects by tag | chargeback, per-department split |
| AWS Cost Anomaly Detection | ML-based detection of unusual spend | unexpected spend |
| AWS Compute Optimizer | Rightsizing recommendations + estimated monthly savings | over-provisioned |
| Trusted Advisor | Finds idle resources (idle EC2, unused EIPs, underused EBS) | idle resources |
| AWS Pricing Calculator | Estimate costs before moving to the cloud | estimate before deploying |

Mnemonic: **looking back → Cost Explorer; managing ahead → Budgets; spotting anomalies → Anomaly Detection; resizing → Compute Optimizer; splitting by department → Cost Allocation Tags.**

Cost features in Organizations:

- Consolidated billing: all accounts billed together, combined usage earns tiered discounts.
- RI and Savings Plans discounts are shared across accounts in the organization.

## AI / ML services at a glance

SAA only tests "which service does what", not model details. The question describes a capability; map it to the service name.

| Service | What it does | Question keywords |
| --- | --- | --- |
| Amazon Rekognition | Image and video recognition: faces, objects, inappropriate content | image / video analysis, face detection, content moderation |
| Amazon Textract | Extracts text, tables and form fields from scanned documents | extract text from scanned documents, forms, invoices |
| Amazon Comprehend | Text analysis: sentiment, key phrases, entities, language | sentiment analysis, NLP |
| Amazon Comprehend Medical | Medical text extraction (drugs, conditions in medical records) | medical records |
| Amazon Transcribe | Speech to text | speech-to-text, subtitles, call transcripts |
| Amazon Polly | Text to speech | text-to-speech |
| Amazon Translate | Translation | translate languages |
| Amazon Lex | Chatbots (voice and text conversation) | chatbot, conversational interface |
| Amazon Kendra | Intelligent search over internal enterprise documents (closed to new customers from 30 July 2026) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) | enterprise search, natural-language Q&A |
| Amazon Personalize | Personalized recommendations | recommendations |
| Amazon Forecast | Time-series forecasting (no longer offered to new customers; may appear in old questions) | demand forecasting |
| Amazon Fraud Detector | Online fraud detection (no longer offered to new customers; may appear in old questions) | fraud |
| Amazon SageMaker AI | Platform to build, train and deploy your own ML models | build / train / deploy custom ML models |
| Amazon Bedrock | Generative AI foundation models via API (including Claude) | generative AI, foundation models, RAG |
| Amazon Q | Generative AI assistant (Q Developer for developers; Q Business closed to new customers from 30 July 2026, folded into Amazon Quick) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) | AI assistant |

Mnemonic: **see images → Rekognition; read documents → Textract; understand text → Comprehend; listen → Transcribe; speak → Polly; translate → Translate; chat → Lex; search → Kendra; recommend → Personalize; train your own → SageMaker; generative → Bedrock.**

## Keyword lookup table

Read this in the last hour before the exam: see the description on the left, think of the answer on the right.

### Security and identity

| Question says | Answer |
| --- | --- |
| Block certain actions across all accounts | SCP |
| Quickly set up a compliant multi-account environment | Control Tower |
| Employees sign in once to many accounts | IAM Identity Center |
| App users sign up and sign in | Cognito User Pool |
| App users access S3 / DynamoDB directly | Cognito Identity Pool |
| Another account needs access to resources | IAM role in the target account + trust policy |
| Code on EC2 calls AWS services | IAM role (instance profile) |
| Automatic database password rotation | Secrets Manager |
| Full control of keys, single-tenant hardware | CloudHSM |
| Free HTTPS certificates | ACM |
| SQL injection, XSS, rate limiting | WAF |
| DDoS protection + cost protection + response team | Shield Advanced |
| Manage WAF / SG rules across accounts | Firewall Manager |
| Software vulnerabilities, CVEs | Inspector |
| Malicious activity, unusual API calls, crypto mining | GuardDuty |
| Personal data in S3 | Macie |
| Resource configuration compliance, config history | Config |
| Who called the API, who deleted the resource | CloudTrail |
| Aggregate all security findings | Security Hub |
| Download AWS compliance reports | Artifact |

### Networking and entry points

| Question says | Answer |
| --- | --- |
| Private subnet to S3, no public internet, cheapest | S3 gateway endpoint |
| On-prem private access to S3 or other AWS services | Interface endpoint (PrivateLink) |
| Private subnet needs internet to download updates | NAT Gateway (one per AZ) |
| Block a specific IP | NACL |
| Interconnect many VPCs and on-prem | Transit Gateway |
| Expose just one service to other VPCs / customers | PrivateLink (endpoint service + NLB) |
| Quickly set up an encrypted on-prem connection | Site-to-Site VPN |
| Dedicated line with stable bandwidth and low latency | Direct Connect |
| One DX to multiple Regions | Direct Connect Gateway |
| Route by URL path | ALB |
| Static IP, TCP/UDP, extreme performance | NLB |
| Third-party firewall appliances | Gateway Load Balancer |
| Point the zone apex at an ELB | Route 53 Alias record |
| Gradual traffic shift, A/B testing | Route 53 weighted |
| Route to the lowest-latency Region | Route 53 latency |
| Different content per country / legal restrictions | Route 53 geolocation |
| Cache static content globally | CloudFront |
| Only CloudFront may read S3 | OAC |
| Gaming / UDP / static Anycast IPs / fast cross-Region failover | Global Accelerator |
| Hybrid DNS resolution | Route 53 Resolver endpoints |

### Compute

| Question says | Answer |
| --- | --- |
| Short tasks, event-driven, serverless | Lambda |
| Over 15 minutes + serverless | Fargate (ECS / EKS) |
| Kubernetes | EKS |
| Interruptible batch jobs, cheapest | Spot Instances |
| Licence tied to physical cores | Dedicated Hosts |
| HPC, lowest-latency inter-instance communication | Cluster placement group (+ EFA) |
| A few critical instances must not fail together | Spread placement group |
| Replace cron on EC2 | EventBridge Scheduler + Lambda |
| Lambda cold starts | Provisioned Concurrency |
| No infrastructure management, upload code and deploy | Elastic Beanstalk |
| Predictable traffic peaks | Scheduled scaling |
| Manage instances without SSH | SSM Session Manager |

### Storage and databases

| Question says | Answer |
| --- | --- |
| Unknown access pattern | S3 Intelligent-Tiering |
| Kept for years by regulation, cheapest | S3 Glacier Deep Archive |
| Archive but millisecond retrieval | S3 Glacier Instant Retrieval |
| Nobody can delete it (WORM) | S3 Object Lock Compliance mode |
| Protect against accidental deletion | S3 Versioning (+ MFA Delete) |
| Replicate S3 across Regions | CRR (versioning on both sides) |
| Time-limited upload / download for outsiders | Presigned URL |
| Fast long-distance uploads to S3 | S3 Transfer Acceleration |
| Shared files across many Linux machines | EFS |
| Windows file shares, AD | FSx for Windows File Server |
| HPC file system linked to S3 | FSx for Lustre |
| On-prem apps store files in S3 | S3 File Gateway |
| Replace physical tape | Tape Gateway |
| Highest-IOPS scratch space | Instance Store |
| Critical database, high-IOPS EBS | io2 Block Express |
| Automatic database failover on AZ failure | RDS Multi-AZ |
| Too many reads slowing the primary | Read Replica |
| Lambda opening too many RDS connections | RDS Proxy |
| High-performance MySQL / PostgreSQL | Aurora |
| Cross-Region relational DR, RPO in seconds | Aurora Global Database |
| Relational database with unpredictable traffic | Aurora Serverless v2 |
| Key-value, ms latency, unlimited scale | DynamoDB |
| Microsecond cache for DynamoDB | DAX |
| Writes in multiple Regions at once | DynamoDB Global Tables |
| Data expires automatically | DynamoDB TTL |
| Session store, database query cache | ElastiCache |
| MongoDB | DocumentDB |
| Cassandra | Keyspaces |
| Social graphs, recommendations, graph data | Neptune |
| IoT time series | Timestream |

### Integration, analytics and operations

| Question says | Answer |
| --- | --- |
| Decouple, absorb spikes, orders must not be lost | SQS |
| Strict ordering, no duplicates | SQS FIFO |
| One event notifies many systems | SNS (+ SQS fan-out) |
| SaaS events, content-based routing, schedules | EventBridge |
| Multi-step workflow, human approval | Step Functions |
| On-prem ActiveMQ / RabbitMQ to the cloud without code changes | Amazon MQ |
| GraphQL | AppSync |
| Real-time stream, replayable | Kinesis Data Streams |
| Stream delivered automatically to S3 / Redshift | Firehose |
| Kafka | MSK |
| ETL, data catalogue | Glue |
| Spark / Hadoop | EMR |
| SQL directly on S3 | Athena |
| Data warehouse, complex analytics | Redshift |
| Fine-grained data lake permissions | Lake Formation |
| BI dashboards | QuickSight |
| EC2 memory metrics | CloudWatch agent |
| Tracing latency across microservices | X-Ray |
| Automated OS patching | SSM Patch Manager |
| Deployment templates across accounts and Regions | CloudFormation StackSets |
| Central backup across services | AWS Backup |
| Server-level continuous replication for DR | Elastic Disaster Recovery |
| Lift-and-shift servers | Application Migration Service (MGN), now AWS Transform MGN |
| Database migration, minimal downtime | DMS (plus SCT for heterogeneous) |
| Scheduled network sync of a NAS to AWS | DataSync |
| Partners transfer files over SFTP | Transfer Family |
| Network too slow, TB-PB offline transfer (exam answer; new customers now use Data Transfer Terminal) | Snowball Edge |
| Alert on budget overrun | Budgets |
| Analyze past spend | Cost Explorer |
| Rightsizing + estimated savings | Compute Optimizer |
| Find buckets without versioning, org-wide S3 analytics | S3 Storage Lens |

## Easily confused pairs and numbers to memorize

These are the combinations that most often lead to the wrong answer. For each, first remember the one word that separates them.

### Easily confused pairs

| Easy to mix up | How to tell them apart |
| --- | --- |
| Multi-AZ vs Read Replica | Multi-AZ is synchronous, for HA; Read Replica is asynchronous, offloads reads |
| Security Group vs NACL | SG is stateful, Allow only, on the instance; NACL is stateless, can Deny, on the subnet |
| Gateway endpoint vs Interface endpoint | Gateway: S3 / DynamoDB only, free, not usable from on-prem; Interface: paid, most services, usable from on-prem |
| NAT Gateway vs IGW | IGW gives a public subnet two-way internet; NAT lets a private subnet out but nothing in |
| VPC Peering vs Transit Gateway | Peering is non-transitive, for a few VPCs; TGW is a transitive hub, for many |
| CloudFront vs Global Accelerator | CloudFront caches HTTP content; GA doesn't cache, static IPs, TCP/UDP |
| ALB vs NLB | ALB is layer 7 routing; NLB is layer 4, static IP, very fast |
| SQS vs SNS vs EventBridge | SQS queue, one-to-one; SNS push, one-to-many; EventBridge content-based routing, SaaS, schedules |
| Kinesis Data Streams vs Firehose | KDS real-time, replayable, write your own consumers; Firehose near-real-time, fully managed, delivers to a destination |
| Athena vs Redshift | Athena queries S3 directly, occasional queries; Redshift is a warehouse for frequent complex analytics |
| Secrets Manager vs Parameter Store | Automatic rotation → Secrets Manager; cheap config storage → Parameter Store |
| KMS vs CloudHSM | KMS is managed and multi-tenant; CloudHSM is dedicated hardware, keys entirely yours |
| Inspector vs GuardDuty | Inspector: vulnerabilities; GuardDuty: threat behaviour |
| Config vs CloudTrail | Config: "what the resource looks like now, is it compliant"; CloudTrail: "who did what" |
| CloudWatch vs CloudTrail | CloudWatch: performance and logs; CloudTrail: API auditing |
| EFS vs FSx vs EBS | EFS: Linux shared; FSx: Windows / HPC / NetApp; EBS: single-instance block storage |
| DataSync vs Storage Gateway | DataSync moves data; Storage Gateway is long-term hybrid use |
| Cognito User Pool vs Identity Pool | User Pool signs in; Identity Pool exchanges for temporary AWS credentials |
| Signed URL vs Signed Cookie | One file → URL; many files → cookie |
| Pilot Light vs Warm Standby | Pilot Light: only the data is running; Warm Standby: a scaled-down full environment is running |
| Savings Plans vs RI | Compute Savings Plans are most flexible (covers Fargate, Lambda); Standard RIs lock the type |
| Dedicated Host vs Dedicated Instance | Host exposes physical sockets / cores (for licensing); Instance just isn't shared with others |
| Organizations vs RAM | Organizations manages accounts and policies; RAM shares resources |
| Shield Standard vs Advanced | Standard is free and automatic; Advanced is paid, layer 7, response team, cost protection |

### Numbers to memorize

| Item | Number |
| --- | --- |
| Lambda max execution time | 15 minutes |
| Lambda memory | 128 MB - 10 GB |
| API Gateway integration timeout (default) | 29 seconds (REST APIs can request more) |
| SQS message retention | Default 4 days, max 14 days |
| SQS visibility timeout | Default 30 seconds, max 12 hours |
| SQS long polling | Up to 20 seconds |
| SQS FIFO throughput | 300/s (3,000 with batching) |
| SQS / SNS message size (right column is the common exam value; SQS is now 1 MiB [2025-08], SNS configurable to 1 MiB [2026-09]) | 256 KB |
| DynamoDB item limit | 400 KB |
| DynamoDB PITR | 35 days |
| RDS automated backup retention | 1-35 days |
| Aurora copies | 6 copies, 3 AZs |
| Aurora / RDS MySQL Read Replicas | Up to 15 |
| S3 single object | Up to 50 TB (since 2025-12; older banks say 5 TB) |
| S3 single PUT | Up to 5 GB (multipart recommended above 100 MB) |
| S3 per prefix per second | 3,500 writes, 5,500 reads |
| S3 Standard-IA / One Zone-IA minimum billing | 30 days |
| Glacier Instant / Flexible minimum billing | 90 days |
| Glacier Deep Archive minimum billing | 180 days |
| Glacier Flexible Expedited retrieval | 1-5 minutes |
| Deep Archive retrieval | 12 hours (Bulk 48 hours) |
| Kinesis Data Streams retention | Default 24 hours, max 365 days |
| Spot interruption notice | 2 minutes |
| Spread placement group | Max 7 per AZ |
| gp3 baseline | 3,000 IOPS, 125 MiB/s (max 80,000 IOPS, 2,000 MiB/s, 64 TiB) |
| KMS direct encryption limit | 4 KB (larger uses envelope encryption) |
| CloudTrail event history | 90 days |
| EC2 basic / detailed monitoring | 5 minutes / 1 minute |
| Global Accelerator static IPs | 2 Anycast IPs |

### Common wrong options (be suspicious on sight)

- Running your own database, Kafka or cron on EC2 → there's usually a managed service.
- Storing access keys on EC2, in code or in S3 → use an IAM role.
- Deployed in a single AZ yet claimed to be highly available.
- Using Lambda for work longer than 15 minutes.
- Using a Read Replica for automatic failover (that's Multi-AZ).
- Using Multi-AZ to improve read performance (that's a Read Replica).
- WAF on an NLB or EC2 (WAF only attaches to CloudFront, ALB, API Gateway REST API, AppSync, Cognito user pool, App Runner, Amplify, Verified Access).
- A CNAME at the zone apex (use an Alias).
- Blocking a specific IP with a Security Group (SGs can't Deny; use a NACL).
- Storage Gateway for a one-off bulk move (use DataSync or Snowball).
- RAM to restrict permissions, Inspector to calculate cost, Shield to patch: simply the wrong tool.

## Exam answers vs reality: service changes 2024-2026

Most of the SAA-C03 question bank was written before these changes. In the exam, give the question bank's "standard answer"; this table is so you know reality has moved on and don't get tripped up mixing old and new. (Checked October 2026; follow the ↗ for each change's source.)

| Service / item | What exam questions say | Current state |
| --- | --- | --- |
| SQS message size | 256 KB | 1 MiB (2025-08) [↗](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib) |
| SNS message size | 256 KB | Configurable to 1 MiB, for SQS / Lambda / Firehose subscriptions only (2026-09) [↗](https://dev.classmethod.jp/articles/amazon-sns-1mib-support/) |
| S3 single object | 5 TB | 50 TB (2025-12) [↗](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/) |
| EBS gp3 limits | 16,000 IOPS, 1,000 MiB/s, 16 TiB | 80,000 IOPS, 2,000 MiB/s, 64 TiB (2025-09) [↗](https://aws.amazon.com/about-aws/whats-new/2025/09/amazon-ebs-size-provisioned-performance-gp3-volumes) |
| Aurora storage limit | 128 TiB | 256 TiB (2025-07) [↗](https://aws.amazon.com/es/about-aws/whats-new/2025/07/amazon-aurora-postgresql-database-clusters-256-tib-storage-volume/) |
| API Gateway integration timeout | 29-second hard limit | REST APIs can request an increase (2024-06) [↗](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-api-gateway-integration-timeout-limit-29-seconds/) |
| ACM public certificates | Can't be used on EC2 | Exportable certificates can be purchased for EC2 (2025-06) [↗](https://aws.amazon.com/about-aws/whats-new/2025/06/aws-certificate-manager-public-certificates-use-anywhere) |
| Snowball Edge | First choice for large offline transfer | Closed to new customers (2025-11); use DataSync / Data Transfer Terminal / Outposts [↗](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html) |
| Snowcone, Snowmobile | Members of the Snow family | Discontinued |
| Migration Hub, Application Discovery Service | Migration tracking and discovery | Closed to new customers (2025-11); use AWS Transform [↗](https://docs.aws.amazon.com/migrationhub/latest/ug/migrationhub-availability-change.html) |
| Application Migration Service (MGN) | lift-and-shift | Renamed AWS Transform MGN (2026-06), same functionality [↗](https://aws.amazon.com/de/about-aws/whats-new/2026/06/aws-transform-mgn-rebrand/) |
| Standalone Amazon Glacier (vaults, Vault Lock) | Archive and WORM | Closed to new customers (2025-11); S3 Glacier storage classes unaffected [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| S3 Select | Query part of a single object | Closed to new customers (2024-07); use Athena [↗](https://docs.aws.amazon.com/AmazonS3/latest/userguide/selecting-content-from-objects.html) |
| FSx File Gateway | On-prem access to FSx | Closed to new customers (2024-10) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| QLDB | Immutable ledger | Shut down (2025-07-31); use Aurora PostgreSQL [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| Timestream (LiveAnalytics) | Time series | Closed to new customers (2025-06); use Timestream for InfluxDB [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| RDS Custom for Oracle | OS-level access | Entered Sunset (2026-03) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| App Runner, Audit Manager | Simple deployment, audit evidence | Closed to new customers (2026-04-30) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| Kendra, Q Business | Enterprise search, enterprise AI assistant | Closed to new customers (2026-07-30) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| Forecast, Fraud Detector | Forecasting, fraud detection | Closed to new customers (2024-07, 2025-11) [↗](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html) |
| QuickSight | BI dashboards | Renamed Amazon Quick (the BI part is Quick Sight) [↗](https://aws.amazon.com/blogs/business-intelligence/reimagine-business-intelligence-amazon-quicksight-evolves-to-amazon-quick-suite) |
| Kinesis Data Firehose | Stream delivery | Renamed Amazon Data Firehose |

## Sources

- [AWS Certified Solutions Architect – Associate official page](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
- [KodeKloud: SAA-C03 exam guide notes](https://notes.kodekloud.com/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Solutions-Architecture-Exam-guide-What-to-focus-on/page)
- [Amazon EBS gp3 limits raised (2025-09)](https://aws.amazon.com/about-aws/whats-new/2025/09/amazon-ebs-size-provisioned-performance-gp3-volumes)
- [Amazon SQS max message size 1 MiB (2025-08)](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib)
- [Amazon SNS 1 MiB support (2026-09, classmethod hands-on write-up)](https://dev.classmethod.jp/articles/amazon-sns-1mib-support/)
- [Amazon S3 max object size 50 TB (2025-12)](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/)
- [Aurora PostgreSQL 256 TiB storage (2025-07)](https://aws.amazon.com/es/about-aws/whats-new/2025/07/amazon-aurora-postgresql-database-clusters-256-tib-storage-volume/)
- [API Gateway integration timeout beyond 29 seconds (2024-06)](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-api-gateway-integration-timeout-limit-29-seconds/)
- [ACM exportable public certificates (2025-06)](https://aws.amazon.com/about-aws/whats-new/2025/06/aws-certificate-manager-public-certificates-use-anywhere)
- [AWS WAF supported resource types](https://docs.aws.amazon.com/waf/latest/APIReference/Welcome.html)
- [Snowball Edge availability change](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html)
- [Migration Hub availability change](https://docs.aws.amazon.com/migrationhub/latest/ug/migrationhub-availability-change.html)
- [Application Migration Service renamed AWS Transform MGN (2026-06)](https://aws.amazon.com/de/about-aws/whats-new/2026/06/aws-transform-mgn-rebrand/)
- [S3 Select no longer available to new customers](https://docs.aws.amazon.com/AmazonS3/latest/userguide/selecting-content-from-objects.html)
- [QuickSight evolves into Amazon Quick Suite](https://aws.amazon.com/blogs/business-intelligence/reimagine-business-intelligence-amazon-quicksight-evolves-to-amazon-quick-suite)
- [Timeline of retired AWS services and closures to new customers (compiled from official AWS announcements)](https://hidekazu-konishi.com/entry/aws_retired_services_history_and_timeline.html)
