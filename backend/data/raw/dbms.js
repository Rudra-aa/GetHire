const questions = [

// ============================================================
// SECTION 1: INTRODUCTION TO DBMS (Q1–Q30)
// ============================================================
{
  id: 1, section: "Introduction to DBMS",
  q: "What is a Database Management System (DBMS)?",
  a: "A DBMS is software that enables users to define, create, maintain, and control access to a database. It acts as an interface between the database and end users or application programs, ensuring data is consistently organized and remains easily accessible.",
  exp: "A DBMS provides tools for data storage, retrieval, and manipulation. Examples include MySQL, Oracle, PostgreSQL, and MongoDB. It handles query processing, transaction management, concurrency control, and security, removing the need to write low-level file-handling code."
},
{
  id: 2, section: "Introduction to DBMS",
  q: "What are the main advantages of a DBMS over a file-based system?",
  a: "Advantages include: reduced data redundancy, improved data consistency, data sharing among multiple users, data security, data integrity enforcement, backup and recovery support, and concurrent access control.",
  exp: "File-based systems store data in separate, unrelated files leading to duplication and inconsistency. A DBMS centralizes data, enforces integrity constraints, supports ACID transactions, and provides controlled multi-user access, making data management significantly more reliable and efficient."
},
{
  id: 3, section: "Introduction to DBMS",
  q: "What is the difference between a database and a DBMS?",
  a: "A database is an organized collection of structured data (the actual data stored). A DBMS is the software system used to create, manage, and interact with that database.",
  exp: "Think of the database as the warehouse (data storage) and the DBMS as the management system (software) that controls how data is stored, accessed, and secured. For example, MySQL is a DBMS, while the tables and records it manages form the database."
},
{
  id: 4, section: "Introduction to DBMS",
  q: "What is data independence in DBMS?",
  a: "Data independence is the ability to change the schema at one level of the database system without having to change the schema at the next higher level. There are two types: physical data independence and logical data independence.",
  exp: "Physical data independence means changing how data is physically stored (e.g., switching from HDD to SSD or reorganizing storage) without affecting the logical schema. Logical data independence means changing the conceptual schema (adding tables/columns) without affecting external schemas or application programs."
},
{
  id: 5, section: "Introduction to DBMS",
  q: "Explain the three-schema architecture of a DBMS.",
  a: "The three-schema architecture consists of: (1) Internal/Physical Schema — describes physical storage structure; (2) Conceptual/Logical Schema — describes what data is stored and the relationships; (3) External/View Schema — describes how individual users or groups see the data.",
  exp: "This architecture provides data abstraction and independence. Users interact with external views; changes to internal storage don't affect conceptual schema; changes to conceptual schema minimally affect user views. It separates user applications from physical storage details."
},
{
  id: 6, section: "Introduction to DBMS",
  q: "What is a data model?",
  a: "A data model is a conceptual framework that defines how data is structured, organized, and manipulated in a database system. It provides a formal notation for describing data and the relationships between data.",
  exp: "Common data models include: Relational Model (data in tables), Hierarchical Model (tree-like structure), Network Model (graph-like structure), Object-Oriented Model, and Document Model. The relational model, introduced by E.F. Codd in 1970, is the most widely used."
},
{
  id: 7, section: "Introduction to DBMS",
  q: "What is a schema in database terminology?",
  a: "A schema is the logical structure or blueprint of a database that defines how data is organized. It describes the tables, fields, data types, constraints, relationships, and other properties of a database.",
  exp: "A schema is like a skeleton of the database — it defines structure without containing actual data. An instance, on the other hand, refers to the actual data stored in the database at a particular point in time. Schema changes are infrequent; instances change with every data operation."
},
{
  id: 8, section: "Introduction to DBMS",
  q: "What are the functions of a DBA (Database Administrator)?",
  a: "A DBA is responsible for: installing and configuring the DBMS, defining the database schema, managing user access and security, performing backups and recovery, monitoring performance, tuning queries, ensuring data integrity, and capacity planning.",
  exp: "The DBA bridges the gap between technical database management and organizational data needs. They make decisions about physical storage, define security policies, manage concurrency, handle disaster recovery, and ensure the DBMS runs efficiently to meet application demands."
},
{
  id: 9, section: "Introduction to DBMS",
  q: "What is metadata in a DBMS?",
  a: "Metadata is 'data about data.' In a DBMS, it refers to the information stored in the system catalog or data dictionary that describes the structure of the database — table names, column names, data types, constraints, indexes, and relationships.",
  exp: "The DBMS stores metadata in a system catalog. When you execute a query, the DBMS reads metadata to understand table structures, validate column references, and optimize execution. Without metadata, the DBMS cannot interpret or process stored data correctly."
},
{
  id: 10, section: "Introduction to DBMS",
  q: "What is the difference between DDL and DML?",
  a: "DDL (Data Definition Language) is used to define or modify database structures (CREATE, ALTER, DROP). DML (Data Manipulation Language) is used to manipulate data within those structures (SELECT, INSERT, UPDATE, DELETE).",
  exp: "DDL statements affect the schema — they create or modify tables and constraints, and changes are auto-committed. DML statements affect data — they are part of transactions that can be rolled back. DCL (Data Control Language) handles permissions (GRANT, REVOKE), while TCL (Transaction Control Language) manages transactions (COMMIT, ROLLBACK)."
},
{
  id: 11, section: "Introduction to DBMS",
  q: "What is a database instance?",
  a: "A database instance is the actual content (data) stored in the database at a specific point in time. It is the snapshot of the database that changes with every INSERT, UPDATE, or DELETE operation.",
  exp: "While the schema defines structure (e.g., a table 'Students' with columns StudentID, Name, Age), the instance contains actual rows in that table. The schema is relatively permanent; the instance is dynamic. This distinction helps separate structure from content in DBMS design."
},
{
  id: 12, section: "Introduction to DBMS",
  q: "What is a data dictionary?",
  a: "A data dictionary is a centralized repository of metadata about the database. It stores information about table names, column names, data types, constraints, relationships, stored procedures, and other database objects.",
  exp: "The data dictionary (also called the system catalog) is maintained by the DBMS itself and is automatically updated when the schema changes. It is queried internally by the query processor for validation and optimization, and can also be queried by DBAs using system tables like INFORMATION_SCHEMA."
},
{
  id: 13, section: "Introduction to DBMS",
  q: "What are the different types of database users?",
  a: "Types include: (1) Naive users — interact through application interfaces; (2) Application programmers — write application code using DML; (3) Sophisticated users — write complex queries directly; (4) Database administrators (DBAs) — manage and maintain the database.",
  exp: "Understanding user types helps design appropriate interfaces and access controls. Naive users don't know SQL and use forms/apps. Programmers embed SQL in code. Sophisticated users use tools like SQL clients. DBAs have full control over the database system."
},
{
  id: 14, section: "Introduction to DBMS",
  q: "What is the role of a query processor in DBMS?",
  a: "The query processor translates high-level queries (SQL) into low-level instructions that the storage manager can execute. It includes a DDL interpreter, DML compiler, and query evaluation engine.",
  exp: "The query processor parses the SQL query, performs semantic analysis, optimizes the query execution plan (choosing the most efficient way to retrieve data), and executes it. Query optimization significantly impacts performance, especially for complex joins and subqueries."
},
{
  id: 15, section: "Introduction to DBMS",
  q: "What is the storage manager in DBMS?",
  a: "The storage manager is the component that provides an interface between the low-level data stored on disk and the application programs and queries submitted to the system. It manages data files, data dictionary, and indexes.",
  exp: "The storage manager handles buffer management (keeping frequently accessed data in memory), file management (organizing data on disk), and access methods (indexes). It translates DML commands into low-level file system operations, abstracting physical storage from the logical model."
},
{
  id: 16, section: "Introduction to DBMS",
  q: "What is a view in DBMS?",
  a: "A view is a virtual table derived from one or more base tables or other views using a query. It does not store data physically but presents data from the underlying tables in a specific format.",
  exp: "Views simplify complex queries, enhance security (hiding sensitive columns), and provide logical data independence. For example, a view showing only employee name and department hides salary. Some views are updatable (changes propagate to base tables) while others are read-only."
},
{
  id: 17, section: "Introduction to DBMS",
  q: "What is a transaction in DBMS?",
  a: "A transaction is a logical unit of work that consists of one or more database operations (INSERT, UPDATE, DELETE, SELECT) that must all succeed or all fail together. It ensures data integrity.",
  exp: "Transactions follow the ACID properties: Atomicity (all-or-nothing), Consistency (valid state before and after), Isolation (intermediate states hidden from other transactions), and Durability (committed changes persist). Example: transferring money between accounts — both debit and credit must succeed together."
},
{
  id: 18, section: "Introduction to DBMS",
  q: "What does ACID stand for in DBMS?",
  a: "ACID stands for: Atomicity, Consistency, Isolation, and Durability — the four key properties that guarantee reliable processing of database transactions.",
  exp: "Atomicity: transaction completes fully or not at all. Consistency: database remains in a valid state before and after. Isolation: concurrent transactions don't interfere with each other. Durability: once committed, changes survive system failures. These properties are implemented via logging, locking, and recovery mechanisms."
},
{
  id: 19, section: "Introduction to DBMS",
  q: "What is the difference between a centralized and distributed database?",
  a: "A centralized database stores all data at a single location managed by one system. A distributed database stores data across multiple physical locations (nodes), which may be geographically separated but appear as one logical database.",
  exp: "Centralized databases are simpler to manage but have a single point of failure and scalability limits. Distributed databases offer better fault tolerance, geographic data distribution, and scalability, but introduce challenges like consistency (CAP theorem), network latency, and complex transaction management."
},
{
  id: 20, section: "Introduction to DBMS",
  q: "What is an object-relational DBMS (ORDBMS)?",
  a: "An ORDBMS is a database system that combines features of both the relational model and the object-oriented model. It supports traditional tables and SQL while also supporting objects, inheritance, and complex data types.",
  exp: "ORDBMS systems like PostgreSQL allow user-defined types, table inheritance, and complex nested structures. This is useful for applications dealing with complex data (e.g., GIS data, scientific datasets) that don't fit neatly into traditional row-column structures while still benefiting from SQL and ACID transactions."
},
{
  id: 21, section: "Introduction to DBMS",
  q: "What are the disadvantages of a DBMS?",
  a: "Disadvantages include: high initial cost (hardware, software, training), complexity of design and administration, performance overhead compared to file systems for simple tasks, potential single point of failure, and need for specialized expertise.",
  exp: "For small, simple applications with limited data, a DBMS may be overkill. The licensing costs of enterprise DBMSes (Oracle, SQL Server) can be significant. Additionally, performance tuning requires expertise, and outages can affect all applications sharing the database."
},
{
  id: 22, section: "Introduction to DBMS",
  q: "What is data abstraction in DBMS?",
  a: "Data abstraction is the process of hiding the complex implementation details of data storage from users and presenting only the relevant information at various levels of complexity.",
  exp: "DBMS provides three levels of abstraction: Physical level (how data is stored on disk), Logical level (what data and relationships exist), and View level (what specific users see). This allows changes at lower levels without affecting higher-level user interactions."
},
{
  id: 23, section: "Introduction to DBMS",
  q: "What is the difference between internal schema and external schema?",
  a: "Internal schema describes the physical storage structure (how data is stored on disk, index structures, access paths). External schema (view schema) describes how individual users or user groups perceive the data.",
  exp: "Multiple external schemas can exist for one conceptual schema — different departments see different views of the same database. The internal schema is hidden from users. Changing internal storage (e.g., adding an index) doesn't affect external views — this is physical data independence."
},
{
  id: 24, section: "Introduction to DBMS",
  q: "What is a NoSQL database?",
  a: "NoSQL (Not Only SQL) databases are non-relational database systems designed to handle large volumes of unstructured, semi-structured, or rapidly changing data. They sacrifice some ACID properties for scalability and flexibility.",
  exp: "Types include: Document stores (MongoDB), Key-Value stores (Redis), Column-family stores (Cassandra), and Graph databases (Neo4j). NoSQL databases are horizontally scalable, schema-flexible, and often used in big data and real-time web applications where traditional RDBMS performance becomes a bottleneck."
},
{
  id: 25, section: "Introduction to DBMS",
  q: "What is a relational database?",
  a: "A relational database organizes data into tables (relations) with rows (tuples) and columns (attributes). Tables are linked by keys, and data is manipulated using relational algebra or SQL.",
  exp: "The relational model was proposed by E.F. Codd in 1970. Key concepts include tables, primary keys, foreign keys, and relationships (one-to-one, one-to-many, many-to-many). SQL is the standard language for relational databases. Examples: MySQL, Oracle, SQL Server, PostgreSQL."
},
{
  id: 26, section: "Introduction to DBMS",
  q: "What is the purpose of normalization in DBMS?",
  a: "Normalization is the process of organizing database tables to reduce data redundancy and improve data integrity by applying a series of normal forms (1NF, 2NF, 3NF, BCNF, etc.).",
  exp: "Redundancy causes anomalies: insertion anomaly (can't add data without unrelated data), deletion anomaly (deleting data removes related info), and update anomaly (changing one record requires changing multiple copies). Normalization eliminates these by decomposing tables based on functional dependencies."
},
{
  id: 27, section: "Introduction to DBMS",
  q: "What is a primary key?",
  a: "A primary key is a column or set of columns in a table that uniquely identifies each row in that table. It cannot contain NULL values and must be unique across all rows.",
  exp: "Primary keys enforce entity integrity — ensuring every row can be uniquely identified. They are typically indexed automatically for fast lookups. Example: StudentID in a Students table. A composite primary key uses multiple columns together to form a unique identifier when no single column is sufficient."
},
{
  id: 28, section: "Introduction to DBMS",
  q: "What is a foreign key?",
  a: "A foreign key is a column (or set of columns) in one table that refers to the primary key of another table. It establishes a referential integrity link between the two tables.",
  exp: "Foreign keys enforce referential integrity — you cannot insert a foreign key value that doesn't exist in the referenced table, and you cannot delete a referenced row without addressing dependent rows (CASCADE, SET NULL, RESTRICT). Example: OrderID in OrderItems referencing OrderID in Orders."
},
{
  id: 29, section: "Introduction to DBMS",
  q: "What are the different types of keys in DBMS?",
  a: "Types of keys: Primary Key (unique identifier), Candidate Key (potential primary key), Super Key (any set of columns that uniquely identifies a row), Foreign Key (references another table's PK), Alternate Key (candidate key not chosen as primary), Composite Key (multiple columns as key).",
  exp: "Super Key ⊇ Candidate Key ⊇ Primary Key. Every primary key is a candidate key, and every candidate key is a super key. Alternate keys are the non-selected candidate keys. Understanding these distinctions is crucial for database design and normalization."
},
{
  id: 30, section: "Introduction to DBMS",
  q: "What is the difference between OLTP and OLAP?",
  a: "OLTP (Online Transaction Processing) handles high-volume, short, real-time transactions (INSERT, UPDATE, DELETE). OLAP (Online Analytical Processing) supports complex analytical queries on large historical datasets for decision-making.",
  exp: "OLTP optimizes for fast individual transactions — banking systems, e-commerce orders. OLAP optimizes for aggregations and analytics — business intelligence, data warehousing. OLTP databases are highly normalized for write efficiency; OLAP databases (data warehouses) are often denormalized or use star/snowflake schemas for read efficiency."
},

// ============================================================
// SECTION 2: RELATIONAL MODEL (Q31–Q70)
// ============================================================
{
  id: 31, section: "Relational Model",
  q: "What is a relation in the relational model?",
  a: "In the relational model, a relation is a table with a unique name. It consists of a set of attributes (columns) and a set of tuples (rows). Each relation represents an entity or relationship in the real world.",
  exp: "A relation has a schema (the structure) and an instance (the actual data). Relations have mathematical properties: all tuples are unique, the order of tuples doesn't matter, the order of attributes doesn't matter (conceptually), and each attribute has a single atomic value per tuple."
},
{
  id: 32, section: "Relational Model",
  q: "What is a tuple in the relational model?",
  a: "A tuple is a single row in a relation (table). It represents one instance of the entity described by the relation, with specific values for each attribute defined in the relation's schema.",
  exp: "In a Students relation, one tuple could be (101, 'Alice', 20, 'CSE'). Each tuple must be unique within a relation (no duplicate rows). Tuples in the relational model are unordered — the database may return them in any order unless you specify ORDER BY."
},
{
  id: 33, section: "Relational Model",
  q: "What is an attribute domain in DBMS?",
  a: "An attribute domain is the set of all possible values that an attribute can take. It defines the data type and constraints for that attribute, such as the range of valid integers, a set of allowed strings, or date ranges.",
  exp: "Domain constraints are the most basic form of integrity constraints. For example, the domain of 'Age' might be integers between 0 and 150. Domains can be simple (INT, VARCHAR) or user-defined. SQL enforces domains through column data types and CHECK constraints."
},
{
  id: 34, section: "Relational Model",
  q: "What is the difference between a super key and a candidate key?",
  a: "A super key is any set of attributes that can uniquely identify a tuple in a relation. A candidate key is a minimal super key — a super key from which no attribute can be removed while still maintaining uniqueness.",
  exp: "Example: In a table with {StudentID, Email, Name}, both {StudentID} and {Email} are candidate keys. {StudentID, Name} is a super key but not a candidate key because {StudentID} alone is sufficient. Every candidate key is a super key, but not vice versa."
},
{
  id: 35, section: "Relational Model",
  q: "What is relational algebra?",
  a: "Relational algebra is a formal query language for the relational model consisting of a set of operations that take one or two relations as input and produce a new relation as output. It forms the theoretical foundation for SQL.",
  exp: "Basic operations: Selection (σ) — filters rows; Projection (π) — selects columns; Cartesian Product (×) — combines all tuples; Union (∪) — combines tuples from two compatible relations; Difference (−) — tuples in one not in other; Join (⋈) — combines related tuples. Extended operations include Intersection, Division, and various joins."
},
{
  id: 36, section: "Relational Model",
  q: "What is the selection operation in relational algebra?",
  a: "Selection (σ) is a unary operation that filters rows from a relation based on a predicate (condition). It returns a new relation containing only the tuples that satisfy the condition.",
  exp: "Notation: σ_condition(Relation). Example: σ_age>20(Students) returns all students older than 20. The result has the same schema as the input. Selection reduces the number of rows but doesn't change columns. Multiple conditions can be combined with AND (∧), OR (∨), NOT (¬)."
},
{
  id: 37, section: "Relational Model",
  q: "What is the projection operation in relational algebra?",
  a: "Projection (π) is a unary operation that selects specific columns (attributes) from a relation and removes duplicates from the result.",
  exp: "Notation: π_attribute-list(Relation). Example: π_Name,Age(Students) returns only the Name and Age columns. Since duplicate tuples are removed, the result may have fewer rows than the original. This corresponds to SELECT DISTINCT col1, col2 in SQL."
},
{
  id: 38, section: "Relational Model",
  q: "What is the Cartesian product in relational algebra?",
  a: "The Cartesian product (×) is a binary operation that combines every tuple from one relation with every tuple from another relation, producing a new relation with all possible tuple pairs.",
  exp: "If R has m tuples and n attributes, and S has p tuples and q attributes, then R × S has m×p tuples and n+q attributes. Example: 3-row table × 4-row table = 12 rows. The Cartesian product alone is rarely useful; it's typically followed by a selection to create a join."
},
{
  id: 39, section: "Relational Model",
  q: "What is a natural join in relational algebra?",
  a: "A natural join (⋈) combines two relations on all attributes with the same name, keeping only tuples where the values of common attributes match, and eliminating duplicate common columns from the result.",
  exp: "If R(A,B,C) and S(B,C,D) are joined naturally, the result has schema (A,B,C,D) where B and C values match. Natural join is equivalent to: equi-join on all common attributes followed by a projection to remove duplicate columns. Be cautious: unintended attribute name matches can cause incorrect results."
},
{
  id: 40, section: "Relational Model",
  q: "What is the difference between inner join and outer join?",
  a: "Inner join returns only rows where there is a matching condition in both tables. Outer join returns all rows from one or both tables, with NULL values for non-matching rows from the other table.",
  exp: "LEFT OUTER JOIN: all rows from left table + matching rows from right (NULLs for non-matching right rows). RIGHT OUTER JOIN: all rows from right + matching left rows. FULL OUTER JOIN: all rows from both, NULLs where no match. Inner join is the most common; outer joins are used when you need to preserve all records from one side."
},
{
  id: 41, section: "Relational Model",
  q: "What is the division operation in relational algebra?",
  a: "Division (÷) is used to find tuples in one relation that are associated with all tuples in another relation. It answers queries like 'Find all X that are related to ALL Y values'.",
  exp: "Example: Find students who are enrolled in ALL offered courses. If R(StudentID, CourseID) and S(CourseID), then R÷S gives StudentIDs that appear with every CourseID in S. Division is not directly in SQL but can be expressed using NOT EXISTS with double negation or HAVING COUNT."
},
{
  id: 42, section: "Relational Model",
  q: "What is the union operation in relational algebra?",
  a: "Union (∪) combines all tuples from two union-compatible relations into one relation, eliminating duplicates. Two relations are union-compatible if they have the same number of attributes with compatible domains.",
  exp: "R ∪ S contains all tuples in R, all tuples in S, with duplicates removed. This corresponds to UNION in SQL (which removes duplicates) vs. UNION ALL (which keeps them). Example: combining customer lists from two branches, each having the same schema."
},
{
  id: 43, section: "Relational Model",
  q: "What is referential integrity?",
  a: "Referential integrity is a constraint that ensures that a foreign key value in one table must either match an existing primary key value in the referenced table or be NULL (if allowed).",
  exp: "It prevents orphan records — e.g., an order referencing a non-existent customer. When enforced, the DBMS rejects inserts that violate the constraint and provides actions for deletes/updates of referenced rows: CASCADE (propagate), SET NULL, SET DEFAULT, or RESTRICT (reject the operation)."
},
{
  id: 44, section: "Relational Model",
  q: "What is entity integrity?",
  a: "Entity integrity states that the primary key of a table must be unique and cannot contain NULL values. Every row in a table must be uniquely and fully identified.",
  exp: "If a primary key allowed NULLs, some rows couldn't be uniquely identified, making operations like UPDATE and DELETE ambiguous. Entity integrity is automatically enforced by defining PRIMARY KEY constraints in SQL. Composite primary keys require that no attribute in the key is NULL."
},
{
  id: 45, section: "Relational Model",
  q: "What is domain integrity?",
  a: "Domain integrity ensures that all values in a column fall within the defined domain (valid set of values) for that attribute. It is enforced by data types, NOT NULL constraints, UNIQUE constraints, and CHECK constraints.",
  exp: "Example: A 'Rating' column with domain 1–5 should reject value 6. Domain integrity prevents semantically incorrect data from entering the database. SQL enforces this through column data types (INT, VARCHAR(50)) and CHECK constraints (CHECK (Rating BETWEEN 1 AND 5))."
},
{
  id: 46, section: "Relational Model",
  q: "What is the difference between equi-join and theta-join?",
  a: "A theta-join combines two relations based on any comparison condition (=, <, >, ≠). An equi-join is a special case of theta-join where the condition uses only equality (=).",
  exp: "Theta join: R ⋈_{A θ B} S where θ is any operator. Equi-join: R ⋈_{A=B} S. Natural join is an equi-join on all identically named attributes that also removes duplicate columns. Most practical joins are equi-joins (joining on matching keys). Non-equi joins are used for range queries like joining salary grades."
},
{
  id: 47, section: "Relational Model",
  q: "What is a self-join?",
  a: "A self-join is a join of a table with itself. It is used when a table has a relationship within its own rows, such as employee-manager relationships or category hierarchies.",
  exp: "Example: In an Employee table with EmployeeID and ManagerID columns, to find each employee's manager: SELECT e.Name, m.Name AS Manager FROM Employee e JOIN Employee m ON e.ManagerID = m.EmployeeID. Table aliases are required to distinguish the two 'copies' of the same table."
},
{
  id: 48, section: "Relational Model",
  q: "What is the difference between DELETE, TRUNCATE, and DROP in SQL?",
  a: "DELETE removes specific rows based on a condition and can be rolled back. TRUNCATE removes all rows from a table quickly and is generally not rolled back (DDL in many databases). DROP removes the entire table including its structure.",
  exp: "DELETE: DML, logged row-by-row, WHERE condition possible, triggers fire, rollback possible. TRUNCATE: DDL (in most DBMS), minimal logging, no WHERE, faster, resets identity counters, no triggers. DROP: DDL, removes table definition and data permanently. TRUNCATE is much faster than DELETE for emptying a large table."
},
{
  id: 49, section: "Relational Model",
  q: "What is the difference between WHERE and HAVING in SQL?",
  a: "WHERE filters rows before grouping (applies to individual rows). HAVING filters groups after the GROUP BY clause has been applied (applies to aggregate results).",
  exp: "WHERE cannot use aggregate functions (SUM, COUNT, etc.) because aggregation hasn't happened yet. HAVING can use aggregates. Example: SELECT dept, AVG(salary) FROM employees WHERE salary > 0 GROUP BY dept HAVING AVG(salary) > 50000. WHERE eliminates rows before grouping; HAVING eliminates groups after."
},
{
  id: 50, section: "Relational Model",
  q: "What is a subquery in SQL?",
  a: "A subquery (inner query or nested query) is a SELECT statement nested inside another SQL statement. It can appear in SELECT, FROM, WHERE, or HAVING clauses and provides values or a result set to the outer query.",
  exp: "Types: Scalar subquery (returns one value), Row subquery (returns one row), Table subquery (returns a table). Correlated subquery references the outer query and re-executes for each outer row. Example: SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees). Non-correlated subqueries execute once."
},
{
  id: 51, section: "Relational Model",
  q: "What is SQL and what are its sublanguages?",
  a: "SQL (Structured Query Language) is the standard language for relational databases. Its sublanguages are: DDL (Data Definition: CREATE, ALTER, DROP), DML (Data Manipulation: SELECT, INSERT, UPDATE, DELETE), DCL (Data Control: GRANT, REVOKE), and TCL (Transaction Control: COMMIT, ROLLBACK, SAVEPOINT).",
  exp: "DDL defines structure; DML manipulates data; DCL manages permissions; TCL manages transactions. Though SQL is often considered DML-focused, the full standard includes all four aspects. SQL is declarative — you specify WHAT you want, not HOW to get it; the query optimizer figures out the execution plan."
},
{
  id: 52, section: "Relational Model",
  q: "What is the DISTINCT keyword in SQL?",
  a: "DISTINCT is used in a SELECT statement to return only unique (non-duplicate) rows. When applied, the result set will not contain duplicate tuples for the specified columns.",
  exp: "Example: SELECT DISTINCT city FROM customers returns each city only once even if multiple customers are from the same city. DISTINCT causes overhead because it requires comparing and sorting the result to remove duplicates. Without DISTINCT, SQL returns all rows including duplicates (like UNION ALL vs UNION)."
},
{
  id: 53, section: "Relational Model",
  q: "What is an aggregate function in SQL?",
  a: "Aggregate functions perform calculations on a set of values and return a single value. Common aggregate functions are: COUNT(), SUM(), AVG(), MAX(), MIN(), and GROUP_CONCAT().",
  exp: "Aggregate functions ignore NULL values (except COUNT(*)). COUNT(*) counts all rows; COUNT(column) counts non-NULL values. AVG(salary) computes the average of non-NULL salaries. They are typically used with GROUP BY to compute aggregates per group. Example: SELECT dept, SUM(salary) FROM employees GROUP BY dept."
},
{
  id: 54, section: "Relational Model",
  q: "What is GROUP BY in SQL?",
  a: "GROUP BY groups rows that have the same values in specified columns into summary rows, allowing aggregate functions to be applied to each group independently.",
  exp: "Example: SELECT department, COUNT(*), AVG(salary) FROM employees GROUP BY department returns one row per department with count and average salary. All columns in SELECT that are not aggregate functions must appear in GROUP BY. GROUP BY is processed after WHERE but before HAVING and ORDER BY."
},
{
  id: 55, section: "Relational Model",
  q: "What is ORDER BY in SQL?",
  a: "ORDER BY sorts the result set of a query by one or more columns. Results can be sorted in ascending (ASC, default) or descending (DESC) order.",
  exp: "Example: SELECT * FROM employees ORDER BY salary DESC, name ASC sorts by salary descending, then by name ascending for equal salaries. ORDER BY can reference column names, column positions (ORDER BY 2), or expressions. NULL values are typically sorted last (ASC) or first (DESC) depending on the DBMS."
},
{
  id: 56, section: "Relational Model",
  q: "What are NULL values in SQL and how are they handled?",
  a: "NULL represents the absence of a value or unknown value. NULL is not the same as 0 or an empty string. In SQL, any comparison with NULL using = or ≠ returns UNKNOWN, not TRUE or FALSE.",
  exp: "To check for NULL, use IS NULL or IS NOT NULL (not = NULL). NULLs are handled specially in aggregates (ignored), joins (NULLs don't match each other), and three-valued logic (TRUE, FALSE, UNKNOWN). COALESCE(value, alternative) replaces NULL with a default. NULLs complicate many operations and must be considered carefully in queries."
},
{
  id: 57, section: "Relational Model",
  q: "What is COALESCE in SQL?",
  a: "COALESCE returns the first non-NULL value from a list of expressions. It is used to substitute a default value when a column is NULL.",
  exp: "Syntax: COALESCE(expr1, expr2, ..., exprN). Example: COALESCE(phone, email, 'No contact') returns phone if not NULL, else email if not NULL, else 'No contact'. It is evaluated left to right and stops at the first non-NULL. NULLIF(a, b) is the inverse — returns NULL if a=b, else a."
},
{
  id: 58, section: "Relational Model",
  q: "What is a CASE expression in SQL?",
  a: "A CASE expression provides conditional logic in SQL, similar to if-then-else. It evaluates conditions and returns a value when the first condition is met.",
  exp: "Simple CASE: CASE column WHEN value1 THEN result1 WHEN value2 THEN result2 ELSE default END. Searched CASE: CASE WHEN condition1 THEN result1 WHEN condition2 THEN result2 ELSE default END. Example: CASE WHEN salary > 100000 THEN 'High' WHEN salary > 50000 THEN 'Medium' ELSE 'Low' END. Used in SELECT, WHERE, ORDER BY, and aggregate functions."
},
{
  id: 59, section: "Relational Model",
  q: "What is a stored procedure in SQL?",
  a: "A stored procedure is a precompiled, named group of SQL statements stored in the database that can be executed by calling the procedure name. It accepts parameters and can return results.",
  exp: "Advantages: reusability, performance (precompiled execution plan), reduced network traffic, centralized business logic, better security (users execute procedure without direct table access). Example: CREATE PROCEDURE GetEmployeesByDept (IN dept_name VARCHAR(50)) BEGIN SELECT * FROM employees WHERE department = dept_name; END. Different syntax across DBMS (PL/SQL, T-SQL, PL/pgSQL)."
},
{
  id: 60, section: "Relational Model",
  q: "What is a trigger in DBMS?",
  a: "A trigger is a special stored procedure that automatically executes (fires) in response to specific events (INSERT, UPDATE, DELETE) on a table. It cannot be called directly.",
  exp: "Triggers are used for: auditing changes, enforcing complex business rules, maintaining derived data, and cascading operations. Types: BEFORE trigger (fires before the event) and AFTER trigger (fires after). Row-level triggers execute once per affected row; statement-level triggers once per SQL statement. Overuse of triggers can make logic hard to trace."
},
{
  id: 61, section: "Relational Model",
  q: "What is the difference between a stored procedure and a function in SQL?",
  a: "A function must return a value and can be used in SQL expressions (SELECT, WHERE). A stored procedure may or may not return values and is executed with CALL/EXEC — it cannot be used directly in expressions.",
  exp: "Functions are designed for computation and must be pure (ideally no side effects in some databases). Procedures can perform DML (INSERT, UPDATE, DELETE) and manage transactions. Functions can be used in SELECT statements (SELECT dbo.getBonus(emp_id)), while procedures cannot. Functions generally cannot call procedures, but procedures can call functions."
},
{
  id: 62, section: "Relational Model",
  q: "What is an index in DBMS and why is it used?",
  a: "An index is a data structure (typically B-tree or hash) associated with a table column(s) that speeds up data retrieval operations at the cost of additional storage space and slower write operations.",
  exp: "Without an index, a query searches all rows (full table scan). With an index, it can quickly locate rows matching conditions. CREATE INDEX idx_name ON table(column). Types: B-tree (range and equality), Hash (equality only), Bitmap (low-cardinality columns), Full-text (text search). Indexes benefit SELECT but add overhead to INSERT, UPDATE, DELETE."
},
{
  id: 63, section: "Relational Model",
  q: "What is the difference between clustered and non-clustered indexes?",
  a: "A clustered index determines the physical order of data rows in the table — only one clustered index per table. A non-clustered index is a separate structure that stores key values with pointers to the actual data rows.",
  exp: "When you create a PRIMARY KEY, it's typically the clustered index. Data is stored in order of the clustered key on disk. Non-clustered indexes (secondary indexes) store the key and a row pointer. Multiple non-clustered indexes can exist per table. Clustered index lookups are faster for range queries; non-clustered require an extra hop to find the actual row."
},
{
  id: 64, section: "Relational Model",
  q: "What is a composite index?",
  a: "A composite index (multi-column index) is an index built on two or more columns of a table. It speeds up queries that filter or sort on those columns in the same order as defined in the index.",
  exp: "Example: CREATE INDEX idx_emp ON employees(last_name, first_name) helps queries with WHERE last_name=? AND first_name=? or WHERE last_name=?, but NOT WHERE first_name=? alone (leftmost prefix rule). Column order matters — the index is scanned in order, so the most selective or most frequently filtered column should usually come first."
},
{
  id: 65, section: "Relational Model",
  q: "What is a covering index?",
  a: "A covering index is an index that contains all the columns needed to satisfy a query — both the search conditions and the projected columns — so the query engine can retrieve all data from the index without accessing the base table.",
  exp: "Example: For SELECT name, salary FROM employees WHERE dept = 'IT', an index on (dept, name, salary) covers the query entirely. This eliminates the need for row lookups ('key lookups' or 'bookmark lookups'), significantly improving performance for read-heavy queries. The index is said to 'cover' the query."
},
{
  id: 66, section: "Relational Model",
  q: "What is query optimization in DBMS?",
  a: "Query optimization is the process by which the DBMS query optimizer automatically selects the most efficient execution plan for a given SQL query, considering factors like available indexes, table sizes, statistics, and join strategies.",
  exp: "The optimizer transforms the SQL query into an algebraic expression, generates multiple candidate execution plans, estimates the cost of each (I/O, CPU, memory), and selects the lowest-cost plan. Execution plans can be inspected using EXPLAIN (MySQL/PostgreSQL) or EXPLAIN PLAN (Oracle). Good schema design, statistics updates, and appropriate indexes help the optimizer make better decisions."
},
{
  id: 67, section: "Relational Model",
  q: "What are window functions in SQL?",
  a: "Window functions perform calculations across a set of table rows that are related to the current row ('window'), without collapsing rows into groups. They use the OVER() clause to define the window.",
  exp: "Common window functions: ROW_NUMBER(), RANK(), DENSE_RANK(), LEAD(), LAG(), SUM() OVER, AVG() OVER, FIRST_VALUE(), LAST_VALUE(). Example: SELECT name, salary, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rank FROM employees. Unlike GROUP BY, window functions don't reduce rows — each row retains its data plus the computed window value."
},
{
  id: 68, section: "Relational Model",
  q: "What is the difference between RANK() and DENSE_RANK()?",
  a: "RANK() assigns the same rank to tied values but skips subsequent ranks (1,2,2,4). DENSE_RANK() assigns the same rank to tied values but does not skip ranks (1,2,2,3).",
  exp: "Example: Salaries [100, 90, 90, 80]. RANK(): 1, 2, 2, 4 (skips 3 because two rows tied at rank 2). DENSE_RANK(): 1, 2, 2, 3 (no gaps). ROW_NUMBER(): 1, 2, 3, 4 (always unique, arbitrary for ties). Use RANK for competition rankings; DENSE_RANK when you want consecutive ranks; ROW_NUMBER for pagination."
},
{
  id: 69, section: "Relational Model",
  q: "What is a Common Table Expression (CTE)?",
  a: "A CTE (introduced with the WITH clause) is a temporary, named result set that exists only within the execution scope of a single SQL statement. It improves readability and can be referenced multiple times in the main query.",
  exp: "Syntax: WITH cte_name AS (SELECT ...) SELECT * FROM cte_name. Recursive CTEs enable hierarchical queries (org charts, bill of materials): WITH RECURSIVE cte AS (base case UNION ALL recursive case). CTEs are useful for breaking complex queries into readable parts, replacing derived tables (subqueries in FROM), and implementing recursion."
},
{
  id: 70, section: "Relational Model",
  q: "What is the difference between UNION and UNION ALL?",
  a: "UNION combines results from two queries and removes duplicate rows. UNION ALL combines results and keeps all rows including duplicates, making it faster since no deduplication step is needed.",
  exp: "Both require the queries to be union-compatible (same number of columns with compatible types). UNION performs an implicit DISTINCT, which requires sorting/hashing to eliminate duplicates — adding performance overhead. Use UNION ALL when you know results are distinct or don't care about duplicates. The column names in the result come from the first query."
},

// ============================================================
// SECTION 3: NORMALIZATION (Q71–Q110)
// ============================================================
{
  id: 71, section: "Normalization",
  q: "What is First Normal Form (1NF)?",
  a: "A relation is in 1NF if all attributes contain only atomic (indivisible) values — no multi-valued attributes, no repeating groups, and each column must contain values of the same type. Every row must be uniquely identifiable.",
  exp: "Violation example: A column 'PhoneNumbers' containing '9999,8888' violates 1NF. Fix: create separate rows or a separate PhoneNumbers table. 1NF eliminates arrays, sets, and nested structures. Modern NoSQL databases may intentionally violate 1NF to store complex structures, trading normalization for flexibility."
},
{
  id: 72, section: "Normalization",
  q: "What is Second Normal Form (2NF)?",
  a: "A relation is in 2NF if it is in 1NF AND every non-key attribute is fully functionally dependent on the entire primary key (no partial dependencies). Partial dependency occurs only when the primary key is composite.",
  exp: "Example: Table(OrderID, ProductID, ProductName, Quantity). ProductName depends only on ProductID (partial dependency on composite key {OrderID, ProductID}). Fix: separate into Orders(OrderID, ProductID, Quantity) and Products(ProductID, ProductName). 2NF automatically holds if the primary key is a single column."
},
{
  id: 73, section: "Normalization",
  q: "What is Third Normal Form (3NF)?",
  a: "A relation is in 3NF if it is in 2NF AND no non-key attribute is transitively dependent on the primary key. That is, no non-key attribute depends on another non-key attribute.",
  exp: "Example: Employee(EmpID, DeptID, DeptName). DeptName depends on DeptID, not directly on EmpID — transitive dependency. Fix: Employee(EmpID, DeptID) and Department(DeptID, DeptName). Rule: For every functional dependency X→Y in R, either X is a superkey, or Y is a prime attribute (part of some candidate key)."
},
{
  id: 74, section: "Normalization",
  q: "What is Boyce-Codd Normal Form (BCNF)?",
  a: "A relation is in BCNF if for every non-trivial functional dependency X→Y, X must be a superkey. BCNF is a stronger form of 3NF that eliminates all redundancy based on functional dependencies.",
  exp: "A relation can be in 3NF but not BCNF when it has overlapping candidate keys. Example: Table(Student, Subject, Teacher) where each teacher teaches one subject and a student can take a subject with only one teacher: {Student, Subject}→Teacher and Teacher→Subject. Subject violates BCNF since Teacher is not a superkey. BCNF decomposition may not preserve all functional dependencies."
},
{
  id: 75, section: "Normalization",
  q: "What is Fourth Normal Form (4NF)?",
  a: "A relation is in 4NF if it is in BCNF AND has no non-trivial multi-valued dependencies. A multi-valued dependency X↠Y exists when X determines a set of Y values independently of other attributes.",
  exp: "Example: A table storing (Course, Teacher, Textbook) where teachers and textbooks for a course are independently assigned (no relationship between them). This creates a multi-valued dependency. Fix: split into (Course, Teacher) and (Course, Textbook). 4NF removes redundancy caused by independent multi-valued facts about an entity."
},
{
  id: 76, section: "Normalization",
  q: "What is Fifth Normal Form (5NF)?",
  a: "A relation is in 5NF (also called PJNF — Project-Join Normal Form) if it is in 4NF AND every join dependency in it is implied by its candidate keys.",
  exp: "5NF deals with join dependencies that cannot be eliminated by 4NF. A join dependency {R1, R2, R3} on R means R = R1 ⋈ R2 ⋈ R3. 5NF ensures a table cannot be losslessly decomposed into smaller tables without information loss. In practice, 3NF or BCNF is sufficient for most applications; 4NF and 5NF address rare corner cases."
},
{
  id: 77, section: "Normalization",
  q: "What is a functional dependency?",
  a: "A functional dependency X→Y means that for every valid instance of a relation, the value of attribute set X uniquely determines the value of attribute set Y. If two tuples agree on X, they must agree on Y.",
  exp: "Example: In Students, StudentID→Name means each StudentID has exactly one Name. Types: Trivial FD (Y⊆X, like {A,B}→A), Non-trivial FD (Y⊄X). Functional dependencies are the basis for normalization theory. They are specified by the database designer based on real-world semantics, not derived from instances."
},
{
  id: 78, section: "Normalization",
  q: "What is a partial dependency?",
  a: "A partial dependency exists when a non-key attribute depends on only part of a composite primary key, rather than the entire key. Eliminating partial dependencies is the goal of 2NF.",
  exp: "Example: OrderDetails(OrderID, ProductID, ProductName, Quantity) — primary key is {OrderID, ProductID}. ProductName depends only on ProductID (partial dependency). Quantity depends on {OrderID, ProductID} (full dependency). Split into OrderDetails(OrderID, ProductID, Quantity) and Products(ProductID, ProductName) to achieve 2NF."
},
{
  id: 79, section: "Normalization",
  q: "What is a transitive dependency?",
  a: "A transitive dependency exists when a non-key attribute depends on another non-key attribute (which itself depends on the primary key), rather than directly on the primary key. Eliminating transitive dependencies is the goal of 3NF.",
  exp: "If A→B and B→C, and B is not a key, then C is transitively dependent on A through B. Example: Employee(EmpID→DeptID→DeptName): DeptName is transitively dependent on EmpID. Fix: separate Department(DeptID, DeptName) from Employee(EmpID, DeptID) — each attribute depends directly on its table's primary key."
},
{
  id: 80, section: "Normalization",
  q: "What are the update anomalies in unnormalized data?",
  a: "Update anomalies in unnormalized data include: (1) Update anomaly — changing a fact requires updating multiple rows; (2) Insertion anomaly — cannot insert certain data without other unrelated data; (3) Deletion anomaly — deleting certain data inadvertently destroys other related information.",
  exp: "Example in an unnormalized table with student, course, and professor data: Insertion anomaly — can't add a course without a student enrollment. Deletion anomaly — deleting the last student in a course loses course/professor info. Update anomaly — changing professor's phone requires updating many rows. Normalization eliminates these by ensuring each fact is stored only once."
},
{
  id: 81, section: "Normalization",
  q: "What is Armstrong's axioms in functional dependencies?",
  a: "Armstrong's axioms are three fundamental rules for inferring all functional dependencies from a given set: (1) Reflexivity: if Y⊆X, then X→Y; (2) Augmentation: if X→Y, then XZ→YZ; (3) Transitivity: if X→Y and Y→Z, then X→Z.",
  exp: "Additional derived rules: Union (X→Y, X→Z implies X→YZ), Decomposition (X→YZ implies X→Y and X→Z), Pseudotransitivity. These axioms are sound (generate only valid FDs) and complete (generate all valid FDs). They are used to compute attribute closures and canonical covers, which are essential for normalization algorithms."
},
{
  id: 82, section: "Normalization",
  q: "What is the closure of an attribute set?",
  a: "The closure of an attribute set X under a set of functional dependencies F, denoted X⁺, is the set of all attributes that can be functionally determined by X using the given functional dependencies.",
  exp: "Algorithm: Start with X⁺ = X. For each FD A→B in F, if A⊆X⁺, add B to X⁺. Repeat until no change. Example: F = {A→B, B→C, A→D}. A⁺ = {A, B, C, D}. Use: To check if X is a superkey (X⁺ = all attributes), to check if X→Y follows from F (Y⊆X⁺), and to find all candidate keys."
},
{
  id: 83, section: "Normalization",
  q: "What is a canonical cover (minimal cover)?",
  a: "A canonical cover Fc of a set of functional dependencies F is an equivalent minimal set of functional dependencies with no extraneous attributes and no redundant dependencies.",
  exp: "A canonical cover satisfies: 1) Fc has the same closure as F; 2) No FD in Fc is redundant; 3) No attribute in any FD is extraneous. Algorithm: Remove extraneous left-hand-side attributes, remove extraneous right-hand-side attributes, remove redundant FDs. Used in synthesis algorithms to find minimal 3NF decompositions."
},
{
  id: 84, section: "Normalization",
  q: "What is lossless decomposition?",
  a: "A decomposition of relation R into relations R1 and R2 is lossless if the original relation R can be reconstructed exactly by joining R1 and R2. There is no loss of information and no spurious (extra) tuples are generated.",
  exp: "The lossless join condition (for binary decomposition): R1 ∩ R2 → R1 OR R1 ∩ R2 → R2. That is, the common attributes must be a superkey of at least one of the decomposed relations. Lossy decomposition generates spurious tuples on join — extra rows that don't correspond to real-world facts. Losslessness is essential for valid normalization."
},
{
  id: 85, section: "Normalization",
  q: "What is dependency preservation in normalization?",
  a: "A decomposition is dependency-preserving if every functional dependency in the original relation can be derived from the functional dependencies in the decomposed relations without performing joins.",
  exp: "If a dependency is not preserved, enforcing it requires joining tables, which is expensive. BCNF decomposition may sacrifice dependency preservation; 3NF synthesis always preserves dependencies. Example: If X→Y is in R but X and Y are split into different tables in the decomposition, that FD is not directly enforceable in either table."
},
{
  id: 86, section: "Normalization",
  q: "What is denormalization and when is it used?",
  a: "Denormalization is the deliberate process of introducing redundancy into a normalized database to improve read performance. It trades data integrity and storage efficiency for faster query execution.",
  exp: "Used in data warehouses, OLAP systems, and high-read applications. Techniques: adding redundant columns, storing precomputed aggregates, combining tables. Example: storing a customer's full name in Orders table despite it existing in Customers, to avoid joins. Risks: update anomalies, inconsistent data. Trade-off must be carefully weighed."
},
{
  id: 87, section: "Normalization",
  q: "What is the difference between 3NF and BCNF?",
  a: "3NF allows non-key attributes to appear on the right side of a non-superkey FD only if they are prime (part of a candidate key). BCNF requires the left side of every non-trivial FD to be a superkey — stricter than 3NF.",
  exp: "Every BCNF relation is in 3NF, but not vice versa. 3NF always allows a lossless, dependency-preserving decomposition. BCNF may not preserve all dependencies. BCNF is preferred for eliminating all redundancy; 3NF is a compromise when dependency preservation is critical. Most practical schemas that satisfy 3NF also satisfy BCNF."
},
{
  id: 88, section: "Normalization",
  q: "How do you determine if a relation is in BCNF?",
  a: "For every non-trivial functional dependency X→Y in the relation, check if X is a superkey (i.e., X⁺ = all attributes). If even one FD violates this, the relation is not in BCNF.",
  exp: "Algorithm: For each non-trivial FD X→Y in F⁺, compute X⁺. If X⁺ ≠ all attributes (X is not a superkey), then R is not in BCNF. To convert: decompose R into R1(X ∪ Y) and R2(X ∪ (R−Y)) and check each recursively. The process ensures lossless decomposition but may not preserve all FDs."
},
{
  id: 89, section: "Normalization",
  q: "What is a multi-valued dependency?",
  a: "A multi-valued dependency (MVD) X↠Y in a relation R means that for a given value of X, the set of Y values is independent of the set of Z values (where Z = R − X − Y). It represents two independent one-to-many relationships from X.",
  exp: "Example: Teaching(Course, Teacher, Book) — each course has a set of teachers and a set of books, independently. This creates an MVD: Course↠Teacher and Course↠Book. The redundancy: every (Course, Teacher) pair must be combined with every (Course, Book) pair. Fix: split into Teaching1(Course, Teacher) and Teaching2(Course, Book)."
},
{
  id: 90, section: "Normalization",
  q: "What is a prime attribute?",
  a: "A prime attribute is an attribute that belongs to at least one candidate key of the relation. A non-prime attribute is one that does not belong to any candidate key.",
  exp: "In the definition of 3NF: for every non-trivial FD X→Y, either X must be a superkey, OR Y must be a prime attribute. This allows non-superkey FDs only if they determine prime attributes. Non-prime attributes must depend directly on candidate keys. Identifying prime attributes requires finding all candidate keys first."
},
{
  id: 91, section: "Normalization",
  q: "What are the steps to normalize a relation to 3NF?",
  a: "Steps: (1) Ensure 1NF (atomic values). (2) Find all functional dependencies. (3) Find the canonical cover. (4) Create a relation for each FD in the canonical cover. (5) If no relation contains a candidate key of R, add one. (6) Remove any redundant relations.",
  exp: "This is the 3NF synthesis algorithm. It guarantees lossless join and dependency preservation. Key step: the canonical cover avoids creating unnecessary relations for redundant or extraneous FDs. Adding a relation with a candidate key in step 5 ensures losslessness. The result is a schema in 3NF with minimal redundancy."
},
{
  id: 92, section: "Normalization",
  q: "Explain the concept of 'Sixth Normal Form' (6NF).",
  a: "Sixth Normal Form (6NF) requires that every relation contain at most one non-key attribute. It is primarily relevant in temporal databases and data warehouses where each fact is independently time-varying.",
  exp: "6NF decomposes tables such that no join dependencies exist at all. In temporal databases, it allows different attributes of an entity to have different valid time periods. For example, an employee's salary and title can change independently. 6NF is rarely used in standard OLTP databases due to extreme table fragmentation; it's more relevant in temporal data management."
},
{
  id: 93, section: "Normalization",
  q: "What is the purpose of the closure algorithm in normalization?",
  a: "The closure algorithm computes the closure of an attribute set under a set of functional dependencies. It is used to check superkeys, find candidate keys, verify if a specific FD is implied, and perform normalization.",
  exp: "Closure(X, F): Start with Closure = X. For each FD A→B where A ⊆ Closure, add B to Closure. Repeat until stable. Applications: X is a superkey if X⁺ = all attributes; X→Y follows from F if Y ⊆ X⁺; Find all candidate keys by checking which attribute subsets have full closure."
},
{
  id: 94, section: "Normalization",
  q: "What is the difference between normalization and denormalization?",
  a: "Normalization reduces data redundancy and improves data integrity through decomposition. Denormalization introduces controlled redundancy to improve query performance, typically at the cost of data integrity complexity.",
  exp: "Normalization: 1NF→2NF→3NF→BCNF→4NF — removing anomalies, fewer tables, complex joins. Denormalization: merging tables, storing redundant columns, precomputed aggregates — fewer joins, faster reads, more storage. OLTP favors normalization; OLAP/data warehouses favor denormalization. The choice depends on the workload's read/write ratio."
},
{
  id: 95, section: "Normalization",
  q: "Can a table be in 3NF but not in BCNF? Give an example.",
  a: "Yes. A table is in 3NF but not BCNF when it has multiple overlapping candidate keys and a non-superkey determines a prime attribute.",
  exp: "Example: StudentCourse(StudentID, CourseID, Instructor) with FDs: {StudentID, CourseID}→Instructor and Instructor→CourseID. Candidate keys: {StudentID, CourseID} and {StudentID, Instructor}. The FD Instructor→CourseID violates BCNF (Instructor is not a superkey), but satisfies 3NF because CourseID is a prime attribute. 3NF permits FDs where RHS is prime; BCNF does not."
},
{
  id: 96, section: "Normalization",
  q: "What is an extraneous attribute in a functional dependency?",
  a: "An extraneous attribute is one that can be removed from the left or right side of a functional dependency without changing the closure of the dependency set. Removing extraneous attributes is part of computing the canonical cover.",
  exp: "Left-side extraneous: Attribute A in X→Y is extraneous if (X-A)⁺ still contains Y. Right-side extraneous: Attribute A in X→Y is extraneous if we can derive X→A from the modified set. Canonical cover computation removes all extraneous attributes to produce a minimal equivalent FD set."
},
{
  id: 97, section: "Normalization",
  q: "What is the Decomposition Property in normalization?",
  a: "The Decomposition Property (or additivity rule for FDs) states that if X→YZ, then X→Y and X→Z. A FD with multiple attributes on the right can be split into multiple FDs each with a single right-hand attribute.",
  exp: "This is derived from Armstrong's axioms. It's used when computing canonical covers — each FD is reduced to a single attribute on the right. This helps analyze FDs independently. Note: The union rule is the inverse — if X→Y and X→Z, then X→YZ."
},
{
  id: 98, section: "Normalization",
  q: "What is meant by 'loss of information' in a lossless join?",
  a: "Loss of information in a decomposition means that when the decomposed relations are joined back, they produce more tuples (spurious tuples) than the original relation — extra rows that don't represent real-world data.",
  exp: "Example: R(A,B,C) with instance {(1,2,3),(1,4,5)}. If we split into R1(A,B) and R2(A,C) and join on A: we get {(1,2,3),(1,2,5),(1,4,3),(1,4,5)} — 4 rows instead of 2. The extra rows (1,2,5) and (1,4,3) are spurious. This is a lossy decomposition. Lossless decomposition guarantees no spurious tuples on natural join."
},
{
  id: 99, section: "Normalization",
  q: "How do you find all candidate keys of a relation given functional dependencies?",
  a: "To find candidate keys: (1) Find attributes that appear only on the left side of FDs (must be in every key). (2) Find attributes that never appear in FDs (must be in every key). (3) Compute closure of combinations to find minimal superkeys.",
  exp: "Algorithm: Attributes not in any FD right-hand side must appear in every candidate key. Attributes only on right-hand sides can never be in a candidate key (unless they're on the left side too). Start with the 'must-have' attributes, compute closure, then extend by trying different subsets. A candidate key is a minimal superkey — no proper subset is also a superkey."
},
{
  id: 100, section: "Normalization",
  q: "What is the practical significance of normalization in database design?",
  a: "Normalization prevents data anomalies (insert, update, delete), reduces storage through eliminated redundancy, improves data consistency, simplifies integrity enforcement, and makes the schema easier to maintain and extend.",
  exp: "A well-normalized schema ensures each fact is stored once — updating a customer's address changes one record, not dozens. New data can be inserted without unrelated information requirements. Application logic is simplified because the schema reflects real-world constraints. Most production databases target 3NF or BCNF as a practical balance between normalization and query performance."
},

// ============================================================
// SECTION 4: ENTITY-RELATIONSHIP MODEL (Q101–Q140)
// ============================================================
{
  id: 101, section: "ER Model",
  q: "What is an Entity-Relationship (ER) model?",
  a: "An ER model is a high-level conceptual data model used to describe the structure of a database in terms of entities, attributes, and relationships. It is a graphical representation used during database design before implementation.",
  exp: "ER diagrams help communicate database design between technical and non-technical stakeholders. Key concepts: Entity (real-world object), Attribute (property of entity), Relationship (association between entities). It was introduced by Peter Chen in 1976 and is still widely used for conceptual schema design before mapping to relational tables."
},
{
  id: 102, section: "ER Model",
  q: "What is an entity in ER modeling?",
  a: "An entity is a real-world object or concept that exists independently and is distinguishable from other objects. Examples include a specific person, place, or thing. In ER diagrams, entities are represented by rectangles.",
  exp: "Entity types define the category (e.g., 'Student', 'Course'), while entity instances are specific occurrences (e.g., 'Alice', 'DBMS'). An entity set is the collection of all instances of an entity type at a given time. Entities have attributes that describe their properties."
},
{
  id: 103, section: "ER Model",
  q: "What is the difference between a strong entity and a weak entity?",
  a: "A strong entity has its own primary key and can exist independently. A weak entity cannot be uniquely identified by its own attributes alone — it depends on a 'owner' (strong) entity for its existence and identification.",
  exp: "Example: 'Order' is a strong entity (has OrderID). 'OrderItem' is a weak entity — it depends on Order and is identified by a partial key (ItemNumber) combined with the owner's key. Weak entities use a discriminator (partial key). In ER diagrams, weak entities are shown in double rectangles, their identifying relationships in double diamonds."
},
{
  id: 104, section: "ER Model",
  q: "What are the types of attributes in ER modeling?",
  a: "Types: (1) Simple/Atomic — cannot be subdivided (Age, Name). (2) Composite — can be divided into sub-parts (Address → Street, City, ZIP). (3) Multi-valued — can have multiple values (PhoneNumbers). (4) Derived — computed from other attributes (Age from DateOfBirth). (5) Key — uniquely identifies an entity.",
  exp: "Simple attributes are atomic (indivisible). Composite attributes are shown as ovals with connected sub-attribute ovals. Multi-valued attributes use double ovals in ER diagrams. Derived attributes are shown with dashed ovals. NULL attributes represent absent or unknown values. Understanding attribute types guides proper table design and normalization."
},
{
  id: 105, section: "ER Model",
  q: "What are cardinality constraints in ER modeling?",
  a: "Cardinality constraints specify the number of entities from one entity set that can be associated with entities from another entity set through a relationship. Types: one-to-one (1:1), one-to-many (1:N), many-to-many (M:N).",
  exp: "One-to-one: One employee has one desk. One-to-many: One department has many employees. Many-to-many: Students enroll in many courses and courses have many students. Cardinality directly affects how relationships are implemented in relational tables (1:N uses a foreign key; M:N requires a junction table)."
},
{
  id: 106, section: "ER Model",
  q: "What is participation constraint in ER modeling?",
  a: "Participation constraint (existence dependency) defines whether all or only some entity instances participate in a relationship. Total participation (double line) means every entity must participate; partial participation (single line) means some entities may not.",
  exp: "Example: Every employee must belong to a department (total participation of Employee in 'Works-In'). But not every department must have a manager (partial participation of Department in 'Manages'). Participation constraints translate to NOT NULL foreign key constraints (total) or nullable foreign keys (partial) in relational implementation."
},
{
  id: 107, section: "ER Model",
  q: "What is a ternary relationship in ER modeling?",
  a: "A ternary relationship involves three entity sets participating in a single relationship simultaneously. It represents an association that cannot be decomposed into binary relationships without losing information.",
  exp: "Example: A 'Supplies' relationship between Supplier, Project, and Part — a supplier supplies a specific part to a specific project. This cannot be decomposed into two binary relations (Supplier-Part and Part-Project) without losing which supplier provides which part to which project. In relational model, ternary relationships typically create a junction table with three foreign keys."
},
{
  id: 108, section: "ER Model",
  q: "What is an identifying relationship?",
  a: "An identifying relationship is the relationship between a weak entity and its owner (strong) entity. The weak entity's existence depends on the owner, and the owner's key participates in identifying weak entity instances.",
  exp: "Example: OrderItem (weak entity) is identified by the identifying relationship 'Contains' with Order (strong entity). An OrderItem instance (1, 3) means item #3 in Order #1. Without the OrderID, ItemNumber alone cannot identify the item. In ER diagrams, identifying relationships are shown with double diamonds."
},
{
  id: 109, section: "ER Model",
  q: "How do you convert an ER diagram to relational tables?",
  a: "Conversion rules: (1) Strong entity → table with all attributes, PK becomes primary key. (2) Weak entity → table with owner's PK + partial key as composite PK. (3) 1:1 relationship → FK in either table. (4) 1:N relationship → FK in the 'many' side. (5) M:N relationship → new junction table with both PKs as composite PK.",
  exp: "Composite attributes are either expanded into multiple columns or kept as structured types. Multi-valued attributes become separate tables. Derived attributes are usually not stored (computed at query time). Specialization/generalization hierarchies can use table-per-class, table-per-subclass, or single-table strategies."
},
{
  id: 110, section: "ER Model",
  q: "What is the Extended ER (EER) model?",
  a: "The Extended ER model adds additional semantic concepts to the basic ER model: Specialization (top-down), Generalization (bottom-up), Aggregation (relationship as entity), and Category (union types) to better represent complex real-world structures.",
  exp: "Specialization: divide an entity type into sub-types (Vehicle → Car, Truck). Generalization: group similar entity types into a supertype. Inheritance: subtypes inherit attributes and relationships from supertypes. Aggregation: represents a relationship between an entity and a relationship set. These concepts help model more complex semantics before database implementation."
},
{
  id: 111, section: "ER Model",
  q: "What is generalization in EER modeling?",
  a: "Generalization is a bottom-up process of identifying common attributes and relationships among several entity types and creating a single generalized (super) entity type that abstracts those shared properties.",
  exp: "Example: Car and Truck both have {VehicleID, Manufacturer, Model}. Generalize to Vehicle with those shared attributes. Car and Truck become sub-entities with their own specific attributes. Generalization is the reverse of specialization. It helps reduce schema complexity by factoring out commonalities, analogous to class inheritance in OOP."
},
{
  id: 112, section: "ER Model",
  q: "What is specialization in EER modeling?",
  a: "Specialization is a top-down process of defining sub-types of a general entity type based on distinguishing characteristics. Sub-types inherit all attributes of the super-type and have additional specific attributes.",
  exp: "Example: Employee is specialized into Manager and Technician. A Manager has additional attributes like BudgetAuthority; a Technician has CertificationLevel. Constraints: Disjoint (an entity can be in only one subtype) vs. Overlapping (can be in multiple subtypes). Total (every supertype entity must be in a subtype) vs. Partial (some may not be). These translate into inheritance patterns in relational schemas."
},
{
  id: 113, section: "ER Model",
  q: "What is aggregation in ER modeling?",
  a: "Aggregation is an abstraction that treats a relationship set as a higher-level entity. It allows a relationship to participate in another relationship, enabling modeling of 'relationships among relationships'.",
  exp: "Example: An employee 'Works-On' a project, and a manager 'Manages' that work engagement — not the employee or project individually. The Works-On relationship is aggregated and treated as an entity in the Manages relationship. Aggregation avoids ternary relationships in cases where an existing binary relationship needs to participate in another."
},
{
  id: 114, section: "ER Model",
  q: "What is a recursive relationship in ER modeling?",
  a: "A recursive relationship (also called a unary relationship) is a relationship where an entity set is related to itself. It represents relationships between entities of the same type.",
  exp: "Example: Employee 'Manages' Employee (manager-subordinate relationship). In ER diagrams, the same entity box is connected to both ends of the relationship diamond with different role labels ('Manager' and 'Subordinate'). In relational implementation, this adds a foreign key to the same table (ManagerID referencing EmployeeID in Employee table)."
},
{
  id: 115, section: "ER Model",
  q: "What is the min-max notation in ER diagrams?",
  a: "The min-max notation specifies for each entity participating in a relationship: the minimum number of relationship instances it must participate in (participation constraint) and the maximum number it can participate in (cardinality constraint).",
  exp: "Format: (min, max) beside the entity in the relationship. (0,1): optional, at most one. (1,1): mandatory, exactly one. (0,N): optional, many. (1,N): mandatory, many. Example: Employee (1,1)—Manages—(0,N) Department means each employee manages at most one department, each department is managed by exactly one employee."
},
{
  id: 116, section: "ER Model",
  q: "What is Crow's Foot notation in ER diagrams?",
  a: "Crow's Foot notation is a graphical convention for representing cardinality in ER diagrams using symbols at the end of relationship lines: a crow's foot (three lines) for 'many', a single line for 'one', with circles for 'zero' and vertical lines for 'one or more'.",
  exp: "Common symbols: || (one and only one), O| (zero or one), >| (one or many), O< (zero or many). Example: Customer—||—<Orders (one customer has one or many orders). Crow's Foot is widely used in tools like ERwin, Lucidchart, and MySQL Workbench. It's more compact than Chen notation for large diagrams."
},
{
  id: 117, section: "ER Model",
  q: "What are the different approaches to mapping IS-A hierarchies to relational tables?",
  a: "Three approaches: (1) Table-per-hierarchy (TPH/Single table): all subtypes in one table with a discriminator column and NULLs for inapplicable attributes. (2) Table-per-type (TPT/Multiple tables): supertype table + separate table per subtype. (3) Table-per-concrete-type (TPC): separate table per concrete subtype with all attributes.",
  exp: "TPH: simple queries, many NULLs, poor normalization. Example: Person table with type discriminator and role-specific NULL columns. TPT: normalized, join needed for subtype data, good for adding subtypes. TPC: best read performance for subtype queries, but supertype queries require UNION, shared attribute changes affect all tables. Choice depends on query patterns and schema stability."
},
{
  id: 118, section: "ER Model",
  q: "What is the difference between an entity type and an entity set?",
  a: "An entity type is the definition or schema of a class of entities — it defines the attributes that entities of that type will have. An entity set is the collection of all current entity instances of that type in the database.",
  exp: "Entity type 'Student' defines attributes (StudentID, Name, Age, GPA). Entity set for Student at a given time might contain {(101,'Alice',20,3.8), (102,'Bob',22,3.2)}. The entity type is analogous to a class definition in OOP; the entity set is like the set of all objects of that class. The entity set changes as data is inserted/deleted; the entity type (schema) is relatively stable."
},
{
  id: 119, section: "ER Model",
  q: "How is a many-to-many relationship implemented in a relational database?",
  a: "A many-to-many relationship is implemented by creating a junction (bridge/associative) table that contains the primary keys of both related tables as foreign keys. The composite of these foreign keys typically forms the primary key of the junction table.",
  exp: "Example: Students and Courses (M:N) → Enrollment table (StudentID, CourseID, Grade). StudentID references Students.StudentID; CourseID references Courses.CourseID. The junction table can have additional attributes describing the relationship (like Grade or EnrollmentDate). This effectively decomposes the M:N into two 1:N relationships."
},
{
  id: 120, section: "ER Model",
  q: "What is the role of a primary key in ER-to-relational mapping?",
  a: "In ER-to-relational mapping, the key attribute(s) of a strong entity become the primary key of its corresponding relation. For weak entities, the owner's primary key combined with the weak entity's partial key forms the composite primary key.",
  exp: "If multiple candidate keys exist in an entity, the designer chooses one as the primary key. Natural keys (meaningful identifiers like SSN) vs. surrogate keys (system-generated like auto-increment IDs). The choice affects joinability, index efficiency, and data entry. Surrogate keys are often preferred for stability and uniformity."
},

// ============================================================
// SECTION 5: TRANSACTION MANAGEMENT (Q121–Q160)
// ============================================================
{
  id: 121, section: "Transaction Management",
  q: "What are the states of a transaction in DBMS?",
  a: "A transaction goes through states: Active (executing), Partially Committed (last statement executed, before commit), Committed (successfully completed, changes permanent), Failed (cannot proceed normally), and Aborted (rolled back, database restored to prior state).",
  exp: "Transitions: Active → Partially Committed (after last operation) → Committed (after COMMIT). Active → Failed (on error) → Aborted (after ROLLBACK). After abort, the transaction can be restarted or killed. The state machine ensures the DBMS knows exactly what recovery actions to take at any point."
},
{
  id: 122, section: "Transaction Management",
  q: "What is atomicity in transactions and how is it implemented?",
  a: "Atomicity guarantees that all operations in a transaction execute completely or none of them execute. If any operation fails, the entire transaction is rolled back to the state before it began.",
  exp: "Implemented via logging: the DBMS records all changes in a transaction log (write-ahead log). If a failure occurs mid-transaction, the log is used to undo the incomplete changes (ROLLBACK). If the transaction completes, COMMIT makes changes permanent. Shadow paging is an alternative implementation (not commonly used today)."
},
{
  id: 123, section: "Transaction Management",
  q: "What is consistency in transactions?",
  a: "Consistency means that a transaction brings the database from one valid (consistent) state to another valid state. Integrity constraints must hold before and after the transaction, even if violated temporarily during its execution.",
  exp: "Consistency is partly the DBMS's responsibility (enforcing constraints) and partly the programmer's (writing correct transaction logic). Example: In a bank transfer, the total money before and after the transaction must be equal. The DBMS enforces constraint-based consistency; application logic ensures business rule consistency."
},
{
  id: 124, section: "Transaction Management",
  q: "What is isolation in transactions and what problems does it solve?",
  a: "Isolation ensures that the intermediate state of a transaction is not visible to other concurrently executing transactions. Each transaction appears to execute serially, even when running in parallel.",
  exp: "Without isolation: dirty reads (reading uncommitted changes), non-repeatable reads (reading different values in same transaction), phantom reads (new rows appearing between reads). Isolation levels (READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE) offer trade-offs between concurrency and these anomalies. Full isolation (serializable) is slowest; lower levels allow more concurrency at the cost of anomalies."
},
{
  id: 125, section: "Transaction Management",
  q: "What is durability in transactions?",
  a: "Durability guarantees that once a transaction is committed, its changes are permanent and will survive system failures (crashes, power outages). The committed data persists even if the system crashes immediately after commit.",
  exp: "Implemented via write-ahead logging (WAL) and checkpointing. Before COMMIT, changes are written to a stable log on disk. After a crash, the REDO phase replays committed transactions from the log, and the UNDO phase removes uncommitted changes. Durability depends on non-volatile storage (disk, SSD) rather than volatile memory (RAM)."
},
{
  id: 126, section: "Transaction Management",
  q: "What is a dirty read?",
  a: "A dirty read occurs when a transaction reads data that has been modified by another transaction that has not yet committed. If the other transaction later rolls back, the data read was invalid.",
  exp: "Example: T1 updates salary to 60000 (uncommitted). T2 reads salary = 60000. T1 rolls back. T2 used invalid data. Prevented by: READ COMMITTED isolation level and above. Allows maximum concurrency with the risk of reading invalid data. In practice, dirty reads are acceptable only in reporting queries where approximate values are sufficient."
},
{
  id: 127, section: "Transaction Management",
  q: "What is a non-repeatable read?",
  a: "A non-repeatable read occurs when a transaction reads the same row twice and gets different values because another committed transaction modified that row between the two reads.",
  exp: "Example: T1 reads salary = 50000. T2 updates salary to 60000 and commits. T1 reads salary again = 60000. The same data changed within T1's execution. Prevented by: REPEATABLE READ isolation level and above. The problem: T1's decision based on the first read may be invalidated. Solved by shared locks held until end of transaction."
},
{
  id: 128, section: "Transaction Management",
  q: "What is a phantom read?",
  a: "A phantom read occurs when a transaction executes a query twice and gets different result sets because another committed transaction inserted or deleted rows that match the query's condition between the two executions.",
  exp: "Example: T1 queries 'employees with salary > 50000' → gets 5 rows. T2 inserts a new employee with salary = 60000 and commits. T1 re-runs the same query → gets 6 rows. New row 'appeared' (phantom). Prevented by: SERIALIZABLE isolation level. REPEATABLE READ prevents phantom reads in MySQL (using gap locks) but not universally."
},
{
  id: 129, section: "Transaction Management",
  q: "What are the SQL transaction isolation levels?",
  a: "SQL defines four isolation levels: READ UNCOMMITTED (allows dirty reads), READ COMMITTED (prevents dirty reads), REPEATABLE READ (prevents dirty and non-repeatable reads), and SERIALIZABLE (prevents all anomalies including phantom reads).",
  exp: "Isolation level vs. anomalies: READ UNCOMMITTED: dirty reads allowed. READ COMMITTED: no dirty reads. REPEATABLE READ: no dirty/non-repeatable reads. SERIALIZABLE: no anomalies. Higher isolation = more consistency but lower concurrency/performance. Most databases default to READ COMMITTED (Oracle, PostgreSQL) or REPEATABLE READ (MySQL InnoDB)."
},
{
  id: 130, section: "Transaction Management",
  q: "What is a schedule in transaction management?",
  a: "A schedule is a sequence of operations (read, write, commit, abort) from multiple transactions, interleaved in time. It describes the actual order in which operations are executed by the DBMS.",
  exp: "A serial schedule executes one transaction at a time (no interleaving). A concurrent schedule interleaves operations from multiple transactions. A schedule is serializable if its result is equivalent to some serial schedule. Serializability is the gold standard for correctness in concurrent transaction execution."
},
{
  id: 131, section: "Transaction Management",
  q: "What is conflict serializability?",
  a: "A schedule is conflict serializable if it can be transformed into a serial schedule by swapping non-conflicting operations. Two operations conflict if they access the same data item, at least one is a write, and they belong to different transactions.",
  exp: "A conflict graph (precedence graph) has transactions as nodes. Draw an edge T_i → T_j if T_i's operation conflicts with and precedes T_j's. The schedule is conflict serializable if and only if the precedence graph is acyclic. If acyclic, a topological sort gives the equivalent serial order."
},
{
  id: 132, section: "Transaction Management",
  q: "What is the difference between conflict serializability and view serializability?",
  a: "Conflict serializability is stricter — it transforms schedules by swapping non-conflicting operations and is testable via precedence graphs. View serializability is broader — it allows equivalent results even through different operation orders, as long as reads see the same writes and final writes are the same.",
  exp: "Every conflict-serializable schedule is view serializable, but not vice versa. View serializability is NP-complete to test, making it impractical. Conflict serializability can be checked in polynomial time. In practice, DBMS use conflict-based concurrency control (lock-based or MVCC) to ensure conflict serializability."
},
{
  id: 133, section: "Transaction Management",
  q: "What is the Two-Phase Locking (2PL) protocol?",
  a: "2PL is a concurrency control protocol where each transaction has two phases: Growing phase (acquires locks, releases none) and Shrinking phase (releases locks, acquires none). 2PL guarantees conflict serializability.",
  exp: "Shared lock (S-lock): for reading, multiple transactions can hold simultaneously. Exclusive lock (X-lock): for writing, only one transaction can hold. In 2PL, once a transaction releases any lock (enters shrinking phase), it cannot acquire new locks. Variants: Strict 2PL (holds X-locks until commit, prevents dirty reads), Rigorous 2PL (holds all locks until commit), Conservative 2PL (acquires all locks at start, prevents deadlock)."
},
{
  id: 134, section: "Transaction Management",
  q: "What is a deadlock in database transactions?",
  a: "A deadlock is a situation where two or more transactions are each waiting for the other to release a lock, resulting in a circular wait where no transaction can proceed.",
  exp: "Example: T1 holds lock on A, wants B. T2 holds lock on B, wants A. Both wait forever. Detection: wait-for graph — nodes are transactions, edges indicate waiting. A cycle = deadlock. Resolution: abort one transaction (victim selection based on age, cost, or progress). Prevention: ordering locks, timeouts, or conservative 2PL."
},
{
  id: 135, section: "Transaction Management",
  q: "What is the wait-for graph used for?",
  a: "A wait-for graph is used to detect deadlocks in a database system. Nodes represent transactions; a directed edge from T_i to T_j means T_i is waiting for T_j to release a lock.",
  exp: "The DBMS periodically checks the wait-for graph. If a cycle is detected, a deadlock exists. The DBMS selects a victim transaction (the one with least cost/progress) to abort and rollback, breaking the cycle. The detection frequency is a performance trade-off — too frequent wastes CPU, too rare delays resolution."
},
{
  id: 136, section: "Transaction Management",
  q: "What are deadlock prevention strategies?",
  a: "Strategies: (1) Wait-Die: older transaction waits for younger; younger is killed. (2) Wound-Wait: older transaction preempts (wounds) younger; older waits for younger. (3) No-Wait: if a lock can't be acquired, immediately abort. (4) Lock ordering: acquire locks in a predefined order to prevent circular waits.",
  exp: "Wait-Die: non-preemptive — younger is rolled back. Wound-Wait: preemptive — younger is preempted if older needs its lock. Both guarantee no circular wait. Lock ordering is practical and effective (e.g., always lock tables in alphabetical order). Timeout-based approach aborts a transaction that has waited too long — simple but may abort transactions unnecessarily."
},
{
  id: 137, section: "Transaction Management",
  q: "What is MVCC (Multi-Version Concurrency Control)?",
  a: "MVCC is a concurrency control technique where the database maintains multiple versions of data. Read operations access a consistent snapshot (an older version), while write operations create new versions, allowing reads and writes to proceed concurrently without blocking each other.",
  exp: "Used by: PostgreSQL, Oracle, MySQL InnoDB, SQL Server. Benefits: readers don't block writers, writers don't block readers — dramatically improving concurrency. Each transaction sees a consistent snapshot of the database as of its start time. Old versions are garbage-collected when no longer needed. MVCC naturally prevents dirty reads without locking."
},
{
  id: 138, section: "Transaction Management",
  q: "What is optimistic concurrency control?",
  a: "Optimistic concurrency control (OCC) assumes conflicts are rare. Transactions execute without acquiring locks, then at commit time, a validation phase checks for conflicts. If a conflict is detected, the transaction is aborted and retried.",
  exp: "Three phases: Read phase (execute without locks, maintain read/write sets), Validation phase (check if read set was modified by concurrently committed transactions), Write phase (if valid, commit changes). OCC is efficient when conflicts are rare (read-heavy workloads). High conflict rates cause many aborts (thrashing), making it worse than locking."
},
{
  id: 139, section: "Transaction Management",
  q: "What is a savepoint in transaction processing?",
  a: "A savepoint is a marker set within a transaction that allows partial rollback to that point without rolling back the entire transaction. It enables fine-grained recovery within a transaction.",
  exp: "Syntax: SAVEPOINT sp1; ... ROLLBACK TO SAVEPOINT sp1; ... COMMIT. When you rollback to a savepoint, changes made after that savepoint are undone, but changes before it are retained. Useful in complex long transactions where you want to retry a portion on error without discarding all work. RELEASE SAVEPOINT removes it."
},
{
  id: 140, section: "Transaction Management",
  q: "What is write-ahead logging (WAL)?",
  a: "Write-ahead logging is a protocol where all changes are first written to a log file on disk before being applied to the actual database files. This ensures that completed transactions can be replayed (REDO) and incomplete ones can be undone (UNDO) after a crash.",
  exp: "WAL rule: log records for a change must be on disk before the actual data page is written to disk. On crash recovery: REDO committed transactions whose data pages weren't flushed; UNDO uncommitted transactions whose partial effects are in data pages. WAL is the foundation of ARIES recovery algorithm and is used by PostgreSQL, MySQL, SQLite, and most modern DBMS."
},

// ============================================================
// SECTION 6: CONCURRENCY CONTROL (Q141–Q170)
// ============================================================
{
  id: 141, section: "Concurrency Control",
  q: "What is concurrency control in DBMS?",
  a: "Concurrency control is the mechanism that coordinates simultaneous execution of transactions to ensure the correctness and consistency of the database despite multiple users accessing and modifying data at the same time.",
  exp: "Without concurrency control: lost updates (one transaction overwrites another's changes), dirty reads, unrepeatable reads, phantom reads. Mechanisms: lock-based (2PL), timestamp-based, MVCC, optimistic. The goal: achieve maximum concurrency while preserving serializability and isolation guarantees."
},
{
  id: 142, section: "Concurrency Control",
  q: "What is a lock in DBMS and what are the types?",
  a: "A lock is a mechanism that restricts access to data to ensure consistency during concurrent access. Types: Shared lock (S/read lock) — multiple transactions can read; Exclusive lock (X/write lock) — only one transaction can write; Update lock — prevents deadlock in read-then-write patterns.",
  exp: "Lock compatibility matrix: S-S: compatible (both can read). S-X: incompatible (can't read while writing). X-X: incompatible (only one writer). X-S: incompatible. Intention locks (IS, IX, SIX) allow coarser-grained locking at the table level while finer locks are held at row level. Proper locking prevents data corruption in concurrent environments."
},
{
  id: 143, section: "Concurrency Control",
  q: "What is lock granularity?",
  a: "Lock granularity refers to the size of the data item being locked. Options range from coarse to fine: database-level, table-level, page-level, row-level, and attribute-level locks.",
  exp: "Coarse granularity (table lock): less overhead, but high contention — only one transaction can work on the table. Fine granularity (row lock): higher concurrency, but more lock management overhead. Most DBMS default to row-level locking with table-level fallback. Lock escalation: DBMS upgrades many row locks to a single table lock to reduce overhead when a transaction holds many row locks."
},
{
  id: 144, section: "Concurrency Control",
  q: "What is a timestamp-based concurrency control protocol?",
  a: "Timestamp-based concurrency control assigns each transaction a unique timestamp when it starts. Operations are ordered based on timestamps — older transactions (with earlier timestamps) have priority, and conflicts are resolved by aborting the younger transaction.",
  exp: "Thomas Write Rule and timestamp ordering protocol: For each data item, track read-timestamp (RTS) and write-timestamp (WTS). If a transaction tries to read/write data modified by a newer transaction, it's aborted and restarted with a new timestamp. Advantages: deadlock-free. Disadvantage: many aborts (long transactions may repeatedly abort)."
},
{
  id: 145, section: "Concurrency Control",
  q: "What is a phantom problem in concurrency control?",
  a: "The phantom problem occurs when a transaction re-executes a search that returns a different set of rows because another transaction inserted or deleted rows matching the search condition, even though the originally-matching rows haven't changed.",
  exp: "Example: T1 finds 5 employees with salary > 50000. T2 inserts employee with salary = 60000 and commits. T1 re-queries and finds 6 rows — a phantom appeared. Prevented by: SERIALIZABLE isolation, predicate locking (locks on search conditions, not just rows), or index range locks. 2PL with row-level locking doesn't prevent phantoms."
},
{
  id: 146, section: "Concurrency Control",
  q: "What is a livelock in DBMS?",
  a: "Livelock is a situation where transactions repeatedly abort and restart without making progress, often because each one keeps yielding to the other, similar to two people repeatedly stepping aside for each other in a hallway.",
  exp: "Unlike deadlock (no progress due to waiting), livelock involves active but futile retries. Example: T1 and T2 both need locks on A and B. T1 acquires A, T2 acquires B. Both detect the conflict, roll back. Both restart simultaneously and repeat. Solution: random backoff delays before retry, priority schemes (wait-die/wound-wait), or queuing."
},
{
  id: 147, section: "Concurrency Control",
  q: "What is strict Two-Phase Locking (Strict 2PL)?",
  a: "Strict 2PL is a variation of 2PL where a transaction holds all exclusive (write) locks until it either commits or aborts. This prevents dirty reads and cascading rollbacks while still guaranteeing conflict serializability.",
  exp: "In basic 2PL, releasing a write lock early (before commit) could allow another transaction to read uncommitted data (dirty read). If T1 later rolls back, T2 must also roll back (cascading rollback). Strict 2PL avoids this by keeping write locks until commit. Rigorous 2PL holds all locks (read and write) until commit — even stricter."
},
{
  id: 148, section: "Concurrency Control",
  q: "What is cascading rollback and how is it prevented?",
  a: "Cascading rollback occurs when the rollback of one transaction forces the rollback of other transactions that have read data written by the first transaction. This can lead to a chain of rollbacks.",
  exp: "Example: T1 writes X=10 (uncommitted). T2 reads X=10. T3 reads X. T1 aborts → T2 must abort (read dirty data) → T3 must abort. Prevention: Strict 2PL (hold write locks until commit, so other transactions can't read uncommitted data). READ COMMITTED isolation also prevents dirty reads and thus cascading rollbacks."
},
{
  id: 149, section: "Concurrency Control",
  q: "What is the difference between pessimistic and optimistic concurrency control?",
  a: "Pessimistic control assumes conflicts will occur and prevents them proactively by acquiring locks before accessing data. Optimistic control assumes conflicts are rare and allows unprotected access, checking for conflicts only at commit time.",
  exp: "Pessimistic (lock-based): good for high-contention workloads — locks prevent conflicts. Overhead: lock management, potential deadlocks. Optimistic: good for low-contention, read-heavy workloads — no lock overhead. Validation phase catches conflicts. If many conflicts: many aborts (thrashing). MVCC is a form of optimistic control for reads (readers never block)."
},
{
  id: 150, section: "Concurrency Control",
  q: "What is a lost update problem?",
  a: "The lost update problem occurs when two transactions read the same data, compute a new value, and both write back, causing one transaction's update to be overwritten (lost) by the other.",
  exp: "Example: Balance = 1000. T1 reads 1000, adds 200, writes 1200. T2 reads 1000 (before T1 writes), adds 300, writes 1300. T1's update is lost — total should be 1500 (1000+200+300) but only T2's update survives. Prevention: exclusive locks, SELECT FOR UPDATE, or SERIALIZABLE isolation. This is one of the most common concurrency bugs in applications."
},

// ============================================================
// SECTION 7: RECOVERY MANAGEMENT (Q151–Q185)
// ============================================================
{
  id: 151, section: "Recovery Management",
  q: "What is database recovery and why is it needed?",
  a: "Database recovery is the process of restoring the database to a consistent state after a failure (hardware failure, software crash, power loss, transaction errors, or intentional abort). It ensures durability and atomicity of ACID properties.",
  exp: "Failures types: Transaction failure (logic error, deadlock), System failure (OS crash, power outage — memory lost but disk intact), Media failure (disk crash — data lost). Recovery manager uses logs and backups to undo uncommitted transactions (UNDO) and redo committed transactions whose changes weren't fully written to disk (REDO)."
},
{
  id: 152, section: "Recovery Management",
  q: "What is the ARIES recovery algorithm?",
  a: "ARIES (Algorithm for Recovery and Isolation Exploiting Semantics) is a WAL-based recovery algorithm used by most modern DBMS. It has three phases: Analysis (identify dirty pages and active transactions at crash), REDO (redo all actions from checkpoint to bring database to crash state), and UNDO (undo all incomplete transactions).",
  exp: "Key concepts: Log Sequence Number (LSN) — unique ID for each log record; Dirty page table — pages modified but not yet flushed to disk; Transaction table — active transactions at checkpoint. Redo all, then undo as needed. ARIES supports fine-grained locking, partial rollbacks, and physiological logging (hybrid of physical and logical). Used in IBM DB2, SQL Server, PostgreSQL."
},
{
  id: 153, section: "Recovery Management",
  q: "What is a checkpoint in DBMS recovery?",
  a: "A checkpoint is a point in time where the DBMS writes all dirty pages (modified but not flushed) to disk and records the current active transactions in the log. It reduces the amount of work needed during recovery.",
  exp: "Without checkpoints, recovery must scan the entire log from the beginning. With checkpoints, only the log from the last checkpoint onward needs to be examined. During checkpoint: flush all dirty buffer pages, write a CHECKPOINT log record listing active transactions. Transaction log before the checkpoint can be truncated. Fuzzy checkpoints write the dirty page table without stopping all transactions."
},
{
  id: 154, section: "Recovery Management",
  q: "What is the difference between immediate and deferred modification in recovery?",
  a: "Immediate modification: data is written to the database (possibly disk) before a transaction commits — requires UNDO capability. Deferred modification: all changes are buffered and only written to disk after commit — requires REDO but no UNDO.",
  exp: "Immediate modification: more complex recovery (need to undo partial changes), but allows writing to disk early, reducing memory pressure. Deferred modification: simpler recovery (no undo needed since uncommitted changes never reached disk), but requires large buffers. Most modern DBMS use steal/no-force policy (steal = immediate modification; no-force = deferred writes), requiring both REDO and UNDO."
},
{
  id: 155, section: "Recovery Management",
  q: "What is the steal/no-force buffer management policy?",
  a: "Steal: allows dirty (uncommitted) pages to be written to disk before commit (needed for UNDO). No-Steal: uncommitted pages never written to disk. Force: all dirty pages of a transaction must be written to disk before commit (eliminates REDO). No-Force: pages can remain in memory after commit (requires REDO).",
  exp: "Optimal policy for performance: Steal + No-Force. Steal enables writing dirty pages to free buffer space (needed when buffer pool is small). No-Force avoids forced disk writes at commit time (I/O bottleneck). Together they require both UNDO (for steal) and REDO (for no-force), which ARIES handles. Other combinations: No-Steal+Force requires neither UNDO nor REDO but has poor performance."
},
{
  id: 156, section: "Recovery Management",
  q: "What is shadow paging in database recovery?",
  a: "Shadow paging is a recovery technique that maintains two page tables: the current page table (active transactions) and the shadow page table (copy before transaction started). On commit, the shadow is replaced by the current; on abort, the shadow is restored.",
  exp: "Benefits: No UNDO needed (just restore shadow), conceptually simple, no log needed for data recovery. Drawbacks: Garbage collection of old pages, poor locality (pages scattered), high cost on commit (update shadow), no support for concurrent transactions (one global shadow). Replaced by WAL-based logging in practice due to performance issues."
},
{
  id: 157, section: "Recovery Management",
  q: "What is the purpose of undo and redo logs?",
  a: "Undo log contains 'before images' of modified data — used to reverse uncommitted transactions during recovery. Redo log contains 'after images' — used to replay committed transactions whose changes weren't yet reflected in data files.",
  exp: "Undo: if T was active at crash, reverse all its changes using before-images. Redo: if T committed but its pages weren't flushed to disk, replay its changes using after-images. A WAL-based system maintains both in the same transaction log. Combined UNDO/REDO logging supports the steal/no-force policy."
},
{
  id: 158, section: "Recovery Management",
  q: "What is media recovery in DBMS?",
  a: "Media recovery handles the most severe failure type: loss of the database files due to disk failure. It restores the database using a backup copy combined with archived redo logs to bring the database forward to the point of failure.",
  exp: "Process: Restore from last full backup → apply incremental backups (if any) → apply archived redo logs (roll forward) → stop at desired recovery point (full recovery or point-in-time). Requires: regular backups, archived log files. The RPO (Recovery Point Objective) depends on backup frequency. RMAN in Oracle, pg_basebackup + WAL in PostgreSQL support media recovery."
},
{
  id: 159, section: "Recovery Management",
  q: "What is point-in-time recovery (PITR)?",
  a: "Point-in-time recovery allows restoring a database to any specific moment in time, not just the last backup. It is achieved by applying transaction logs from the backup point up to the desired recovery time.",
  exp: "Use case: 'An erroneous DELETE was run at 2:00 PM — restore to 1:59 PM.' Process: Restore from base backup → apply WAL archives → stop replay at the target time. PostgreSQL calls this 'continuous archiving'; Oracle calls it 'flashback database' (for recent times) or 'incomplete recovery'. Critical for compliance, disaster recovery, and accidental data loss scenarios."
},
{
  id: 160, section: "Recovery Management",
  q: "What is the log buffer and why is it important?",
  a: "The log buffer is an in-memory area where log records are temporarily accumulated before being flushed to the log file on disk. It reduces the number of disk I/Os needed for logging.",
  exp: "Log records are written to the log buffer during transaction execution. At COMMIT or when the buffer is full, it's flushed to disk. The WAL constraint requires flushing the log before the COMMIT is acknowledged. Log buffer size affects recovery overhead — larger buffer = less frequent flushes but more work during crash recovery. The group commit optimization batches multiple transaction commits into a single log flush."
},

// ============================================================
// SECTION 8: INDEXING AND HASHING (Q161–Q200)
// ============================================================
{
  id: 161, section: "Indexing and Hashing",
  q: "What is a B-tree index?",
  a: "A B-tree (balanced tree) index is a self-balancing tree data structure where all leaf nodes are at the same depth. Each node can contain multiple keys and pointers, enabling efficient search, insert, delete, and range queries.",
  exp: "B-tree properties: all leaves at same level, every node (except root) has between ⌈m/2⌉ and m children (m = order), keys in each node are sorted. B+ tree (most common implementation): only leaf nodes contain data pointers; internal nodes are routing only; leaves are linked for range scan efficiency. Used by MySQL InnoDB, PostgreSQL, Oracle."
},
{
  id: 162, section: "Indexing and Hashing",
  q: "What is the difference between a B-tree and a B+ tree?",
  a: "In a B-tree, data pointers can appear in both internal nodes and leaf nodes. In a B+ tree, data pointers appear only in leaf nodes; internal nodes contain only keys for routing. B+ tree leaves are linked in a doubly-linked list for efficient range scans.",
  exp: "B+ tree advantages over B-tree: better range query performance (follow linked leaves instead of traversing the tree), more keys per internal node (no data pointers) → shorter tree → fewer I/Os, more predictable performance. Most database index implementations use B+ trees. B-tree: finding a key may terminate at an internal node. B+ tree: always goes to the leaf level."
},
{
  id: 163, section: "Indexing and Hashing",
  q: "What is a hash index?",
  a: "A hash index uses a hash function to map index key values to bucket addresses. It provides O(1) average-case lookup for equality conditions but does not support range queries.",
  exp: "For query 'WHERE id = 42': compute hash(42) → bucket address → fetch records. Extendible hashing and linear hashing handle bucket overflow. Hash indexes are ideal for exact-match lookups (point queries). They cannot answer 'WHERE id > 42' since hashed values lose ordering. Used in memory hash tables, hash joins, and some DBMS secondary indexes."
},
{
  id: 164, section: "Indexing and Hashing",
  q: "What is a bitmap index?",
  a: "A bitmap index represents column values as bit arrays (bitmaps). For each distinct value in the column, a bitmap is created with bits set to 1 for rows containing that value. Bitmap operations (AND, OR, NOT) efficiently answer multi-column queries.",
  exp: "Example: Gender column with values M/F. Two bitmaps: M: 10110... F: 01001... Query 'Gender=M AND Dept=IT': AND the gender M bitmap with the Dept=IT bitmap. Fast for low-cardinality columns (few distinct values). Poor for high-cardinality (unique values like IDs). Used heavily in data warehouses and OLAP systems. High update cost — each update may modify multiple bitmaps."
},
{
  id: 165, section: "Indexing and Hashing",
  q: "What is a full-text index?",
  a: "A full-text index enables efficient searching of textual data for words or phrases. Instead of indexing entire column values, it creates an inverted index mapping words/tokens to the records containing them.",
  exp: "Example: A document table indexed for full-text search. Query: MATCH(content) AGAINST('database management') finds all documents containing those words. Full-text indexes support relevance ranking, stemming (finding 'run', 'running', 'ran'), stop words (ignoring 'the', 'is'), and boolean operators. Used in MySQL (InnoDB FTS), PostgreSQL (tsvector/tsquery), Elasticsearch."
},
{
  id: 166, section: "Indexing and Hashing",
  q: "What is a sparse index vs a dense index?",
  a: "A dense index has an index entry for every record in the data file. A sparse index has index entries for only some records (typically one per block or page), trading index size for faster updates at the cost of more I/O per lookup.",
  exp: "Dense index: faster lookup (direct record access) but larger, more space and maintenance. Sparse index: smaller, less overhead on inserts/updates, but requires scanning within a block. Clustered indexes often use sparse indexing (one entry per data block) since records are physically sorted. Non-clustered (secondary) indexes must be dense (data not sorted by secondary key)."
},
{
  id: 167, section: "Indexing and Hashing",
  q: "What is index selectivity?",
  a: "Index selectivity is the ratio of distinct values to total rows in a column. High selectivity means many distinct values (e.g., primary key); low selectivity means few distinct values (e.g., gender). High-selectivity columns benefit more from indexes.",
  exp: "Selectivity = distinct_values / total_rows. Range: 0 to 1. Closer to 1 = more selective = index more effective. An index on 'gender' (2 distinct values in millions of rows) has low selectivity — querying 'WHERE gender=M' would return ~50% of rows, making a full table scan faster than index lookup. The query optimizer considers selectivity when choosing execution plans."
},
{
  id: 168, section: "Indexing and Hashing",
  q: "Explain what is a covering index and its primary benefit.",
  a: "A covering index includes all columns needed by a query (both in WHERE and SELECT clauses), allowing the query to be answered entirely from the index without accessing the base table.",
  exp: "Example: Query SELECT name, salary FROM emp WHERE dept='IT'. Index on (dept, name, salary) is covering. The optimizer performs an index-only scan — never touches the table. Benefits: eliminates 'key lookup' operations, significantly faster for read-heavy queries. Trade-off: larger indexes take more space and slow down writes. Design covering indexes for critical frequent queries."
},
{
  id: 169, section: "Indexing and Hashing",
  q: "What is an index scan vs a table scan?",
  a: "A table scan (full scan) reads every row in the table sequentially. An index scan uses an index to find matching rows quickly, then may retrieve additional data from the table (unless it's an index-only scan).",
  exp: "Table scan: O(N) cost — fine for small tables or queries returning many rows. Index scan: O(log N) for B-tree lookup + O(K) for K matching rows — efficient for selective queries. The optimizer chooses based on selectivity and table size. Counter-intuitively, for very low-selectivity queries (returning >15–20% of rows), full table scan may be faster due to better sequential I/O patterns."
},
{
  id: 170, section: "Indexing and Hashing",
  q: "What is extendible hashing?",
  a: "Extendible hashing is a dynamic hash structure that handles overflow by doubling the number of buckets incrementally as needed, using a directory structure to map hash values to buckets without rehashing all existing data.",
  exp: "Uses a directory (array) of bucket pointers and global/local depth values. When a bucket overflows: increase local depth, split bucket, redistribute entries. If local depth exceeds global depth: double the directory. Only the overflowing bucket's entries are redistributed — not the entire hash table. More efficient than static hashing for databases with growing data."
},

// ============================================================
// SECTION 9: QUERY PROCESSING AND OPTIMIZATION (Q171–Q210)
// ============================================================
{
  id: 171, section: "Query Processing",
  q: "What are the steps in query processing?",
  a: "Query processing steps: (1) Parsing and translation — parse SQL, check syntax/semantics, translate to relational algebra. (2) Optimization — generate and evaluate multiple execution plans, select lowest cost. (3) Evaluation — execute the chosen plan using the storage engine.",
  exp: "The parser builds a parse tree and checks against the data dictionary (valid tables, columns, types). The query rewriter applies logical transformations. The optimizer generates access plans considering indexes, join orders, and execution algorithms. The executor runs the plan, interfacing with the buffer manager and storage. Understanding these phases helps write efficient queries."
},
{
  id: 172, section: "Query Processing",
  q: "What is a query execution plan?",
  a: "A query execution plan (QEP) is a detailed description of the physical operations the DBMS will perform to execute a query, including the order of operations, join methods, access paths (index vs. table scan), and estimated costs.",
  exp: "Plans are tree-structured, with leaves as table accesses and internal nodes as operations (joins, sorts, aggregations). Viewable with EXPLAIN (MySQL, PostgreSQL) or EXPLAIN PLAN (Oracle). Key information: operation type, estimated rows, actual rows, estimated cost, join type. Plan analysis helps identify missing indexes, bad cardinality estimates, and inefficient join orders."
},
{
  id: 173, section: "Query Processing",
  q: "What are the main join algorithms used in query optimization?",
  a: "Main join algorithms: (1) Nested Loop Join — for each row in outer table, scan inner table for matches. (2) Sort-Merge Join — sort both tables on join key, then merge. (3) Hash Join — build hash table on smaller relation, probe with larger relation.",
  exp: "Nested Loop Join: O(N×M) — good for small tables or when inner table has an index. Sort-Merge Join: O(N log N + M log M) — good when both tables are large and already sorted. Hash Join: O(N+M) — most efficient for large unsorted tables; requires memory for hash table. The optimizer chooses based on table sizes, available indexes, and memory."
},
{
  id: 174, section: "Query Processing",
  q: "What is the cost model in query optimization?",
  a: "The cost model estimates the resource consumption (primarily disk I/O, CPU, and memory) for each candidate execution plan. The optimizer selects the plan with the minimum estimated cost.",
  exp: "Cost factors: number of I/O operations (dominant factor historically), CPU computation, memory usage, network (for distributed queries). Statistics used: number of rows, number of distinct values, data distribution (histograms). Outdated statistics lead to poor plan choices — ANALYZE TABLE (MySQL) or VACUUM ANALYZE (PostgreSQL) refreshes them."
},
{
  id: 175, section: "Query Processing",
  q: "What is predicate pushdown in query optimization?",
  a: "Predicate pushdown is an optimization where filter conditions (WHERE predicates) are moved as early as possible in the query execution plan — as close to the data source as possible — to reduce the number of rows processed at higher levels.",
  exp: "Example: SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id WHERE customers.city = 'Mumbai'. Without pushdown: join all rows, then filter. With pushdown: filter customers by city='Mumbai' first, then join. Fewer rows in the join dramatically reduces cost. Modern DBMS query optimizers automatically apply predicate pushdown."
},
{
  id: 176, section: "Query Processing",
  q: "What is a materialized view?",
  a: "A materialized view is a database object that stores the result of a query physically on disk, unlike a regular view which is virtual. It is pre-computed and refreshed periodically or on demand.",
  exp: "Benefits: dramatically speeds up complex, frequently-run aggregate queries. Used extensively in data warehouses. Trade-offs: additional storage, refresh overhead (REFRESH MATERIALIZED VIEW), potentially stale data. Fast refresh (incremental) updates only changed rows; complete refresh recomputes entirely. Oracle, PostgreSQL, SQL Server support materialized views. Used for BI dashboards and reporting."
},
{
  id: 177, section: "Query Processing",
  q: "What is query rewriting?",
  a: "Query rewriting transforms an SQL query into a semantically equivalent form that can be executed more efficiently. The DBMS automatically applies rewriting rules such as subquery flattening, view merging, and predicate simplification.",
  exp: "Examples: Convert correlated subquery to a join (often faster). Merge inline views into the main query. Replace OR conditions with UNION for index usability. Push predicates inside views. Apply transitivity (if A=B and B=5, then A=5). Eliminate unnecessary DISTINCT. Most modern optimizers include a rule-based rewriting phase before cost-based optimization."
},
{
  id: 178, section: "Query Processing",
  q: "What is a histogram in query optimization?",
  a: "A histogram is a statistical summary of the distribution of values in a column, used by the query optimizer to estimate the selectivity of predicates and thus the number of rows returned by operations.",
  exp: "Types: Equi-width (fixed bucket width), Equi-height/equi-depth (each bucket has ~same number of rows), Most-common-values (separate tracking for frequent values). Accurate histograms improve cardinality estimates, leading to better join orders and plan choices. PostgreSQL uses Most Common Values + equi-height histograms. Collected by ANALYZE or automatically by autovacuum."
},
{
  id: 179, section: "Query Processing",
  q: "What is pipelining in query processing?",
  a: "Pipelining (streaming) is a query processing technique where the output of one operator is immediately passed to the next operator without materializing the entire intermediate result. Operators work concurrently, processing tuples as they arrive.",
  exp: "Example: Scan → Filter → Join → Aggregate. In pipelining, the join receives tuples from the filter as they are produced, without waiting for all filtered tuples. Reduces memory usage and can return first results faster (useful for LIMIT queries). Blocking operators (sort, hash join build phase) break the pipeline — they must consume all input before producing output."
},
{
  id: 180, section: "Query Processing",
  q: "What is a query hint and when is it used?",
  a: "A query hint is a directive embedded in the SQL query that instructs the optimizer to use a specific execution strategy (a particular index, join method, or parallelism setting), overriding the optimizer's automatic choice.",
  exp: "Syntax varies: MySQL: SELECT /*+ INDEX(emp idx_dept) */ ...; Oracle: SELECT /*+ USE_HASH(e d) */ ...; SQL Server: SELECT * FROM emp WITH (INDEX=idx_dept). Use hints when: the optimizer consistently chooses a bad plan due to stale statistics or specific data distributions. Risk: as data changes, hard-coded hints may become suboptimal. Prefer fixing statistics or schema issues over hints."
},

// ============================================================
// SECTION 10: DATABASE SECURITY (Q181–Q215)
// ============================================================
{
  id: 181, section: "Database Security",
  q: "What is SQL injection and how is it prevented?",
  a: "SQL injection is a security attack where malicious SQL code is inserted into an input field, which the application then executes as part of a SQL query, potentially allowing unauthorized data access, modification, or deletion.",
  exp: "Example: Input: ' OR '1'='1 causes 'WHERE username='' OR '1'='1'' which is always true. Prevention: (1) Parameterized queries/prepared statements (most effective). (2) Stored procedures. (3) Input validation. (4) Least-privilege DB accounts. (5) Web application firewalls. Never concatenate user input into SQL strings. Parameterized queries separate code from data, making injection impossible."
},
{
  id: 182, section: "Database Security",
  q: "What is GRANT and REVOKE in SQL?",
  a: "GRANT gives a database user permission to perform specific operations on database objects. REVOKE removes previously granted permissions. Together they implement discretionary access control (DAC).",
  exp: "GRANT SELECT, INSERT ON employees TO hr_user; — allows hr_user to select and insert into employees table. GRANT ALL PRIVILEGES ON database.* TO admin; — full access. WITH GRANT OPTION allows the recipient to grant the privilege to others. REVOKE SELECT ON employees FROM hr_user; removes the permission. REVOKE CASCADE removes dependent grants."
},
{
  id: 183, section: "Database Security",
  q: "What is role-based access control (RBAC) in databases?",
  a: "RBAC assigns permissions to roles (named groups of privileges) rather than individual users. Users are then assigned to roles. This simplifies permission management — changing a role's privileges affects all users in that role.",
  exp: "Example: CREATE ROLE analyst; GRANT SELECT ON sales_data TO analyst; GRANT analyst TO user_alice, user_bob. Instead of managing individual user permissions, you manage roles. Roles can be nested (a role can have another role). Most enterprise DBMS (Oracle, PostgreSQL, SQL Server) support RBAC. Reduces administrative complexity in large organizations."
},
{
  id: 184, section: "Database Security",
  q: "What is encryption in the context of database security?",
  a: "Database encryption protects data from unauthorized access by converting it into an unreadable format. Types include: Transparent Data Encryption (TDE) for data at rest, column-level encryption for sensitive fields, and SSL/TLS for data in transit.",
  exp: "TDE encrypts entire database files at the storage level — transparent to applications but protects stolen disk. Column-level: encrypts specific sensitive columns (SSN, credit card) using application-level or database-level functions — even DBAs can't see plaintext. Data in transit encryption: connections use SSL/TLS to prevent network sniffing. Key management is critical — encrypted data is only as secure as the encryption keys."
},
{
  id: 185, section: "Database Security",
  q: "What is database auditing?",
  a: "Database auditing is the process of monitoring and recording database activity — who accessed data, what queries were run, what changes were made, and when. It is used for security analysis, compliance, and forensic investigation.",
  exp: "Audit logs record: user login/logout, SELECT/INSERT/UPDATE/DELETE operations, schema changes, failed login attempts. Used for: detecting unauthorized access, compliance (PCI-DSS, HIPAA, GDPR requirements), forensic analysis after incidents. Oracle Audit Vault, SQL Server Audit, PostgreSQL pgaudit extension provide comprehensive auditing. Audit logs must be stored securely and tamper-proof."
},

// ============================================================
// SECTION 11: DISTRIBUTED DATABASES (Q186–Q220)
// ============================================================
{
  id: 186, section: "Distributed Databases",
  q: "What is a distributed database system?",
  a: "A distributed database is a collection of logically interrelated data stored physically at multiple sites connected by a network. It appears as a single logical database to users but is distributed across multiple nodes.",
  exp: "Goals: local autonomy (sites manage their own data), no central site reliance (no single point of failure), continuous operation (failures at one site don't shut down the whole system), location transparency (users don't need to know where data is), fragmentation transparency, replication transparency. Examples: CockroachDB, Apache Cassandra, Google Spanner."
},
{
  id: 187, section: "Distributed Databases",
  q: "What is the CAP theorem?",
  a: "The CAP theorem states that a distributed system can guarantee at most two of three properties simultaneously: Consistency (all nodes see the same data), Availability (every request receives a response), and Partition Tolerance (system continues operating despite network partitions).",
  exp: "Since network partitions are inevitable in distributed systems, the real choice is CP vs. AP. CP (Consistent + Partition Tolerant): returns an error or waits during a partition (e.g., HBase, ZooKeeper). AP (Available + Partition Tolerant): returns possibly stale data during a partition (e.g., Cassandra, CouchDB). In practice, systems tune the C-A trade-off using consistency levels."
},
{
  id: 188, section: "Distributed Databases",
  q: "What is data fragmentation in distributed databases?",
  a: "Data fragmentation is dividing a relation into smaller pieces (fragments) that are stored at different sites. Types: Horizontal fragmentation (divides by rows/tuples), Vertical fragmentation (divides by columns/attributes), Mixed/Hybrid fragmentation (combination of both).",
  exp: "Horizontal fragmentation example: Employee table split — Site 1 stores employees from Mumbai, Site 2 from Delhi (WHERE city='Mumbai' vs WHERE city='Delhi'). Vertical fragmentation: Site 1 stores personal data (Name, Address), Site 2 stores financial data (Salary, Benefits) — primary key kept in both for reconstruction. Fragmentation improves locality (data near users who use it) and parallelism."
},
{
  id: 189, section: "Distributed Databases",
  q: "What is data replication in distributed databases?",
  a: "Data replication is storing copies of data at multiple sites to improve availability, fault tolerance, and read performance. If one site fails, another copy is available. Reads can be served locally, reducing latency.",
  exp: "Full replication: entire database at every site — maximum availability, highest update cost (must update all copies). Partial replication: some fragments replicated, others not. No replication: each fragment at only one site. Trade-off: replication improves read availability and reduces latency, but updates must propagate to all copies (synchronous → consistent but slow; asynchronous → fast but eventually consistent)."
},
{
  id: 190, section: "Distributed Databases",
  q: "What is the two-phase commit (2PC) protocol?",
  a: "Two-phase commit is a distributed transaction protocol that ensures all-or-nothing atomicity across multiple database nodes. Phase 1 (Prepare): coordinator asks all participants if they can commit. Phase 2 (Commit/Abort): if all say yes, coordinator sends commit; if any says no, coordinator sends abort.",
  exp: "Phase 1: Coordinator sends PREPARE. Each participant logs 'ready', flushes to disk, responds YES/NO. Phase 2: If all YES → Coordinator logs COMMIT, sends COMMIT to all → participants commit and respond ACK. If any NO → Coordinator logs ABORT, sends ABORT. Problem: blocking — if coordinator fails after prepare but before commit, participants are blocked (holding locks) until coordinator recovers. 3PC addresses this."
},
{
  id: 191, section: "Distributed Databases",
  q: "What is the difference between 2PC and 3PC?",
  a: "Two-phase commit (2PC) can block if the coordinator fails during the commit decision. Three-phase commit (3PC) adds a pre-commit phase, allowing participants to determine the outcome even if the coordinator fails, making it non-blocking.",
  exp: "3PC phases: (1) CanCommit — like 2PC prepare. (2) PreCommit — coordinator informs participants of the decision before final commit, allowing them to infer outcome if coordinator fails. (3) DoCommit — final commit. 3PC prevents blocking but adds an extra round trip and doesn't handle network partitions well. In practice, 2PC with coordinator recovery (from log) is more common than 3PC."
},
{
  id: 192, section: "Distributed Databases",
  q: "What is BASE in distributed systems?",
  a: "BASE stands for: Basically Available (system remains available despite partial failures), Soft state (data may not be consistent at all times), Eventually Consistent (system will become consistent after some time with no new updates). BASE is the opposite of ACID.",
  exp: "Many NoSQL/distributed systems (Cassandra, DynamoDB, Riak) are BASE systems, trading strong consistency for availability and performance. 'Eventually consistent' means after all updates have propagated and no new updates are made, all nodes will converge to the same value. BASE is suitable for social media feeds, product catalogs, and other use cases tolerant of temporary inconsistency."
},
{
  id: 193, section: "Distributed Databases",
  q: "What is sharding in databases?",
  a: "Sharding (horizontal partitioning) is a database scaling technique where data is split across multiple database instances (shards), each storing a subset of the total data. Each shard is an independent database, and together they form a single logical database.",
  exp: "Sharding key (shard key) determines which shard stores each row. Range sharding (customers A-M on shard1, N-Z on shard2), Hash sharding (hash(key) % num_shards), Directory sharding (lookup table maps keys to shards). Advantages: horizontal scalability, geographic distribution. Challenges: cross-shard queries (expensive joins), rebalancing shards, shard key selection is critical to avoid hot spots."
},
{
  id: 194, section: "Distributed Databases",
  q: "What is eventual consistency?",
  a: "Eventual consistency is a consistency model that guarantees that if no new updates are made to a data item, eventually all replicas of that item will converge to the same value. There may be temporary inconsistencies.",
  exp: "Example: Social media 'likes' counter — briefly showing different counts on different servers but eventually converging. Strong consistency (linearizability): all reads see the latest write. Eventual consistency trades this for better availability and performance. Implemented via anti-entropy mechanisms (gossip protocol, Merkle trees for comparing replicas). Suitable for high-availability, low-latency systems where brief inconsistency is tolerable."
},
{
  id: 195, section: "Distributed Databases",
  q: "What is a consensus algorithm in distributed databases?",
  a: "A consensus algorithm ensures that distributed nodes agree on a single value or decision despite node failures and network partitions. It is the foundation of distributed transactions and replicated state machines.",
  exp: "Paxos: classic consensus algorithm — phases: Prepare, Promise, Propose, Accept, Learn. Complex to implement correctly. Raft: designed for understandability — leader election, log replication, safety. Used by etcd, CockroachDB, TiDB. Zab: used by ZooKeeper. Consensus algorithms ensure all nodes eventually agree on the same log of operations, enabling consistent distributed databases despite failures."
},

// ============================================================
// SECTION 12: STORAGE AND FILE ORGANIZATION (Q196–Q230)
// ============================================================
{
  id: 196, section: "Storage and File Organization",
  q: "What is heap file organization?",
  a: "A heap file (unordered file) stores records in no particular order. New records are inserted at the end of the file (or in any available free space). There is no ordering based on any field's value.",
  exp: "Advantages: Fast insertions (append to end), simple structure. Disadvantages: Slow searches (must scan all records), slow deletes (must scan to find record), and no support for ordered access. Suitable as the underlying storage when indexes handle search, or for small tables. The 'heap' in most RDBMS means the main table storage before any clustered index organization."
},
{
  id: 197, section: "Storage and File Organization",
  q: "What is sequential (sorted) file organization?",
  a: "A sequential file organizes records in sorted order based on a 'ordering field' (typically the primary key). This allows efficient sorted access and binary search, but insertions and deletions require maintenance of order.",
  exp: "Benefits: fast range queries and sorted output (no sort needed). Drawbacks: expensive insertions (must maintain order), requiring overflow blocks or periodic file reorganization. Typically used for static or rarely-changing data. B+ tree indexes effectively provide sorted access without maintaining the physical file in order, making pure sequential files less common."
},
{
  id: 198, section: "Storage and File Organization",
  q: "What is a buffer pool in DBMS?",
  a: "A buffer pool is a region of main memory (RAM) managed by the DBMS to cache disk pages. It reduces disk I/O by keeping frequently accessed pages in memory, as memory access is orders of magnitude faster than disk access.",
  exp: "The buffer pool is divided into frames (page-sized slots). When a page is needed: if in buffer (hit), use it; if not (miss), load from disk into a free frame, evicting another page if necessary. Replacement policies: LRU (Least Recently Used), Clock (approximation of LRU), MRU (for sequential scans). Buffer pool size significantly impacts DBMS performance."
},
{
  id: 199, section: "Storage and File Organization",
  q: "What is the LRU page replacement policy?",
  a: "LRU (Least Recently Used) evicts the page that has not been accessed for the longest time when a new page must be loaded into a full buffer pool. It operates on the principle that recently used pages are likely to be used again soon.",
  exp: "LRU performs well for most workloads (temporal locality). Weakness: sequential scans (every page used once) pollute the buffer with pages that won't be used again — better to use MRU (Most Recently Used) for sequential scans. Implementation: maintain a doubly-linked list in access order. Costly for large buffer pools — approximations like Clock algorithm are used in practice."
},
{
  id: 200, section: "Storage and File Organization",
  q: "What is a page (block) in DBMS storage?",
  a: "A page (or block) is the unit of data transfer between disk and memory. The DBMS reads and writes data in page-sized chunks (typically 4KB, 8KB, or 16KB). All I/O is done in whole pages, even if only one record is needed.",
  exp: "Page size affects performance: larger pages reduce I/O count but waste memory when only a portion is needed. A page contains: page header (page ID, LSN, free space), records, and a slot array (offsets to records). Slotted page design allows variable-length records. The buffer pool, B-tree nodes, and index entries are all measured in pages."
},
{
  id: 201, section: "Storage and File Organization",
  q: "What is a RAID and why is it used in databases?",
  a: "RAID (Redundant Array of Independent Disks) combines multiple physical disk drives into a logical unit to provide fault tolerance, improved performance, or both. Commonly used levels in databases: RAID 1 (mirroring), RAID 5 (striping with parity), RAID 10 (striping + mirroring).",
  exp: "RAID 1: mirrors data on two disks — full redundancy, 2x read throughput, 1x write, 50% storage efficiency. RAID 5: data striped with distributed parity across 3+ disks — good read performance, write penalty (parity calculation), tolerates 1 disk failure. RAID 10: combines RAID 1+0 — excellent performance and fault tolerance, 50% storage. High-performance databases typically use RAID 10 for transaction logs and RAID 5 for data."
},
{
  id: 202, section: "Storage and File Organization",
  q: "What is record organization within a page?",
  a: "Within a page, records can be organized as: fixed-length records (simpler, wastes space for variable data) or variable-length records (stored with length fields or null bitmaps, requires slot directory).",
  exp: "Fixed-length: each record occupies a fixed number of bytes, simple offset calculation. Variable-length: uses a slot array at the beginning of the page — each slot stores (offset, length) pointing to the actual record at the end of the page (growing toward each other). Deleted records leave 'holes'; compaction reorganizes periodically. TOAST (PostgreSQL) handles oversized records by storing them separately."
},

// ============================================================
// SECTION 13: ADVANCED SQL (Q203–Q250)
// ============================================================
{
  id: 203, section: "Advanced SQL",
  q: "What is a recursive SQL query?",
  a: "A recursive SQL query uses a recursive Common Table Expression (WITH RECURSIVE) to repeatedly join a query to its own result until a termination condition is met. It is used for hierarchical and graph data.",
  exp: "Structure: WITH RECURSIVE cte AS (base_case UNION ALL recursive_case). Example: finding all subordinates of a manager. Base: SELECT id, name FROM emp WHERE manager_id IS NULL. Recursive: SELECT e.id, e.name FROM emp e JOIN cte ON e.manager_id = cte.id. Must include a termination condition (finite hierarchy) to prevent infinite loops. Supported in PostgreSQL, MySQL 8+, SQL Server, Oracle."
},
{
  id: 204, section: "Advanced SQL",
  q: "What is PIVOT in SQL?",
  a: "PIVOT transforms row data into column data, rotating distinct values of a column into multiple columns with aggregate values. It is used to create cross-tabulation (cross-tab) reports.",
  exp: "Example: Transform monthly sales (month, sales) into columns (Jan_Sales, Feb_Sales, ...). SQL Server: SELECT * FROM sales PIVOT (SUM(amount) FOR month IN ([Jan],[Feb],[Mar])) AS pvt. MySQL lacks native PIVOT; use conditional aggregation: SUM(CASE WHEN month='Jan' THEN amount END) AS Jan_Sales. UNPIVOT is the reverse — columns back to rows."
},
{
  id: 205, section: "Advanced SQL",
  q: "What are lateral joins in SQL?",
  a: "A LATERAL join allows a subquery in the FROM clause to reference columns from preceding tables in the same FROM clause (like a correlated subquery but in the FROM position). It enables per-row computation that returns multiple rows.",
  exp: "Without LATERAL: derived tables in FROM cannot reference preceding tables. With LATERAL: SELECT c.name, o.order_date FROM customers c, LATERAL (SELECT * FROM orders WHERE customer_id = c.id ORDER BY order_date DESC LIMIT 3) o. This gets the top 3 orders per customer. Supported in PostgreSQL (LATERAL), MySQL 8.0.14+ (implicitly for CROSS JOIN), SQL Server (APPLY)."
},
{
  id: 206, section: "Advanced SQL",
  q: "What is CROSS APPLY and OUTER APPLY in SQL Server?",
  a: "CROSS APPLY returns rows from the outer table only if the table-valued function or subquery returns rows for that row (like INNER JOIN). OUTER APPLY returns all outer rows, with NULLs when the function returns no rows (like LEFT JOIN).",
  exp: "CROSS/OUTER APPLY is SQL Server's equivalent to PostgreSQL's LATERAL join. Use case: calling a table-valued function for each row in a table. Example: SELECT e.Name, d.TopProject FROM Employees e CROSS APPLY GetTopProjects(e.EmployeeID, 1) d — calls GetTopProjects function for each employee. OUTER APPLY includes employees with no projects (NULLs for project data)."
},
{
  id: 207, section: "Advanced SQL",
  q: "What is the MERGE statement in SQL?",
  a: "The MERGE statement (also called UPSERT in some databases) combines INSERT, UPDATE, and DELETE operations into one statement. It synchronizes a target table with a source based on a matching condition.",
  exp: "Syntax: MERGE INTO target USING source ON (condition) WHEN MATCHED THEN UPDATE SET ... WHEN NOT MATCHED BY TARGET THEN INSERT ... WHEN NOT MATCHED BY SOURCE THEN DELETE. Example: synchronizing a staging table with the production table. Atomic operation — useful for ETL processes. MySQL uses INSERT ... ON DUPLICATE KEY UPDATE; PostgreSQL uses INSERT ... ON CONFLICT DO UPDATE."
},
{
  id: 208, section: "Advanced SQL",
  q: "What is a cursor in SQL?",
  a: "A cursor is a database object that allows iterating over a result set row by row, enabling procedural processing of query results within stored procedures or scripts.",
  exp: "Usage: DECLARE cursor_name CURSOR FOR SELECT ...; OPEN cursor_name; FETCH NEXT FROM cursor_name INTO @variable; (loop); CLOSE cursor_name; DEALLOCATE cursor_name. Cursors are often slower than set-based operations because they process row by row (RBAR — Row By Agonizing Row). Use set-based SQL whenever possible; cursors as last resort for row-by-row processing."
},
{
  id: 209, section: "Advanced SQL",
  q: "What is dynamic SQL?",
  a: "Dynamic SQL is SQL that is constructed and executed at runtime, rather than being fixed at compile time. It allows queries to be built programmatically with variable table names, column names, or conditions.",
  exp: "In SQL Server: EXECUTE sp_executesql @sql_string, @params, @param_values. In Oracle: EXECUTE IMMEDIATE sql_string. Use cases: generating different queries based on user input, operating on different tables based on parameters. Security concern: dynamic SQL with unchecked user input is vulnerable to SQL injection. Parameterized dynamic SQL (sp_executesql) prevents injection."
},
{
  id: 210, section: "Advanced SQL",
  q: "What is partitioning in SQL databases?",
  a: "Table partitioning divides a large table into smaller, more manageable pieces (partitions) while maintaining a single logical table. Queries can target only relevant partitions (partition pruning), dramatically improving performance.",
  exp: "Types: Range partitioning (by date range, e.g., monthly), List partitioning (by specific values, e.g., by country), Hash partitioning (hash of a key value for even distribution), Composite (combination). Example: an orders table partitioned by year — queries for 2024 only scan the 2024 partition. Benefits: faster queries via pruning, easier archiving (drop old partitions), maintenance on partitions independently."
},
{
  id: 211, section: "Advanced SQL",
  q: "What is the difference between EXISTS and IN in SQL?",
  a: "IN checks if a value matches any value in a list or subquery result set. EXISTS checks if a subquery returns at least one row, immediately short-circuiting on the first match. EXISTS is often more efficient for correlated subqueries.",
  exp: "IN: SELECT * FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE city='Mumbai'). EXISTS: SELECT * FROM orders o WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id=o.customer_id AND c.city='Mumbai'). EXISTS stops scanning when first match is found. IN with a large subquery materializes the entire subquery. For large datasets, EXISTS is usually faster; for small subqueries, IN is fine."
},
{
  id: 212, section: "Advanced SQL",
  q: "What are the different types of subqueries?",
  a: "Types: (1) Scalar — returns single value (can be used anywhere an expression is expected). (2) Column — returns a single column of values (used with IN, NOT IN). (3) Row — returns a single row (used with row constructors). (4) Table — returns a table (used in FROM as derived table). (5) Correlated — references outer query columns (re-executes per outer row).",
  exp: "Scalar example: SELECT name, (SELECT MAX(salary) FROM emp) AS max_sal FROM emp. Derived table: SELECT * FROM (SELECT dept, AVG(sal) avg_sal FROM emp GROUP BY dept) t WHERE avg_sal > 50000. Correlated: SELECT * FROM emp e WHERE salary > (SELECT AVG(salary) FROM emp WHERE dept = e.dept). Correlated subqueries execute once per outer row — may be slow without proper indexes."
},
{
  id: 213, section: "Advanced SQL",
  q: "What is the ROWNUM/ROW_NUMBER function used for?",
  a: "ROW_NUMBER() is a window function that assigns a unique sequential number to each row in a result set based on the specified ORDER BY. It is commonly used for pagination, ranking, and de-duplication.",
  exp: "Example: SELECT *, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn FROM employees. For pagination: WHERE rn BETWEEN 11 AND 20 (rows 11-20). De-duplication: ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn, then keep rn=1 (first occurrence per email). Oracle also has ROWNUM (different — assigned before ORDER BY in old versions)."
},
{
  id: 214, section: "Advanced SQL",
  q: "What is a table-valued function in SQL?",
  a: "A table-valued function (TVF) is a user-defined function that returns a result set (table) rather than a scalar value. It can be used in the FROM clause of a query like a regular table.",
  exp: "Types: Inline TVF (single SELECT statement, more efficient, can be optimized inline) and Multi-statement TVF (multiple statements, builds result in a table variable — less efficient). Example: CREATE FUNCTION GetOrdersByCustomer(@custID INT) RETURNS TABLE AS RETURN SELECT * FROM orders WHERE customer_id = @custID. Usage: SELECT * FROM GetOrdersByCustomer(101). TVFs parameterize table logic."
},
{
  id: 215, section: "Advanced SQL",
  q: "What is the difference between CHAR and VARCHAR data types?",
  a: "CHAR(n) stores fixed-length strings, always using exactly n bytes/characters (padded with spaces if shorter). VARCHAR(n) stores variable-length strings, using only as much space as needed (plus length overhead), up to n characters.",
  exp: "CHAR(10): 'Hi' is stored as 'Hi        ' (8 trailing spaces). VARCHAR(10): 'Hi' stored as 'Hi' (2 bytes + length info). CHAR: slightly faster for fixed-length fields (no length overhead), predictable storage. VARCHAR: efficient for variable-length data, avoids wasted space. Use CHAR for fixed-length codes (state abbreviations, phone formats); VARCHAR for names, descriptions, etc."
},
{
  id: 216, section: "Advanced SQL",
  q: "What is the JSON data type in modern SQL databases?",
  a: "Modern RDBMS (PostgreSQL, MySQL 5.7+, SQL Server 2016+) support storing and querying JSON documents natively. JSON columns can hold structured/semi-structured data, and the DBMS provides functions to extract, manipulate, and index JSON fields.",
  exp: "PostgreSQL JSON functions: json_extract_path(), jsonb_set(), ->> operator for field access. MySQL: JSON_EXTRACT(), JSON_SET(), -> operator. Use cases: flexible schemas (when structure varies per row), API responses, user preferences. JSONB (binary JSON in PostgreSQL): more efficient storage and indexing. Indexed JSON enables fast queries on specific JSON paths without relational denormalization."
},
{
  id: 217, section: "Advanced SQL",
  q: "What is a temporal table?",
  a: "A temporal table automatically tracks the history of row changes over time, maintaining both the current state and historical states with valid-time and transaction-time periods. It enables time-travel queries.",
  exp: "SQL:2011 standard: System-time temporal tables (database tracks transaction time automatically), Application-time period tables (user-managed valid time). Example: Employee salary history — instead of overwriting, the old row is moved to history with an end date. Query: SELECT * FROM employee FOR SYSTEM_TIME AS OF '2023-01-01' to see January 2023 data. Supported in SQL Server (System-Versioned Temporal Tables), Oracle, PostgreSQL (with extensions)."
},
{
  id: 218, section: "Advanced SQL",
  q: "What is GROUPING SETS in SQL?",
  a: "GROUPING SETS is an extension of GROUP BY that allows computing multiple groupings in a single query. It is equivalent to performing multiple GROUP BY queries and combining with UNION ALL, but more efficient.",
  exp: "Example: GROUP BY GROUPING SETS ((dept, year), (dept), (year), ()) computes subtotals by (dept+year), by dept, by year, and a grand total in one pass. ROLLUP: hierarchical grouping (A,B,C), (A,B), (A), () — generates subtotals at each level. CUBE: all possible combinations — useful for multidimensional analysis. Used in data warehousing and reporting queries."
},
{
  id: 219, section: "Advanced SQL",
  q: "What are aggregate functions with FILTER in SQL?",
  a: "The FILTER clause (SQL:2003 standard) adds a WHERE-like condition to an aggregate function, computing the aggregate only over rows matching the filter, without requiring CASE expressions inside the aggregate.",
  exp: "Example: SELECT COUNT(*) FILTER (WHERE status='active') AS active_count, SUM(amount) FILTER (WHERE year=2024) AS sales_2024 FROM orders. Without FILTER: COUNT(CASE WHEN status='active' THEN 1 END). FILTER is cleaner and potentially more efficient since the optimizer can recognize distinct filters for separate aggregates. Supported in PostgreSQL, modern SQLite; not yet in MySQL."
},
{
  id: 220, section: "Advanced SQL",
  q: "What is NTILE() window function?",
  a: "NTILE(n) divides the result set into n approximately equal groups (tiles/buckets) and assigns each row a group number from 1 to n. It is used for quartile, decile, or percentile analysis.",
  exp: "Example: NTILE(4) OVER (ORDER BY salary) divides employees into 4 salary quartiles. Bottom 25% get group 1; top 25% get group 4. NTILE(100) creates percentiles. If rows don't divide evenly, earlier groups get one extra row. Use cases: identifying top 10% performers, grouping customers into spending tiers, creating class intervals for analysis."
},

// ============================================================
// SECTION 14: DATABASE DESIGN (Q221–Q260)
// ============================================================
{
  id: 221, section: "Database Design",
  q: "What are the phases of database design?",
  a: "Database design phases: (1) Requirements analysis — gather user needs. (2) Conceptual design — create ER/EER diagrams. (3) Logical design — convert to relational schema, normalize. (4) Physical design — choose storage structures, indexes, partitioning. (5) Implementation — create schema in DBMS. (6) Tuning — monitor and optimize.",
  exp: "Conceptual design is DBMS-independent (ER diagrams). Logical design is data-model-specific (relational tables) but DBMS-independent. Physical design is DBMS-specific (specific index types, storage parameters). The separation allows changing physical implementation without affecting applications using the logical schema — the principle of data independence."
},
{
  id: 222, section: "Database Design",
  q: "What is the difference between a natural key and a surrogate key?",
  a: "A natural key is a key derived from real-world meaningful data (SSN, email, product code). A surrogate key is an artificially generated, system-assigned identifier with no business meaning (auto-increment integer, UUID).",
  exp: "Natural keys: meaningful, no extra column needed, but may change (email changes), may be long (bad for joins), may be sensitive (SSN). Surrogate keys: stable (never changes), compact (integer joins), meaningless to users, requires extra column. Modern practice: use surrogate keys (INT IDENTITY or UUID) as primary keys for stability and join efficiency; add UNIQUE constraints on natural keys."
},
{
  id: 223, section: "Database Design",
  q: "What is the difference between a lookup table and a foreign key constraint?",
  a: "A lookup table (reference/code table) stores valid values for a column (e.g., status codes, country codes). A foreign key constraint enforces that a column's values must exist in the referenced table, which can be the lookup table.",
  exp: "Example: OrderStatus table (StatusCode, StatusName) and Orders.status FK referencing OrderStatus.StatusCode. The lookup table provides valid values; the FK enforces referential integrity. Benefits: centralized management of valid values, easy addition of new statuses, join to get descriptive names. Alternative: CHECK constraints for small, stable value sets (no extra table needed)."
},
{
  id: 224, section: "Database Design",
  q: "What is the star schema in data warehousing?",
  a: "A star schema is a denormalized data warehouse design with a central fact table surrounded by multiple dimension tables. The fact table contains numeric measures; dimension tables contain descriptive attributes.",
  exp: "Example: Sales fact table (date_key, product_key, store_key, quantity, revenue) with dimensions: Date (date_key, month, quarter, year), Product (product_key, name, category), Store (store_key, city, region). Simple to understand, efficient for OLAP queries (few joins), works well with BI tools. Denormalization (in dimension tables) trades redundancy for query performance."
},
{
  id: 225, section: "Database Design",
  q: "What is a snowflake schema?",
  a: "A snowflake schema is a variation of the star schema where dimension tables are normalized (broken into sub-dimensions). It reduces redundancy in dimensions but requires more joins to query, making it slightly more complex than a star schema.",
  exp: "Example: In a star schema, Product dimension includes category and sub-category. In snowflake: Product table links to Category table which links to SubCategory table. Advantages: reduced storage for large dimensions with redundant data. Disadvantages: more joins needed, harder to understand, slightly slower queries. Many BI tools handle snowflakes well; practical choice depends on dimension size and redundancy."
},
{
  id: 226, section: "Database Design",
  q: "What is a fact table in data warehousing?",
  a: "A fact table is the central table in a star/snowflake schema that stores quantitative, measurable data (facts/metrics) about business events. Each row represents a specific business event and contains foreign keys to dimension tables plus measure columns.",
  exp: "Types: Transaction fact table (one row per transaction — highest grain), Periodic snapshot (regular interval summary, e.g., monthly balance), Accumulating snapshot (lifecycle of a process, e.g., order fulfillment stages). Measures: additive (SUM across all dimensions, e.g., revenue), semi-additive (SUM across some dimensions, e.g., balance — can sum across stores but not time), non-additive (e.g., ratios, percentages)."
},
{
  id: 227, section: "Database Design",
  q: "What is grain in a data warehouse?",
  a: "Grain (granularity) in a data warehouse defines the level of detail represented by a single row in a fact table. Declaring the grain is a critical first step in dimensional modeling — it determines what each fact table row represents.",
  exp: "Fine grain: one row per individual transaction (highest detail, largest table). Coarse grain: one row per day per store (aggregated, fewer rows). Example: 'Each row represents one line item on one sales transaction at one store on one day.' Choosing the finest meaningful grain is generally recommended (you can always aggregate up but can't disaggregate). Grain also determines which dimensions make sense for the fact table."
},
{
  id: 228, section: "Database Design",
  q: "What is a slowly changing dimension (SCD)?",
  a: "A Slowly Changing Dimension (SCD) is a dimension table attribute that changes infrequently (e.g., customer address, employee department). Different SCD types handle these changes differently.",
  exp: "SCD Type 1: Overwrite — no history, simple. SCD Type 2: Add new row with new values and date range — full history, most common. SCD Type 3: Add new column for old value — limited history (only previous value). SCD Type 4: Separate history table. SCD Type 6: Hybrid of 1, 2, 3. SCD Type 2 is the most powerful, allowing 'what was the customer's address when this order was placed?' questions."
},
{
  id: 229, section: "Database Design",
  q: "What is OLAP (Online Analytical Processing)?",
  a: "OLAP is a category of software that enables fast, multidimensional analysis of large volumes of data from multiple perspectives. It supports complex queries, aggregations, and the ability to 'drill down', 'roll up', and 'slice and dice' data.",
  exp: "OLAP operations: Roll-up (summarize — city → state → country), Drill-down (detail — year → quarter → month), Slice (one dimension's fixed value), Dice (subcube from multiple dimension constraints), Pivot (rotate dimensions). OLAP types: MOLAP (Multidimensional — pre-computed cubes), ROLAP (Relational — queries against relational DW), HOLAP (Hybrid). Used in BI tools, financial reporting, trend analysis."
},
{
  id: 230, section: "Database Design",
  q: "What is the purpose of a data dictionary in database design?",
  a: "A data dictionary documents the metadata of a database: tables, columns, data types, constraints, relationships, default values, and business definitions of each element. It serves as both system catalog and business glossary.",
  exp: "The DBMS system catalog stores technical metadata automatically. A business data dictionary adds semantic descriptions: what does 'CustomerID' mean?, what are valid values for 'Status'?, who is the data owner?. Essential for large organizations: enables consistency across applications, onboarding new developers, impact analysis (what queries use this column), and data governance/compliance."
},

// ============================================================
// SECTION 15: NoSQL AND MODERN DATABASES (Q231–Q270)
// ============================================================
{
  id: 231, section: "NoSQL Databases",
  q: "What are the main types of NoSQL databases?",
  a: "Four main types: (1) Document stores — store semi-structured documents (MongoDB, CouchDB). (2) Key-Value stores — simple key-value pairs (Redis, DynamoDB). (3) Column-family stores — groups of related columns (Cassandra, HBase). (4) Graph databases — nodes and edges for relationship data (Neo4j, ArangoDB).",
  exp: "Document: flexible schema, JSON/BSON documents, good for catalogs, user profiles. Key-Value: fastest lookup by key, good for sessions, caches, leaderboards. Column-family: efficient for analytical queries on large datasets, time-series data. Graph: optimized for relationship traversal, social networks, fraud detection, recommendation engines. Each type is optimized for specific data models and access patterns."
},
{
  id: 232, section: "NoSQL Databases",
  q: "What is MongoDB and what is it used for?",
  a: "MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents (BSON). Collections (like tables) contain documents that can have different structures. It scales horizontally and is ideal for hierarchical, polymorphic data.",
  exp: "Features: flexible schema (schema-less), nested documents and arrays (no joins needed for related data), aggregation pipeline, horizontal scaling via sharding, replica sets for HA. Use cases: content management, user profiles, product catalogs, IoT data, real-time analytics. MongoDB 4.0+ added multi-document ACID transactions. Not ideal for: highly relational data requiring complex joins, strong consistency requirements."
},
{
  id: 233, section: "NoSQL Databases",
  q: "What is Redis and what are its common use cases?",
  a: "Redis is an in-memory data structure store supporting strings, hashes, lists, sets, sorted sets, bitmaps, and streams. It is used primarily as a cache, session store, message broker, and real-time leaderboard.",
  exp: "Key features: sub-millisecond latency (in-memory), data structures (not just key-value), persistence options (RDB snapshots, AOF logging), pub/sub messaging, Lua scripting, clustering. Use cases: session caching, page/object caching, leaderboards (sorted sets), rate limiting, pub/sub messaging, job queues (lists), real-time analytics. Redis is often used alongside a primary RDBMS as a caching layer."
},
{
  id: 234, section: "NoSQL Databases",
  q: "What is Apache Cassandra and what are its strengths?",
  a: "Cassandra is a distributed, wide-column NoSQL database designed for high availability, massive scalability, and no single point of failure. It uses a peer-to-peer architecture (no master node) with tunable consistency.",
  exp: "Design: distributed ring topology, consistent hashing for data placement, configurable replication factor. Consistency levels: ONE, QUORUM, ALL — trade-off between consistency and availability. Strengths: linear scalability (add nodes = linear performance increase), excellent write performance, multi-datacenter replication. Weaknesses: limited query flexibility (no ad-hoc joins), eventual consistency, data model must be query-driven. Use cases: IoT, time-series, messaging, high-write applications."
},
{
  id: 235, section: "NoSQL Databases",
  q: "What is Neo4j and when should you use a graph database?",
  a: "Neo4j is a native graph database that stores data as nodes (entities), relationships (edges), and properties. It uses the property graph model and the Cypher query language. Graph databases excel at traversing complex, interconnected data.",
  exp: "Graph databases shine when: relationships are numerous and traversal depth is variable (social networks, knowledge graphs), the data forms a natural graph structure, relationship properties matter, and queries involve multi-hop traversals. SQL with recursive CTEs handles graphs but degrades quickly with depth. Use cases: social networks (friend-of-friend), fraud detection (transaction patterns), recommendation engines, network topology."
},
{
  id: 236, section: "NoSQL Databases",
  q: "What is the difference between relational and document databases?",
  a: "Relational databases store normalized data in tables with fixed schemas, enforcing referential integrity via foreign keys and joins. Document databases store self-contained JSON documents with flexible, nested structures — related data is often embedded rather than joined.",
  exp: "Relational: better for: complex queries, strong consistency, ad-hoc reporting, highly relational data with many-to-many relationships. Document: better for: flexible/evolving schemas, hierarchical data (addresses nested in customer), high write throughput, developer productivity (object-document mapping). Common pattern: start with document DB for flexibility, migrate to relational as data model stabilizes and relationships become complex."
},
{
  id: 237, section: "NoSQL Databases",
  q: "What is horizontal scaling vs vertical scaling?",
  a: "Vertical scaling (scale up) increases the capacity of a single machine (more CPU, RAM, faster disk). Horizontal scaling (scale out) adds more machines to distribute the load. NoSQL databases are typically designed for horizontal scaling.",
  exp: "Vertical scaling has limits (maximum hardware capacity) and is expensive. Horizontal scaling theoretically has no limit — add more commodity machines. RDBMS traditionally favor vertical scaling (transactions harder to distribute). NoSQL databases (Cassandra, MongoDB sharding, DynamoDB) are built for horizontal scaling. Cloud databases (Aurora, Spanner) increasingly bring horizontal scalability to SQL workloads."
},
{
  id: 238, section: "NoSQL Databases",
  q: "What is a document in a document-oriented database?",
  a: "A document in a document database is a self-describing, hierarchical data structure (typically JSON or BSON) that can contain nested objects and arrays. Each document can have a different structure, enabling flexible, schema-less storage.",
  exp: "Example MongoDB document: {_id: ObjectId(), name: 'Alice', address: {street: '123 Main St', city: 'Mumbai'}, phones: ['9999','8888'], orders: [{id:1, total:500}]}. Related data is embedded (address, phones) instead of stored in separate tables. This eliminates joins for common access patterns. Documents in the same collection can have different fields — no schema enforcement by default (though validators can be added)."
},
{
  id: 239, section: "NoSQL Databases",
  q: "What is DynamoDB and its key-value model?",
  a: "Amazon DynamoDB is a fully managed, serverless NoSQL database offering single-digit millisecond performance at any scale. It uses a key-value and document model with tables, items (rows), and attributes (columns, flexible per item).",
  exp: "Data model: every item must have a partition key (and optional sort key). The partition key determines the partition where data is stored (hash partitioning). Sort key enables range queries within a partition. Secondary indexes: GSI (Global Secondary Index — any attribute), LSI (Local Secondary Index — same partition key, different sort key). Pricing: capacity units (RCU/WCU) or on-demand. Ideal for high-scale, simple access patterns."
},
{
  id: 240, section: "NoSQL Databases",
  q: "What is the Polyglot Persistence pattern?",
  a: "Polyglot Persistence is an architectural pattern where different types of data in the same application are stored in different types of databases, each chosen for its strengths — using the best database for each data need.",
  exp: "Example: e-commerce application: product catalog → MongoDB (flexible document structure), user sessions → Redis (fast key-value cache), order transactions → PostgreSQL (ACID, relational), product search → Elasticsearch (full-text search), product recommendations → Neo4j (graph traversal). The challenge: operational complexity of managing multiple database systems, cross-database transactions, data consistency across stores."
},

// ============================================================
// SECTION 16: ADVANCED DBMS TOPICS (Q241–Q290)
// ============================================================
{
  id: 241, section: "Advanced Topics",
  q: "What is database federation?",
  a: "Database federation is a virtual integration layer that provides a unified view and query interface over multiple heterogeneous databases (different DBMS types/schemas), making them appear as a single logical database without physically consolidating the data.",
  exp: "A federated query can join data from an Oracle database, a MySQL database, and a MongoDB collection transparently. Tools: Apache Drill, Presto/Trino, IBM InfoSphere Federation Server. Use cases: data integration without ETL, legacy system modernization, merging data from different business units. Challenges: performance (cross-system joins), schema mapping, different SQL dialects, transaction semantics."
},
{
  id: 242, section: "Advanced Topics",
  q: "What is a data lake?",
  a: "A data lake is a centralized repository that stores raw, unprocessed data at scale in its native format (structured, semi-structured, unstructured). Unlike a data warehouse, data is not transformed before storage — 'schema on read' vs 'schema on write'.",
  exp: "Data warehouses: structured, transformed, expensive, optimized for queries. Data lakes: raw files (JSON, CSV, Parquet, images, logs), cheap object storage (AWS S3, Azure ADLS), 'schema on read' (structure applied at query time). Use cases: big data analytics, ML training data, data exploration. Challenges: 'data swamp' (unorganized, ungoverned data becomes unusable). Solutions: Delta Lake, Apache Iceberg add ACID transactions and schema evolution."
},
{
  id: 243, section: "Advanced Topics",
  q: "What is ETL and its role in data warehousing?",
  a: "ETL (Extract, Transform, Load) is the process of extracting data from source systems, transforming it (cleaning, enriching, reformatting, aggregating), and loading it into a data warehouse or data lake for analysis.",
  exp: "Extract: pull from OLTP databases, flat files, APIs, logs. Transform: clean nulls, standardize formats, apply business rules, join sources, compute derived metrics. Load: insert into warehouse tables (full refresh or incremental). ELT (Extract, Load, Transform) — growing alternative that loads raw data first, transforms in the warehouse using SQL — enabled by cloud data warehouses (Snowflake, BigQuery, Redshift) with massive compute power."
},
{
  id: 244, section: "Advanced Topics",
  q: "What is column-oriented storage?",
  a: "Column-oriented (columnar) storage stores each column of a table separately rather than row by row. This is highly efficient for analytical queries that access a few columns from many rows, as only the relevant columns need to be read.",
  exp: "Row storage: reads entire rows (good for OLTP — full row operations). Column storage: reads only requested columns (good for OLAP — aggregate a few columns over millions of rows). Additional benefits: better compression (similar data in a column compresses well), vectorized processing. Examples: Parquet, ORC (file formats), Amazon Redshift, Google BigQuery, ClickHouse (databases). HTAP systems combine both."
},
{
  id: 245, section: "Advanced Topics",
  q: "What is HTAP (Hybrid Transaction/Analytical Processing)?",
  a: "HTAP is a database architecture that supports both OLTP (transactional) and OLAP (analytical) workloads in a single system, eliminating the need for separate databases and ETL pipelines for analytics.",
  exp: "Traditional: separate OLTP (normalized, row-store) and OLAP (denormalized, columnar data warehouse) with ETL. HTAP: one system handles both in near-real-time. Approaches: in-memory databases with row + column stores (SAP HANA), hybrid storage in RDBMS (MySQL with NDB), separate nodes synced in real-time (TiDB: TiKV for OLTP + TiFlash for OLAP). Use cases: real-time analytics, fraud detection, operational dashboards."
},
{
  id: 246, section: "Advanced Topics",
  q: "What are the ACID properties in NewSQL databases?",
  a: "NewSQL databases (CockroachDB, Google Spanner, TiDB) provide ACID transactions while also achieving the horizontal scalability of NoSQL systems, combining the best of traditional RDBMS and NoSQL.",
  exp: "NewSQL uses distributed consensus (Paxos/Raft) for replication and distributed transaction protocols (two-phase commit with Paxos) to ensure ACID across shards. Google Spanner pioneered TrueTime (GPS/atomic clocks) for globally consistent timestamps. CockroachDB uses hybrid logical clocks. NewSQL is ideal for high-scale applications requiring relational model and ACID — financial systems, e-commerce, global applications."
},
{
  id: 247, section: "Advanced Topics",
  q: "What is column-level encryption and when is it used?",
  a: "Column-level encryption encrypts specific sensitive columns (e.g., SSN, credit card numbers, medical records) independently, so even database administrators cannot view plaintext data without the decryption key.",
  exp: "Implementation: application-level (encrypt before insert, decrypt after fetch — DBMS stores only ciphertext), or DBMS-level (transparent, automatic by DBMS). Challenges: cannot index encrypted columns efficiently, range queries on encrypted data are difficult, key management complexity. Use cases: PCI-DSS compliance (cardholder data), HIPAA compliance (PHI), GDPR (personal data protection). Format-preserving encryption (FPE) allows maintaining data format while encrypting."
},
{
  id: 248, section: "Advanced Topics",
  q: "What is database replication and its types?",
  a: "Database replication is the process of copying data from one database server (master/primary) to one or more servers (replicas/secondaries) to ensure data availability, fault tolerance, and read scalability.",
  exp: "Types: Synchronous replication — primary waits for replica confirmation before committing (strong consistency, higher latency). Asynchronous replication — primary commits without waiting (lower latency, potential data loss on primary failure). Semi-synchronous — one replica must confirm. Types by direction: Master-slave (one writer, many readers), Master-master (multiple writers, conflict resolution needed). Use: read replicas for scaling reads, DR site for failover, geographic distribution."
},
{
  id: 249, section: "Advanced Topics",
  q: "What is database connection pooling?",
  a: "Connection pooling maintains a pool of pre-established database connections that can be reused by client applications, avoiding the overhead of creating a new connection for every database request.",
  exp: "Creating a DB connection is expensive: TCP handshake, authentication, session setup — typically 50-100ms. Connection pools reuse existing connections — dramatically reduces latency for frequent short queries. Pool parameters: min connections (always maintained), max connections (upper limit), idle timeout. Tools: PgBouncer (PostgreSQL), ProxySQL (MySQL), HikariCP (Java), c3p0. Prevents connection exhaustion under high load."
},
{
  id: 250, section: "Advanced Topics",
  q: "What is query caching?",
  a: "Query caching stores the result of a query and returns the cached result for identical subsequent queries, bypassing actual query execution. It is most beneficial for identical, frequently-executed read-heavy queries on infrequently-changing data.",
  exp: "MySQL had a built-in query cache (deprecated in 8.0 due to scalability issues — global lock invalidates cache on any table update). Application-level caching (Redis, Memcached) is more flexible — cache specific query results with controlled invalidation logic. Cache invalidation is hard: when to expire cached data? TTL (time-based), event-based (invalidate when table changes), or CacheBuster patterns."
},

// ============================================================
// SECTION 17: PERFORMANCE AND TUNING (Q251–Q290)
// ============================================================
{
  id: 251, section: "Performance and Tuning",
  q: "What is the N+1 query problem?",
  a: "The N+1 problem occurs in ORMs or application code where 1 query fetches N parent records and then N separate queries fetch children for each parent — resulting in N+1 total queries instead of 1 or 2 efficient queries.",
  exp: "Example: Fetch 100 orders → then for each order, separately query order items → 101 queries instead of 1 JOIN query. Solutions: eager loading (JOIN or IN clause to fetch all at once), batch loading (fetch all children in one query by parent IDs), or careful ORM configuration (Hibernate: @Fetch(FetchMode.JOIN), Django: select_related(), SQLAlchemy: joinedload()). N+1 is a major performance bottleneck in data-heavy applications."
},
{
  id: 252, section: "Performance and Tuning",
  q: "What is an execution plan and how do you read it?",
  a: "An execution plan shows the series of physical operations (table scans, index seeks, hash joins, sorts) the query optimizer chose to execute a SQL query, along with estimated and actual costs, row counts, and I/O statistics.",
  exp: "Reading: start from the bottom-right (innermost/leftmost) leaf operations and work toward the output. Key elements: operator type (Seq Scan, Index Scan, Hash Join, Sort), estimated/actual rows, cost, loops. Warning signs: Seq Scan on large tables (missing index?), many sorts (missing ordered indexes?), high estimated vs actual row count difference (stale statistics?). EXPLAIN ANALYZE (PostgreSQL) shows actual runtime statistics."
},
{
  id: 253, section: "Performance and Tuning",
  q: "What causes table scan instead of index scan?",
  a: "Table scans occur instead of index scans when: no suitable index exists, index exists but query returns too many rows (low selectivity), functions or expressions are applied to indexed columns preventing index use, statistics are stale, or the optimizer decides scan is cheaper for small tables.",
  exp: "Common pitfalls: WHERE YEAR(created_at) = 2024 prevents index use on created_at — use WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31' instead. WHERE name LIKE '%Smith' — leading wildcard prevents B-tree index use. WHERE col + 1 = 5 — transform to WHERE col = 4. Implicit type conversion: WHERE string_col = 123 may disable index. Always check EXPLAIN to verify index usage."
},
{
  id: 254, section: "Performance and Tuning",
  q: "What is index fragmentation and how does it affect performance?",
  a: "Index fragmentation occurs when the logical order of pages in an index differs from the physical order on disk (external fragmentation), or when pages have unused space due to deletes and updates (internal fragmentation). Both degrade query performance.",
  exp: "Causes: random INSERTs cause page splits (both internal and external fragmentation). High fragmentation → more I/O (non-sequential reads) → slower range scans. Detection: SQL Server: sys.dm_db_index_physical_stats; PostgreSQL: pgstattuple. Remediation: REORGANIZE index (online, defragments pages in place, for <30% fragmentation) or REBUILD index (offline by default, recreates entirely, for >30% fragmentation). Regular maintenance jobs typically handle this."
},
{
  id: 255, section: "Performance and Tuning",
  q: "What is a covering index and how does it improve performance?",
  a: "A covering index includes all columns referenced by a query (in SELECT and WHERE), allowing the query engine to satisfy the query entirely from the index without accessing the base table rows.",
  exp: "Performance gain: eliminates 'key lookup' operations (accessing the clustered index/heap for non-indexed columns). Example: query SELECT name, salary FROM emp WHERE dept='IT'. Index on (dept) requires a key lookup to fetch name and salary. Index on (dept, name, salary) is covering — no table access. Trade-off: larger index → more storage, slower writes. Create covering indexes for your most critical, frequently-executed queries."
},
{
  id: 256, section: "Performance and Tuning",
  q: "What is statistics and why are they important for query optimization?",
  a: "Database statistics are metadata about the distribution of data in table columns (number of rows, distinct values, value frequency distributions, histograms). The query optimizer uses them to estimate query costs and choose execution plans.",
  exp: "Stale statistics lead to bad plan choices. Example: statistics say 100 rows match a condition but actually 10 million match — optimizer chooses nested loop join (efficient for 100 rows) instead of hash join (needed for millions). Solutions: ANALYZE TABLE (MySQL), VACUUM ANALYZE (PostgreSQL), UPDATE STATISTICS (SQL Server). Auto-statistics updates in modern DBMS help but may not always be timely for rapidly changing data."
},
{
  id: 257, section: "Performance and Tuning",
  q: "What is a hot spot in database performance?",
  a: "A hot spot is a specific area of the database (a table, index, data page, or partition) that receives a disproportionately high amount of concurrent access, causing contention, locking, and performance degradation.",
  exp: "Common hot spots: auto-increment primary key in sequential order (all inserts go to the last B-tree leaf — hot node). Fix: use random UUIDs or hash-distributed keys. Last-inserted rows being accessed most (cache thrashing). Head-of-line blocking. In Cassandra: choosing a poor partition key concentrates data on one node. Solutions: padded random keys, partitioning, sequence caching, application-level sharding."
},
{
  id: 258, section: "Performance and Tuning",
  q: "What is connection pool exhaustion?",
  a: "Connection pool exhaustion occurs when all connections in the pool are in use and new requests must wait for a connection to be released. It causes requests to queue, timeout, and ultimately fail, degrading application performance under load.",
  exp: "Causes: slow queries holding connections too long, application bugs not releasing connections, traffic spike exceeding pool capacity, long transactions. Detection: monitoring pool wait times, active vs. idle connections. Solutions: optimize slow queries to release connections faster, tune pool size (but larger pools can overwhelm the DB), implement request queuing at application level, circuit breakers for DB failures."
},
{
  id: 259, section: "Performance and Tuning",
  q: "What is vacuuming in PostgreSQL?",
  a: "In PostgreSQL, VACUUM reclaims storage occupied by dead tuples (rows marked as deleted or updated but not physically removed, due to MVCC). VACUUM ANALYZE also updates query planner statistics.",
  exp: "PostgreSQL's MVCC creates dead tuples on every UPDATE/DELETE — old versions needed for concurrent transactions. Without vacuuming: table bloat (disk space wasted), index bloat, transaction ID wraparound (catastrophic — every 2^32 transactions). AUTOVACUUM runs automatically. VACUUM FULL compacts the table (exclusive lock, rare). ANALYZE updates statistics. Monitoring: pg_stat_user_tables, pgstattuple for bloat."
},
{
  id: 260, section: "Performance and Tuning",
  q: "What is the difference between a query timeout and a lock timeout?",
  a: "A query timeout terminates a query if it runs longer than a specified duration (the entire query execution is too slow). A lock timeout terminates a query if it waits longer than a specified duration to acquire a lock on a resource.",
  exp: "Query timeout: SET statement_timeout = '30s' (PostgreSQL), SET LOCK_TIMEOUT and QUERY_GOVERNOR_COST_LIMIT (SQL Server). Lock timeout: LOCK WAIT timeout (MySQL), lock_timeout (PostgreSQL), SET LOCK_TIMEOUT (SQL Server). Lock timeouts are crucial to prevent deadlock scenarios from blocking indefinitely. Applications should handle these exceptions gracefully (retry logic, user-friendly error messages)."
},

// ============================================================
// SECTION 18: TRIGGER & STORED PROCEDURE DETAILS (Q261–Q300)
// ============================================================
{
  id: 261, section: "Stored Procedures and Triggers",
  q: "What are the differences between a BEFORE and AFTER trigger?",
  a: "A BEFORE trigger fires before the triggering operation (INSERT/UPDATE/DELETE) takes effect. An AFTER trigger fires after the operation completes. BEFORE triggers can modify or cancel the operation; AFTER triggers see the committed effect.",
  exp: "BEFORE INSERT: can validate or modify the new row data before it's saved (can set :NEW values in Oracle/MySQL). BEFORE DELETE: can prevent deletion by raising an error. AFTER INSERT: used for audit logging, cascading changes to other tables. AFTER UPDATE: can capture old and new values for audit trails. INSTEAD OF triggers (on views) replace the operation entirely with custom logic."
},
{
  id: 262, section: "Stored Procedures and Triggers",
  q: "What is a compound trigger in Oracle?",
  a: "A compound trigger in Oracle combines multiple trigger timing points (BEFORE STATEMENT, BEFORE EACH ROW, AFTER EACH ROW, AFTER STATEMENT) into a single trigger body, allowing state to be shared across sections.",
  exp: "Problem without compound triggers: per-row triggers can't share state (count of affected rows, etc.). With compound trigger: declare a package-level variable in the trigger, populate it BEFORE EACH ROW, use it AFTER STATEMENT. Common use: accumulating data changes across many rows and processing them in bulk at statement level — much more efficient than row-level processing."
},
{
  id: 263, section: "Stored Procedures and Triggers",
  q: "What are the advantages of stored procedures over application-level SQL?",
  a: "Advantages: (1) Precompiled execution plan — faster execution. (2) Reduced network traffic — only call name + params, not full SQL. (3) Business logic centralized in DB — consistent enforcement. (4) Security — users execute procedure without table access. (5) Code reuse — call from multiple apps. (6) Transaction management encapsulated.",
  exp: "Security example: users can EXEC GetEmployeeSalary(emp_id) without SELECT permission on the salary table. Network: instead of sending 50-line SQL query each time, just EXEC ProcessOrder(order_id). Precompilation: query plan cached after first call (though parameterized queries in ORMs also achieve this). Modern ORMs and micro-ORMs have reduced the need for stored procedures, but they remain valuable for complex DB logic."
},
{
  id: 264, section: "Stored Procedures and Triggers",
  q: "What are mutating table errors in Oracle triggers?",
  a: "A mutating table error (ORA-04091) occurs when a row-level trigger attempts to read or modify the same table that caused the trigger to fire. The table is 'mutating' (in the middle of being modified) and is in an inconsistent state.",
  exp: "Example: INSERT trigger on employees tries to SELECT from employees to check count — error. Solution: use statement-level trigger instead of row-level (sees the complete post-statement state), or use compound trigger (collect row data BEFORE EACH ROW, process AFTER STATEMENT), or use autonomous transactions (separate transaction, use carefully). Mutating table errors are a common pitfall in Oracle trigger development."
},
{
  id: 265, section: "Stored Procedures and Triggers",
  q: "What is an autonomous transaction in Oracle?",
  a: "An autonomous transaction is an independent transaction declared with PRAGMA AUTONOMOUS_TRANSACTION within a PL/SQL block. It executes independently from the calling transaction — can commit or rollback without affecting the outer transaction.",
  exp: "Use cases: audit logging within a rollback scenario (you want the audit log to persist even if the main transaction rolls back), error logging, sending email notifications. Example: audit trigger fires during a transaction that later rolls back — autonomous transaction ensures audit record is committed. Caution: can lead to inconsistencies if not used carefully. Deadlocks possible if autonomous and main transaction both need the same locks."
},

// ============================================================
// SECTION 19: SQL FUNCTIONS (Q266–Q305)
// ============================================================
{
  id: 266, section: "SQL Functions",
  q: "What are string functions in SQL?",
  a: "Common string functions: CONCAT/|| (concatenation), LENGTH/LEN (string length), UPPER/LOWER (case conversion), SUBSTRING/SUBSTR (extract portion), TRIM/LTRIM/RTRIM (remove whitespace), REPLACE (replace substring), LIKE (pattern matching), REGEXP (regular expression), CHARINDEX/INSTR (find substring position).",
  exp: "Examples: CONCAT('Hello', ' ', 'World') → 'Hello World'. SUBSTRING('Database', 1, 4) → 'Data'. UPPER('mysql') → 'MYSQL'. REPLACE('2024-01-15', '-', '/') → '2024/01/15'. TRIM('  Hello  ') → 'Hello'. String functions are used for data cleaning, display formatting, search, and transformation. Note syntax differences: MySQL uses SUBSTRING(), Oracle uses SUBSTR(), SQL Server uses SUBSTRING()."
},
{
  id: 267, section: "SQL Functions",
  q: "What are date and time functions in SQL?",
  a: "Common date functions: NOW()/CURRENT_TIMESTAMP (current datetime), CURDATE()/CURRENT_DATE (today), DATEADD/DATE_ADD (add interval), DATEDIFF (difference between dates), YEAR/MONTH/DAY (extract parts), DATE_FORMAT/TO_CHAR (format date), EXTRACT (standard date part extraction).",
  exp: "Examples: DATEDIFF('2024-12-31', '2024-01-01') → 365. DATE_ADD('2024-01-01', INTERVAL 30 DAY) → '2024-01-31'. YEAR('2024-06-15') → 2024. TO_CHAR(SYSDATE, 'YYYY-MM-DD') in Oracle. Date arithmetic is critical for reporting, age calculation, expiration checks, and scheduling. Always store dates in UTC to avoid timezone issues; convert for display."
},
{
  id: 268, section: "SQL Functions",
  q: "What is the LEAD and LAG function in SQL?",
  a: "LAG(column, offset) accesses a value from a previous row (default offset=1 = immediately preceding row). LEAD(column, offset) accesses a value from a following row — both within the window defined by OVER().",
  exp: "Example: SELECT order_date, total, LAG(total, 1) OVER (ORDER BY order_date) AS prev_total, total - LAG(total,1) OVER (ORDER BY order_date) AS change FROM orders. Computes month-over-month change without a self-join. LEAD useful for: next order date, comparing current row with next period. Both functions are powerful for time-series analysis and sequential data processing."
},
{
  id: 269, section: "SQL Functions",
  q: "What is FIRST_VALUE and LAST_VALUE in SQL window functions?",
  a: "FIRST_VALUE(column) returns the first value in the window frame (as defined by ORDER BY and ROWS/RANGE clause). LAST_VALUE(column) returns the last value. They are useful for finding the first/last occurrence within a group.",
  exp: "Example: FIRST_VALUE(salary) OVER (PARTITION BY dept ORDER BY hire_date) gives the salary of the first person hired in each department. LAST_VALUE caveat: by default uses rows from start to current row (RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). To get true last value: specify ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING. A common bug: LAST_VALUE without explicit frame gives current row's own value."
},
{
  id: 270, section: "SQL Functions",
  q: "What is the PERCENT_RANK function?",
  a: "PERCENT_RANK() computes the relative rank of a row as a percentile, ranging from 0 to 1. It indicates what percentage of rows have a value less than the current row.",
  exp: "Formula: (rank - 1) / (total_rows - 1). Example: PERCENT_RANK() OVER (ORDER BY salary) = 0.75 means 75% of rows have lower salary. First row always gets 0.0; last row gets 1.0. Difference from CUME_DIST: PERCENT_RANK uses strict ordering (rows with the same value get the same rank), while CUME_DIST counts equal values as part of the percentile. Used for percentile calculations and distribution analysis."
},

// ============================================================
// SECTION 20: PRACTICAL DBMS SCENARIOS (Q271–Q310)
// ============================================================
{
  id: 271, section: "Practical Scenarios",
  q: "How would you find duplicate records in a SQL table?",
  a: "Use GROUP BY on columns that define a duplicate, and HAVING COUNT(*) > 1 to find groups with multiple occurrences.",
  exp: "SELECT email, COUNT(*) as cnt FROM users GROUP BY email HAVING COUNT(*) > 1. To see full duplicate rows: SELECT * FROM users WHERE email IN (SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1). To delete duplicates keeping one: DELETE FROM users WHERE id NOT IN (SELECT MIN(id) FROM users GROUP BY email). Window function approach: use ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) and delete where rn > 1."
},
{
  id: 272, section: "Practical Scenarios",
  q: "How do you find the second highest salary in a table?",
  a: "Multiple approaches: (1) LIMIT/OFFSET: SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1. (2) Subquery: SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees). (3) Window function: SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) rk FROM employees) t WHERE rk = 2.",
  exp: "Each approach handles ties differently. LIMIT/OFFSET may skip ties. Subquery approach works for any DBMS. Window function with DENSE_RANK is most robust for the 'nth highest' generalization. For Nth highest: replace '1 OFFSET 1' with 'LIMIT 1 OFFSET N-1', or change WHERE salary < ... with N-1 nested subqueries (inefficient for large N)."
},
{
  id: 273, section: "Practical Scenarios",
  q: "How do you swap two column values in a SQL row without a temp variable?",
  a: "Use a single UPDATE statement with the values cross-assigned in one operation: UPDATE table SET col1 = col2, col2 = col1 WHERE condition. SQL updates all expressions using the values at the time the statement starts.",
  exp: "Example: UPDATE employees SET first_name = last_name, last_name = first_name WHERE id = 1. Unlike procedural languages, SQL UPDATE uses the original values for all assignments in the SET clause — the right-hand side is evaluated before any assignment occurs. This atomically swaps the values without a temporary variable. This works in MySQL, PostgreSQL, SQL Server."
},
{
  id: 274, section: "Practical Scenarios",
  q: "How do you delete duplicate rows keeping only one copy?",
  a: "Use a CTE with ROW_NUMBER() to assign a row number to each duplicate group, then delete rows where row number > 1 (keeping the first occurrence).",
  exp: "WITH cte AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn FROM users) DELETE FROM cte WHERE rn > 1. Alternatively: DELETE FROM users WHERE id NOT IN (SELECT MIN(id) FROM users GROUP BY email). The CTE+ROW_NUMBER approach is efficient and easy to understand. The NOT IN approach may be slow for large tables. Always test with a SELECT first before executing DELETE."
},
{
  id: 275, section: "Practical Scenarios",
  q: "How do you find employees who earn more than their manager?",
  a: "Use a self-join: SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary FROM employees e JOIN employees m ON e.manager_id = m.id WHERE e.salary > m.salary.",
  exp: "The self-join connects each employee (alias 'e') with their manager (alias 'm') via the manager_id foreign key that references the same table's id. The WHERE clause filters to only employees earning more than their manager. Alternatively: using a subquery or CTE. This query is a classic interview question demonstrating understanding of self-joins and hierarchical data."
},
{
  id: 276, section: "Practical Scenarios",
  q: "How do you calculate running totals in SQL?",
  a: "Use SUM() as a window function with OVER (ORDER BY column ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) to compute a cumulative sum (running total) row by row.",
  exp: "SELECT order_date, amount, SUM(amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM orders. The window frame 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW' includes all rows from the start to the current row. Partition by customer: SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) gives running total per customer."
},
{
  id: 277, section: "Practical Scenarios",
  q: "How do you find employees without a department?",
  a: "Use LEFT JOIN: SELECT e.name FROM employees e LEFT JOIN departments d ON e.dept_id = d.id WHERE d.id IS NULL. Or: SELECT name FROM employees WHERE dept_id IS NULL (if dept_id is nullable).",
  exp: "LEFT JOIN includes all employees including those with no matching department. Filtering for d.id IS NULL selects only the unmatched rows (employees with no department). Alternatively, use NOT EXISTS: SELECT name FROM employees e WHERE NOT EXISTS (SELECT 1 FROM departments d WHERE d.id = e.dept_id). All three approaches find employees with no corresponding department record."
},
{
  id: 278, section: "Practical Scenarios",
  q: "How would you design a schema for a library management system?",
  a: "Tables: Books(BookID, ISBN, Title, PublisherID), Authors(AuthorID, Name), BookAuthors(BookID, AuthorID), Publishers(PublisherID, Name), Members(MemberID, Name, Email, MembershipExpiry), Loans(LoanID, BookID, MemberID, LoanDate, DueDate, ReturnDate), Fines(FineID, LoanID, Amount, PaidDate).",
  exp: "Books and Authors have M:N relationship → junction table BookAuthors. A book has one publisher → FK to Publishers. A member can loan multiple books → Loans table with FK to Books and Members. Loans tracks due dates and return dates. NULL ReturnDate means book is currently checked out. Fines linked to Loans. Additional considerations: book copies (BookCopies table), categories/genres, reservations, member transaction history."
},
{
  id: 279, section: "Practical Scenarios",
  q: "What is the difference between INNER JOIN and LEFT JOIN with a WHERE clause on the right table?",
  a: "A LEFT JOIN with a WHERE condition on the right table's column (excluding NULLs) behaves like an INNER JOIN, because the WHERE clause filters out the rows where right table had no match (which would have been NULLs).",
  exp: "Example: SELECT * FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE c.city = 'Mumbai'. Customers with no matching order had NULL city — filtered by WHERE. Result = INNER JOIN. To properly use LEFT JOIN and keep unmatched rows: move condition to ON clause: ON o.customer_id = c.id AND c.city = 'Mumbai'. Now customers with NULL (no match) are still included, with NULLs for customer columns."
},
{
  id: 280, section: "Practical Scenarios",
  q: "How would you design a schema for an e-commerce application?",
  a: "Key tables: Users, Products, Categories, Orders, OrderItems, Cart, CartItems, Addresses, Payments, Reviews, Inventory. Products have M:N with Categories via ProductCategories. Orders have M:N with Products via OrderItems (quantity, price at time of order).",
  exp: "Critical design decisions: store price in OrderItems at time of order (not just FK to Products — price may change). Separate shipping and billing addresses. Inventory tracking (current stock, reserved stock). Payment status tracking. Soft delete for products (IsActive flag — don't delete, archived orders reference product). Auditing with created_at, updated_at timestamps. Indexes on user_id, product_id in OrderItems, created_at in Orders for reporting."
},

// ============================================================
// SECTION 21: ADDITIONAL SQL CONCEPTS (Q281–Q320)
// ============================================================
{
  id: 281, section: "Advanced SQL",
  q: "What is a materialized path pattern for hierarchical data?",
  a: "Materialized path stores the full path from root to a node as a string in a column (e.g., '/1/3/7/'). It allows fast subtree queries using LIKE '/1/3/%' but requires careful maintenance when moving nodes.",
  exp: "Alternative hierarchical data patterns: Adjacency list (parent_id FK — simple but slow for deep subtrees), Nested sets (left/right values — fast subtree but expensive updates), Closure table (separate table of all ancestor-descendant pairs — most flexible). Materialized path: good for read-heavy trees with rare moves. Each pattern trades read vs write performance differently."
},
{
  id: 282, section: "Advanced SQL",
  q: "What is the difference between IS NULL and = NULL?",
  a: "IS NULL correctly tests for NULL values and returns TRUE when the value is NULL. '= NULL' always returns UNKNOWN (not TRUE) due to three-valued logic — NULL is not equal to anything, including itself.",
  exp: "SQL uses three-valued logic: TRUE, FALSE, UNKNOWN. Any comparison with NULL returns UNKNOWN. WHERE col = NULL never selects any rows. WHERE col IS NULL selects rows where col is NULL. Similarly, WHERE col != NULL never selects any rows — use WHERE col IS NOT NULL. This is a common bug in SQL queries. NULL represents 'unknown value' — comparing unknowns is inherently unknown."
},
{
  id: 283, section: "Advanced SQL",
  q: "What is an INTERSECT operation in SQL?",
  a: "INTERSECT returns only the rows that appear in both result sets of two SELECT queries. The queries must be union-compatible (same number and compatible types of columns).",
  exp: "SELECT customer_id FROM orders_2023 INTERSECT SELECT customer_id FROM orders_2024 finds customers who ordered in both years. INTERSECT removes duplicates (like UNION). INTERSECT ALL keeps duplicates. Less commonly supported than UNION (MySQL didn't support INTERSECT until 8.0). Alternative: EXISTS subquery or INNER JOIN on the common columns achieves the same result."
},
{
  id: 284, section: "Advanced SQL",
  q: "What is a cross join?",
  a: "A CROSS JOIN produces the Cartesian product of two tables — every row from the first table is combined with every row from the second table. If table A has 5 rows and B has 4 rows, CROSS JOIN produces 20 rows.",
  exp: "Syntax: SELECT * FROM A CROSS JOIN B (explicit) or SELECT * FROM A, B (implicit). Practical uses: generate all combinations of sizes and colors for products, create a date dimension by cross joining years and months, or test with complete combination data. WARNING: CROSS JOIN on large tables creates enormous result sets — ensure you actually need all combinations."
},
{
  id: 285, section: "Advanced SQL",
  q: "What is a non-equi join?",
  a: "A non-equi join uses a comparison operator other than equality (=) in the join condition — such as <, >, <=, >=, BETWEEN, !=. It matches rows where values fall within a range or meet an inequality condition.",
  exp: "Example: joining employees to a salary grade table: SELECT e.name, g.grade FROM employees e JOIN salary_grades g ON e.salary BETWEEN g.min_salary AND g.max_salary. This assigns each employee to a salary grade range. Another example: temporal joins (join on date ranges). Non-equi joins don't have a 'fast' merge/hash join algorithm — they typically use nested loop, which can be slow on large tables."
},
{
  id: 286, section: "Advanced SQL",
  q: "What is the OVER() clause in window functions?",
  a: "The OVER() clause defines the window (set of rows) for a window function. It can include PARTITION BY (divide result into groups), ORDER BY (define ordering within groups), and a ROWS/RANGE BETWEEN frame specification.",
  exp: "PARTITION BY dept ORDER BY salary: window for each department, ordered by salary. SUM(salary) OVER () — entire table. SUM(salary) OVER (PARTITION BY dept) — per department total. SUM(salary) OVER (PARTITION BY dept ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — running total per department by hire date. Window functions never collapse rows — each row has its own result plus the window calculation."
},
{
  id: 287, section: "Advanced SQL",
  q: "What is the difference between ROWS and RANGE in window frame specification?",
  a: "ROWS defines the frame using physical row positions (offset by number of rows). RANGE defines the frame using logical value ranges (includes all rows with values in the specified range from the current row's value).",
  exp: "Example: ORDER BY date with ROWS BETWEEN 1 PRECEDING AND CURRENT ROW — always includes exactly 2 rows. RANGE BETWEEN 1 PRECEDING AND CURRENT ROW — includes all rows where date >= current_date - 1 (multiple rows with the same date included). RANGE with ORDER BY date handles ties inclusively. For running totals: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — all rows up to the current value (includes ties). ROWS is more predictable for fixed-count windows."
},
{
  id: 288, section: "Advanced SQL",
  q: "What is the SUM() OVER() pattern for cumulative totals?",
  a: "SUM(value) OVER (ORDER BY date_col) with an implicit or explicit frame of RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW computes a cumulative (running) total up to and including each row.",
  exp: "SELECT order_date, amount, SUM(amount) OVER (ORDER BY order_date) AS cumulative. For monthly totals partitioned by year: SUM(amount) OVER (PARTITION BY YEAR(order_date) ORDER BY order_date). Running percentages: SUM(amount) OVER (ORDER BY order_date) / SUM(amount) OVER () * 100 AS running_pct. This eliminates the need for self-joins or correlated subqueries for running aggregates."
},
{
  id: 289, section: "Advanced SQL",
  q: "What is the EXCEPT/MINUS operation in SQL?",
  a: "EXCEPT (MINUS in Oracle) returns all rows from the first query that do not appear in the second query. It is the set difference operation applied to result sets.",
  exp: "SELECT customer_id FROM orders_2023 EXCEPT SELECT customer_id FROM orders_2024 — customers who ordered in 2023 but NOT in 2024. EXCEPT removes duplicates; EXCEPT ALL preserves them. Use cases: finding data in one set but not another — useful for identifying gaps, deactivated records, or incomplete migrations. Alternative: LEFT JOIN ... WHERE right_side.key IS NULL achieves the same result."
},
{
  id: 290, section: "Advanced SQL",
  q: "What are check constraints in SQL?",
  a: "CHECK constraints validate that column values satisfy a specified condition when data is inserted or updated. They enforce domain integrity and business rules at the database level.",
  exp: "ALTER TABLE employees ADD CONSTRAINT chk_salary CHECK (salary >= 0 AND salary <= 10000000). ALTER TABLE orders ADD CONSTRAINT chk_status CHECK (status IN ('pending','shipped','delivered','cancelled')). CHECK constraints apply to any boolean expression referencing columns of the same row. They are enforced by the DBMS for all INSERT/UPDATE operations, making data validation database-independent."
},

// ============================================================
// SECTION 22: MORE NORMALIZATION & FDs (Q291–Q330)
// ============================================================
{
  id: 291, section: "Normalization",
  q: "What is the Attribute Closure Algorithm and how is it applied?",
  a: "The attribute closure algorithm computes X+ (the set of all attributes functionally determined by X) given a set of FDs. Start with X+ = X, then iteratively add attributes by applying each FD whose LHS is a subset of X+.",
  exp: "Example: R(A,B,C,D,E,F) with FDs: A→B, BC→DE, B→F. Find A+: Start: {A}. Apply A→B: {A,B}. Apply B→F: {A,B,F}. No more FDs applicable (BC not subset). A+ = {A,B,F}. Use: Is A a superkey? No (missing C,D,E). Is A→D implied? No (D not in A+). This algorithm is fundamental to normalization, key finding, and FD closure computation."
},
{
  id: 292, section: "Normalization",
  q: "What is a trivial functional dependency?",
  a: "A functional dependency X→Y is trivial if Y is a subset of X (Y⊆X). Trivial dependencies are always satisfied by any relation and do not add information about the data.",
  exp: "Examples: {A,B}→A is trivial (A is already in {A,B}). A→A is trivial. Non-trivial: A→B where A and B are different attributes. Trivial FDs are used in the formal definition of BCNF and 3NF: 'for every non-trivial FD X→Y, X must be a superkey (BCNF) or Y must be prime (3NF).' By excluding trivials, normalization focuses only on meaningful data relationships."
},
{
  id: 293, section: "Normalization",
  q: "What is a full functional dependency?",
  a: "An attribute Y is fully functionally dependent on X if Y is functionally dependent on X, but not on any proper subset of X. That is, removing any attribute from X destroys the dependency.",
  exp: "Example: {StudentID, CourseID}→Grade is a full FD if Grade cannot be determined by StudentID alone or CourseID alone. {StudentID, CourseID}→StudentName is NOT a full FD (StudentID alone determines StudentName). Full functional dependence is the requirement for 2NF: every non-prime attribute must be fully functionally dependent on every candidate key."
},
{
  id: 294, section: "Normalization",
  q: "How do you decompose a relation to achieve BCNF?",
  a: "Algorithm: Find a non-trivial FD X→Y where X is not a superkey. Decompose R into: R1 = X ∪ Y (closure of X attributes) and R2 = R − Y (all attributes except non-key Y). Recursively check each sub-relation.",
  exp: "Example: R(A,B,C,D) with FDs A→B, B→C. B is not a superkey (B+ = {B,C} ≠ all). Decompose: R1(B,C), R2(A,B,D). Check R1: B→C, B is superkey of R1? B+ in R1 = {B,C} = all attributes of R1. Yes! R1 is BCNF. Check R2: A→B, A+ in R2 = {A,B,D} = all attributes of R2. R2 is BCNF. Result: R1(B,C) and R2(A,B,D). Lossless join guaranteed by common attribute B."
},
{
  id: 295, section: "Normalization",
  q: "Can a relation in 3NF still have redundancy?",
  a: "Yes. 3NF allows non-superkey FDs when the right-hand side is a prime attribute. This can lead to some redundancy when there are multiple overlapping candidate keys, even though each non-prime attribute has a direct dependency on candidate keys.",
  exp: "Example: R(Course, Teacher, Book) with FDs: {Course,Teacher}→Book, {Course,Book}→Teacher, Teacher→Book. Both {Course,Teacher} and {Course,Book} are candidate keys. Teacher→Book satisfies 3NF (Book is prime — part of {Course,Book} key). But Teacher→Book creates redundancy: if Teacher Smith always uses the same Book, that fact is stored with every Course-Smith row. BCNF eliminates this but loses the Teacher→Book dependency."
},

// ============================================================
// SECTION 23: DBMS INTERNALS (Q296–Q340)
// ============================================================
{
  id: 296, section: "DBMS Internals",
  q: "What is the difference between a B-tree and a B+ tree with regard to internal nodes?",
  a: "In a B-tree, internal nodes can contain both key values and data pointers (record pointers). In a B+ tree, internal nodes contain only key values for routing; all data pointers are in the leaf nodes.",
  exp: "B-tree advantage: can sometimes find a record at an internal node (doesn't need to reach leaf). B+ tree advantage: more keys fit per internal node (larger fan-out → shorter tree → fewer I/Os), all data accessed at leaf level (predictable), range queries efficient (linked leaves). In practice, B+ trees dominate database indexing because leaf-linking makes range scans (WHERE id BETWEEN 100 AND 200) far more efficient."
},
{
  id: 297, section: "DBMS Internals",
  q: "What is the fill factor in index creation?",
  a: "Fill factor is the percentage of each index page that is filled with data during index creation or rebuilding. A fill factor of 80% leaves 20% of each page empty for future insertions, reducing page splits and fragmentation.",
  exp: "High fill factor (90-100%): less wasted space, but more page splits on INSERT → higher fragmentation over time. Low fill factor (50-70%): more free space → fewer page splits, but more pages to read initially. For read-only or append-only tables: 100%. For frequently updated tables: 70-80%. Default varies by DBMS (SQL Server: 80%, PostgreSQL: 90% via fillfactor storage parameter). Rebuild indexes periodically to restore fill factor."
},
{
  id: 298, section: "DBMS Internals",
  q: "What is a page split in B+ tree indexes?",
  a: "A page split occurs when a B+ tree leaf or internal node is full and a new key must be inserted. The page is split into two pages, approximately half-filled each, and the middle key is pushed up to the parent node.",
  exp: "Page splits: increase fragmentation (pages not physically sequential on disk), require parent node update (may cascade if parent is also full), increase I/O for subsequent reads. Heavy sequential inserts (auto-increment PKs) don't cause splits (always appending to the rightmost page). Random inserts (UUIDs) cause many splits throughout the tree. SQL Server: can also cause non-leaf page splits which cascade to the root."
},
{
  id: 299, section: "DBMS Internals",
  q: "What is the buffer pool management and pin count?",
  a: "Each buffer pool frame has a pin count — the number of threads currently using the page. A page can only be evicted (replaced) when its pin count is 0 (no one is using it). Threads 'pin' pages before use and 'unpin' when done.",
  exp: "Buffer pool algorithm: find required page → if in pool (hit): pin it, return pointer. If not (miss): find unpinned frame (using replacement policy like LRU) → evict current page (write to disk if dirty) → load new page from disk → pin it, return. Dirty bit: set when a frame is modified; cleared when written to disk. Pages must be written before eviction only if dirty (NO-STEAL policy would prevent this)."
},
{
  id: 300, section: "DBMS Internals",
  q: "What is a log sequence number (LSN)?",
  a: "A Log Sequence Number (LSN) is a unique, monotonically increasing identifier assigned to each record written to the transaction log. It is the fundamental tracking mechanism for WAL-based recovery.",
  exp: "LSNs are used to: determine the order of log records, track which log records have been flushed to disk (flushedLSN), track which data pages need recovery (pageLSN stored in each page header — the LSN of the last log record that modified it), and determine recovery scope (restart from checkpoint LSN). In ARIES: prevLSN links log records of the same transaction for undo traversal."
},

// ============================================================
// SECTION 24: ADDITIONAL TOPICS (Q301–Q350)
// ============================================================
{
  id: 301, section: "Additional Topics",
  q: "What is eventual consistency vs strong consistency in databases?",
  a: "Strong consistency guarantees that after a write completes, any subsequent read returns that written value — all nodes in a distributed system see the same data simultaneously. Eventual consistency allows temporary divergence, guaranteeing that after no new updates, all replicas will converge.",
  exp: "Strong consistency examples: relational databases with synchronous replication, Google Spanner (using TrueTime), ZooKeeper. Eventual consistency: Amazon DynamoDB (default), Cassandra, Couchbase. Trade-off: strong consistency requires coordination (higher latency, lower availability during partitions). Eventual consistency allows local reads/writes (lower latency, higher availability). Many applications can tolerate eventual consistency (social media feeds, product views)."
},
{
  id: 302, section: "Additional Topics",
  q: "What is a document store's concept of embedding vs referencing?",
  a: "In document databases: embedding (denormalization) stores related data within a document as nested objects/arrays. Referencing stores only a foreign key/ID in the document, requiring a separate query to fetch related data.",
  exp: "Embedding: {'user': 'Alice', 'address': {'city': 'Mumbai', 'zip': '400001'}}. Fast reads (no join), atomic updates of related data. Best for: small, frequently-accessed-together data, one-to-one relationships, data that doesn't change independently. Referencing: {'user': 'Alice', 'order_ids': [1,2,3]}. Better for: large related data, data shared across documents, frequently updated sub-documents. MongoDB's rule of thumb: embed for 'one-to-few', reference for 'one-to-many' or 'many-to-many'."
},
{
  id: 303, section: "Additional Topics",
  q: "What is the difference between a primary key and a unique key?",
  a: "A primary key: exactly one per table, cannot be NULL, uniquely identifies each row, automatically clustered (typically), automatically creates a clustered index. A unique key: multiple per table, allows exactly one NULL (most DBMS), also enforces uniqueness, creates a non-clustered index.",
  exp: "If a table has multiple candidate keys (e.g., both SSN and Email uniquely identify a person), one is chosen as PRIMARY KEY (often a surrogate ID) and the others are UNIQUE constraints. NULL behavior: SQL standard allows one NULL in a UNIQUE column; PostgreSQL allows multiple NULLs (NULLs considered distinct). Primary key choice affects physical storage order (clustered index)."
},
{
  id: 304, section: "Additional Topics",
  q: "What is a surrogate key vs a composite key?",
  a: "A surrogate key is a single-column, system-generated identifier (auto-increment, UUID) with no business meaning. A composite key uses two or more existing (natural) columns together to uniquely identify a row.",
  exp: "Surrogate key advantages: stable (never changes), compact (integer), simple FK references. Composite key advantages: meaningful (naturally identifies data), no extra column needed. Disadvantages of composite keys: multi-column FK references (complex joins), may change (if any component changes). In junction tables (for M:N relationships), composite keys from the FK columns are natural and common: PRIMARY KEY (student_id, course_id)."
},
{
  id: 305, section: "Additional Topics",
  q: "What is a UUID and when should it be used as a primary key?",
  a: "UUID (Universally Unique Identifier) is a 128-bit identifier represented as a 32-character hex string (e.g., 550e8400-e29b-41d4-a716-446655440000). It can be generated independently by multiple systems without coordination.",
  exp: "Advantages: globally unique across systems, enables distributed ID generation without a central sequence, safe for merging databases, doesn't expose business information (vs sequential IDs). Disadvantages: 16 bytes vs 4 bytes for INT (bigger indexes), random UUIDs cause page splits and poor cache locality in B+ trees. Solutions: UUID v7 (time-ordered), ULID, sequential UUIDs generated with a random component. Good for: microservices, multi-tenant systems, global IDs."
},
{
  id: 306, section: "Additional Topics",
  q: "What is a table inheritance in PostgreSQL?",
  a: "PostgreSQL supports table inheritance where a child table inherits all columns of the parent table and can add additional columns. Queries on the parent table include rows from all child tables unless ONLY is specified.",
  exp: "CREATE TABLE vehicles (id INT, make TEXT, model TEXT). CREATE TABLE cars () INHERITS (vehicles). INSERT INTO cars VALUES (1, 'Toyota', 'Camry'). SELECT * FROM vehicles returns all vehicles including cars. SELECT * FROM ONLY vehicles returns only vehicles, not inherited tables. Useful for partitioning (before native partitioning) and polymorphic tables. Limitation: unique constraints don't span inherited tables."
},
{
  id: 307, section: "Additional Topics",
  q: "What is row-level security (RLS) in databases?",
  a: "Row-Level Security (RLS) is a database feature that restricts which rows of a table a user can access, based on the user's identity or roles. Each user sees only rows they're authorized for, transparently enforced by the DBMS.",
  exp: "PostgreSQL RLS example: CREATE POLICY employee_policy ON employees FOR SELECT USING (department = current_setting('app.user_department')). Enable: ALTER TABLE employees ENABLE ROW LEVEL SECURITY. Users only see their department's employees. SQL Server: SECURITY POLICY with inline table-valued functions. Use cases: multi-tenant applications (each tenant sees only their data), sensitive HR data, GDPR compliance. More secure than application-level filtering."
},
{
  id: 308, section: "Additional Topics",
  q: "What is the difference between logical and physical database design?",
  a: "Logical design defines WHAT data is stored and relationships (entities, attributes, relationships, constraints) in a data-model-specific but DBMS-independent way. Physical design defines HOW data is stored (file structures, indexes, partitioning, storage parameters) in a DBMS-specific way.",
  exp: "Logical design output: relational schema (CREATE TABLE statements without storage clauses), constraints, normalization decisions. Physical design output: index choices (which columns, B-tree vs hash), partitioning scheme, tablespace allocation, fill factors, clustering order, denormalization decisions for performance. Logical design is driven by data integrity; physical design is driven by query patterns and performance requirements."
},
{
  id: 309, section: "Additional Topics",
  q: "What is a database proxy and when is it used?",
  a: "A database proxy is middleware that sits between application servers and database servers. It provides connection pooling, query routing (to read replicas or shards), load balancing, SSL termination, query caching, and authentication.",
  exp: "Examples: ProxySQL (MySQL), PgBouncer (PostgreSQL), Vitess (MySQL, Google), Amazon RDS Proxy. Use cases: connection pooling (handle thousands of app connections with few DB connections), read/write splitting (direct writes to primary, reads to replicas), sharding (route queries to correct shard), zero-downtime failover (proxy handles reconnection). Adds latency (microseconds to milliseconds) in exchange for these capabilities."
},
{
  id: 310, section: "Additional Topics",
  q: "What is the difference between hot standby and warm standby?",
  a: "Hot standby: the replica is fully synchronized, online, and immediately available to take over or serve read queries. Warm standby: the replica is synchronized but not online for queries — it takes minutes to bring online during failover. Cold standby requires significant time to restore from backup.",
  exp: "Hot standby: synchronous replication, immediate failover, may serve read queries (read replica). Best RTO (Recovery Time Objective). Warm standby: async replication, slight delay to activate, usually serves no queries until needed. Cold standby: offline backup — restore needed. The choice is cost vs RTO/RPO trade-off: hot standby is more expensive (duplicate full running system) but provides near-zero downtime."
},

// FINAL 190 questions to reach 500+
{
  id: 311, section: "Advanced SQL",
  q: "What is the STUFF function in SQL Server?",
  a: "STUFF deletes a specified number of characters from a string at a given position and inserts another string in their place. Syntax: STUFF(string, start, length, new_string).",
  exp: "Example: STUFF('Hello World', 7, 5, 'SQL') → 'Hello SQL'. Removes 5 characters starting at position 7 ('World') and inserts 'SQL'. Common use: string concatenation with XML/JSON tricks for list aggregation: STRING_AGG is now preferred. STUFF is unique to SQL Server/Sybase. Other DBMS use OVERLAY (standard SQL) or SUBSTR+CONCAT combinations."
},
{
  id: 312, section: "Advanced SQL",
  q: "What is STRING_AGG in SQL?",
  a: "STRING_AGG is an aggregate function that concatenates values from multiple rows into a single string, with a specified separator. It is the SQL standard equivalent of MySQL's GROUP_CONCAT.",
  exp: "SELECT department, STRING_AGG(employee_name, ', ' ORDER BY employee_name) AS employees FROM employees GROUP BY department. Returns: IT | 'Alice, Bob, Charlie'. MySQL: GROUP_CONCAT(name SEPARATOR ', '). PostgreSQL: STRING_AGG(name, ', ') or array_agg(name). Before STRING_AGG, SQL Server used XML PATH tricks: SELECT STUFF((SELECT ', ' + name FROM ...), 1, 2, ''). STRING_AGG is cleaner and more standard."
},
{
  id: 313, section: "Advanced SQL",
  q: "What is the difference between TRUNCATE and DELETE in terms of transaction log?",
  a: "DELETE is fully logged — each deleted row creates a log entry (row by row). TRUNCATE is minimally logged — only deallocates data pages, recording only page deallocation in the log, regardless of row count.",
  exp: "For a table with 10 million rows: DELETE logs 10 million row deletions (massive log growth, very slow). TRUNCATE logs a small number of page deallocations (fast, minimal log growth). TRUNCATE is 10–100x faster on large tables. However, DELETE can be filtered (WHERE clause) and participates in explicit transactions with rollback. TRUNCATE resets identity/sequence counters. In PostgreSQL, TRUNCATE is transactional (can be rolled back)."
},
{
  id: 314, section: "Advanced SQL",
  q: "What are spatial data types and spatial indexes in DBMS?",
  a: "Spatial data types store geometric and geographic data: POINT, LINESTRING, POLYGON, GEOMETRY, GEOGRAPHY. Spatial indexes (R-tree, space-partitioning) enable efficient spatial queries like 'find all stores within 5km'.",
  exp: "MySQL/PostgreSQL: CREATE TABLE locations (id INT, name VARCHAR, coord POINT, SPATIAL INDEX(coord)). Query: ST_Distance(coord, ST_GeomFromText('POINT(72.877 19.076)')) < 5000. Functions: ST_Contains, ST_Intersects, ST_Within, ST_Distance, ST_Area. PostgreSQL PostGIS extension is the gold standard for spatial data. Used in GIS, mapping applications, ride-sharing (finding nearby drivers), delivery routing."
},
{
  id: 315, section: "Advanced SQL",
  q: "What is a foreign key with ON DELETE CASCADE?",
  a: "ON DELETE CASCADE is a referential action that automatically deletes child records when the referenced parent record is deleted. It maintains referential integrity without manual deletion of dependent rows.",
  exp: "Example: DELETE FROM orders WHERE customer_id = 5 → automatically deletes all order_items for those orders (if FK on order_items.order_id has ON DELETE CASCADE). Other actions: ON DELETE SET NULL (nullify FK in child), ON DELETE SET DEFAULT (set to default), ON DELETE RESTRICT/NO ACTION (reject delete if children exist). CASCADE is convenient but can be dangerous — accidental parent delete cascades to thousands of children."
},
{
  id: 316, section: "Concurrency Control",
  q: "What is the difference between shared locks and exclusive locks?",
  a: "Shared locks (S-locks) are acquired for read operations — multiple transactions can hold shared locks on the same data simultaneously. Exclusive locks (X-locks) are acquired for write operations — only one transaction can hold an exclusive lock at a time, preventing all other reads and writes.",
  exp: "Lock compatibility: S+S: compatible (readers don't block readers). S+X: incompatible (writer blocks readers). X+S: incompatible (readers block while write in progress). X+X: incompatible (writers block writers). This matrix ensures read consistency and write exclusivity. In practice, shared locks are 'read locks' and exclusive locks are 'write locks'. 2PL requires both types to be held for the duration of the transaction (growing phase)."
},
{
  id: 317, section: "Concurrency Control",
  q: "What are intention locks?",
  a: "Intention locks are placed at coarser granularity (table or page level) to indicate that finer-grained locks (row level) are held or intended. They allow the DBMS to quickly check lock compatibility without inspecting all fine-grained locks.",
  exp: "Types: IS (Intention Shared — some rows are S-locked), IX (Intention Exclusive — some rows are X-locked), SIX (Shared + Intention Exclusive — whole object S-locked, some rows X-locked). Before acquiring a row-level X-lock, a transaction acquires an IX lock on the table. Another transaction wanting a full table S-lock sees the IX lock and knows a row-level X-lock exists somewhere — waits without checking each row."
},
{
  id: 318, section: "Transaction Management",
  q: "What is a distributed deadlock?",
  a: "A distributed deadlock occurs in a distributed database when two or more transactions across multiple sites form a cycle of waits. Since each site only sees its local wait-for graph, no single site can detect the deadlock independently.",
  exp: "Detection: maintain a global wait-for graph by periodically sending local wait-for information to a central deadlock detector (or using a distributed algorithm). When a global cycle is found, one transaction is aborted. Prevention: timeout-based (abort transaction that waits too long), timestamp-based schemes (Wait-Die/Wound-Wait applied globally). Distributed deadlocks are harder to detect and resolve than local ones."
},
{
  id: 319, section: "Recovery Management",
  q: "What is the difference between hot backup and cold backup?",
  a: "A hot backup (online backup) is taken while the database is running and accessible to users. A cold backup (offline backup) requires shutting down the database first, ensuring a consistent point-in-time snapshot.",
  exp: "Hot backup advantages: no downtime, business continuity. Requires WAL archiving to ensure a consistent recovery point (the backup may capture tables mid-transaction). Cold backup advantages: guaranteed consistency (no transactions in flight), simpler, no special tools needed. Cold backups impractical for 24/7 systems. Most modern DBMS support hot backups: pg_basebackup (PostgreSQL), RMAN online backup (Oracle), mysqldump --single-transaction (MySQL InnoDB)."
},
{
  id: 320, section: "Recovery Management",
  q: "What is the redo pass in ARIES recovery?",
  a: "In ARIES recovery, the redo pass (after the analysis pass) replays all logged operations from the earliest LSN needed, regardless of whether the transaction ultimately committed or aborted. This brings the database to its exact state at the crash point.",
  exp: "The analysis pass identifies dirty pages (modified but not flushed) and active transactions. The redo pass starts from the minimum LSN in the dirty page table and replays every logged operation (even for later-aborted transactions). This 'redo everything then undo uncommitted' approach ensures correctness. Then the undo pass reverses all transactions that were active (uncommitted) at the time of the crash."
},
{
  id: 321, section: "Indexing and Hashing",
  q: "What is linear hashing?",
  a: "Linear hashing is a dynamic hash structure that expands the hash table incrementally by splitting one bucket at a time, rather than doubling the entire table at once (as in extendible hashing). It maintains a linear growth pointer.",
  exp: "Uses two hash functions: h_i(k) = k mod 2^i and h_{i+1}(k) = k mod 2^{i+1}. A split pointer p indicates the next bucket to split. When load exceeds a threshold, bucket p is split using h_{i+1} to redistribute its records. Advantages: no directory (saves memory), predictable one-bucket-at-a-time growth, good average performance. Disadvantages: some buckets may temporarily overflow, slightly complex implementation."
},
{
  id: 322, section: "Distributed Databases",
  q: "What is data locality in distributed databases?",
  a: "Data locality means storing data physically close to where it will be accessed, minimizing network communication. In distributed databases, designing for data locality means placing frequently co-accessed data on the same node or shard.",
  exp: "Example: In a multi-tenant application, all data for a single tenant in one shard → queries for that tenant need only contact one node. Contrast: if tenant data is spread across all nodes, even a simple query requires coordinating multiple nodes. Data locality reduces: network latency, cross-node transaction overhead, distributed join costs. Geographic locality in globally distributed databases (Spanner, CockroachDB) reduces user-perceived latency."
},
{
  id: 323, section: "Database Security",
  q: "What is data masking in DBMS?",
  a: "Data masking replaces sensitive data with fictitious but realistic values in non-production environments (development, testing, QA) to prevent exposure of real customer data. It provides functional test data without actual sensitive information.",
  exp: "Types: Static data masking (creates a masked copy of the database), Dynamic data masking (masks data on the fly when returned to users without modifying stored data — useful for limiting access for certain user roles). Techniques: substitution (replace name with a fake name from a dictionary), shuffling (randomly swap values within a column), masking (replace with * or X), encryption. Used for GDPR compliance, PCI-DSS, secure development practices."
},
{
  id: 324, section: "Database Security",
  q: "What is the principle of least privilege in database security?",
  a: "The principle of least privilege states that database users, applications, and services should have only the minimum permissions necessary to perform their specific tasks — no more, no less.",
  exp: "Examples: A reporting user needs only SELECT privileges on specific tables (not INSERT, UPDATE, DELETE). An application user needs only the tables it uses (not the entire database). A developer's test account shouldn't have production data access. Implementation: GRANT specific privileges rather than ALL, use roles to group permissions, use schemas to separate object ownership, audit privilege assignments regularly. Reduces damage from compromised accounts or application vulnerabilities."
},
{
  id: 325, section: "Database Security",
  q: "What is transparent data encryption (TDE)?",
  a: "Transparent Data Encryption (TDE) encrypts the entire database at the storage level — data files, log files, and backups are encrypted. It is transparent to applications — data is automatically decrypted when read into memory.",
  exp: "TDE protects against physical theft of storage media (stolen disk, backup tape). Keys are protected by a certificate or asymmetric key stored in the master database. Performance overhead: typically 1-5% for CPU encryption/decryption. TDE does NOT protect against SQL injection or insider threats — authorized users with DB access still see decrypted data. Available in: SQL Server (natively), Oracle (Advanced Security), MySQL Enterprise, PostgreSQL (pgcrypto, or filesystem-level with dm-crypt)."
},
{
  id: 326, section: "NoSQL Databases",
  q: "What is the Cassandra data model?",
  a: "Cassandra uses a wide-column model: data is stored in tables with rows and columns, but each row can have a different set of columns (unlike relational tables). Rows are organized by a partition key that determines data placement, and optional clustering columns define ordering within a partition.",
  exp: "Primary key: (partition_key, clustering_columns). Partition key determines which node stores the data (via consistent hashing). Clustering columns sort rows within a partition. All queries should specify the partition key for efficiency. Cassandra is highly optimized for: writes (append-only log-structured storage), reads by partition key, time-series data. Anti-patterns: full table scans, secondary index on high-cardinality columns, many tombstones."
},
{
  id: 327, section: "NoSQL Databases",
  q: "What is a graph database and the property graph model?",
  a: "A graph database stores data as nodes (vertices) and relationships (edges), each with properties (key-value pairs). The property graph model allows both nodes and relationships to have attributes.",
  exp: "Node: (:Person {name: 'Alice', age: 30}). Relationship: (alice)-[:KNOWS {since: 2020}]->(bob). Cypher query: MATCH (p:Person)-[:FRIENDS_WITH]->(f) WHERE p.name='Alice' RETURN f.name. Graph databases excel when: traversal depth matters (friends-of-friends), relationship properties are important, graph structure is dynamic (social networks evolve). Pattern matching in graphs is where Neo4j Cypher significantly outperforms SQL with recursive CTEs."
},
{
  id: 328, section: "NoSQL Databases",
  q: "What is the difference between MongoDB's findOne and find?",
  a: "findOne() returns a single document matching the query (the first match). find() returns a cursor (lazy iterator) over all matching documents. If no document is found, findOne() returns null; find() returns an empty cursor.",
  exp: "db.users.findOne({email: 'a@example.com'}) returns one user object. db.users.find({city: 'Mumbai'}) returns a cursor to iterate. Use findOne when you only need one result (login lookup by email). Use find when you need multiple results. Limit efficiency: find({}).limit(1) and findOne({}) are functionally equivalent but findOne is more semantic. find() cursor allows .sort(), .skip(), .limit() chaining."
},
{
  id: 329, section: "NoSQL Databases",
  q: "What is an aggregation pipeline in MongoDB?",
  a: "MongoDB's aggregation pipeline is a framework for data processing where documents pass through a series of stages (like pipes), each transforming the data. Common stages: $match (filter), $group (aggregate), $project (reshape), $sort, $limit, $lookup (join), $unwind (flatten arrays).",
  exp: "Example: db.orders.aggregate([$match: {status:'complete'}], [$group: {_id:'$customer_id', total:{$sum:'$amount'}}], [$sort: {total:-1}], [$limit: 10]] — find top 10 customers by total spend. Stages execute in sequence; each receives the output of the previous stage. $lookup performs a left outer join with another collection. The pipeline is more powerful and efficient than map-reduce for most MongoDB aggregation needs."
},
{
  id: 330, section: "NoSQL Databases",
  q: "What is Redis Sentinel vs Redis Cluster?",
  a: "Redis Sentinel provides high availability for a single Redis instance with automatic failover — monitors master, promotes a replica if master fails, notifies clients. Redis Cluster provides horizontal scaling by sharding data across multiple Redis nodes with built-in replication and failover.",
  exp: "Sentinel: HA only, no sharding, all data fits on one node. Suitable for: moderate data sizes, HA requirement without scaling need. Cluster: data automatically sharded across nodes (hash slots 0-16383), each master has replicas, automatic failover. Suitable for: large datasets exceeding single-node memory, horizontal write/read scaling. Cluster limitations: multi-key commands restricted to same slot, limited cross-slot transactions."
},
{
  id: 331, section: "Performance and Tuning",
  q: "What is a table hint (WITH NOLOCK) in SQL Server?",
  a: "WITH (NOLOCK) is a SQL Server table hint that reads data without acquiring shared locks, equivalent to READ UNCOMMITTED isolation level. It allows reading uncommitted data (dirty reads) in exchange for higher concurrency.",
  exp: "Use case: reporting queries on OLTP tables where exact precision is less important than performance. Benefits: doesn't block or get blocked by other transactions — faster reads. Risks: dirty reads (seeing uncommitted data), non-repeatable reads, phantom reads, even reading rows that don't exist yet or have been moved (due to page splits). In practice, WITH NOLOCK is often overused; READ COMMITTED SNAPSHOT ISOLATION (RCSI) provides a better alternative — consistent reads without dirty reads, using row versioning."
},
{
  id: 332, section: "Performance and Tuning",
  q: "What is EXPLAIN ANALYZE in PostgreSQL?",
  a: "EXPLAIN ANALYZE executes a query and returns both the estimated execution plan (from the optimizer) and actual runtime statistics (rows processed, actual time spent at each node). It is the primary tool for query performance analysis in PostgreSQL.",
  exp: "Key metrics: Seq Scan/Index Scan (access method), rows (estimated vs actual), width (average row size in bytes), cost (startup..total), actual time (startup..total ms), loops (for inner sides of joins). Warning signs: rows estimated=5 but actual=50000 (bad statistics), Seq Scan on large table (missing index?), Sort node with large memory usage (need work_mem increase?). EXPLAIN (ANALYZE, BUFFERS) also shows cache hit/miss statistics."
},
{
  id: 333, section: "Performance and Tuning",
  q: "What is a slow query log?",
  a: "The slow query log is a database log file that records queries exceeding a configurable execution time threshold. It helps identify queries needing optimization.",
  exp: "MySQL: slow_query_log=ON, long_query_time=2 (seconds). PostgreSQL: log_min_duration_statement = 1000 (milliseconds). Slow query logs contain: query text, execution time, rows examined, timestamp, user. Analysis tools: mysqldumpslow, pt-query-digest (Percona), pgBadger (PostgreSQL). Common follow-up: run EXPLAIN on slow queries, look for missing indexes, statistics issues, or inefficient query patterns. Essential for production performance monitoring."
},
{
  id: 334, section: "Performance and Tuning",
  q: "What is read-write splitting in database architecture?",
  a: "Read-write splitting routes write operations to the primary (master) database and read operations to one or more replica (slave) databases. This distributes the read load across multiple servers, improving overall throughput.",
  exp: "Implementation: application layer (code explicitly directs reads/writes to different connection strings), proxy layer (ProxySQL, MaxScale automatically route based on query type). Considerations: replication lag (replicas may be slightly behind primary — avoid reading your own writes from replica immediately after writing), read-after-write consistency. Effective for read-heavy applications (social media, e-commerce product pages) where slight data staleness is acceptable."
},
{
  id: 335, section: "Performance and Tuning",
  q: "What is the difference between row-level locking and table-level locking?",
  a: "Row-level locking locks only specific rows being modified, allowing other transactions to concurrently access different rows in the same table. Table-level locking locks the entire table, preventing concurrent access by other transactions.",
  exp: "Row-level: higher concurrency (multiple transactions work on the table simultaneously), more lock management overhead (thousands of lock objects). Table-level: lower concurrency (one writer at a time), less overhead (one lock per table). MySQL InnoDB: row-level by default. MyISAM: table-level (hence not suitable for high-concurrency writes). PostgreSQL: row-level. Table-level locks are appropriate for DDL operations (ALTER TABLE) and bulk loads."
},
{
  id: 336, section: "Advanced Topics",
  q: "What is change data capture (CDC)?",
  a: "CDC is a technique that captures and streams changes (inserts, updates, deletes) from a database in near-real-time. It enables downstream systems to react to data changes without polling.",
  exp: "Implementation: log-based CDC reads the transaction log (WAL/binlog) to detect changes without impacting the source database. Trigger-based CDC uses database triggers (higher overhead). Polling (query for changed rows) is simplest but expensive. Tools: Debezium (open source, PostgreSQL/MySQL/Oracle), AWS DMS, Kafka Connect connectors. Use cases: replicating data to data lakes/warehouses, invalidating caches, event-driven microservices, audit trails."
},
{
  id: 337, section: "Advanced Topics",
  q: "What is database middleware?",
  a: "Database middleware is software that sits between applications and the database, providing additional services such as connection pooling, load balancing, query routing, caching, sharding, and security enforcement without modifying the application or database.",
  exp: "Examples: ProxySQL (MySQL — connection pool, query routing, caching), PgBouncer (PostgreSQL — connection pooling), Vitess (MySQL — horizontal sharding at scale, used by YouTube), MaxScale (MariaDB — monitoring, routing, caching). Middleware abstracts database topology from applications: the application always connects to the middleware endpoint; topology changes (adding replicas, failover) are transparent. Key for cloud-native and microservice architectures."
},
{
  id: 338, section: "Advanced Topics",
  q: "What is the CAP theorem's partition tolerance?",
  a: "Partition tolerance means the system continues operating even when a network partition occurs (messages between nodes are lost or delayed). In distributed systems, network partitions are inevitable — thus, partition tolerance is generally mandatory, leaving a choice between consistency and availability.",
  exp: "A network partition splits a distributed system into groups that cannot communicate. Example: two data centers lose their network link. Without partition tolerance: one side shuts down (refuses requests) to avoid inconsistency. With partition tolerance but choosing consistency: nodes on the 'wrong side' stop serving requests. With partition tolerance choosing availability: all nodes serve requests, but may return stale/inconsistent data. Real systems allow tuning (Cassandra's consistency levels let you choose per-operation)."
},
{
  id: 339, section: "Advanced Topics",
  q: "What is a time-series database?",
  a: "A time-series database (TSDB) is optimized for storing and querying data points indexed by time — typically measurements or events recorded at regular intervals (metrics, sensor data, financial ticks, log events).",
  exp: "Characteristics: high write throughput (many data points per second), efficient range queries on time, automatic data retention/downsampling (compress old data), built-in time functions (rate of change, moving averages). Examples: InfluxDB, TimescaleDB (PostgreSQL extension), Prometheus, OpenTSDB, QuestDB. Use cases: IoT sensor data, server metrics (CPU, memory), financial market data, user activity streams. Traditional RDBMS can handle time-series but inefficiently at scale."
},
{
  id: 340, section: "Advanced Topics",
  q: "What is the difference between a data warehouse and a data mart?",
  a: "A data warehouse is an enterprise-wide repository of integrated historical data from multiple sources, supporting company-wide analytics. A data mart is a subset of the data warehouse focused on a specific subject area, department, or business function.",
  exp: "Data warehouse: centralized, large (terabytes to petabytes), integration from multiple sources, single source of truth, complex ETL processes, long build time. Data mart: smaller, focused (Sales data mart, Finance data mart), faster to build, may be a subset of DW (dependent) or independently loaded (independent). Organizations often build data marts first (for quick wins), then integrate into a centralized data warehouse (Kimball's 'Bottom-Up' vs. Inmon's 'Top-Down' approach)."
},
{
  id: 341, section: "Advanced SQL",
  q: "What is the DECODE function in Oracle SQL?",
  a: "DECODE is an Oracle SQL function that performs a case/switch-like evaluation. Syntax: DECODE(expression, search1, result1, search2, result2, ..., default). It compares expression to each search value and returns the corresponding result.",
  exp: "DECODE(status, 1, 'Active', 2, 'Inactive', 3, 'Pending', 'Unknown') — equivalent to CASE WHEN status=1 THEN 'Active' WHEN status=2 THEN 'Inactive' ... ELSE 'Unknown' END. DECODE handles NULL: DECODE(NULL, NULL, 'is null', 'not null') returns 'is null' (unlike =). DECODE is Oracle-specific; CASE WHEN is the ANSI standard equivalent supported by all major DBMS."
},
{
  id: 342, section: "Advanced SQL",
  q: "What is the NVL function in Oracle and its equivalents?",
  a: "NVL(value, default) is Oracle's function for substituting NULL with a default value. If value is NULL, it returns default; otherwise it returns value. Equivalents: ISNULL(value, default) in SQL Server, COALESCE(value, default) in standard SQL.",
  exp: "NVL(commission, 0) returns 0 if commission is NULL, otherwise returns commission. NVL2(expression, if_not_null, if_null) is a related Oracle function: if expression is NOT NULL, return if_not_null; if NULL, return if_null. COALESCE is the preferred cross-DBMS option: COALESCE(a, b, c) returns the first non-NULL of a, b, c. NULLIF(a, b) returns NULL if a=b, else a — the inverse."
},
{
  id: 343, section: "Advanced SQL",
  q: "What are SQL set operations and their requirements?",
  a: "SQL set operations (UNION, INTERSECT, EXCEPT/MINUS) combine result sets from two queries. Requirements: both queries must have the same number of columns, and corresponding columns must have compatible data types.",
  exp: "UNION (removes duplicates), UNION ALL (keeps all), INTERSECT (common rows), EXCEPT/MINUS (rows in first but not second). All are set operations — the result's column names come from the first query. Set operations don't require table relationships (unlike joins). ORDER BY can only appear at the end (applies to the final result). Useful for: combining data from multiple tables with the same schema, comparing datasets."
},
{
  id: 344, section: "Advanced SQL",
  q: "What is a recursive CTE and how does it terminate?",
  a: "A recursive CTE uses WITH RECURSIVE (or WITH in SQL Server) and consists of an anchor member (base case, non-recursive) UNION ALL'd with a recursive member that references the CTE itself. It terminates when the recursive member returns no rows.",
  exp: "WITH RECURSIVE emp_hierarchy AS (SELECT id, name, manager_id, 1 AS level FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id, h.level+1 FROM employees e JOIN emp_hierarchy h ON e.manager_id = h.id) SELECT * FROM emp_hierarchy. Termination: when the join in the recursive member finds no new rows. Safety: most DBMS support MAXRECURSION limit to prevent infinite loops from cyclic data."
},
{
  id: 345, section: "Advanced SQL",
  q: "What is the CONNECT BY clause in Oracle?",
  a: "Oracle's CONNECT BY clause is used for hierarchical queries, traversing parent-child relationships. It predates standard recursive CTEs and provides Oracle-specific functions like LEVEL, SYS_CONNECT_BY_PATH, and CONNECT_BY_ROOT.",
  exp: "SELECT LEVEL, LPAD(' ', 2*(LEVEL-1)) || name AS org_chart FROM employees START WITH manager_id IS NULL CONNECT BY PRIOR id = manager_id. LEVEL: depth in hierarchy (1=root). SYS_CONNECT_BY_PATH(name, '/'): path from root to current node. CONNECT_BY_ROOT: value of the root row. PRIOR operator links child to parent. Still widely used in Oracle shops; standard SQL equivalent is WITH RECURSIVE CTE."
},
{
  id: 346, section: "Normalization",
  q: "What is Domain/Key Normal Form (DKNF)?",
  a: "Domain/Key Normal Form (DKNF) is the 'ultimate' normal form proposed by Fagin (1981). A relation is in DKNF if every constraint on the relation is a logical consequence of domain constraints and key constraints alone.",
  exp: "DKNF implies all other normal forms (1NF through 5NF). If every possible database constraint can be expressed as a domain constraint (column type/range) or key constraint (uniqueness), then no update anomalies are possible. Theoretical rather than practical: determining whether a relation is in DKNF is undecidable in general. In practice, 3NF or BCNF is the target for most real-world database designs."
},
{
  id: 347, section: "ER Model",
  q: "What is a derived attribute in ER modeling?",
  a: "A derived attribute is one whose value can be computed from other attributes in the database rather than being stored directly. In ER diagrams, derived attributes are shown with dashed ovals.",
  exp: "Example: 'Age' derived from 'DateOfBirth' (current date minus DOB). 'TotalOrderValue' derived from SUM of OrderItem prices. Two choices: compute at query time (saves storage, always current) or materialize (store the computed value — improves read performance but needs maintenance). Most DBMS implement derived attributes as computed/virtual columns: CREATE TABLE emp (dob DATE, age INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM dob)) VIRTUAL)."
},
{
  id: 348, section: "ER Model",
  q: "What is the difference between total and partial specialization?",
  a: "Total specialization: every entity in the supertype must belong to at least one subtype (e.g. every Vehicle is either a Car, Truck, or Motorcycle). Partial specialization: an entity in the supertype does not have to belong to any subtype (e.g. a Person can be a Student or Employee, or just a generic Person).",
  exp: "In ER diagrams, total specialization is shown with a double line, while partial specialization uses a single line. Enforced in databases using constraints or polymorphic tables."
}
];