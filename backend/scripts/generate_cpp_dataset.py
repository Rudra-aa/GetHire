import json
import hashlib
import random
from pathlib import Path
from datetime import datetime, timezone

# ============================================
# TOPIC MAPS - Detailed question frameworks
# ============================================

TOPIC_MAPS = {
    # === PROGRAMMING LANGUAGES ===
    "C": {
        "categories": ["Fundamentals", "Memory Management", "Pointers", "Data Structures in C", "Advanced C", "System Programming", "Compiler Behavior", "Best Practices"],
        "subcategories": {
            "Fundamentals": ["Syntax", "Data Types", "Operators", "Control Flow", "Functions", "Preprocessor"],
            "Memory Management": ["Stack vs Heap", "malloc/free", "Memory Leaks", "Buffer Management"],
            "Pointers": ["Pointer Basics", "Pointer Arithmetic", "Function Pointers", "Double Pointers", "Pointer to Arrays"],
            "Data Structures in C": ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees"],
            "Advanced C": ["Bit Manipulation", "Volatile", "Inline Assembly", "Memory Alignment"],
            "System Programming": ["File I/O", "Process Management", "Signals", "IPC"],
            "Compiler Behavior": ["Undefined Behavior", "Sequence Points", "Optimization", "Storage Classes"],
            "Best Practices": ["Coding Standards", "Debugging", "Error Handling", "Portability"]
        },
        "concepts": {
            "Fundamentals": [
                ("static keyword", "a storage class specifier", "controlling variable lifetime and scope", "persistent storage across function calls, internal linkage", "static int count = 0;", "misunderstanding linkage vs lifetime"),
                ("const qualifier", "a type qualifier", "preventing modification of variables", "read-only access, compiler optimizations", "const int MAX = 100;", "const pointer vs pointer to const confusion"),
                ("volatile keyword", "a type qualifier", "telling compiler not to optimize access", "hardware registers, signal handlers, multi-threaded variables", "volatile int flag = 0;", "overusing volatile for thread safety"),
                ("extern keyword", "a storage class", "declaring variables defined elsewhere", "global scope, cross-file linkage", "extern int global_var;", "defining vs declaring confusion"),
                ("typedef", "a keyword for type aliasing", "creating new type names", "improved readability, abstraction", "typedef unsigned int uint32_t;", "hiding pointer types in typedef"),
                ("struct vs union", "composite data types", "grouping related data", "struct: sum of members, union: shared memory", "struct Point {int x, y;};", "union type punning and aliasing rules"),
                ("enum", "user-defined type", "named integer constants", "type safety, readable code", "enum Color {RED, GREEN, BLUE};", "enum size implementation-defined"),
                ("sizeof operator", "compile-time operator", "determining size of types/objects", "platform-dependent, excludes flexible array members", "sizeof(int) on 32-bit vs 64-bit", "using sizeof on pointers vs arrays"),
                ("type casting", "explicit conversion", "converting between types", "truncation, sign extension, pointer casting", "(int*)ptr vs (void*)ptr", "undefined behavior in invalid casts"),
                ("header guards", "preprocessor technique", "preventing multiple inclusion", "#ifndef, #define, #endif pattern", "#ifndef HEADER_H\n#define HEADER_H", "pragma once portability"),
            ],
            "Memory Management": [
                ("malloc vs calloc", "memory allocation functions", "allocating dynamic memory", "malloc: uninitialized, calloc: zero-initialized", "int* arr = calloc(10, sizeof(int));", "not checking return value for NULL"),
                ("realloc", "memory resizing function", "changing size of allocated block", "may move data, preserves contents", "arr = realloc(arr, new_size);", "memory leak if realloc fails"),
                ("free", "memory deallocation", "releasing heap memory", "undefined behavior on double-free, use-after-free", "free(ptr); ptr = NULL;", "dangling pointers after free"),
                ("memory leak", "unreachable allocated memory", "gradual memory consumption", "lost pointers, missing free calls", "void leak() { malloc(100); }", "valgrind, address sanitizer detection"),
                ("stack overflow", "exceeding stack limit", "recursive calls, large local arrays", "segmentation fault, program crash", "int arr[1000000]; // on stack", "move large arrays to heap"),
                ("buffer overflow", "writing past buffer bounds", "security vulnerability", "stack smashing, code injection", "char buf[10]; strcpy(buf, 'very long string');", "use strncpy, fgets, bounded functions"),
                ("memory fragmentation", "non-contiguous free blocks", "inefficient memory utilization", "external fragmentation in heap", "frequent small allocations", "memory pools, custom allocators"),
                ("mmap", "memory mapping", "mapping files/ devices to memory", "shared memory, lazy loading", "mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);", "munmap synchronization"),
            ],
            "Pointers": [
                ("pointer arithmetic", "arithmetic on addresses", "navigating arrays/ buffers", "scales by sizeof(type)", "*(arr + i) == arr[i]", "going out of bounds"),
                ("function pointers", "pointers to functions", "callbacks, polymorphism", "type signature must match", "int (*cmp)(const void*, const void*);", "syntax complexity, casting issues"),
                ("void pointer", "generic pointer type", "type-erased data handling", "cannot be dereferenced directly", "void* generic_data;", "casting required before use"),
                ("NULL pointer", "pointer to nothing", "indicating invalid/ uninitialized state", "dereference causes segfault", "if (ptr == NULL) return;", "NULL vs 0 vs (void*)0"),
                ("dangling pointer", "pointer to freed memory", "use-after-free vulnerability", "crash or data corruption", "free(ptr); ... *ptr = 5;", "set to NULL after free"),
                ("pointer to pointer", "indirect addressing", "modifying pointers in functions", "2D arrays, dynamic matrices", "void allocate(int** arr, int n);", "multiple levels of indirection confusion"),
                ("const pointer vs pointer to const", "different const placements", "varying mutability", "const int* p: data const, int* const p: pointer const", "const int* const p;", "reading declarations right-to-left"),
            ],
            "Advanced C": [
                ("bit fields", "packed struct members", "memory-efficient flags", "implementation-defined alignment", "struct { unsigned int flag:1; };", "endianness issues"),
                ("flexible array members", "unsized array at struct end", "variable-length structures", "sizeof excludes FAM", "struct { int len; int data[]; };", "must allocate manually"),
                ("restrict keyword", "pointer aliasing hint", "compiler optimization enablement", "promise of non-overlapping access", "void copy(int* restrict dst, const int* restrict src);", "violating restrict contract"),
                ("alignment", "memory address divisibility", "hardware requirements", "_Alignas, _Alignof", "_Alignas(64) char buffer[1024];", "unaligned access performance penalty"),
                ("inline functions", "function expansion at call site", "eliminating call overhead", "compiler hint, not command", "static inline int max(int a, int b) { return a>b?a:b; }", "code bloat, ODR violations"),
            ],
            "System Programming": [
                ("file descriptors", "integer handles for I/O", "kernel resource abstraction", "0: stdin, 1: stdout, 2: stderr", "int fd = open('file.txt', O_RDONLY);", "fd leak on exception paths"),
                ("fork()", "process creation", "duplicating process", "copy-on-write, returns PID", "pid_t pid = fork(); if (pid == 0) { /* child */ }", "zombie processes, wait() necessity"),
                ("exec family", "program execution", "replacing process image", "execl, execv, execvp variants", "execl('/bin/ls', 'ls', '-l', NULL);", "environment inheritance"),
                ("signals", "asynchronous notifications", "inter-process communication", "SIGINT, SIGSEGV, SIGKILL", "signal(SIGINT, handler);", "reentrancy, signal safety"),
                ("pipes", "unidirectional data channels", "inter-process communication", "anonymous and named pipes", "pipe(fd); write(fd[1], data, len);", "blocking behavior, buffer limits"),
            ],
        }
    },
    
    "C++": {
        "categories": ["Fundamentals", "OOP in C++", "STL", "Memory Management", "Modern C++", "Templates", "Concurrency", "Best Practices"],
        "subcategories": {
            "Fundamentals": ["References", "Namespaces", "Operator Overloading", "Type System"],
            "OOP in C++": ["Classes", "Inheritance", "Polymorphism", "Virtual Functions", "Constructors/Destructors"],
            "STL": ["Containers", "Iterators", "Algorithms", "Functors", "Adapters"],
            "Memory Management": ["Smart Pointers", "RAII", "Move Semantics", "Memory Pools"],
            "Modern C++": ["C++11/14/17/20/23", "Auto", "Lambda", "constexpr", "Concepts"],
            "Templates": ["Function Templates", "Class Templates", "Template Metaprogramming", "SFINAE"],
            "Concurrency": ["Threads", "Mutexes", "Condition Variables", "Atomic Operations", "Thread Pool"],
            "Best Practices": ["Rule of Three/Five/Zero", "SOLID in C++", "Exception Safety", "Performance"]
        },
        "concepts": {
            "Fundamentals": [
                ("references vs pointers", "alias mechanisms", "indirect access", "references: non-null, non-reseatable, safer; pointers: flexible, nullable", "int& ref = x; int* ptr = &x;", "reference to temporary lifetime"),
                ("name mangling", "compiler symbol encoding", "supporting function overloading", "encodes parameter types in symbol names", "_Z3foov vs _Z3fooi", "extern C for C linkage"),
                ("operator overloading", "custom operator behavior", "intuitive syntax for user types", "cannot overload . ?: :: sizeof", "Complex operator+(const Complex& a, const Complex& b)", "overloading && and || losing short-circuit"),
                ("copy constructor", "object duplication", "deep vs shallow copy", "called on initialization from same type", "Class(const Class& other);", "self-assignment, rule of three"),
                ("assignment operator", "object reassignment", "copy-and-swap idiom", "returns reference to self", "Class& operator=(Class other) { swap(*this, other); return *this; }", "exception safety levels"),
            ],
            "OOP in C++": [
                ("virtual functions", "dynamic dispatch mechanism", "runtime polymorphism", "vtable/vptr implementation", "virtual void draw() = 0;", "virtual destructor necessity"),
                ("pure virtual functions", "abstract interface methods", "defining interfaces", "makes class abstract", "virtual void method() = 0;", "cannot instantiate abstract class"),
                ("multiple inheritance", "inheriting from multiple bases", "combining interfaces/ functionality", "diamond problem ambiguity", "class D : public B, public C {}", "virtual inheritance resolution"),
                ("virtual inheritance", "shared base class instance", "diamond problem solution", "single subobject of virtual base", "class B : virtual public A {}", "initialization order complexity"),
                ("RTTI", "Run-Time Type Information", "type identification at runtime", "typeid, dynamic_cast", "if (typeid(*obj) == typeid(Derived))", "performance overhead, design alternatives"),
                ("constructor initialization list", "member initialization syntax", "efficient construction", "required for const members, references, base classes", "Class() : member(val), base(val) {}", "order follows declaration, not list"),
                ("destructor", "cleanup method", "resource release", "virtual for base classes", "virtual ~Base() = default;", "exception throwing from destructors"),
            ],
            "STL": [
                ("vector", "dynamic array container", "contiguous storage, random access", "amortized O(1) push_back, O(n) insert", "std::vector<int> v; v.push_back(5);", "iterator invalidation on reallocation"),
                ("map vs unordered_map", "associative containers", "key-value storage", "map: O(log n) tree, ordered; unordered_map: O(1) hash, unordered", "std::map<std::string, int> m;", "hash function quality, bucket count"),
                ("iterators", "container position abstraction", "uniform access pattern", "input, output, forward, bidirectional, random access", "std::vector<int>::iterator it = v.begin();", "iterator invalidation rules"),
                ("algorithm library", "generic algorithms", "reusable operations on ranges", "sort, find, transform, accumulate", "std::sort(v.begin(), v.end());", "custom comparator, execution policies"),
                ("functors", "function objects", "stateful callbacks", "operator() overloading", "struct Compare { bool operator()(int a, int b) { return a > b; } };", "vs function pointers, lambda superiority"),
            ],
            "Memory Management": [
                ("smart pointers", "RAII memory wrappers", "automatic lifetime management", "unique_ptr, shared_ptr, weak_ptr", "std::unique_ptr<int> p = std::make_unique<int>(5);", "circular references with shared_ptr"),
                ("RAII", "Resource Acquisition Is Initialization", "binding resource lifetime to object lifetime", "automatic cleanup, exception safety", "std::lock_guard<std::mutex> lock(mtx);", "deterministic destruction"),
                ("move semantics", "resource transfer without copy", "performance optimization", "rvalue references, std::move", "std::vector<int> v2 = std::move(v1);", "moved-from state validity"),
                ("rvalue references", "references to temporaries", "enabling move semantics", "T&&, forwarding references", "void foo(int&& x); foo(5);", "universal references, perfect forwarding"),
                ("std::move vs std::forward", "value category manipulation", "transferring values efficiently", "move: unconditionally cast to rvalue; forward: preserve value category", "std::forward<T>(arg)", "using move when forward needed"),
            ],
            "Modern C++": [
                ("auto keyword", "type inference", "reducing verbosity", "deduced at compile time", "auto it = vec.begin();", "auto with initializer lists"),
                ("lambda expressions", "anonymous functions", "inline function objects", "capture list, parameters, body", "auto lambda = [](int x) { return x * 2; };", "capture by reference vs value"),
                ("constexpr", "compile-time evaluation", "constant expressions", "C++11: single return, C++14: multiple statements", "constexpr int factorial(int n) { return n <= 1 ? 1 : n * factorial(n-1); }", "vs const, runtime fallback"),
                ("variadic templates", "variable argument templates", "type-safe variadic functions", "parameter packs, recursion/ fold expressions", "template<typename... Args> void print(Args... args);", "pack expansion syntax"),
                ("concepts", "template constraints", "named requirements", "requires clauses, concept definitions", "template<typename T> requires Addable<T> T add(T a, T b);", "C++20 feature, compiler support"),
                ("coroutines", "suspendable functions", "asynchronous programming", "co_await, co_yield, co_return", "task<void> async_op() { co_await something(); }", "stackless, promise type customization"),
            ],
            "Templates": [
                ("SFINAE", "Substitution Failure Is Not An Error", "conditional template overloading", "enable_if, void_t", "template<typename T> typename std::enable_if<std::is_integral<T>::value>::type foo(T t);", "complex error messages"),
                ("CRTP", "Curiously Recurring Template Pattern", "static polymorphism", "base class template parameter is derived class", "template<typename Derived> class Base {}", "avoiding virtual function overhead"),
                ("template specialization", "custom implementation for specific types", "optimizing for particular cases", "full and partial specialization", "template<> class vector<bool> {}", "specialization vs overloading"),
            ],
            "Concurrency": [
                ("std::thread", "OS thread wrapper", "concurrent execution", "joinable, detach, join", "std::thread t([]{ /* work */ }); t.join();", "join or detach before destruction"),
                ("mutex", "mutual exclusion primitive", "protecting shared data", "lock_guard, unique_lock, scoped_lock", "std::mutex mtx; std::lock_guard<std::mutex> lock(mtx);", "deadlock avoidance strategies"),
                ("condition_variable", "thread synchronization", "waiting for conditions", "wait, notify_one, notify_all", "cv.wait(lock, []{ return ready; });", "spurious wakeups, predicate necessity"),
                ("atomic operations", "lock-free synchronization", "hardware-supported atomicity", "memory ordering, compare-and-swap", "std::atomic<int> counter{0}; counter.fetch_add(1);", "ABA problem, memory order semantics"),
                ("future/promise", "asynchronous result transfer", "deferred computation", "async, packaged_task", "auto fut = std::async(std::launch::async, foo);", "exception propagation through future"),
            ],
        }
    },

    "TypeScript": {
        "categories": ["Core Types", "Advanced Types", "OOP", "Generics", "Configuration", "Best Practices", "Integration"],
        "subcategories": {
            "Core Types": ["Primitives", "Arrays", "Tuples", "Enums", "Any/Unknown/Never"],
            "Advanced Types": ["Union/Intersection", "Type Guards", "Mapped Types", "Conditional Types", "Utility Types"],
            "OOP": ["Classes", "Interfaces", "Access Modifiers", "Abstract Classes"],
            "Generics": ["Generic Functions", "Generic Classes", "Generic Constraints", "Variance"],
            "Configuration": ["tsconfig", "Compiler Options", "Module Resolution"],
            "Best Practices": ["Type Safety", "Strict Mode", "Declaration Merging"],
            "Integration": ["React with TS", "Node.js with TS", "Third-party Types"]
        },
        "concepts": {
            "Core Types": [
                ("type inference", "automatic type deduction", "reducing explicit annotations", "contextual typing, best common type", "let x = 10; // inferred as number", "any propagation"),
                ("unknown vs any", "top type comparison", "type-safe alternatives", "unknown: requires type checking; any: disables type checking", "function process(val: unknown) { if (typeof val === 'string') { ... } }", "prefer unknown over any"),
                ("never type", "bottom type", "representing unreachable code", "functions that throw, exhaustive type checks", "function fail(): never { throw new Error(); }", "distributive conditional types"),
                ("enum vs const enum", "enumerated types", "named constant collections", "enum: object at runtime; const enum: inline values", "const enum Direction { Up, Down }", "tree-shaking issues with enums"),
                ("tuple types", "fixed-length arrays", "heterogeneous element types", "optional elements, rest elements", "type Point = [number, number, number?];", "tuple vs array, labeled tuples"),
            ],
            "Advanced Types": [
                ("union types", "OR type composition", "allowing multiple types", "narrowing with type guards", "type Status = 'loading' | 'success' | 'error';", "discriminated unions"),
                ("intersection types", "AND type composition", "combining multiple types", "all properties from all types", "type Employee = Person & HasId;", "conflicting property types"),
                ("type guards", "runtime type checking", "narrowing types in blocks", "typeof, instanceof, in, custom predicates", "function isString(val: unknown): val is string { return typeof val === 'string'; }", "type guard performance"),
                ("mapped types", "type transformation", "creating types from existing types", "iterating over keys with in", "type Readonly<T> = { readonly [K in keyof T]: T[K] };", "key remapping, as clauses"),
                ("conditional types", "type-level ternary", "types based on conditions", "T extends U ? X : Y", "type NonNullable<T> = T extends null | undefined ? never : T;", "infer keyword, distributive behavior"),
                ("utility types", "built-in type helpers", "common type transformations", "Partial, Required, Pick, Omit, Record, ReturnType", "type UserPreview = Pick<User, 'id' | 'name'>;", "deep partial implementation"),
                ("template literal types", "string type manipulation", "type-safe string patterns", "concatenation, inference", "type EventName<T extends string> = `on${Capitalize<T>}`;", "recursive template literals"),
            ],
            "OOP": [
                ("interface vs type alias", "structural type definitions", "different use cases", "interface: declaration merging, extends; type: unions, intersections, primitives", "interface Point { x: number; y: number; }", "consistency in codebase"),
                ("access modifiers", "visibility control", "encapsulation in classes", "public, private, protected, readonly", "private constructor() {}", "#private vs private keyword"),
                ("abstract classes", "partial implementation classes", "defining base contracts", "cannot instantiate, may have implementation", "abstract class Animal { abstract makeSound(): void; }", "abstract vs interface choice"),
                ("structural typing", "duck typing system", "compatibility based on shape", "nominal vs structural", "interface Named { name: string; } // compatible with any object having name", "excess property checks"),
            ],
            "Generics": [
                ("generic constraints", "bounding type parameters", "limiting generic types", "extends clause", "function log<T extends { toString(): string }>(obj: T) {}", "multiple constraints"),
                ("generic defaults", "default type parameters", "optional generic arguments", "sensible defaults", "interface Container<T = string> { value: T; }", "default ordering rules"),
                ("variance", "generic type relationships", "co/contra/in-variance", "readonly makes covariant", "interface Producer<out T> { produce(): T; }", "strictFunctionTypes impact"),
            ],
            "Configuration": [
                ("strict mode", "compiler strictness options", "maximizing type safety", "strictNullChecks, noImplicitAny, strictPropertyInitialization", "\"strict\": true in tsconfig", "migration challenges"),
                ("declaration files", "type definition files", "describing JavaScript APIs", ".d.ts files, ambient declarations", "declare module 'library' { export function foo(): void; }", "@types packages, DefinitelyTyped"),
            ],
        }
    },

    "Go": {
        "categories": ["Core Language", "Concurrency", "Standard Library", "Memory Model", "Error Handling", "Testing", "Modules", "Best Practices"],
        "subcategories": {
            "Core Language": ["Variables", "Types", "Control Flow", "Functions", "Structs", "Interfaces"],
            "Concurrency": ["Goroutines", "Channels", "Select", "Sync Package", "Context"],
            "Standard Library": ["net/http", "database/sql", "encoding/json", "io", "reflect"],
            "Memory Model": ["Pointers", "Slices", "Maps", "Garbage Collection"],
            "Error Handling": ["error interface", "Panic/Recover", "Error Wrapping"],
            "Testing": ["Unit Tests", "Benchmarks", "Table-Driven Tests"],
            "Modules": ["go modules", "versioning", "dependency management"],
            "Best Practices": ["Idiomatic Go", "Code Organization", "Performance"]
        },
        "concepts": {
            "Core Language": [
                ("goroutines", "lightweight threads", "concurrent execution units", "multiplexed onto OS threads by Go runtime", "go func() { /* work */ }()", "goroutine leaks"),
                ("channels", "typed communication pipes", "goroutine synchronization", "unbuffered (synchronous) vs buffered", "ch := make(chan int, 10)", "closing channels, nil channel behavior"),
                ("select statement", "channel multiplexing", "waiting on multiple channel operations", "random fair selection, default case", "select { case v := <-ch1: ... case ch2 <- v: ... }", "non-blocking select with default"),
                ("interfaces", "implicit contract types", "structural subtyping", "satisfied by method set, not declaration", "type Reader interface { Read(p []byte) (n int, err error) }", "empty interface as any"),
                ("structs", "composite data types", "grouping related fields", "embedded fields for composition", "type Person struct { Name string; Age int }", "struct tags for reflection"),
                ("slices", "dynamic array views", "flexible sequence type", "pointer, length, capacity triple", "slice := array[1:4]", "append behavior, underlying array sharing"),
                ("maps", "hash table implementation", "key-value storage", "reference type, not safe for concurrent use", "m := make(map[string]int)", "zero value is nil, not empty"),
                ("defer", "delayed execution statement", "resource cleanup guarantee", "LIFO order, evaluated immediately", "defer file.Close()", "defer in loops, panic behavior"),
                ("panic and recover", "exception-like mechanism", "unwinding the stack", "panic: stop normal flow; recover: catch in deferred function", "defer func() { if r := recover(); r != nil { ... } }()", "avoid using for control flow"),
                ("nil interface", "empty interface value", "type and value both nil", "different from typed nil", "var i interface{} = (*int)(nil); // i != nil", "common bug source"),
            ],
            "Concurrency": [
                ("sync.Mutex", "mutual exclusion lock", "protecting shared state", "Lock/Unlock pairs", "var mu sync.Mutex; mu.Lock(); defer mu.Unlock()", "defer unlock pattern"),
                ("sync.RWMutex", "read-write lock", "multiple readers, single writer", "RLock/RUnlock, Lock/Unlock", "var rwmu sync.RWMutex", "writer starvation"),
                ("sync.WaitGroup", "goroutine completion waiter", "blocking until group finishes", "Add, Done, Wait", "var wg sync.WaitGroup; wg.Add(1); go func() { defer wg.Done(); ... }()", "Add must be called before goroutine starts"),
                ("context package", "request-scoped values", "cancellation and deadlines", "WithCancel, WithTimeout, WithValue", "ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)", "context value abuse"),
                ("sync.Once", "one-time initialization", "guaranteed single execution", "thread-safe lazy initialization", "var once sync.Once; once.Do(initFunc)", "cannot reset"),
                ("sync.Pool", "object reuse pool", "reducing GC pressure", "Get/Put operations", "var pool = sync.Pool{ New: func() interface{} { return make([]byte, 1024) } }", "object eviction unpredictability"),
            ],
            "Memory Model": [
                ("slice internals", "slice header structure", "pointer, len, cap", "sharing underlying arrays", "s := make([]int, 5, 10)", "slice growth algorithm"),
                ("pointer receivers vs value receivers", "method receiver types", "mutability and interface satisfaction", "pointer: can modify, value: copy", "func (p *Point) Move()", "consistency in receiver types"),
                ("escape analysis", "stack vs heap allocation", "compiler optimization", "escaping variables allocated on heap", "returning local variable address", "pprof heap profiling"),
            ],
            "Error Handling": [
                ("error interface", "standard error type", "minimal error contract", "Error() string method", "if err != nil { return err }", "error wrapping with fmt.Errorf %w"),
                ("custom error types", "structured error information", "error type assertions", "implementing error interface", "type NotFoundError struct { Resource string }", "errors.Is and errors.As"),
            ],
            "Standard Library": [
                ("net/http", "HTTP server/client", "building web services", "ServeMux, Handler interface, http.Client", "http.HandleFunc(\"/\", handler)", "middleware pattern, timeout handling"),
                ("database/sql", "SQL database access", "database-agnostic SQL operations", "connection pooling, prepared statements", "db.QueryContext(ctx, \"SELECT ...\", args...)", "NULL handling with sql.NullString"),
                ("reflect package", "runtime type introspection", "examining types and values", "TypeOf, ValueOf, struct tags", "reflect.TypeOf(obj).Kind()", "performance cost, brittle code"),
            ],
        }
    },

    "Rust": {
        "categories": ["Ownership", "Borrowing", "Lifetimes", "Types", "Traits", "Concurrency", "Memory Safety", "Macros", "Ecosystem"],
        "subcategories": {
            "Ownership": ["Move Semantics", "Copy Trait", "Drop Trait", "Ownership Transfer"],
            "Borrowing": ["References", "Mutable References", "Deref", "Slices"],
            "Lifetimes": ["Lifetime Annotation", "Lifetime Elision", "'static", "Lifetime Bounds"],
            "Types": ["Structs", "Enums", "Pattern Matching", "Generics", "Type Aliases"],
            "Traits": ["Defining Traits", "Implementing Traits", "Trait Bounds", "Associated Types"],
            "Concurrency": ["Threads", "Channels", "Arc", "Mutex", "RwLock", "Atomics"],
            "Memory Safety": ["Unsafe Rust", "Raw Pointers", " FFI", "Smart Pointers"],
            "Macros": ["Declarative Macros", "Procedural Macros", "Derive Macros"],
            "Ecosystem": ["Cargo", "Crates", "Modules", "Error Handling"]
        },
        "concepts": {
            "Ownership": [
                ("ownership rules", "memory management paradigm", "compile-time memory safety", "each value has one owner, owner dropped -> value dropped", "let s1 = String::from(\"hello\"); let s2 = s1; // s1 moved", "ownership transfer in function calls"),
                ("move semantics", "ownership transfer", "non-Copy types transfer ownership", "shallow copy + invalidate source", "let s2 = s1; // s1 no longer valid", "clone for deep copy"),
                ("Copy trait", "implicit bitwise copy", "stack-only types", "primitive types, tuples of Copy types", "let x = 5; let y = x; // both valid", "deriving Copy, Drop conflict"),
                ("Drop trait", "destructor mechanism", "resource cleanup", "called when value goes out of scope", "impl Drop for MyType { fn drop(&mut self) { ... } }", "std::mem::forget, ManuallyDrop"),
                ("RAII in Rust", "resource acquisition is initialization", "automatic cleanup via ownership", "scope-bound resource management", "{ let file = File::open(\"data.txt\")?; } // auto-closed", "early returns and ? operator"),
            ],
            "Borrowing": [
                ("references", "non-owning pointers", "borrowing without taking ownership", "immutable by default, one mutable or many immutable", "let len = calculate_length(&s);", "dangling references prevented"),
                ("mutable references", "exclusive borrow", "modifying borrowed data", "only one mutable reference at a time", "fn change(some_string: &mut String) { some_string.push_str(\", world\"); }", "preventing data races at compile time"),
                ("slices", "contiguous sequence reference", "view into collection", "string slices, array slices", "let hello = &s[0..5];", "slice bounds checking"),
                ("deref coercion", "automatic dereferencing", "convenience for smart pointers", "&Box<T> -> &T, &String -> &str", "fn hello(name: &str) { ... } hello(&String::from(\"world\"));", "custom Deref implementation"),
            ],
            "Lifetimes": [
                ("lifetime annotation", "explicit reference validity", "preventing dangling references", "'a syntax, relationship specification", "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str", "lifetime elision rules"),
                ("lifetime elision", "automatic lifetime inference", "reducing annotation boilerplate", "three rules: input lifetimes assigned, output from input if one, from self if &self", "fn first_word(s: &str) -> &str {}", "when elision doesn't apply"),
                ("'static lifetime", "entire program duration", "longest possible lifetime", "string literals, global variables", "let s: &'static str = \"I have a static lifetime.\";", "not everything 'static lives forever on heap"),
                ("lifetime bounds", "constrained generic lifetimes", "ensuring outlives relationships", "T: 'a means T outlives 'a", "struct Ref<'a, T: 'a>(&'a T);", "higher-ranked trait bounds for<'a>"),
            ],
            "Types": [
                ("enum variants", "algebraic data types", "sum types with data", "can hold data, C-like, unit variants", "enum Message { Quit, Move { x: i32, y: i32 }, Write(String) }", "memory layout optimization (niche)"),
                ("Option<T>", "null alternative", "explicit presence/absence", "Some(T) or None", "let maybe_num: Option<i32> = Some(5);", "unwrap, expect, match, ? operator"),
                ("Result<T, E>", "error handling type", "explicit success/failure", "Ok(T) or Err(E)", "let result: Result<i32, ParseIntError> = \"5\".parse();", "? operator for propagation"),
                ("pattern matching", "exhaustive value decomposition", "control flow with destructuring", "match, if let, while let", "match x { Some(n) => ..., None => ... }", "refutable vs irrefutable patterns"),
                ("generics", "parametric polymorphism", "type-safe abstraction", "monomorphization at compile time", "fn largest<T: PartialOrd>(list: &[T]) -> &T {}", "zero-cost abstraction"),
            ],
            "Traits": [
                ("trait system", "interface definition", "shared behavior contracts", "define requirements, implement for types", "trait Drawable { fn draw(&self); }", "orphan rule, coherence"),
                ("trait bounds", "generic constraints", "requiring trait implementation", "where clauses for readability", "fn notify<T: Summary>(item: &T) {}", "multiple trait bounds with +"),
                ("associated types", "type placeholder in trait", "output type specification", "each implementation has one associated type", "trait Iterator { type Item; fn next(&mut self) -> Option<Self::Item>; }", "vs generics for trait flexibility"),
                ("trait objects", "dynamic dispatch", "runtime polymorphism", "Box<dyn Trait>, &dyn Trait", "fn draw(item: &dyn Drawable) {}", "object safety requirements, vtable"),
                ("Derive macro", "automatic trait implementation", "code generation for traits", "Debug, Clone, Copy, PartialEq, Eq", "#[derive(Debug, Clone)]", "custom derive macros"),
            ],
            "Concurrency": [
                ("ownership for concurrency", "compile-time thread safety", "preventing data races", "Send and Sync traits", "unsafe impl Send for MyType {}", "Arc<Mutex<T>> pattern"),
                ("Arc", "atomic reference counting", "shared ownership across threads", "thread-safe Rc", "let data = Arc::new(Mutex::new(0));", "Arc::clone vs .clone()"),
                ("Mutex", "mutual exclusion", "protected data access", "poisoning on panic", "let mut num = data.lock().unwrap(); *num += 1;", "deadlock potential"),
                ("channels", "message passing", "thread communication", "mpsc: multiple producer, single consumer", "let (tx, rx) = mpsc::channel(); tx.send(val).unwrap();", "bounded vs unbounded channels"),
                ("Rayon", "data parallelism library", "parallel iterators", "join, par_iter, par_map", "vec.par_iter().map(|x| x * x).collect();", "work-stealing scheduler"),
            ],
            "Memory Safety": [
                ("unsafe Rust", "opt-out of safety guarantees", "necessary for low-level operations", "raw pointers, FFI, inline assembly", "unsafe { *raw_ptr = value; }", "unsafe blocks should be minimal"),
                ("Box<T>", "heap allocation", "single ownership heap pointer", "automatic deallocation", "let b = Box::new(5);", "Box::leak for static lifetime"),
                ("Rc<T>", "reference counting", "multiple ownership single-threaded", "non-atomic counters", "let data = Rc::new(vec![1, 2, 3]);", "circular references with RefCell"),
                ("RefCell<T>", "interior mutability", "runtime borrow checking", "single-threaded only", "let mut_ref = data.borrow_mut();", "panic on double mutable borrow"),
            ],
            "Ecosystem": [
                ("Cargo", "build system and package manager", "dependency management", "Cargo.toml, Cargo.lock, workspaces", "[dependencies]\nserde = \"1.0\"", "feature flags, cargo expand"),
                ("error handling patterns", "Result propagation", "ergonomic error management", "? operator, custom error types, thiserror", "fn read_file() -> Result<String, io::Error> { let content = fs::read_to_string(\"file.txt\")?; Ok(content) }", "anyhow for application errors"),
                ("modules", "code organization", "visibility and encapsulation", "mod, pub, use, super, crate", "mod utils; pub use utils::helper;", "module tree vs filesystem tree"),
            ],
        }
    },

    "Kotlin": {
        "categories": ["Core Language", "OOP", "Functional Programming", "Coroutines", "Standard Library", "Android", "Interoperability", "Best Practices"],
        "subcategories": {
            "Core Language": ["Variables", "Types", "Null Safety", "Smart Casts", "Control Flow"],
            "OOP": ["Classes", "Inheritance", "Data Classes", "Sealed Classes", "Interfaces"],
            "Functional Programming": ["Higher-Order Functions", "Lambdas", "Inline Functions", "Scope Functions"],
            "Coroutines": ["Suspending Functions", "Flows", "Channels", "Dispatchers", "Structured Concurrency"],
            "Standard Library": ["Collections", "String Manipulation", "Ranges", "Delegation"],
            "Android": ["ViewModel", "LiveData", "Compose", "Navigation"],
            "Interoperability": ["Java Interop", "Nullable Annotations", "SAM Conversions"],
            "Best Practices": ["Idiomatic Kotlin", "DSL Design", "Extension Functions"]
        },
        "concepts": {
            "Core Language": [
                ("null safety", "type system null prevention", "eliminating NPE at compile time", "?, !!, ?:, ?. operators", "val name: String? = null", "platform types from Java"),
                ("smart cast", "automatic type narrowing", "reducing explicit casting", "after type check, compiler knows type", "if (obj is String) { println(obj.length) }", "smart cast with contracts"),
                ("val vs var", "declaration keywords", "immutability control", "val: read-only reference; var: mutable reference", "val list = mutableListOf(1, 2)", "val with mutable objects"),
                ("type inference", "automatic type deduction", "reducing type annotations", "compiler infers from initializer", "val x = 5 // inferred as Int", "explicit types for public APIs"),
                ("when expression", "pattern matching alternative", "powerful switch replacement", "can match types, ranges, conditions", "when (x) { is Int -> ... in 1..10 -> ... else -> ... }", "exhaustiveness checking"),
                ("range operator", "interval representation", "iterating over sequences", ".., until, downTo, step", "for (i in 1..10 step 2) { ... }", "range performance vs sequence"),
                (" Elvis operator ", "null fallback operator", "providing default values", "returns left if non-null, right otherwise", "val len = name?.length ?: 0", "chaining Elvis operators"),
            ],
            "OOP": [
                ("data classes", "concise data containers", "auto-generated methods", "equals, hashCode, toString, copy, componentN", "data class User(val name: String, val age: Int)", "copy() for immutable updates"),
                ("sealed classes", "restricted inheritance", "exhaustive when expressions", "all subclasses known at compile time", "sealed class Result\nclass Success(val data: String) : Result()", "sealed interfaces in Kotlin 1.5"),
                ("companion objects", "class-level members", "static-like behavior", "singleton associated with class", "class MyClass { companion object { fun create() = MyClass() } }", "companion object naming"),
                ("object declaration", "singleton pattern", "single instance guarantee", "thread-safe lazy initialization", "object Singleton { fun doSomething() {} }", "object expressions for anonymous"),
                ("extension functions", "adding methods to existing types", "non-intrusive functionality", "resolved statically", "fun String.addExclamation() = this + \"!\"", "member vs extension priority"),
                ("delegation", "composition over inheritance", "by keyword for delegation", "automatic forwarding", "class Derived(b: Base) : Base by b", "property delegation with lazy, observable"),
            ],
            "Functional Programming": [
                ("higher-order functions", "functions taking/returning functions", "functional abstraction", "map, filter, reduce, fold", "list.map { it * 2 }.filter { it > 5 }", "inline functions for performance"),
                ("inline functions", "compile-time inlining", "eliminating lambda overhead", "copied to call site", "inline fun <T> measure(block: () -> T): T { ... }", "non-local returns, reified types"),
                ("scope functions", "object context operations", "temporary scope modification", "let, run, with, apply, also", "obj.apply { name = \"New\" }.also { println(it) }", "choosing the right scope function"),
                ("reified types", "runtime type preservation", "generic type access", "inline function feature", "inline fun <reified T> isType(value: Any) = value is T", "type erasure workaround"),
            ],
            "Coroutines": [
                ("suspend functions", "non-blocking functions", "coroutine building blocks", "can pause and resume", "suspend fun fetchData(): Data { ... }", "suspend functions only callable from coroutines"),
                ("CoroutineScope", "coroutine lifecycle management", "structured concurrency", "SupervisorJob, cancellation propagation", "val scope = CoroutineScope(Dispatchers.Main)", "GlobalScope anti-pattern"),
                ("Flow", "cold async stream", "reactive streams in Kotlin", "emit, collect, operators", "flow { emit(1); emit(2) }.map { it * 2 }.collect { println(it) }", "backpressure, conflation"),
                ("Dispatchers", "coroutine execution context", "thread pool specification", "Default, IO, Main, Unconfined", "withContext(Dispatchers.IO) { /* blocking IO */ }", "context switching cost"),
                ("channels", "coroutine communication", "hot streams for communication", "send, receive, buffer", "val channel = Channel<Int>()", "rendezvous vs buffered channels"),
                ("structured concurrency", "hierarchical coroutine management", "parent-child relationship", "parent waits for children, cancellation propagates", "coroutineScope { launch { ... } launch { ... } }", "supervisorScope for independent failures"),
            ],
            "Standard Library": [
                ("collection operations", "functional collection processing", "declarative data manipulation", "map, filter, reduce, groupBy, associate", "people.groupBy { it.department }", "eager vs lazy (Sequence)"),
                ("Sequence", "lazy collection evaluation", "intermediate operations deferred", "chaining without intermediate collections", "list.asSequence().filter { ... }.map { ... }.toList()", "when to use vs collections"),
                ("lazy property", "deferred initialization", "computed on first access", "thread-safe by default", "val heavyObject by lazy { createHeavyObject() }", "synchronization modes"),
            ],
            "Android": [
                ("ViewModel", "UI-related data holder", "surviving configuration changes", "lifecycle-aware, scope to activity/fragment", "class MyViewModel : ViewModel() { ... }", "ViewModelFactory for constructor args"),
                ("LiveData", "observable data holder", "lifecycle-aware updates", "automatic cleanup on inactive", "val data = MutableLiveData<String>()", "Transformation.map, Transformation.switchMap"),
                ("Jetpack Compose", "declarative UI toolkit", "function-based UI definition", "@Composable functions, state hoisting", "@Composable fun Greeting(name: String) { Text(\"Hello $name\") }", "recomposition optimization"),
            ],
        }
    },

    "Java": {
        "categories": ["Core Java", "OOP", "Collections", "JVM Internals", "Concurrency", "Functional Programming", "IO/NIO", "Spring Ecosystem", "Best Practices"],
        "subcategories": {
            "Core Java": ["Data Types", "Operators", "Control Flow", "Strings", "Arrays", "Generics"],
            "OOP": ["Classes", "Inheritance", "Polymorphism", "Encapsulation", "Abstraction", "Interfaces"],
            "Collections": ["List", "Set", "Map", "Queue", "Stream API", "Collections Utility"],
            "JVM Internals": ["Memory Model", "Garbage Collection", "Class Loading", "JIT Compilation"],
            "Concurrency": ["Threads", "Synchronization", "Executors", "Concurrent Collections", "Locks", "CompletableFuture"],
            "Functional Programming": ["Lambda", "Streams", "Method References", "Optional"],
            "IO/NIO": ["File IO", "Serialization", "NIO Channels", "NIO Selectors"],
            "Spring Ecosystem": ["Spring Core", "Spring Boot", "Spring Data", "Spring Security"],
            "Best Practices": ["Design Patterns", "Clean Code", "Testing", "Performance"]
        },
        "concepts": {
            "Core Java": [
                ("JVM architecture", "Java Virtual Machine structure", "platform independence", "classloader, runtime data areas, execution engine", "HotSpot JVM, OpenJ9", "tuning heap sizes"),
                ("String immutability", "unchangeable string objects", "security, caching, thread-safety", "String Pool, interning", "String s = \"hello\"; // in pool", "concatenation performance"),
                ("equals() vs ==", "equality comparison methods", "reference vs content comparison", "==: reference equality, equals(): content", "str1.equals(str2)", "null safety with equals"),
                ("hashCode() contract", "object hash code generation", "hash-based collection support", "consistent with equals, same object same hash", "@Override public int hashCode()", "poor hash distribution"),
                ("generics", "parameterized types", "type safety at compile time", "type erasure, wildcards, bounds", "List<? extends Number> list", "heap pollution, raw types"),
                ("type erasure", "compile-time type removal", "backward compatibility", "replaced with Object or first bound", "List<String> becomes List at runtime", "instanceof with generics"),
                ("autoboxing/unboxing", "primitive-wrapper conversion", "automatic conversion", "performance overhead, NPE risk", "Integer i = 5; // autoboxed", "== comparison between wrappers"),
                ("final keyword", "immutability modifier", "preventing modification", "final class: no inheritance, final method: no override, final variable: no reassignment", "final List<String> list = new ArrayList<>();", "final reference vs immutable object"),
                ("static block", "class-level initialization", "executed when class loads", "runs before constructor, only once", "static { System.loadLibrary(\"native\"); }", "exception handling in static blocks"),
                ("var keyword", "local variable type inference", "reducing verbosity", "compiler infers type from initializer", "var list = new ArrayList<String>();", "cannot use for fields, method params"),
            ],
            "OOP": [
                ("abstract class vs interface", "abstraction mechanisms", "defining contracts", "abstract class: state, constructor, single inheritance; interface: pure contract, multiple inheritance", "interface Drawable { void draw(); }", "Java 8+ default methods blurring lines"),
                ("method overloading vs overriding", "polymorphism forms", "multiple methods same name", "overloading: compile-time, same name different params; overriding: runtime, same signature in subclass", "@Override public void draw() {}", "covariant return types"),
                ("super keyword", "parent class reference", "accessing superclass members", "constructor chaining, method access", "super.draw(); super(10);", "super must be first in constructor"),
                ("this keyword", "current instance reference", "self-referential access", "constructor chaining, disambiguation", "this(name, age); this.name = name;", "this() must be first statement"),
                ("encapsulation", "data hiding principle", "controlling access", "private fields, public getters/setters", "private int age; public int getAge() { return age; }", "excessive boilerplate"),
                ("composition vs inheritance", "code reuse strategies", "has-a vs is-a relationship", "composition: more flexible, less coupling; inheritance: tight coupling", "class Car { private Engine engine; }", "favor composition over inheritance"),
                ("marker interfaces", "empty interface types", "metadata signaling", "Serializable, Cloneable, RandomAccess", "public class MyClass implements Serializable {}", "marker interfaces vs annotations"),
            ],
            "Collections": [
                ("ArrayList vs LinkedList", "List implementations", "sequential collection storage", "ArrayList: O(1) random access, O(n) insert; LinkedList: O(n) access, O(1) insert", "List<String> list = new ArrayList<>();", "memory overhead of LinkedList nodes"),
                ("HashMap internals", "hash table implementation", "key-value storage", "array of buckets, hash collision handling", "Map<String, Integer> map = new HashMap<>();", "resize threshold, load factor tuning"),
                ("ConcurrentHashMap", "thread-safe hash map", "concurrent access without full locking", "segment locking (Java 7) or CAS + synchronized (Java 8+)", "ConcurrentHashMap<String, Integer> map", "size() weak consistency"),
                ("HashSet vs TreeSet", "Set implementations", "unique element collections", "HashSet: O(1), unordered; TreeSet: O(log n), sorted", "Set<Integer> set = new TreeSet<>();", "Comparable vs Comparator for TreeSet"),
                ("PriorityQueue", "heap-based queue", "priority ordering", "min-heap by default, custom Comparator", "PriorityQueue<Task> pq = new PriorityQueue<>(Comparator.comparingInt(t -> t.priority));", "O(log n) offer/poll"),
                ("Stream API", "functional data processing", "declarative operations on collections", "filter, map, reduce, collect, lazy evaluation", "list.stream().filter(x -> x > 5).map(Math::sqrt).collect(Collectors.toList());", "parallel streams, stateful operations"),
                ("Optional", "null container type", "avoiding NullPointerException", "explicit presence/absence handling", "Optional<String> opt = Optional.ofNullable(value);", "overuse creating wrapper overhead"),
            ],
            "JVM Internals": [
                ("garbage collection", "automatic memory reclamation", "preventing memory leaks", "mark-and-sweep, generational, G1, ZGC, Shenandoah", "-XX:+UseG1GC", "GC pause times, tuning for latency"),
                ("G1 GC", "Garbage First collector", "predictable pause times", "region-based, mixed collections", "-XX:MaxGCPauseMillis=200", "humongous objects, evacuation failures"),
                ("class loading mechanism", "runtime class resolution", "dynamic class loading", "Bootstrap -> Extension -> Application -> Custom", "Class.forName(\"com.example.MyClass\")", "ClassNotFoundException vs NoClassDefFoundError"),
                ("JIT compilation", "Just-In-Time optimization", "runtime bytecode to native translation", "HotSpot profiling, tiered compilation", "-XX:CompileThreshold=10000", "deoptimization, OSR"),
                ("memory model", "JMM specification", "defining thread interaction rules", "happens-before, volatile, synchronized", "volatile int flag; // visibility guarantee", "reordering, out-of-thin-air values"),
                ("metaspace", "class metadata storage", "replacing PermGen", "native memory, auto-expanding", "-XX:MaxMetaspaceSize=256m", "classloader leaks"),
            ],
            "Concurrency": [
                ("synchronized keyword", "intrinsic locking", "mutual exclusion", "monitor lock on object/class", "synchronized(obj) { /* critical section */ }", "contention, lack of fairness"),
                ("ReentrantLock", "explicit lock implementation", "advanced locking features", "tryLock, lockInterruptibly, fairness", "ReentrantLock lock = new ReentrantLock(true);", "must unlock in finally block"),
                ("volatile keyword", "visibility guarantee", "preventing caching in thread-local memory", "no atomicity for compound operations", "private volatile boolean running = true;", "volatile ++ is not atomic"),
                ("ThreadLocal", "thread-local variables", "isolation per thread", "each thread has independent copy", "ThreadLocal<SimpleDateFormat> df = ThreadLocal.withInitial(SimpleDateFormat::new);", "memory leak with thread pools"),
                ("ExecutorService", "thread pool abstraction", "managed concurrent execution", "cached, fixed, scheduled, single thread pools", "Executors.newFixedThreadPool(4);", "graceful shutdown, awaitTermination"),
                ("CompletableFuture", "composable async programming", "future composition and chaining", "thenApply, thenCompose, thenCombine, exceptionally", "CompletableFuture.supplyAsync(() -> fetchData()).thenApply(this::process);", "exception propagation, async debugging"),
                ("CountDownLatch", "synchronization aid", "waiting for multiple events", "count down to zero, then release", "CountDownLatch latch = new CountDownLatch(3);", "cannot reset, one-time use"),
                ("CyclicBarrier", "synchronization barrier", "waiting for parties at barrier", "reusable, action on tripping", "CyclicBarrier barrier = new CyclicBarrier(4);", "broken barrier exception"),
                ("Fork/Join framework", "divide-and-conquer parallelism", "work-stealing algorithm", "RecursiveTask, RecursiveAction", "new ForkJoinPool().invoke(new MyTask());", "task granularity tuning"),
            ],
            "Functional Programming": [
                ("lambda expressions", "anonymous function syntax", "functional interface implementation", "(params) -> body", "Runnable r = () -> System.out.println(\"Hello\");", "effectively final variables"),
                ("method references", "concise lambda shorthand", "referencing existing methods", "Class::method, object::method", "list.forEach(System.out::println);", "constructor references"),
                ("functional interfaces", "single abstract method interfaces", "lambda target types", "Predicate, Function, Consumer, Supplier", "Predicate<String> isEmpty = String::isEmpty;", "@FunctionalInterface annotation"),
                ("Stream intermediate vs terminal operations", "stream operation types", "lazy vs eager evaluation", "intermediate: lazy, return Stream; terminal: eager, trigger execution", "stream.filter().map().collect()", "short-circuiting operations"),
            ],
            "Spring Ecosystem": [
                ("Dependency Injection", "IoC pattern implementation", "decoupling components", "constructor injection preferred", "@Autowired private Service service;", "circular dependencies"),
                ("Spring Bean scopes", "object lifecycle management", "controlling instance creation", "singleton, prototype, request, session, application", "@Scope(\"prototype\")", "proxy mode for scoped beans"),
                ("Spring Boot auto-configuration", "convention-over-configuration", "reducing boilerplate setup", "@EnableAutoConfiguration, conditional beans", "@SpringBootApplication", "excluding auto-configurations"),
                ("Spring Data JPA", "repository abstraction", "reducing data access code", "CrudRepository, PagingAndSortingRepository", "interface UserRepo extends JpaRepository<User, Long> {}", "query derivation, @Query"),
                ("Spring Security", "security framework", "authentication and authorization", "filters, SecurityContext, JWT integration", "@EnableWebSecurity", "filter chain order"),
            ],
        }
    },

    "JavaScript": {
        "categories": ["Core JS", "Functions & Scope", "Objects & Prototypes", "Async Programming", "ES6+", "DOM", "Browser APIs", "Node.js", "Patterns & Best Practices"],
        "subcategories": {
            "Core JS": ["Data Types", "Type Coercion", "Operators", "Control Flow", "Strict Mode"],
            "Functions & Scope": ["Closures", "this Keyword", "Arrow Functions", "IIFE", "Higher-Order Functions"],
            "Objects & Prototypes": ["Object Creation", "Prototypal Inheritance", "Property Descriptors", "Class Syntax"],
            "Async Programming": ["Callbacks", "Promises", "async/await", "Event Loop"],
            "ES6+": ["let/const", "Destructuring", "Spread/Rest", "Modules", "Symbols", "Proxies"],
            "DOM": ["DOM Manipulation", "Events", "Event Delegation", "Performance"],
            "Browser APIs": ["Storage", "Fetch", "WebSockets", "Service Workers"],
            "Node.js": ["Modules", "EventEmitter", "Streams", "Buffer", "Cluster"],
            "Patterns & Best Practices": ["Module Pattern", "Observer", "Singleton", "Error Handling"]
        },
        "concepts": {
            "Core JS": [
                ("event loop", "concurrency model mechanism", "handling async operations", "call stack, task queue, microtask queue", "setTimeout(() => {}, 0);", "starvation of macrotasks"),
                ("hoisting", "declaration lifting behavior", "moving declarations to top of scope", "var: hoisted and initialized undefined; let/const: hoisted but TDZ", "console.log(x); var x = 5; // undefined", "TDZ with let/const"),
                ("closure", "function + lexical environment", "preserving outer scope access", "data privacy, factory functions, module pattern", "function outer() { let x = 1; return () => x; }", "memory leaks with closures"),
                ("this keyword", "context reference", "dynamic binding based on call site", "global, object method, constructor, call/apply/bind", "obj.method(); // this = obj", "arrow functions lexical this"),
                ("prototype chain", "inheritance lookup mechanism", "delegation-based inheritance", "__proto__ links up to Object.prototype", "obj.toString() // found on prototype", "hasOwnProperty vs in operator"),
                ("type coercion", "implicit type conversion", "== vs === behavior", "string + number, falsy values, abstract equality", "[] + {} // '[object Object]'", "surprising coercion results"),
                ("strict mode", "restricted JavaScript variant", "eliminating silent errors", "'use strict'; prevents implicit globals, this coercion", "function() { 'use strict'; ... }", "module auto-strict"),
                ("NaN", "Not-a-Number value", "invalid numeric operation result", "typeof NaN === 'number', NaN !== NaN", "isNaN() vs Number.isNaN()", "NaN propagation in calculations"),
                ("undefined vs null", "empty value types", "representing absence", "undefined: declared but not assigned; null: intentional absence", "let x; // undefined", "null == undefined but null !== undefined"),
            ],
            "Functions & Scope": [
                ("arrow functions", "concise function syntax", "lexical this binding", "no own this, arguments, super, new.target", "const add = (a, b) => a + b;", "cannot be used as constructors"),
                ("IIFE", "Immediately Invoked Function Expression", "creating private scope", "(function() { ... })();", "const module = (function() { let private = 1; return { get: () => private }; })();", "ES6 modules reducing IIFE need"),
                ("higher-order functions", "functions taking/returning functions", "abstraction and composition", "map, filter, reduce, compose", "const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);", "callback hell mitigation"),
                ("Function.prototype.bind", "context binding method", "permanent this attachment", "returns new function with fixed this", "const boundFn = fn.bind(thisArg);", "partial application with bind"),
                ("call vs apply vs bind", "function invocation methods", "controlling this and arguments", "call: spread args, apply: array args, bind: returns function", "fn.call(obj, 1, 2); fn.apply(obj, [1, 2]);", "performance difference minimal"),
                ("lexical scope", "static scoping", "scope determined by source position", "nested functions access outer variables", "function outer() { let x = 1; function inner() { console.log(x); } }", "vs dynamic scope"),
            ],
            "Objects & Prototypes": [
                ("Object.create", "prototypal inheritance creation", "creating objects with specified prototype", "null prototype, property descriptors", "Object.create(null, { x: { value: 1 } });", "shallow vs deep inheritance"),
                ("property descriptors", "object property metadata", "controlling property behavior", "writable, enumerable, configurable, value/get/set", "Object.defineProperty(obj, 'x', { writable: false });", "seal vs freeze vs preventExtensions"),
                ("class syntax", "syntactic sugar over prototypes", "OOP-style class definition", "constructor, extends, super, static", "class MyClass extends Base { constructor() { super(); } }", "not true classes, still prototype-based"),
                ("Symbol", "unique primitive type", "non-string property keys", "guaranteed uniqueness, well-known symbols", "const sym = Symbol('desc'); obj[sym] = value;", "Symbol.for global registry"),
                ("Proxy", "object interception mechanism", "customizing object behavior", "traps for get, set, apply, construct", "new Proxy(target, { get(t, p) { return t[p] * 2; } });", "performance overhead, revocable proxies"),
            ],
            "Async Programming": [
                ("Promises", "async operation representation", "future value container", "pending, fulfilled, rejected states", "fetch('/api').then(res => res.json()).catch(err => console.error(err));", "chaining, Promise.all, Promise.race"),
                ("async/await", "promise syntactic sugar", "writing async code synchronously", "async functions return promises, await unwraps", "async function getData() { const res = await fetch('/api'); return res.json(); }", "error handling with try/catch"),
                ("Promise.all vs Promise.allSettled", "concurrent promise handling", "aggregating multiple promises", "all: rejects on first failure; allSettled: waits for all", "Promise.all([p1, p2, p3])", "handling partial failures"),
                ("microtask queue", "high-priority async queue", "promise callbacks execution", "processed before macrotasks, can starve", "queueMicrotask(() => console.log('micro'));", "vs setTimeout, vs process.nextTick"),
                ("callback hell", "nested callback pyramid", "poor async code structure", "difficult error handling, readability", "readFile(a, (err, data) => { readFile(b, (err, data) => { ... }) })", "promises/async-await solution"),
            ],
            "ES6+": [
                ("destructuring", "pattern-based extraction", "unpacking values from objects/arrays", "const {a, b} = obj; const [x, y] = arr;", "const {name: n, age = 18} = person;", "nested destructuring"),
                ("spread operator", "element expansion", "copying/merging iterables", "shallow copy, function arguments", "const newArr = [...arr1, ...arr2];", "object spread vs Object.assign"),
                ("rest parameters", "remaining arguments collection", "variadic functions", "must be last parameter", "function sum(...numbers) { return numbers.reduce((a, b) => a + b); }", "vs arguments object"),
                ("modules", "code organization system", "encapsulation and reuse", "import/export, static analysis", "import { foo } from './module.js'; export default class {}", "tree shaking, dynamic import()"),
                ("template literals", "string interpolation syntax", "embedded expressions and multiline", "backticks, ${expression}", "const msg = `Hello ${name}`;", "tagged templates"),
                ("Map vs Object", "key-value storage comparison", "different use cases", "Map: any key type, ordered, size property; Object: string/symbol keys", "const map = new Map(); map.set(obj, value);", "Object key collision with prototype"),
                ("Set", "unique value collection", "duplicate elimination", "add, delete, has, size", "const set = new Set([1, 2, 2, 3]); // {1, 2, 3}", "Set operations implementation"),
            ],
            "DOM": [
                ("event delegation", "parent-level event handling", "efficient dynamic element handling", "bubbling phase, event.target", "ul.addEventListener('click', e => { if (e.target.matches('li')) { ... } });", "stopPropagation vs stopImmediatePropagation"),
                ("event bubbling vs capturing", "event propagation phases", "order of event handling", "capturing (root to target) vs bubbling (target to root)", "element.addEventListener('click', handler, true); // capture", "event delegation relies on bubbling"),
                ("DOM reflow vs repaint", "rendering operations", "layout vs visual changes", "reflow: geometry calculation; repaint: visual update", "element.style.width = '100px'; // reflow", "minimizing reflows with DocumentFragment"),
            ],
            "Node.js": [
                ("EventEmitter", "event-driven architecture", "pub/sub pattern implementation", "on, emit, once, removeListener", "const emitter = new EventEmitter(); emitter.on('data', handler);", "memory leak with many listeners"),
                ("streams", "data processing abstraction", "handling large data efficiently", "Readable, Writable, Duplex, Transform", "fs.createReadStream('file.txt').pipe(process.stdout);", "backpressure handling"),
                ("Buffer", "binary data representation", "handling raw bytes", "fixed-size, pool allocation", "Buffer.from('hello'); Buffer.alloc(10);", "Buffer vs TypedArray"),
                ("module system", "CommonJS require/exports", "synchronous module loading", "require.cache, module.exports", "const fs = require('fs'); module.exports = { foo };", "ESM vs CJS interoperability"),
                ("cluster module", "multi-process scaling", "utilizing multiple CPU cores", "master-worker pattern, round-robin", "cluster.fork();", "shared state challenges"),
            ],
        }
    },

    "HTML": {
        "categories": ["Core Elements", "Semantic HTML", "Forms", "Media", "Accessibility", "Performance", "APIs", "Best Practices"],
        "subcategories": {
            "Core Elements": ["Document Structure", "Text Elements", "Links", "Tables", "Lists"],
            "Semantic HTML": ["Header", "Nav", "Main", "Article", "Section", "Aside", "Footer"],
            "Forms": ["Input Types", "Validation", "Accessibility", "File Upload"],
            "Media": ["Images", "Audio", "Video", "Canvas", "SVG"],
            "Accessibility": ["ARIA", "Screen Readers", "Keyboard Navigation", "Color Contrast"],
            "Performance": ["Lazy Loading", "Preloading", "Resource Hints", "Picture Element"],
            "APIs": ["LocalStorage", "SessionStorage", "Geolocation", "Web Workers", "Service Workers"],
            "Best Practices": ["SEO", "Meta Tags", "Open Graph", "Canonical URLs"]
        },
        "concepts": {
            "Core Elements": [
                ("DOCTYPE declaration", "document type definition", "specifying HTML version", "triggers standards mode in browsers", "<!DOCTYPE html>", "quirks mode without DOCTYPE"),
                ("meta viewport tag", "responsive design control", "mobile viewport configuration", "width=device-width, initial-scale=1.0", "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">", "minimum-scale, user-scalable"),
                ("script tag attributes", "JavaScript loading control", "execution timing and order", "async: parallel download, execute when ready; defer: parallel download, execute after parse", "<script src=\"app.js\" defer></script>", "async execution order unpredictability"),
                ("data attributes", "custom data storage", "embedding extra information", "data-* prefix, accessible via dataset", "<div data-user-id=\"123\" data-role=\"admin\">", "camelCase conversion in dataset"),
                ("picture element", "responsive images", "art direction and format selection", "source elements with media queries", "<picture><source srcset=\"large.webp\" media=\"(min-width: 800px)\"><img src=\"fallback.jpg\"></picture>", "browser support for formats"),
            ],
            "Semantic HTML": [
                ("semantic elements", "meaningful structure tags", "improving accessibility and SEO", "header, nav, main, article, section, aside, footer", "<main><article>...</article></main>", "div soup vs semantic markup"),
                ("article vs section", "content grouping elements", "independent vs thematic grouping", "article: self-contained content; section: thematic grouping", "<article> for blog post, <section> for chapters", "nesting rules"),
                ("heading hierarchy", "h1-h6 structure", "document outline", "one h1 per page, sequential order", "<h1>Main Title</h1><h2>Section</h2><h3>Subsection</h3>", "skipping levels for styling"),
            ],
            "Forms": [
                ("input types", "form control varieties", "native input behaviors", "text, email, tel, number, date, color, range", "<input type=\"email\" required>", "mobile keyboard optimization"),
                ("form validation", "client-side checking", "preventing invalid submissions", "required, pattern, min/max, custom validity", "<input pattern=\"[A-Za-z]{3}\">", "server-side validation still required"),
                ("label association", "input labeling", "accessibility and usability", "for attribute or nesting", "<label for=\"email\">Email:</label><input id=\"email\">", "clickable area expansion"),
            ],
            "Accessibility": [
                ("ARIA roles", "accessibility semantics", "enhancing assistive technology", "landmark, widget, live region roles", "<nav role=\"navigation\"> or <nav>", "prefer native semantics over ARIA"),
                ("alt text", "image description", "screen reader content", "descriptive, functional, empty for decorative", "<img src=\"chart.png\" alt=\"Q3 revenue increased 25% to $5M\">", "keyword stuffing in alt"),
                ("focus management", "keyboard navigation control", "interactive element accessibility", "tabindex, focus-visible, skip links", "<a href=\"#main\" class=\"skip-link\">Skip to content</a>", "positive tabindex anti-pattern"),
            ],
            "Performance": [
                ("resource hints", "preemptive resource loading", "performance optimization", "preload, prefetch, preconnect, dns-prefetch", "<link rel=\"preload\" href=\"critical.css\" as=\"style\">", "over-preloading bandwidth waste"),
                ("lazy loading", "deferred content loading", "improving initial page load", "loading=\"lazy\" for images and iframes", "<img src=\"image.jpg\" loading=\"lazy\" alt=\"...\">", "eager loading for above-fold"),
            ],
        }
    },

    "CSS": {
        "categories": ["Core Concepts", "Layout", "Box Model", "Typography", "Animations", "Responsive Design", "Preprocessors", "Performance", "Best Practices"],
        "subcategories": {
            "Core Concepts": ["Selectors", "Specificity", "Inheritance", "Cascade", "Variables"],
            "Layout": ["Flexbox", "Grid", "Positioning", "Floats", "Multi-column"],
            "Box Model": ["Content", "Padding", "Border", "Margin", "Box-sizing"],
            "Typography": ["Fonts", "Text Styling", "Line Height", "Web Fonts"],
            "Animations": ["Transitions", "Keyframes", "Transforms", "Performance"],
            "Responsive Design": ["Media Queries", "Container Queries", "Mobile First", "Breakpoints"],
            "Preprocessors": ["Sass", "Less", "PostCSS"],
            "Performance": ["Critical CSS", "Containment", "Will-change", "GPU Acceleration"],
            "Best Practices": ["BEM", "CSS-in-JS", "Utility Classes", "Design Tokens"]
        },
        "concepts": {
            "Core Concepts": [
                ("specificity", "selector priority system", "conflict resolution", "inline > id > class/attribute > element", "#nav .menu li > a", "!important override"),
                ("box-sizing", "width/height calculation mode", "controlling element dimensions", "content-box: width = content; border-box: width = content + padding + border", "* { box-sizing: border-box; }", "default content-box behavior"),
                ("CSS variables", "custom properties", "reusable values", "--prefix, var() function, cascade inheritance", ":root { --primary: #007bff; } .btn { color: var(--primary); }", "runtime modification with JS"),
                ("z-index stacking", "layer ordering control", "third dimension positioning", "only applies to positioned elements, creates stacking context", "position: relative; z-index: 10;", "stacking context creation triggers"),
                ("pseudo-elements", "virtual element creation", "styling non-existent markup", "::before, ::after, ::first-line, ::selection", ".clearfix::after { content: \"\"; display: table; clear: both; }", "single vs double colon syntax"),
                ("pseudo-classes", "element state selectors", "styling based on state", ":hover, :focus, :nth-child, :not, :is", "li:not(:first-child) { border-top: 1px solid; }", "specificity of :where vs :is"),
            ],
            "Layout": [
                ("Flexbox", "one-dimensional layout system", "flexible item arrangement", "main axis, cross axis, justify-content, align-items", "display: flex; justify-content: space-between;", "flex-basis vs width, gap property"),
                ("CSS Grid", "two-dimensional layout system", "row and column control", "grid-template-columns, grid-area, minmax, auto-fit", "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));", "subgrid, masonry layout"),
                ("position property", "element positioning scheme", "removing from normal flow", "static, relative, absolute, fixed, sticky", "position: sticky; top: 0;", "containing block for absolute positioning"),
                ("BFC", "Block Formatting Context", "independent rendering region", "contains floats, prevents margin collapse", "overflow: hidden; display: flow-root;", "creating BFC without side effects"),
                ("containment", "performance isolation", "limiting layout/paint/style scope", "layout, paint, size, style, strict", "contain: layout paint;", "use cases for contain"),
            ],
            "Responsive Design": [
                ("media queries", "conditional styling", "responsive breakpoint logic", "min-width, max-width, orientation, prefers-color-scheme", "@media (min-width: 768px) { ... }", "mobile-first vs desktop-first"),
                ("container queries", "component-based responsiveness", "querying container size not viewport", "@container (min-width: 400px) { ... }", "@container syntax, container-type property", "browser support, polyfills"),
                ("clamp function", "responsive value scaling", "fluid typography/spacing", "min, preferred, max values", "font-size: clamp(1rem, 2.5vw, 2rem);", "calc with clamp"),
            ],
            "Animations": [
                ("CSS transitions", "property change animation", "simple state animations", "transition-property, duration, timing-function, delay", "transition: all 0.3s ease-in-out;", "transitioning display property"),
                ("CSS keyframes", "complex animation definition", "multi-step animations", "@keyframes, animation-name, duration, iteration", "@keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(0); } }", "will-change optimization"),
                ("transform property", "visual transformation", "GPU-accelerated changes", "translate, scale, rotate, skew", "transform: translate3d(0, 0, 0);", "translateZ for layer promotion"),
            ],
            "Best Practices": [
                ("BEM methodology", "Block Element Modifier naming", "component-based CSS organization", ".block__element--modifier", ".card__title--highlighted", "verbose class names"),
                ("CSS-in-JS", "co-located component styles", "JavaScript-generated CSS", "styled-components, emotion, CSS modules", "const Button = styled.button`color: red;`;", "runtime overhead, SSR challenges"),
                ("critical CSS", "above-the-fold styling", "render-blocking optimization", "inline essential styles, defer rest", "<style>/* critical styles */</style><link rel=\"preload\" href=\"rest.css\">", "automated extraction tools"),
            ],
        }
    },

    "React": {
        "categories": ["Core Concepts", "Hooks", "Component Patterns", "State Management", "Performance", "Testing", "Ecosystem", "Advanced Patterns"],
        "subcategories": {
            "Core Concepts": ["JSX", "Virtual DOM", "Components", "Props", "State", "Lifecycle"],
            "Hooks": ["useState", "useEffect", "useContext", "useReducer", "useMemo", "useCallback", "useRef", "Custom Hooks"],
            "Component Patterns": ["Functional Components", "Class Components", "HOC", "Render Props", "Compound Components"],
            "State Management": ["Context API", "Redux", "Zustand", "Jotai", "Recoil"],
            "Performance": ["Memoization", "Code Splitting", "Lazy Loading", "Virtualization", "Reconciliation"],
            "Testing": ["Jest", "React Testing Library", "Cypress", "Mocking"],
            "Ecosystem": ["React Router", "Next.js", "React Query", "Styled Components"],
            "Advanced Patterns": ["Portals", "Error Boundaries", "Refs Forwarding", "Suspense", "Concurrent Features"]
        },
        "concepts": {
            "Core Concepts": [
                ("Virtual DOM", "in-memory DOM representation", "efficient UI updates", "reconciliation algorithm, diffing", "React.createElement -> VDOM tree", "not always faster than direct DOM manipulation"),
                ("reconciliation", "VDOM diffing process", "determining minimal DOM updates", "key prop, Fiber architecture", "<li key={item.id}>{item.name}</li>", "key stability importance"),
                ("JSX", "JavaScript XML syntax", "declarative UI description", "transpiled to React.createElement", "const element = <h1>Hello</h1>;", "JSX expressions must have one parent"),
                ("props vs state", "data flow mechanisms", "external vs internal data", "props: read-only, parent-to-child; state: mutable, component-local", "const [count, setCount] = useState(0);", "lifting state up pattern"),
                ("controlled vs uncontrolled components", "form input management", "React state vs DOM state", "controlled: value + onChange; uncontrolled: ref + defaultValue", "<input value={name} onChange={e => setName(e.target.value)} />", "hybrid approaches"),
                ("keys in lists", "element identification", "efficient list reconciliation", "stable, unique, predictable identifiers", "{items.map(item => <div key={item.id}>...</div>)}", "index as key anti-pattern"),
                ("lifting state up", "shared state management", "moving state to common ancestor", "single source of truth", "Parent holds state, passes to siblings via props", "prop drilling problem"),
            ],
            "Hooks": [
                ("useState", "state hook", "functional component state", "array destructuring, updater function", "const [count, setCount] = useState(0);", "stale closure with state"),
                ("useEffect", "side effect hook", "synchronization with external systems", "cleanup function, dependency array", "useEffect(() => { subscribe(); return () => unsubscribe(); }, [id]);", "missing dependencies, infinite loops"),
                ("useContext", "context consumption hook", "avoiding prop drilling", "Provider/Consumer pattern simplification", "const theme = useContext(ThemeContext);", "context re-renders all consumers"),
                ("useReducer", "complex state hook", "state logic centralization", "reducer pattern, dispatch actions", "const [state, dispatch] = useReducer(reducer, initialState);", "vs useState for complex objects"),
                ("useMemo", "memoization hook", "caching expensive computations", "dependency array, reference equality", "const memoizedValue = useMemo(() => compute(a, b), [a, b]);", "over-memoization overhead"),
                ("useCallback", "function memoization hook", "stable function references", "prevents child re-renders", "const handleClick = useCallback(() => { ... }, [deps]);", "useCallback without useMemo on children"),
                ("useRef", "mutable reference hook", "persisting values across renders", "DOM references, previous values, intervals", "const inputRef = useRef(null);", "ref.current mutation doesn't trigger re-render"),
                ("custom hooks", "reusable logic extraction", "sharing stateful logic", "naming convention useXxx", "function useWindowSize() { ... return [width, height]; }", "rules of hooks application"),
                ("rules of hooks", "hook usage constraints", "ensuring consistent execution", "only call at top level, only in React functions", "eslint-plugin-react-hooks", "conditional hook call errors"),
            ],
            "Component Patterns": [
                ("Higher-Order Components", "component composition pattern", "cross-cutting concerns reuse", "function returning component", "const withAuth = (Component) => (props) => { ... }", "prop name collision, ref forwarding"),
                ("render props", "component logic sharing", "passing function as prop", "inversion of control", "<DataProvider render={data => <List data={data} />} />", "wrapper hell, React 16.3+ alternatives"),
                ("compound components", "implicit state sharing", "related components working together", "Context API for communication", "<Select><Option value=\"1\">One</Option></Select>", "flexible composition"),
            ],
            "State Management": [
                ("Context API", "built-in state sharing", "avoiding prop drilling", "createContext, Provider, useContext", "const ThemeContext = createContext(defaultValue);", "performance with frequent updates"),
                ("Redux", "predictable state container", "centralized state management", "actions, reducers, store, middleware", "const store = createStore(reducer, applyMiddleware(thunk));", "boilerplate, Redux Toolkit simplification"),
                ("React Query", "server state management", "caching and synchronization", "stale-while-revalidate, background updates", "const { data, isLoading } = useQuery(['todos'], fetchTodos);", "cache invalidation strategies"),
            ],
            "Performance": [
                ("React.memo", "component memoization", "preventing unnecessary re-renders", "shallow prop comparison", "const MemoizedComponent = React.memo(Component, areEqual);", "reference equality pitfalls"),
                ("useMemo vs useCallback", "memoization hooks comparison", "values vs functions caching", "useMemo: cache value; useCallback: cache function", "use for expensive computations", "dependency array correctness"),
                ("code splitting", "lazy loading components", "reducing initial bundle size", "React.lazy, Suspense, dynamic imports", "const LazyComponent = React.lazy(() => import('./Component'));", "fallback UI during load"),
                ("windowing/virtualization", "large list optimization", "rendering visible items only", "react-window, react-virtualized", "<FixedSizeList height={400} itemCount={1000} itemSize={35}>{Row}</FixedSizeList>", "overscan for smooth scrolling"),
                ("Profiler API", "performance measurement", "identifying slow components", "onRender callback", "<Profiler id=\"App\" onRender={onRenderCallback}>", "production profiling"),
            ],
            "Advanced Patterns": [
                ("Error Boundaries", "error catching components", "preventing total UI crash", "componentDidCatch, static getDerivedStateFromError", "class ErrorBoundary extends React.Component { componentDidCatch(error, info) { ... } }", "limitations: event handlers, async"),
                ("Portals", "DOM tree escape", "rendering outside parent hierarchy", "modals, tooltips, overlays", "ReactDOM.createPortal(child, domNode)", "event bubbling through portals"),
                ("Suspense", "async loading state", "declarative loading boundaries", "lazy components, data fetching (experimental)", "<Suspense fallback={<Spinner />}><LazyComponent /></Suspense>", "ErrorBoundary + Suspense pattern"),
                ("Concurrent Mode", "interruptible rendering", "priority-based updates", "Time Slicing, Suspense integration", "ReactDOM.createRoot(document.getElementById('root')).render(<App />);", "useTransition, useDeferredValue"),
                ("forwardRef", "ref passing through components", "exposing DOM nodes to parent", "React.forwardRef", "const FancyButton = React.forwardRef((props, ref) => (<button ref={ref}>{props.label}</button>));", "useImperativeHandle"),
            ],
        }
    },

    "Next.js": {
        "categories": ["Core Concepts", "Routing", "Rendering", "Data Fetching", "API Routes", "Optimization", "Deployment", "App Router"],
        "subcategories": {
            "Core Concepts": ["Pages vs App Router", "File-based Routing", "SSR vs SSG vs ISR", "Image Optimization"],
            "Routing": ["Dynamic Routes", "Nested Routes", "Parallel Routes", "Intercepting Routes"],
            "Rendering": ["Server Components", "Client Components", "Streaming", "Edge Runtime"],
            "Data Fetching": ["getStaticProps", "getServerSideProps", "getInitialProps", "fetch API"],
            "API Routes": ["Route Handlers", "Middleware", "Edge API Routes"],
            "Optimization": ["Image Component", "Font Optimization", "Script Optimization", "Bundle Analysis"],
            "Deployment": ["Vercel", "Docker", "Standalone Output", "Environment Variables"],
            "App Router": ["Server Actions", "Loading UI", "Error Handling", "Route Groups"]
        },
        "concepts": {
            "Core Concepts": [
                ("SSR vs SSG vs ISR", "rendering strategies", "different data freshness approaches", "SSR: request-time render; SSG: build-time render; ISR: revalidate stale content", "export const getStaticProps = async () => { ... }", "choosing strategy per page"),
                ("file-based routing", "automatic route generation", "filesystem as router", "pages/index.tsx -> /, pages/blog/[slug].tsx -> /blog/:slug", "pages directory structure", "App Router vs Pages Router"),
                ("Image component", "automatic image optimization", "responsive images with performance", "lazy loading, placeholder blur, srcset generation", "<Image src=\"/photo.jpg\" width={800} height={600} alt=\"...\" />", "remote image domain configuration"),
                ("API routes", "backend endpoints in Next.js", "serverless functions", "pages/api/hello.ts -> /api/hello", "export default function handler(req, res) { res.json({ name: 'John' }) }", "App Router Route Handlers"),
            ],
            "Rendering": [
                ("Server Components", "React server-side rendering", "zero client JS for components", "direct data access, reduced bundle size", "async function ServerComponent() { const data = await fetchData(); return <div>{data}</div> }", "client component interleaving"),
                ("Client Components", "interactive browser components", "useState, useEffect, event handlers", "'use client' directive", "'use client'\nimport { useState } from 'react'", "server vs client boundary"),
                ("Streaming", "progressive HTML delivery", "improving perceived performance", "React Suspense on server", "<Suspense fallback={<Skeleton />}><SlowComponent /></Suspense>", "selective hydration"),
                ("Edge Runtime", "lightweight execution environment", "globally distributed compute", "V8 isolates, reduced Node.js APIs", "export const runtime = 'edge';", "cold start advantages"),
            ],
            "App Router": [
                ("Server Actions", "server-side mutations", "form submissions without API routes", "async functions running on server", "async function createTodo(formData: FormData) { 'use server'; ... }", "progressive enhancement"),
                ("loading.tsx", "suspense boundaries", "automatic loading states", "colocated with page, shows during data fetch", "export default function Loading() { return <Skeleton />; }", "nested loading states"),
                ("error.tsx", "error boundary components", "graceful error handling", "colocated error UI, resets on navigation", "'use client'\nexport default function Error({ error, reset }) { ... }", "error bubbling"),
                ("parallel routes", "simultaneous page rendering", "split view layouts", "@folder convention", "layout with @team and @analytics slots", "independent loading and error states"),
            ],
            "Optimization": [
                ("font optimization", "automatic web font handling", "zero layout shift fonts", "next/font, CSS variable injection", "import { Inter } from 'next/font/google'; const inter = Inter({ subsets: ['latin'] });", "self-hosting vs Google Fonts"),
                ("middleware", "request interception", "authentication, redirects, rewrites", "Edge Runtime, matcher config", "export function middleware(request: NextRequest) { if (!auth) return NextResponse.redirect('/login'); }", "middleware chaining"),
            ],
        }
    },

    "Node.js": {
        "categories": ["Core", "Event Loop", "Modules", "Streams", "HTTP", "File System", "Child Processes", "Cluster", "Performance"],
        "subcategories": {
            "Core": ["Globals", "Process", "Buffer", "Timers"],
            "Event Loop": ["Phases", "Microtasks", "setImmediate vs setTimeout", "nextTick"],
            "Modules": ["CommonJS", "ES Modules", "Module Resolution", "Circular Dependencies"],
            "Streams": ["Readable", "Writable", "Duplex", "Transform", "Pipeline"],
            "HTTP": ["Server", "Request/Response", "Routing", "Middleware"],
            "File System": ["Sync vs Async", "Streams", "Watch", "Path"],
            "Child Processes": ["spawn", "exec", "fork", "IPC"],
            "Cluster": ["Master-Worker", "Load Balancing", "PM2"],
            "Performance": ["Profiling", "Memory Leaks", "Event Loop Lag", "Worker Threads"]
        },
        "concepts": {
            "Core": [
                ("event loop", "concurrency mechanism", "non-blocking I/O execution", "libuv, phases: timers, pending, poll, check, close", "setTimeout, setImmediate, I/O callbacks", "blocking the event loop"),
                ("process.nextTick", "microtask queue", "highest priority async execution", "executed before event loop continues", "process.nextTick(() => console.log('next tick'));", "nextTick starvation"),
                ("Buffer", "binary data handling", "fixed-size raw memory allocation", "pool allocation, encoding", "Buffer.from('hello'); Buffer.alloc(10);", "Buffer vs Uint8Array"),
                ("global object", "global namespace", "universal access without import", "global, globalThis, process, console, Buffer", "global.myVar = 1;", "pollution, prefer modules"),
            ],
            "Event Loop": [
                ("setImmediate vs setTimeout(0)", "immediate execution scheduling", "check phase vs timer phase", "setImmediate: check phase; setTimeout: timers phase", "setImmediate(() => {}); setTimeout(() => {}, 0);", "execution order in I/O cycle"),
                ("libuv thread pool", "OS operation offloading", "handling blocking operations", "4 threads by default (UV_THREADPOOL_SIZE)", "fs.readFile, crypto.pbkdf2, dns.lookup", "increasing thread pool size"),
                ("microtask queue", "Promise/thenable execution", "between event loop phases", "process.nextTick queue first, then Promise queue", "Promise.resolve().then(() => {});", "microtask queue draining"),
            ],
            "Modules": [
                ("CommonJS vs ES Modules", "module systems comparison", "synchronous vs asynchronous loading", "require/module.exports vs import/export", "const fs = require('fs'); vs import fs from 'fs';", "interop, .mjs, type: module"),
                ("module resolution", "require path lookup", "finding module files", "core -> node_modules -> paths", "require('lodash') -> node_modules/lodash", "NODE_PATH, resolution algorithm"),
                ("circular dependencies", "mutual module requires", "partial exports in cycles", "module.exports cached, incomplete during load", "a requires b, b requires a", "refactoring to avoid cycles"),
            ],
            "Streams": [
                ("stream types", "data processing abstractions", "handling large data efficiently", "Readable, Writable, Duplex, Transform", "fs.createReadStream('file.txt').pipe(process.stdout);", "object mode streams"),
                ("backpressure", "flow control mechanism", "preventing memory overflow", "readable.pause(), writable.write() return value", "pipeline(src, transform, dest, callback);", "highWaterMark tuning"),
                ("pipeline utility", "stream error handling", "graceful stream chaining", "automatic cleanup on error", "const { pipeline } = require('stream');", "vs pipe() for error propagation"),
            ],
            "HTTP": [
                ("http module", "HTTP server creation", "basic web server", "createServer, request/response objects", "http.createServer((req, res) => { res.end('Hello'); }).listen(3000);", "Express.js abstraction"),
                ("keep-alive", "persistent connections", "connection reuse", "default in HTTP/1.1, timeout configuration", "server.keepAliveTimeout = 65000;", "connection limit, memory implications"),
            ],
            "Performance": [
                ("worker threads", "true parallelism", "CPU-intensive task offloading", "isolated V8 instances, SharedArrayBuffer", "const { Worker } = require('worker_threads');", "communication overhead, pool pattern"),
                ("cluster module", "multi-process scaling", "utilizing multiple CPU cores", "master forks workers, round-robin", "cluster.fork();", "shared state challenges, PM2 alternative"),
                ("memory leaks", "unreclaimed memory growth", "gradual process bloat", "event listener accumulation, closure references, global caches", "heapdump analysis", "tools: clinic.js, node --inspect"),
            ],
        }
    },

    "Express.js": {
        "categories": ["Core", "Middleware", "Routing", "Error Handling", "Security", "Performance", "Integration", "Best Practices"],
        "subcategories": {
            "Core": ["App Setup", "Request/Response", "App Mounting", "Settings"],
            "Middleware": ["Application", "Router", "Error", "Third-party"],
            "Routing": ["Route Methods", "Route Parameters", "Route Handlers", "Router"],
            "Error Handling": ["Sync Errors", "Async Errors", "Error Middleware", "Custom Errors"],
            "Security": ["Helmet", "CORS", "Rate Limiting", "Input Validation"],
            "Performance": ["Compression", "Caching", "Clustering", "Connection Pooling"],
            "Integration": ["Template Engines", "Database", "WebSockets", "Passport"],
            "Best Practices": ["Project Structure", "Validation", "Logging", "Testing"]
        },
        "concepts": {
            "Core": [
                ("middleware pattern", "request processing pipeline", "layered function execution", "app.use, sequential order matters", "app.use(express.json()); app.use('/api', routes);", "middleware execution order"),
                ("request-response cycle", "HTTP handling flow", "req -> middleware -> route -> res", "req object, res object, next function", "app.get('/', (req, res, next) => { ... });", "early response termination"),
                ("app mounting", "sub-application composition", "modular route organization", "app.use('/api', apiApp)", "const api = express.Router(); app.use('/api', api);", "path stripping behavior"),
            ],
            "Middleware": [
                ("application middleware", "global request processing", "app-level functionality", "logging, parsing, authentication", "app.use(express.static('public'));", "mount path specificity"),
                ("router middleware", "route-specific processing", "modular route handlers", "Router instance, mountable", "const router = express.Router(); router.get('/users', handler);", "router.param for route params"),
                ("error middleware", "exception handling", "4-argument signature", "catching sync and async errors", "app.use((err, req, res, next) => { res.status(500).json({ error: err.message }); });", "async error propagation"),
            ],
            "Routing": [
                ("route parameters", "URL variable extraction", "dynamic route segments", ":paramName, req.params", "app.get('/users/:id', (req, res) => { const id = req.params.id; });", "regex constraints on params"),
                ("route handlers", "request processing functions", "multiple handlers per route", "array of handlers, next('route')", "app.get('/path', [middleware1, middleware2], handler);", "handler return value ignored"),
            ],
            "Error Handling": [
                ("async error handling", "Promise rejection catching", "wrapping async routes", "express-async-handler, try-catch wrapper", "const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);", "unhandled rejection crash"),
                ("custom error classes", "structured error information", "HTTP status code association", "extending Error", "class NotFoundError extends Error { constructor(message) { super(message); this.statusCode = 404; } }", "error serialization"),
            ],
            "Security": [
                ("helmet middleware", "security headers", "OWASP protection", "X-Frame-Options, CSP, HSTS", "app.use(helmet());", "CSP configuration complexity"),
                ("CORS", "cross-origin resource sharing", "controlling cross-origin requests", "origin, methods, headers, credentials", "app.use(cors({ origin: 'https://example.com', credentials: true }));", "preflight requests"),
                ("rate limiting", "request throttling", "DDoS protection", "windowMs, max, keyGenerator", "app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));", "distributed rate limiting"),
            ],
        }
    },

    "FastAPI": {
        "categories": ["Core", "Routing", "Dependency Injection", "Data Validation", "Async", "Authentication", "Testing", "Deployment"],
        "subcategories": {
            "Core": ["App Creation", "Path Operations", "Request/Response", "Background Tasks"],
            "Routing": ["Path Parameters", "Query Parameters", "Request Body", "File Uploads"],
            "Dependency Injection": ["Depends", "Sub-dependencies", "Security Dependencies"],
            "Data Validation": ["Pydantic Models", "Field Validation", "Custom Validators", "Serialization"],
            "Async": ["Async Endpoints", "Background Tasks", "WebSockets"],
            "Authentication": ["OAuth2", "JWT", "API Keys", "Basic Auth"],
            "Testing": ["TestClient", "Pytest", "Mocking", "Fixtures"],
            "Deployment": ["Uvicorn", "Gunicorn", "Docker", "ASGI"]
        },
        "concepts": {
            "Core": [
                ("ASGI framework", "async server gateway interface", "async Python web framework", "Starlette base, async/await native", "from fastapi import FastAPI; app = FastAPI()", "WSGI vs ASGI"),
                ("path operation decorators", "route definition", "HTTP method binding", "@app.get, @app.post, @app.put, @app.delete", "@app.get('/items/{item_id}')\nasync def read_item(item_id: int): ...", "automatic OpenAPI generation"),
                ("automatic API documentation", "OpenAPI/Swagger generation", "interactive docs", "/docs (Swagger UI), /redoc (ReDoc)", "@app.get('/items', response_model=List[Item])", "customizing OpenAPI schema"),
            ],
            "Routing": [
                ("path parameters", "URL variable binding", "automatic type conversion", "{param}, type hints", "@app.get('/items/{item_id}')\ndef read_item(item_id: int): ...", "path parameter validation"),
                ("query parameters", "URL query string binding", "optional parameter handling", "function arguments not in path", "@app.get('/items/')\ndef read_items(skip: int = 0, limit: int = 10): ...", "required vs optional queries"),
                ("request body", "JSON payload handling", "Pydantic model binding", "BaseModel subclass as parameter", "class Item(BaseModel): name: str; price: float\n@app.post('/items/')\ndef create_item(item: Item): ...", "multiple body params, Body()"),
            ],
            "Dependency Injection": [
                ("Depends", "dependency injection system", "reusable dependencies", "caching, sub-dependencies", "async def get_db(): ...\n@app.get('/items/')\ndef read_items(db: Session = Depends(get_db)): ...", "dependency overrides for testing"),
                ("sub-dependencies", "nested dependency chains", "dependency composition", "Depends within Depends", "def get_query(q: str = None): ...\ndef get_subquery(query: str = Depends(get_query)): ...", "caching behavior"),
            ],
            "Data Validation": [
                ("Pydantic models", "data validation and serialization", "type-annotated data classes", "automatic validation, JSON Schema", "class User(BaseModel): name: str = Field(..., min_length=3); age: int = Field(..., gt=0)", "v1 vs v2 migration"),
                ("Field validators", "custom validation logic", "field-level constraints", "@validator decorator", "@validator('password')\ndef validate_password(cls, v): ...", "root_validator for cross-field"),
            ],
            "Async": [
                ("async endpoints", "non-blocking route handlers", "async/await syntax", "database, HTTP client async operations", "@app.get('/items/')\nasync def read_items(): ...", "sync in async thread pool"),
                ("background tasks", "deferred execution", "returning response before task completion", "BackgroundTasks dependency", "def send_email(email: str, background_tasks: BackgroundTasks): background_tasks.add_task(send_email_task, email)", "task reliability vs Celery"),
            ],
            "Authentication": [
                ("OAuth2 with Password", "built-in OAuth2 flow", "token-based authentication", "OAuth2PasswordBearer, OAuth2PasswordRequestForm", "oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')", "JWT token creation"),
            ],
        }
    },

    "Django": {
        "categories": ["Core", "ORM", "Views", "Templates", "Forms", "Admin", "Security", "Testing", "Deployment"],
        "subcategories": {
            "Core": ["MTV Architecture", "Settings", "Apps", "Middleware", "Signals"],
            "ORM": ["Models", "Queries", "Managers", "Migrations", "Raw SQL", "Aggregation"],
            "Views": ["Function Views", "Class-Based Views", "Generic Views", "ViewSets", "DRF"],
            "Templates": ["Template Language", "Inheritance", "Filters", "Tags", "Custom Tags"],
            "Forms": ["Form Classes", "Model Forms", "Validation", "Widgets", "Formsets"],
            "Admin": ["ModelAdmin", "Inlines", "Actions", "Customization"],
            "Security": ["CSRF", "XSS", "SQL Injection", "Clickjacking", "Password Hashing"],
            "Testing": ["Unit Tests", "Integration Tests", "Test Client", "Fixtures", "Mocking"],
            "Deployment": ["WSGI", "ASGI", "Static Files", "Media Files", "Caching"]
        },
        "concepts": {
            "Core": [
                ("MTV architecture", "Model-Template-View pattern", "Django's MVC variant", "Model: data layer, Template: presentation, View: business logic", "urls.py -> views.py -> models.py -> templates/", "separation of concerns"),
                ("middleware", "request/response processing hooks", "global request modification", "process_request, process_view, process_response, process_exception", "class SimpleMiddleware: def __init__(self, get_response): ...", "middleware order significance"),
                ("signals", "decoupled event notification", "loose coupling between apps", "pre_save, post_save, pre_delete, request_started", "@receiver(post_save, sender=User)\ndef create_profile(sender, instance, created, **kwargs): ...", "signal vs explicit call tradeoff"),
                ("Django apps", "modular application structure", "reusable components", "models, views, templates, static files", "python manage.py startapp blog", "INSTALLED_APPS registration"),
            ],
            "ORM": [
                ("QuerySet", "lazy query building", "database abstraction layer", "chainable filters, lazy evaluation", "User.objects.filter(is_active=True).select_related('profile').prefetch_related('posts')", "N+1 query problem"),
                ("select_related vs prefetch_related", "query optimization methods", "reducing database queries", "select_related: SQL JOIN for FK/one-to-one; prefetch_related: separate queries for M2M/reverse FK", "Post.objects.select_related('author').prefetch_related('tags')", "overfetching with select_related"),
                ("migrations", "schema version control", "database change tracking", "makemigrations, migrate, squashmigrations", "python manage.py makemigrations; python manage.py migrate", "migration conflicts, data migrations"),
                ("model Meta options", "model metadata configuration", "customizing model behavior", "db_table, ordering, verbose_name, constraints", "class Meta: ordering = ['-created_at']; db_table = 'custom_users'", "abstract base classes"),
                ("raw SQL", "direct database queries", "bypassing ORM for complex queries", "Manager.raw(), connection.cursor()", "User.objects.raw('SELECT * FROM users WHERE age > %s', [18])", "SQL injection prevention with params"),
            ],
            "Views": [
                ("class-based views", "OOP view organization", "reusable view logic", "TemplateView, ListView, DetailView, CreateView", "class PostListView(ListView): model = Post; template_name = 'posts/list.html'", "method dispatch, mixins"),
                ("DRF ViewSets", "RESTful view grouping", "combined list/detail actions", "ModelViewSet, ReadOnlyModelViewSet", "class UserViewSet(viewsets.ModelViewSet): queryset = User.objects.all(); serializer_class = UserSerializer", "router registration"),
                ("DRF serializers", "data serialization/deserialization", "validation and representation", "ModelSerializer, HyperlinkedModelSerializer", "class UserSerializer(serializers.ModelSerializer): class Meta: model = User; fields = ['id', 'name']", "nested serializers, validation"),
            ],
            "Security": [
                ("CSRF protection", "cross-site request forgery prevention", "token-based validation", "{% csrf_token %} in forms, middleware", "django.middleware.csrf.CsrfViewMiddleware", "exempting views with @csrf_exempt"),
                ("Django security middleware", "security header injection", "common vulnerability protection", "SecurityMiddleware: HSTS, XSS filter, content-type nosniff", "SECURE_SSL_REDIRECT, SECURE_HSTS_SECONDS", "deployment checklist"),
            ],
        }
    },

    "Flask": {
        "categories": ["Core", "Routing", "Request/Response", "Templates", "Extensions", "Testing", "Deployment", "Best Practices"],
        "subcategories": {
            "Core": ["App Factory", "Application Context", "Request Context", "Configuration"],
            "Routing": ["Route Decorators", "URL Variables", "HTTP Methods", "URL Building"],
            "Request/Response": ["Request Object", "Response Object", "JSON Handling", "File Uploads"],
            "Templates": ["Jinja2", "Template Inheritance", "Filters", "Macros"],
            "Extensions": ["SQLAlchemy", "Migrate", "Login", "RESTful", "CORS"],
            "Testing": ["Test Client", "Fixtures", "Mocking"],
            "Deployment": ["WSGI", "Gunicorn", "uWSGI", "Docker"],
            "Best Practices": ["Blueprint", "App Factory", "Environment Config", "Logging"]
        },
        "concepts": {
            "Core": [
                ("application context", "application-level state", "shared resources across requests", "current_app, g object", "with app.app_context(): db.create_all()", "context locals and threading"),
                ("request context", "request-level state", "per-request data isolation", "request, session objects", "@app.route('/')\ndef index(): return request.method", "pushing contexts manually"),
                ("app factory pattern", "application creation function", "testability and configuration flexibility", "create_app(config_name)", "def create_app(config_name='default'): app = Flask(__name__); app.config.from_object(configs[config_name]); return app", "blueprint registration in factory"),
                ("Jinja2 templating", "template engine integration", "HTML generation with logic", "variables, filters, control structures, inheritance", "{% extends 'base.html' %}{% block content %}...{% endblock %}", "autoescaping security"),
            ],
            "Routing": [
                ("URL variable rules", "dynamic route segments", "type conversion and validation", "<converter:variable_name>", "@app.route('/user/<int:user_id>')", "custom converters"),
                ("url_for", "URL generation", "reverse routing", "endpoint name, argument binding", "url_for('user_profile', user_id=1)", "external URLs, _external=True"),
            ],
            "Extensions": [
                ("Flask-SQLAlchemy", "ORM integration", "database abstraction", "Model base class, query interface", "db = SQLAlchemy(app); class User(db.Model): id = db.Column(db.Integer, primary_key=True)", "session management, connection pooling"),
                ("Flask-Login", "session management", "user authentication state", "login_user, logout_user, current_user", "@login_required\ndef dashboard(): ...", "user_loader callback"),
                ("Blueprints", "application modularization", "component-based organization", "routes, templates, static files grouping", "bp = Blueprint('auth', __name__, url_prefix='/auth'); app.register_blueprint(bp)", "blueprint-specific templates/static"),
            ],
        }
    }
}

TOPIC_MAPS["SQL"] = {
    "categories": ["Core Concepts", "DDL", "DML", "DQL", "Joins", "Subqueries", "Indexes", "Transactions", "Optimization"],
    "subcategories": {
        "Core Concepts": ["Relational Model", "Normalization", "ACID", "Constraints", "Keys"],
        "DDL": ["CREATE", "ALTER", "DROP", "TRUNCATE"],
        "DML": ["INSERT", "UPDATE", "DELETE", "MERGE"],
        "DQL": ["SELECT", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "Window Functions"],
        "Joins": ["INNER", "LEFT", "RIGHT", "FULL", "CROSS", "SELF", "NATURAL"],
        "Subqueries": ["Correlated", "Non-correlated", "EXISTS", "IN", "ANY/ALL"],
        "Indexes": ["B-Tree", "Hash", "Composite", "Covering", "Partial"],
        "Transactions": ["BEGIN", "COMMIT", "ROLLBACK", "Isolation Levels", "Savepoints"],
        "Optimization": ["Query Plans", "EXPLAIN", "Partitioning", "Sharding"]
    },
    "concepts": {
        "Core Concepts": [
            ("normalization", "database design process", "reducing redundancy and dependency", "1NF, 2NF, 3NF, BCNF, 4NF, 5NF", "decomposing tables to eliminate partial and transitive dependencies", "over-normalization causing join overhead"),
            ("ACID properties", "transaction guarantees", "reliability and consistency", "Atomicity, Consistency, Isolation, Durability", "BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; COMMIT;", "BASE vs ACID in distributed systems"),
            ("primary key vs foreign key", "key type comparison", "entity identification vs relationship", "PK: unique, not null; FK: references PK, maintains referential integrity", "CREATE TABLE orders (id INT PRIMARY KEY, user_id INT REFERENCES users(id));", "surrogate vs natural keys"),
            ("constraints", "data integrity rules", "enforcing business rules", "NOT NULL, UNIQUE, CHECK, DEFAULT, FOREIGN KEY", "ALTER TABLE products ADD CONSTRAINT chk_price CHECK (price > 0);", "constraint validation overhead"),
        ],
        "DQL": [
            ("window functions", "analytical computations", "calculations across row sets", "ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, SUM() OVER", "SELECT name, salary, RANK() OVER (ORDER BY salary DESC) as rank FROM employees;", "PARTITION BY vs GROUP BY"),
            ("GROUP BY vs DISTINCT", "duplication elimination methods", "different use cases and performance", "GROUP BY: aggregation; DISTINCT: unique rows", "SELECT DISTINCT department FROM employees;", "GROUP BY with HAVING filter"),
            ("CTE", "Common Table Expressions", "named temporary result sets", "recursive CTEs for hierarchies", "WITH RECURSIVE subordinates AS (SELECT id FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id FROM employees e JOIN subordinates s ON e.manager_id = s.id) SELECT * FROM subordinates;", "CTE vs subquery performance"),
            ("EXISTS vs IN", "subquery existence checking", "semantically similar, different performance", "EXISTS: stops at first match; IN: builds complete result set", "SELECT * FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.id);", "NULL handling differences"),
        ],
        "Joins": [
            ("JOIN types", "table combination methods", "different result sets from joins", "INNER: matching only; LEFT: all left + matching right; RIGHT: all right + matching left; FULL: all from both", "SELECT * FROM A LEFT JOIN B ON A.id = B.id;", "NULL handling in outer joins"),
            ("CROSS JOIN", "Cartesian product", "all row combinations", "explicit vs implicit (comma syntax)", "SELECT * FROM colors CROSS JOIN sizes;", "accidental Cartesian products"),
            ("SELF JOIN", "table joined with itself", "hierarchical or comparative queries", "aliasing required", "SELECT e.name, m.name as manager FROM employees e JOIN employees m ON e.manager_id = m.id;", "performance on large tables"),
        ],
        "Indexes": [
            ("B-Tree index", "balanced tree structure", "default index type", "O(log n) search, range queries, sorted order", "CREATE INDEX idx_name ON users(name);", "write overhead, fill factor"),
            ("composite index", "multi-column index", "covering multiple query predicates", "column order matters (leading edge)", "CREATE INDEX idx_name_age ON users(name, age);", "index-only scans"),
            ("covering index", "index with all query columns", "avoiding table access", "INCLUDE clause or composite covering", "CREATE INDEX idx_cover ON orders(user_id) INCLUDE (total, date);", "index size tradeoff"),
            ("index scan vs table scan", "data access methods", "query plan choices", "index scan: read index then table; index-only scan: read index only; seq scan: read entire table", "EXPLAIN ANALYZE SELECT * FROM large_table WHERE non_indexed_col = 1;", "statistics and cardinality"),
        ],
        "Transactions": [
            ("isolation levels", "transaction isolation degrees", "concurrency control tradeoffs", "READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE", "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;", "phantom reads, non-repeatable reads, dirty reads"),
            ("deadlock", "circular dependency blocking", "transaction mutual blocking", "detection (timeout/graph) vs prevention (ordering)", "Transaction A locks X waits for Y; Transaction B locks Y waits for X", "deadlock victim selection"),
            ("MVCC", "Multi-Version Concurrency Control", "non-blocking reads", "maintaining multiple versions of data", "PostgreSQL, InnoDB implementation", "vacuum/ purge necessity"),
        ],
        "Optimization": [
            ("query execution plan", "optimizer's chosen strategy", "understanding query performance", "EXPLAIN, EXPLAIN ANALYZE, cost estimation", "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT ...;", "cost model limitations"),
            ("partitioning", "table horizontal splitting", "improving query performance and maintenance", "range, list, hash partitioning", "CREATE TABLE measurements (logdate date not null, peaktemp int) PARTITION BY RANGE (logdate);", "partition pruning, partition-wise joins"),
        ],
    }
}

TOPIC_MAPS["MySQL"] = {
    "categories": ["Architecture", "Storage Engines", "Indexing", "Replication", "Performance", "Security", "Backup", "Advanced Features"],
    "subcategories": {
        "Architecture": ["Server Layers", "Connection Handling", "Query Cache", "Optimizer"],
        "Storage Engines": ["InnoDB", "MyISAM", "Memory", "Archive"],
        "Indexing": ["B+Tree", "Full-text", "Spatial", "Invisible Indexes"],
        "Replication": ["Binary Log", "Master-Slave", "Master-Master", "GTID", "Group Replication"],
        "Performance": ["Query Optimization", "Connection Pooling", "Buffer Pool", "Slow Query Log"],
        "Security": ["Users/Privileges", "SSL", "Audit Log", "Data Masking"],
        "Backup": ["mysqldump", "XtraBackup", "Point-in-Time Recovery"],
        "Advanced Features": ["JSON", "Window Functions", "CTEs", "Generated Columns"]
    },
    "concepts": {
        "Architecture": [
            ("InnoDB architecture", "default storage engine", "ACID compliance, row-level locking", "buffer pool, change buffer, adaptive hash index, redo log", "SHOW ENGINE INNODB STATUS;", "innodb_buffer_pool_size tuning"),
            ("query execution flow", "MySQL request processing", "parsing, optimization, execution", "parser, preprocessor, optimizer, execution engine", "query -> parse tree -> execution plan -> result", "query rewrite plugin"),
        ],
        "Storage Engines": [
            ("InnoDB vs MyISAM", "storage engine comparison", "transactional vs non-transactional", "InnoDB: ACID, row locks, crash safe; MyISAM: table locks, full-text, smaller footprint", "CREATE TABLE t (id INT) ENGINE=InnoDB;", "MyISAM deprecation"),
            ("buffer pool", "InnoDB memory cache", "data and index caching", "LRU algorithm, warm-up", "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';", "multiple buffer pool instances"),
        ],
        "Replication": [
            ("binary log", "replication event log", "change recording for replication", "statement-based, row-based, mixed format", "SHOW MASTER STATUS; SHOW BINLOG EVENTS;", "binlog retention, purge"),
            ("replication topologies", "data distribution patterns", "read scaling and HA", "master-slave, master-master, chain, ring", "CHANGE MASTER TO MASTER_HOST='...', MASTER_LOG_FILE='...';", "split-brain in master-master"),
            ("GTID", "Global Transaction Identifier", "simplified replication management", "unique transaction identifier across cluster", "gtid_mode=ON, enforce_gtid_consistency=ON", "GTID gaps, auto-positioning"),
        ],
        "Performance": [
            ("slow query log", "performance monitoring", "identifying slow queries", "long_query_time, log_queries_not_using_indexes", "SET GLOBAL slow_query_log = 'ON';", "pt-query-digest analysis"),
            ("EXPLAIN output", "query plan analysis", "understanding MySQL optimizer decisions", "type, possible_keys, key, rows, Extra columns", "EXPLAIN FORMAT=JSON SELECT ...;", "using index, using where, using temporary"),
            ("connection pooling", "connection reuse", "reducing connection overhead", "max_connections, thread_cache_size, connection pool (app side)", "HikariCP, c3p0, Druid", "too many connections error"),
        ],
        "Advanced Features": [
            ("JSON data type", "native JSON storage", "structured document support", "JSON functions, generated columns, indexing", "SELECT * FROM users WHERE JSON_EXTRACT(preferences, '$.theme') = 'dark';", "JSON vs normalized design"),
            ("window functions", "analytical query support", "MySQL 8.0 feature", "ROW_NUMBER, RANK, LAG, LEAD, NTILE", "SELECT name, salary, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) FROM employees;", "frame specification"),
        ],
    }
}

TOPIC_MAPS["PostgreSQL"] = {
    "categories": ["Architecture", "Data Types", "Indexing", "Advanced SQL", "Replication", "Performance", "Extensions", "Security"],
    "subcategories": {
        "Architecture": ["Processes", "Shared Memory", "WAL", "Vacuum"],
        "Data Types": ["Arrays", "JSON/JSONB", "UUID", "Range", "Geometric", "Custom"],
        "Indexing": ["B-Tree", "Hash", "GiST", "GIN", "SP-GiST", "BRIN", "Partial", "Expression"],
        "Advanced SQL": ["CTEs", "Window Functions", "Lateral Joins", "Recursive Queries"],
        "Replication": ["Streaming", "Logical", "Slony", "Bucardo"],
        "Performance": ["EXPLAIN", "VACUUM", "ANALYZE", "Partitioning", "Parallel Query"],
        "Extensions": ["PostGIS", "pg_stat_statements", "uuid-ossp", "hstore"],
        "Security": ["Row Level Security", "Encryption", "SSL", "LDAP"]
    },
    "concepts": {
        "Architecture": [
            ("process architecture", "multi-process model", "connection = process", "postmaster, backend processes, background writer, WAL writer, autovacuum", "max_connections, shared_buffers", "connection pooling necessity"),
            ("WAL", "Write-Ahead Logging", "durability mechanism", "changes written to log before data files", "wal_level, max_wal_size, archive_mode", "WAL archiving for PITR"),
            ("vacuum", "dead tuple cleanup", "storage reclamation and transaction ID wraparound", "VACUUM, VACUUM FULL, autovacuum", "autovacuum_vacuum_scale_factor", "transaction ID wraparound, freeze"),
            ("MVCC implementation", "multi-version concurrency", "reader doesn't block writer", "xmin, xmax system columns, snapshot isolation", "SELECT xmin, xmax, * FROM table;", "bloat from dead tuples"),
        ],
        "Data Types": [
            ("JSONB", "binary JSON storage", "efficient JSON querying and indexing", "decomposed binary format, GIN indexing", "SELECT data->>'name' FROM users WHERE data @> '{\"active\": true}';", "JSON vs JSONB: storage and performance"),
            ("arrays", "native array support", "multi-value columns", "array operators, indexing, unnest", "SELECT * FROM table WHERE tags && ARRAY['python', 'sql'];", "multidimensional arrays"),
            ("range types", "interval data representation", "contiguous data ranges", "int4range, tsrange, daterange, overlap operators", "SELECT * FROM events WHERE during @> '2023-01-01'::date;", "temporal ranges, exclusion constraints"),
        ],
        "Indexing": [
            ("GIN index", "Generalized Inverted Index", "composite value indexing", "full-text search, array, jsonb", "CREATE INDEX idx ON docs USING GIN (to_tsvector('english', content));", "fast update, pending list"),
            ("GiST index", "Generalized Search Tree", "balanced tree for complex data", "geometric, range, full-text", "CREATE INDEX idx ON locations USING GiST (coordinates);", "lossy indexing"),
            ("BRIN index", "Block Range Index", "large sorted dataset indexing", "summary per page range, tiny size", "CREATE INDEX idx ON measurements USING BRIN (created_at);", "correlation requirement"),
            ("partial index", "subset table indexing", "indexing frequently accessed subset", "WHERE clause in index definition", "CREATE INDEX idx ON orders (created_at) WHERE status = 'pending';", "smaller index, faster queries"),
        ],
        "Advanced SQL": [
            ("LATERAL join", "correlated subquery in FROM", "row-by-row dependent join", "right side can reference left side", "SELECT u.name, p.title FROM users u, LATERAL (SELECT title FROM posts WHERE user_id = u.id ORDER BY created_at DESC LIMIT 3) p;", "vs correlated subquery performance"),
            ("recursive CTE", "hierarchical query support", "tree/graph traversal in SQL", "WITH RECURSIVE", "WITH RECURSIVE tree AS (SELECT id, name, 0 as depth FROM categories WHERE parent_id IS NULL UNION ALL SELECT c.id, c.name, t.depth + 1 FROM categories c JOIN tree t ON c.parent_id = t.id) SELECT * FROM tree;", "cycle detection"),
        ],
        "Replication": [
            ("streaming replication", "WAL-based replication", "hot standby, read scaling", "synchronous, asynchronous, cascading", "primary_conninfo, recovery.conf", "replication lag monitoring"),
            ("logical replication", "publish-subscribe replication", "selective table replication", "publication, subscription, replication slots", "CREATE PUBLICATION mypub FOR TABLE users, orders;", "conflict resolution, DDL limitations"),
        ],
        "Performance": [
            ("parallel query", "multi-worker execution", "CPU-intensive query acceleration", "parallel seq scan, parallel index scan, parallel join", "SET max_parallel_workers_per_gather = 4;", "when not to use parallel query"),
            ("partitioning", "table splitting strategies", "large table management", "declarative partitioning: range, list, hash", "CREATE TABLE measurements (logdate date, peaktemp int) PARTITION BY RANGE (logdate);", "partition pruning, partition-wise join"),
        ],
    }
}

TOPIC_MAPS["MongoDB"] = {
    "categories": ["Core Concepts", "CRUD Operations", "Indexing", "Aggregation", "Replication", "Sharding", "Schema Design", "Performance"],
    "subcategories": {
        "Core Concepts": ["Documents", "Collections", "BSON", "ObjectId", "Schema Validation"],
        "CRUD Operations": ["Insert", "Find", "Update", "Delete", "Bulk Operations"],
        "Indexing": ["Single Field", "Compound", "Multikey", "Text", "Geospatial", "Wildcard", "TTL"],
        "Aggregation": ["Pipeline", "Stages", "Operators", "Lookup", "Facet"],
        "Replication": ["Replica Set", "Oplog", "Elections", "Arbiter"],
        "Sharding": ["Shard Key", "Chunks", "Balancer", "Zones"],
        "Schema Design": ["Embedding", "Referencing", "One-to-One", "One-to-Many", "Many-to-Many"],
        "Performance": ["Explain", "Profiler", "WiredTiger", "Connection Pool"]
    },
    "concepts": {
        "Core Concepts": [
            ("document model", "BSON document storage", "flexible schema design", "JSON-like documents with rich types", "{ _id: ObjectId('...'), name: 'John', tags: ['a', 'b'], metadata: { created: ISODate() } }", "16MB document limit"),
            ("ObjectId", "12-byte identifier", "auto-generated primary key", "timestamp + machine + pid + counter", "ObjectId('507f1f77bcf86cd799439011')", "sorting by creation time"),
            ("schema validation", "document structure enforcement", "optional schema constraints", "$jsonSchema, validationLevel, validationAction", "db.createCollection('users', { validator: { $jsonSchema: { required: ['email'] } } })", "flexibility vs strictness tradeoff"),
        ],
        "CRUD Operations": [
            ("find with operators", "query operator usage", "flexible document querying", "$eq, $ne, $gt, $lt, $in, $nin, $regex, $exists, $type", "db.users.find({ age: { $gte: 18, $lte: 65 }, status: { $in: ['active', 'premium'] } })", "index usage with operators"),
            ("update operators", "document modification", "atomic field updates", "$set, $unset, $inc, $push, $pull, $addToSet, $pop", "db.users.updateOne({ _id: 1 }, { $inc: { views: 1 }, $push: { tags: 'new' } })", "upsert behavior"),
            ("projection", "field selection", "limiting returned data", "inclusion (1), exclusion (0), _id always included unless excluded", "db.users.find({}, { name: 1, email: 1, _id: 0 })", "cannot mix inclusion and exclusion except _id"),
        ],
        "Indexing": [
            ("compound index", "multi-field index", "supporting multi-predicate queries", "field order matters (ESR rule)", "db.users.createIndex({ status: 1, created_at: -1 })", "index intersection vs compound index"),
            ("multikey index", "array field indexing", "indexing array elements", "one index entry per array element", "db.products.createIndex({ tags: 1 })", "compound multikey index limitations"),
            ("text index", "full-text search index", "text search on string content", "stemming, stop words, weights", "db.articles.createIndex({ title: 'text', content: 'text' }, { weights: { title: 10, content: 5 } })", "text search score"),
            ("TTL index", "time-to-live index", "automatic document expiration", "single field date index with expireAfterSeconds", "db.sessions.createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 })", "background cleanup, not precise"),
        ],
        "Aggregation": [
            ("aggregation pipeline", "data processing framework", "stage-based transformation", "$match, $group, $sort, $project, $lookup, $unwind", "db.orders.aggregate([{ $match: { status: 'shipped' } }, { $group: { _id: '$customer_id', total: { $sum: '$amount' } } }])", "pipeline optimization, index usage"),
            ("$lookup", "left outer join equivalent", "combining documents from other collections", "from, localField, foreignField, as", "db.orders.aggregate([{ $lookup: { from: 'customers', localField: 'customer_id', foreignField: '_id', as: 'customer' } }])", "unwinding lookup results"),
            ("$facet", "multi-stage parallel processing", "single input multiple aggregations", "sub-pipelines in one stage", "db.products.aggregate([{ $facet: { byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }], avgPrice: [{ $group: { _id: null, avg: { $avg: '$price' } } }] } }])", "facet memory limit"),
        ],
        "Schema Design": [
            ("embedding vs referencing", "data relationship modeling", "denormalization decision", "embedding: single document read, atomic updates; referencing: avoid duplication, flexible", "embedded: { author: { name: '...', email: '...' } } vs referenced: { author_id: ObjectId('...') }", "array growth, working set size"),
            ("bucket pattern", "time-series data modeling", "reducing document count", "grouping events into time buckets", "{ sensor_id: '...', date: '2023-01-01', measurements: [{ time: '00:00', value: 20 }, ...] }", "pre-aggregation in buckets"),
        ],
        "Replication & Sharding": [
            ("replica set", "high availability cluster", "automatic failover", "primary, secondaries, arbiter, oplog", "rs.initiate(), rs.add(), rs.status()", "write concern, read preference"),
            ("shard key", "distribution field", "horizontal partitioning basis", "cardinality, frequency, monotonicity considerations", "sh.shardCollection('db.collection', { user_id: 'hashed' })", "jumbo chunks, hot shard"),
        ],
    }
}

TOPIC_MAPS["Redis"] = {
    "categories": ["Data Structures", "Persistence", "Replication", "Clustering", "Performance", "Caching Patterns", "Pub/Sub", "Advanced"],
    "subcategories": {
        "Data Structures": ["Strings", "Hashes", "Lists", "Sets", "Sorted Sets", "Bitmaps", "HyperLogLog", "Streams", "Geospatial"],
        "Persistence": ["RDB", "AOF", "Hybrid", "Rewrite"],
        "Replication": ["Master-Replica", "Sentinel", "Replicaof"],
        "Clustering": ["Hash Slots", "Cluster Bus", "Resharding", "Failover"],
        "Performance": ["Pipelining", "Lua Scripting", "Transactions", "Connection Pool"],
        "Caching Patterns": ["Cache-Aside", "Write-Through", "Write-Behind", "TTL", "Eviction Policies"],
        "Pub/Sub": ["Channels", "Patterns", "Message Broadcasting"],
        "Advanced": ["RedisJSON", "RediSearch", "RedisGraph", "RedisTimeSeries", "RedisAI"]
    },
    "concepts": {
        "Data Structures": [
            ("sorted sets", "ordered unique collection", "ranking and leaderboard", "score-based ordering, O(log n) ops", "ZADD leaderboard 100 'player1'; ZREVRANGE leaderboard 0 9 WITHSCORES", "same score tie-breaking by lexicographic"),
            ("hashes", "field-value mapping", "object-like storage", "HSET, HGET, HGETALL, HMSET", "HSET user:1000 name 'John' age 30", "hash max field count (512M), rehashing"),
            ("lists", "linked list implementation", "queue and stack operations", "LPUSH, RPUSH, LPOP, RPOP, LRANGE, LTRIM", "LPUSH queue 'job1'; BRPOP queue 30", "quicklist encoding (ziplist + linked list)"),
            ("sets", "unordered unique collection", "membership and set operations", "SADD, SINTER, SUNION, SDIFF, SISMEMBER", "SADD tags:post1 'redis' 'database'; SINTER tags:post1 tags:post2", "set cardinality limits"),
            ("streams", "append-only log structure", "event sourcing and messaging", "XADD, XREAD, XGROUP, XACK, consumer groups", "XADD mystream * sensor-id 1234 temperature 19.8", "stream trimming, pending entries"),
            ("geospatial", "location data indexing", "geographic queries", "GEOADD, GEORADIUS, GEODIST, GEOHASH", "GEOADD cities 13.361389 38.115556 'Palermo'", "geohash precision, radius queries"),
        ],
        "Persistence": [
            ("RDB snapshotting", "point-in-time backup", "fork-based persistence", "SAVE, BGSAVE, save configuration", "save 900 1 # save after 900 sec if 1 key changed", "fork copy-on-write memory doubling"),
            ("AOF", "Append-Only File", "command log replay", "everysec, always, no fsync policies", "appendfsync everysec", "AOF rewrite for compaction"),
            ("hybrid persistence", "RDB + AOF combined", "Redis 4.0+ feature", "aof-use-rdb-preamble yes", "fast restarts with full durability", "AOF file size bloating before rewrite"),
        ],
        "Caching Patterns": [
            ("cache-aside", "lazy loading pattern", "application-managed caching", "check cache, load from DB on miss, populate cache", "data = cache.get(key); if not data: data = db.get(key); cache.set(key, data, ttl)", "cache stampede prevention"),
            ("write-through", "synchronous write pattern", "cache and DB updated together", "write to cache and DB simultaneously", "cache.set(key, value); db.write(key, value)", "write latency increase"),
            ("eviction policies", "memory full handling", "determining which keys to remove", "noeviction, allkeys-lru, volatile-lru, allkeys-random, volatile-ttl", "maxmemory-policy allkeys-lru", "approximated LRU (sampled)"),
            ("cache stampede", "simultaneous cache miss", "thundering herd problem", "multiple requests for expired key", "per-item random jitter, probabilistic early expiration, mutex/lock", "LOCKSET pattern with SET NX"),
        ],
        "Performance": [
            ("pipelining", "batch command execution", "reducing RTT overhead", "sending multiple commands without waiting for responses", "pipeline = r.pipeline(); pipeline.get('a'); pipeline.set('b', 2); pipeline.execute()", "transactional pipeline"),
            ("Lua scripting", "server-side execution", "atomic multi-command operations", "EVAL, EVALSHA, script load", "EVAL 'return redis.call(\"get\", KEYS[1]) + redis.call(\"get\", KEYS[2])' 2 key1 key2", "script replication in cluster"),
            ("transactions", "atomic command grouping", "MULTI/EXEC block", "no rollback, optimistic locking with WATCH", "WATCH mykey; MULTI; INCR mykey; EXEC;", "WATCH failure handling"),
        ],
        "Replication & Clustering": [
            ("Redis Sentinel", "high availability solution", "monitoring, notification, auto-failover", "sentinel quorum, subjective down, objective down", "sentinel monitor mymaster 127.0.0.1 6379 2", "split-brain protection"),
            ("Redis Cluster", "distributed Redis", "automatic sharding and failover", "16384 hash slots, cluster bus, gossip protocol", "redis-cli --cluster create node1:6379 node2:6379 --cluster-replicas 1", "multi-key operation constraints"),
        ],
    }
}

TOPIC_MAPS["Firebase"] = {
    "categories": ["Core Services", "Firestore", "Realtime Database", "Authentication", "Cloud Functions", "Storage", "Hosting", "Security"],
    "subcategories": {
        "Core Services": ["Project Setup", "SDK Integration", "Emulator Suite", "CLI"],
        "Firestore": ["Collections", "Documents", "Queries", "Indexes", "Transactions", "Batch Writes"],
        "Realtime Database": ["JSON Tree", "Listeners", "Offline Persistence", "Rules"],
        "Authentication": ["Email/Password", "OAuth", "Anonymous", "Custom Auth", "JWT"],
        "Cloud Functions": ["HTTP", "Firestore Triggers", "Auth Triggers", "Scheduled", "Pub/Sub"],
        "Storage": ["Buckets", "Upload", "Download", "Metadata", "Security Rules"],
        "Hosting": ["Deploy", "CDN", "Rewrites", "Headers", "SSR"],
        "Security": ["Security Rules", "App Check", "IAM", "Service Accounts"]
    },
    "concepts": {
        "Firestore": [
            ("document model", "NoSQL document database", "hierarchical collection-document structure", "collections contain documents, documents contain subcollections", "users/{userId}/orders/{orderId}", "100k subcollections per document"),
            ("queries", "document retrieval", "single-collection queries with indexing", "where, orderBy, limit, startAfter", "db.collection('users').where('age', '>=', 18).orderBy('age').limit(10)", "composite index requirements"),
            ("transactions", "atomic multi-document operations", "all-or-nothing updates", "read before write within transaction", "db.runTransaction(async (t) => { const doc = await t.get(ref); t.update(ref, { count: doc.data().count + 1 }); })", "transaction timeout, conflict resolution"),
            ("offline persistence", "local data caching", "offline read and write support", "enabled by default on mobile, disabled on web", "await db.enablePersistence({ synchronizeTabs: true })", "conflict resolution, data consistency"),
        ],
        "Authentication": [
            ("Firebase Auth", "managed authentication service", "multiple provider support", "email/password, Google, Facebook, GitHub, anonymous", "const provider = new GoogleAuthProvider(); signInWithPopup(auth, provider);", "custom claims, ID tokens"),
            ("ID Token", "JWT identity token", "secure user identification", "signed by Firebase, contains claims", "const token = await user.getIdToken();", "token refresh, verification with Admin SDK"),
            ("custom claims", "additional user attributes", "role-based access control", "set via Admin SDK, accessible in rules", "admin.auth().setCustomUserClaims(uid, { admin: true })", "claim propagation delay"),
        ],
        "Cloud Functions": [
            ("Firestore triggers", "database event functions", "reacting to document changes", "onCreate, onUpdate, onDelete, onWrite", "functions.firestore.document('users/{userId}').onCreate((snap, context) => { ... })", "cold start latency"),
            ("callable functions", "client-callable HTTPS functions", "authenticated client invocation", "automatic auth context, CORS handled", "const addMessage = httpsCallable(functions, 'addMessage'); const result = await addMessage({ text: 'Hello' });", "input validation"),
        ],
        "Security": [
            ("security rules", "access control language", "database and storage authorization", "allow/deny based on auth, data, request", "match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; }", "rules cascade, testing with emulator"),
            ("App Check", "app attestation", "preventing unauthorized API access", "reCAPTCHA v3, DeviceCheck, Play Integrity", "const appCheck = initializeAppCheck(app, { provider: new ReCaptchaV3Provider('...') })", "bypass for development"),
        ],
    }
}

# Arrays
TOPIC_MAPS["Arrays"] = {
    "categories": ["Fundamentals", "Operations", "Searching", "Sorting", "Two Pointers", "Sliding Window", "Prefix Sum", "Matrix"],
    "subcategories": {
        "Fundamentals": ["Declaration", "Memory Layout", "Time Complexity", "Space Complexity"],
        "Operations": ["Insertion", "Deletion", "Traversal", "Rotation", "Reversal"],
        "Searching": ["Linear Search", "Binary Search", "Search in Rotated Array", "First/Last Occurrence"],
        "Sorting": ["Bubble", "Selection", "Insertion", "Merge", "Quick", "Heap", "Counting", "Radix"],
        "Two Pointers": ["Pair Sum", "3Sum", "Container With Most Water", "Trapping Rain Water"],
        "Sliding Window": ["Fixed Size", "Variable Size", "Maximum Sum Subarray", "Longest Substring"],
        "Prefix Sum": ["Range Queries", "Equilibrium Point", "Subarray Sum Equals K"],
        "Matrix": ["Spiral Order", "Rotate Matrix", "Search in 2D", "Set Zeroes"]
    },
    "concepts": {
        "Fundamentals": [
            ("contiguous memory allocation", "array storage characteristic", "sequential memory blocks", "O(1) access via index calculation: base_address + index * element_size", "int arr[10]; // 40 contiguous bytes", "cache locality advantage"),
            ("dynamic arrays", "resizable array implementation", "amortized O(1) append", "vector, ArrayList, Python list: double capacity on full", "ArrayList<Integer> list = new ArrayList<>(); list.add(5);", "resizing cost analysis"),
            ("time complexity tradeoffs", "array operation costs", "access vs insertion vs deletion", "access: O(1), search: O(n), insert/delete: O(n)", "arr[5] = 10; // O(1)", "sorted array binary search: O(log n)"),
        ],
        "Two Pointers": [
            ("two pointer technique", "pairwise iteration strategy", "reducing nested loops to linear", "sorted array pair sum, 3Sum, Dutch national flag", "while (left < right) { if (arr[left] + arr[right] == target) found; }", "pointer movement conditions"),
            ("sliding window", "subarray/substring processing", "efficient contiguous sequence analysis", "fixed/variable size window, expand/shrink", "max_sum = max(max_sum, window_sum); window_sum += arr[i] - arr[i-k];", "window state maintenance"),
        ],
        "Searching": [
            ("binary search", "divide and conquer search", "O(log n) sorted array search", "mid calculation, boundary adjustment", "while (low <= high) { mid = low + (high - low) / 2; if (arr[mid] == target) return mid; }", "integer overflow in mid, lower/upper bound variants"),
            ("search in rotated sorted array", "modified binary search", "finding pivot and searching", "identifying sorted half, pivot detection", "if (arr[low] <= arr[mid]) // left half sorted", "duplicates handling"),
        ],
        "Matrix": [
            ("matrix traversal patterns", "2D array access strategies", "row-major, column-major, diagonal, spiral", "spiral: top->right->bottom->left with boundary shrink", "for (int i = left; i <= right; i++) result.add(matrix[top][i]);", "in-place rotation transposition"),
            ("search in 2D sorted matrix", "efficient 2D search", "O(m+n) staircase search", "start from top-right or bottom-left", "if (matrix[row][col] > target) col--; else row++;", "binary search on rows approach"),
        ],
    }
}

# Strings
TOPIC_MAPS["Strings"] = {
    "categories": ["Fundamentals", "Pattern Matching", "Manipulation", "Dynamic Programming", "Trie", "Suffix Array", "Encoding"],
    "subcategories": {
        "Fundamentals": ["Immutable vs Mutable", "String Pool", "Unicode", "Encoding"],
        "Pattern Matching": ["KMP", "Rabin-Karp", "Z-Algorithm", "Boyer-Moore"],
        "Manipulation": ["Reversal", "Palindrome", "Anagram", "Permutation", "Substring"],
        "Dynamic Programming": ["Longest Common Subsequence", "Edit Distance", "Longest Palindromic Substring"],
        "Trie": ["Prefix Tree", "Auto-complete", "Word Search"],
        "Suffix Array": ["Construction", "LCP Array", "Pattern Search"],
        "Encoding": ["Run-length", "Huffman", "Base64", "URL Encoding"]
    },
    "concepts": {
        "Fundamentals": [
            ("string immutability", "unchangeable string property", "security, caching, thread-safety", "new object on modification, string pool/interning", "String s = \"hello\"; s = s + \" world\"; // new object", "StringBuilder for concatenation"),
            ("Unicode and UTF-8", "character encoding standards", "multilingual text representation", "UTF-8: variable 1-4 bytes, backward compatible with ASCII", "U+0041 = 'A' = 0x41 in UTF-8", "surrogate pairs, combining characters"),
        ],
        "Pattern Matching": [
            ("KMP algorithm", "Knuth-Morris-Pratt", "O(m+n) pattern matching", "LPS (longest prefix suffix) array construction", "lps[i] = length of longest proper prefix which is also suffix", "pattern preprocessing, no backtracking in text"),
            ("Rabin-Karp", "rolling hash pattern matching", "average O(m+n), worst O(mn)", "hash computation, collision handling", "hash = (hash - text[i]*pow + text[i+m]) % prime", "spurious hits, multiple hash functions"),
        ],
        "Dynamic Programming": [
            ("edit distance", "Levenshtein distance", "minimum operations to transform strings", "insert, delete, replace operations", "dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost)", "space optimization to O(min(m,n))"),
            ("longest palindromic substring", "maximal palindrome finding", "expand around center or DP", "center expansion: O(n^2) time, O(1) space", "for (int i = 0; i < n; i++) { expand(s, i, i); expand(s, i, i+1); }", "Manacher's algorithm O(n)"),
        ],
        "Manipulation": [
            ("anagram detection", "permutation equivalence checking", "character frequency comparison", "sorting O(n log n), hash map O(n)", "int[] count = new int[26]; for (char c : s.toCharArray()) count[c-'a']++;", "Unicode anagram handling"),
            ("string tokenization", "splitting into components", "parsing and lexical analysis", "split, StringTokenizer, regex", "String[] parts = s.split(\"\\s+\");", "delimiter edge cases, empty tokens"),
        ],
    }
}

# Linked Lists
TOPIC_MAPS["Linked Lists"] = {
    "categories": ["Singly Linked List", "Doubly Linked List", "Circular Linked List", "Operations", "Problems", "Advanced"],
    "subcategories": {
        "Singly Linked List": ["Structure", "Traversal", "Insertion", "Deletion", "Reversal"],
        "Doubly Linked List": ["Structure", "Insertion", "Deletion", "LRU Cache"],
        "Circular Linked List": ["Structure", "Josephus Problem", "Splitting"],
        "Operations": ["Merge", "Sort", "Detect Cycle", "Find Middle", "Remove Nth from End"],
        "Problems": ["Palindrome", "Intersection", "Addition", "Clone with Random"],
        "Advanced": ["Skip List", "XOR Linked List", "Unrolled Linked List"]
    },
    "concepts": {
        "Singly Linked List": [
            ("node structure", "linked list element", "data + next pointer", "self-referential structure", "class Node { int data; Node next; Node(int d) { data = d; } }", "memory overhead vs arrays"),
            ("reversal", "in-place list reversal", "iterative and recursive approaches", "three pointers: prev, current, next", "while (curr != null) { next = curr.next; curr.next = prev; prev = curr; curr = next; }", "recursive stack O(n) space"),
            ("cycle detection", "Floyd's algorithm", "tortoise and hare technique", "slow (1x) and fast (2x) pointers meet if cycle", "Node slow = head, fast = head; while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; if (slow == fast) return true; }", "cycle length and start point detection"),
        ],
        "Doubly Linked List": [
            ("bidirectional traversal", "prev and next pointers", "O(1) backward access", "Node { int data; Node prev; Node next; }", "head.prev = null; tail.next = null;", "memory overhead (2 pointers per node)"),
            ("LRU cache implementation", "least recently used eviction", "hash map + doubly linked list", "O(1) get and put operations", "HashMap<Integer, Node> map; // Node in DLL ordered by recency", "LinkedHashMap Java built-in"),
        ],
        "Operations": [
            ("merge two sorted lists", "combined sorted list creation", "iterative pointer advancement", "dummy node for simplified head handling", "ListNode dummy = new ListNode(0); ListNode tail = dummy;", "recursive merge alternative"),
            ("find middle element", "two-pointer technique", "fast reaches end when slow is middle", "fast = 2x speed, slow = 1x speed", "Node slow = head, fast = head; while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }", "even length: two middle choices"),
            ("remove Nth from end", "single pass deletion", "fast pointer N ahead", "fast advances N, then both advance until fast at end", "Node fast = head; for (int i = 0; i < n; i++) fast = fast.next;", "dummy node for head removal"),
        ],
    }
}

# Stacks & Queues
TOPIC_MAPS["Stacks"] = {
    "categories": ["Implementation", "Operations", "Applications", "Monotonic Stack", "Problems"],
    "subcategories": {
        "Implementation": ["Array-based", "Linked List-based", "Two Stacks in Array"],
        "Operations": ["Push", "Pop", "Peek", "isEmpty", "Size"],
        "Applications": ["Expression Evaluation", "Parenthesis Matching", "Backtracking", "Undo/Redo"],
        "Monotonic Stack": ["Next Greater Element", "Previous Smaller", "Temperatures", "Largest Rectangle"],
        "Problems": ["Min Stack", "Sort Stack", "Implement Queue using Stacks", "Decode String"]
    },
    "concepts": {
        "Implementation": [
            ("array-based stack", "contiguous memory implementation", "top pointer management", "O(1) push/pop, O(n) dynamic resize", "int[] stack = new int[capacity]; int top = -1;", "stack overflow, underflow"),
            ("two stacks in array", "space-efficient dual stack", "growing from opposite ends", "stack1 from left, stack2 from right", "top1 = -1, top2 = n; push1: arr[++top1]; push2: arr[--top2];", "overflow when top1 + 1 == top2"),
        ],
        "Applications": [
            ("infix to postfix conversion", "Shunting Yard algorithm", "operator precedence handling", "stack for operators, output for operands", "while (!ops.isEmpty() && precedence(ops.peek()) >= precedence(curr)) output.push(ops.pop());", "parentheses handling"),
            ("expression evaluation", "postfix evaluation", "stack-based operand processing", "push operands, apply operator to top two", "switch (token) { case '+': stack.push(b + a); }", "prefix evaluation variant"),
            ("parenthesis matching", "balanced brackets checking", "stack for opening brackets", "push on open, pop and match on close", "Map<Character, Character> pairs = Map.of(')', '(', '}', '{', ']', '[');", "multiple bracket types"),
        ],
        "Monotonic Stack": [
            ("next greater element", "nearest greater to right", "monotonic decreasing stack", "pop smaller elements, current is NGE for popped", "while (!stack.isEmpty() && arr[i] > arr[stack.peek()]) result[stack.pop()] = arr[i]; stack.push(i);", "circular array variant"),
            ("largest rectangle in histogram", "max area under histogram", "monotonic increasing stack", "calculate area with each bar as minimum", "while (!stack.isEmpty() && heights[i] < heights[stack.peek()]) { h = heights[stack.pop()]; w = stack.isEmpty() ? i : i - stack.peek() - 1; max = Math.max(max, h * w); }", "O(n) optimal solution"),
        ],
        "Problems": [
            ("min stack", "O(1) min retrieval", "auxiliary min tracking stack", "push min of current and new min onto minStack", "if (x <= minStack.peek()) minStack.push(x);", "space optimization with pair encoding"),
        ],
    }
}

TOPIC_MAPS["Queues"] = {
    "categories": ["Implementation", "Types", "Applications", "Deque", "Priority Queue", "Problems"],
    "subcategories": {
        "Implementation": ["Array-based", "Linked List-based", "Circular Queue"],
        "Types": ["Simple Queue", "Circular Queue", "Priority Queue", "Double-ended Queue"],
        "Applications": ["BFS", "CPU Scheduling", "Printer Spooler", "Message Queue"],
        "Deque": ["Sliding Window Maximum", "Palindrome Check"],
        "Priority Queue": ["Heap Implementation", "Median Finder", "Merge K Sorted"],
        "Problems": ["Implement Stack using Queues", "First Non-repeating Character", "Queue Reconstruction"]
    },
    "concepts": {
        "Implementation": [
            ("circular queue", "array-based ring buffer", "efficient space utilization", "front and rear pointers modulo capacity", "rear = (rear + 1) % capacity; front = (front + 1) % capacity;", "full vs empty condition (waste one slot or use count)"),
            ("circular array implementation", "modulo indexing", "preventing linear overflow", "(front + i) % capacity for ith element", "int front = 0, rear = 0, count = 0;", "resize strategy"),
        ],
        "Applications": [
            ("BFS traversal", "breadth-first search", "level-order graph/tree traversal", "queue for frontier, visited set", "queue.offer(start); while (!queue.isEmpty()) { Node curr = queue.poll(); for (Node neighbor : curr.neighbors) if (!visited.contains(neighbor)) queue.offer(neighbor); }", "shortest path in unweighted graph"),
            ("sliding window maximum", "deque-based optimization", "O(n) maximum in every window", "maintain decreasing deque of indices", "while (!deque.isEmpty() && arr[i] >= arr[deque.peekLast()]) deque.pollLast(); deque.offerLast(i);", "removing out-of-window elements"),
        ],
        "Priority Queue": [
            ("heap implementation", "binary heap structure", "complete binary tree with heap property", "min-heap: parent <= children; max-heap: parent >= children", "PriorityQueue<Integer> minHeap = new PriorityQueue<>();", "heapify, sift up/down, array representation"),
            ("median from data stream", "dual heap approach", "O(log n) insertion, O(1) median", "max-heap for lower half, min-heap for upper half", "maxHeap.offer(num); minHeap.offer(maxHeap.poll()); // rebalance", "rebalancing invariant"),
            ("merge k sorted lists", "k-way merge", "priority queue for smallest elements", "O(N log k) where N total elements", "PriorityQueue<ListNode> pq = new PriorityQueue<>(Comparator.comparingInt(n -> n.val));", "lazy vs eager merging"),
        ],
    }
}

# Trees (general)
TOPIC_MAPS["Trees"] = {
    "categories": ["Fundamentals", "Traversal", "Types", "Operations", "Applications"],
    "subcategories": {
        "Fundamentals": ["Definition", "Properties", "Height/Depth", "Node Types"],
        "Traversal": ["DFS", "BFS", "Morris Traversal", "Iterative"],
        "Types": ["Binary Tree", "BST", "AVL", "Red-Black", "B-Tree", "Trie", "Segment Tree", "Fenwick Tree"],
        "Operations": ["Insertion", "Deletion", "Search", "Validation"],
        "Applications": ["Expression Tree", "Huffman Coding", "Decision Tree", "DOM Tree"]
    },
    "concepts": {
        "Fundamentals": [
            ("tree properties", "hierarchical data structure", "acyclic connected graph", "root, parent, child, leaf, sibling, ancestor, descendant", "n nodes = n-1 edges", "height vs depth definitions"),
            ("tree representations", "storage implementations", "linked, array, parent pointer", "left-child right-sibling, array for complete trees", "int[] tree = new int[n]; // parent array", "space complexity tradeoffs"),
        ],
        "Traversal": [
            ("DFS traversals", "depth-first strategies", "preorder, inorder, postorder", "recursive and iterative implementations", "preorder: root-left-right; inorder: left-root-right; postorder: left-right-root", "inorder of BST gives sorted order"),
            ("BFS traversal", "level-order traversal", "queue-based breadth-first", "O(n) time, O(w) space where w is max width", "queue.offer(root); while (!queue.isEmpty()) { Node curr = queue.poll(); process(curr); queue.offer(curr.left); queue.offer(curr.right); }", "level-by-level processing"),
            ("Morris traversal", "O(1) space traversal", "threaded binary tree technique", "temporary links to predecessor", "if (curr.left == null) { visit(curr); curr = curr.right; } else { Node pred = findPredecessor(curr); if (pred.right == null) { pred.right = curr; curr = curr.left; } else { pred.right = null; visit(curr); curr = curr.right; } }", "tree modification during traversal"),
        ],
        "Types": [
            ("segment tree", "range query structure", "O(log n) range queries and updates", "array-based binary tree, divide and conquer", "build: O(n), query: O(log n), update: O(log n)", "lazy propagation for range updates"),
            ("Fenwick tree", "Binary Indexed Tree", "prefix sum queries", "O(log n) query and update, less memory than segment tree", "int[] BIT; // 1-indexed; update: i += i & -i; query: i -= i & -i;", "range sum via two prefix queries"),
        ],
    }
}

# Binary Trees
TOPIC_MAPS["Binary Trees"] = {
    "categories": ["Properties", "Traversal", "Views", "Construction", "Modification", "Problems"],
    "subcategories": {
        "Properties": ["Types", "Height", "Diameter", "Balance Factor"],
        "Traversal": ["Recursive", "Iterative", "Level Order", "Zigzag", "Boundary"],
        "Views": ["Left View", "Right View", "Top View", "Bottom View"],
        "Construction": ["From Traversals", "From Array", "Complete Binary Tree"],
        "Modification": ["Insertion", "Deletion", "Flattening", "Mirror"],
        "Problems": ["LCA", "Path Sum", "Max Path Sum", "Serialize/Deserialize", "Symmetric Tree"]
    },
    "concepts": {
        "Properties": [
            ("complete binary tree", "level-filled tree structure", "all levels full except last, left-filled", "array representation: parent at i, children at 2i+1, 2i+2", "heap structure, binary heap", "node count vs height relationship"),
            ("tree height and diameter", "longest path metrics", "height: max root-to-leaf edges; diameter: max any-node-to-any-node edges", "diameter = max(left height + right height, left diameter, right diameter)", "int height(Node root) { return root == null ? 0 : 1 + Math.max(height(root.left), height(root.right)); }", "O(n) single-pass diameter"),
            ("balanced binary tree", "height-balanced property", "left and right subtree heights differ by at most 1", "AVL: strictly balanced; Red-Black: loosely balanced", "boolean isBalanced(Node root) { ... }", "bottom-up height calculation"),
        ],
        "Traversal": [
            ("zigzag level order", "alternating direction traversal", "left-to-right then right-to-left per level", "deque or reversed level list", "boolean leftToRight = true; for (int i = 0; i < size; i++) { if (leftToRight) list.add(node.val); else list.add(0, node.val); }", "two-stack approach"),
            ("boundary traversal", "anti-clockwise boundary nodes", "left boundary + leaves + right boundary", "excluding duplicates at corners", "printLeftBoundary(root); printLeaves(root); printRightBoundary(root.right);", "edge case: single node tree"),
        ],
        "Problems": [
            ("lowest common ancestor", "LCA finding", "deepest shared ancestor of two nodes", "recursive search in subtrees", "if (root == null || root == p || root == q) return root; Node left = lca(root.left, p, q); Node right = lca(root.right, p, q); if (left != null && right != null) return root;", "BST LCA optimization"),
            ("maximum path sum", "highest sum any path", "path can start and end at any nodes", "max of left+root+right, or extending to parent", "int maxPathSum(Node root) { int[] max = new int[]{Integer.MIN_VALUE}; helper(root, max); return max[0]; }", "negative value handling"),
            ("serialize and deserialize", "tree to string and back", "persistence and transmission", "preorder with null markers, or level order", "String serialize(Node root) { if (root == null) return \"null,\"; return root.val + \",\" + serialize(root.left) + serialize(root.right); }", "compact encoding strategies"),
            ("flatten to linked list", "in-place right-skewed conversion", "preorder sequence as right child chain", "recursive: flatten right, save left, attach flattened left to right", "Node right = root.right; root.right = flatten(root.left); root.left = null; attach right;", "O(1) space Morris-like approach"),
        ],
    }
}

# BST
TOPIC_MAPS["BST"] = {
    "categories": ["Properties", "Operations", "Self-Balancing", "Problems", "Variants"],
    "subcategories": {
        "Properties": ["Ordering", "Height", "Validation", "Inorder Property"],
        "Operations": ["Search", "Insert", "Delete", "Successor", "Predecessor", "Kth Smallest"],
        "Self-Balancing": ["AVL", "Red-Black", "Splay", "Treap"],
        "Problems": ["LCA", "Convert to Greater Tree", "Validate BST", "Recover BST"],
        "Variants": ["Threaded BST", "Cartesian Tree", "Tango Tree"]
    },
    "concepts": {
        "Properties": [
            ("BST property", "binary search tree invariant", "left < root < right for all nodes", "inorder traversal yields sorted sequence", "if (val < root.val) root.left = insert(root.left, val); else root.right = insert(root.right, val);", "duplicate handling strategies"),
            ("BST validation", "correctness checking", "ensuring ordering invariant", "range-based recursion: min < node < max", "boolean isValid(Node root, long min, long max) { ... }", "iterative inorder validation"),
        ],
        "Operations": [
            ("BST deletion", "node removal with structure preservation", "0, 1, or 2 child cases", "leaf: remove; one child: replace; two children: replace with inorder successor/predecessor", "if (root.left == null) return root.right; if (root.right == null) return root.left; Node min = findMin(root.right); root.val = min.val; root.right = delete(root.right, min.val);", "Hibbard deletion asymmetry"),
            ("kth smallest element", "order statistic query", "O(h) with augmented size, O(n) naive", "left subtree size determines position", "int leftSize = size(root.left); if (k <= leftSize) return kthSmallest(root.left, k); else if (k == leftSize + 1) return root.val; else return kthSmallest(root.right, k - leftSize - 1);", "Morris traversal O(1) space"),
            ("successor and predecessor", "inorder neighbors", "next larger / next smaller element", "successor: right subtree min, or nearest ancestor where node is in left subtree", "Node succ = null; while (root != null) { if (p.val < root.val) { succ = root; root = root.left; } else root = root.right; }", "parent pointer optimization"),
        ],
        "Self-Balancing": [
            ("AVL tree", "strictly balanced BST", "balance factor -1, 0, 1", "rotations: LL, RR, LR, RL", "if (balance > 1 && val < root.left.val) return rightRotate(root);", "height O(log n), more rotations than RB"),
            ("Red-Black tree", "loosely balanced BST", "color properties ensure balance", "5 properties: root black, red children black, black height equal", "TreeMap, TreeSet Java implementation", "less rotations, used in std libraries"),
        ],
    }
}

# Heaps
TOPIC_MAPS["Heaps"] = {
    "categories": ["Properties", "Operations", "Types", "Applications", "Problems"],
    "subcategories": {
        "Properties": ["Complete Binary Tree", "Heap Property", "Array Representation"],
        "Operations": ["Insert", "Extract Max/Min", "Heapify", "Build Heap", "Decrease Key"],
        "Types": ["Max Heap", "Min Heap", "Binomial Heap", "Fibonacci Heap", "Pairing Heap"],
        "Applications": ["Heap Sort", "Priority Queue", "Median Finder", "K-way Merge"],
        "Problems": ["K Largest", "Merge K Sorted", "Sort Nearly Sorted", "Reorganize String"]
    },
    "concepts": {
        "Properties": [
            ("heap property", "parent-child ordering", "max-heap: parent >= children; min-heap: parent <= children", "not a sorted structure, partial order", "arr[i] >= arr[2*i+1] && arr[i] >= arr[2*i+2]", "no ordering among siblings"),
            ("array representation", "implicit complete tree storage", "no pointer overhead", "parent i -> children 2i+1, 2i+2; child i -> parent (i-1)/2", "int[] heap = new int[n];", "0-indexed vs 1-indexed formulas"),
        ],
        "Operations": [
            ("heapify", "maintaining heap property", "O(log n) sift down", "compare with children, swap with larger (max-heap), recurse", "void heapify(int[] arr, int n, int i) { int largest = i; int l = 2*i+1; int r = 2*i+2; if (l < n && arr[l] > arr[largest]) largest = l; ... }", "bottom-up build heap O(n)"),
            ("build heap", "heap construction from array", "O(n) optimal bottom-up", "heapify from last non-leaf to root", "for (int i = n/2 - 1; i >= 0; i--) heapify(arr, n, i);", " vs n insertions O(n log n)"),
            ("extract max", "removing root element", "replace root with last, heapify root", "O(log n) operation", "int max = arr[0]; arr[0] = arr[n-1]; heapify(arr, n-1, 0);", "heap underflow check"),
        ],
        "Applications": [
            ("heap sort", "in-place comparison sort", "O(n log n) worst case, O(1) space", "build max heap, repeatedly extract max", "buildHeap(arr); for (int i = n-1; i > 0; i--) { swap(arr[0], arr[i]); heapify(arr, i, 0); }", "unstable sort, cache inefficiency"),
            ("median from stream", "running median calculation", "dual heap: max-heap lower, min-heap upper", "rebalance heaps to size difference <= 1", "maxHeap.offer(num); minHeap.offer(maxHeap.poll()); if (maxHeap.size() < minHeap.size()) maxHeap.offer(minHeap.poll());", "median = maxHeap.peek() or average"),
        ],
    }
}

# Graphs
TOPIC_MAPS["Graphs"] = {
    "categories": ["Representation", "Traversal", "Shortest Path", "Minimum Spanning Tree", "Topological Sort", "Strongly Connected", "Network Flow", "Problems"],
    "subcategories": {
        "Representation": ["Adjacency Matrix", "Adjacency List", "Edge List", "Incidence Matrix"],
        "Traversal": ["DFS", "BFS", "Iterative DFS", "Connected Components"],
        "Shortest Path": ["Dijkstra", "Bellman-Ford", "Floyd-Warshall", "A*"],
        "Minimum Spanning Tree": ["Kruskal", "Prim", "Boruvka"],
        "Topological Sort": ["Kahn's Algorithm", "DFS-based", "Cycle Detection"],
        "Strongly Connected": ["Kosaraju", "Tarjan", "Bridges", "Articulation Points"],
        "Network Flow": ["Ford-Fulkerson", "Edmonds-Karp", "Dinic", "Min-Cut"],
        "Problems": ["Bipartite Check", "Graph Coloring", "Hamiltonian Path", "Eulerian Path"]
    },
    "concepts": {
        "Representation": [
            ("adjacency list", "space-efficient graph storage", "O(V+E) space, O(degree) edge access", "list/array of neighbors per vertex", "List<Integer>[] graph = new ArrayList[V];", "weighted variant with edge objects"),
            ("adjacency matrix", "dense graph representation", "O(V^2) space, O(1) edge lookup", "2D boolean/weight array", "int[][] adj = new int[V][V];", "space inefficiency for sparse graphs"),
        ],
        "Traversal": [
            ("DFS", "depth-first search", "stack-based or recursive exploration", "O(V+E) time, O(V) space", "void dfs(int v) { visited[v] = true; for (int u : adj[v]) if (!visited[u]) dfs(u); }", "preorder, postorder, edge classification"),
            ("BFS", "breadth-first search", "queue-based level exploration", "O(V+E) time, O(V) space", "queue.offer(start); while (!queue.isEmpty()) { int v = queue.poll(); for (int u : adj[v]) if (!visited[u]) { visited[u] = true; queue.offer(u); } }", "shortest path in unweighted graphs"),
            ("connected components", "disconnected subgraphs", "DFS/BFS from unvisited nodes", "count of traversals from unvisited starts", "int components = 0; for (int i = 0; i < V; i++) if (!visited[i]) { dfs(i); components++; }", "undirected vs directed (SCC)"),
        ],
        "Shortest Path": [
            ("Dijkstra's algorithm", "non-negative edge shortest path", "greedy relaxation from source", "priority queue, distance array", "PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(n -> n.dist));", "negative edge failure, O(E log V) with binary heap"),
            ("Bellman-Ford algorithm", "general shortest path", "handles negative edges, detects negative cycles", "V-1 relaxations of all edges", "for (int i = 0; i < V-1; i++) for (Edge e : edges) if (dist[e.u] + e.w < dist[e.v]) dist[e.v] = dist[e.u] + e.w;", "O(VE) time"),
            ("Floyd-Warshall", "all-pairs shortest path", "dynamic programming approach", "intermediate node relaxation", "for (int k = 0; k < V; k++) for (int i = 0; i < V; i++) for (int j = 0; j < V; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);", "O(V^3), negative cycle detection"),
            ("A* algorithm", "heuristic shortest path", "informed search for goal-directed path", "f(n) = g(n) + h(n)", "PriorityQueue ordered by f(n);", "admissible and consistent heuristics"),
        ],
        "Minimum Spanning Tree": [
            ("Kruskal's algorithm", "edge-greedy MST", "sort edges, union-find for cycles", "O(E log E) sorting dominant", "Arrays.sort(edges); for (Edge e : edges) if (find(e.u) != find(e.v)) { union(e.u, e.v); mst.add(e); }", "path compression, union by rank"),
            ("Prim's algorithm", "vertex-greedy MST", "grow tree from arbitrary start", "priority queue for minimum crossing edge", "PriorityQueue<Edge> pq; pq.offer(new Edge(start, 0)); while (!pq.isEmpty()) { Edge e = pq.poll(); if (visited[e.to]) continue; visited[e.to] = true; for (Edge ne : adj[e.to]) if (!visited[ne.to]) pq.offer(ne); }", "O(E log V) with binary heap"),
        ],
        "Topological Sort": [
            ("Kahn's algorithm", "BFS-based topological sort", "in-degree elimination", "queue nodes with 0 in-degree", "Queue<Integer> q = new LinkedList<>(); for (int i = 0; i < V; i++) if (indegree[i] == 0) q.offer(i); while (!q.isEmpty()) { int v = q.poll(); result.add(v); for (int u : adj[v]) if (--indegree[u] == 0) q.offer(u); }", "cycle detection: result size < V"),
            ("DFS-based topological sort", "postorder stack", "reverse finishing order", "push to stack after DFS of all neighbors", "void dfs(int v) { visited[v] = true; for (int u : adj[v]) if (!visited[u]) dfs(u); stack.push(v); }", "cycle detection with recursion stack"),
        ],
        "Strongly Connected": [
            ("Kosaraju's algorithm", "SCC finding", "two-pass DFS on original and transposed graph", "first pass: order by finish time; second pass: DFS on transpose in reverse order", "Stack finishOrder; dfs1(v); // transpose graph; while (!finishOrder.isEmpty()) { v = finishOrder.pop(); if (!visited2[v]) { dfs2(v); sccCount++; } }", "O(V+E) time"),
            ("Tarjan's algorithm", "single-pass SCC", "low-link values and discovery times", "stack for current SCC, strongly connected when low[v] == disc[v]", "void tarjan(int u) { disc[u] = low[u] = time++; stack.push(u); for (int v : adj[u]) { if (disc[v] == -1) { tarjan(v); low[u] = Math.min(low[u], low[v]); } else if (inStack[v]) low[u] = Math.min(low[u], disc[v]); } if (low[u] == disc[u]) { while (stack.peek() != u) inStack[stack.pop()] = false; stack.pop(); sccCount++; } }", "articulation points and bridges variant"),
        ],
    }
}

# Hashing
TOPIC_MAPS["Hashing"] = {
    "categories": ["Fundamentals", "Collision Resolution", "Hash Functions", "Applications", "Advanced"],
    "subcategories": {
        "Fundamentals": ["Hash Table", "Load Factor", "Rehashing", "Amortized Analysis"],
        "Collision Resolution": ["Chaining", "Open Addressing", "Linear Probing", "Quadratic Probing", "Double Hashing"],
        "Hash Functions": ["Division Method", "Multiplication Method", "Universal Hashing", "Cryptographic"],
        "Applications": ["Frequency Count", "Two Sum", "Anagram Groups", "LRU Cache", "Consistent Hashing"],
        "Advanced": ["Cuckoo Hashing", "Robin Hood Hashing", "Hopscotch Hashing", "Perfect Hashing"]
    },
    "concepts": {
        "Fundamentals": [
            ("hash table", "key-value mapping structure", "O(1) average case operations", "hash function + collision resolution", "Map<String, Integer> map = new HashMap<>();", "worst case O(n) with poor hash"),
            ("load factor", "table occupancy ratio", "performance degradation threshold", "alpha = n/m (entries/buckets)", "default 0.75 in Java HashMap", "rehashing at threshold"),
            ("rehashing", "table resize operation", "maintaining performance", "create larger table, reinsert all elements", "newCapacity = oldCapacity * 2;", "amortized cost, concurrent modification"),
        ],
        "Collision Resolution": [
            ("separate chaining", "linked list collision handling", "each bucket is a list", "O(1 + alpha) average search", "List<Node>[] table; // array of linked lists", "treeification at long chains (Java 8+)"),
            ("open addressing", "probe sequence collision handling", "finding next empty slot", "linear, quadratic, double hashing probes", "int probe(int h, int i) { return (h + i) % m; }", "clustering problem"),
            ("linear probing", "sequential slot checking", "simple but causes primary clustering", "h(k, i) = (h(k) + i) % m", "int idx = (hash + i) % capacity;", "deletion requires tombstones"),
            ("double hashing", "two hash function probing", "reducing clustering", "h(k, i) = (h1(k) + i*h2(k)) % m", "int idx = (hash1 + i * hash2) % capacity;", "h2(k) must be relatively prime to m"),
        ],
        "Applications": [
            ("consistent hashing", "distributed hash table", "minimal reorganization on node change", "hash ring, virtual nodes", "md5(key) mapped to ring; find clockwise node", "Ketama, HRW (Rendezvous) hashing"),
            ("rolling hash", "sliding window hash computation", "O(1) hash update", "remove leftmost contribution, add rightmost", "hash = (hash - leftChar * pow^(m-1)) * base + rightChar", "Rabin-Karp string matching"),
        ],
    }
}

# Dynamic Programming
TOPIC_MAPS["Dynamic Programming"] = {
    "categories": ["Fundamentals", "1D DP", "2D DP", "Knapsack", "LIS", "Matrix Chain", "String DP", "Tree DP", "State Machine", "Bitmask DP"],
    "subcategories": {
        "Fundamentals": ["Memoization", "Tabulation", "Optimal Substructure", "Overlapping Subproblems", "State Definition"],
        "1D DP": ["Fibonacci", "Climbing Stairs", "House Robber", "Maximum Subarray"],
        "2D DP": ["Unique Paths", "Minimum Path Sum", "Dungeon Game", "Edit Distance"],
        "Knapsack": ["0/1 Knapsack", "Unbounded Knapsack", "Fractional Knapsack", "Multiple Knapsack"],
        "LIS": ["O(n^2) DP", "O(n log n) Patience Sort", "Count LIS", "Box Stacking"],
        "Matrix Chain": ["Multiplication", "Boolean Parenthesization", "Palindrome Partitioning"],
        "String DP": ["LCS", "Edit Distance", "Wildcard Matching", "Regex Matching", "Interleaving"],
        "Tree DP": ["Diameter", "Max Path Sum", "House Robber III", "Binary Tree Cameras"],
        "State Machine": ["Best Time to Buy/Sell Stock", "Paint House", "Paint Fence"],
        "Bitmask DP": ["TSP", "Assignment Problem", "Minimum Cost to Connect Two Groups"]
    },
    "concepts": {
        "Fundamentals": [
            ("optimal substructure", "optimal solution property", "optimal solution contains optimal subsolutions", "can be solved recursively from subproblems", "shortest path: subpath is shortest", "greedy vs DP distinction"),
            ("overlapping subproblems", "repeated subproblem computation", "motivation for memoization", "same subproblems encountered multiple times", "fibonacci: fib(3) computed multiple times", "tabulation vs memoization tradeoffs"),
            ("memoization", "top-down DP approach", "recursive with cache", "O(n) time with memo, O(2^n) without", "int[] memo; int fib(int n) { if (memo[n] != 0) return memo[n]; return memo[n] = fib(n-1) + fib(n-2); }", "stack depth limitation"),
            ("tabulation", "bottom-up DP approach", "iterative table filling", "O(n) time, O(n) or optimized space", "dp[0] = 0; dp[1] = 1; for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];", "space optimization possible"),
            ("state definition", "DP subproblem formulation", "critical design decision", "dp[i] = max value considering first i elements", "dp[i][j] = LCS of first i chars of A and j chars of B", "state space dimension impact"),
        ],
        "Knapsack": [
            ("0/1 knapsack", "item inclusion binary choice", "each item at most once", "dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]])", "for (int i = 1; i <= n; i++) for (int w = W; w >= wt[i]; w--) dp[w] = Math.max(dp[w], dp[w-wt[i]] + val[i]);", "space optimization to 1D"),
            ("unbounded knapsack", "unlimited item copies", "complete knapsack", "dp[w] = max over all items of (val[i] + dp[w-wt[i]])", "for (int w = 0; w <= W; w++) for (int i = 0; i < n; i++) if (wt[i] <= w) dp[w] = Math.max(dp[w], dp[w-wt[i]] + val[i]);", "coin change, rod cutting variants"),
        ],
        "LIS": [
            ("LIS O(n log n)", "longest increasing subsequence", "patience sorting with binary search", "maintain tails array, replace or extend", "int[] tails = new int[n]; int size = 0; for (int x : nums) { int i = Arrays.binarySearch(tails, 0, size, x); if (i < 0) i = -(i + 1); tails[i] = x; if (i == size) size++; }", "strict vs non-strict increasing"),
        ],
        "String DP": [
            ("LCS", "longest common subsequence", "classic 2D DP", "dp[i][j] = dp[i-1][j-1]+1 if match else max(dp[i-1][j], dp[i][j-1])", "for (int i = 1; i <= m; i++) for (int j = 1; j <= n; j++) if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1] + 1; else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);", "space optimization"),
        ],
        "State Machine": [
            ("stock trading DP", "state machine modeling", "hold/sold/rest states", "max profit with cooldown/fee/transaction limits", "dp[i][0] = max(dp[i-1][0], dp[i-1][1] + prices[i]); dp[i][1] = max(dp[i-1][1], dp[i-1][0] - prices[i]);", "k transactions generalization"),
        ],
    }
}

# Add simpler DSA subjects with fewer but comprehensive concepts
for subject in ["Greedy Algorithms", "Backtracking", "Recursion", "Searching", "Sorting"]:
    TOPIC_MAPS[subject] = {
        "categories": ["Fundamentals", "Techniques", "Applications", "Analysis"],
        "subcategories": {
            "Fundamentals": ["Definition", "Properties", "Complexity"],
            "Techniques": ["Standard Approaches", "Optimization", "Edge Cases"],
            "Applications": ["Classic Problems", "Real-world Usage"],
            "Analysis": ["Time Complexity", "Space Complexity", "Correctness Proof"]
        },
        "concepts": {
            "Fundamentals": [
                (f"{subject.lower()} overview", f"core {subject.lower()} concept", f"fundamental algorithmic paradigm", f"key characteristics and use cases of {subject}", f"standard implementation pattern", f"common pitfalls and optimizations"),
            ],
            "Techniques": [
                (f"{subject.lower()} strategy", f"problem-solving approach", f"step-by-step methodology", f"identifying applicability, making local choices, verifying optimality", f"pseudocode and implementation", f"when {subject.lower()} fails"),
            ],
            "Applications": [
                (f"classic {subject.lower()} problems", f"well-known applications", f"interview-standard questions", f"Activity Selection, Huffman Coding, Fractional Knapsack (Greedy); N-Queens, Sudoku, Permutations (Backtracking); Tower of Hanoi, Tree traversals (Recursion); Binary Search, Interpolation Search (Searching); QuickSort, MergeSort, HeapSort (Sorting)", f"implementation details", f"time/space tradeoffs"),
            ],
        }
    }

# AI subjects definition
ai_subjects = {
    "Artificial Intelligence": [
        ("AI definition", "intelligent machine simulation", "learning, reasoning, perception, action", "narrow AI vs general AI vs super AI", "Turing test, Chinese room argument", "AI winter history"),
        ("search algorithms", "problem-solving through search", "uninformed and informed search", "BFS, DFS, UCS, A*, IDA*, minimax, alpha-beta", "A* with admissible heuristic", "combinatorial explosion"),
        ("knowledge representation", "formalizing information for AI", "semantic networks, frames, rules, ontologies", "RDF, OWL, description logics", "expert systems, knowledge graphs", "symbolic vs subsymbolic"),
        ("planning", "action sequence generation", "STRIPS, PDDL, hierarchical task networks", "state space search, partial order planning", "GPS (General Problem Solver)", "real-world planning complexity"),
        ("agent architecture", "perception-action loop", "reflex, model-based, goal-based, utility-based", "PEAS description", "rational agent definition", "multi-agent systems"),
    ],
    "Machine Learning": [
        ("supervised learning", "labeled data training", "input-output mapping", "regression, classification", "linear regression, logistic regression, SVM, decision trees", "overfitting, underfitting"),
        ("unsupervised learning", "pattern discovery without labels", "clustering, dimensionality reduction, density estimation", "k-means, hierarchical clustering, PCA, t-SNE", "elbow method, silhouette score", "evaluation challenges"),
        ("bias-variance tradeoff", "model complexity balance", "generalization error decomposition", "high bias: underfitting; high variance: overfitting", "learning curves analysis", "regularization techniques"),
        ("cross-validation", "model evaluation technique", "robust performance estimation", "k-fold, stratified, leave-one-out", "5-fold cross-validation", "data leakage prevention"),
        ("gradient descent", "optimization algorithm", "iterative parameter update", "batch, stochastic, mini-batch; learning rate, momentum, adaptive", "w = w - alpha * grad(loss)", "local minima, saddle points"),
        ("feature engineering", "input variable creation", "transforming raw data to features", "scaling, encoding, binning, interaction terms", "one-hot encoding, TF-IDF, polynomial features", "automated feature engineering"),
        ("ensemble methods", "multiple model combination", "improving performance and robustness", "bagging, boosting, stacking, voting", "Random Forest, XGBoost, AdaBoost", "diversity vs accuracy tradeoff"),
        ("model evaluation metrics", "performance measurement", "classification and regression metrics", "accuracy, precision, recall, F1, AUC-ROC, MAE, RMSE", "confusion matrix, ROC curve", "class imbalance handling"),
        ("regularization", "complexity penalty", "preventing overfitting", "L1 (Lasso), L2 (Ridge), Elastic Net, Dropout", "loss + lambda * ||w||^2", "feature selection via L1"),
    ],
    "Deep Learning": [
        ("neural network basics", "biologically inspired computation", "layered weighted connections", "input, hidden, output layers; activation functions", "forward pass, backward pass", "universal approximation theorem"),
        ("backpropagation", "gradient computation algorithm", "chain rule application", "compute gradients from output to input", "delta rule, weight updates", "vanishing gradient problem"),
        ("activation functions", "non-linearity introduction", "enabling complex function learning", "ReLU, sigmoid, tanh, Leaky ReLU, GELU, Swish", "ReLU: max(0, x)", "dying ReLU, saturation"),
        ("batch normalization", "internal covariate shift reduction", "stabilizing training", "normalize activations, learnable scale/shift", "BN(x) = gamma * (x - mean) / sqrt(var + eps) + beta", "inference moving averages"),
        ("dropout", "regularization technique", "preventing co-adaptation", "randomly zeroing neurons during training", "nn.Dropout(p=0.5)", "inference scaling, Monte Carlo dropout"),
        ("optimization algorithms", "weight update strategies", "adaptive learning rates", "Adam, RMSprop, Adagrad, SGD with momentum", "Adam: adaptive moment estimation", "AdamW weight decay decoupling"),
        ("transfer learning", "pretrained model adaptation", "leveraging learned representations", "feature extraction, fine-tuning", "BERT fine-tuning for classification", "domain similarity importance"),
        ("CNN architecture evolution", "convolutional network development", "from LeNet to ResNet to EfficientNet", "AlexNet, VGG, Inception, ResNet, DenseNet", "skip connections, bottleneck layers", "NAS, AutoML for architecture"),
    ],
    "Neural Networks": [
        ("perceptron", "simplest neural unit", "linear binary classifier", "weighted sum + step function", "y = sign(w·x + b)", "XOR problem limitation"),
        ("MLP", "multi-layer perceptron", "feedforward fully connected network", "universal function approximator", "input -> hidden(s) -> output", "credit assignment problem"),
        ("weight initialization", "starting parameter values", "training convergence facilitation", "Xavier/Glorot, He initialization", "W ~ N(0, sqrt(2/fan_in))", "symmetry breaking"),
        ("loss functions", "error measurement", "optimization objective", "MSE, cross-entropy, hinge loss, KL divergence", "cross-entropy: -sum(y_true * log(y_pred))", "loss landscape geometry"),
    ],
    "CNN": [
        ("convolution operation", "filter-based feature extraction", "local receptive fields, weight sharing", "kernel slides over input, element-wise multiply and sum", "output_size = (W - F + 2P) / S + 1", "dilated convolutions"),
        ("pooling layers", "spatial dimensionality reduction", "translation invariance", "max pooling, average pooling", "2x2 max pool with stride 2", "global average pooling"),
        ("feature maps", "convolution output channels", "hierarchical feature learning", "edges -> textures -> patterns -> objects", "visualizing layer activations", "feature map dimensionality"),
        ("receptive field", "input region influencing neuron", "effective area of influence", "stacked convolutions increase RF", "RF = RF_prev + (kernel - 1) * stride_product", "dilated convolutions for larger RF"),
        ("ResNet", "residual network", "skip connection architecture", "solving vanishing gradient in deep networks", "F(x) + x identity mapping", "ResNet-50, ResNet-101, bottleneck design"),
    ],
    "RNN": [
        ("recurrent connections", "sequential data processing", "hidden state persistence", "h_t = tanh(W_hh * h_{t-1} + W_xh * x_t + b)", "unrolled computation graph", "temporal dependencies"),
        ("vanishing gradient", "long-term dependency problem", "gradients shrinking through time", "sigmoid/tanh saturation, weight matrix eigenvalues", "gradient clipping partial solution", "LSTM/GRU as solutions"),
        ("bidirectional RNN", "future context utilization", "two-directional processing", "forward + backward hidden states concatenated", "BiLSTM for NER", "real-time processing limitation"),
    ],
    "LSTM": [
        ("LSTM cell", "long short-term memory", "gated recurrent architecture", "forget gate, input gate, output gate, cell state", "f_t = sigmoid(W_f · [h_{t-1}, x_t] + b_f)", "peephole connections"),
        ("cell state", "memory highway", "linear information flow", "additive updates, minimal gradient flow obstruction", "C_t = f_t * C_{t-1} + i_t * tanh(W_C · [h_{t-1}, x_t] + b_C)", "long-term dependency learning"),
        ("GRU", "gated recurrent unit", "simplified LSTM variant", "update gate, reset gate; no separate cell state", "z_t = sigmoid(W_z · [h_{t-1}, x_t]); r_t = sigmoid(W_r · [h_{t-1}, x_t])", "LSTM vs GRU performance"),
    ],
    "Transformers": [
        ("self-attention", "intra-sequence attention", "relating positions within sequence", "Query, Key, Value matrices, softmax normalization", "Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V", "O(n^2) complexity"),
        ("multi-head attention", "parallel attention mechanisms", "diverse representation subspaces", "h heads with different W_Q, W_K, W_V", "MultiHead(Q,K,V) = Concat(head_1,...,head_h)W^O", "head specialization"),
        ("positional encoding", "sequence order injection", "adding position information", "sinusoidal or learned embeddings", "PE(pos, 2i) = sin(pos / 10000^(2i/d_model))", "relative positional encodings"),
        ("Transformer architecture", "attention-based sequence model", "encoder-decoder or encoder-only or decoder-only", "self-attention, feed-forward, layer norm, residual", "BERT (encoder), GPT (decoder), T5 (encoder-decoder)", "scaling laws"),
        ("BERT", "bidirectional encoder representations", "pretraining + fine-tuning paradigm", "MLM (masked language modeling), NSP (next sentence prediction)", "[CLS] token for classification", "WordPiece tokenization"),
        ("GPT", "generative pre-trained transformer", "autoregressive language modeling", "left-to-right context, next token prediction", "GPT-3: 175B parameters, few-shot learning", "emergent abilities, in-context learning"),
    ],
    "NLP": [
        ("tokenization", "text segmentation", "breaking text into units", "word, subword (BPE, WordPiece, SentencePiece), character", "'Hello world' -> ['Hello', 'world']", "OOV handling, multilingual tokenization"),
        ("word embeddings", "dense vector representations", "sentiment similarity in vector space", "Word2Vec, GloVe, FastText", "king - man + woman ≈ queen", "contextual vs static embeddings"),
        ("attention mechanism", "context-aware weighting", "focusing on relevant input parts", "soft alignment between encoder and decoder", "Bahdanau attention, Luong attention", "self-attention evolution"),
        ("named entity recognition", "entity extraction task", "identifying proper nouns", "BIO tagging, CRF, transformer-based", "B-PER, I-PER, O tags", "nested entities, fine-grained NER"),
        ("sentiment analysis", "opinion polarity detection", "positive/negative/neutral classification", "lexicon-based, ML, deep learning approaches", "fine-grained: aspect-based sentiment", "sarcasm detection challenge"),
    ],
    "Computer Vision": [
        ("image classification", "object category prediction", "assigning labels to images", "single label, multi-label, hierarchical", "ImageNet challenge, top-1/top-5 accuracy", "open set recognition"),
        ("object detection", "object localization and classification", "bounding box + class prediction", "R-CNN, Fast R-CNN, Faster R-CNN, YOLO, SSD", "IoU, mAP metrics", "anchor boxes, NMS"),
        ("semantic segmentation", "pixel-level classification", "class label for each pixel", "FCN, U-Net, DeepLab, Mask R-CNN", "dice loss, IoU loss", "instance vs semantic segmentation"),
        ("image augmentation", "training data diversity", "geometric and photometric transforms", "flip, rotate, crop, color jitter, cutout, mixup", "Albumentations library", "autoaugment, randaugment"),
        ("feature extraction", "meaningful representation learning", "transferable visual features", "pretrained CNN backbone, ViT patches", "ResNet50 features for downstream tasks", "self-supervised pretraining"),
    ],
    "Generative AI": [
        ("GANs", "generative adversarial networks", "generator-discriminator game", "minimax objective, Nash equilibrium", "DCGAN, StyleGAN, CycleGAN", "mode collapse, training instability"),
        ("VAE", "variational autoencoder", "latent space generative model", "reparameterization trick, KL divergence", "encoder: q(z|x), decoder: p(x|z)", "blurry outputs vs GANs"),
        ("diffusion models", "iterative denoising generation", "reverse diffusion process", "DDPM, DDIM, Stable Diffusion", "noise schedule, U-Net architecture", "latent diffusion for efficiency"),
        ("flow-based models", "invertible transformations", "exact likelihood computation", "RealNVP, Glow, normalizing flows", "z = f(x), x = f^{-1}(z)", "coupling layers, actnorm"),
    ],
    "LLMs": [
        ("scaling laws", "performance vs compute relationship", "predictable improvement with scale", "loss ∝ C^-alpha, where C is compute", "Kaplan et al. 2020, Chinchilla optimal", "data vs model size tradeoff"),
        ("prompt engineering", "input optimization for LLMs", "eliciting desired outputs", "zero-shot, few-shot, chain-of-thought, ReAct", "\"Let's think step by step\"", "prompt injection, jailbreaking"),
        ("fine-tuning", "model adaptation technique", "task-specific parameter update", "full fine-tuning, LoRA, QLoRA, prefix tuning", "LoRA: W = W_0 + BA, low-rank decomposition", "catastrophic forgetting"),
        ("RLHF", "reinforcement learning from human feedback", "alignment with human preferences", "reward model training, PPO optimization", "InstructGPT, ChatGPT training pipeline", "reward hacking, alignment tax"),
        ("in-context learning", "few-shot demonstration learning", "learning from examples in prompt", "no parameter updates, pattern matching", "3-5 examples in prompt sufficient", "example selection, order sensitivity"),
        ("hallucination", "factually incorrect generation", "plausible but false outputs", "factual, logical, contextual hallucinations", "retrieval augmentation, fact verification", "uncertainty quantification"),
    ],
    "Prompt Engineering": [
        ("zero-shot prompting", "no-example instruction", "direct task description", "clear, specific, structured instructions", "\"Translate the following to French: {text}\"", "task clarity importance"),
        ("few-shot prompting", "example-based learning", "demonstrating desired pattern", "input-output pairs in prompt", "\"English: Hello -> French: Bonjour\nEnglish: Goodbye -> French: ...\"", "example quality and diversity"),
        ("chain-of-thought", "reasoning step elicitation", "intermediate reasoning generation", "\"Let's think step by step\" or explicit reasoning examples", "improves arithmetic, commonsense, symbolic reasoning", "self-consistency decoding"),
        ("ReAct", "reasoning and acting", "interleaving thought and action", "LLM generates reasoning traces and actions", "Thought: I need to search for X. Action: search[X]", "tool use integration"),
        ("prompt chaining", "multi-step prompt decomposition", "breaking complex tasks into subtasks", "output of one prompt feeds into next", "extract -> summarize -> format pipeline", "error propagation"),
    ],
    "RAG": [
        ("retrieval-augmented generation", "external knowledge grounding", "combining retrieval with generation", "retrieve relevant docs, concatenate with query, generate", "query -> retriever -> [doc1, doc2] -> generator -> answer", "end-to-end vs modular RAG"),
        ("vector database", "semantic search storage", "embedding-based retrieval", "FAISS, Pinecone, Weaviate, Chroma, Milvus", "indexing: IVF, HNSW, flat", "approximate nearest neighbors"),
        ("chunking strategies", "document segmentation", "optimal retrieval unit size", "fixed size, semantic, recursive, agentic", "chunk_size=512, chunk_overlap=50", "context boundary preservation"),
        ("embedding models", "text vector representation", "semantic similarity encoding", "sentence-transformers, OpenAI embeddings, E5, BGE", "cosine similarity for retrieval", "multilingual embeddings"),
        ("reranking", "retrieval result refinement", "improving top-k relevance", "cross-encoder reranker, ColBERT", "initial retrieval: 100 docs -> reranker -> top 5", "latency vs accuracy tradeoff"),
    ],
    "AI Agents": [
        ("agent architecture", "autonomous AI system", "perception, reasoning, action loop", "ReAct, Plan-and-Execute, AutoGPT", "observation -> thought -> action -> observation", "tool use, memory, planning"),
        ("tool use", "external capability integration", "LLM calling functions/APIs", "function calling, API selection, parameter extraction", "OpenAI function calling schema", "tool description optimization"),
        ("planning", "multi-step goal decomposition", "breaking complex goals into actions", "Hierarchical Task Networks, tree search", "plan -> execute -> observe -> replan", "plan repair vs replanning"),
        ("multi-agent systems", "collaborative AI agents", "agent specialization and communication", "CrewAI, AutoGen, MetaGPT", "orchestrator, worker, critic roles", "consensus mechanisms, debate"),
    ],
    "MLOps": [
        ("ML pipeline", "end-to-end ML workflow", "data -> model -> deployment", "data ingestion, validation, transformation, training, evaluation", "Kubeflow, Airflow, MLflow pipelines", "pipeline versioning"),
        ("model versioning", "artifact tracking", "experiment reproducibility", "MLflow, DVC, Weights & Biases", "model registry: staging, production, archived", "artifact lineage"),
        ("model monitoring", "production model health", "detecting drift and degradation", "data drift, concept drift, prediction drift", "Evidently, WhyLabs, Fiddler", "alerting thresholds"),
        ("CI/CD for ML", "automated ML deployment", "testing and deploying models", "model testing, A/B testing, canary deployment", "GitOps for ML, Seldon, BentoML", "model rollback strategies"),
        ("feature store", "feature management system", "centralized feature serving", " Feast, Tecton, SageMaker Feature Store", "online vs offline features", "feature consistency, point-in-time correctness"),
    ],
}

for subject, concepts in ai_subjects.items():
    TOPIC_MAPS[subject] = {
        "categories": ["Fundamentals", "Architecture", "Applications", "Advanced Topics"],
        "subcategories": {
            "Fundamentals": ["Definition", "History", "Key Concepts"],
            "Architecture": ["Components", "Design Patterns", "Implementation"],
            "Applications": ["Use Cases", "Industry Examples", "Tools"],
            "Advanced Topics": ["Research", "Challenges", "Future Directions"]
        },
        "concepts": {
            "Fundamentals": concepts[:3] if len(concepts) >= 3 else concepts,
            "Architecture": concepts[3:6] if len(concepts) >= 6 else concepts[3:] if len(concepts) > 3 else concepts,
            "Applications": concepts[6:9] if len(concepts) >= 9 else concepts[6:] if len(concepts) > 6 else [],
            "Advanced Topics": concepts[9:] if len(concepts) > 9 else [],
        }
    }


class QuestionGenerator:
    def __init__(self):
        self.generated_questions = set()
        self.question_counter = {}
        
    def get_next_id(self, prefix):
        if prefix not in self.question_counter:
            self.question_counter[prefix] = 0
        self.question_counter[prefix] += 1
        return f"{prefix}-{self.question_counter[prefix]:03d}"
    
    def assign_difficulty(self, idx, total):
        """Distribute difficulties: 30% Easy, 50% Medium, 20% Hard"""
        if idx < int(total * 0.3):
            return "Easy"
        elif idx < int(total * 0.8):
            return "Medium"
        else:
            return "Hard"
    
    def deduplicate_text(self, text):
        """Simple deduplication check"""
        text_hash = hashlib.md5(text.lower().strip().encode()).hexdigest()
        if text_hash in self.generated_questions:
            return None
        self.generated_questions.add(text_hash)
        return text

    def build_datasets(self):
        output_dir = Path("backend/data/processed")
        output_dir.mkdir(parents=True, exist_ok=True)

        prefixes = {
            "C": "C",
            "C++": "CPP",
            "TypeScript": "TS",
            "Go": "GO",
            "Rust": "RUST",
            "Kotlin": "KOTLIN",
            "Java": "JAVA",
            "JavaScript": "JS",
            "HTML": "HTML",
            "CSS": "CSS",
            "React": "REACT",
            "Next.js": "NEXT",
            "Node.js": "NODE",
            "Express.js": "EXPRESS",
            "FastAPI": "FASTAPI",
            "Django": "DJANGO",
            "Flask": "FLASK",
            "SQL": "SQL",
            "MySQL": "MYSQL",
            "PostgreSQL": "PSQL",
            "MongoDB": "MONGO",
            "Redis": "REDIS",
            "Firebase": "FIREBASE",
            "Arrays": "ARRAY",
            "Strings": "STR",
            "Linked Lists": "LL",
            "Stacks": "STACK",
            "Queues": "QUEUE",
            "Trees": "TREE",
            "Binary Trees": "BT",
            "BST": "BST",
            "Heaps": "HEAP",
            "Graphs": "GRAPH",
            "Hashing": "HASH",
            "Dynamic Programming": "DP",
            "Greedy Algorithms": "GREEDY",
            "Backtracking": "BACKTRACK",
            "Recursion": "RECURSION",
            "Searching": "SEARCH",
            "Sorting": "SORT",
            "Artificial Intelligence": "AI",
            "Machine Learning": "ML",
            "Deep Learning": "DL",
            "Neural Networks": "NN",
            "CNN": "CNN",
            "RNN": "RNN",
            "LSTM": "LSTM",
            "Transformers": "TRANS",
            "NLP": "NLP",
            "Computer Vision": "CV",
            "Generative AI": "GENAI",
            "LLMs": "LLM",
            "Prompt Engineering": "PROMPT",
            "RAG": "RAG",
            "AI Agents": "AGENT",
            "MLOps": "MLOPS"
        }

        for lang, config in TOPIC_MAPS.items():
            print(f"Generating questions for {lang}...")
            prefix = prefixes.get(lang, "LANG")
            questions = []
            
            # Step 1: Collect raw generated question elements
            raw_questions = []
            
            # Category Loop
            for category, list_concepts in config["concepts"].items():
                # Subcategory estimation
                subcat_list = config["subcategories"].get(category, ["General"])
                
                # Single Concept Templates
                for c_idx, c in enumerate(list_concepts):
                    # Pick a subcategory cyclically
                    subcategory = subcat_list[c_idx % len(subcat_list)]
                    
                    # Compute related concepts
                    other_concepts = [other[0] for other in list_concepts if other[0] != c[0]]
                    related_concepts = other_concepts[:3] if other_concepts else [c[0]]

                    # Template 1: What is {concept} and how does it work?
                    q_text_1 = f"What is {c[0]} in {lang} and how does it work?"
                    exp_text_1 = f"{c[0]} in {lang} refers to {c[1]}. It works by {c[2]}. Key characteristics include {c[3]}. Example: {c[4]}. Common pitfalls include {c[5]}."
                    raw_questions.append({
                        "question": q_text_1,
                        "ideal_answer": exp_text_1,
                        "category": category,
                        "subcategory": subcategory,
                        "keywords": [c[0], f"{lang} programming", category.lower()],
                        "follow_up_questions": [
                            f"What are the typical use cases of {c[0]} in a production environment?",
                            f"What are the common pitfalls or issues associated with {c[0]}?"
                        ],
                        "related_concepts": related_concepts
                    })
                    
                    # Template 4: Common issues and debugging
                    if c[5]:
                        q_text_4 = f"What are the common issues with {c[0]} in {lang} and how do you debug them?"
                        exp_text_4 = f"Common issues with {c[0]} in {lang} include: {c[5]}. To debug: trace allocations, check variable bindings in gdb, or inspect assembly logic. Prevention strategies: enforce strict cleanups and static analyzer checks."
                        raw_questions.append({
                            "question": q_text_4,
                            "ideal_answer": exp_text_4,
                            "category": category,
                            "subcategory": subcategory,
                            "keywords": ["debugging", c[0], "troubleshooting", lang],
                            "follow_up_questions": [
                                f"How can you programmatically prevent or mitigate issues related to {c[0]}?",
                                f"What tools can assist in detecting problems with {c[0]} at compile-time or run-time?"
                            ],
                            "related_concepts": related_concepts
                        })

                # Template 2: Comparisons (differences between concept A and concept B)
                # Generate unique pairs of concepts in same category
                for i in range(len(list_concepts)):
                    for j in range(i + 1, len(list_concepts)):
                        c_a = list_concepts[i]
                        c_b = list_concepts[j]
                        subcategory = subcat_list[i % len(subcat_list)]
                        
                        other_concepts_ab = [other[0] for other in list_concepts if other[0] not in (c_a[0], c_b[0])]
                        related_concepts_ab = [c_a[0], c_b[0]] + other_concepts_ab[:2]

                        q_text_2 = f"Explain the difference between {c_a[0]} and {c_b[0]} in {lang}."
                        exp_text_2 = (
                            f"{c_a[0]} and {c_b[0]} differ in several ways: {c_a[0]} is {c_a[1]} "
                            f"(works by {c_a[2]}) whereas {c_b[0]} is {c_b[1]} (works by {c_b[2]}). "
                            f"{c_a[0]} is typically used for {c_a[3]}, while {c_b[0]} is used for {c_b[3]}. "
                            f"Example demonstrating {c_a[0]}: {c_a[4]}. Example demonstrating {c_b[0]}: {c_b[4]}."
                        )
                        raw_questions.append({
                            "question": q_text_2,
                            "ideal_answer": exp_text_2,
                            "category": category,
                            "subcategory": subcategory,
                            "keywords": [c_a[0], c_b[0], "comparison", lang],
                            "follow_up_questions": [
                                f"Under what specific circumstances would you choose {c_a[0]} over {c_b[0]}?",
                                f"What is the performance or memory difference between {c_a[0]} and {c_b[0]}?"
                            ],
                            "related_concepts": related_concepts_ab
                        })

            # Shuffle and deduplicate
            random.seed(42)
            random.shuffle(raw_questions)
            
            dedup_questions = []
            for item in raw_questions:
                dedup_q = self.deduplicate_text(item["question"])
                if dedup_q:
                    dedup_questions.append(item)
            
            # Select first ~120 questions to avoid huge bloated dataset size
            target_count = min(120, len(dedup_questions))
            final_selection = dedup_questions[:target_count]
            
            # Reset generator counter for this prefix
            self.question_counter[prefix] = 0
            
            # Domain mapping
            domains = {
                "C": "Software Engineering",
                "C++": "Software Engineering",
                "TypeScript": "Software Engineering",
                "Go": "Software Engineering",
                "Rust": "Software Engineering",
                "Kotlin": "Software Engineering",
                "Java": "Software Engineering",
                "JavaScript": "Software Engineering",
                "HTML": "Web Development",
                "CSS": "Web Development",
                "React": "Web Development",
                "Next.js": "Web Development",
                "Node.js": "Web Development",
                "Express.js": "Web Development",
                "FastAPI": "Web Development",
                "Django": "Web Development",
                "Flask": "Web Development",
                "SQL": "Databases",
                "MySQL": "Databases",
                "PostgreSQL": "Databases",
                "MongoDB": "Databases",
                "Redis": "Databases",
                "Firebase": "Databases",
                "Arrays": "Data Structures & Algorithms",
                "Strings": "Data Structures & Algorithms",
                "Linked Lists": "Data Structures & Algorithms",
                "Stacks": "Data Structures & Algorithms",
                "Queues": "Data Structures & Algorithms",
                "Trees": "Data Structures & Algorithms",
                "Binary Trees": "Data Structures & Algorithms",
                "BST": "Data Structures & Algorithms",
                "Heaps": "Data Structures & Algorithms",
                "Graphs": "Data Structures & Algorithms",
                "Hashing": "Data Structures & Algorithms",
                "Dynamic Programming": "Data Structures & Algorithms",
                "Greedy Algorithms": "Data Structures & Algorithms",
                "Backtracking": "Data Structures & Algorithms",
                "Recursion": "Data Structures & Algorithms",
                "Searching": "Data Structures & Algorithms",
                "Sorting": "Data Structures & Algorithms",
                "Artificial Intelligence": "Artificial Intelligence",
                "Machine Learning": "Artificial Intelligence",
                "Deep Learning": "Artificial Intelligence",
                "Neural Networks": "Artificial Intelligence",
                "CNN": "Artificial Intelligence",
                "RNN": "Artificial Intelligence",
                "LSTM": "Artificial Intelligence",
                "Transformers": "Artificial Intelligence",
                "NLP": "Artificial Intelligence",
                "Computer Vision": "Artificial Intelligence",
                "Generative AI": "Artificial Intelligence",
                "LLMs": "Artificial Intelligence",
                "Prompt Engineering": "Artificial Intelligence",
                "RAG": "Artificial Intelligence",
                "AI Agents": "Artificial Intelligence",
                "MLOps": "Artificial Intelligence"
            }
            
            # Step 2: Assign difficulty, IDs, and structure into DatasetQuestion schema
            questions_list = []
            for idx, item in enumerate(final_selection):
                difficulty = self.assign_difficulty(idx, target_count)
                q_id = self.get_next_id(prefix)
                
                # Estimated answer time & score weight
                if difficulty == "Easy":
                    est_time = 3
                    score_w = 3
                elif difficulty == "Medium":
                    est_time = 5
                    score_w = 6
                else:
                    est_time = 8
                    score_w = 9

                questions_list.append({
                    "question_id": q_id,
                    "subject": lang,
                    "category": item["category"],
                    "subcategory": item["subcategory"],
                    "difficulty": difficulty,
                    "question": item["question"],
                    "ideal_answer": item["ideal_answer"],
                    "keywords": item["keywords"],
                    "follow_up_questions": item["follow_up_questions"],
                    "related_concepts": item["related_concepts"],
                    "estimated_answer_time_minutes": est_time,
                    "score_weight": score_w
                })

            easy_count = sum(1 for q in questions_list if q["difficulty"] == "Easy")
            medium_count = sum(1 for q in questions_list if q["difficulty"] == "Medium")
            hard_count = sum(1 for q in questions_list if q["difficulty"] == "Hard")
            
            last_updated_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

            # Final conformant dataset dict
            dataset_dict = {
                "metadata": {
                    "subject": lang,
                    "domain": domains.get(lang, "Software Engineering"),
                    "total_questions": len(questions_list),
                    "difficulty_distribution": {
                        "Easy": easy_count,
                        "Medium": medium_count,
                        "Hard": hard_count
                    },
                    "version": "2.0",
                    "last_updated": last_updated_str,
                    "schema_version": "1.0",
                    "validation_rules": {
                        "required_fields": [
                            "question_id", "subject", "category", "subcategory",
                            "difficulty", "question", "ideal_answer", "keywords",
                            "follow_up_questions", "related_concepts",
                            "estimated_answer_time_minutes", "score_weight"
                        ],
                        "difficulty_levels": ["Easy", "Medium", "Hard"],
                        "id_format": "{PREFIX}-{SEQUENCE}",
                        "score_weight_range": {"min": 1, "max": 10},
                        "time_range_minutes": {"min": 1, "max": 15}
                    }
                },
                "questions": questions_list
            }
                
            # Write to output file
            filename = f"{lang.lower().replace('++', 'pp').replace(' ', '_')}.json"
            filepath = output_dir / filename
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(dataset_dict, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Wrote {len(questions_list)} generated questions to {filepath}")

if __name__ == "__main__":
    gen = QuestionGenerator()
    gen.build_datasets()
