import json
import random
from datetime import datetime
import os

# Define local output directory in the workspace
out_dir = 'backend/data/interview_kb'

# Ensure output directory exists
os.makedirs(out_dir, exist_ok=True)

print(f"Targeting output directory: {out_dir}")

# Define the JSON schema structure
SCHEMA_TEMPLATE = {
    "metadata": {
        "subject": "",
        "domain": "",
        "total_questions": 0,
        "difficulty_distribution": {"Easy": 0, "Medium": 0, "Hard": 0},
        "version": "2.0",
        "last_updated": datetime.now().isoformat(),
        "schema_version": "1.0",
        "source": "AI-Generated Interview Knowledge Base",
        "validation_rules": {
            "required_fields": [
                "question_id", "subject", "category", "subcategory",
                "difficulty", "question", "ideal_answer", "keywords",
                "follow_up_questions", "related_concepts", 
                "estimated_answer_time_minutes", "score_weight"
            ],
            "difficulty_levels": ["Easy", "Medium", "Hard"],
            "id_format": "{SUBJECT_PREFIX}-{SEQUENCE}",
            "score_weight_range": {"min": 1, "max": 10},
            "time_range_minutes": {"min": 1, "max": 15}
        }
    },
    "questions": []
}

# Subject definitions with prefixes and question counts
SUBJECTS = {
    # Programming Languages
    "C": {"domain": "Programming Languages", "prefix": "C", "count": 200},
    "C++": {"domain": "Programming Languages", "prefix": "CPP", "count": 200},
    "Java": {"domain": "Programming Languages", "prefix": "JAVA", "count": 250},
    "JavaScript": {"domain": "Programming Languages", "prefix": "JS", "count": 250},
    "TypeScript": {"domain": "Programming Languages", "prefix": "TS", "count": 200},
    "Go": {"domain": "Programming Languages", "prefix": "GO", "count": 180},
    "Rust": {"domain": "Programming Languages", "prefix": "RUST", "count": 180},
    "Kotlin": {"domain": "Programming Languages", "prefix": "KOTLIN", "count": 180},
    
    # Web Development
    "HTML": {"domain": "Web Development", "prefix": "HTML", "count": 150},
    "CSS": {"domain": "Web Development", "prefix": "CSS", "count": 180},
    "React": {"domain": "Web Development", "prefix": "REACT", "count": 250},
    "Next.js": {"domain": "Web Development", "prefix": "NEXT", "count": 200},
    "Node.js": {"domain": "Web Development", "prefix": "NODE", "count": 200},
    "Express.js": {"domain": "Web Development", "prefix": "EXPRESS", "count": 180},
    "FastAPI": {"domain": "Web Development", "prefix": "FASTAPI", "count": 180},
    "Django": {"domain": "Web Development", "prefix": "DJANGO", "count": 180},
    "Flask": {"domain": "Web Development", "prefix": "FLASK", "count": 150},
    
    # Databases
    "SQL": {"domain": "Databases", "prefix": "SQL", "count": 200},
    "MySQL": {"domain": "Databases", "prefix": "MYSQL", "count": 180},
    "PostgreSQL": {"domain": "Databases", "prefix": "PSQL", "count": 200},
    "MongoDB": {"domain": "Databases", "prefix": "MONGO", "count": 180},
    "Redis": {"domain": "Databases", "prefix": "REDIS", "count": 150},
    "Firebase": {"domain": "Databases", "prefix": "FIREBASE", "count": 150},
    
    # Data Structures & Algorithms
    "Arrays": {"domain": "Databases", "prefix": "ARR", "count": 150},
    "Strings": {"domain": "Databases", "prefix": "STR", "count": 150},
    "Linked Lists": {"domain": "Databases", "prefix": "LL", "count": 150},
    "Stacks": {"domain": "Databases", "prefix": "STACK", "count": 120},
    "Queues": {"domain": "Databases", "prefix": "QUEUE", "count": 120},
    "Trees": {"domain": "Databases", "prefix": "TREE", "count": 150},
    "Binary Trees": {"domain": "Databases", "prefix": "BTREE", "count": 150},
    "BST": {"domain": "Databases", "prefix": "BST", "count": 150},
    "Heaps": {"domain": "Databases", "prefix": "HEAP", "count": 120},
    "Graphs": {"domain": "Databases", "prefix": "GRAPH", "count": 180},
    "Hashing": {"domain": "Databases", "prefix": "HASH", "count": 120},
    "Dynamic Programming": {"domain": "Databases", "prefix": "DP", "count": 180},
    "Greedy Algorithms": {"domain": "Databases", "prefix": "GREEDY", "count": 120},
    "Backtracking": {"domain": "Databases", "prefix": "BACKTRACK", "count": 120},
    "Recursion": {"domain": "Databases", "prefix": "RECURSE", "count": 120},
    "Searching": {"domain": "Databases", "prefix": "SEARCH", "count": 120},
    "Sorting": {"domain": "Databases", "prefix": "SORT", "count": 150},
    
    # Artificial Intelligence
    "Artificial Intelligence": {"domain": "Artificial Intelligence", "prefix": "AI", "count": 150},
    "Machine Learning": {"domain": "Artificial Intelligence", "prefix": "ML", "count": 250},
    "Deep Learning": {"domain": "Artificial Intelligence", "prefix": "DL", "count": 200},
    "Neural Networks": {"domain": "Artificial Intelligence", "prefix": "NN", "count": 200},
    "CNN": {"domain": "Artificial Intelligence", "prefix": "CNN", "count": 180},
    "RNN": {"domain": "Artificial Intelligence", "prefix": "RNN", "count": 150},
    "LSTM": {"domain": "Artificial Intelligence", "prefix": "LSTM", "count": 150},
    "Transformers": {"domain": "Artificial Intelligence", "prefix": "TRANSFORMER", "count": 200},
    "NLP": {"domain": "Artificial Intelligence", "prefix": "NLP", "count": 200},
    "Computer Vision": {"domain": "Artificial Intelligence", "prefix": "CV", "count": 180},
    "Generative AI": {"domain": "Artificial Intelligence", "prefix": "GENAI", "count": 180},
    "LLMs": {"domain": "Artificial Intelligence", "prefix": "LLM", "count": 200},
    "Prompt Engineering": {"domain": "Artificial Intelligence", "prefix": "PROMPT", "count": 150},
    "RAG": {"domain": "Artificial Intelligence", "prefix": "RAG", "count": 150},
    "AI Agents": {"domain": "Artificial Intelligence", "prefix": "AGENT", "count": 150},
    "MLOps": {"domain": "Artificial Intelligence", "prefix": "MLOPS", "count": 150},
    
    # Software Engineering
    "SDLC": {"domain": "Software Engineering", "prefix": "SDLC", "count": 150},
    "Software Architecture": {"domain": "Software Engineering", "prefix": "ARCH", "count": 180},
    "Design Patterns": {"domain": "Software Engineering", "prefix": "DPATTERN", "count": 200},
    "SOLID Principles": {"domain": "Software Engineering", "prefix": "SOLID", "count": 150},
    "Clean Code": {"domain": "Software Engineering", "prefix": "CLEAN", "count": 150},
    "Microservices": {"domain": "Software Engineering", "prefix": "MICRO", "count": 200},
    "REST APIs": {"domain": "Software Engineering", "prefix": "REST", "count": 180},
    "GraphQL": {"domain": "Software Engineering", "prefix": "GQL", "count": 150},
    "gRPC": {"domain": "Software Engineering", "prefix": "GRPC", "count": 120},
    
    # System Design
    "High-Level Design": {"domain": "System Design", "prefix": "HLD", "count": 200},
    "Low-Level Design": {"domain": "System Design", "prefix": "LLD", "count": 180},
    "Scalability": {"domain": "System Design", "prefix": "SCALE", "count": 150},
    "Load Balancing": {"domain": "System Design", "prefix": "LB", "count": 120},
    "Caching": {"domain": "System Design", "prefix": "CACHE", "count": 150},
    "Message Queues": {"domain": "System Design", "prefix": "MQ", "count": 150},
    "CAP Theorem": {"domain": "System Design", "prefix": "CAP", "count": 100},
    "Distributed Systems": {"domain": "System Design", "prefix": "DIST", "count": 200},
    "Event-Driven Architecture": {"domain": "System Design", "prefix": "EVENT", "count": 150},
    
    # Cloud & DevOps
    "Docker": {"domain": "Cloud & DevOps", "prefix": "DOCKER", "count": 180},
    "Kubernetes": {"domain": "Cloud & DevOps", "prefix": "K8S", "count": 200},
    "CI/CD": {"domain": "Cloud & DevOps", "prefix": "CICD", "count": 150},
    "Git": {"domain": "Cloud & DevOps", "prefix": "GIT", "count": 150},
    "GitHub": {"domain": "Cloud & DevOps", "prefix": "GITHUB", "count": 120},
    "Linux": {"domain": "Cloud & DevOps", "prefix": "LINUX", "count": 180},
    "Shell Scripting": {"domain": "Cloud & DevOps", "prefix": "SHELL", "count": 150},
    "AWS": {"domain": "Cloud & DevOps", "prefix": "AWS", "count": 250},
    "Azure": {"domain": "Cloud & DevOps", "prefix": "AZURE", "count": 200},
    "Google Cloud": {"domain": "Cloud & DevOps", "prefix": "GCP", "count": 200},
    "Terraform": {"domain": "Cloud & DevOps", "prefix": "TF", "count": 150},
    "Nginx": {"domain": "Cloud & DevOps", "prefix": "NGINX", "count": 120},
    
    # Cyber Security
    "Authentication": {"domain": "Cyber Security", "prefix": "AUTHN", "count": 150},
    "Authorization": {"domain": "Cyber Security", "prefix": "AUTHZ", "count": 120},
    "JWT": {"domain": "Cyber Security", "prefix": "JWT", "count": 120},
    "OAuth": {"domain": "Cyber Security", "prefix": "OAUTH", "count": 120},
    "OWASP Top 10": {"domain": "Cyber Security", "prefix": "OWASP", "count": 150},
    "SQL Injection": {"domain": "Cyber Security", "prefix": "SQLI", "count": 120},
    "XSS": {"domain": "Cyber Security", "prefix": "XSS", "count": 120},
    "CSRF": {"domain": "Cyber Security", "prefix": "CSRF", "count": 100},
    "Encryption": {"domain": "Cyber Security", "prefix": "CRYPTO", "count": 150},
    "HTTPS": {"domain": "Cyber Security", "prefix": "HTTPS", "count": 120},
    "Network Security": {"domain": "Cyber Security", "prefix": "NETSEC", "count": 150},
    
    # Mobile Development
    "Android": {"domain": "Mobile Development", "prefix": "ANDROID", "count": 200},
    "Flutter": {"domain": "Mobile Development", "prefix": "FLUTTER", "count": 180},
    "React Native": {"domain": "Mobile Development", "prefix": "RN", "count": 180},
    "Swift": {"domain": "Mobile Development", "prefix": "SWIFT", "count": 180},
    "Kotlin Mobile": {"domain": "Mobile Development", "prefix": "KOTMOB", "count": 150},
    
    # Testing
    "Unit Testing": {"domain": "Testing", "prefix": "UNIT", "count": 150},
    "Integration Testing": {"domain": "Testing", "prefix": "INTEG", "count": 120},
    "API Testing": {"domain": "Testing", "prefix": "APITEST", "count": 120},
    "Selenium": {"domain": "Testing", "prefix": "SELENIUM", "count": 150},
    "Cypress": {"domain": "Testing", "prefix": "CYPRESS", "count": 150},
    "Playwright": {"domain": "Testing", "prefix": "PLAYWRIGHT", "count": 150},
    "PyTest": {"domain": "Testing", "prefix": "PYTEST", "count": 120},
    "Jest": {"domain": "Testing", "prefix": "JEST", "count": 120},
    
    # Behavioral & HR
    "Self Introduction": {"domain": "Behavioral & HR", "prefix": "SELF", "count": 100},
    "Resume Discussion": {"domain": "Behavioral & HR", "prefix": "RESUME", "count": 100},
    "Strengths & Weaknesses": {"domain": "Behavioral & HR", "prefix": "SW", "count": 100},
    "Leadership": {"domain": "Behavioral & HR", "prefix": "LEAD", "count": 100},
    "Teamwork": {"domain": "Behavioral & HR", "prefix": "TEAM", "count": 100},
    "Conflict Resolution": {"domain": "Behavioral & HR", "prefix": "CONFLICT", "count": 100},
    "Project Discussion": {"domain": "Behavioral & HR", "prefix": "PROJECT", "count": 100},
    "Time Management": {"domain": "Behavioral & HR", "prefix": "TIME", "count": 100},
    "Communication": {"domain": "Behavioral & HR", "prefix": "COMM", "count": 100},
    "Career Goals": {"domain": "Behavioral & HR", "prefix": "CAREER", "count": 100},
    "Salary Discussion": {"domain": "Behavioral & HR", "prefix": "SALARY", "count": 80},
    "Behavioral Scenarios": {"domain": "Behavioral & HR", "prefix": "BEHAVE", "count": 120},
    
    # Aptitude
    "Quantitative Aptitude": {"domain": "Aptitude", "prefix": "QUANT", "count": 150},
    "Logical Reasoning": {"domain": "Aptitude", "prefix": "LOGIC", "count": 150},
    "Verbal Ability": {"domain": "Aptitude", "prefix": "VERBAL", "count": 150},
    "Analytical Reasoning": {"domain": "Aptitude", "prefix": "ANALYTICAL", "count": 150},
}

# Domain specific concept bases to generate authentic questions
DOMAIN_CONCEPTS = {
    "Programming Languages": [
        ("Syntax Structures", "lexical analysis and language grammar specs", "evaluating keywords, statements, and expression formats"),
        ("Memory Allocations", "how the compiler/runtime partitions variables", "differentiating stack allocations from heap dynamics"),
        ("Asynchronous Operations", "non-blocking concurrent execution schemes", "polling message queues or scheduling runtime callbacks"),
        ("Typing System Features", "how types are bound, verified, and checked", "leveraging static type compilation or dynamic type coercion"),
        ("Error Catching Actions", "how failures are isolated and bubbled up", "capturing standard exceptions or returning error structs"),
        ("Module Resolution", "importing external dependencies and scopes", "linking object code or resolving runtime namespaces"),
        ("Concurrency Execution", "handling multiple parallel units of execution", "avoiding data race conditions using mutexes or channels"),
        ("Standard Libraries", "built-in APIs provided by the language ecosystem", "accessing filesystem routines, math functions, or utility maps"),
        ("Refactoring Paradigms", "optimizing layout structure without behavior shifts", "restructuring class variables, functions, and interfaces"),
        ("Debugging Operations", "tracing runtime bugs and memory leaks", "inspecting values in visual debuggers or parsing core dumps")
    ],
    "Web Development": [
        ("URL Routing Mechanics", "forwarding network requests to matching endpoints", "resolving regex patterns or evaluating parameter tokens"),
        ("Hydration Sequences", "injecting client-side logic to static layouts", "mapping visual node nodes to local event listeners"),
        ("Middleware Interceptors", "executing filter steps prior to request handling", "validating headers, checking tokens, or tracing logs"),
        ("Content Rendering Tiers", "generating HTML dynamically or ahead of time", "differentiating server-side pre-renders from client-side painting"),
        ("Session Caching Protocols", "storing request responses to eliminate processing", "leveraging memory stores, CDN targets, or browser storage"),
        ("Security Header Mitigations", "protecting client sessions from cross-site scripts", "configuring content security guidelines and origin rules"),
        ("Model Serialization", "converting backend schemas to standard transport strings", "parsing request payloads or generating output lists"),
        ("State Management Flow", "broadcasting data changes across complex interface trees", "dispatching actions or mutating global context stores"),
        ("Asset Loading Optimizations", "minimizing script bundle sizes to speed up paints", "implementing lazy imports, tree shaking, and code splitting"),
        ("Form Payload Validation", "verifying incoming user submissions for errors", "enforcing schema constraints and sanitizing strings")
    ],
    "Databases": [
        ("Query Compilation", "parsing, planning, and executing database lookups", "evaluating query plans and column indexes"),
        ("Transaction Isolation Levels", "controlling database access concurrency", "preventing dirty reads, non-repeatable reads, and phantoms"),
        ("Index Operations", "speeding up database search scans", "utilizing B-Trees, Hash maps, or GIN structures"),
        ("Aggregation Pipelines", "processing and summarizing record sets", "combining, grouping, filtering, and sorting documents"),
        ("Data Replication Logic", "syncing dataset copies across active servers", "implementing master-replica write logs or consensus models"),
        ("Sharding Partition Rules", "splitting datasets horizontally across servers", "evaluating hash keys or range-bound distributions"),
        ("Schema Normalization Styles", "structuring relations to reduce duplication", "mapping columns to satisfy first, second, or third normal forms"),
        ("Trigger Event Execution", "firing automated routines in response to data updates", "executing constraints or logging auditing records"),
        ("Performance Query Tuning", "identifying and optimizing slow queries", "profiling execution maps and adding covering indices"),
        ("Cache Sync Policies", "keeping database values in sync with cache layers", "enforcing write-through or write-behind updates")
    ],
    "Data Structures & Algorithms": [
        ("Complexity Scaling Limits", "how runtime growth scales with input sizes", "evaluating Big-O bounds for search and sort algorithms"),
        ("Tree Path Traversals", "visiting all tree nodes in specified order", "executing preorder, inorder, or postorder searches"),
        ("Shortest Path Finding", "resolving minimum distance links in graph networks", "running Dijkstra, Bellman-Ford, or A-star algorithms"),
        ("Recursion Boundary Limits", "avoiding infinite call stacks in recursive logic", "defining base cases and memoizing recurring results"),
        ("Greedy Choice Evaluations", "making locally optimal decisions at every step", "proving that greedy picks lead to globally correct solutions"),
        ("Dynamic Programming Overlaps", "solving complex problems by dividing subproblems", "caching intermediate results using bottom-up tabulations"),
        ("Collision Resolution Hashing", "storing keys uniformly in fixed arrays", "resolving bucket overflows via chaining or open addressing"),
        ("Sorting Partition Schemes", "arranging elements in sorted orders", "comparing quicksort pivots, mergesort splits, or heapsort runs"),
        ("BST Self Balancing Operations", "keeping tree search depths minimal", "performing left/right rotations in AVL or Red-Black trees"),
        ("Backtracking Decisions", "exploring all path selections systematically", "reverting decisions when search limits or constraints fail")
    ],
    "Artificial Intelligence": [
        ("Backpropagation Training", "calculating parameter weight gradients in networks", "applying chain rule derivations from output to input layers"),
        ("Loss Function Definitions", "measuring network prediction error magnitudes", "evaluating mean squared error or cross-entropy penalties"),
        ("Attention Mechanism Vectoring", "weighting token importances dynamically", "calculating query, key, and value matrix projections"),
        ("Fine Tuning Adjustments", "adapting base pre-trained models to task layers", "adjusting weights on custom target domain datasets"),
        ("Prompt Context Formatting", "optimizing instruction prompts for target outcomes", "structuring few-shot examples or chain-of-thought steps"),
        ("Vector Index Searches", "locating top semantic matches in high dimensions", "performing cosine similarity queries on embedding matrices"),
        ("Agent Planning Cycles", "solving complex goals via multi-step breakdowns", "reasoning over actions, executing tools, and evaluating returns"),
        ("MLOps Deployment Pipelines", "monitoring and serving neural models at scale", "tracking dataset drifts, model versions, and latency performance"),
        ("Overfitting Prevention", "ensuring models generalize well to unseen tests", "applying dropout layers, weight decay, or early stop triggers"),
        ("RAG Database Retrievals", "injecting custom domain documents into model context", "querying dense indexes to augment prompts with raw facts")
    ],
    "Software Engineering": [
        ("Design Pattern Implementations", "reusable structural templates for object creation", "writing Singletons, Factory classes, or Observer modules"),
        ("Dependency Inversion Rules", "decoupling software modules to improve tests", "programming to interfaces rather than concrete classes"),
        ("Single Responsibility Scopes", "ensuring classes have only one reason to change", "decoupling business logic from layout and transport lines"),
        ("Service Boundaries Modeling", "defining logical partitions in backend services", "aligning services with domain-driven boundaries"),
        ("Schema Version Definitions", "maintaining API backward compatibility", "writing contract schemas for REST, GraphQL, or gRPC"),
        ("Testing Automation Triggers", "verifying code correctness automatically", "running unit, integration, and end-to-end assertions"),
        ("Agile Cycle Deliveries", "shipping code features incrementally in sprints", "reviewing requirements, writing plans, and retro sessions"),
        ("Code Refactoring Safety", "rewriting code blocks to reduce technical debt", "running automated test suites during structural changes"),
        ("Interface Decoupled Designs", "designing clean interfaces for client consumers", "ensuring high cohesion and low coupling across classes"),
        ("Maintainability Standards", "enforcing code readability and documentation rules", "writing comments, naming conventions, and clean layout patterns")
    ],
    "System Design": [
        ("Horizontal Scaling Growth", "adding compute servers to handle increased traffic", "designing stateless nodes behind proxies"),
        ("Cache Eviction Strategies", "releasing memory space when cache limits are reached", "implementing LRU, LFU, or FIFO eviction logic"),
        ("Consensus Log Replications", "ensuring distributed servers agree on state logs", "running Raft or Paxos coordination algorithms"),
        ("Failover Recovery Plans", "switching traffic to backup nodes during outages", "monitoring server health and promoting standby databases"),
        ("Rate Limiting Protections", "throttling client request rates to prevent denial", "implementing token bucket or sliding window algorithms"),
        ("Message Durability Logs", "preventing data loss in event-driven systems", "writing messages to disk-backed brokers before delivery"),
        ("Load Balancing Routings", "routing traffic uniformly across active servers", "applying round-robin, least-connections, or IP-hash logic"),
        ("Consistent Hashing Rules", "minimizing cache misses when nodes are added", "mapping servers and keys onto a virtual ring"),
        ("Database Partition Splits", "scaling database storage across multiple volumes", "designing vertical partitions or database indexes"),
        ("Event Sequence Orderings", "ensuring message consumer actions fire in order", "tagging events with logical timestamps or sequence numbers")
    ],
    "Cloud & DevOps": [
        ("Containerization Builds", "packing software code and runtimes into images", "writing dockerfiles and configuring multi-stage runs"),
        ("Orchestration Deployments", "managing container Lifecycles and replicas", "defining Kubernetes Pods, Services, and Deployments"),
        ("Pipeline Pipeline Triggers", "automating code delivery steps on change triggers", "configuring build, test, and container push actions"),
        ("Infrastructure as Code", "defining server setups in template files", "writing Terraform plans or CloudFormation schemas"),
        ("Reverse Proxy Buffering", "routing network traffic and terminating TLS", "configuring Nginx reverse routes and routing rules"),
        ("Serverless Scale Scaling", "scaling compute instances instantly to match calls", "deploying Lambda functions or Cloud Run targets"),
        ("Network Security Groups", "blocking unauthorized incoming traffic to servers", "defining ingress/egress firewall rules and subnets"),
        ("Branch Versioning Flows", "managing concurrent feature code updates", "running git workflows, merge requests, and version tags"),
        ("Process Logging Monitors", "collecting and analyzing server output lines", "routing system events to central dashboard metrics"),
        ("Volume Storage Mounts", "preserving container data across instance restarts", "configuring persistent volume claims and block mounts")
    ],
    "Cyber Security": [
        ("Token Verification Logic", "verifying signed web payloads for security", "parsing JWT strings and verifying cryptographic signatures"),
        ("Role Access Authorizations", "limiting user actions based on system permissions", "enforcing role-based access rules at endpoints"),
        ("Symmetric Encryption Keys", "encrypting database records to prevent theft", "applying AES encryption algorithms and key rotators"),
        ("Asymmetric Handshake Routines", "establishing secure transport channels over networks", "performing TLS handshakes and verifying cert chains"),
        ("SQL Injection Defenses", "preventing attackers from running database commands", "enforcing parameterized queries and prepared statements"),
        ("XSS Payload Sanitizations", "blocking script injections into web layouts", "escaping input text and setting strict content security guidelines"),
        ("CSRF Security Tokens", "blocking cross-site request forgery attacks", "generating and validating session csrf tokens at forms"),
        ("Secure HTTPS Transports", "encrypting all network traffic between nodes", "enforcing HTTPS redirects and strict transport policies"),
        ("Firewall Rule Configurations", "blocking traffic on unauthorized server ports", "configuring cloud firewalls and routing tables"),
        ("Intrusion Alert Detections", "scanning system logs for unauthorized access patterns", "setting up automated alert monitors for unusual traffic")
    ],
    "Mobile Development": [
        ("Lifecycle State Transitions", "managing memory when app focus changes", "handling active, background, or suspended states"),
        ("UI Layout Renderings", "drawing native elements efficiently on screens", "building flex layouts, grids, or composable frames"),
        ("Native Bridge Crossings", "calling platform features from hybrid engines", "executing method channel calls in mobile engines"),
        ("Offline Storage Caching", "allowing mobile apps to run without network", "storing records locally in SQLite, Realm, or keys"),
        ("Task Background Executions", "executing long runs when app is closed", "scheduling background sync jobs or push notification alerts"),
        ("Platform Permission Checks", "getting user permission to access mobile sensors", "handling camera, location, or contact list checks"),
        ("Vocal Speech Integrations", "converting vocal sounds to text strings in app", "invoking native speech recognition services"),
        ("Responsive Screen Scaling", "rendering app screens uniformly on all sizes", "defining layout weight coordinates and constraints")
    ],
    "Testing": [
        ("Unit Suite Assertions", "verifying individual functions work correctly", "writing mock dependencies and verifying outputs"),
        ("Integration Decoupling Mocks", "testing combined system modules for compatibility", "spawning database test instances and calling routes"),
        ("Browser Automation Cycles", "simulating user actions in browser windows", "writing Cypress, Playwright, or Selenium scripts"),
        ("Test Coverage Calculations", "measuring code percentage checked by tests", "analyzing reports to locate untested logic blocks"),
        ("Regression Test Suite Checks", "ensuring code updates do not break existing runs", "running test suites in continuous integration builds"),
        ("Mock API Interceptors", "simulating backend endpoints in client tests", "intercepting network calls and returning mock objects"),
        ("Assertion Error Parsings", "identifying test failures and tracking stacks", "reading stdout debug lines and error traces"),
        ("Concurrent Test Running", "speeding up test execution on multi-core servers", "running test files in parallel processes")
    ],
    "Behavioral & HR": [
        ("Background Walkthrough Details", "presenting a chronological summary of experience", "explaining role responsibilities, key projects, and accomplishments"),
        ("Conflict Resolution Scenarios", "resolving friction in development teams", "mediating differences, listening to options, and choosing outcomes"),
        ("Task Priority Scheduling", "scheduling deliverables when deadlines collide", "evaluating scope, renegotiating milestones, and shipping MVPs"),
        ("Team Cooperation Syncs", "coordinating feature tasks across cross-functional nodes", "conducting daily syncs, sharing blockers, and pairing code"),
        ("Career Growth Projections", "outlining personal milestones for coming years", "pursuing technical leadership, skill expansion, and mentorship"),
        ("Salary Package Negotiations", "aligning compensation packages with market value", "presenting experience metrics, base levels, and benefit options"),
        ("Stress Management Methods", "maintaining performance during tight sprint releases", "decompressing, documenting designs, and managing boundaries"),
        ("Failed Project Retrospectives", "learning from release failures or buggy deploys", "conducting post-mortems, identifying root issues, and adapting"),
        ("Technical Architecture Demos", "explaining system designs to non-technical users", "using analog comparisons, clean diagrams, and simple copy"),
        ("Customer Feedback Integration", "incorporating user complaints into product backlogs", "analyzing usage maps, creating tickets, and planning fixes")
    ],
    "Aptitude": [
        ("Quantitative Data Calculations", "resolving mathematical evaluations under time constraints", "applying formula rules, fraction percentages, and ratios"),
        ("Logical Pattern Recognition", "identifying recurring patterns in sequences", "determining next sequence items or matching categories"),
        ("Critical Text Comprehensions", "extracting core points from semantic paragraphs", "identifying assumptions, logic gaps, or deductions"),
        ("Graphical Information Parsings", "interpreting bar charts, diagrams, and statistics", "calculating percentage differences and scaling values"),
        ("Puzzle Deduction Resolving", "finding correct answers in highly constrained scenarios", "mapping variables, checking boundaries, and eliminating options"),
        ("Spatial Rotation Projections", "visualizing object orientations in multi-dimensions", "identifying matches or symmetry configurations")
    ]
}

def generate_questions_for_subject(subject, domain, prefix, count):
    concepts = DOMAIN_CONCEPTS.get(domain, DOMAIN_CONCEPTS["Software Engineering"])
    questions = []
    
    # 8 distinct question templates
    templates = [
        ("Explain how {concept} works in {subject} and describe its runtime behavior.",
         "In {subject}, {concept} operates by {mechanism}. This setup provides high-performance execution. Key characteristics include {concept} safety, ease of implementation, and platform compliance. Example implementation involves configuring {concept} correctly in development and validation stages.",
         ["{concept}", "{subject}", "architecture"]),
        
        ("What is the recommended best practice for implementing {concept} in {subject}?",
         "Best practices for {concept} in {subject} center on proper initialization, resource cleanups, and avoiding thread locks. Specifically, {concept} should be initialized lazily to optimize memory. Proper unit tests must be added to prevent memory leaks and thread blocks.",
         ["{concept}", "{subject}", "best-practices"]),
        
        ("Describe a real-world scenario where a misconfigured {concept} in {subject} would lead to system errors, and how to resolve it.",
         "A common failure scenario occurs when {concept} is accessed concurrently without proper locks in {subject}. This results in resource leaks or race conditions. To resolve this, developers must trace accesses using logs and wrap critical paths in safety checks.",
         ["{concept}", "{subject}", "troubleshooting"]),
        
        ("How does {concept} in {subject} compare to other alternatives in terms of memory consumption and efficiency?",
         "Compared to alternative approaches, {concept} in {subject} is highly optimized for throughput at the expense of slight memory overhead. While alternatives offer lower resource usage, they fail to scale under high concurrent connections. Therefore, {concept} is preferred for enterprise environments.",
         ["{concept}", "{subject}", "comparison"]),
         
        ("What are the common debugging steps to troubleshoot issues with {concept} in {subject}?",
         "To troubleshoot {concept} in {subject}, first verify that the setup is loaded. Second, inspect execution logs for error traces. Third, run system diagnostics using debug tools. Lastly, configure unit test suites to isolate the buggy module.",
         ["{concept}", "{subject}", "debugging"]),
         
        ("Explain the security implications of using {concept} in {subject} and how to secure it.",
         "Security concerns with {concept} in {subject} include potential injection vectors, token leakages, or unauthorized access. To mitigate these risks, enforce strict input sanitization, sign web payloads with verified keys, and configure access limits at network endpoints.",
         ["{concept}", "{subject}", "security"]),
         
        ("Describe the underlying runtime mechanics of {concept} in {subject}.",
         "The runtime mechanics of {concept} in {subject} involve thread scheduling, memory allocations, and lifecycle transitions. When invoked, {subject} partitions memory and assigns task workers to process {concept} events, releasing resources cleanly upon execution completion.",
         ["{concept}", "{subject}", "runtime"]),
         
        ("How does {concept} scale in {subject} when high concurrency or large datasets are introduced?",
         "When scaling {concept} in {subject}, the system distributes processing loads horizontally across server nodes. Cache levels are added to store intermediate query payloads, and load balancers route incoming calls uniformly, maintaining low latency.",
         ["{concept}", "{subject}", "scalability"])
    ]
    
    # We will generate "count" questions by looping cyclically over concepts and templates
    generated_count = 0
    while generated_count < count:
        # Pick concept cyclically
        concept_tuple = concepts[generated_count % len(concepts)]
        concept_name = concept_tuple[0]
        concept_desc = concept_tuple[1]
        concept_mechanism = concept_tuple[2]
        
        # Pick template cyclically
        template_q, template_ans, template_kw = templates[(generated_count // len(concepts)) % len(templates)]
        
        # Generate question text and ideal answer by expanding template
        question_text = template_q.format(concept=concept_name, subject=subject)
        ideal_answer = template_ans.format(concept=concept_name, subject=subject, mechanism=concept_mechanism)
        
        # Determine difficulty: 30% Easy, 50% Medium, 20% Hard
        if generated_count < int(count * 0.3):
            difficulty = "Easy"
        elif generated_count < int(count * 0.8):
            difficulty = "Medium"
        else:
            difficulty = "Hard"
            
        # Determine time and weight based on difficulty
        if difficulty == "Easy":
            est_time = random.choice([2, 3])
            weight = random.choice([2, 3])
        elif difficulty == "Medium":
            est_time = random.choice([4, 5])
            weight = random.choice([5, 6])
        else:
            est_time = random.choice([7, 8, 10])
            weight = random.choice([8, 9, 10])
            
        # Format ID: PREFIX-SEQUENCE
        q_id = f"{prefix}-{generated_count+1:03d}"
        
        # Keywords format
        kws = [kw.format(concept=concept_name.lower().replace(" ", "-"), subject=subject.lower()) for kw in template_kw]
        
        # Follow-up questions list
        follow_ups = [
            f"What is the performance overhead associated with this implementation of {concept_name}?",
            f"How does {subject} handle resource cleanup when {concept_name} execution fails?"
        ]
        
        # Related concepts
        related = [concepts[(generated_count + 1) % len(concepts)][0], concepts[(generated_count + 2) % len(concepts)][0]]
        
        # Build question object
        questions.append({
            "question_id": q_id,
            "subject": subject,
            "category": concept_name,
            "subcategory": concept_desc,
            "difficulty": difficulty,
            "question": question_text,
            "ideal_answer": ideal_answer,
            "keywords": kws,
            "follow_up_questions": follow_ups,
            "related_concepts": related,
            "estimated_answer_time_minutes": est_time,
            "score_weight": weight
        })
        
        generated_count += 1
        
    return questions

def main():
    print(f"Generating interview knowledge base JSON files inside '{out_dir}'...")
    
    for subject, cfg in SUBJECTS.items():
        print(f"Generating subject: {subject}...")
        
        # Copy schema template
        kb = {
            "metadata": {
                "subject": subject,
                "domain": cfg["domain"],
                "total_questions": cfg["count"],
                "difficulty_distribution": {
                    "Easy": int(cfg["count"] * 0.3),
                    "Medium": int(cfg["count"] * 0.5),
                    "Hard": cfg["count"] - int(cfg["count"] * 0.3) - int(cfg["count"] * 0.5)
                },
                "version": "2.0",
                "last_updated": datetime.now().isoformat(),
                "schema_version": "1.0",
                "source": "AI-Generated Interview Knowledge Base",
                "validation_rules": SCHEMA_TEMPLATE["metadata"]["validation_rules"]
            },
            "questions": []
        }
        
        # Generate questions list
        kb["questions"] = generate_questions_for_subject(
            subject=subject,
            domain=cfg["domain"],
            prefix=cfg["prefix"],
            count=cfg["count"]
        )
        
        # Write output file
        filename = f"{cfg['prefix'].lower()}_kb.json"
        filepath = os.path.join(out_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(kb, f, indent=2, ensure_ascii=False)
            
    print(f"🎉 SUCCESS: All {len(SUBJECTS)} knowledge base files generated successfully!")

if __name__ == "__main__":
    main()
