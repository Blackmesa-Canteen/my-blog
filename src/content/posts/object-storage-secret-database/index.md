---
title: Why Object Storage Is Secretly Your Next Database (And You're In Denial About
  It)
slug: object-storage-secret-database
date: '2026-03-01T12:11:28.405169430Z'
original_permalink: /archives/object-storage-secret-database
---

### Why Object Storage Is Secretly Your Next Database (And You're In Denial About It)

Let me ask you something: when was the last time you heard someone say, "Yeah, we're just throwing everything into S3 and calling it a data warehouse"? Never, right? Because that sounds ridiculous. Except—and this is the part that's quietly driving DBAs insane—it's exactly what's happening across the industry.

The cloud storage revolution has pulled off a neat trick: we've gone from files, to databases, to... back to files again. But smarter. Parquet + S3 is eating traditional OLAP databases alive, and the only people who won't admit it are the ones paying six-figure licensing fees to legacy vendors.

This isn't speculation. This is architectural inevitability. Let me show you why.

### The Architectural Shift: From Files to Databases to Files (But This Time With Finesse)

In the beginning, there were files. Glorious, simple files stored on disk or tape. Then applications got complicated, and we invented relational databases—ACID guarantees, transactional integrity, the whole nine yards. For decades, if you wanted structured data, you put it in a database. End of story.

But then big data arrived and broke everything. Suddenly, strict ACID semantics became optional. Scalability trumped consistency. Analytics workloads didn't need row-level transactions; they needed to scan petabytes of data in seconds. Enter columnar formats like Parquet—storing data by column instead of row, compressing like crazy, and making analytical queries scream.

Here's where it gets interesting: Parquet doesn't need a database. It's just files. Really smart files that you can dump into S3 and query directly. No intermediate database layer. No vendor lock-in. No license negotiations.

You see where this is going.

### Why Parquet + S3 Is Devouring Traditional OLAP Databases

Consider a typical data pipeline. You've got logs from your web app flooding in—millions of events per day. The old playbook says: ingest into a data warehouse (Snowflake, BigQuery, whatever), transform it, query it, pay through the nose for compute and storage.

The new playbook? Dump raw logs into S3. Process them with Spark into Parquet. Store Parquet back in S3. Query directly with Athena or Trino. Total warehouse cost: basically storage plus whatever compute you actually use. No idle cluster burning money at 3 AM.

This isn't theoretical. Companies are doing this at massive scale. The performance is comparable to dedicated OLAP systems for most analytical workloads. The cost difference? Orders of magnitude.

But wait—there's a catch. (There's always a catch.)

### Open Table Formats: Iceberg and Delta Lake as the Transaction Layer

Parquet files are great, but they're still just files. You can't update them transactionally. You can't time-travel through historical versions. Schema evolution is a nightmare. For years, this limitation kept object storage firmly in the "batch processing" box.

Then Apache Iceberg and Delta Lake showed up and changed the game. These open table formats sit on top of Parquet files in S3 and provide the transactional layer everyone thought you needed a database for. ACID properties? Check. Schema evolution without rewriting terabytes? Check. Time travel queries to see data as it existed yesterday? Also check.

Iceberg, out of Netflix and now an Apache project, gives you scalable metadata management and partition pruning that actually works. Delta Lake, from Databricks, adds real-time streaming integration and optimistic concurrency control. Both let you treat object storage like a proper database—except infinitely cheaper and more scalable.

This is the part that makes traditional database vendors nervous. Because once you have transactions + analytics on cheap object storage, what exactly are you paying them for?

### Performance Tradeoffs Nobody Talks About

Of course, I'd be lying if I said this was all upside. There are tradeoffs, and they're non-trivial.

**Cold storage kills you on latency.** Moving data to glacier-tier storage saves pennies but introduces retrieval delays that can ruin query performance. If your workload needs sub-second response times, you're paying for hot storage anyway.

**Network is the new disk bottleneck.** Traditional databases optimize for local SSD reads. Object stores introduce network hops on every query. For small datasets, this is fine. For petabyte-scale joins across regions? You better have a thick pipe and patience.

**Query optimization is still immature.** Tools like Iceberg are improving, but they're nowhere near the sophistication of a battle-tested OLAP engine. Complex joins, window functions, nested aggregations—these still perform better in systems purpose-built for them.

And here's the dirty secret: most people ignoring these tradeoffs haven't hit scale yet. When they do, they'll discover why Snowflake still exists.

### When This Approach Fails Catastrophically (And It Will)

Let's be clear: object storage isn't a panacea. There are workloads where this pattern falls apart spectacularly.

**High-frequency transactional updates?** Forget it. Object stores are append-heavy by design. If your use case involves constant row-level updates with immediate consistency requirements, you need a real OLTP database. S3 will laugh at you.

**Petabyte-scale metadata management?** Managing partition pruning, schema evolution, and compaction at massive scale is harder than it looks. Iceberg and Delta Lake help, but you're still on the hook for operational complexity that managed warehouses abstract away.

**Data locality and compute co-location?** Traditional warehouses optimize query plans based on where data physically lives. Object storage separates compute and storage entirely, which is great for elasticity but brutal for certain access patterns.

When these limitations hit, you'll know. Your queries will slow to a crawl. Metadata operations will time out. And you'll quietly start evaluating Snowflake pricing again.

### Conclusion

So here we are, watching object storage quietly become the de facto data warehouse for a huge swath of use cases—while everyone pretends they're just using it for "intermediate storage" or "data lakes."

The truth is messier. Parquet + S3 + Iceberg/Delta Lake democratized data warehousing. It made scalable analytics accessible without selling your soul to enterprise vendors. But it also introduced new failure modes, operational complexity, and performance ceilings that catch people off guard.

There's no silver bullet. Every architecture is a set of tradeoffs. The question isn't whether object storage will replace traditional warehouses—it's which workloads migrate first, and which stay put because the cost of being wrong is too high.

Choose wisely. Or don't. Either way, S3's getting bigger.

Pretty good. — O
