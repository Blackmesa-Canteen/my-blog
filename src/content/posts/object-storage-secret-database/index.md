---
title: Why Object Storage Is Quietly Becoming Your Data Warehouse
slug: object-storage-secret-database
date: '2026-03-01T12:11:28.405169430Z'
original_permalink: /archives/object-storage-secret-database
---

### Why Object Storage Is Quietly Becoming Your Data Warehouse

Nobody wants to admit it out loud, but a lot of teams are effectively running their analytics warehouse out of S3 and calling it a "data lake" so it doesn't sound ridiculous. Parquet plus object storage is eating into traditional OLAP databases, and the people least willing to say so are the ones still paying six-figure licenses to the vendors it's replacing.

### From files, to databases, and back to files

For decades the pattern was simple: if you had structured data, it went in a relational database — ACID guarantees, transactions, the whole package. Then big data workloads showed up and didn't need most of that. Analytics queries don't need row-level transactions; they need to scan a lot of data fast. Columnar formats like Parquet exist for exactly this: store by column, compress hard, and make scans cheap.

The interesting part is that Parquet doesn't need a database wrapped around it. It's just files, and you can query them directly out of S3.

### Why this replaces OLAP databases for a lot of workloads

Take a typical pipeline: millions of log events a day. The old approach is ingest into a warehouse (Snowflake, BigQuery, pick one), transform, query, and pay for compute whether you're using it or not.

The alternative: land raw logs in S3, process with Spark into Parquet, write the Parquet back to S3, query with Athena or Trino. Cost is mostly storage plus the compute you actually use — no idle cluster burning money overnight. For most analytical workloads the performance is comparable to a dedicated OLAP system, and the cost difference is not small.

### Iceberg and Delta Lake fill the gap that kept this in "batch only" territory

Raw Parquet files can't be updated transactionally, can't be time-traveled, and make schema evolution painful. That's what kept object storage confined to batch processing for years. Apache Iceberg and Delta Lake fix this by sitting on top of Parquet in S3 and providing the transactional layer a database would normally give you: ACID semantics, schema evolution without rewriting terabytes, time-travel queries.

Iceberg came out of Netflix and is now an Apache project — solid metadata management and partition pruning that actually works. Delta Lake, from Databricks, adds streaming integration and optimistic concurrency control. Once you have transactions and analytics on object storage, the case for a proprietary warehouse gets a lot narrower.

### The tradeoffs that don't make it into the blog posts

This isn't free. A few things bite people in practice:

- **Cold storage kills latency.** Moving data to glacier-tier storage saves pennies but adds retrieval delay that will wreck query performance if you need sub-second responses. You end up paying for hot storage anyway.
- **Network becomes the bottleneck instead of disk.** Traditional databases optimize for local SSD reads. Object stores add a network hop to every query. Fine for small datasets, painful for petabyte-scale cross-region joins.
- **Query optimization is still catching up.** Iceberg and friends are improving fast, but they're not yet as sophisticated as a mature OLAP engine on complex joins, window functions, and nested aggregations.

Most people ignoring these tradeoffs simply haven't hit scale yet.

### Where this pattern breaks

- **High-frequency transactional updates** — object stores are append-heavy by design. Row-level updates with immediate consistency requirements need a real OLTP database.
- **Petabyte-scale metadata management** — partition pruning, schema evolution, and compaction at real scale is genuinely hard operational work. Iceberg and Delta Lake help, but you still own the complexity a managed warehouse would have absorbed for you.
- **Data locality** — traditional warehouses plan queries around where data physically sits. Separating compute from storage is great for elasticity and bad for certain access patterns.

When you hit these limits, it's obvious: queries crawl, metadata operations time out, and you're back to pricing out Snowflake.

### Where it lands

Parquet, S3, and Iceberg or Delta Lake made scalable analytics accessible without a seven-figure vendor contract. That's real. It also comes with new failure modes and an operational complexity bill that used to be someone else's problem. There's no universal answer here — the question isn't whether object storage replaces the traditional warehouse, it's which workloads move first, and which stay put because being wrong there is too expensive.
