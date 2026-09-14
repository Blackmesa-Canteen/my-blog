---
title: MySQL - How does one SQL statement work in a Java app
slug: mysql-howdoesonesqlstatementworkinajavaapp
date: '2022-05-28T05:26:14.974Z'
categories:
- Notes
- Learning
- Utilities
tags:
- Development
- Notes
- Database
cover: ./image-1653721407459.png
original_permalink: /archives/mysql-howdoesonesqlstatementworkinajavaapp
---

# In the client

In the java application, there exists MySQL Driver (such as JDBC) that developers can use it easily. This Driver will provide developers java APIs that performs MySQL operations.

![image-1653720139339](./image-1653720139339.png)

We can also use multi-thread model to provide data services for multiple requests like this:
![image-1653720478936](./image-1653720478936.png)

MySQL Driver uses TCP/IP protocol to communicate with MySQL system. To guarantee performance of sockets, we'd better use **Connection Pool** to reuse connections. Some common database connection pools: Druid, C3P0 and DBCP.
![image-1653720432153](./image-1653720432153.png)

# In MySQL
## Handling connections
Inside the MySQL system, there also maintains a connection pool to hold multiple connections. MySQL also use different worker threads to perform database operations.
![image-1653720585960](./image-1653720585960.png)

## Handling SQL statements
Let's say there is a SQL statement:
```sql
SELECT stuName,age,sex FROM students WHERE id=1
```
As we all know, this SQL statement is a text. MySQL will parse this SQL text to some directives that MySQL knows.
![image-1653720854084](./image-1653720854084.png)

Then, MySQL will try to optimise query directives to be more effective (Not always though...)
![image-1653720973176](./image-1653720973176.png)

There are usually two aspects of the performance optimisation:
- I/O cost: File pages, load file from disk to memory, and so on. Usually depends on page size.
- CPU cost: Handle data that is loaded in memory. Usually it depends on the row amount of the data.

MySQL will caculate *I/O cost + CPU cost* to optimise the performance.

## Run SQL with Storage Engine
MySQL uses **Executer** to run SQL directives. It will call MySQL **Storage Engine** to perform operations:
![image-1653721407459](./image-1653721407459.png)

While performing operations, MySQL InnoDB engine will use **Buffer Pool** to buff the result of the first query.
![image-1653721556901](./image-1653721556901.png)

if the SQL is : 
```sql
UPDATE students SET stuName = '小强' WHERE id = 1
```
InnoDB will runs like this:
1. Check Buffer Pool to see whether the query result is existing or not;
2. If not, load from disk, then put it in Buffer Pool;
3. During updating, an Exclusive lock will be used.

What's more, MySQL will use **undo log** to support **Transaction**.
![image-1653721748073](./image-1653721748073.png)

Usually, MySQL update data in the Buffer Pool. To make the change durable, InnoDB uses **redo log** to support Durability:
![image-1653721851912](./image-1653721851912.png)

>redo log is unique to InnoDB storage Engine.

redo log need to be saved in the disk periodically:
![image-1653721951925](./image-1653721951925.png)

To sum up:
- If you want to update a SQL statement, MySQL (InnoDB) will look for the data in the BufferPool;
- if it doesn't find it, it will look on disk; if it finds it, it will load the data into the BufferPool.
-  After loading data into the BufferPool, Innodb performs an update in the Buffer Pool and the updated data is recorded in the redo log Buffer when MySQL commits a transaction, The redo log buffer is written to the redo log file;

Also, MySQL uses **bin log** to record the whole work.
![image-1653722223544](./image-1653722223544.png)
It is helpful for master-slave replication in MySQL database cluster.

# Summary

- Buffer Pool is a very important component of MySQL, because the operation of inserting, deleting and updating data is done in the Buffer Pool.
- Undo log records the status before data operations and is used to roll back transactions.
- Redo log records what data looks like after being manipulated (redo log is unique to Innodb storage engine) for data persistence;
- bin log records the entire operation, which is very important for cluster replication.

Description of the process from preparing to update a piece of data to committing a transaction:
- The executor first queries data from the MySQL Buffer Pool according to the execution plan. If it does not get result, it queries the database file. 
- When data is cached to the Buffer Pool, the undo log file is written
- Updates are performed in the Buffer Pool and are added to the redo log buffer
- Once completed, you can commit the transaction, which does three things at the same time:
- Flush redo log buffer data to redo log file
- Writes the operation record to the bin log file
- Log the bin log file name and the update location in the bin log to the redo log, and add the commit flag at the end of the redo log

Then, the entire update transaction is complete.

# Copyright 
https://www.pdai.tech/md/db/sql-mysql/sql-mysql-execute.html
