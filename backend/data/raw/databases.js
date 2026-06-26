const questions = [

// ============================================================
// SQL QUESTIONS (1-175)
// ============================================================

// --- SQL BASICS (1-30) ---
{
  id: 1, category: "SQL", subcategory: "Basics",
  question: "What is SQL and what is it used for?",
  answer: "SQL (Structured Query Language) is a standard language used to communicate with relational databases. It is used to create, read, update, and delete data, as well as manage database structure and access permissions.",
  explanation: "SQL is declarative — you describe WHAT you want, not HOW to get it. It is used in virtually every relational database system including MySQL, PostgreSQL, Oracle, SQL Server, and SQLite."
},
{
  id: 2, category: "SQL", subcategory: "Basics",
  question: "What are DDL, DML, DCL, and TCL in SQL?",
  answer: "DDL (Data Definition Language): CREATE, ALTER, DROP — defines schema. DML (Data Manipulation Language): SELECT, INSERT, UPDATE, DELETE — manipulates data. DCL (Data Control Language): GRANT, REVOKE — controls access. TCL (Transaction Control Language): COMMIT, ROLLBACK, SAVEPOINT — manages transactions.",
  explanation: "These four sublanguages cover every possible SQL operation. DDL changes the structure, DML changes the data, DCL controls who can do what, and TCL ensures data integrity during multi-step operations."
},
{
  id: 3, category: "SQL", subcategory: "Basics",
  question: "What is the difference between WHERE and HAVING?",
  answer: "WHERE filters rows BEFORE grouping (works on individual rows). HAVING filters groups AFTER the GROUP BY clause (works on aggregated results).",
  explanation: "Example: SELECT department, COUNT(*) FROM employees WHERE salary > 30000 GROUP BY department HAVING COUNT(*) > 5; — WHERE removes low-salary employees first, then HAVING removes small departments."
},
{
  id: 4, category: "SQL", subcategory: "Basics",
  question: "What is the order of execution of a SQL SELECT query?",
  answer: "FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET.",
  explanation: "Despite SELECT appearing first in syntax, it is processed near the end. This is why you cannot use a column alias defined in SELECT inside a WHERE clause — WHERE is processed before SELECT."
},
{
  id: 5, category: "SQL", subcategory: "Basics",
  question: "What is the difference between CHAR and VARCHAR?",
  answer: "CHAR is a fixed-length string type — it always uses the defined length and pads with spaces. VARCHAR is variable-length — it uses only as much space as the stored string plus a small overhead.",
  explanation: "CHAR(10) storing 'Hi' uses 10 bytes. VARCHAR(10) storing 'Hi' uses ~3 bytes. CHAR is slightly faster for fixed-size values like country codes; VARCHAR is better for variable-length data like names."
},
{
  id: 6, category: "SQL", subcategory: "Basics",
  question: "What is a NULL value in SQL and how is it handled?",
  answer: "NULL represents the absence of a value — it is not zero, not an empty string, and not false. NULL comparisons use IS NULL / IS NOT NULL because NULL = NULL evaluates to UNKNOWN, not TRUE.",
  explanation: "NULL follows three-valued logic (TRUE, FALSE, UNKNOWN). Any arithmetic operation with NULL returns NULL. Use COALESCE(column, default_value) or NULLIF() to handle NULLs gracefully."
},
{
  id: 7, category: "SQL", subcategory: "Basics",
  question: "What is the difference between TRUNCATE, DELETE, and DROP?",
  answer: "DELETE removes specific rows (can use WHERE), is logged, and can be rolled back. TRUNCATE removes all rows faster, minimal logging, typically cannot be rolled back. DROP removes the entire table structure and data permanently.",
  explanation: "DELETE fires triggers; TRUNCATE does not. TRUNCATE resets identity/auto-increment counters; DELETE does not. DROP removes schema objects entirely."
},
{
  id: 8, category: "SQL", subcategory: "Basics",
  question: "What is a subquery? Give an example.",
  answer: "A subquery is a query nested inside another query. Example: SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);",
  explanation: "Subqueries can appear in SELECT, FROM, WHERE, and HAVING clauses. They can be correlated (reference outer query) or non-correlated (independent). Correlated subqueries execute once per row of the outer query."
},
{
  id: 9, category: "SQL", subcategory: "Basics",
  question: "Explain the difference between UNION and UNION ALL.",
  answer: "UNION combines results of two queries and removes duplicate rows. UNION ALL combines results and keeps all duplicates, making it faster since no deduplication step is needed.",
  explanation: "Both require the same number of columns with compatible data types. Use UNION ALL when you know there are no duplicates or when duplicates are acceptable, as it avoids the costly sort/hash operation."
},
{
  id: 10, category: "SQL", subcategory: "Basics",
  question: "What is a CTE (Common Table Expression)?",
  answer: "A CTE is a named temporary result set defined using WITH clause, scoped to the query. Example: WITH dept_avg AS (SELECT dept_id, AVG(salary) AS avg_sal FROM employees GROUP BY dept_id) SELECT * FROM dept_avg WHERE avg_sal > 50000;",
  explanation: "CTEs improve readability by breaking complex queries into named steps. Recursive CTEs (WITH RECURSIVE) can traverse hierarchical data like org charts and trees."
},
{
  id: 11, category: "SQL", subcategory: "Basics",
  question: "What is a correlated subquery?",
  answer: "A correlated subquery references a column from the outer query and is re-executed for every row of the outer query. Example: SELECT e1.name FROM employees e1 WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e1.dept_id);",
  explanation: "Correlated subqueries are powerful but can be slow because they execute once per row. They are often replaceable with JOINs or window functions for better performance."
},
{
  id: 12, category: "SQL", subcategory: "Basics",
  question: "What does DISTINCT do in SQL?",
  answer: "DISTINCT removes duplicate rows from the result set. Example: SELECT DISTINCT country FROM customers; returns each country only once.",
  explanation: "DISTINCT operates on the entire selected row, not just one column. SELECT DISTINCT first_name, last_name removes rows where both names are identical. It has a performance cost due to sorting or hashing."
},
{
  id: 13, category: "SQL", subcategory: "Basics",
  question: "What is a stored procedure?",
  answer: "A stored procedure is a precompiled collection of SQL statements stored in the database and executed as a unit. They accept input/output parameters and can contain control flow logic (IF, LOOP, etc.).",
  explanation: "Benefits: reusability, security (grant EXECUTE without table access), reduced network traffic, and performance (precompiled). Downside: harder to version-control and test than application code."
},
{
  id: 14, category: "SQL", subcategory: "Basics",
  question: "What is a view in SQL?",
  answer: "A view is a virtual table based on a SELECT query. It does not store data itself (unless it is a materialized view) but provides a reusable, named query.",
  explanation: "Views simplify complex queries, provide a security layer (expose only certain columns/rows), and encapsulate business logic. Updatable views allow DML if they meet certain criteria."
},
{
  id: 15, category: "SQL", subcategory: "Basics",
  question: "What is the difference between a primary key and a unique key?",
  answer: "A primary key uniquely identifies each row, does not allow NULLs, and there can only be one per table. A unique key also enforces uniqueness but allows one NULL value (in most databases) and multiple unique keys can exist per table.",
  explanation: "Primary keys are the main row identifier and automatically create a clustered index (in some databases). Unique keys create non-clustered indexes and are used to enforce alternate candidate keys."
},
{
  id: 16, category: "SQL", subcategory: "Basics",
  question: "What is a foreign key?",
  answer: "A foreign key is a column (or group of columns) in one table that references the primary key of another table, enforcing referential integrity.",
  explanation: "Foreign keys prevent orphan records. They support actions like ON DELETE CASCADE (automatically delete child rows) or ON DELETE SET NULL when parent rows are deleted."
},
{
  id: 17, category: "SQL", subcategory: "Basics",
  question: "What is normalization? Explain 1NF, 2NF, and 3NF.",
  answer: "Normalization organizes tables to reduce data redundancy. 1NF: Each column has atomic values, no repeating groups. 2NF: All non-key columns fully depend on the entire primary key (removes partial dependencies). 3NF: No non-key column depends on another non-key column (removes transitive dependencies).",
  explanation: "Higher normal forms reduce anomalies during insert/update/delete. However, heavily normalized schemas require more JOINs. Denormalization is sometimes used intentionally for read performance."
},
{
  id: 18, category: "SQL", subcategory: "Basics",
  question: "What is denormalization?",
  answer: "Denormalization intentionally introduces redundancy by merging tables or adding duplicate columns to improve read performance at the cost of write complexity and potential data inconsistency.",
  explanation: "Common in data warehouses and reporting databases where complex JOIN-heavy queries are too slow. Materialized views and summary tables are forms of controlled denormalization."
},
{
  id: 19, category: "SQL", subcategory: "Basics",
  question: "What is the CASE expression in SQL?",
  answer: "CASE provides conditional logic in SQL. Example: SELECT name, CASE WHEN salary > 80000 THEN 'High' WHEN salary > 50000 THEN 'Mid' ELSE 'Low' END AS pay_grade FROM employees;",
  explanation: "CASE can be used anywhere an expression is allowed — SELECT, WHERE, ORDER BY, GROUP BY. It is SQL's equivalent of if-else and is evaluated row by row."
},
{
  id: 20, category: "SQL", subcategory: "Basics",
  question: "What is COALESCE()?",
  answer: "COALESCE returns the first non-NULL value from a list of expressions. Example: SELECT COALESCE(phone, email, 'No contact') FROM customers;",
  explanation: "COALESCE is short-circuit evaluated — it stops at the first non-NULL. It is equivalent to a series of CASE WHEN IS NOT NULL THEN checks and is ANSI-standard."
},
{
  id: 21, category: "SQL", subcategory: "Basics",
  question: "What is the NULLIF() function?",
  answer: "NULLIF(a, b) returns NULL if a equals b, otherwise returns a. It is useful to avoid division-by-zero: salary / NULLIF(hours_worked, 0).",
  explanation: "NULLIF is the inverse of COALESCE in spirit. If a = b the result is NULL, preventing errors. Commonly used to suppress unwanted values like zero denominators."
},
{
  id: 22, category: "SQL", subcategory: "Basics",
  question: "What are aggregate functions in SQL?",
  answer: "Aggregate functions compute a single value from a set of rows: COUNT(), SUM(), AVG(), MIN(), MAX(). They are used with GROUP BY to aggregate per group.",
  explanation: "COUNT(*) counts all rows including NULLs; COUNT(column) counts non-NULL values. AVG ignores NULLs. All aggregates ignore NULLs except COUNT(*)."
},
{
  id: 23, category: "SQL", subcategory: "Basics",
  question: "What is the LIKE operator? How do wildcards work?",
  answer: "LIKE is used for pattern matching. % matches any sequence of characters (including zero). _ matches exactly one character. Example: SELECT * FROM products WHERE name LIKE 'App%'; matches Apple, Application, etc.",
  explanation: "LIKE is case-sensitive in some databases (PostgreSQL with LIKE vs ILIKE) and case-insensitive in others (MySQL). For more complex patterns, use regular expression operators (SIMILAR TO, ~, REGEXP)."
},
{
  id: 24, category: "SQL", subcategory: "Basics",
  question: "What is the IN operator?",
  answer: "IN checks if a value matches any value in a list or subquery. Example: SELECT * FROM orders WHERE status IN ('pending', 'processing', 'shipped');",
  explanation: "IN with a subquery is equivalent to = ANY. NOT IN with a subquery containing NULLs always returns FALSE, which is a common bug — use NOT EXISTS instead."
},
{
  id: 25, category: "SQL", subcategory: "Basics",
  question: "What is the BETWEEN operator?",
  answer: "BETWEEN tests whether a value falls within an inclusive range. Example: SELECT * FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31';",
  explanation: "BETWEEN is inclusive on both ends — equivalent to >= lower AND <= upper. Be careful with dates: BETWEEN '2024-01-01' AND '2024-12-31' misses timestamps on Dec 31 after midnight if using DATETIME types."
},
{
  id: 26, category: "SQL", subcategory: "Basics",
  question: "What is an alias in SQL?",
  answer: "An alias is a temporary name assigned to a table or column using AS. Example: SELECT e.first_name AS fname, d.name AS dept FROM employees e JOIN departments d ON e.dept_id = d.id;",
  explanation: "Column aliases are available in ORDER BY but not in WHERE (because WHERE is processed before SELECT). Table aliases are useful for self-joins and for shortening lengthy table names."
},
{
  id: 27, category: "SQL", subcategory: "Basics",
  question: "What is the difference between CROSS JOIN and other joins?",
  answer: "CROSS JOIN produces the Cartesian product — every row of table A paired with every row of table B. A table with 100 rows crossed with one of 50 rows produces 5000 rows. No ON clause is used.",
  explanation: "CROSS JOIN is rarely used accidentally; common uses include generating combinations or test data. Other joins (INNER, LEFT, RIGHT) filter the Cartesian product using an ON condition."
},
{
  id: 28, category: "SQL", subcategory: "Basics",
  question: "What is a self-join?",
  answer: "A self-join joins a table with itself using different aliases. Example: SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;",
  explanation: "Self-joins are used for hierarchical data (org charts, bill of materials) or comparing rows within the same table (find employees with the same salary, etc.)."
},
{
  id: 29, category: "SQL", subcategory: "Basics",
  question: "What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?",
  answer: "INNER JOIN: only matching rows. LEFT JOIN: all rows from left table, NULLs for non-matching right. RIGHT JOIN: all rows from right table, NULLs for non-matching left. FULL OUTER JOIN: all rows from both tables, NULLs where no match.",
  explanation: "LEFT JOIN is the most common after INNER JOIN. FULL OUTER JOIN is not supported in MySQL natively (simulate with UNION of LEFT and RIGHT JOINs). RIGHT JOIN is rarely used — it is equivalent to reversing the table order and using LEFT JOIN."
},
{
  id: 30, category: "SQL", subcategory: "Basics",
  question: "What is an index and why is it important?",
  answer: "An index is a separate data structure (usually a B-tree) that provides fast lookup of rows based on column values without scanning the entire table. It speeds up SELECT but adds overhead to INSERT, UPDATE, DELETE.",
  explanation: "Without an index, a query scans every row (full table scan). With an index, the database can jump directly to relevant rows. Indexes trade write speed for read speed and consume additional storage."
},

// --- SQL JOINS & ADVANCED QUERIES (31-60) ---
{
  id: 31, category: "SQL", subcategory: "Joins & Advanced",
  question: "What are window functions in SQL?",
  answer: "Window functions perform calculations across a set of rows related to the current row without collapsing them into a single output row. They use the OVER() clause. Examples: ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), SUM() OVER(), AVG() OVER().",
  explanation: "Unlike GROUP BY aggregates that collapse rows, window functions retain all rows. Example: SELECT name, salary, AVG(salary) OVER(PARTITION BY dept_id) AS dept_avg FROM employees;"
},
{
  id: 32, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()?",
  answer: "ROW_NUMBER(): assigns a unique sequential integer regardless of ties (1,2,3,4). RANK(): tied rows get the same rank, next rank skips (1,2,2,4). DENSE_RANK(): tied rows get same rank, next rank does not skip (1,2,2,3).",
  explanation: "Use ROW_NUMBER for pagination or deduplication. Use RANK or DENSE_RANK for competitive rankings. DENSE_RANK is used when gaps in rankings are undesirable."
},
{
  id: 33, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the LAG() and LEAD() function?",
  answer: "LAG(col, n) accesses a value n rows before the current row. LEAD(col, n) accesses a value n rows after. Both operate within the window defined by OVER(PARTITION BY ... ORDER BY ...).",
  explanation: "Example: SELECT date, revenue, LAG(revenue,1) OVER(ORDER BY date) AS prev_day, revenue - LAG(revenue,1) OVER(ORDER BY date) AS daily_change FROM sales; — useful for day-over-day comparisons."
},
{
  id: 34, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is PARTITION BY in window functions?",
  answer: "PARTITION BY divides the result set into partitions (groups) within which the window function operates independently — similar to GROUP BY but without collapsing rows. Each partition is processed separately.",
  explanation: "Example: RANK() OVER(PARTITION BY dept_id ORDER BY salary DESC) ranks employees within each department independently, so each department can have its own rank 1."
},
{
  id: 35, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a recursive CTE and when would you use it?",
  answer: "A recursive CTE references itself, consisting of an anchor (base) query and a recursive member joined with UNION ALL. Used for hierarchical or tree-structured data like org charts, folder hierarchies, bill of materials.",
  explanation: "Example: WITH RECURSIVE org AS (SELECT id, name, manager_id, 0 AS level FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, org.level+1 FROM employees e JOIN org ON e.manager_id = org.id) SELECT * FROM org;"
},
{
  id: 36, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a materialized view?",
  answer: "A materialized view stores the result of a query physically on disk, unlike a regular view which is just a saved query. It must be refreshed (manually or on schedule) to stay current.",
  explanation: "Materialized views dramatically speed up complex aggregation queries. PostgreSQL supports REFRESH MATERIALIZED VIEW. They are a form of caching at the database level, trading storage and freshness for query speed."
},
{
  id: 37, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the EXISTS operator?",
  answer: "EXISTS returns TRUE if a subquery returns at least one row. Example: SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);",
  explanation: "EXISTS is more efficient than IN for large subqueries because it short-circuits at the first matching row. EXISTS with NOT avoids the NULL trap that NOT IN suffers from."
},
{
  id: 38, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a PIVOT operation in SQL?",
  answer: "PIVOT transforms row values into columns. Some databases support a PIVOT keyword (SQL Server, Oracle). In standard SQL, it is done using conditional aggregation: SELECT year, SUM(CASE WHEN quarter='Q1' THEN sales END) AS Q1, ... FROM sales GROUP BY year;",
  explanation: "Pivoting is useful for reporting — converting narrow (key-value) format to wide format. UNPIVOT does the reverse: converts column headers into row values."
},
{
  id: 39, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the NTILE() window function?",
  answer: "NTILE(n) divides ordered rows into n roughly equal buckets and assigns each row a bucket number. Example: NTILE(4) OVER(ORDER BY salary) assigns rows to quartiles 1-4.",
  explanation: "NTILE is useful for percentile analysis — finding which quartile, quintile, or decile a value belongs to. If rows don't divide evenly, earlier buckets get one extra row."
},
{
  id: 40, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the difference between a clustered and non-clustered index?",
  answer: "A clustered index determines the physical order of data in the table — there can be only one per table. A non-clustered index is a separate structure that points back to the actual data rows — multiple are allowed.",
  explanation: "The primary key is often the clustered index. Non-clustered indexes are faster for lookups but require an extra step (key lookup or bookmark lookup) to retrieve non-index columns."
},
{
  id: 41, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a covering index?",
  answer: "A covering index includes all columns needed by a query — both for the WHERE clause and the SELECT list — eliminating the need to access the table's main data pages.",
  explanation: "CREATE INDEX idx ON orders(customer_id) INCLUDE (order_date, total); — if a query selects only customer_id, order_date, total, the index alone satisfies the query. This is an index-only scan."
},
{
  id: 42, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a composite index and how does column order matter?",
  answer: "A composite (multi-column) index indexes multiple columns together. Column order matters: an index on (a, b, c) can be used for queries on a, on (a, b), or on (a, b, c), but NOT for queries on b alone.",
  explanation: "The leftmost prefix rule means you must start from the leading column. Place the most selective and most queried column first. Range conditions on a column prevent subsequent columns from being used efficiently."
},
{
  id: 43, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a full-text index and when do you use it?",
  answer: "A full-text index is specialized for text search — it tokenizes words and allows queries like MATCH...AGAINST (MySQL) or to_tsvector/to_tsquery (PostgreSQL) for natural language and keyword search.",
  explanation: "Regular LIKE '%keyword%' cannot use a B-tree index. Full-text indexes support stemming, stop words, relevance ranking, and phrase searching. Use them for search features in applications."
},
{
  id: 44, category: "SQL", subcategory: "Joins & Advanced",
  question: "What are ACID properties in database transactions?",
  answer: "Atomicity: a transaction is all-or-nothing. Consistency: a transaction brings the DB from one valid state to another. Isolation: concurrent transactions don't interfere. Durability: committed transactions survive crashes.",
  explanation: "ACID is guaranteed by transaction logs, locking mechanisms, and write-ahead logs (WAL). NoSQL databases often relax ACID for scalability, offering eventual consistency instead."
},
{
  id: 45, category: "SQL", subcategory: "Joins & Advanced",
  question: "What are isolation levels in SQL?",
  answer: "READ UNCOMMITTED: can read dirty (uncommitted) data. READ COMMITTED: only sees committed data. REPEATABLE READ: same query returns same rows within a transaction. SERIALIZABLE: full isolation — transactions appear to execute sequentially.",
  explanation: "Higher isolation prevents more anomalies (dirty reads, non-repeatable reads, phantom reads) but reduces concurrency through more locking or row versioning. Default in most RDBMS is READ COMMITTED."
},
{
  id: 46, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a deadlock in SQL?",
  answer: "A deadlock occurs when two transactions each hold a lock the other needs, causing a circular wait. Neither can proceed. The database detects this and aborts one transaction (the victim).",
  explanation: "Prevention: always acquire locks in the same order, keep transactions short, use lower isolation levels where safe. Detection is automatic in most databases via deadlock detection algorithms."
},
{
  id: 47, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is optimistic vs pessimistic locking?",
  answer: "Pessimistic locking acquires locks before reading/writing to prevent conflicts. Optimistic locking assumes conflicts are rare — reads without locks, then checks at commit time that the data hasn't changed (typically via version columns).",
  explanation: "Optimistic locking is better for read-heavy workloads with infrequent conflicts. Pessimistic locking is safer for write-heavy scenarios. Most ORMs support optimistic locking with a version/timestamp column."
},
{
  id: 48, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is an execution plan (query plan)?",
  answer: "An execution plan is the database engine's step-by-step strategy for executing a query — showing which indexes are used, join algorithms, sort operations, and estimated vs actual row counts.",
  explanation: "Use EXPLAIN or EXPLAIN ANALYZE (PostgreSQL) / EXPLAIN (MySQL) to view plans. Look for full table scans on large tables, expensive sorts, and nested loop joins on large datasets as areas to optimize."
},
{
  id: 49, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the difference between a hash join, merge join, and nested loop join?",
  answer: "Nested Loop: for each row in table A, scan table B — O(n*m). Best for small tables or indexed access. Hash Join: build a hash table from the smaller table, probe with larger — good for large unsorted data. Merge Join: requires both inputs sorted on join key, efficient for pre-sorted data.",
  explanation: "Query optimizers choose the join algorithm based on statistics. Nested loops suit indexed small-to-large joins. Hash joins are used for large unindexed equijoins. Merge joins are efficient when data is already ordered."
},
{
  id: 50, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the N+1 query problem?",
  answer: "The N+1 problem occurs when you execute 1 query to fetch N parent records, then N separate queries to fetch related child records — total N+1 queries instead of 1 JOIN.",
  explanation: "Common in ORMs. Fix with eager loading (JOIN in the initial query), batch loading, or using IN clauses to fetch all children at once. This is a major performance antipattern in web applications."
},
{
  id: 51, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is table partitioning?",
  answer: "Partitioning divides a large table into smaller physical pieces (partitions) based on a column's value range, list, or hash. Queries on specific partitions scan only relevant partitions (partition pruning).",
  explanation: "Range partitioning by date is common for time-series data. Each partition is a separate storage segment. Partitioning improves performance and simplifies archiving (drop old partitions instead of DELETE)."
},
{
  id: 52, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is sharding in databases?",
  answer: "Sharding horizontally splits data across multiple database servers (shards), each holding a subset of rows. This distributes load and enables horizontal scaling beyond a single machine's capacity.",
  explanation: "Sharding introduces complexity: cross-shard queries, rebalancing, and distributed transactions. Common sharding keys: user_id, region, hash. Supported natively in some databases and via application logic in others."
},
{
  id: 53, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the difference between OLTP and OLAP?",
  answer: "OLTP (Online Transaction Processing): handles many short, simple transactions (insert/update/select single rows). Optimized for write speed. OLAP (Online Analytical Processing): handles complex analytical queries over large datasets. Optimized for read speed.",
  explanation: "OLTP: banking, e-commerce orders. OLAP: reporting dashboards, data warehouses. They have opposing optimization goals — OLTP needs fast individual row access; OLAP needs fast full-scan aggregations."
},
{
  id: 54, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a trigger in SQL?",
  answer: "A trigger is a stored procedure that automatically executes in response to specific events (INSERT, UPDATE, DELETE) on a table, either BEFORE or AFTER the event.",
  explanation: "Uses: audit logging, enforcing complex constraints, automatically updating derived columns. Triggers can cause hidden side effects and are hard to debug — use sparingly. They fire per row (FOR EACH ROW) or per statement."
},
{
  id: 55, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the difference between a sequence and an identity column?",
  answer: "A sequence is a standalone database object that generates unique numbers independently of any table. An identity column (or SERIAL/AUTO_INCREMENT) is a column attribute that automatically generates sequential values on insert.",
  explanation: "Sequences are more flexible — they can be shared across tables, advance in different increments, and reset on demand. Identity columns are simpler for single-table auto-increment primary keys."
},
{
  id: 56, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the MERGE statement (UPSERT)?",
  answer: "MERGE (ANSI standard) or UPSERT performs an INSERT if a row doesn't exist, or an UPDATE if it does, in a single atomic statement. PostgreSQL uses INSERT...ON CONFLICT DO UPDATE; MySQL uses INSERT...ON DUPLICATE KEY UPDATE.",
  explanation: "Without MERGE, you'd need a check-then-insert pattern which has a race condition in concurrent environments. MERGE/UPSERT is atomic and eliminates the race condition."
},
{
  id: 57, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is a surrogate key vs a natural key?",
  answer: "A natural key is a column with real-world meaning (e.g., email, SSN, ISBN). A surrogate key is a system-generated identifier with no business meaning (e.g., auto-increment integer, UUID).",
  explanation: "Surrogate keys are stable (don't change if business data changes), smaller for foreign key references, and simpler for indexing. Natural keys can simplify queries but may change (e.g., email changes, mergers)."
},
{
  id: 58, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is database replication?",
  answer: "Replication copies data from one database server (primary/master) to one or more replicas (secondary/slave). It provides read scaling, high availability, and disaster recovery.",
  explanation: "Types: synchronous (replica confirms write before primary acknowledges) vs asynchronous (primary doesn't wait). Synchronous is safer but slower. Read replicas offload reporting queries from the primary."
},
{
  id: 59, category: "SQL", subcategory: "Joins & Advanced",
  question: "What are common SQL performance optimization techniques?",
  answer: "1) Create appropriate indexes. 2) Avoid SELECT *. 3) Use query plans to identify bottlenecks. 4) Avoid functions on indexed columns in WHERE. 5) Limit result sets. 6) Use JOINs instead of correlated subqueries. 7) Partition large tables. 8) Use connection pooling.",
  explanation: "Queries like WHERE YEAR(created_at) = 2024 cannot use an index on created_at. Rewrite as WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'. Always test with EXPLAIN before deploying."
},
{
  id: 60, category: "SQL", subcategory: "Joins & Advanced",
  question: "What is the difference between a SAVEPOINT and a ROLLBACK in transactions?",
  answer: "ROLLBACK undoes an entire transaction to its beginning. SAVEPOINT creates a named checkpoint within a transaction, allowing partial rollback to that point with ROLLBACK TO SAVEPOINT name.",
  explanation: "SAVEPOINTs allow complex multi-step transactions to recover from errors in a sub-step without losing all prior work. Example: SAVEPOINT before_update; ...; ROLLBACK TO before_update; — undoes only changes after the savepoint."
},

// --- SQL FUNCTIONS & OPERATORS (61-90) ---
{
  id: 61, category: "SQL", subcategory: "Functions & Operators",
  question: "What string functions are commonly available in SQL?",
  answer: "UPPER(), LOWER(), LENGTH()/LEN(), SUBSTRING()/SUBSTR(), CONCAT(), TRIM()/LTRIM()/RTRIM(), REPLACE(), INSTR()/CHARINDEX(), LEFT(), RIGHT(), LPAD(), RPAD().",
  explanation: "Function names differ slightly across databases. PostgreSQL uses LENGTH and POSITION; MySQL uses CHAR_LENGTH for UTF-8 aware length. Always test string functions with multi-byte character sets."
},
{
  id: 62, category: "SQL", subcategory: "Functions & Operators",
  question: "What date/time functions are commonly available in SQL?",
  answer: "NOW()/CURRENT_TIMESTAMP, CURRENT_DATE, CURRENT_TIME, DATE_ADD/DATEADD, DATEDIFF, EXTRACT()/DATE_PART(), TO_DATE(), DATE_FORMAT()/TO_CHAR(), AGE() (PostgreSQL).",
  explanation: "Date handling varies significantly across databases. Always store dates in UTC. Use TIMESTAMPTZ (PostgreSQL) for timezone-aware storage. Be careful with date truncation vs comparison — TRUNC(date) to day before comparing."
},
{
  id: 63, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the CAST and CONVERT function?",
  answer: "CAST converts a value from one data type to another using ANSI SQL syntax: CAST(salary AS FLOAT). CONVERT is SQL Server / MySQL specific: CONVERT(salary, FLOAT). PostgreSQL also supports :: shorthand: salary::float.",
  explanation: "Type casting is needed when doing arithmetic between different types (e.g., integer division), formatting output, or when comparing columns of different types. Implicit casting can hide bugs; explicit casting is clearer."
},
{
  id: 64, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the GROUP_CONCAT() / STRING_AGG() function?",
  answer: "GROUP_CONCAT (MySQL) or STRING_AGG (PostgreSQL/SQL Server) aggregates multiple row values into a single comma-separated (or custom-delimited) string. Example: SELECT dept_id, STRING_AGG(name, ', ') FROM employees GROUP BY dept_id;",
  explanation: "Useful for displaying comma-separated lists in reports. STRING_AGG supports ORDER BY within the aggregation. The result can exceed max string length on very large datasets."
},
{
  id: 65, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the FIRST_VALUE() and LAST_VALUE() window function?",
  answer: "FIRST_VALUE(col) returns the first value in the window frame. LAST_VALUE(col) returns the last value. They are used with OVER(PARTITION BY ... ORDER BY ... ROWS/RANGE BETWEEN ...).",
  explanation: "LAST_VALUE often surprises beginners — with the default frame (RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), it returns the current row value, not the partition's last. Use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING for the true last value."
},
{
  id: 66, category: "SQL", subcategory: "Functions & Operators",
  question: "What is FLOOR(), CEIL(), and ROUND() in SQL?",
  answer: "FLOOR() rounds down to the nearest integer. CEIL()/CEILING() rounds up. ROUND(n, d) rounds to d decimal places. Example: ROUND(3.456, 2) = 3.46; FLOOR(3.9) = 3; CEIL(3.1) = 4.",
  explanation: "These functions are important in financial calculations. Note that ROUND uses banker's rounding (round half to even) in some databases (PostgreSQL), while others round half up. Verify behavior before using in financial contexts."
},
{
  id: 67, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the ABS() and MOD() function?",
  answer: "ABS(n) returns the absolute (non-negative) value of n. MOD(a, b) or the % operator returns the remainder of a divided by b. Example: ABS(-5) = 5; MOD(17, 5) = 2.",
  explanation: "MOD is useful for cyclic operations (e.g., round-robin assignment), identifying even/odd rows (id % 2 = 0), and date calculations. Note MOD behavior with negative numbers differs across databases."
},
{
  id: 68, category: "SQL", subcategory: "Functions & Operators",
  question: "What is REGEXP / SIMILAR TO in SQL?",
  answer: "REGEXP (MySQL) and ~ (PostgreSQL) match strings against a regular expression pattern. PostgreSQL also has SIMILAR TO which uses SQL-standard regex syntax (less powerful than full POSIX regex).",
  explanation: "Example (PostgreSQL): SELECT * FROM products WHERE name ~ '^[A-Z].*[0-9]$'; — names starting with uppercase and ending with a digit. REGEXP operations are generally slower than LIKE due to regex complexity."
},
{
  id: 69, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the difference between PERCENT_RANK() and CUME_DIST()?",
  answer: "PERCENT_RANK() = (rank - 1) / (total_rows - 1) — the relative rank as a percentage (0 to 1). CUME_DIST() = rows_with_value_lte / total_rows — the cumulative distribution (fraction of rows at or below current value, never 0).",
  explanation: "Used for percentile analysis. PERCENT_RANK of the first row is always 0; CUME_DIST is always > 0. They are useful for identifying where a value falls in a distribution."
},
{
  id: 70, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the SUM() OVER() running total pattern?",
  answer: "SUM(amount) OVER(ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) computes a running total up to the current row. Without the frame clause, it defaults to RANGE UNBOUNDED PRECEDING which can give ties the same total.",
  explanation: "Running totals are a classic business requirement. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is explicit about including exactly the rows up to and including the current one."
},
{
  id: 71, category: "SQL", subcategory: "Functions & Operators",
  question: "What is FORMAT() or TO_CHAR() used for?",
  answer: "TO_CHAR (PostgreSQL, Oracle) and FORMAT (MySQL, SQL Server) convert numbers and dates to formatted strings. Example: TO_CHAR(1234567.89, '9,999,999.99') → '1,234,567.89'; TO_CHAR(NOW(), 'YYYY-MM-DD').",
  explanation: "Formatting is generally better done in the application layer, but TO_CHAR is useful in reports generated directly from SQL. It is important for exporting data in specific formats."
},
{
  id: 72, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the GREATEST() and LEAST() function?",
  answer: "GREATEST(a, b, c, ...) returns the largest value from a list. LEAST() returns the smallest. They work across multiple columns/expressions. Example: GREATEST(price, min_price, 0) ensures a non-negative floor.",
  explanation: "NULL handling: if any argument is NULL, most databases return NULL. Use COALESCE to handle NULLs before passing to GREATEST/LEAST. These functions simplify conditional CASE expressions."
},
{
  id: 73, category: "SQL", subcategory: "Functions & Operators",
  question: "What is GENERATE_SERIES in PostgreSQL?",
  answer: "GENERATE_SERIES(start, stop, step) generates a set of values. Example: SELECT * FROM GENERATE_SERIES('2024-01-01'::date, '2024-12-31'::date, '1 month'::interval) AS month;",
  explanation: "Useful for generating date sequences for reporting gaps, creating test data, or filling missing date rows in time-series analysis. Returns a set (table-like), so it can be used in FROM and JOIN clauses."
},
{
  id: 74, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the UNNEST() function?",
  answer: "UNNEST() (PostgreSQL) expands an array into a set of rows. Example: SELECT UNNEST(ARRAY['a','b','c']); returns three rows: a, b, c.",
  explanation: "Useful for working with PostgreSQL arrays and JSON arrays. Can be combined with WITH ORDINALITY to get the array index: SELECT val, idx FROM UNNEST(array_col) WITH ORDINALITY AS t(val, idx);"
},
{
  id: 75, category: "SQL", subcategory: "Functions & Operators",
  question: "What is DECODE() vs CASE?",
  answer: "DECODE() is an Oracle-specific function equivalent to a simple CASE expression: DECODE(col, val1, result1, val2, result2, default). CASE is ANSI SQL, more portable, and supports complex conditions.",
  explanation: "DECODE is simpler for equality checks but limited. CASE handles ranges, IS NULL, and complex boolean logic. Always prefer CASE for portability across database systems."
},
{
  id: 76, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the difference between COUNT(*), COUNT(1), and COUNT(column)?",
  answer: "COUNT(*) counts all rows including those with NULLs. COUNT(1) also counts all rows (1 is a constant, never NULL). COUNT(column) counts only rows where that column is NOT NULL.",
  explanation: "COUNT(*) and COUNT(1) are functionally identical and equally fast in modern optimizers. COUNT(column) is useful for counting non-null presence. COUNT(DISTINCT column) counts unique non-null values."
},
{
  id: 77, category: "SQL", subcategory: "Functions & Operators",
  question: "What is LISTAGG() / ARRAY_AGG()?",
  answer: "ARRAY_AGG (PostgreSQL) aggregates values into an array. LISTAGG (Oracle/SQL Server) aggregates into a delimited string. Example: SELECT dept_id, ARRAY_AGG(name ORDER BY name) FROM employees GROUP BY dept_id;",
  explanation: "ARRAY_AGG is useful when you need to pass aggregated results back as an array to the application. It supports ordering within the aggregation and pairs well with UNNEST for further processing."
},
{
  id: 78, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the PIVOT and UNPIVOT operation?",
  answer: "PIVOT rotates row values into column headers (wide format). UNPIVOT does the reverse (long format). Example with conditional aggregation (standard SQL): SELECT year, MAX(CASE WHEN month=1 THEN sales END) AS Jan FROM data GROUP BY year;",
  explanation: "Pivoting is fundamentally a reshape operation. Most reporting tools (Excel, Power BI) handle pivoting better than SQL. In SQL it is static for a fixed number of known values; dynamic pivot requires dynamic SQL."
},
{
  id: 79, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the JSON_EXTRACT() / ->> operator in SQL?",
  answer: "JSON_EXTRACT() (MySQL) and ->> (PostgreSQL) extract values from a JSON column. Example (PostgreSQL): SELECT data->>'name' FROM users WHERE data->>'status' = 'active'; where data is a JSONB column.",
  explanation: "Modern databases have extensive JSON support. PostgreSQL's JSONB stores JSON in binary format allowing indexing. MySQL has JSON_EXTRACT, JSON_SET, JSON_ARRAY, etc. JSON operators allow querying semi-structured data."
},
{
  id: 80, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the EXTRACT() function?",
  answer: "EXTRACT(part FROM date) retrieves a specific component from a date/time value. Parts include: YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, DOW (day of week), DOY (day of year), WEEK, QUARTER.",
  explanation: "Example: EXTRACT(YEAR FROM order_date) = 2024 filters by year. Note: using EXTRACT in WHERE prevents index use. Instead, use range conditions: order_date >= '2024-01-01' AND order_date < '2025-01-01'."
},
{
  id: 81, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the difference between NOW(), CURRENT_TIMESTAMP, and GETDATE()?",
  answer: "NOW() (MySQL/PostgreSQL) and CURRENT_TIMESTAMP (ANSI SQL) return the current date and time with timezone offset. GETDATE() is SQL Server specific. SYSDATE() (Oracle) returns server time. They are functionally similar but database-specific.",
  explanation: "CURRENT_TIMESTAMP is ANSI standard and portable. In PostgreSQL, NOW() returns transaction start time; clock_timestamp() returns current actual time within a transaction."
},
{
  id: 82, category: "SQL", subcategory: "Functions & Operators",
  question: "What is INTERVAL in date arithmetic?",
  answer: "INTERVAL allows adding or subtracting time periods from dates. Example: NOW() + INTERVAL '7 days', NOW() - INTERVAL '1 month', created_at + INTERVAL '30 days' > NOW().",
  explanation: "INTERVAL syntax varies: PostgreSQL uses INTERVAL '1 month'; MySQL uses DATE_ADD(date, INTERVAL 1 MONTH); SQL Server uses DATEADD(month, 1, date). Use intervals instead of multiplying seconds for readability."
},
{
  id: 83, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the difference between = and LIKE in SQL?",
  answer: "= performs exact string equality comparison. LIKE performs pattern matching using wildcards (% and _). = is faster and simpler. Use LIKE only when wildcards are needed; = is not pattern-matched.",
  explanation: "LIKE 'apple' (no wildcards) is functionally equivalent to = 'apple' but slightly less efficient. Use = for exact matches. ILIKE (PostgreSQL) is case-insensitive LIKE."
},
{
  id: 84, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the OVER() clause in window functions?",
  answer: "OVER() defines the window (set of rows) over which a window function operates. It can contain PARTITION BY (how to group), ORDER BY (how to order within partitions), and ROWS/RANGE BETWEEN (the frame bounds).",
  explanation: "Empty OVER() — OVER() — applies the function to the entire result set as one partition. PARTITION BY col creates separate windows per distinct value. ORDER BY within OVER defines row ordering for running calculations."
},
{
  id: 85, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the NTH_VALUE() window function?",
  answer: "NTH_VALUE(col, n) returns the value of col from the nth row of the current window frame. Example: NTH_VALUE(salary, 2) OVER(PARTITION BY dept ORDER BY salary DESC) returns the second highest salary per department.",
  explanation: "Similar to FIRST_VALUE and LAST_VALUE. Be careful with frame definitions — by default, the frame may not include all rows in the partition. Use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING for complete partition access."
},
{
  id: 86, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the difference between TIMESTAMP and DATE types?",
  answer: "DATE stores year, month, and day only (e.g., 2024-06-15). TIMESTAMP stores date and time including seconds (e.g., 2024-06-15 14:30:00). TIMESTAMPTZ (PostgreSQL) also stores timezone offset.",
  explanation: "Always store datetime values as TIMESTAMP or TIMESTAMPTZ, not as DATE, unless only the date is relevant. For global applications, use TIMESTAMPTZ or store UTC and convert in the application."
},
{
  id: 87, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the ISNULL() / NVL() / IFNULL() function?",
  answer: "These are database-specific alternatives to COALESCE for two arguments: ISNULL(col, default) in SQL Server, NVL(col, default) in Oracle, IFNULL(col, default) in MySQL. All return the second argument if the first is NULL.",
  explanation: "COALESCE is the ANSI standard that works across all databases. Prefer COALESCE for portability. These single-database functions are only useful when writing DB-specific code."
},
{
  id: 88, category: "SQL", subcategory: "Functions & Operators",
  question: "What is the SOUNDEX() function?",
  answer: "SOUNDEX() encodes a string to a 4-character code based on its phonetic pronunciation in English. SOUNDEX('Smith') = SOUNDEX('Smyth') = 'S530'. Used for fuzzy name matching.",
  explanation: "SOUNDEX is simplistic and English-centric. For better fuzzy matching, use trigram indexes (pg_trgm in PostgreSQL) or full-text search with similarity functions. DIFFERENCE() returns how similar two SOUNDEX codes are."
},
{
  id: 89, category: "SQL", subcategory: "Functions & Operators",
  question: "What is a LATERAL JOIN?",
  answer: "A LATERAL JOIN allows a subquery in the FROM clause to reference columns from preceding tables in the same FROM clause. It's like a correlated subquery in the FROM position.",
  explanation: "Example (PostgreSQL): SELECT u.name, latest.order_date FROM users u JOIN LATERAL (SELECT order_date FROM orders WHERE customer_id = u.id ORDER BY order_date DESC LIMIT 1) AS latest ON TRUE; — fetches the latest order per user efficiently."
},
{
  id: 90, category: "SQL", subcategory: "Functions & Operators",
  question: "What is an EXPLAIN ANALYZE output and how do you read it?",
  answer: "EXPLAIN ANALYZE executes the query and shows the actual execution plan with estimated and actual row counts, costs, and timings per node. Key things to check: Seq Scan vs Index Scan, Nested Loop vs Hash Join, rows estimate accuracy, and highest-cost nodes.",
  explanation: "A big discrepancy between estimated and actual rows indicates stale statistics — run ANALYZE to update. Large Hash Batches indicate memory spillover to disk. Nested Loops on large tables indicate missing indexes."
},

// --- SQL CONSTRAINTS & DESIGN (91-110) ---
{
  id: 91, category: "SQL", subcategory: "Constraints & Design",
  question: "What are the types of constraints in SQL?",
  answer: "NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK (enforces a boolean condition), DEFAULT (provides a fallback value).",
  explanation: "Constraints enforce data integrity at the database level, independent of application logic. They fire on every DML operation. CHECK constraints can reference multiple columns: CHECK (start_date < end_date)."
},
{
  id: 92, category: "SQL", subcategory: "Constraints & Design",
  question: "What is a CHECK constraint?",
  answer: "CHECK enforces a condition that must be TRUE for every row. Example: CONSTRAINT chk_age CHECK (age >= 18 AND age <= 120); — rejects any INSERT or UPDATE violating the condition.",
  explanation: "CHECK constraints are evaluated per row. They cannot reference other tables (use triggers or application logic for cross-table rules). In PostgreSQL, a NULL CHECK value passes (UNKNOWN is treated as TRUE for constraint purposes)."
},
{
  id: 93, category: "SQL", subcategory: "Constraints & Design",
  question: "What is referential integrity?",
  answer: "Referential integrity ensures that foreign key values in a child table always correspond to existing primary key values in the parent table, preventing orphan records.",
  explanation: "Enforced by FOREIGN KEY constraints. Actions: ON DELETE CASCADE (delete children), ON DELETE SET NULL (nullify FK), ON DELETE RESTRICT/NO ACTION (block deletion if children exist). Choose based on business rules."
},
{
  id: 94, category: "SQL", subcategory: "Constraints & Design",
  question: "What is a computed/generated column?",
  answer: "A generated column is a column whose value is automatically derived from other columns using a formula. Example in PostgreSQL: total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED;",
  explanation: "STORED means the value is computed on write and physically stored. VIRTUAL (supported by MySQL, not PostgreSQL) computes on read. Generated columns eliminate inconsistency between derived and source values."
},
{
  id: 95, category: "SQL", subcategory: "Constraints & Design",
  question: "What is a domain in SQL?",
  answer: "A domain is a user-defined data type with constraints and a default value. Example (PostgreSQL): CREATE DOMAIN positive_int AS INTEGER CHECK (VALUE > 0);. Columns can use this domain type.",
  explanation: "Domains are reusable type definitions — useful for enforcing consistent constraints across multiple columns and tables. They centralize validation logic."
},
{
  id: 96, category: "SQL", subcategory: "Constraints & Design",
  question: "What is a schema in SQL?",
  answer: "A schema is a namespace that groups related database objects (tables, views, functions, sequences) within a database. Example: public.users, sales.orders. Schemas help organize large databases and manage access control.",
  explanation: "In PostgreSQL, the default schema is 'public'. Multiple schemas allow multi-tenant architectures or module separation. GRANT privileges can be applied at the schema level."
},
{
  id: 97, category: "SQL", subcategory: "Constraints & Design",
  question: "What are the different types of relationships in database design?",
  answer: "One-to-One (1:1): one row relates to exactly one row in another table. One-to-Many (1:N): one row relates to multiple rows. Many-to-Many (M:N): implemented with a junction/bridge table that holds foreign keys from both sides.",
  explanation: "M:N example: students and courses — a student takes many courses, a course has many students. Junction table (enrollments) has student_id and course_id as a composite primary key."
},
{
  id: 98, category: "SQL", subcategory: "Constraints & Design",
  question: "What is BCNF (Boyce-Codd Normal Form)?",
  answer: "BCNF is a stricter version of 3NF. A table is in BCNF if for every functional dependency X → Y, X is a superkey. Essentially, every determinant must be a candidate key.",
  explanation: "Most tables in 3NF are also in BCNF. BCNF violations are rare but can occur when a table has multiple overlapping candidate keys. Decomposing to BCNF may not always be lossless."
},
{
  id: 99, category: "SQL", subcategory: "Constraints & Design",
  question: "What is 4NF and 5NF?",
  answer: "4NF eliminates multi-valued dependencies (one key determining multiple independent multi-valued facts). 5NF (PJNF) handles join dependencies — ensures a relation cannot be decomposed into smaller relations without loss.",
  explanation: "4NF and 5NF are rarely discussed in practice. Most production databases target 3NF or BCNF as a balance between normalization benefits and JOIN complexity."
},
{
  id: 100, category: "SQL", subcategory: "Constraints & Design",
  question: "What is the star schema and snowflake schema in data warehousing?",
  answer: "Star schema: a central fact table surrounded by denormalized dimension tables. Snowflake schema: fact table with normalized dimension tables (dimensions have their own related tables).",
  explanation: "Star schema is simpler and faster for queries (fewer JOINs). Snowflake is more normalized, reducing redundancy but requiring more JOINs. Star schema is preferred for BI/analytical tools. Both contrast with 3NF OLTP schemas."
},
{
  id: 101, category: "SQL", subcategory: "Constraints & Design",
  question: "What is a fact table vs dimension table?",
  answer: "Fact table: stores measurable, quantitative data (sales amount, quantity, revenue) with foreign keys to dimension tables. It is the center of analysis. Dimension table: stores descriptive attributes (product name, customer city, date information).",
  explanation: "Fact tables are tall and narrow (many rows, few columns). Dimension tables are wide (many descriptive columns) but short. The grain of a fact table defines what one row represents."
},
{
  id: 102, category: "SQL", subcategory: "Constraints & Design",
  question: "What is slowly changing dimension (SCD)?",
  answer: "SCD describes how dimension data changes over time. Type 1: overwrite old value (no history). Type 2: add new row with effective dates (full history). Type 3: add a previous value column (one level of history).",
  explanation: "SCD Type 2 is the most common — each version of a dimension has start/end dates and a current flag. It enables point-in-time historical analysis."
},
{
  id: 103, category: "SQL", subcategory: "Constraints & Design",
  question: "What is the difference between OLAP cubes and relational tables?",
  answer: "OLAP cubes are multi-dimensional data structures pre-aggregated along multiple dimensions for fast analytical queries. Relational tables store normalized row-based data. Cubes trade storage for query speed on fixed analytical patterns.",
  explanation: "Modern columnar databases (Redshift, BigQuery, Snowflake) often replace traditional OLAP cubes by providing fast aggregations on raw tables without pre-aggregation."
},
{
  id: 104, category: "SQL", subcategory: "Constraints & Design",
  question: "What is an ERD (Entity Relationship Diagram)?",
  answer: "An ERD visually represents the entities (tables), their attributes (columns), and the relationships (FK links) between them. Uses crow's foot or Chen notation to show cardinality (1:1, 1:N, M:N).",
  explanation: "ERDs are the standard tool for database design and documentation. Tools like dbdiagram.io, Lucidchart, and DBeaver generate ERDs automatically from schema. They communicate database structure to non-technical stakeholders."
},
{
  id: 105, category: "SQL", subcategory: "Constraints & Design",
  question: "What is database normalization vs performance trade-off?",
  answer: "Normalization reduces redundancy and anomalies but increases JOIN complexity. Highly normalized schemas require many JOINs for queries, increasing CPU and I/O. Denormalized schemas read faster but may have data inconsistencies.",
  explanation: "Common balance: normalize to 3NF for OLTP; denormalize for reporting/OLAP. Use materialized views to provide fast read access to normalized data. Profile before denormalizing."
},
{
  id: 106, category: "SQL", subcategory: "Constraints & Design",
  question: "What is a junction table (bridge table)?",
  answer: "A junction table resolves many-to-many relationships by having two foreign keys pointing to the related tables. Example: order_items(order_id FK, product_id FK, quantity, price).",
  explanation: "The junction table can also carry relationship-specific attributes (quantity, price, role). Its primary key is typically the composite (order_id, product_id) or a surrogate key."
},
{
  id: 107, category: "SQL", subcategory: "Constraints & Design",
  question: "What is database connection pooling?",
  answer: "Connection pooling maintains a cache of open database connections that can be reused by multiple application requests, avoiding the overhead of creating and tearing down connections for every query.",
  explanation: "Opening a database connection is expensive (TCP handshake, authentication, session setup). Pools like PgBouncer (PostgreSQL), HikariCP (Java), or built-in poolers in Node/Python dramatically improve throughput under load."
},
{
  id: 108, category: "SQL", subcategory: "Constraints & Design",
  question: "What is the difference between a B-tree index and a hash index?",
  answer: "B-tree index: balanced tree structure supporting equality, range, and prefix lookups. Most common general-purpose index. Hash index: directly maps values to buckets, O(1) for exact equality lookups but does NOT support range queries or sorting.",
  explanation: "B-tree is the default in almost all databases. Hash indexes are used in specific equality-only scenarios. PostgreSQL supports both; MySQL InnoDB only supports B-tree (hash is only for MEMORY tables)."
},
{
  id: 109, category: "SQL", subcategory: "Constraints & Design",
  question: "What is a GiST/GIN index in PostgreSQL?",
  answer: "GiST (Generalized Search Tree): versatile index for complex data types like geometric shapes, ranges, and full-text search. GIN (Generalized Inverted Index): best for indexing multi-value elements like arrays, JSONB, and full-text tsvectors.",
  explanation: "GIN is faster for searching but slower to build and update. GiST is faster to update but slightly slower for searches. For JSONB querying, GIN is the standard choice."
},
{
  id: 110, category: "SQL", subcategory: "Constraints & Design",
  question: "What is a BRIN index?",
  answer: "BRIN (Block Range Index) stores summaries (min/max values) for ranges of physical blocks. It is extremely small and fast to build, ideal for very large naturally ordered tables like time-series data with sequential timestamps.",
  explanation: "BRIN is not suitable for randomly ordered data. A query uses BRIN to eliminate block ranges that cannot contain matching rows. For a 1TB table with sequential dates, a BRIN index can be just kilobytes."
},

// --- SQL SECURITY & MISC (111-175) ---
{
  id: 111, category: "SQL", subcategory: "Security & Misc",
  question: "What is SQL injection and how do you prevent it?",
  answer: "SQL injection is an attack where user input is embedded directly in SQL queries, allowing attackers to modify the query structure. Prevention: use parameterized queries/prepared statements, ORMs, input validation, and stored procedures.",
  explanation: "Never build queries by string concatenation: 'SELECT * FROM users WHERE name = ' + userInput. With parameterized queries, the input is always treated as a literal value, not SQL code. Prepared statements are the definitive fix."
},
{
  id: 112, category: "SQL", subcategory: "Security & Misc",
  question: "What is GRANT and REVOKE?",
  answer: "GRANT gives privileges (SELECT, INSERT, UPDATE, DELETE, EXECUTE, etc.) to users or roles on database objects. REVOKE removes those privileges. Example: GRANT SELECT ON employees TO analyst_role;",
  explanation: "Use the principle of least privilege — grant only what is necessary. Roles group privileges for easy management. WITH GRANT OPTION allows the grantee to further grant the privilege to others."
},
{
  id: 113, category: "SQL", subcategory: "Security & Misc",
  question: "What is Row-Level Security (RLS)?",
  answer: "RLS restricts which rows a user can see or modify in a table based on policies. Example (PostgreSQL): CREATE POLICY user_isolation ON orders USING (customer_id = current_user_id()); — each user sees only their own orders.",
  explanation: "RLS is enforced transparently — users' queries are automatically filtered. Combined with application user context, it provides fine-grained multi-tenant data isolation at the database level."
},
{
  id: 114, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between authentication and authorization in databases?",
  answer: "Authentication verifies identity — who are you? (username/password, certificates). Authorization determines what you're allowed to do — what can you access? (GRANT, REVOKE, RLS policies).",
  explanation: "Databases handle authentication through user accounts, LDAP/Kerberos integration, or certificate-based auth. Authorization is handled through privileges on objects, role assignments, and row-level security policies."
},
{
  id: 115, category: "SQL", subcategory: "Security & Misc",
  question: "What is database auditing?",
  answer: "Database auditing tracks who did what and when — recording DML/DDL operations, login attempts, and access to sensitive data into an audit log for security, compliance, and forensics.",
  explanation: "Audit logs should be stored separately from the main database to prevent tampering. Tools: PostgreSQL pgaudit extension, Oracle Unified Auditing, SQL Server SQL Audit. Required for GDPR, HIPAA, PCI-DSS compliance."
},
{
  id: 116, category: "SQL", subcategory: "Security & Misc",
  question: "What is data masking?",
  answer: "Data masking replaces sensitive data (SSN, credit card numbers) with realistic but fictitious values. Static masking creates a masked copy of the database. Dynamic masking masks data on-the-fly during query results without altering stored data.",
  explanation: "Used to safely share production-like data for development/testing. PostgreSQL Anonymizer, Oracle Data Masking Pack, and cloud native tools provide masking capabilities. Required for GDPR compliance in dev environments."
},
{
  id: 117, category: "SQL", subcategory: "Security & Misc",
  question: "What is database encryption?",
  answer: "Encryption at rest: encrypts data files and backups on disk (TDE — Transparent Data Encryption). Encryption in transit: encrypts data moving over the network (SSL/TLS). Column-level encryption encrypts specific sensitive columns.",
  explanation: "TDE protects against physical theft of storage media. SSL/TLS protects against network eavesdropping. Column encryption protects against DBAs with direct table access. Use all three for comprehensive security."
},
{
  id: 118, category: "SQL", subcategory: "Security & Misc",
  question: "What is WAL (Write-Ahead Log)?",
  answer: "WAL is a journaling mechanism where changes are written to a log file before being applied to the actual data files. This ensures durability and enables crash recovery — the database replays the log to restore consistency after a crash.",
  explanation: "WAL also enables logical and physical replication in PostgreSQL. pg_wal is the WAL directory. WAL level controls what is logged (minimal, replica, logical). WAL archiving enables PITR (Point-In-Time Recovery)."
},
{
  id: 119, category: "SQL", subcategory: "Security & Misc",
  question: "What is PITR (Point-in-Time Recovery)?",
  answer: "PITR allows restoring a database to any specific point in time by replaying WAL records from a base backup up to the target time. It protects against accidental deletions or data corruption.",
  explanation: "PostgreSQL PITR: take a base backup, continuously archive WAL files, then restore by specifying a recovery_target_time. This is the gold standard for database disaster recovery."
},
{
  id: 120, category: "SQL", subcategory: "Security & Misc",
  question: "What is database vacuum (VACUUM in PostgreSQL)?",
  answer: "VACUUM reclaims storage occupied by dead tuples (rows marked as deleted/updated but not physically removed, a consequence of MVCC). VACUUM ANALYZE also updates query planner statistics.",
  explanation: "PostgreSQL uses MVCC (Multi-Version Concurrency Control) — old row versions are kept until VACUUM. Autovacuum runs automatically. VACUUM FULL rewrites the entire table (requires exclusive lock, use rarely)."
},
{
  id: 121, category: "SQL", subcategory: "Security & Misc",
  question: "What is MVCC (Multi-Version Concurrency Control)?",
  answer: "MVCC allows concurrent transactions to see consistent snapshots of data without blocking each other. Writers don't block readers. Each transaction sees the database as it was at transaction start (or statement start, depending on isolation level).",
  explanation: "PostgreSQL uses MVCC extensively. Old row versions are stored as dead tuples until VACUUM. This eliminates read/write conflicts at the cost of storage overhead for dead tuples."
},
{
  id: 122, category: "SQL", subcategory: "Security & Misc",
  question: "What is the EXPLAIN output's 'cost' value?",
  answer: "Cost is an arbitrary unit representing the estimated relative work to execute a plan node. It is expressed as (startup_cost..total_cost). Lower total cost is better. It is based on table statistics, not actual time.",
  explanation: "Costs are based on configurable parameters (seq_page_cost, random_page_cost, cpu_tuple_cost). They help the optimizer compare plans but don't directly map to milliseconds. Use EXPLAIN ANALYZE for actual timing."
},
{
  id: 123, category: "SQL", subcategory: "Security & Misc",
  question: "What is a partial index?",
  answer: "A partial index only indexes rows that satisfy a WHERE condition. Example: CREATE INDEX idx_pending ON orders(customer_id) WHERE status = 'pending'; — only indexes pending orders, making the index smaller and faster.",
  explanation: "Partial indexes are space-efficient and highly targeted. If most queries filter by a specific condition (active users, unprocessed events), a partial index can be far more efficient than a full-column index."
},
{
  id: 124, category: "SQL", subcategory: "Security & Misc",
  question: "What is an expression index (functional index)?",
  answer: "An expression index indexes the result of an expression or function rather than a raw column. Example: CREATE INDEX idx_lower_email ON users(LOWER(email)); allows WHERE LOWER(email) = 'test@example.com' to use the index.",
  explanation: "Useful when queries consistently apply functions to column values in WHERE clauses. The expression must be deterministic (same output for same input). The query must use the same expression to benefit."
},
{
  id: 125, category: "SQL", subcategory: "Security & Misc",
  question: "What is table statistics and why are they important?",
  answer: "Statistics (collected by ANALYZE/UPDATE STATISTICS) inform the query optimizer about data distribution — row counts, column value distributions (histograms), and distinct value counts. The optimizer uses these to choose the best execution plan.",
  explanation: "Stale or missing statistics lead to bad plan choices — wrong join order, sequential scan instead of index, wrong join algorithm. Always run ANALYZE after bulk data loads. PostgreSQL stores statistics in pg_statistic."
},
{
  id: 126, category: "SQL", subcategory: "Security & Misc",
  question: "What is connection string security?",
  answer: "Connection strings contain credentials (host, port, username, password, database name). They must never be hardcoded in source code. Use environment variables, secrets managers (AWS Secrets Manager, HashiCorp Vault), or configuration files with restricted permissions.",
  explanation: "Leaked connection strings are a top source of database breaches. Rotate credentials regularly. Use IAM database authentication in cloud environments to avoid static passwords entirely."
},
{
  id: 127, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between a hot backup and a cold backup?",
  answer: "Hot backup: taken while the database is running, using WAL archiving or online backup tools. No downtime. Cold backup: database is shut down before copying files. Simpler but requires downtime.",
  explanation: "Most production databases use hot backups. PostgreSQL's pg_basebackup, pg_dump, and continuous WAL archiving enable hot backups. Cold backups are used for smaller databases or maintenance windows."
},
{
  id: 128, category: "SQL", subcategory: "Security & Misc",
  question: "What is pg_dump and when would you use it?",
  answer: "pg_dump is a PostgreSQL utility that creates a logical backup of a database as SQL statements or custom binary format. It can back up a single database, table, or schema. pg_dumpall backs up all databases.",
  explanation: "pg_dump is consistent (MVCC snapshot) and doesn't lock the database. The custom format (-Fc) is preferred — smaller, supports parallel restore with pg_restore -j. Use for migrations, testing environments, and logical backups."
},
{
  id: 129, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between logical and physical backup?",
  answer: "Logical backup: exports data as SQL statements or CSV (pg_dump, mysqldump). Portable, can restore to different versions/platforms. Physical backup: copies the raw data files (pg_basebackup). Faster for large databases, version-specific.",
  explanation: "Physical backups are used for large databases where pg_dump would take too long. They are the basis for streaming replication and PITR. Logical backups are preferred for schema migrations and smaller databases."
},
{
  id: 130, category: "SQL", subcategory: "Security & Misc",
  question: "What is a database migration?",
  answer: "A database migration is a versioned, incremental change to the database schema (ADD COLUMN, CREATE TABLE, CREATE INDEX) managed by a migration tool. Examples: Flyway, Liquibase, Alembic, Rails Migrations.",
  explanation: "Migrations are tracked in a version table so each change runs exactly once. They enable reproducible schema evolution across environments (dev, staging, production). Always include both up and down (rollback) migrations."
},
{
  id: 131, category: "SQL", subcategory: "Security & Misc",
  question: "What is a tablespace in SQL databases?",
  answer: "A tablespace is a named storage location (directory on disk) where database objects are physically stored. It allows distributing tables and indexes across different disks for performance or storage management.",
  explanation: "Example (PostgreSQL): CREATE TABLESPACE fast_ssd LOCATION '/mnt/ssd/pg_data'; CREATE TABLE metrics(...) TABLESPACE fast_ssd; — puts a high-traffic table on faster storage."
},
{
  id: 132, category: "SQL", subcategory: "Security & Misc",
  question: "What is bloat in PostgreSQL?",
  answer: "Table bloat occurs when dead tuples accumulate faster than VACUUM can reclaim them, causing tables to grow beyond their actual data size. Index bloat occurs when indexes retain pages for deleted rows.",
  explanation: "Symptoms: slow queries, wasted disk space. Prevention: proper autovacuum configuration, avoid long-running transactions that prevent VACUUM. Tools: pgstattuple, bloat check queries, pg_repack for online defragmentation."
},
{
  id: 133, category: "SQL", subcategory: "Security & Misc",
  question: "What is query parameterization?",
  answer: "Query parameterization separates SQL code from data by using placeholders ($1, ?, :name) instead of embedding values directly in the query string. The database receives code and data separately.",
  explanation: "Benefits: prevents SQL injection, enables query plan caching (the same plan is reused for different parameter values), reduces parsing overhead. This is fundamentally different from string interpolation."
},
{
  id: 134, category: "SQL", subcategory: "Security & Misc",
  question: "What is a cursor in SQL?",
  answer: "A cursor is a database object that enables row-by-row processing of query results in procedural SQL (PL/SQL, PL/pgSQL). It is declared, opened, fetched row-by-row, then closed.",
  explanation: "Cursors are generally slower than set-based operations. Use them only when row-by-row processing is unavoidable. Server-side cursors also reduce memory by streaming results instead of loading all rows at once."
},
{
  id: 135, category: "SQL", subcategory: "Security & Misc",
  question: "What are common causes of slow queries?",
  answer: "Missing or unused indexes, full table scans, poorly written joins, too many columns selected (SELECT *), large result sets without LIMIT, implicit type conversions preventing index use, lock contention, stale statistics, correlated subqueries.",
  explanation: "Methodology: EXPLAIN ANALYZE → identify slow nodes → check for sequential scans on large tables → add appropriate indexes → rewrite problematic subqueries → update statistics. Profile before optimizing."
},
{
  id: 136, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between schema migration and data migration?",
  answer: "Schema migration changes the structure of the database (ADD COLUMN, ALTER TYPE, DROP TABLE). Data migration moves or transforms existing data (backfilling a new column, restructuring data formats, ETL processes).",
  explanation: "They often happen together but have different concerns. Schema migrations should be backward compatible during deployments. Data migrations can take a long time for large datasets and may need to run in batches."
},
{
  id: 137, category: "SQL", subcategory: "Security & Misc",
  question: "What is a hot standby?",
  answer: "A hot standby is a replica database that is continuously updated via streaming replication and is also available for read-only queries while in standby mode. It provides both disaster recovery and read scaling.",
  explanation: "PostgreSQL supports hot standby mode (hot_standby = on in postgresql.conf). Read queries are routed to standbys; writes go to the primary. Failover promotes a standby to primary when the primary fails."
},
{
  id: 138, category: "SQL", subcategory: "Security & Misc",
  question: "What is pg_stat_statements?",
  answer: "pg_stat_statements is a PostgreSQL extension that tracks statistics for all SQL statements executed — including call count, total time, mean time, and row counts. It is the essential tool for identifying slow and frequently executed queries.",
  explanation: "Enable with: CREATE EXTENSION pg_stat_statements; Add to shared_preload_libraries in postgresql.conf. Query it to find top time-consuming queries: SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"
},
{
  id: 139, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between CHAR SET and COLLATION?",
  answer: "Character set (CHARSET) defines which characters can be stored (ASCII, UTF-8, Latin-1). Collation defines how characters are sorted and compared — case sensitivity, accent sensitivity, locale-specific ordering.",
  explanation: "Example: utf8mb4_general_ci (MySQL) is case-insensitive. utf8mb4_bin is binary/case-sensitive. Collation affects ORDER BY, WHERE comparisons, and UNIQUE constraints. Mismatched collations cause implicit conversion in JOINs."
},
{
  id: 140, category: "SQL", subcategory: "Security & Misc",
  question: "What is a long-running transaction and why is it problematic?",
  answer: "A long-running transaction holds locks for an extended period, blocking other transactions from accessing locked resources. In PostgreSQL, it also prevents VACUUM from cleaning dead tuples, causing table bloat.",
  explanation: "Monitor with: SELECT pid, now() - xact_start AS duration, query FROM pg_stat_activity WHERE state = 'idle in transaction' AND now() - xact_start > interval '5 minutes'; Kill with pg_terminate_backend(pid)."
},
{
  id: 141, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between synchronous and asynchronous replication?",
  answer: "Synchronous replication: primary waits for at least one replica to confirm write before acknowledging to the client. Zero data loss but higher latency. Asynchronous: primary acknowledges immediately; replica may lag. Lower latency but potential data loss on failover.",
  explanation: "PostgreSQL: synchronous_commit = on/remote_write/remote_apply for synchronous; off for asynchronous. Use synchronous for financial transactions. Asynchronous for analytics replicas where slight lag is acceptable."
},
{
  id: 142, category: "SQL", subcategory: "Security & Misc",
  question: "What is logical replication vs physical replication?",
  answer: "Physical replication copies WAL bytes and reproduces exact binary state — fast, low overhead, but requires same PostgreSQL major version and system architecture. Logical replication replicates individual row changes — more flexible, cross-version, supports selective table replication.",
  explanation: "Logical replication enables: replicating to a different major version during upgrades, replicating specific tables, bi-directional replication, and integration with external systems (Kafka via Debezium)."
},
{
  id: 143, category: "SQL", subcategory: "Security & Misc",
  question: "What is Change Data Capture (CDC)?",
  answer: "CDC captures row-level changes (INSERT, UPDATE, DELETE) from the database log and streams them to other systems in real time. Tools: Debezium (reads PostgreSQL logical replication), AWS DMS, Oracle GoldenGate.",
  explanation: "CDC enables real-time data synchronization to data warehouses, search indexes (Elasticsearch), caches (Redis), and event streaming (Kafka) without impacting the source database with ETL queries."
},
{
  id: 144, category: "SQL", subcategory: "Security & Misc",
  question: "What is the RETURNING clause?",
  answer: "RETURNING (PostgreSQL) returns column values from modified rows after INSERT, UPDATE, or DELETE. Example: INSERT INTO users(name, email) VALUES('Alice','a@b.com') RETURNING id, created_at;",
  explanation: "RETURNING eliminates a separate SELECT after an INSERT to get the generated ID. It is also useful after UPDATE or DELETE to confirm what was changed. Not available in MySQL or SQL Server (use OUTPUT clause in SQL Server)."
},
{
  id: 145, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between a role and a user in PostgreSQL?",
  answer: "In PostgreSQL, users and roles are essentially the same — a role with LOGIN privilege is a user. Roles can own objects, have privileges, and be members of other roles. CREATE USER is shorthand for CREATE ROLE ... WITH LOGIN.",
  explanation: "Roles enable privilege inheritance — assign privileges to a role, then grant the role to multiple users. Example: GRANT readonly_role TO analyst_user; — analyst_user inherits all privileges of readonly_role."
},
{
  id: 146, category: "SQL", subcategory: "Security & Misc",
  question: "What is TOAST in PostgreSQL?",
  answer: "TOAST (The Oversized-Attribute Storage Technique) automatically compresses and/or stores large column values (>2KB) in a separate storage table. Columns like TEXT, BYTEA, JSONB can trigger TOAST.",
  explanation: "TOAST is transparent — you never directly interact with it. Strategies: PLAIN (never TOAST), EXTERNAL (store out-of-line, no compression), MAIN (compress in-line first), EXTENDED (compress and move out-of-line). Large JSON documents in JSONB use TOAST."
},
{
  id: 147, category: "SQL", subcategory: "Security & Misc",
  question: "What is the fillfactor in PostgreSQL?",
  answer: "Fillfactor controls the percentage of each page filled during INSERT. Default is 100% for tables (90% for B-tree indexes). Setting it lower (e.g., 70%) leaves free space on pages for UPDATE's HOT (Heap Only Tuple) updates without needing index updates.",
  explanation: "HOT updates improve performance for frequently updated tables. If an updated column is not part of any index, HOT update is possible only when there's free space on the same page. Lower fillfactor = more HOT updates, more space used."
},
{
  id: 148, category: "SQL", subcategory: "Security & Misc",
  question: "What is pg_upgrade and when is it needed?",
  answer: "pg_upgrade is a PostgreSQL tool for upgrading between major versions (e.g., PostgreSQL 14 to 16) without a full dump/restore. It links or copies data files while updating system catalog metadata.",
  explanation: "pg_upgrade --link creates hard links to data files (fast, but old cluster cannot be used after). Without --link, it copies files (safer but slower). Always test in staging before production. Logical replication upgrade avoids downtime."
},
{
  id: 149, category: "SQL", subcategory: "Security & Misc",
  question: "What are table access methods in PostgreSQL?",
  answer: "Access methods define how table data is stored and retrieved. The default is 'heap' (standard row-based storage). Alternative: 'columnar' storage (via extensions like Citus columnar) for analytical workloads.",
  explanation: "PostgreSQL's pluggable access method API (added in v12) allows extensions to implement custom storage formats. Different access methods trade off between random access performance and sequential scan/compression."
},
{
  id: 150, category: "SQL", subcategory: "Security & Misc",
  question: "What is LISTEN/NOTIFY in PostgreSQL?",
  answer: "LISTEN/NOTIFY is PostgreSQL's pub/sub mechanism. A backend executes NOTIFY channel_name, 'payload'; to send a message. Other connections executing LISTEN channel_name receive it asynchronously.",
  explanation: "Used for real-time notifications between database connections and applications — e.g., notifying an application that new data is ready to process. More lightweight than polling. Libraries like node-postgres and psycopg3 support async LISTEN."
},

// Continue SQL to 175
{
  id: 151, category: "SQL", subcategory: "Security & Misc",
  question: "What is COPY in PostgreSQL?",
  answer: "COPY is PostgreSQL's bulk data loading/unloading command. COPY table FROM '/path/file.csv' CSV HEADER; is much faster than individual INSERTs for loading large datasets. COPY table TO exports data.",
  explanation: "COPY is server-side file access. \\copy (psql metacommand) is client-side. For web applications, use COPY FROM STDIN via the client library. COPY achieves 100x+ the performance of row-by-row INSERT for bulk loads."
},
{
  id: 152, category: "SQL", subcategory: "Security & Misc",
  question: "What is the max size of a PostgreSQL row?",
  answer: "PostgreSQL has a maximum row size of approximately 8KB per page (one data page). Large values (TEXT, JSONB, BYTEA) are automatically TOASTed (stored out-of-line), so effective stored row data can be much larger.",
  explanation: "A single table page is 8KB. Short rows fit many per page; wide rows fewer. TOAST allows values up to 1GB per column. Very wide tables (many columns) with large values should use TOAST-friendly types."
},
{
  id: 153, category: "SQL", subcategory: "Security & Misc",
  question: "What is a B-tree index degeneration?",
  answer: "B-tree indexes can become imbalanced or bloated over time due to many deletions leaving empty pages. Index bloat wastes space and reduces lookup efficiency. REINDEX or VACUUM can reclaim space.",
  explanation: "In PostgreSQL, VACUUM can reclaim leaf pages but cannot remove empty intermediate pages. REINDEX CONCURRENTLY rebuilds the index without locking. Regular maintenance prevents severe degeneration."
},
{
  id: 154, category: "SQL", subcategory: "Security & Misc",
  question: "What is UNLOGGED table in PostgreSQL?",
  answer: "An UNLOGGED table does not write to WAL, making writes significantly faster (2-10x) but the table is truncated on crash/unclean shutdown. Suitable for temporary, reproducible, or cache data.",
  explanation: "Use cases: staging tables, session data, computed caches that can be rebuilt. Not replicated to standby servers. Trade durability and replication for write speed."
},
{
  id: 155, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between TEMPORARY and UNLOGGED tables?",
  answer: "TEMPORARY tables exist only for the duration of a session and are automatically dropped on disconnect. UNLOGGED tables persist between sessions but sacrifice durability. Both skip WAL writing for their data.",
  explanation: "Temp tables are private to the session — different sessions see different data. Unlogged tables are visible to all sessions. Use temp tables for intermediate query results; unlogged for shared fast-write scratch data."
},
{
  id: 156, category: "SQL", subcategory: "Security & Misc",
  question: "What is the EXPLAIN BUFFERS option?",
  answer: "EXPLAIN (ANALYZE, BUFFERS) shows buffer usage statistics — how many shared buffer hits (cache) vs reads from disk occurred per plan node. High disk reads indicate cache misses, suggesting the working set exceeds shared_buffers.",
  explanation: "Buffer hits are ~100x faster than disk reads. If a query shows high read counts, consider increasing shared_buffers or adding an index to reduce the scanned data volume."
},
{
  id: 157, category: "SQL", subcategory: "Security & Misc",
  question: "What is TABLESAMPLE in SQL?",
  answer: "TABLESAMPLE samples a fraction of table rows for approximate queries. Example: SELECT * FROM large_table TABLESAMPLE BERNOULLI(1); — returns approximately 1% of rows randomly selected.",
  explanation: "Useful for exploratory analysis or approximate aggregations on huge tables. BERNOULLI samples individual rows with probability p. SYSTEM samples whole pages (faster but less random). Exact sample size varies."
},
{
  id: 158, category: "SQL", subcategory: "Security & Misc",
  question: "What is a lock hierarchy in databases?",
  answer: "Databases use multiple lock levels: table-level (coarse, ACCESS SHARE to ACCESS EXCLUSIVE in PostgreSQL), page-level, and row-level. Coarser locks block more but are cheaper to manage; finer locks allow more concurrency.",
  explanation: "SELECT acquires AccessShareLock (weakest). DDL (ALTER TABLE) acquires AccessExclusiveLock (strongest). Row-level locking for SELECT FOR UPDATE. Understanding lock levels helps diagnose blocking issues."
},
{
  id: 159, category: "SQL", subcategory: "Security & Misc",
  question: "What is advisory locking?",
  answer: "Advisory locks are application-defined locks managed by the database but with no automatic semantics — applications acquire and release them manually. Example: SELECT pg_advisory_lock(123); Used for distributed mutual exclusion.",
  explanation: "Useful for preventing concurrent execution of the same background job across multiple application servers. pg_advisory_lock is session-scoped (held until released or session ends); pg_advisory_xact_lock is transaction-scoped."
},
{
  id: 160, category: "SQL", subcategory: "Security & Misc",
  question: "What is the pg_locks view?",
  answer: "pg_locks shows all active locks in the PostgreSQL cluster — which process holds or is waiting for which lock on which object. Useful for diagnosing lock contention and deadlocks.",
  explanation: "Join pg_locks with pg_stat_activity to see which queries are blocking which: SELECT blocking.pid, blocking.query, blocked.pid, blocked.query FROM pg_stat_activity blocking JOIN pg_stat_activity blocked ON blocked.wait_event_type = 'Lock'..."
},
{
  id: 161, category: "SQL", subcategory: "Security & Misc",
  question: "What is a sequence in PostgreSQL?",
  answer: "A sequence is a database object that generates unique sequential integers. CREATE SEQUENCE seq_name START 1 INCREMENT 1 MINVALUE 1 MAXVALUE 9999999 CYCLE; Use nextval('seq_name') to get the next value.",
  explanation: "SERIAL and BIGSERIAL are shorthand for creating a sequence and using it as a column default. GENERATED ALWAYS AS IDENTITY is the newer ANSI standard approach. Sequences are non-transactional — gaps can occur on rollback."
},
{
  id: 162, category: "SQL", subcategory: "Security & Misc",
  question: "What causes index bloat and how do you fix it?",
  answer: "Index bloat occurs when many rows are deleted or updated, leaving dead entries in index pages that are not reclaimed. Fix: VACUUM regularly, REINDEX CONCURRENTLY, or adjust autovacuum settings to run more frequently.",
  explanation: "Monitor bloat with extensions like pgstattuple. Bloated indexes are larger than necessary, consuming cache space. REINDEX CONCURRENTLY rebuilds without holding locks, suitable for production."
},
{
  id: 163, category: "SQL", subcategory: "Security & Misc",
  question: "What is the pg_stat_user_tables view?",
  answer: "pg_stat_user_tables shows table-level access statistics: sequential scans, index scans, rows fetched/inserted/updated/deleted, dead tuples, last vacuum/analyze times. Essential for performance monitoring.",
  explanation: "High seq_scan on large tables → add indexes. High n_dead_tup → autovacuum not keeping up. last_autovacuum NULL or old → check autovacuum settings. This view drives database health monitoring."
},
{
  id: 164, category: "SQL", subcategory: "Security & Misc",
  question: "What is the purpose of the pg_catalog schema?",
  answer: "pg_catalog contains PostgreSQL's system tables (pg_class, pg_attribute, pg_index, pg_roles, etc.) and built-in functions. It stores all metadata about the database's own structure.",
  explanation: "pg_catalog is the foundation of psql's meta-commands (\\d, \\dt, \\di). Querying it directly reveals detailed schema information. It is always in the search path before user schemas."
},
{
  id: 165, category: "SQL", subcategory: "Security & Misc",
  question: "What is the information_schema?",
  answer: "information_schema is an ANSI-standard schema providing views into database metadata — TABLES, COLUMNS, CONSTRAINTS, REFERENTIAL_CONSTRAINTS, etc. More portable across databases than vendor-specific system catalogs.",
  explanation: "Use information_schema for cross-database compatible schema introspection. PostgreSQL, MySQL, SQL Server, and MariaDB all implement it. It is slower than pg_catalog but far more portable."
},
{
  id: 166, category: "SQL", subcategory: "Security & Misc",
  question: "What is the search_path in PostgreSQL?",
  answer: "search_path determines the order in which schemas are searched when an unqualified object name is used. Default: '$user', public. Tables in the first found schema are used.",
  explanation: "SET search_path TO myschema, public; — queries use myschema first. Used in multi-tenant applications to route the same queries to per-tenant schemas. Misconfigured search_path can cause security issues (schema injection)."
},
{
  id: 167, category: "SQL", subcategory: "Security & Misc",
  question: "What is parallel query execution?",
  answer: "Parallel query uses multiple CPU cores to execute parts of a query simultaneously — parallel sequential scans, parallel hash joins, parallel aggregation. Controlled by max_parallel_workers_per_gather in PostgreSQL.",
  explanation: "Parallel queries help large analytical queries on multi-core servers. They are not beneficial for simple indexed lookups. Enable with enable_parallel_scan, parallel_tuple_cost settings. Check EXPLAIN for 'Gather' nodes indicating parallelism."
},
{
  id: 168, category: "SQL", subcategory: "Security & Misc",
  question: "What is JIT compilation in PostgreSQL?",
  answer: "JIT (Just-In-Time) compilation uses LLVM to compile query expression evaluation code at runtime, speeding up complex expressions and tuple deforming in large analytical queries.",
  explanation: "JIT helps for CPU-bound analytical queries with complex WHERE/SELECT expressions. It adds compilation overhead so it is only enabled for expensive queries (jit_above_cost threshold). Not beneficial for simple OLTP queries."
},
{
  id: 169, category: "SQL", subcategory: "Security & Misc",
  question: "What is the max number of columns in a PostgreSQL table?",
  answer: "PostgreSQL supports up to 1600 columns per table, though practical limits are lower due to page size constraints (8KB per page). Very wide tables exceed a single page and require TOAST for many values.",
  explanation: "Having hundreds of columns is a design smell — consider JSONB for flexible attributes, EAV (Entity-Attribute-Value) patterns, or proper normalization. Wide tables impact performance for full-row operations."
},
{
  id: 170, category: "SQL", subcategory: "Security & Misc",
  question: "What is horizontal vs vertical scaling of databases?",
  answer: "Vertical scaling: adding more CPU, RAM, storage to a single server. Horizontal scaling: adding more servers (read replicas, sharding). Vertical has a ceiling and single point of failure. Horizontal scales further but adds complexity.",
  explanation: "Most databases start vertical. Read replicas are horizontal for reads. Write scaling horizontally requires sharding or distributed databases (CockroachDB, Cassandra). Horizontal scaling requires application changes."
},
{
  id: 171, category: "SQL", subcategory: "Security & Misc",
  question: "What is a covering index and how does it eliminate a table lookup?",
  answer: "A covering index contains all columns a query needs — the query can be satisfied entirely from the index without accessing the main table heap. This is called an index-only scan.",
  explanation: "PostgreSQL must also check the visibility map for an index-only scan (VACUUM must have marked pages all-visible). Check EXPLAIN for 'Index Only Scan' vs 'Index Scan'. Use INCLUDE columns in newer PostgreSQL versions."
},
{
  id: 172, category: "SQL", subcategory: "Security & Misc",
  question: "What is the INCLUDE clause in PostgreSQL indexes?",
  answer: "INCLUDE adds non-key columns to an index for covering purposes without making them part of the search key. Example: CREATE INDEX ON orders(customer_id) INCLUDE (total, created_at); — allows index-only scans without the overhead of indexing those columns.",
  explanation: "Unlike regular index columns, INCLUDE columns are not searchable (no range queries on them via the index) and don't affect sort order. They are just along for the ride to enable index-only scans."
},
{
  id: 173, category: "SQL", subcategory: "Security & Misc",
  question: "What is a deferred constraint?",
  answer: "A deferred constraint is checked at transaction commit rather than immediately when the statement executes. Useful when multiple operations in a transaction temporarily violate a constraint.",
  explanation: "Example: swapping two rows' unique values requires deferring the unique constraint. DEFERRABLE INITIALLY DEFERRED or SET CONSTRAINTS constraint_name DEFERRED within a transaction. PostgreSQL and Oracle support this."
},
{
  id: 174, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between a prepared statement and a regular query?",
  answer: "A prepared statement parses and plans the query once, then executes with different parameters many times. Regular queries parse and plan every execution. Prepared statements are faster for repeated queries and prevent SQL injection.",
  explanation: "PREPARE stmt AS SELECT * FROM users WHERE id = $1; EXECUTE stmt(42); In high-volume OLTP, prepared statements eliminate parse overhead. Most client libraries use them automatically when using parameterized queries."
},
{
  id: 175, category: "SQL", subcategory: "Security & Misc",
  question: "What is the difference between a local and global temporary table?",
  answer: "Local temp tables are visible only to the current session (and called temporary tables in most databases). Global temporary tables (supported in Oracle, SQL Server) are visible to all sessions but data is private per session.",
  explanation: "PostgreSQL only has local temp tables. SQL Server supports both with # (local) and ## (global) prefixes. Local temp tables are the norm in web applications for intermediate result storage during complex operations."
},

// ============================================================
// POSTGRESQL QUESTIONS (176-350)
// ============================================================

// --- PostgreSQL SPECIFIC (176-220) ---
{
  id: 176, category: "PostgreSQL", subcategory: "Core Features",
  question: "What are PostgreSQL's key differentiating features from other RDBMS?",
  answer: "JSONB support, advanced indexing (GiST, GIN, BRIN, partial, expression indexes), extensibility (custom types, functions, operators, access methods), full ACID compliance, MVCC, strong standards compliance, PostGIS extension for geospatial, logical replication, table inheritance, and being open source.",
  explanation: "PostgreSQL is often called the most advanced open-source RDBMS. It supports more SQL standards than MySQL, has richer type system, and its extension ecosystem (PostGIS, TimescaleDB, Citus) covers specialized workloads."
},
{
  id: 177, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is JSONB in PostgreSQL and how does it differ from JSON?",
  answer: "Both store JSON data. JSON stores the raw input text preserving whitespace and key order. JSONB stores parsed binary representation — faster for querying, supports indexing (GIN), deduplicates keys, but stores data slightly differently (loses key order/whitespace).",
  explanation: "Use JSONB almost always. Benefits: GIN indexes for @>, ?, ?| operators; faster reads; no re-parsing. JSON is only preferred when exact text preservation matters (e.g., audit logging of exact input)."
},
{
  id: 178, category: "PostgreSQL", subcategory: "Core Features",
  question: "What JSONB operators does PostgreSQL provide?",
  answer: "-> returns JSON object/array element. ->> returns text. #> navigates nested path. #>> navigates path as text. @> checks containment (does left contain right?). <@ reverse containment. ? key exists. ?| any key exists. ?& all keys exist. || concatenation. - delete key.",
  explanation: "Example: data @> '{\"status\": \"active\"}' checks if JSONB contains that key-value. data ? 'email' checks if 'email' key exists. These operators are indexable with GIN indexes for fast JSONB queries."
},
{
  id: 179, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is table inheritance in PostgreSQL?",
  answer: "Table inheritance allows a child table to inherit columns from a parent table. Child rows are visible in parent queries. Useful for partitioning (before native partitioning was added) and polymorphic structures.",
  explanation: "CREATE TABLE vehicles (...); CREATE TABLE cars() INHERITS (vehicles); — cars has all vehicle columns plus its own. SELECT * FROM vehicles returns all cars too. Queries with ONLY keyword (SELECT * FROM ONLY vehicles) exclude children."
},
{
  id: 180, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is declarative table partitioning in PostgreSQL?",
  answer: "Declarative partitioning (pg10+) allows defining a partition strategy on a parent table: RANGE, LIST, or HASH. Child partition tables hold the actual data. The planner automatically uses partition pruning.",
  explanation: "CREATE TABLE orders (id, date, total) PARTITION BY RANGE (date); CREATE TABLE orders_2024 PARTITION OF orders FOR VALUES FROM ('2024-01-01') TO ('2025-01-01'); Queries filtering by date only scan relevant partitions."
},
{
  id: 181, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is a foreign data wrapper (FDW) in PostgreSQL?",
  answer: "FDW allows querying external data sources (other PostgreSQL databases, MySQL, CSV files, APIs, Redis, MongoDB) as if they were local tables. The postgres_fdw extension is the most common for PostgreSQL-to-PostgreSQL.",
  explanation: "CREATE SERVER remote_db FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host '...', dbname '...'); CREATE FOREIGN TABLE remote_orders LIKE orders SERVER remote_db; — then query remote_orders as if local."
},
{
  id: 182, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the pg_trgm extension?",
  answer: "pg_trgm provides trigram-based similarity matching and indexing for fast LIKE/ILIKE/fuzzy text search. Trigrams are 3-character substrings — text is broken into trigrams and GIN/GIST indexes support similarity searches.",
  explanation: "CREATE EXTENSION pg_trgm; CREATE INDEX ON products USING GIN(name gin_trgm_ops); SELECT * FROM products WHERE name % 'Appl'; — finds 'Apple', 'App', 'Application'. Much faster than LIKE '%text%' on large tables."
},
{
  id: 183, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is PostGIS?",
  answer: "PostGIS is a spatial extension for PostgreSQL adding geographic objects, spatial indexes (GiST), and spatial functions (ST_Distance, ST_Contains, ST_Intersects, ST_Transform). It turns PostgreSQL into a spatial database.",
  explanation: "Use PostGIS for: storing GPS coordinates, finding nearby locations, calculating distances, geofencing, and routing. GEOMETRY and GEOGRAPHY types store spatial data. Used in mapping applications, logistics, and GIS systems."
},
{
  id: 184, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the hstore extension in PostgreSQL?",
  answer: "hstore stores key-value pairs in a single PostgreSQL column, predating JSONB. It supports simple string-to-string maps with GIN/GiST indexing. JSONB is now generally preferred for its richer data model.",
  explanation: "hstore is still useful for simple, flat key-value stores. It has @>, ?, and other operators similar to JSONB. Migrating from hstore to JSONB is common as JSONB supports nested structures."
},
{
  id: 185, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is a range type in PostgreSQL?",
  answer: "Range types represent a range of values: int4range, int8range, numrange, tsrange (timestamp), tstzrange, daterange. They support containment (@>), overlap (&&), and adjacency (-|-) operators.",
  explanation: "Example: daterange('[2024-01-01,2024-12-31]') represents a year range. WHERE schedule_range && '[2024-06-01,2024-06-30]'::daterange finds overlapping schedules. Range types simplify booking systems and time-series."
},
{
  id: 186, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is a multirange type in PostgreSQL?",
  answer: "Multirange types (introduced in pg14) represent a collection of non-overlapping ranges of the same type. Example: int4multirange. Useful for representing schedules with gaps, vacation times, etc.",
  explanation: "A multirange is like a sorted, coalesced set of ranges. Supports the same operators as ranges plus additional set-like operations. Created using the range_merge, range_agg aggregate functions."
},
{
  id: 187, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is a composite type in PostgreSQL?",
  answer: "A composite type is a user-defined type with named fields, similar to a struct or record. CREATE TYPE address AS (street TEXT, city TEXT, country TEXT); Columns can be of composite type.",
  explanation: "Composite types are useful for complex attributes or function return types. Access with: SELECT (address_col).city FROM users. They can be used in arrays, function parameters, and table columns."
},
{
  id: 188, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is an enum type in PostgreSQL?",
  answer: "Enum types define a fixed ordered set of string values. CREATE TYPE status AS ENUM ('pending', 'active', 'inactive'); The values can be compared and sorted based on their defined order.",
  explanation: "Enums are space-efficient (stored as 4 bytes) and have natural sort order. Adding new values requires ALTER TYPE. The ordering is definition order, not alphabetical. Use enums for stable categorical data."
},
{
  id: 189, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the UUID type and how do you generate UUIDs in PostgreSQL?",
  answer: "UUID is a 128-bit identifier type. Generate with: gen_random_uuid() (built-in pg13+), or uuid_generate_v4() from the uuid-ossp extension. Example: id UUID DEFAULT gen_random_uuid().",
  explanation: "UUIDs are globally unique, making them good for distributed systems, public-facing IDs, and merge-friendly distributed databases. Downside: 16 bytes vs 4-8 for integers, random UUIDs cause B-tree index fragmentation (use UUIDv7 for ordered UUIDs)."
},
{
  id: 190, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is PL/pgSQL?",
  answer: "PL/pgSQL is PostgreSQL's procedural language for writing stored procedures and functions with control flow (IF, LOOP, FOR, WHILE), variables, exception handling, cursor iteration, and SQL execution.",
  explanation: "CREATE OR REPLACE FUNCTION get_user(p_id INT) RETURNS users AS $$ BEGIN RETURN QUERY SELECT * FROM users WHERE id = p_id; END; $$ LANGUAGE plpgsql; PL/pgSQL runs inside the database server, avoiding round-trips."
},
{
  id: 191, category: "PostgreSQL", subcategory: "Core Features",
  question: "What other procedural languages does PostgreSQL support?",
  answer: "PostgreSQL supports PL/pgSQL (built-in), PL/Python (plpython3u), PL/Perl (plperl), PL/Tcl, PL/R, PL/Java, PL/V8 (JavaScript via V8), and others. The 'u' suffix means untrusted (can access filesystem).",
  explanation: "PL/Python is popular for data science functions. PL/V8 enables JavaScript in the database. Each language has trusted/untrusted variants controlling OS access. Install languages with CREATE EXTENSION or CREATE LANGUAGE."
},
{
  id: 192, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the difference between a function and a stored procedure in PostgreSQL?",
  answer: "Functions return a value (scalar, table, or set), are called in SQL expressions, and (before pg14) couldn't manage transactions. Procedures (added in pg11) are called with CALL, can use COMMIT/ROLLBACK inside, but don't return values directly.",
  explanation: "Most PostgreSQL code uses FUNCTIONS even for DML — procedures are for complex transactional workflows needing mid-procedure commits. Functions can return TABLE or SETOF type to return result sets."
},
{
  id: 193, category: "PostgreSQL", subcategory: "Core Features",
  question: "What are triggers and trigger functions in PostgreSQL?",
  answer: "Trigger functions are PL/pgSQL functions returning TRIGGER type. They access OLD and NEW row variables. Triggers fire BEFORE or AFTER (or INSTEAD OF for views) INSERT, UPDATE, or DELETE events.",
  explanation: "CREATE FUNCTION audit_fn() RETURNS TRIGGER AS $$ BEGIN INSERT INTO audit_log VALUES(TG_TABLE_NAME, now(), OLD, NEW); RETURN NEW; END; $$ LANGUAGE plpgsql; CREATE TRIGGER audit AFTER UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION audit_fn();"
},
{
  id: 194, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the RETURNING clause and when is it useful?",
  answer: "RETURNING clause in INSERT, UPDATE, DELETE returns values from the affected rows. Example: INSERT INTO orders(total) VALUES(100) RETURNING id, created_at; — returns the generated ID without a separate SELECT.",
  explanation: "Eliminates race conditions from the SELECT-after-INSERT pattern. Also works with UPDATE: UPDATE accounts SET balance = balance - 100 WHERE id = 1 RETURNING balance; — confirms new balance atomically."
},
{
  id: 195, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is WITH (CTE) and MATERIALIZED in PostgreSQL?",
  answer: "By default in pg12+, CTEs are optimization fences only when MATERIALIZED is specified. WITH MATERIALIZED cte AS (...) forces the CTE to be executed once and its result stored. WITH NOT MATERIALIZED allows inlining.",
  explanation: "Before pg12, all CTEs were optimization fences (always materialized). This prevented the planner from pushing predicates into them. pg12+ inlines simple CTEs by default for better plans, while complex/recursive CTEs remain materialized."
},
{
  id: 196, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is table partitioning and how do you implement HASH partitioning?",
  answer: "HASH partitioning distributes rows evenly across partitions based on a hash of the partition key. CREATE TABLE users (...) PARTITION BY HASH (id); CREATE TABLE users_0 PARTITION OF users FOR VALUES WITH (MODULUS 4, REMAINDER 0);",
  explanation: "Hash partitioning is good when there's no natural range/list to partition by and you want even distribution. All 4 partitions (REMAINDER 0-3) cover all rows. Good for scaling writes and parallel scans."
},
{
  id: 197, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is VACUUM FULL and when should you use it?",
  answer: "VACUUM FULL rewrites the entire table to a new file, fully reclaiming all dead space. It acquires an ACCESS EXCLUSIVE lock (blocking all other operations). Use only during maintenance windows when bloat is severe.",
  explanation: "Regular VACUUM reclaims dead space for reuse but doesn't return it to the OS. VACUUM FULL returns disk space to the OS but is disruptive. Alternative: pg_repack (online, non-locking table repack)."
},
{
  id: 198, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is autovacuum in PostgreSQL?",
  answer: "Autovacuum is a background process that automatically runs VACUUM and ANALYZE on tables that have accumulated sufficient dead tuples or changed data. Controlled by cost-based throttling parameters to minimize impact.",
  explanation: "Key params: autovacuum_vacuum_scale_factor (default 0.2 = 20% of rows changed), autovacuum_analyze_scale_factor. For large tables, lower thresholds: autovacuum_vacuum_scale_factor = 0.01 to vacuum more frequently."
},
{
  id: 199, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the pg_repack extension?",
  answer: "pg_repack online-rebuilds bloated tables and indexes without holding an exclusive lock for the duration. It creates a new copy of the table, syncs changes via triggers, then swaps in a single brief lock at the end.",
  explanation: "pg_repack is the production-safe alternative to VACUUM FULL. Usage: pg_repack -t tablename dbname. Ideal for heavily bloated tables that cannot be taken offline but need space reclamation."
},
{
  id: 200, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is logical decoding in PostgreSQL?",
  answer: "Logical decoding reads the WAL and decodes it into logical row-level change events (INSERT/UPDATE/DELETE with before/after values). Used by logical replication, Debezium CDC, and wal2json.",
  explanation: "Enable with wal_level = logical in postgresql.conf. Create replication slots: SELECT pg_create_logical_replication_slot('my_slot', 'pgoutput'); Read changes via pg_logical_slot_get_changes(). Powers real-time data pipelines."
},
{
  id: 201, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is streaming replication in PostgreSQL?",
  answer: "Streaming replication continuously ships WAL records from primary to standby servers in near-real time. Standby servers apply WAL and can serve as hot standby for reads or failover targets.",
  explanation: "Configure: primary_conninfo in standby's recovery.conf/postgresql.conf, wal_level = replica. Replication slots prevent WAL from being recycled before the standby has received it (but can cause disk fill if standby disconnects)."
},
{
  id: 202, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the pg_hba.conf file?",
  answer: "pg_hba.conf (host-based authentication) controls which hosts and users can connect to PostgreSQL and which authentication method to use (trust, password, md5, scram-sha-256, peer, cert, ldap).",
  explanation: "Each line: TYPE DATABASE USER ADDRESS METHOD. Example: host all all 192.168.1.0/24 scram-sha-256. Rules are checked top-to-bottom; first match wins. Use scram-sha-256 over md5 for better password security."
},
{
  id: 203, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the postgresql.conf file and key parameters to tune?",
  answer: "postgresql.conf controls all server configuration. Key parameters: shared_buffers (25% of RAM), work_mem (for sorts/hashes), maintenance_work_mem, max_connections, effective_cache_size (75% RAM), wal_level, checkpoint_timeout.",
  explanation: "shared_buffers: PostgreSQL's own buffer pool. work_mem: per-sort/per-hash operation (set too high × many connections = OOM). effective_cache_size: hint to planner about available OS cache. Use PGTune to generate initial settings."
},
{
  id: 204, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the difference between shared_buffers and effective_cache_size?",
  answer: "shared_buffers is the actual memory allocated to PostgreSQL's buffer pool (data cached in PostgreSQL). effective_cache_size is just a planner hint estimating total available cache (shared_buffers + OS page cache). Setting it higher encourages index scans.",
  explanation: "effective_cache_size doesn't actually allocate memory — it just tells the planner how much cache is likely available for index-only scans. Set to ~75% of RAM. PostgreSQL also benefits from the OS page cache for frequently accessed data."
},
{
  id: 205, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the work_mem parameter?",
  answer: "work_mem sets the memory available for individual sort and hash operations within a query. Large sorts/hash joins that exceed work_mem spill to temporary files on disk, which is much slower.",
  explanation: "Danger: each parallel query node and each sort/hash in a complex query gets its own work_mem chunk. With 100 connections × 4 sorts × 4MB work_mem = 1.6GB. Set work_mem low globally, increase for specific heavy queries with SET work_mem = '256MB'."
},
{
  id: 206, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is WAL compression in PostgreSQL?",
  answer: "wal_compression = on compresses full-page images in WAL records using LZ4/zstd/pglz, reducing WAL volume (important for streaming replication bandwidth and WAL archiving storage) at the cost of slight CPU overhead.",
  explanation: "Full-page writes in WAL (after checkpoints) are the main WAL consumer. Compression reduces WAL by 40-70% with minimal CPU cost. Important for high-write databases and cloud environments with storage costs."
},
{
  id: 207, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is pg_bouncer and why is it used with PostgreSQL?",
  answer: "PgBouncer is a lightweight PostgreSQL connection pooler. It maintains a small pool of actual PostgreSQL connections and multiplexes many client connections onto them, reducing per-connection overhead on PostgreSQL.",
  explanation: "PostgreSQL spawns a process per connection. Thousands of connections = thousands of processes = huge memory and context-switch overhead. PgBouncer with transaction pooling allows thousands of clients sharing ~20-50 actual PostgreSQL connections."
},
{
  id: 208, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the difference between PgBouncer session pooling and transaction pooling?",
  answer: "Session pooling: one server connection per client session (least effective). Transaction pooling: server connection returned to pool after each transaction (most efficient, but breaks prepared statements and session-level features). Statement pooling: per-statement (most aggressive).",
  explanation: "Transaction pooling is the sweet spot for most applications but is incompatible with: prepared statements, advisory locks, SET LOCAL, and other session-state features. Some ORMs need configuration changes to work with transaction pooling."
},
{
  id: 209, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is Citus extension?",
  answer: "Citus is a PostgreSQL extension that distributes data and queries across multiple PostgreSQL nodes, enabling horizontal scaling of both reads and writes. It shards tables by a distribution column across worker nodes.",
  explanation: "Citus supports distributed tables, reference tables (replicated to all workers), and local tables. SQL queries are transparently distributed. Used for multi-tenant SaaS and large-scale analytics on PostgreSQL."
},
{
  id: 210, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is TimescaleDB?",
  answer: "TimescaleDB is a PostgreSQL extension optimizing time-series data storage and queries. It automatically partitions data by time (hypertables), provides time-series specific functions (time_bucket, first, last), and offers compression.",
  explanation: "Hypertables look like regular PostgreSQL tables but chunk data by time automatically. Continuous aggregates provide pre-computed rolling summaries. Data tiering moves old data to cheaper storage. Used for metrics, IoT, and monitoring data."
},
{
  id: 211, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the pgvector extension?",
  answer: "pgvector adds vector data type and similarity search (cosine, L2, inner product) to PostgreSQL. Used for storing AI embeddings and performing nearest-neighbor search for semantic similarity, recommendation, and RAG systems.",
  explanation: "CREATE EXTENSION vector; col VECTOR(1536); SELECT * FROM items ORDER BY embedding <-> query_embedding LIMIT 10; — finds the 10 most similar items. Index with HNSW or IVFFlat for faster ANN search."
},
{
  id: 212, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the pg_partman extension?",
  answer: "pg_partman is a partition management extension for PostgreSQL. It automates creation of new time-based or serial-based partitions, drops/archives old partitions, and maintains partition sets without manual intervention.",
  explanation: "Manually managing hundreds of date partitions is error-prone. pg_partman creates next-month partitions automatically, sends alerts before running out, and handles partition maintenance based on configured retention policies."
},
{
  id: 213, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the CLUSTER command?",
  answer: "CLUSTER tablename USING indexname physically reorders the table's rows on disk according to the index order. This improves performance for range scans and queries that access rows in index order.",
  explanation: "CLUSTER acquires an exclusive lock and rewrites the table — significant downtime for large tables. Unlike Oracle clusters, PostgreSQL's CLUSTER is a one-time operation (rows drift over time as new inserts come in). Run periodically with pg_repack for less disruption."
},
{
  id: 214, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the pg_stat_bgwriter view?",
  answer: "pg_stat_bgwriter shows checkpoint and background writer statistics: buffers written by checkpointer, by background writer, and by backends (bad), checkpoint timing and count, and checkpoint write cause (timed vs requested).",
  explanation: "High buffers_backend (backends writing dirty buffers themselves) indicates the background writer isn't keeping up — tune bgwriter_lru_maxpages. Frequent checkpoints (checkpoint_completion high) indicate heavy write load."
},
{
  id: 215, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the difference between OIDs and regular columns in PostgreSQL?",
  answer: "OIDs (Object Identifiers) are system-assigned 32-bit unsigned integers historically used as implicit row identifiers. They wrap around after 4 billion values and caused data issues. PostgreSQL removed OIDs from user tables by default in pg12.",
  explanation: "System catalog tables still use OIDs extensively. User tables should use explicit BIGSERIAL or UUID primary keys instead. WITH OIDS option was removed in pg12. pg_class.oid still identifies table/index objects in the catalog."
},
{
  id: 216, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is index-only scan and when can it occur?",
  answer: "An index-only scan retrieves all needed data directly from the index without accessing the table heap, when: 1) the index covers all queried columns, and 2) the visibility map indicates all heap pages are clean (vacuumed).",
  explanation: "PostgreSQL must check the visibility map even for index-only scans because MVCC requires knowing row visibility. After bulk inserts or before vacuum, many pages may not be marked all-visible, causing heap fetches anyway."
},
{
  id: 217, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the FREEZE mechanism in PostgreSQL?",
  answer: "PostgreSQL uses 32-bit transaction IDs that wrap around every ~2 billion transactions. FREEZE marks old rows as frozen (transaction ID = FrozenTransactionId) so they remain visible despite wraparound. Failure to freeze causes data loss.",
  explanation: "autovacuum's anti-wraparound vacuum runs when a table's oldest unfrozen XID is within autovacuum_freeze_max_age of wraparound. Monitor pg_stat_user_tables.n_dead_tup and age(relfrozenxid) in pg_class. This is a critical PostgreSQL operational concern."
},
{
  id: 218, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is the pg_dump custom format (-Fc)?",
  answer: "pg_dump -Fc produces a custom binary format that is compressed, supports parallel restore (pg_restore -j N), and allows selective object restoration. It is the recommended format for production backups.",
  explanation: "pg_dump -Fc dbname > backup.dump; pg_restore -Fc -j 4 -d newdb backup.dump — restores with 4 parallel workers. The format supports --list to see contents, --use-list for selective restore, and is much faster than plain SQL format for large databases."
},
{
  id: 219, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is table-level and row-level locking in PostgreSQL?",
  answer: "Table-level: ACCESS SHARE (SELECT), ROW SHARE (SELECT FOR UPDATE), ROW EXCLUSIVE (INSERT/UPDATE/DELETE), SHARE UPDATE EXCLUSIVE (VACUUM), SHARE, SHARE ROW EXCLUSIVE, EXCLUSIVE, ACCESS EXCLUSIVE (DDL). Row-level: SELECT FOR UPDATE/SHARE/NO KEY UPDATE/KEY SHARE.",
  explanation: "Most DML uses row-level locking and a ROW EXCLUSIVE table lock (prevents only conflicting table-level locks). SELECT FOR UPDATE acquires row-level exclusive locks, blocking other FOR UPDATE on the same rows. Use NOWAIT or SKIP LOCKED for non-blocking."
},
{
  id: 220, category: "PostgreSQL", subcategory: "Core Features",
  question: "What is SKIP LOCKED in PostgreSQL?",
  answer: "SELECT ... FOR UPDATE SKIP LOCKED skips rows that are locked by other transactions instead of waiting. Useful for implementing job queues — multiple workers can pick different jobs without blocking each other.",
  explanation: "Example: SELECT * FROM jobs WHERE status='pending' ORDER BY priority LIMIT 1 FOR UPDATE SKIP LOCKED; — each worker picks a different pending job atomically. Combined with FOR UPDATE to lock the selected row."
},

// --- PostgreSQL ADVANCED (221-280) ---
{
  id: 221, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_stat_replication view?",
  answer: "pg_stat_replication shows information about connected streaming replication standbys: their application_name, state (streaming/catchup), sent_lsn, write_lsn, flush_lsn, replay_lsn, and replication lag.",
  explanation: "Monitor replication lag: SELECT now() - pg_last_xact_replay_timestamp() AS replication_delay; on the standby. A growing lag indicates the standby can't keep up with the primary's write rate."
},
{
  id: 222, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is a replication slot and what are its risks?",
  answer: "A replication slot tracks how far a subscriber has consumed WAL, ensuring WAL is not recycled until the slot's consumer has processed it. Risk: if a consumer disconnects and never reconnects, WAL accumulates indefinitely, potentially filling the disk.",
  explanation: "Monitor: SELECT slot_name, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS lag FROM pg_replication_slots; Drop abandoned slots. Set max_slot_wal_keep_size to limit WAL retention per slot."
},
{
  id: 223, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is Patroni?",
  answer: "Patroni is a high-availability solution for PostgreSQL that uses distributed consensus systems (etcd, Consul, ZooKeeper) to automate failover and leader election. It manages primary/standby topology and automatic promotion.",
  explanation: "Patroni continuously monitors the cluster health. If the primary becomes unavailable, it holds an election among standbys, promotes the best candidate, and updates connection routing. Used widely in production PostgreSQL HA setups."
},
{
  id: 224, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is pglogical?",
  answer: "pglogical is an extension providing logical replication for PostgreSQL older than pg10. It enables selective table replication, replication between different major versions, and bidirectional replication with conflict handling.",
  explanation: "While native logical replication (pg10+) handles most cases, pglogical offers more advanced features: DDL replication, row filtering, column filtering, and more granular conflict resolution. Used in complex multi-master setups."
},
{
  id: 225, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is BDR (Bi-Directional Replication) in PostgreSQL?",
  answer: "BDR (from EDB and 2ndQuadrant) enables multi-master PostgreSQL clusters where writes can occur on any node. Conflicts are resolved using configurable conflict resolution strategies (last-update-wins, application-defined).",
  explanation: "BDR is complex and has limitations (DDL restrictions, some transaction types unsupported). It is suitable for geographically distributed writes where latency makes a single-primary unacceptable. Commercial product (Postgres Distributed by EDB)."
},
{
  id: 226, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What are event triggers in PostgreSQL?",
  answer: "Event triggers fire on DDL events (CREATE, ALTER, DROP, TRUNCATE) rather than DML. They can fire on ddl_command_start, ddl_command_end, sql_drop, and table_rewrite events.",
  explanation: "Use cases: DDL auditing (log all schema changes), preventing certain DDL in production, enforcing naming conventions on new tables/columns. CREATE EVENT TRIGGER ddl_audit ON ddl_command_end EXECUTE FUNCTION log_ddl();"
},
{
  id: 227, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_prewarm extension?",
  answer: "pg_prewarm loads relation pages into PostgreSQL's shared buffers (buffer pool) or the OS page cache, warming the cache before query load. pg_autoprewarm automatically saves and restores buffer contents across restarts.",
  explanation: "After a restart, the cache is cold and query performance suffers until the working set is cached. pg_prewarm('mytable') and pg_autoprewarm eliminate this cold-start penalty. Essential for services with strict SLA requirements."
},
{
  id: 228, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_visibility extension?",
  answer: "pg_visibility provides functions to inspect the visibility map, showing which heap pages are all-visible (all rows on the page are visible to all transactions) and all-frozen. Used to diagnose index-only scan issues and freeze status.",
  explanation: "SELECT * FROM pg_visibility('tablename'); shows page-by-page visibility. Pages not marked all-visible require heap fetches even for index-only scans. Running VACUUM marks pages all-visible."
},
{
  id: 229, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the EXPLAIN (FORMAT JSON) option?",
  answer: "EXPLAIN (FORMAT JSON) outputs the query plan as machine-readable JSON instead of text. This enables programmatic plan analysis and is used by tools like pgAdmin, Explain.dalibo.com, and pg_query to visualize and analyze plans.",
  explanation: "The JSON format contains nested plan nodes with all statistics. Automation: parse JSON plans to detect sequential scans, high costs, estimation errors. EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) gives the most complete picture."
},
{
  id: 230, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_qualstats extension?",
  answer: "pg_qualstats tracks statistics about query predicates (WHERE conditions), including how often they are evaluated and selectivity estimates. This helps identify which columns would benefit most from indexes.",
  explanation: "Pairs with pg_query_settings to recommend indexes based on actual query workloads. It is part of the PoWA (PostgreSQL Workload Analyzer) suite for comprehensive performance analysis."
},
{
  id: 231, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the hypopg extension?",
  answer: "HypoPG allows creating hypothetical indexes that don't actually exist on disk. The planner considers them in EXPLAIN without real storage cost, letting you test whether a new index would help before actually creating it.",
  explanation: "SELECT hypopg_create_index('CREATE INDEX ON orders(customer_id)'); then EXPLAIN your query to see if it would use the index. If yes, create the real index. Saves the cost of creating and dropping test indexes."
},
{
  id: 232, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is pg_hint_plan?",
  answer: "pg_hint_plan allows overriding the PostgreSQL query optimizer's decisions using hints in SQL comments. Hints can force or disable index use, set join order, and choose join methods.",
  explanation: "Example: /*+ IndexScan(t idx_id) */ SELECT * FROM t WHERE id=1; forces an index scan. Unlike Oracle's optimizer hints, PostgreSQL has no native hint syntax. pg_hint_plan is an extension. Use sparingly — it bypasses the optimizer and may become stale."
},
{
  id: 233, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_wait_sampling extension?",
  answer: "pg_wait_sampling samples wait events from all PostgreSQL backends at regular intervals, building histograms of what backends are waiting for (lock, I/O, CPU, etc.). Identifies bottlenecks without requiring per-statement monitoring.",
  explanation: "Standard pg_stat_activity shows instantaneous wait events. pg_wait_sampling shows the distribution over time — much better for understanding systemic bottlenecks like disk I/O saturation or lock contention patterns."
},
{
  id: 234, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is Patroni's DCS (Distributed Configuration Store)?",
  answer: "Patroni uses a DCS (etcd, Consul, ZooKeeper, or Kubernetes API) as the consensus system for leader election and cluster state storage. The DCS prevents split-brain — only one node can hold the leader key at a time.",
  explanation: "If the primary cannot reach the DCS, it steps down (fencing). If a standby becomes the new leader via DCS, the old primary is isolated. This ensures data consistency but requires the DCS to be highly available itself."
},
{
  id: 235, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is index concurrently (CREATE INDEX CONCURRENTLY)?",
  answer: "CREATE INDEX CONCURRENTLY builds an index without holding a lock that blocks INSERT/UPDATE/DELETE. It takes longer and uses more resources (two passes over the table) but allows normal DML during index creation.",
  explanation: "Regular CREATE INDEX holds a SHARE lock (blocking writes). CONCURRENTLY acquires only weaker locks. If it fails partway, it leaves an INVALID index that must be dropped. Use CONCURRENTLY for production index additions."
},
{
  id: 236, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What are the different levels of wal_level in PostgreSQL?",
  answer: "minimal: only enough WAL to crash-recover. replica (default): adds WAL needed for streaming replication. logical: adds decoding info for logical replication and CDC. Higher levels increase WAL volume.",
  explanation: "Set wal_level = logical for CDC pipelines (Debezium, wal2json). Set replica for streaming replication. minimal is only appropriate for single-instance databases without any replication needs."
},
{
  id: 237, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_cron extension?",
  answer: "pg_cron is a cron-based job scheduler for PostgreSQL that runs scheduled SQL queries directly inside the database. Cron jobs are stored in the cron.job table and run by a background worker.",
  explanation: "SELECT cron.schedule('0 3 * * *', 'VACUUM ANALYZE'); — schedules a nightly vacuum. pg_cron eliminates the need for external cron jobs for database maintenance tasks. Supports per-database scheduling."
},
{
  id: 238, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the unaccent extension?",
  answer: "unaccent is a text search dictionary that removes accents (diacritics) from characters, enabling accent-insensitive search. Example: 'café' matches 'cafe'. Used with full-text search or with the unaccent() function.",
  explanation: "CREATE EXTENSION unaccent; SELECT unaccent('élève'); returns 'eleve'. Create a function-based index using unaccent(col) for fast accent-insensitive lookups. Often combined with pg_trgm for robust multilingual search."
},
{
  id: 239, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the citext extension?",
  answer: "citext provides a case-insensitive text type. Columns declared as CITEXT perform case-insensitive comparisons automatically without needing LOWER() or ILIKE in queries.",
  explanation: "CREATE EXTENSION citext; email CITEXT UNIQUE; — email addresses are stored as-is but compared case-insensitively. The unique constraint prevents both 'User@Example.com' and 'user@example.com'. Simpler than LOWER() function indexes."
},
{
  id: 240, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is EXCLUDE USING in PostgreSQL?",
  answer: "EXCLUDE USING creates an exclusion constraint — ensuring that for any two rows, the specified expression comparison is false. Example: EXCLUDE USING GIST (room WITH =, during WITH &&) — no two bookings for the same room can overlap.",
  explanation: "Exclusion constraints use GiST or SP-GiST indexes. They generalize UNIQUE constraints (UNIQUE is a special case: two rows cannot have equal values). Used for scheduling, reservations, and interval overlap prevention."
},
{
  id: 241, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_partman run_maintenance() function?",
  answer: "pg_partman's run_maintenance() function creates upcoming partitions and drops old ones according to the configured retention policy. It should be called regularly (via pg_cron or external cron) to keep partition sets current.",
  explanation: "Without maintenance, queries may fail when data falls outside existing partitions. run_maintenance() checks all partition sets and pre-creates configurable-count future partitions. Set premake = 4 to always have 4 future partitions ready."
},
{
  id: 242, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is logical slot invalidation?",
  answer: "A logical replication slot becomes invalidated when WAL required for decoding is deleted before the consumer reads it (due to max_slot_wal_keep_size limit) or when the database undergoes certain incompatible operations.",
  explanation: "An invalidated slot cannot resume from where it left off — the subscriber must be re-created. Monitor slots: WHERE active = false AND catalog_xmin IS NOT NULL in pg_replication_slots. Drop unused slots immediately."
},
{
  id: 243, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_stat_wal view (pg14+)?",
  answer: "pg_stat_wal tracks WAL generation statistics: wal_records, wal_fpi (full page images), wal_bytes, wal_buffers_full (WAL buffer flushes), wal_write, wal_sync counts and timing. Essential for understanding WAL write overhead.",
  explanation: "High wal_fpi count indicates many full-page writes after checkpoints. Reducing checkpoint frequency (increasing checkpoint_timeout) or enabling wal_compression can reduce WAL volume. This view was added in PostgreSQL 14."
},
{
  id: 244, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the difference between pg_restore and psql for restoration?",
  answer: "pg_restore is used for custom-format (-Fc) and directory-format (-Fd) pg_dump files, supporting parallel restore (-j), selective object restore, and pre-data/data/post-data ordering. psql is used for plain SQL dump files.",
  explanation: "pg_restore -j 4 parallelizes the data loading phase, dramatically speeding up restoration of large databases on multi-core servers. Plain SQL dumps are single-threaded and cannot be parallelized easily."
},
{
  id: 245, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_basebackup command?",
  answer: "pg_basebackup takes a physical base backup of a running PostgreSQL cluster, suitable for creating standby servers or as the base for PITR. It copies data directory files and optionally WAL files needed to make the backup consistent.",
  explanation: "pg_basebackup -h primary -U replicator -D /var/lib/postgresql/standby -Xs -P creates a standby-ready backup with streaming WAL. Use -Ft (tar format) and -z (compress) for archive backups."
},
{
  id: 246, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_ctl command?",
  answer: "pg_ctl is the command-line tool for controlling a PostgreSQL server: start, stop (fast/smart/immediate), restart, reload (config only), status, promote (standby to primary), and logrotate.",
  explanation: "pg_ctl stop -m fast — fast shutdown waits for active transactions to finish. stop -m immediate — immediate (crash) shutdown for emergency. promote — converts a hot standby to primary. reload — applies postgresql.conf changes without restart."
},
{
  id: 247, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the planner's cost model in PostgreSQL?",
  answer: "The planner estimates query cost by combining: seq_page_cost (reading a page sequentially), random_page_cost (random page access), cpu_tuple_cost (processing a tuple), cpu_operator_cost, parallel_tuple_cost, etc. Plans with lower estimated cost are chosen.",
  explanation: "random_page_cost = 4.0 (default) vs seq_page_cost = 1.0 models spinning disk. On SSDs, set random_page_cost = 1.1 to reflect similar sequential/random I/O. This significantly affects whether the planner prefers indexes over sequential scans."
},
{
  id: 248, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_stat_io view (pg16+)?",
  answer: "pg_stat_io (PostgreSQL 16+) provides detailed I/O statistics per backend type, I/O object (relation, temp, WAL), and I/O context — hits, reads, writes, evictions, extends, timing. Supersedes indirect I/O tracking.",
  explanation: "This view shows exactly how many I/Os different parts of PostgreSQL (backends, autovacuum, background writer, WAL writer) are generating. Essential for identifying I/O bottlenecks and tuning I/O-related parameters."
},
{
  id: 249, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the maintenance_work_mem parameter?",
  answer: "maintenance_work_mem sets memory available for maintenance operations: VACUUM, CREATE INDEX, ALTER TABLE ADD FOREIGN KEY, CLUSTER. It should be significantly higher than work_mem since these operations are infrequent and benefit greatly from more memory.",
  explanation: "A higher maintenance_work_mem speeds up index creation and VACUUM. Set to 256MB-1GB for fast index builds. Since only a few maintenance operations run at once (unlike work_mem which can be multiplied by connections), it can be set generously."
},
{
  id: 250, category: "PostgreSQL", subcategory: "Advanced Features",
  question: "What is the pg_badger tool?",
  answer: "pgBadger is a fast PostgreSQL log file analyzer that generates detailed HTML reports from PostgreSQL logs — top slow queries, query frequency, lock waits, checkpoint warnings, connection counts over time, and more.",
  explanation: "Enable logging: log_min_duration_statement = 100ms, log_checkpoints, log_connections, log_disconnections, log_lock_waits. Then: pgbadger /var/log/postgresql/*.log -o report.html. Essential for post-incident analysis and regular performance reviews."
},

// --- PostgreSQL QUERIES & OPERATIONS (251-350) ---
{
  id: 251, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you find and kill blocking queries in PostgreSQL?",
  answer: "Find blockers: SELECT pg_blocking_pids(pid) AS blocked_by, pid, query FROM pg_stat_activity WHERE cardinality(pg_blocking_pids(pid)) > 0; Kill: SELECT pg_terminate_backend(blocking_pid);",
  explanation: "pg_blocking_pids() returns the pids blocking a given pid. pg_cancel_backend() sends SIGINT (cancel current query). pg_terminate_backend() sends SIGTERM (terminate connection). Use cancel first; terminate if needed."
},
{
  id: 252, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you check table sizes in PostgreSQL?",
  answer: "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;",
  explanation: "pg_relation_size: table data only. pg_indexes_size: indexes only. pg_total_relation_size: table + indexes + TOAST. pg_size_pretty converts bytes to human-readable format (MB, GB). Use to identify space hogs."
},
{
  id: 253, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you find unused indexes in PostgreSQL?",
  answer: "SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read FROM pg_stat_user_indexes WHERE idx_scan = 0 ORDER BY pg_relation_size(indexrelid) DESC;",
  explanation: "idx_scan = 0 means the index has never been used since the last statistics reset. Check if the database has been running long enough for valid data. Unused indexes waste storage and slow writes. Drop them after confirming in staging."
},
{
  id: 254, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you list all tables and their row counts in PostgreSQL?",
  answer: "SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC; — approximate counts. For exact: SELECT count(*) FROM each table (expensive on large tables).",
  explanation: "n_live_tup is an estimate maintained by autovacuum/analyze — fast but approximate. For exact counts, run SELECT count(*) but expect a sequential scan. For large tables, use approximate counts or pg_class.reltuples."
},
{
  id: 255, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you check the currently running queries and their duration?",
  answer: "SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC;",
  explanation: "Add AND query_start < now() - interval '1 minute' to filter to queries running longer than 1 minute. Check state: 'active' (running), 'idle in transaction' (holding a transaction without doing work — danger), 'waiting' (blocked)."
},
{
  id: 256, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you analyze query performance using pg_stat_statements?",
  answer: "SELECT query, calls, mean_exec_time, total_exec_time, rows, stddev_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20; — finds the most time-consuming queries in aggregate.",
  explanation: "total_exec_time = overall impact. mean_exec_time = per-call slowness. High calls × moderate mean_time = high-frequency query to optimize. Low calls × high mean_time = individual slow query. Reset with pg_stat_statements_reset()."
},
{
  id: 257, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you do a conditional upsert in PostgreSQL?",
  answer: "INSERT INTO products(id, name, price) VALUES(1, 'Widget', 9.99) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price WHERE products.price != EXCLUDED.price;",
  explanation: "EXCLUDED refers to the row that was proposed for insertion. The WHERE clause in DO UPDATE makes the update conditional — only updates if something actually changed. Avoids unnecessary writes and triggers."
},
{
  id: 258, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you efficiently do a bulk upsert in PostgreSQL?",
  answer: "Use INSERT INTO target SELECT ... FROM staging ON CONFLICT (key) DO UPDATE SET ... — or COPY to a temp table then upsert: COPY temp_import FROM STDIN; INSERT INTO target SELECT * FROM temp_import ON CONFLICT DO UPDATE SET ...;",
  explanation: "Direct single-row upserts in a loop are slow. Batch via COPY to temp table + bulk INSERT...ON CONFLICT is orders of magnitude faster for large datasets. Can handle millions of rows efficiently."
},
{
  id: 259, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you get the next value from a sequence in PostgreSQL?",
  answer: "SELECT nextval('sequence_name'); — advances and returns. SELECT currval('sequence_name'); — returns current without advancing (only valid after nextval in same session). SELECT lastval(); — returns last nextval in session.",
  explanation: "Sequences are non-transactional — nextval always advances even if the transaction rolls back, causing gaps. This is intentional — gapless sequences would require serialization. If gapless sequences are required, use a different approach (locking)."
},
{
  id: 260, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you check for index fragmentation in PostgreSQL?",
  answer: "SELECT indexname, pg_size_pretty(pg_relation_size(indexrelid)) AS size FROM pg_stat_user_indexes WHERE schemaname = 'public' ORDER BY pg_relation_size(indexrelid) DESC; For bloat: use pgstattuple extension.",
  explanation: "SELECT * FROM pgstattuple('indexname'); shows free_space percentage. High free_space indicates bloat. REINDEX CONCURRENTLY indexname rebuilds without locking. Run periodically on heavily updated tables."
},
{
  id: 261, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you monitor WAL generation rate in PostgreSQL?",
  answer: "SELECT pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')::numeric) AS total_wal_generated; -- Monitor rate: compare pg_current_wal_lsn() at intervals: SELECT pg_size_pretty(pg_wal_lsn_diff(now_lsn, then_lsn)) / seconds AS bytes_per_second;",
  explanation: "High WAL generation = high write load. Monitor to ensure WAL archiving and replication can keep up. pg_stat_wal (pg14+) provides cumulative WAL statistics including timing."
},
{
  id: 262, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you efficiently paginate results in PostgreSQL?",
  answer: "Avoid OFFSET for large pages — it reads and discards all prior rows. Use keyset/cursor pagination: WHERE (created_at, id) < ($last_ts, $last_id) ORDER BY created_at DESC, id DESC LIMIT 20;",
  explanation: "OFFSET 10000 scans and discards 10000 rows — O(n) cost per page. Keyset pagination always reads exactly LIMIT rows using an index on (created_at, id). It's O(1) per page regardless of position. Caveat: doesn't support jumping to arbitrary pages."
},
{
  id: 263, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you perform a full-text search in PostgreSQL?",
  answer: "SELECT * FROM articles WHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', 'postgresql & performance'); For performance: add a tsvector column with a GIN index: CREATE INDEX ON articles USING GIN(to_tsvector('english', body));",
  explanation: "to_tsvector converts text to a searchable lexeme vector. to_tsquery parses search queries with operators (&, |, !). ts_rank() ranks results. Store pre-computed tsvectors in a generated column for best performance."
},
{
  id: 264, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you search JSONB data efficiently in PostgreSQL?",
  answer: "Use @> for containment: SELECT * FROM events WHERE data @> '{\"type\": \"click\"}'; Create GIN index: CREATE INDEX ON events USING GIN(data); For specific key path: CREATE INDEX ON events USING BTREE((data->>'user_id'));",
  explanation: "GIN index on entire JSONB column supports @>, ?, ?| operators efficiently. For range queries on specific keys (data->>'date' > '2024'), create a B-tree expression index on the extracted value. Combined: GIN for containment, B-tree for ranges."
},
{
  id: 265, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you find duplicate rows in PostgreSQL?",
  answer: "SELECT col1, col2, COUNT(*) FROM table GROUP BY col1, col2 HAVING COUNT(*) > 1; To delete duplicates keeping one: DELETE FROM table WHERE id NOT IN (SELECT MIN(id) FROM table GROUP BY col1, col2);",
  explanation: "Use ctid (physical row address) for deleting duplicates when no unique ID exists: DELETE FROM t WHERE ctid NOT IN (SELECT MIN(ctid) FROM t GROUP BY col1, col2); ctid is PostgreSQL-specific."
},
{
  id: 266, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you update rows in one table based on another table in PostgreSQL?",
  answer: "UPDATE employees e SET salary = s.new_salary FROM salary_updates s WHERE e.id = s.employee_id; PostgreSQL's UPDATE...FROM extension joins the target table with a source and updates multiple rows efficiently.",
  explanation: "This is a PostgreSQL extension to standard SQL (which uses UPDATE...SET WHERE col = (subquery)). The FROM clause can join multiple tables, making complex multi-table updates concise and efficient."
},
{
  id: 267, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you delete rows from one table based on another table?",
  answer: "DELETE FROM orders o USING customers c WHERE o.customer_id = c.id AND c.status = 'deleted'; PostgreSQL's DELETE...USING extension allows joining to other tables for the delete condition.",
  explanation: "Standard SQL uses DELETE WHERE id IN (SELECT id FROM other_table WHERE ...). PostgreSQL's USING is more efficient as it avoids the subquery. Both are valid; USING is PostgreSQL-specific but often faster."
},
{
  id: 268, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you get column information for a table in PostgreSQL?",
  answer: "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position; Or: \\d users in psql.",
  explanation: "information_schema.columns provides portable, ANSI-standard column metadata. pg_attribute provides lower-level, more detailed PostgreSQL-specific information. \\d in psql shows columns, indexes, and constraints together."
},
{
  id: 269, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you create a materialized view and refresh it?",
  answer: "CREATE MATERIALIZED VIEW monthly_sales AS SELECT date_trunc('month', order_date) AS month, SUM(total) FROM orders GROUP BY 1; REFRESH MATERIALIZED VIEW monthly_sales; REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales;",
  explanation: "CONCURRENTLY refresh updates without blocking reads (requires a unique index on the view). Without CONCURRENTLY, refresh acquires an exclusive lock. Schedule refreshes with pg_cron. Materialized views dramatically speed up aggregate dashboards."
},
{
  id: 270, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you handle arrays in PostgreSQL queries?",
  answer: "ANY: WHERE 5 = ANY(int_array_col). ALL: WHERE 5 > ALL(int_array_col). Contains: WHERE int_array_col @> ARRAY[3,4]. Overlap: WHERE int_array_col && ARRAY[3,4]. UNNEST: SELECT UNNEST(array_col). Array construction: ARRAY[1,2,3] or ARRAY(SELECT id FROM t).",
  explanation: "PostgreSQL native arrays are powerful but overused. For queryable collections, consider normalized tables or JSONB instead. Arrays work well for simple, fixed-length collections of primitive values with containment queries."
},
{
  id: 271, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use window functions for running totals and moving averages?",
  answer: "Running total: SUM(amount) OVER(ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). Moving average (7-day): AVG(amount) OVER(ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW).",
  explanation: "The frame ROWS BETWEEN n PRECEDING AND CURRENT ROW creates a sliding window of n+1 rows. ROWS uses exact row counts; RANGE uses value ranges. Use ROWS for moving averages with potential ties in ORDER BY column."
},
{
  id: 272, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between DELETE with RETURNING and a SELECT before DELETE?",
  answer: "DELETE FROM table WHERE condition RETURNING * atomically deletes and returns affected rows in one statement. SELECT-then-DELETE has a race condition where rows can change between the two statements in concurrent environments.",
  explanation: "For queue-style consumption: DELETE FROM jobs WHERE id = (SELECT id FROM jobs WHERE status='pending' LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *; — atomically picks and removes one job without race conditions."
},
{
  id: 273, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you implement soft deletes in PostgreSQL?",
  answer: "Add deleted_at TIMESTAMPTZ DEFAULT NULL column. Soft delete: UPDATE t SET deleted_at = NOW() WHERE id = ?. Filter with WHERE deleted_at IS NULL. Create a partial index: CREATE INDEX ON t(id) WHERE deleted_at IS NULL.",
  explanation: "Soft deletes preserve history but require filtering every query. Use RLS or views to transparently exclude deleted rows. The partial index on WHERE deleted_at IS NULL is small and fast for active-record queries."
},
{
  id: 274, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use COPY for fast bulk import?",
  answer: "COPY table(col1, col2) FROM '/path/file.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',', NULL '\\N'); Or from stdin in application: COPY table FROM STDIN; — write binary data through the connection.",
  explanation: "COPY is 10-100x faster than INSERT for bulk loading. Disable indexes and foreign keys before bulk load, then rebuild. Use UNLOGGED tables for staging. PostgreSQL's COPY protocol is even faster than the SQL COPY command."
},
{
  id: 275, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you monitor checkpoint performance in PostgreSQL?",
  answer: "SELECT checkpoints_timed, checkpoints_req, checkpoint_write_time, checkpoint_sync_time, buffers_checkpoint, buffers_clean, buffers_backend FROM pg_stat_bgwriter;",
  explanation: "checkpoints_req >> checkpoints_timed means checkpoints are forced by WAL filling up (max_wal_size too small). High checkpoint_sync_time indicates I/O bottleneck. buffers_backend high means backends are writing dirty buffers themselves (bad for latency)."
},
{
  id: 276, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you create and use a composite primary key in PostgreSQL?",
  answer: "CREATE TABLE order_items (order_id INT REFERENCES orders(id), product_id INT REFERENCES products(id), quantity INT, PRIMARY KEY (order_id, product_id));",
  explanation: "A composite primary key uniquely identifies rows by multiple columns. Both columns together must be unique. Foreign keys referencing this table must include all PK columns. Composite PKs are common in junction/bridge tables."
},
{
  id: 277, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you handle timezone conversions in PostgreSQL?",
  answer: "AT TIME ZONE operator: SELECT NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'America/New_York'; Convert: SELECT created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata' FROM events;",
  explanation: "Store all timestamps as TIMESTAMPTZ (with timezone) in UTC. Convert for display using AT TIME ZONE. Avoid TIMESTAMP WITHOUT TIMEZONE for user-facing times. SET timezone = 'Asia/Kolkata' sets session timezone for TIMESTAMPTZ display."
},
{
  id: 278, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use LATERAL JOINs for per-row subqueries?",
  answer: "SELECT u.id, recent.* FROM users u, LATERAL (SELECT id, created_at FROM orders WHERE user_id = u.id ORDER BY created_at DESC LIMIT 3) AS recent;",
  explanation: "LATERAL allows the subquery to reference columns from the preceding FROM item. It is executed once per row of the preceding table. More flexible than correlated subqueries in SELECT and more readable than multi-level CTEs for per-row operations."
},
{
  id: 279, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you query the PostgreSQL system catalog to find all indexes?",
  answer: "SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY tablename, indexname;",
  explanation: "pg_indexes is a convenient view over pg_class, pg_index, pg_attribute. For more detail: join pg_index, pg_class (index), pg_class (table), pg_namespace. pg_stat_user_indexes adds usage statistics."
},
{
  id: 280, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you implement table-level auditing in PostgreSQL?",
  answer: "Create an audit table: CREATE TABLE audit_log(op CHAR(1), ts TIMESTAMPTZ, old_data JSONB, new_data JSONB, user_name TEXT); Create a trigger function using TG_OP, OLD, NEW, current_user; attach to every table via triggers.",
  explanation: "Use row_to_json(OLD) and row_to_json(NEW) to capture before/after state as JSONB. hstore_to_jsonb(hstore(NEW) - hstore(OLD)) captures only changed columns. The pgaudit extension provides more comprehensive, configurable auditing."
},

// Continue to 350 for PostgreSQL
{
  id: 281, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the to_tsquery vs plainto_tsquery vs websearch_to_tsquery difference?",
  answer: "to_tsquery: requires explicit operators ('cat & dog', 'super:*'). plainto_tsquery: converts a plain text phrase to AND query automatically ('cat dog' → 'cat & dog'). websearch_to_tsquery: Google-style syntax ('cat dog' AND, 'cat OR dog', '-excluded').",
  explanation: "Use websearch_to_tsquery for user-facing search — it's the most forgiving and familiar. to_tsquery for programmatic queries with full control. phraseto_tsquery for exact phrase matching. All normalize with the same dictionary."
},
{
  id: 282, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the ts_rank() function?",
  answer: "ts_rank(tsvector, tsquery) returns a relevance score (float4) indicating how well a document matches a search query. Higher = more relevant. ts_rank_cd() also considers cover density (proximity of matching terms).",
  explanation: "SELECT *, ts_rank(body_tsv, query) AS rank FROM articles, to_tsquery('english','postgresql') AS query WHERE body_tsv @@ query ORDER BY rank DESC; — returns most relevant articles first."
},
{
  id: 283, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use FILTER clause with aggregate functions?",
  answer: "SELECT COUNT(*) FILTER (WHERE status = 'active') AS active_count, COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_count FROM users;",
  explanation: "FILTER (WHERE condition) is a cleaner alternative to SUM(CASE WHEN ...). It applies the aggregate only to rows matching the filter. Works with all aggregate functions: SUM, AVG, MAX, MIN, COUNT."
},
{
  id: 284, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the GROUPING SETS / CUBE / ROLLUP extension?",
  answer: "GROUPING SETS: computes aggregates for specified grouping combinations in one query. ROLLUP: generates subtotals and a grand total (hierarchical). CUBE: generates all possible combinations of groupings.",
  explanation: "SELECT region, product, SUM(sales) FROM data GROUP BY ROLLUP(region, product); produces rows for (region,product), (region), and (). Equivalent to UNION of three GROUP BY queries but more efficient — single pass."
},
{
  id: 285, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use FOR UPDATE in SELECT queries?",
  answer: "SELECT * FROM orders WHERE id = 1 FOR UPDATE; acquires a row-level exclusive lock on the selected rows, preventing other transactions from updating or locking those rows until the transaction commits or rolls back.",
  explanation: "Use FOR UPDATE to implement optimistic locking verification or for read-modify-write operations. FOR SHARE allows other readers but blocks writers. FOR NO KEY UPDATE is weaker (doesn't block FK checks). FOR KEY SHARE is weaker still."
},
{
  id: 286, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you implement row versioning / optimistic locking in PostgreSQL?",
  answer: "Add version INT column. On update: UPDATE t SET value = new_val, version = version + 1 WHERE id = ? AND version = expected_version; If 0 rows affected, a concurrent update won. Application retries or shows conflict error.",
  explanation: "Optimistic locking assumes conflicts are rare. No locks held during the read-modify-write cycle. The version check at update time detects concurrent modifications. Works well for low-contention scenarios with high read concurrency."
},
{
  id: 287, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between TRUNCATE and DELETE in PostgreSQL performance?",
  answer: "TRUNCATE is O(1) — it drops data file pages and resets table statistics instantly. DELETE is O(n) — rows are marked as dead individually, WAL records written per row, then VACUUM cleans up. TRUNCATE is orders of magnitude faster for full-table clears.",
  explanation: "TRUNCATE acquires ACCESS EXCLUSIVE lock and cannot be filtered (no WHERE). It fires BEFORE and AFTER TRUNCATE statement-level triggers (not row triggers). It resets sequences if RESTART IDENTITY is specified."
},
{
  id: 288, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use ROW LEVEL SECURITY (RLS) for multi-tenancy?",
  answer: "ALTER TABLE orders ENABLE ROW LEVEL SECURITY; CREATE POLICY tenant_isolation ON orders USING (tenant_id = current_setting('app.tenant_id')::INT); Application sets: SET app.tenant_id = '42'; — every query automatically scoped.",
  explanation: "RLS policies are evaluated for every DML statement. Use current_setting() to read application-set context variables. Apply FORCE ROW LEVEL SECURITY to superusers too. Bypass with BYPASSRLS role for administrative operations."
},
{
  id: 289, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you monitor connection counts in PostgreSQL?",
  answer: "SELECT count(*) FROM pg_stat_activity; SELECT state, count(*) FROM pg_stat_activity GROUP BY state; Max connections: SHOW max_connections; Used percentage: SELECT count(*) * 100 / current_setting('max_connections')::int FROM pg_stat_activity;",
  explanation: "High idle in transaction connections indicate clients not committing promptly — dangerous for lock holding and WAL. Connection count near max_connections causes 'too many connections' errors. Use PgBouncer to reduce actual connections."
},
{
  id: 290, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you create a function that returns a table in PostgreSQL?",
  answer: "CREATE OR REPLACE FUNCTION get_active_users(min_age INT) RETURNS TABLE(id INT, name TEXT, age INT) AS $$ BEGIN RETURN QUERY SELECT id, name, age FROM users WHERE age >= min_age AND active = true; END; $$ LANGUAGE plpgsql;",
  explanation: "RETURNS TABLE defines the output schema. RETURN QUERY executes a SELECT and sends all rows. Call with: SELECT * FROM get_active_users(18); Table functions can be used in FROM clauses like regular tables."
},
{
  id: 291, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the RAISE statement in PL/pgSQL?",
  answer: "RAISE is used for error reporting and logging in PL/pgSQL. RAISE NOTICE 'Debug: %', var; — logs a notice. RAISE EXCEPTION 'Error: %', msg; — throws an exception and rolls back. Severity levels: DEBUG, LOG, INFO, NOTICE, WARNING, EXCEPTION.",
  explanation: "RAISE EXCEPTION stops execution and rolls back the current transaction by default. RAISE WARNING and lower levels log without aborting. Use RAISE EXCEPTION for enforcing business rules in stored procedures."
},
{
  id: 292, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you handle exceptions in PL/pgSQL?",
  answer: "BEGIN ... EXCEPTION WHEN unique_violation THEN ... WHEN foreign_key_violation THEN ... WHEN OTHERS THEN RAISE EXCEPTION 'Unexpected error: %', SQLERRM; END;",
  explanation: "Exception handlers in PL/pgSQL catch PostgreSQL error codes. SQLERRM contains the error message, SQLSTATE the code. Catching OTHERS is a catch-all. Note: exceptions roll back the current subtransaction but can be caught."
},
{
  id: 293, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is a generated column with STORED in PostgreSQL?",
  answer: "CREATE TABLE products (price NUMERIC, tax_rate NUMERIC, total NUMERIC GENERATED ALWAYS AS (price * (1 + tax_rate)) STORED); — total is automatically computed and stored on insert/update.",
  explanation: "GENERATED ALWAYS AS ... STORED computes on write and stores physically. You cannot INSERT or UPDATE a STORED generated column directly. Currently PostgreSQL only supports STORED (not VIRTUAL). The expression must be immutable."
},
{
  id: 294, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between CHAR, VARCHAR, and TEXT in PostgreSQL?",
  answer: "In PostgreSQL, TEXT, VARCHAR, and CHAR all use the same underlying storage (varlena). VARCHAR(n) and CHAR(n) add length enforcement. TEXT has no length limit. Performance is identical — TEXT is generally preferred for its simplicity.",
  explanation: "Unlike other databases, PostgreSQL's TEXT and VARCHAR(n) have no performance difference. CHAR(n) pads with spaces and has minor quirks. Best practice: use TEXT for all variable-length strings; add CHECK constraints if length limits are needed."
},
{
  id: 295, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What are PostgreSQL advisory locks and how are they used for distributed locking?",
  answer: "SELECT pg_try_advisory_lock(12345); returns true if the lock was acquired. pg_advisory_lock(12345) blocks until acquired. pg_advisory_unlock(12345) releases. Use integer keys (hash string names: hashtext('job_name')).",
  explanation: "Advisory locks are ideal for preventing concurrent execution of background jobs across multiple application servers. A cron job running on 3 servers can use pg_try_advisory_lock to ensure only one runs at a time."
},
{
  id: 296, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the purpose of SET LOCAL in PostgreSQL?",
  answer: "SET LOCAL changes a configuration parameter for the duration of the current transaction only. It reverts to the previous value when the transaction ends (commit or rollback).",
  explanation: "SET work_mem = '256MB'; changes for session. SET LOCAL work_mem = '256MB'; changes for current transaction. Useful in stored procedures to temporarily increase memory for a single large operation without affecting other sessions."
},
{
  id: 297, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you create a partial unique index in PostgreSQL?",
  answer: "CREATE UNIQUE INDEX uniq_active_email ON users(email) WHERE deleted_at IS NULL; — enforces unique email among active (non-deleted) users, allowing the same email for soft-deleted users.",
  explanation: "Partial unique indexes are more targeted than full unique constraints. Another example: unique pending orders per user: CREATE UNIQUE INDEX ON orders(user_id) WHERE status = 'pending'; — allows only one pending order per user."
},
{
  id: 298, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you check if a PostgreSQL extension is installed?",
  answer: "SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements'; Or: \\dx in psql to list all installed extensions.",
  explanation: "CREATE EXTENSION IF NOT EXISTS extension_name; installs if not present. pg_available_extensions shows all installable extensions. Some extensions require superuser or specific library preloading in postgresql.conf."
},
{
  id: 299, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you see the definition of a view or function in PostgreSQL?",
  answer: "View: SELECT definition FROM pg_views WHERE viewname = 'my_view'; Function: SELECT prosrc FROM pg_proc WHERE proname = 'my_function'; In psql: \\d+ view_name or \\sf function_name.",
  explanation: "pg_get_viewdef(oid) and pg_get_functiondef(oid) return the definition as text. \\sf in psql formats function definitions with proper indentation. Use these when you don't have access to the original migration files."
},
{
  id: 300, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you do conditional aggregation using FILTER in PostgreSQL?",
  answer: "SELECT dept, AVG(salary) FILTER (WHERE gender='M') AS avg_male, AVG(salary) FILTER (WHERE gender='F') AS avg_female, COUNT(*) FILTER (WHERE hire_date > '2023-01-01') AS new_hires FROM employees GROUP BY dept;",
  explanation: "FILTER clause (SQL:2003 standard, supported in PostgreSQL 9.4+) is more readable than CASE WHEN workarounds and potentially faster. It works with any aggregate function and can have different conditions per aggregate in the same query."
},
// Continue 301-350
{
  id: 301, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the ctid in PostgreSQL?",
  answer: "ctid is a system column that represents the physical location of a row: (block_number, item_number). It is unique at any point in time but changes after VACUUM, CLUSTER, or table rewrites. Not a stable row identifier.",
  explanation: "ctid is useful for deleting duplicates when no ID exists. Never use ctid as a long-term row reference. After UPDATE, a row gets a new ctid. After VACUUM FULL or CLUSTER, all ctids change."
},
{
  id: 302, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the SERIALIZABLE isolation level in PostgreSQL?",
  answer: "SERIALIZABLE provides the strictest isolation — transactions execute as if they ran sequentially, one after another. PostgreSQL implements this with SSI (Serializable Snapshot Isolation) rather than locking, using predicate locks.",
  explanation: "SSI detects read-write conflicts that could cause anomalies and aborts one transaction with a serialization_failure error. Applications must retry on this error. SSI has lower overhead than full locking serializability."
},
{
  id: 303, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_try_advisory_lock vs pg_advisory_lock difference?",
  answer: "pg_advisory_lock blocks until the lock is acquired. pg_try_advisory_lock immediately returns TRUE if acquired or FALSE if the lock is held by another session, without blocking.",
  explanation: "Use pg_try_advisory_lock for non-blocking distributed mutex. If it returns FALSE, the job is already running — skip this run. Useful for cron jobs, background workers, and distributed task coordination."
},
{
  id: 304, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the INHERITS clause in CREATE TABLE?",
  answer: "CREATE TABLE child_table (...) INHERITS (parent_table); creates a child that has all columns of the parent plus its own. Queries on the parent table return parent's own rows plus all child rows.",
  explanation: "Table inheritance was PostgreSQL's partitioning mechanism before declarative partitioning (pg10). Legacy code may still use it. It's now less common for partitioning but still useful for polymorphic table structures."
},
{
  id: 305, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between a regular index and a unique index?",
  answer: "A regular index speeds up lookups but allows duplicate values. A unique index enforces that all indexed values are distinct (no two rows can have the same value) and also serves as the backing mechanism for UNIQUE constraints.",
  explanation: "Creating a UNIQUE constraint automatically creates a unique index. You can also create a unique index directly. Unique indexes support all the same features as regular indexes (partial, expression, composite). NULL values are treated as distinct in unique constraints."
},
{
  id: 306, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is jsonb_set() and how do you update JSONB values?",
  answer: "UPDATE users SET metadata = jsonb_set(metadata, '{address, city}', '\"Mumbai\"') WHERE id = 1; — updates nested JSONB key. jsonb_set(target, path, new_value, create_if_missing).",
  explanation: "For more complex updates: metadata = metadata || '{\"new_key\": \"value\"}' (merge). metadata - 'key' (delete key). jsonb_insert() inserts at specific array positions. Avoid updating the entire JSONB blob for single-field changes — it's wasteful."
},
{
  id: 307, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between varchar(255) and text in PostgreSQL for performance?",
  answer: "In PostgreSQL, VARCHAR(255) and TEXT have identical storage and performance. The 255 limit only adds an overhead check on input. TEXT is the idiomatic PostgreSQL type — use it over VARCHAR(n) unless you specifically need length enforcement.",
  explanation: "The VARCHAR(255) habit comes from MySQL where it affects storage. In PostgreSQL, all text types use varlena storage (1-4 byte length prefix + data). Length constraints are pure validation, not storage optimization."
},
{
  id: 308, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use PL/pgSQL to create a simple cache table with insert-or-update?",
  answer: "CREATE OR REPLACE FUNCTION upsert_cache(p_key TEXT, p_value TEXT) RETURNS void AS $$ BEGIN LOOP BEGIN INSERT INTO cache(key, value) VALUES(p_key, p_value); RETURN; EXCEPTION WHEN unique_violation THEN UPDATE cache SET value=p_value WHERE key=p_key; RETURN; END; END LOOP; END; $$ LANGUAGE plpgsql;",
  explanation: "This insert-exception-update loop is a classic PL/pgSQL upsert pattern (before ON CONFLICT existed). Modern code should use INSERT...ON CONFLICT instead. The LOOP handles the unlikely but possible concurrent insert case."
},
{
  id: 309, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the purpose of ANALYZE command?",
  answer: "ANALYZE collects statistics about the contents of tables — value distributions, distinct counts, and null fractions — stored in pg_statistic. The query planner uses these statistics to choose optimal execution plans.",
  explanation: "Run ANALYZE after bulk data loads or significant data changes. VACUUM ANALYZE does both. ANALYZE is fast (samples 300 * default_statistics_target rows per column). Stale statistics cause poor query plans — most performance mysteries trace back to this."
},
{
  id: 310, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the default_statistics_target parameter?",
  answer: "default_statistics_target (default: 100) controls how many most-common-values and histogram buckets ANALYZE collects per column. Higher values = more accurate statistics = better plans, but slower ANALYZE and more pg_statistic storage.",
  explanation: "For highly non-uniform columns driving complex queries, increase per-column: ALTER TABLE orders ALTER COLUMN status SET STATISTICS 500; Then ANALYZE. For uniform columns, the default is sufficient."
},
{
  id: 311, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is pg_stat_user_indexes used for?",
  answer: "pg_stat_user_indexes tracks index usage: idx_scan (how many times the index was used), idx_tup_read (rows fetched via index), idx_tup_fetch (table rows fetched using index rows). Identifies unused and heavily-used indexes.",
  explanation: "Reset statistics with pg_stat_reset() to start fresh. Monitor after letting the database run for a representative period (a week+). Combine with pg_indexes for index definitions and pg_relation_size for index sizes."
},
{
  id: 312, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you implement a priority queue using PostgreSQL?",
  answer: "CREATE TABLE jobs (id BIGSERIAL PK, priority INT, payload JSONB, status TEXT DEFAULT 'pending'); SELECT * FROM jobs WHERE status='pending' ORDER BY priority DESC, id ASC LIMIT 1 FOR UPDATE SKIP LOCKED;",
  explanation: "SKIP LOCKED ensures multiple workers each pick different jobs without waiting for each other. ORDER BY priority handles job priority. An index on (status, priority, id) WHERE status='pending' makes this very efficient."
},
{
  id: 313, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the ARRAY data type and how do you query it?",
  answer: "PostgreSQL supports native arrays: tags TEXT[], scores INT[]. Query: WHERE 'postgresql' = ANY(tags). Index with GIN: CREATE INDEX ON articles USING GIN(tags). Aggregate: SELECT ARRAY_AGG(name) FROM users;",
  explanation: "Arrays are useful for simple collections but have tradeoffs: difficult to join, no individual-element foreign keys, no row-level control. For queryable collections with rich relationships, normalize to a separate table instead."
},
{
  id: 314, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between GRANT ON TABLE and GRANT ON SCHEMA?",
  answer: "GRANT SELECT ON TABLE users TO analyst; grants SELECT on that specific table. GRANT USAGE ON SCHEMA public TO analyst; allows the role to see/access objects in the schema. GRANT SELECT ON ALL TABLES IN SCHEMA public TO analyst; grants on all current tables.",
  explanation: "USAGE on schema is required to access objects within it. DEFAULT PRIVILEGES: ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analyst; — auto-grants on future tables. Both USAGE and table privileges are typically needed."
},
{
  id: 315, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is pg_dump with --schema-only and --data-only?",
  answer: "--schema-only: exports only DDL (CREATE TABLE, INDEX, CONSTRAINTS) without data. --data-only: exports only INSERT statements or COPY data without schema. Useful for separating structure from content in migrations.",
  explanation: "pg_dump --schema-only is used to copy schema to new environments. --data-only with specific tables is used for seeding reference data. --table=tablename restricts to a single table. Combine with --section=pre-data/data/post-data for fine control."
},
{
  id: 316, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the LISTEN/NOTIFY mechanism used for in practice?",
  answer: "Real-time application notifications (new record inserted → notify frontend). Cache invalidation (DB change → notify app to clear cache). Job queue notifications (new job → wake up sleeping workers). Database-level event bus.",
  explanation: "NOTIFY channel, payload; LISTEN channel; pg_notify(channel, payload) from PL/pgSQL triggers. Applications using libpq, asyncpg, node-postgres can receive notifications asynchronously. Notifications are best-effort — lost if nobody is listening."
},
{
  id: 317, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is pg_restore --list and --use-list?",
  answer: "pg_restore --list backup.dump outputs the table of contents (TOC). Edit it to select/reorder/skip objects. pg_restore --use-list edited_toc.txt backup.dump restores only specified objects in specified order.",
  explanation: "This enables selective restoration: restore only specific tables, restore in custom order (e.g., disable constraints, load data, re-enable), skip failed objects. Essential for large database migrations and partial restores."
},
{
  id: 318, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is synchronous_commit in PostgreSQL?",
  answer: "synchronous_commit = on: wait for WAL to be written to disk on primary before acknowledging commit. off: acknowledge before WAL is flushed (async, ~3-600x faster writes, up to wal_writer_delay data loss risk on crash). remote_write/remote_apply: wait for standbys.",
  explanation: "For non-critical high-throughput writes, SET LOCAL synchronous_commit = off; — this is a session/transaction-level setting. The risk is very small (< wal_writer_delay ms of lost commits) and is suitable for logging, analytics, and cache tables."
},
{
  id: 319, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the purpose of the pg_class system catalog table?",
  answer: "pg_class catalogs tables, indexes, sequences, views, materialized views, composite types, and TOAST tables. Key columns: relname (name), relkind (r=table, i=index, S=seq, v=view, m=matview), reltuples (row count estimate), relpages (page count).",
  explanation: "SELECT relname, relkind, reltuples FROM pg_class WHERE relkind = 'r' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') ORDER BY reltuples DESC; — lists tables by approximate row count."
},
{
  id: 320, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use jsonb_path_query for complex JSONB queries in PostgreSQL?",
  answer: "SELECT * FROM events WHERE jsonb_path_exists(data, '$.users[*].age ? (@ > 25)'); — finds events where any user is older than 25. SQL/JSON path language provides XPath-like navigation for JSONB.",
  explanation: "jsonb_path_query, jsonb_path_exists, jsonb_path_match use SQL/JSON path expressions (pg12+). More expressive than @> for complex nested queries. jsonb_path_query_array returns results as a JSON array."
},
{
  id: 321, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_get_expr function?",
  answer: "pg_get_expr(pg_node_tree, relid) converts an internal expression tree to readable SQL. Used to read index predicates (pg_index.indpred), generated column expressions, check constraints, etc. from system catalogs.",
  explanation: "SELECT pg_get_expr(indpred, indrelid) AS predicate FROM pg_index WHERE indpred IS NOT NULL; — shows all partial index conditions across the database. Useful for database documentation and audit."
},
{
  id: 322, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you implement change history / temporal tables in PostgreSQL?",
  answer: "Option 1: Trigger-based — write old row to a history table on UPDATE/DELETE. Option 2: Bitemporal design — valid_from/valid_to columns. Option 3: Use audit trigger extension. Example: temporal_tables extension adds system-period temporal support.",
  explanation: "SELECT * FROM employees_history WHERE employee_id = 42 AND valid_from <= '2023-06-01' AND (valid_to IS NULL OR valid_to > '2023-06-01'); — finds employee state at a point in time. Essential for compliance and debugging."
},
{
  id: 323, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the contrib directory in PostgreSQL?",
  answer: "The contrib directory contains additional modules and extensions that ship with PostgreSQL but are not installed by default: pg_stat_statements, pg_trgm, hstore, uuid-ossp, tablefunc (crosstab), fuzzystrmatch (soundex, levenshtein), pgcrypto, and many more.",
  explanation: "Install with: CREATE EXTENSION extension_name; Most contrib extensions are safe to use in production. They are maintained by the PostgreSQL Global Development Group and versioned with PostgreSQL itself."
},
{
  id: 324, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the tablefunc extension and its crosstab() function?",
  answer: "tablefunc provides crosstab() for pivot queries in PostgreSQL. SELECT * FROM crosstab('SELECT row, col, val FROM data ORDER BY 1,2', 'SELECT DISTINCT col FROM data ORDER BY 1') AS ct(row TEXT, q1 INT, q2 INT, q3 INT);",
  explanation: "crosstab converts vertical data to horizontal (pivot). The first query provides (row_name, category, value). The second provides the ordered category list. This is PostgreSQL's native pivot mechanism."
},
{
  id: 325, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the levenshtein() function in PostgreSQL?",
  answer: "levenshtein(a, b) from fuzzystrmatch computes the edit distance (minimum number of character insertions, deletions, substitutions to transform a to b). Used for fuzzy string matching and typo correction.",
  explanation: "SELECT * FROM products WHERE levenshtein(name, 'Aplpe') <= 2; — finds products similar to the misspelled 'Aplpe'. Expensive for large tables without additional filtering. Combine with pg_trgm GIN index for pre-filtering."
},
{
  id: 326, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "How do you use recursive CTEs for graph traversal in PostgreSQL?",
  answer: "WITH RECURSIVE graph_traversal(node_id, path, depth) AS (SELECT start_node, ARRAY[start_node], 0 UNION ALL SELECT e.target, g.path || e.target, g.depth + 1 FROM edges e JOIN graph_traversal g ON e.source = g.node_id WHERE NOT e.target = ANY(g.path) AND g.depth < 10) SELECT * FROM graph_traversal;",
  explanation: "The NOT = ANY(path) prevents infinite cycles. Depth limit prevents runaway recursion. This pattern handles both trees and DAGs. For large graphs, specialized graph databases (Neo4j) or PostgreSQL with Apache AGE extension may be more appropriate."
},
{
  id: 327, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_logical_slot_get_changes function?",
  answer: "SELECT * FROM pg_logical_slot_get_changes('slot_name', NULL, NULL); reads and removes change records from a logical replication slot. pg_logical_slot_peek_changes reads without consuming (for inspection).",
  explanation: "Logical decoding output format depends on the output plugin: pgoutput (built-in, used by logical replication), wal2json (JSON output for CDC pipelines), test_decoding (text format for debugging)."
},
{
  id: 328, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_filenode_relation function?",
  answer: "pg_filenode_relation(tablespace_oid, filenode_oid) returns the table/index name corresponding to a data file's filenode. Useful when diagnosing large data files on disk and mapping them to database objects.",
  explanation: "ls -la $PGDATA/base/database_oid/ shows files by filenode. pg_relation_filenode(table_oid) converts table OID to filenode. These help identify which table corresponds to a large or growing data file on disk."
},
{
  id: 329, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is SET CONSTRAINTS in PostgreSQL?",
  answer: "SET CONSTRAINTS {ALL | constraint_name} {DEFERRED | IMMEDIATE} changes the deferral mode of deferrable constraints within the current transaction. DEFERRED: check at commit. IMMEDIATE: check after each statement.",
  explanation: "SET CONSTRAINTS ALL DEFERRED; — allows temporarily violating constraints within a transaction. Useful for data migration scripts that need to reorder insertions or swap unique values. Only works on DEFERRABLE constraints."
},
{
  id: 330, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_stattuple extension?",
  answer: "pg_stattuple analyzes the physical storage of a table or index, reporting: tuple count, dead tuple count, live/dead tuple bytes, free space percentage. Provides data to quantify table and index bloat.",
  explanation: "SELECT * FROM pgstattuple('mytable'); dead_tuple_percent > 20% indicates VACUUM needed. free_space_percent high indicates fragmentation. pgstatindex('myindex') reports index fill factor and fragmentation."
},
{
  id: 331, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pageinspect extension?",
  answer: "pageinspect provides functions to inspect raw database page contents — heap pages, B-tree pages, BRIN pages. Useful for deep debugging of data corruption, MVCC visibility, and storage internals.",
  explanation: "SELECT * FROM heap_page_items(get_raw_page('tablename', 0)); shows items on block 0 with ctid, xmin, xmax, visibility flags. Educational for understanding PostgreSQL internals. Not for routine use."
},
{
  id: 332, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_walinspect extension (pg14+)?",
  answer: "pg_walinspect provides functions to inspect WAL record contents: pg_get_wal_records_info(start_lsn, end_lsn) returns WAL records with their type, size, and block references. Educational for understanding WAL structure.",
  explanation: "SELECT * FROM pg_get_wal_records_info(pg_current_wal_lsn() - '1MB'::pg_lsn, pg_current_wal_lsn()); shows recent WAL records. Useful for WAL volume analysis and understanding what operations generate the most WAL."
},
{
  id: 333, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the auto_explain extension?",
  answer: "auto_explain automatically logs the execution plan of slow queries (above log_min_duration) to the PostgreSQL log, including ANALYZE data. It eliminates the need to manually run EXPLAIN ANALYZE for intermittently slow queries.",
  explanation: "Load in postgresql.conf: shared_preload_libraries = 'auto_explain'; auto_explain.log_min_duration = '1s'; auto_explain.log_analyze = true; auto_explain.log_nested_statements = true; Invaluable for production query troubleshooting."
},
{
  id: 334, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between pg_cancel_backend and pg_terminate_backend?",
  answer: "pg_cancel_backend(pid) sends SIGINT — cancels the current query but leaves the connection open. The session can start new queries. pg_terminate_backend(pid) sends SIGTERM — terminates the entire backend process, closing the connection.",
  explanation: "Always try cancel first; terminate if cancel doesn't work within a reasonable time. Normal users can only cancel their own backends; superusers and pg_signal_backend role can cancel any backend."
},
{
  id: 335, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the max_wal_size and min_wal_size parameter?",
  answer: "max_wal_size: maximum WAL segment files to keep between checkpoints. If WAL grows beyond this, a checkpoint is forced. min_wal_size: minimum WAL space to retain. Larger max_wal_size allows longer periods between checkpoints.",
  explanation: "Increasing max_wal_size reduces checkpoint frequency (improving write performance) at the cost of longer crash recovery time. Default max_wal_size = 1GB. For write-heavy systems, 4-16GB is common. Ensure disk has sufficient space."
},
{
  id: 336, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is random_page_cost and why does it matter for SSD?",
  answer: "random_page_cost (default 4.0) represents the cost of reading a random page vs a sequential page (seq_page_cost = 1.0). On SSDs, random and sequential I/O are similar in cost — set random_page_cost = 1.1 to encourage index use.",
  explanation: "With default random_page_cost = 4, the planner often prefers sequential scans over index scans for medium-sized tables. On SSDs, this is suboptimal. Changing to 1.1 significantly increases index usage and improves many query plans."
},
{
  id: 337, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the checkpoint_completion_target parameter?",
  answer: "checkpoint_completion_target (default 0.9) controls how much of the checkpoint interval the checkpoint process uses for writing dirty pages. 0.9 means 90% of the time between checkpoints is used for gradual writes.",
  explanation: "Higher values spread I/O more evenly, reducing spikes. Lower values concentrate writes at the start of each checkpoint period. 0.9 is the recommended production value — it avoids I/O bursts that would impact query latency."
},
{
  id: 338, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the enable_seqscan, enable_indexscan planner parameter?",
  answer: "enable_seqscan = off discourages (doesn't prohibit) sequential scans. enable_indexscan = off discourages index scans. Used for testing or forcing the planner to choose alternative plans, not for production use.",
  explanation: "SET enable_seqscan = off; EXPLAIN SELECT * FROM big_table WHERE id = 42; — forces index plan. If the result is much cheaper, it indicates the planner is mischoosing due to bad statistics. Fix statistics rather than using these settings in production."
},
{
  id: 339, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is pg_upgrade and what does it do internally?",
  answer: "pg_upgrade upgrades PostgreSQL major version by: 1) creating the new cluster. 2) copying system catalogs (converted). 3) either hard-linking or copying data files. 4) updating metadata. Data files in compatible format (same OS, same architecture) can be linked instead of copied.",
  explanation: "pg_upgrade --link creates hard links, taking seconds even for TB databases. Without --link, it copies files (hours for large databases). After pg_upgrade, run ANALYZE on the new cluster as statistics need rebuilding."
},
{
  id: 340, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the PostgreSQL maximum database size?",
  answer: "PostgreSQL has no hard limit on total database size — it is limited only by available disk space. Individual table size is limited by available disk space (tables can be multiple TB). Row size is effectively unlimited due to TOAST.",
  explanation: "Single PostgreSQL databases in the hundreds of GB to several TB range are common in production. Beyond a few TB, sharding (Citus) or partitioning becomes important for manageability. The theoretical limit is ~32 TB per table (file system willing)."
},
{
  id: 341, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_dump --exclude-table-data option?",
  answer: "pg_dump --exclude-table-data=tablename creates a full schema dump but skips the data for specified tables. Useful for excluding large log tables from backups when only the schema matters.",
  explanation: "pg_dump --exclude-table-data='*_log' (glob pattern) excludes all tables ending in _log. Combine with --table for selective dumps. Essential for taking fast dev/staging database copies without large audit/log tables."
},
{
  id: 342, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is row_security and its FORCE ROW LEVEL SECURITY option?",
  answer: "FORCE ROW LEVEL SECURITY makes RLS policies apply even to table owners and superusers (they normally bypass RLS). Without FORCE, table owners always see all rows. Use FORCE for true multi-tenant isolation even from DBAs.",
  explanation: "ALTER TABLE orders FORCE ROW LEVEL SECURITY; — even psql sessions running as the table owner see only their tenant's rows. Combine with SET ROLE to allow DBA override when needed for maintenance."
},
{
  id: 343, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between pg_dump and pg_dumpall?",
  answer: "pg_dump: backs up a single database (schema + data). pg_dumpall: backs up all databases plus global objects (roles, tablespaces) that exist outside any single database. Both are needed for a complete PostgreSQL cluster backup.",
  explanation: "pg_dumpall --globals-only backs up only roles and tablespaces — useful when restoring to a new cluster without repeating global objects. Use pg_dump for per-database backups and pg_dumpall for cluster-wide metadata."
},
{
  id: 344, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_waldump utility?",
  answer: "pg_waldump parses and prints human-readable WAL records from WAL segment files. Useful for understanding what operations generated WAL records, debugging replication issues, and learning WAL internals.",
  explanation: "pg_waldump -n 100 000000010000000000000001 prints 100 records from a WAL file. Each record shows LSN, transaction ID, resource manager, and description. Not for routine use — educational and debugging tool."
},
{
  id: 345, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the pg_archivecleanup utility?",
  answer: "pg_archivecleanup removes obsolete WAL archive files — those older than the latest completed backup's WAL starting point. Called by restore_command or manually to manage archive storage.",
  explanation: "Without cleanup, WAL archives grow indefinitely. Configure in restore_command or as a cron job. barman and pgBackRest tools handle archive cleanup automatically as part of their backup management."
},
{
  id: 346, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the difference between RESET and SET to DEFAULT for configuration?",
  answer: "SET parameter = DEFAULT and RESET parameter both restore a configuration parameter to its default value (from postgresql.conf, ALTER SYSTEM, or compiled-in default). They are functionally equivalent for session-level settings.",
  explanation: "RESET parameter is slightly more idiomatic. RESET ALL resets all session-level settings to their defaults, useful for cleanup in connection pools or testing."
},
{
  id: 347, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is pg_stat_all_tables vs pg_stat_user_tables?",
  answer: "pg_stat_user_tables shows statistics for user-defined tables. pg_stat_all_tables includes user tables plus system catalog tables (pg_catalog schema). pg_stat_sys_tables shows only system tables.",
  explanation: "For application tuning, use pg_stat_user_tables. If diagnosing system catalog bloat or catalog query performance (common in heavy DDL workloads), use pg_stat_all_tables to include catalog tables."
},
{
  id: 348, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the purpose of the wal_buffers parameter?",
  answer: "wal_buffers (default: 1/32 of shared_buffers, min 64KB) is the amount of shared memory for WAL data before it is written to disk. Larger wal_buffers reduces WAL write flushes for high-concurrency workloads.",
  explanation: "The default is usually sufficient. On systems with very high concurrent write workloads, increasing to 16-64MB can reduce WAL write pressure. WAL is flushed at every commit, so very large wal_buffers has diminishing returns."
},
{
  id: 349, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is the huge_pages parameter in PostgreSQL?",
  answer: "huge_pages = on tells PostgreSQL to use Linux huge pages (2MB or 1GB) for shared_buffers allocation. Reduces TLB pressure and memory management overhead for large shared_buffers (>32GB).",
  explanation: "Requires Linux huge pages to be pre-allocated (vm.nr_hugepages). Benefits: reduced page table size, faster TLB lookups. Significant performance improvement for very large memory servers. No benefit for small shared_buffers."
},
{
  id: 350, category: "PostgreSQL", subcategory: "Queries & Operations",
  question: "What is pg_identify_object and how is it used?",
  answer: "pg_identify_object(classid, objid, objsubid) returns the type, schema, name, and identity of a database object given its OID. Used to decode object OIDs found in pg_depend, pg_locks, error messages, and WAL records.",
  explanation: "SELECT pg_identify_object(classid, objid, objsubid) FROM pg_depend WHERE refobjid = 'mytable'::regclass; — shows all objects that depend on 'mytable'. Invaluable for understanding object dependency chains."
},

// ============================================================
// MONGODB QUESTIONS (351-525)
// ============================================================

// --- MONGODB BASICS (351-400) ---
{
  id: 351, category: "MongoDB", subcategory: "Basics",
  question: "What is MongoDB and how does it differ from relational databases?",
  answer: "MongoDB is a document-oriented NoSQL database that stores data as BSON (Binary JSON) documents in collections. Unlike RDBMS, it has a flexible schema (no fixed columns), stores related data together in one document, and scales horizontally with sharding.",
  explanation: "Key differences: no fixed schema, documents instead of rows, collections instead of tables, embedded documents instead of JOINs, horizontal scaling built-in. Trade-offs: no ACID transactions (across collections, partially available in MongoDB 4+), eventual consistency options."
},
{
  id: 352, category: "MongoDB", subcategory: "Basics",
  question: "What is a document in MongoDB?",
  answer: "A document is a set of key-value pairs stored in BSON format. Keys are strings; values can be strings, numbers, booleans, arrays, nested documents, dates, ObjectId, null, binary, etc. Maximum document size is 16MB.",
  explanation: "Documents are flexible — different documents in the same collection can have different fields. Example: {_id: ObjectId('...'), name: 'Alice', tags: ['admin', 'user'], address: {city: 'Mumbai', zip: '400001'}, createdAt: ISODate('...')}."
},
{
  id: 353, category: "MongoDB", subcategory: "Basics",
  question: "What is a collection in MongoDB?",
  answer: "A collection is a group of MongoDB documents, analogous to a table in RDBMS. Collections do not enforce a schema by default (though you can add schema validation). Documents in a collection typically share a similar structure.",
  explanation: "Collections are created implicitly when you first insert a document. Collection names are case-sensitive. MongoDB supports up to 100 levels of document nesting. Collection-level operations (drop, rename, stats) affect all documents."
},
{
  id: 354, category: "MongoDB", subcategory: "Basics",
  question: "What is BSON?",
  answer: "BSON (Binary JSON) is the binary serialization format used by MongoDB. It extends JSON with additional types: Date, Binary, ObjectId, NumberLong, NumberDecimal, Regex, etc. BSON is more space-efficient for binary data but slightly larger than JSON for text.",
  explanation: "BSON is designed for speed and traversability. It encodes length information, enabling fast element skipping. It supports types JSON doesn't have (Date, Binary). MongoDB drivers serialize your language objects to BSON automatically."
},
{
  id: 355, category: "MongoDB", subcategory: "Basics",
  question: "What is ObjectId in MongoDB?",
  answer: "ObjectId is a 12-byte BSON type used as the default primary key (_id). Structure: 4-byte timestamp, 5-byte random value, 3-byte incrementing counter. ObjectIds are globally unique, sortable by creation time, and generated by the driver (not MongoDB).",
  explanation: "ObjectId('507f1f77bcf86cd799439011') — the first 8 hex chars are a Unix timestamp. ObjectId().getTimestamp() returns creation time. Client-side generation means insert performance doesn't bottleneck on the server."
},
{
  id: 356, category: "MongoDB", subcategory: "Basics",
  question: "What is the _id field in MongoDB?",
  answer: "Every MongoDB document must have an _id field that uniquely identifies it within a collection. If not provided on insert, MongoDB auto-generates an ObjectId. _id can be any BSON type (string, int, UUID, custom object) but must be unique and immutable.",
  explanation: "A unique index on _id is automatically created. Never update _id values. Using meaningful _id values (like username or email) can eliminate a separate unique index but makes shard key selection important."
},
{
  id: 357, category: "MongoDB", subcategory: "Basics",
  question: "What are the basic CRUD operations in MongoDB?",
  answer: "Create: insertOne(), insertMany(). Read: findOne(), find(). Update: updateOne(), updateMany(), replaceOne(). Delete: deleteOne(), deleteMany(). Upsert: update with {upsert: true}.",
  explanation: "db.users.insertOne({name:'Alice'}); db.users.find({age:{$gt:18}}); db.users.updateOne({_id:id},{$set:{name:'Bob'}}); db.users.deleteMany({status:'inactive'}); These are the foundational operations for all MongoDB interactions."
},
{
  id: 358, category: "MongoDB", subcategory: "Basics",
  question: "What is the difference between find() and findOne()?",
  answer: "find() returns a cursor to all matching documents. findOne() returns the first matching document directly (not a cursor). findOne() is equivalent to find().limit(1) but more convenient when you expect exactly one result.",
  explanation: "Cursors are lazy — find() doesn't execute immediately. Iterate with forEach(), toArray(), or the async iteration protocol. findOne() is simpler for key lookups. Always add a sort to findOne() if document order matters."
},
{
  id: 359, category: "MongoDB", subcategory: "Basics",
  question: "What are MongoDB query operators?",
  answer: "Comparison: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin. Logical: $and, $or, $not, $nor. Element: $exists, $type. Evaluation: $regex, $expr, $text, $where. Array: $all, $elemMatch, $size.",
  explanation: "Example: db.products.find({price: {$gte: 10, $lte: 100}, category: {$in: ['A','B']}, name: {$regex: /^Widget/i}}); — price range AND category AND name pattern. Operators are key to expressive query building."
},
{
  id: 360, category: "MongoDB", subcategory: "Basics",
  question: "What are MongoDB update operators?",
  answer: "$set: set field value. $unset: remove field. $inc: increment. $mul: multiply. $rename: rename field. $push/$pull/$addToSet: array operations. $pop: remove first/last. $min/$max: update only if smaller/larger. $currentDate: set to current date.",
  explanation: "Example: db.accounts.updateOne({_id: id}, {$inc: {balance: -100}, $set: {lastUpdated: new Date()}, $push: {transactions: {amount: -100}}}); — atomic multi-field update. Never update without $set unless replacing the whole document."
},
{
  id: 361, category: "MongoDB", subcategory: "Basics",
  question: "What is the difference between $set and $replace (replaceOne)?",
  answer: "$set updates only specified fields, leaving other fields intact. replaceOne replaces the entire document with the new one (keeping only _id). Use $set for partial updates; replaceOne only when intentionally replacing everything.",
  explanation: "db.users.updateOne({_id: id}, {name: 'Bob'}) is a replace (removes all other fields). db.users.updateOne({_id: id}, {$set: {name: 'Bob'}}) only changes name. Missing $set is a common mistake that deletes data."
},
{
  id: 362, category: "MongoDB", subcategory: "Basics",
  question: "What is the aggregation pipeline in MongoDB?",
  answer: "The aggregation pipeline processes documents through a sequence of stages, each transforming the data. Stages: $match, $group, $project, $sort, $limit, $skip, $unwind, $lookup, $addFields, $count, $facet, $bucket, $out, $merge.",
  explanation: "db.orders.aggregate([$match: {status:'complete'}}, {$group: {_id: '$customer_id', total: {$sum: '$amount'}}}, {$sort: {total:-1}}, {$limit: 10}]); — top 10 customers by spend. Pipelines are composable and efficient."
},
{
  id: 363, category: "MongoDB", subcategory: "Basics",
  question: "What is the $match stage?",
  answer: "$match filters documents in the pipeline using standard MongoDB query syntax. Place $match as early as possible to reduce document volume in subsequent stages. Early $match can use indexes.",
  explanation: "Use $match like a WHERE clause: {$match: {status: 'active', age: {$gte: 18}}}. A $match at the start of a pipeline uses collection indexes. A $match after $group filters aggregated results (like HAVING)."
},
{
  id: 364, category: "MongoDB", subcategory: "Basics",
  question: "What is the $group stage?",
  answer: "$group groups documents by an _id expression and computes aggregations. Accumulators: $sum, $avg, $min, $max, $push (array), $addToSet (unique array), $first, $last, $count.",
  explanation: "Example: {$group: {_id: '$department', avgSalary: {$avg: '$salary'}, employees: {$push: '$name'}, headcount: {$sum: 1}}}; — groups by department, computing average salary, list of names, and count."
},
{
  id: 365, category: "MongoDB", subcategory: "Basics",
  question: "What is the $project stage?",
  answer: "$project reshapes documents — include/exclude fields (1/0), add computed fields, rename fields. Example: {$project: {_id: 0, fullName: {$concat: ['$firstName', ' ', '$lastName']}, ageCategory: {$cond: [{$gte: ['$age', 18]}, 'adult', 'minor']}}}",
  explanation: "Like SELECT in SQL. By default, all fields are excluded except those explicitly set to 1. Setting any field to 1 includes only that field (plus _id unless excluded). $project with computed fields is very powerful for data transformation."
},
{
  id: 366, category: "MongoDB", subcategory: "Basics",
  question: "What is the $unwind stage?",
  answer: "$unwind deconstructs an array field — for each element in the array, it outputs one document with the field replaced by that element. Used to work with array elements as individual documents.",
  explanation: "Example: {$unwind: '$tags'} on a document with tags:['a','b','c'] produces three documents with tags:'a', tags:'b', tags:'c'. Use {path:'$arr', includeArrayIndex:'idx', preserveNullAndEmpty:true} for more control."
},
{
  id: 367, category: "MongoDB", subcategory: "Basics",
  question: "What is the $lookup stage?",
  answer: "$lookup performs a left outer join to another collection. {$lookup: {from:'products', localField:'product_id', foreignField:'_id', as:'product'}} — joins orders with products by matching product_id.",
  explanation: "Result is an array 'product' (even if only one match). Use {$unwind: '$product'} after to flatten. Also supports pipeline-based lookups for more complex joins: {$lookup: {from:'...',let:{...},pipeline:[...],as:'...'}}."
},
{
  id: 368, category: "MongoDB", subcategory: "Basics",
  question: "What is the $sort stage?",
  answer: "{$sort: {field: 1}} sorts ascending, {$sort: {field: -1}} descending. Can sort by multiple fields: {$sort: {priority: -1, createdAt: 1}}. Sorting large result sets without a supporting index requires an in-memory sort (memory-limited).",
  explanation: "A $sort immediately following a $match can use an index for the combined operation. A $sort of a $group result requires in-memory sorting. 100MB memory limit per stage — use allowDiskUse: true for larger sorts."
},
{
  id: 369, category: "MongoDB", subcategory: "Basics",
  question: "What is the $limit and $skip stage?",
  answer: "$limit: {$limit: 10} passes only the first 10 documents. $skip: {$skip: 20} skips the first 20. Used together for pagination: skip to offset, then limit page size.",
  explanation: "Like SQL LIMIT and OFFSET. For keyset pagination, use $match with last-seen values instead of $skip, because $skip still scans skipped documents. $limit placed early reduces pipeline processing overhead."
},
{
  id: 370, category: "MongoDB", subcategory: "Basics",
  question: "What is the $addFields stage?",
  answer: "$addFields adds new fields (or replaces existing ones) to documents without affecting other fields. Shorthand for $project that includes all existing fields by default.",
  explanation: "Example: {$addFields: {totalWithTax: {$multiply: ['$total', 1.18]}, year: {$year: '$createdAt'}}}; — adds two computed fields without touching any existing fields. More convenient than $project for adding fields."
},
{
  id: 371, category: "MongoDB", subcategory: "Basics",
  question: "What is the $out and $merge stage?",
  answer: "$out writes the pipeline result to a new or replaced collection. $merge writes results into an existing collection with merge/replace/fail/keepExisting/insert actions per document.",
  explanation: "$out drops and replaces the target collection atomically. $merge is more flexible — can update existing documents while leaving others intact. Use $merge for maintaining materialized views or pre-aggregated summary collections."
},
{
  id: 372, category: "MongoDB", subcategory: "Basics",
  question: "What is the difference between MongoDB and a relational database at the data model level?",
  answer: "MongoDB: flexible schema, nested documents, arrays, no JOINs (embed related data). RDBMS: strict schema, normalized tables, foreign keys, JOINs. MongoDB trades normalization for locality (related data in one document, one query).",
  explanation: "One-to-one: embed. One-to-many: embed array (if small) or reference (if large/independently queried). Many-to-many: references. The key question: 'Do you read/write this data together?' — if yes, embed it."
},
{
  id: 373, category: "MongoDB", subcategory: "Basics",
  question: "When should you embed vs reference in MongoDB?",
  answer: "Embed: data that is always read together, small arrays, data not queried independently, strong ownership (cascade delete). Reference: large/growing arrays, independently queried data, many-to-many, frequently updated shared data.",
  explanation: "A blog post with comments (few): embed comments. A blog post with millions of comments: reference comments in a separate collection. A product with variants: embed. A product with shared supplier data: reference the supplier."
},
{
  id: 374, category: "MongoDB", subcategory: "Basics",
  question: "What are MongoDB indexes and why are they needed?",
  answer: "Indexes are data structures that store a small portion of collection data in a traversable form, enabling fast document lookups without full collection scans. Without indexes, MongoDB does a collection scan (COLLSCAN) — O(n).",
  explanation: "Create indexes with: db.collection.createIndex({field: 1}); MongoDB supports single field, compound, multikey (array), text, geospatial, hashed, wildcard, and partial indexes. The _id field is always indexed."
},
{
  id: 375, category: "MongoDB", subcategory: "Basics",
  question: "What is a compound index in MongoDB?",
  answer: "A compound index covers multiple fields: db.users.createIndex({lastName: 1, firstName: 1}). The leftmost prefix rule applies — this index supports queries on lastName alone or (lastName, firstName) but not firstName alone.",
  explanation: "ESR rule for compound indexes: Equality fields first, then Sort fields, then Range fields. Example: find all active users sorted by date, with age > 25 → index on {status:1, date:1, age:1}."
},
{
  id: 376, category: "MongoDB", subcategory: "Basics",
  question: "What is a multikey index in MongoDB?",
  answer: "A multikey index is automatically created when indexing an array field. MongoDB indexes each element of the array separately. A compound index can have at most one multikey field.",
  explanation: "db.products.createIndex({tags: 1}); — if tags is an array, this becomes a multikey index with an entry per tag value. Queries for db.products.find({tags: 'electronics'}) use the multikey index efficiently."
},
{
  id: 377, category: "MongoDB", subcategory: "Basics",
  question: "What is a text index in MongoDB?",
  answer: "Text indexes support full-text search. db.articles.createIndex({title: 'text', body: 'text'}). Query: db.articles.find({$text: {$search: 'mongodb performance'}}). Returns documents containing any of the search terms.",
  explanation: "Only one text index per collection is allowed. $text searches support phrase ('exact phrase'), negation (-excluded), and language-aware stemming. Use $meta: 'textScore' to sort by relevance. For more advanced search, use Atlas Search."
},
{
  id: 378, category: "MongoDB", subcategory: "Basics",
  question: "What is a sparse index in MongoDB?",
  answer: "A sparse index only indexes documents that have the indexed field (non-null). Documents missing the field are not in the index. Saves space when many documents lack the field. Use for optional fields.",
  explanation: "db.users.createIndex({optionalPhone: 1}, {sparse: true}); — only indexes users with a phone. Without sparse, null entries would be in the index. Note: sparse indexes may not be used for queries that require null documents."
},
{
  id: 379, category: "MongoDB", subcategory: "Basics",
  question: "What is a TTL index in MongoDB?",
  answer: "TTL (Time To Live) indexes automatically delete documents after a specified number of seconds from a date field. db.sessions.createIndex({createdAt: 1}, {expireAfterSeconds: 86400}); — deletes sessions after 24 hours.",
  explanation: "The background TTL thread runs every 60 seconds and is non-deterministic (documents may survive slightly longer than the TTL). TTL indexes work only on single date fields, not compound indexes. Useful for sessions, logs, and cache data."
},
{
  id: 380, category: "MongoDB", subcategory: "Basics",
  question: "What is an explain() in MongoDB?",
  answer: "db.collection.find(query).explain('executionStats') shows the query execution plan with: stage (COLLSCAN/IXSCAN), nReturned, totalDocsExamined, totalKeysExamined, executionTimeMillis, indexName, isMultiKey.",
  explanation: "Good query: nReturned ≈ totalDocsExamined (index used, minimal scanning). Bad query: totalDocsExamined >> nReturned (COLLSCAN or poor index). 'allPlansExecution' mode shows rejected plan comparisons."
},
{
  id: 381, category: "MongoDB", subcategory: "Basics",
  question: "What is the difference between COLLSCAN and IXSCAN?",
  answer: "COLLSCAN: collection scan — examines every document in the collection. O(n). IXSCAN: index scan — traverses an index to find matching documents. O(log n) for equality, O(range width) for ranges.",
  explanation: "Always investigate COLLSCAN on large collections — it likely needs an index. However, COLLSCAN is acceptable for very small collections where an index would be wasteful. Use explain() to detect unwanted COLLSCANs."
},
{
  id: 382, category: "MongoDB", subcategory: "Basics",
  question: "What is write concern in MongoDB?",
  answer: "Write concern controls the acknowledgment level for write operations. w:0 (no ack), w:1 (primary ack, default), w:'majority' (majority of replica set members ack), j:true (written to journal before ack).",
  explanation: "w:'majority' + j:true provides the strongest durability guarantee — data survives primary failure. w:0 is fastest but data can be lost on crash. Choose based on data criticality. Majority write concern is recommended for financial data."
},
{
  id: 383, category: "MongoDB", subcategory: "Basics",
  question: "What is read preference in MongoDB?",
  answer: "Read preference controls which replica set member serves read operations. primary (default), primaryPreferred, secondary, secondaryPreferred, nearest (lowest network latency).",
  explanation: "Read from secondary for analytics, reporting, and cache-warmup workloads to offload the primary. Caution: secondary reads may see slightly stale data (replication lag). primaryPreferred falls back to secondary only when primary is unavailable."
},
{
  id: 384, category: "MongoDB", subcategory: "Basics",
  question: "What is a replica set in MongoDB?",
  answer: "A replica set is a group of MongoDB processes maintaining the same data: one primary (receives all writes), one or more secondaries (replicate primary's oplog), and optionally arbiters (vote only, no data).",
  explanation: "Replica sets provide: automatic failover (election when primary fails), data redundancy, and read scaling (secondary reads). Write to primary, oplog replicates to secondaries asynchronously. Minimum 3 nodes for proper failover voting."
},
{
  id: 385, category: "MongoDB", subcategory: "Basics",
  question: "What is the oplog in MongoDB?",
  answer: "The oplog (operation log) is a special capped collection in the local database that records all write operations on the primary. Secondaries tail the oplog and replay operations to stay in sync.",
  explanation: "Oplog entries are idempotent — replaying them multiple times has the same effect as once. Oplog size determines how far a secondary can lag before needing a full resync. Monitor oplog size and replication lag."
},
{
  id: 386, category: "MongoDB", subcategory: "Basics",
  question: "What is sharding in MongoDB?",
  answer: "Sharding horizontally distributes data across multiple shards (replica sets), each holding a subset of data based on a shard key. A mongos router directs queries to the correct shard(s). Config servers store cluster metadata.",
  explanation: "Sharding enables horizontal write and storage scaling. Architecture: multiple shard replica sets + config server replica set + mongos processes. Choose shard key carefully — high cardinality, even distribution, query isolation."
},
{
  id: 387, category: "MongoDB", subcategory: "Basics",
  question: "What is a shard key and why is its selection critical?",
  answer: "The shard key determines how documents are distributed across shards. Requirements: high cardinality (enough distinct values), even distribution (avoid hot spots), query compatibility (included in frequent queries for targeted operations).",
  explanation: "Bad shard key: monotonically increasing (like ObjectId) causes all new writes to one shard. Low cardinality (status: active/inactive) causes uneven distribution. Good: user_id provides even distribution and isolates user queries to one shard."
},
{
  id: 388, category: "MongoDB", subcategory: "Basics",
  question: "What is a capped collection?",
  answer: "A capped collection is a fixed-size circular buffer collection that automatically removes the oldest documents when the size limit is reached. Documents are inserted in natural order and maintained by insertion order.",
  explanation: "db.createCollection('logs', {capped: true, size: 10485760, max: 1000}); — 10MB, max 1000 documents. Useful for rolling logs, event queues. Cannot update documents to be larger. Cannot delete individual documents. Always keeps most recent data."
},
{
  id: 389, category: "MongoDB", subcategory: "Basics",
  question: "What are MongoDB transactions?",
  answer: "MongoDB 4.0+ supports multi-document ACID transactions for replica sets; 4.2+ for sharded clusters. Transactions allow multiple read/write operations across multiple documents/collections to be atomic.",
  explanation: "session.startTransaction(); collection.insertOne({...}); otherCollection.updateOne({...}); session.commitTransaction(); — all-or-nothing. Transactions in MongoDB are expensive compared to document-level atomicity. Use sparingly and prefer document model design to avoid needing them."
},
{
  id: 390, category: "MongoDB", subcategory: "Basics",
  question: "What is the difference between findAndModify() and updateOne()?",
  answer: "findAndModify (and findOneAndUpdate, findOneAndReplace, findOneAndDelete) atomically finds and modifies a document, returning either the original or new document in a single operation. updateOne only returns acknowledgment counts, not the document.",
  explanation: "db.queue.findOneAndUpdate({status:'pending'}, {$set:{status:'processing'}}, {sort:{priority:-1}, returnDocument:'after'}); — atomically picks and claims the highest-priority pending job. Critical for queue implementations."
},
{
  id: 391, category: "MongoDB", subcategory: "Basics",
  question: "What is the $facet stage in aggregation?",
  answer: "$facet processes multiple aggregation pipelines on the same input documents simultaneously, returning results in named sub-documents. Used for faceted navigation (counts per category, price ranges, etc.).",
  explanation: "Example: {$facet: {byStatus: [{$group: {_id:'$status', count:{$sum:1}}}], byCategory: [{$group: {_id:'$category', count:{$sum:1}}}], priceBuckets: [{$bucket: {groupBy:'$price', boundaries:[0,10,50,100]}}]}} — three aggregations in one pass."
},
{
  id: 392, category: "MongoDB", subcategory: "Basics",
  question: "What is the $bucket and $bucketAuto stage?",
  answer: "$bucket groups documents into manually defined value ranges (buckets/histogram). $bucketAuto automatically determines evenly distributed buckets given a desired count. Both return count and other aggregated values per bucket.",
  explanation: "Example: {$bucket: {groupBy:'$price', boundaries:[0,25,50,100,500], default:'Other', output:{count:{$sum:1}, avgPrice:{$avg:'$price'}}}} — creates price histogram. $bucketAuto is useful for exploratory analysis."
},
{
  id: 393, category: "MongoDB", subcategory: "Basics",
  question: "What is the $setWindowFields stage (MongoDB 5.0+)?",
  answer: "$setWindowFields enables window function-style calculations — running totals, moving averages, rankings — similar to SQL window functions, but in MongoDB's aggregation pipeline.",
  explanation: "Example: {$setWindowFields: {partitionBy: '$category', sortBy: {date: 1}, output: {runningTotal: {$sum: '$sales', window: {documents: ['unbounded','current']}}}}} — running total per category over time."
},
{
  id: 394, category: "MongoDB", subcategory: "Basics",
  question: "What is Atlas Search in MongoDB?",
  answer: "Atlas Search is a full-text search engine built on Apache Lucene, integrated into MongoDB Atlas. It supports fuzzy matching, autocomplete, highlighting, facets, geospatial search, and complex relevance scoring far beyond MongoDB's native $text.",
  explanation: "Atlas Search uses $search stage in aggregation: {$search: {text: {query: 'mongodb', path: 'content', fuzzy: {maxEdits: 1}}}}. Indexes are defined separately (Atlas Search indexes vs regular MongoDB indexes). Much more powerful than $text for search features."
},
{
  id: 395, category: "MongoDB", subcategory: "Basics",
  question: "What is the difference between $in and $or in MongoDB queries?",
  answer: "$in tests if a field's value is in a list — more efficient for multiple equality checks on the same field. $or evaluates multiple conditions on potentially different fields. $in is a shorthand for $or on one field.",
  explanation: "{status: {$in: ['active','pending']}} is faster than {$or: [{status:'active'},{status:'pending'}]} for the same field. $in can use an index. $or can also use indexes but may require multiple index lookups. Use $in for same-field multi-value checks."
},
{
  id: 396, category: "MongoDB", subcategory: "Basics",
  question: "What is the $elemMatch operator?",
  answer: "$elemMatch matches documents where at least one array element satisfies all specified conditions. Example: db.students.find({scores: {$elemMatch: {subject: 'math', grade: {$gte: 90}}}}); — students with a math score ≥ 90.",
  explanation: "Without $elemMatch: {scores.subject:'math', scores.grade:{$gte:90}} could match different array elements for each condition. $elemMatch ensures both conditions apply to the same array element. Essential for correct array queries."
},
{
  id: 397, category: "MongoDB", subcategory: "Basics",
  question: "What is the $expr operator in MongoDB?",
  answer: "$expr allows using aggregation expressions within $match queries. It enables comparing two fields in the same document: db.orders.find({$expr: {$gt: ['$revenue', '$cost']}}); — orders where revenue > cost.",
  explanation: "$expr is necessary for field-to-field comparisons (not possible with normal query operators) and for using complex aggregation expressions in match conditions. Required for comparing fields within the same document."
},
{
  id: 398, category: "MongoDB", subcategory: "Basics",
  question: "What is the bulkWrite() method in MongoDB?",
  answer: "bulkWrite() executes multiple write operations (insertOne, insertMany, updateOne, updateMany, replaceOne, deleteOne, deleteMany) in a single request. Can be ordered (stops on first error) or unordered (continues on error).",
  explanation: "db.products.bulkWrite([{insertOne:{document:{name:'A'}}}, {updateOne:{filter:{sku:'123'}, update:{$set:{price:9.99}}}}, {deleteMany:{filter:{discontinued:true}}}], {ordered:false}); — efficient batch operations."
},
{
  id: 399, category: "MongoDB", subcategory: "Basics",
  question: "What is the mongosh shell?",
  answer: "mongosh is the modern MongoDB shell (replaced mongo shell in MongoDB 6+). It is a full JavaScript environment with MongoDB driver integration, tab completion, syntax highlighting, and improved REPL for database interaction.",
  explanation: "mongosh connects with: mongosh 'mongodb://user:pass@host:27017/dbname'. Supports all MongoDB operations plus JavaScript: use testdb; db.users.countDocuments(); db.users.find().limit(5).toArray(); Replaces the legacy mongo shell."
},
{
  id: 400, category: "MongoDB", subcategory: "Basics",
  question: "What is the difference between count() and countDocuments() in MongoDB?",
  answer: "countDocuments() always performs an accurate count using the query predicate. count() (deprecated) used index metadata for estimates in some cases. estimatedDocumentCount() gives a fast approximate total using collection metadata.",
  explanation: "Always use countDocuments({}) for accurate counts (uses filter). estimatedDocumentCount() is very fast (metadata only) but gives collection total, not filtered. Avoid count() — deprecated in MongoDB 4.0+."
},

// --- MONGODB ADVANCED (401-525) ---
{
  id: 401, category: "MongoDB", subcategory: "Advanced",
  question: "What is the MongoDB change streams?",
  answer: "Change streams allow applications to subscribe to real-time change notifications (inserts, updates, deletes, replaces) on collections, databases, or entire clusters. Built on the oplog, they provide a resumable cursor.",
  explanation: "const changeStream = db.collection.watch([{$match:{operationType:'insert'}}]); changeStream.on('change', doc => console.log(doc)); — real-time events. Resume tokens allow restarting from a failure point. Requires replica set."
},
{
  id: 402, category: "MongoDB", subcategory: "Advanced",
  question: "What is Atlas Triggers in MongoDB Atlas?",
  answer: "Atlas Triggers are serverless functions that automatically execute in response to database change events (Database Triggers), schedules (Scheduled Triggers), or authentication events (Authentication Triggers).",
  explanation: "Database Trigger on collection insert: runs a function to send email, update aggregation, or call external API. Eliminates need for change stream polling infrastructure. Triggers run as Atlas App Services functions."
},
{
  id: 403, category: "MongoDB", subcategory: "Advanced",
  question: "What is the aggregation pipeline $graphLookup stage?",
  answer: "$graphLookup performs recursive lookup to traverse graph relationships (trees, hierarchies) within a collection. Supports maxDepth to limit recursion and depthField to record traversal depth.",
  explanation: "Example: {$graphLookup: {from:'employees', startWith:'$manager_id', connectFromField:'manager_id', connectToField:'_id', as:'managementChain', maxDepth:5}} — finds all managers up to 5 levels up."
},
{
  id: 404, category: "MongoDB", subcategory: "Advanced",
  question: "What is a wildcard index in MongoDB?",
  answer: "Wildcard indexes index all fields in a document (or all fields under a path): db.collection.createIndex({'$**': 1}) or db.collection.createIndex({'user.$**': 1}). Useful for documents with highly variable schemas.",
  explanation: "Useful for documents with dynamic fields (like user metadata, event properties). A wildcard index on '$**' covers any field path. Downside: large index size, not suitable for all access patterns. Cannot be compound or hashed."
},
{
  id: 405, category: "MongoDB", subcategory: "Advanced",
  question: "What is an Atlas Vector Search index?",
  answer: "Atlas Vector Search provides approximate nearest neighbor (ANN) search on vector embeddings stored in MongoDB Atlas. Uses HNSW algorithm for efficient similarity search. Powers AI/ML use cases like semantic search and RAG.",
  explanation: "Create an Atlas Vector Search index on the embedding field, specify dimensions and similarity metric (cosine/euclidean/dotProduct). Query with $vectorSearch stage: {$vectorSearch: {index:'vec_idx', path:'embedding', queryVector:[...], numCandidates:100, limit:10}}."
},
{
  id: 406, category: "MongoDB", subcategory: "Advanced",
  question: "What is the MongoDB storage engine and what is WiredTiger?",
  answer: "WiredTiger is MongoDB's default storage engine (since 3.2), replacing MMAPv1. It provides document-level concurrency control (not collection-level), data and index compression, and MVCC-based snapshot isolation.",
  explanation: "WiredTiger uses B-trees for indexes and a configurable cache. Key options: wiredTigerCacheSizeGB (50% of RAM default), block compression (snappy default), prefix compression for indexes. Supports encryption at rest."
},
{
  id: 407, category: "MongoDB", subcategory: "Advanced",
  question: "What is the mongostat and mongotop utility?",
  answer: "mongostat shows real-time server statistics — inserts/sec, queries/sec, updates, deletes, getmores, flushes, locks, net I/O, connections. mongotop shows per-collection read/write time in real-time.",
  explanation: "mongostat -n 10 — 10 samples every second. mongotop 5 — updates every 5 seconds. These are the first tools to check when investigating performance issues. High lock%, slow optime, and queue depth indicate problems."
},
{
  id: 408, category: "MongoDB", subcategory: "Advanced",
  question: "What is mongodump and mongorestore?",
  answer: "mongodump creates a binary backup of a MongoDB database or collection as BSON files. mongorestore restores from a mongodump backup. Useful for backups, migrations, and cloning environments.",
  explanation: "mongodump --uri='mongodb://...' --db=mydb --out=/backups/; mongorestore --uri='mongodb://...' --db=newdb /backups/mydb/; Use --gzip for compressed backups. Not suitable for hot backups of large deployments — use Atlas backups or mongodump with point-in-time."
},
{
  id: 409, category: "MongoDB", subcategory: "Advanced",
  question: "What is MongoDB Atlas and its key features?",
  answer: "MongoDB Atlas is the fully managed cloud MongoDB service on AWS/Azure/GCP. Features: automated backups, auto-scaling, Atlas Search (Lucene), Atlas Vector Search, Atlas App Services, Charts, Data Lake (federated queries), Online Archive, and global clusters.",
  explanation: "Atlas eliminates operational overhead: automatic failover, patching, monitoring, and global distribution. The M0/M2/M5 free/shared tiers are useful for development. Production requires M10+ for replica sets and production features."
},
{
  id: 410, category: "MongoDB", subcategory: "Advanced",
  question: "What is the currentOp() command in MongoDB?",
  answer: "db.adminCommand({currentOp: 1, $all: true}) shows all currently executing operations — their operationType, ns (namespace), duration, lock info, wait info. Essential for identifying slow or blocked operations.",
  explanation: "Filter for long-running: {currentOp: 1, 'secs_running': {$gt: 10}} — operations running more than 10 seconds. Use db.adminCommand({killOp: 1, op: opId}) to kill a specific operation. MongoDB Atlas provides this in the real-time performance panel."
},
{
  id: 411, category: "MongoDB", subcategory: "Advanced",
  question: "What is the MongoDB profiler?",
  answer: "The database profiler logs query performance data to the system.profile collection. Level 0: off. Level 1: log slow operations (above slowms threshold). Level 2: log all operations. db.setProfilingLevel(1, {slowms: 100});",
  explanation: "Query profile data: db.system.profile.find().sort({ts:-1}).limit(20); — recent slow queries. Fields include command, ns, millis, keysExamined, docsExamined, nreturned. Essential for production query performance analysis."
},
{
  id: 412, category: "MongoDB", subcategory: "Advanced",
  question: "What is the aggregation pipeline $redact stage?",
  answer: "$redact restricts access to document content based on embedded access control information using $$DESCEND (keep field, recurse), $$PRUNE (exclude field and subdocuments), $$KEEP (include field without recursion).",
  explanation: "Useful for document-level security where access control is embedded within the document structure. Not commonly used — RLS is usually handled in the application layer or via Atlas App Services. Example: {$redact: {if: {$eq: ['$owner', '$$CURRENT_USER']}, then: '$$DESCEND', else: '$$PRUNE'}} — only show documents owned by the current user."
}
];