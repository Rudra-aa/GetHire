// oop.js - Raw OOP Interview Question Dataset
const questions = [
  {
    id: 1,
    q: "What is the core concept of Object-Oriented Programming (OOP)?",
    a: "OOP is a programming paradigm based on the concept of 'objects', which contain both data (attributes) and code (methods). It organizes software design around data, rather than functions and logic.",
    exp: "The four main pillars of OOP are encapsulation, inheritance, polymorphism, and abstraction. These principles help make code modular, reusable, and easier to maintain."
  },
  {
    id: 2,
    q: "Explain Encapsulation in OOP.",
    a: "Encapsulation is the bundling of data (attributes) and the methods that operate on that data into a single unit called a class, while restricting direct access to some of the object's components.",
    exp: "Access modifiers like private, protected, and public are used to restrict direct access to variables. It prevents external code from corrupting the internal state of an object and enforces a clean public interface."
  },
  {
    id: 3,
    q: "What is Inheritance and why is it useful?",
    a: "Inheritance is a mechanism that allows a new class (subclass/derived class) to inherit the properties and behaviors (methods) of an existing class (superclass/base class).",
    exp: "It promotes code reusability by allowing common functionality to be defined once in a superclass and shared across multiple subclasses. It establishes an 'is-a' relationship between classes."
  },
  {
    id: 4,
    q: "What is Polymorphism? Give an example.",
    a: "Polymorphism means 'many forms'. It is the ability of different classes to respond to the same message or method call in their own specific way.",
    exp: "Polymorphism can be compile-time (method overloading) or runtime (method overriding). For example, a base class 'Shape' may have a method 'draw()', which is implemented differently by subclasses 'Circle' and 'Square'."
  },
  {
    id: 5,
    q: "What is Abstraction and how does it differ from Encapsulation?",
    a: "Abstraction is the process of hiding the complex implementation details and showing only the essential features of an object. Encapsulation is the practice of hiding an object's internal state and requiring all interaction to go through public methods.",
    exp: "Abstraction focuses on 'what' an object does, while encapsulation focuses on 'how' to restrict access to the object's state to ensure integrity. Abstraction is achieved using abstract classes and interfaces."
  },
  {
    id: 6,
    q: "What is the difference between a Class and an Object?",
    a: "A class is a blueprint or template that defines the structure and behavior of objects. An object is a specific, concrete instance of a class, created in memory at runtime.",
    exp: "For example, a class is like a house blueprint, which defines where the walls, doors, and windows go. An object is the actual physical house built using that blueprint, holding specific values like color and address."
  },
  {
    id: 7,
    q: "What is a Constructor, and what are the different types of constructors?",
    a: "A constructor is a special member function of a class that is automatically called when a new object of that class is created. It is used to initialize the object's attributes.",
    exp: "Common types include default constructors (no parameters), parameterized constructors (take arguments), and copy constructors (create a new object as a copy of an existing one)."
  },
  {
    id: 8,
    q: "What is a Destructor?",
    a: "A destructor is a special member function that is automatically called when an object goes out of scope or is explicitly deleted. Its purpose is to release resources (like dynamically allocated memory or file handles) occupied by the object.",
    exp: "In languages like C++, destructors are explicitly defined using a tilde (~). In garbage-collected languages like Java or Python, destructors are managed by the runtime (e.g., __del__ in Python), although timing of execution isn't strictly guaranteed."
  },
  {
    id: 9,
    q: "Explain the difference between Method Overloading and Method Overriding.",
    a: "Method Overloading allows multiple methods in the same class to have the same name but different signatures (parameters). Method Overriding allows a subclass to provide a specific implementation of a method that is already defined in its superclass.",
    exp: "Overloading is compile-time (static) polymorphism. Overriding is runtime (dynamic) polymorphism. Overridden methods must have the same name, parameters, and return type."
  },
  {
    id: 10,
    q: "What is the difference between an Abstract Class and an Interface?",
    a: "An abstract class can contain both abstract methods (without bodies) and concrete methods (with bodies), and can maintain state. An interface typically only defines abstract methods (contracts) and cannot maintain instance state.",
    exp: "A class can inherit from only one abstract class (due to single inheritance restrictions in many languages), but it can implement multiple interfaces. Abstract classes represent an 'is-a' relationship, whereas interfaces represent a 'can-do' ability."
  },
  {
    id: 11,
    q: "What is the 'Diamond Problem' in multiple inheritance and how is it resolved?",
    a: "The Diamond Problem occurs when a class inherits from two classes, both of which inherit from a common superclass. If both intermediate classes override a method from the superclass, the final subclass faces ambiguity on which version to inherit.",
    exp: "Languages resolve this differently: C++ uses virtual inheritance; Python uses Method Resolution Order (MRO) via the C3 linearization algorithm; Java and C# avoid the problem by disallowing multiple inheritance of classes entirely, allowing it only for interfaces."
  },
  {
    id: 12,
    q: "Explain the difference between Association, Aggregation, and Composition.",
    a: "Association is a general relationship between two classes. Aggregation is a 'has-a' relationship where the child can exist independently of the parent. Composition is a strong 'has-a' relationship where the child cannot exist without the parent.",
    exp: "Example of Aggregation: A Department has Professors; if the Department is deleted, Professors still exist. Example of Composition: A House has Rooms; if the House is deleted, the Rooms cease to exist."
  },
  {
    id: 13,
    q: "What is the purpose of the 'this' or 'self' pointer/reference in OOP?",
    a: "It is an implicit reference to the current object instance within a class method. It is used to access instance variables and distinguish them from local parameters of the same name.",
    exp: "In Java, C++, and C#, it is written as 'this'. In Python, it is explicitly passed as the first parameter of instance methods and is named 'self' by convention."
  },
  {
    id: 14,
    q: "What is the difference between Static and Dynamic Binding?",
    a: "Static binding (early binding) occurs at compile-time when the compiler can resolve the method call directly. Dynamic binding (late binding) occurs at runtime when the specific method to execute is resolved based on the actual object type.",
    exp: "Static binding is used for overloaded, private, static, or final methods. Dynamic binding is used for overridden virtual methods and is the mechanism that enables runtime polymorphism."
  },
  {
    id: 15,
    q: "What is Composition over Inheritance, and why is it recommended?",
    a: "Composition over Inheritance is a design principle stating that classes should achieve polymorphic behavior and code reuse by containing other classes (composition) rather than inheriting from a parent class (inheritance).",
    exp: "Inheritance is a tight coupling ('is-a' relationship) that can lead to fragile class hierarchies. Composition is a loose coupling ('has-a' relationship) that makes code more flexible, testable, and easier to modify at runtime."
  },
  {
    id: 16,
    q: "What are Access Modifiers, and what are their typical scopes?",
    a: "Access modifiers are keywords that set the accessibility of classes, methods, and variables. Typical ones are: public (accessible everywhere), private (accessible only within the class), and protected (accessible within the class and its subclasses).",
    exp: "Some languages have additional levels, like 'default/package-private' in Java or 'internal' in C#, which restrict access to the same module/package."
  },
  {
    id: 17,
    q: "What are Virtual Functions and how do they enable runtime polymorphism?",
    a: "A virtual function is a function in a base class that is expected to be overridden in derived classes. When called through a base class pointer or reference, the program resolves the call to the derived class's version at runtime.",
    exp: "This is implemented using a Virtual Method Table (VTable). Every class with virtual functions has a VTable containing pointers to its implementations, and objects contain a pointer (vptr) to this table."
  },
  {
    id: 18,
    q: "Explain the difference between a Shallow Copy and a Deep Copy of an object.",
    a: "A shallow copy duplicates the top-level object structure but copies references to any nested objects. A deep copy recursively duplicates all levels, creating entirely independent copies of all nested objects.",
    exp: "If a shallow-copied object has a list field, modifying that list affects both the original and copied objects because they share the same list reference. A deep copy would clone the list, keeping them isolated."
  },
  {
    id: 19,
    q: "What is a design pattern, and what is the Singleton pattern?",
    a: "A design pattern is a general, reusable solution to a commonly occurring problem in software design. The Singleton pattern ensures that a class has only one instance and provides a global point of access to it.",
    exp: "Singletons are useful for shared resources like database connection pools or configuration managers. Care must be taken to handle thread safety during initialization (e.g., double-checked locking)."
  },
  {
    id: 20,
    q: "What are Coupling and Cohesion in the context of OOP?",
    a: "Cohesion refers to how focused and closely related the responsibilities of a single class are. Coupling refers to the degree of direct dependency between different classes.",
    exp: "High cohesion and low coupling is the goal of clean software design. It ensures that a class does one thing well, and changes to one part of the system have minimal impact on other parts."
  }
];

if (typeof module !== 'undefined') {
  module.exports = { questions };
}
