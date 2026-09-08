import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock3,
  Code2,
  Coffee,
  FileText,
  Flame,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Library,
  Menu,
  MessageSquareText,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Topic = {
  id: string;
  week: string;
  title: string;
  eyebrow: string;
  blurb: string;
  accent: string;
  concepts: string[];
  summary: string;
  example: string;
  check: string;
};

const topics: Topic[] = [
  {
    id: 'exceptions',
    week: 'Week 9',
    title: 'Exceptions without panic',
    eyebrow: 'Control flow',
    blurb: 'Make failure predictable: classify it, catch it intentionally, and keep cleanup reliable.',
    accent: '#e66b5d',
    concepts: ['Hierarchy', 'Checked vs unchecked', 'try / catch / finally', 'throw vs throws'],
    summary: 'Every exception is an object in a family tree rooted at Throwable. Error usually signals a serious JVM problem. Exception is the branch application code works with; RuntimeException is unchecked and often points to a programming mistake.',
    example: `try {
  readConfig();
} catch (IOException ex) {
  recoverWithDefaults();
} finally {
  closeResources();
}`,
    check: 'A checked exception must be caught or declared with throws. A finally block runs whether the try succeeds or a handled exception occurs, making it the classic place for cleanup.',
  },
  {
    id: 'casting',
    week: 'Week 10',
    title: 'Object Typecasting and Dynamic Type Checking',
    eyebrow: 'Object relationships',
    blurb: 'Read the reference type, understand the object type, then cast only when the relationship is real.',
    accent: '#3e93a8',
    concepts: ['Upcasting / downcasting', 'instanceof', 'Pattern matching', 'ClassCastException'],
    summary: 'Upcasting from a subtype to a supertype is implicit and safe. Downcasting asks Java to treat a reference as a more specific type; it is only safe after checking the object with instanceof.',
    example: `Animal animal = new Dog(); // upcast
if (animal instanceof Dog dog) {
  dog.fetch();
}`,
    check: 'The variable type controls what members are visible at compile time. The runtime object controls whether a downcast succeeds. A bad downcast fails at runtime with ClassCastException.',
  },
  {
    id: 'interfaces',
    week: 'Week 11',
    title: 'Java Interfaces, Subtyping, and Contract-Based Design',
    eyebrow: 'Abstraction',
    blurb: 'Separate what an object can do from how it does it, then compose multiple capabilities cleanly.',
    accent: '#8472c8',
    concepts: ['implements', 'Subtyping', 'Multiple interfaces', 'Interface vs abstract class'],
    summary: 'An interface defines a contract and a type relationship. A class can implement several interfaces, which gives Java multiple inheritance of type without multiple inheritance of state.',
    example: `interface Savable { void save(); }
interface Syncable { void sync(); }

final class Draft implements Savable, Syncable {
  public void save() { /* ... */ }
  public void sync() { /* ... */ }
}`,
    check: 'Choose an interface when unrelated classes share a capability. Choose an abstract class when you need shared state, constructors, protected helpers, or a partial implementation.',
  },
  {
    id: 'interface-evolution',
    week: 'Week 12 · Part 1',
    title: 'Advanced Interface Features and Interface Evolution',
    eyebrow: 'Interface evolution',
    blurb: 'Extend contracts safely with defaults, resolve conflicts intentionally, and keep implementations swappable.',
    accent: '#d19a39',
    concepts: ['Default methods', 'Conflict resolution', 'Functional interfaces', 'Programming to an interface'],
    summary: 'Modern interfaces can evolve with default methods, static utilities, private helpers, and constants. Functional interfaces power lambdas, while programming to an interface keeps application logic independent from concrete implementations.',
    example: `@FunctionalInterface
interface Transformer {
  String apply(String value);
}

Transformer trim = String::trim;`,
    check: 'Use InterfaceName.super.method() to resolve identical default methods. A functional interface has exactly one abstract method, making it compatible with a lambda expression.',
  },
  {
    id: 'members',
    week: 'Week 12 · Part 2',
    title: 'Object Immutability, Advanced Static Features, Enums, and Records',
    eyebrow: 'Class architecture',
    blurb: 'Build safe immutable values, understand class-loading setup, and use enums and records for expressive data models.',
    accent: '#d19a39',
    concepts: ['Static initialization', 'Immutability', 'Enums', 'Records'],
    summary: 'Static initialization blocks run when a class is first loaded. Immutable objects protect their state with final fields and defensive copies, while enums and records provide concise, type-safe models for fixed choices and data carriers.',
    example: `public record ExamSlot(String topic, int minutes) {}

enum Mode {
  FOCUS, BREAK
}`,
    check: 'final prevents reference reassignment, not mutation of the referenced object. Records make data-carrier code concise, but mutable components still need defensive copying.',
  },
  {
    id: 'generics',
    week: 'Week 13',
    title: 'Java Generics: Type-Safe Generic Classes, Methods, Bounds, and Wildcards',
    eyebrow: 'Type safety',
    blurb: 'Keep collections honest at compile time and choose wildcards by the direction data moves.',
    accent: '#4f9c7a',
    concepts: ['Bounded type params', 'Wildcards', 'Generic methods', 'PECS'],
    summary: 'Generics move type mistakes from runtime to compile time. T extends Comparable<T> bounds a type. ? extends T is a producer you read from; ? super T is a consumer you can write T into.',
    example: `static <T> T first(List<T> items) {
  return items.get(0);
}

void addScores(List<? super Integer> out) {
  out.add(10); // safe
}`,
    check: 'Generic types are invariant: List<Dog> is not a List<Animal>. Use List<? extends Animal> to read animals from a list of any subtype.',
  },
  {
    id: 'composition',
    week: 'Week 14',
    title: 'Object-Oriented Design Fundamentals: Coupling, Cohesion, and Software Architecture Principles',
    eyebrow: 'Design choices',
    blurb: 'Evaluate dependencies, keep responsibilities focused, and choose architecture patterns that stay easy to change.',
    accent: '#d56e9a',
    concepts: ['Coupling', 'Cohesion', 'Interfaces', 'Composition'],
    summary: 'Good object-oriented design keeps dependencies loose and responsibilities focused. Encapsulation, abstraction, interfaces, inheritance, and composition each affect how easily a system can change without spreading edits across unrelated classes.',
    example: `final class OrderService {
  private final PaymentGateway gateway;
  OrderService(PaymentGateway gateway) {
    this.gateway = gateway;
  }
}`,
    check: 'Prefer high cohesion within a class and low coupling between classes. Program to interfaces and compose focused collaborators so changes stay isolated.',
  },
  {
    id: 'uml',
    week: 'Week 15',
    title: 'UML Class Diagrams',
    eyebrow: 'Visual modeling',
    blurb: 'Read and draw the blueprint: class members, type relationships, ownership, and multiplicity.',
    accent: '#5e8fcb',
    concepts: ['Class boxes', 'Visibility symbols', 'Inheritance & realization', 'Multiplicity'],
    summary: 'A UML class diagram describes an object-oriented system without writing the implementation. It shows classes, attributes, methods, and the relationships that connect them so design decisions can be checked before code.',
    example: `interface Drawable { void draw(); }
abstract class Shape implements Drawable {
  private Point center;
}
class Circle extends Shape {
  private double radius;
}`,
    check: 'A solid line with a hollow triangle points from subclass to superclass. A dashed line with a hollow triangle means realization (implements). Diamonds belong at the whole side: hollow for aggregation, filled for composition.',
  },
];

type LectureSection = { id: string; title: string; points: string[] };
const lecture09Sections: LectureSection[] = [
  {
    id: 'lecture09-fundamentals',
    title: '1. Exception Fundamentals and Classification',
    points: [
      'Core definition and the necessity of exception handling.',
      'The Java exception hierarchy spanning Object, Throwable, Error, and Exception.',
      'Distinctions between recoverable Exception events and fatal system Error events.',
      'Checked (compile-time) versus unchecked (runtime) exceptions.',
    ],
  },
  {
    id: 'lecture09-control-flow',
    title: '2. Control Flow and Handling Syntax (try-catch-finally)',
    points: [
      'try and catch block mechanics and execution flow.',
      'Multiple catch blocks and specific-to-general exception ordering rules.',
      'Java multi-catch shortcuts and the “no inheritance” pipe rule.',
      'The guaranteed execution behavior of the finally block.',
    ],
  },
  {
    id: 'lecture09-propagation',
    title: '3. Exception Propagation and Keywords (throw vs. throws)',
    points: [
      'Manually instantiating and triggering errors using the throw keyword.',
      'Method signature declarations using the throws keyword.',
      'Comparative breakdown of throw vs. throws usage.',
      'Exception propagation across the method call stack.',
    ],
  },
  {
    id: 'lecture09-resources',
    title: '4. Resource Management, Built-in Types, and Custom Exceptions',
    points: [
      'Common Java built-in exception types (NullPointerException, ArithmeticException, IOException, etc.).',
      'Resource management and auto-closing with try-with-resources.',
      'Creating custom checked exceptions by extending Exception.',
      'Creating custom unchecked exceptions by extending RuntimeException.',
    ],
  },
  {
    id: 'lecture09-practical',
    title: '5. Code Tracing and Practical Applications',
    points: [
      'Identifying runtime error triggers in standard Java code snippets.',
      'Step-by-step execution path tracing across try, catch, and finally blocks.',
    ],
  },
];

const lecture10Sections: LectureSection[] = [
  {
    id: 'lecture10-reference-object-types',
    title: '1. Reference Type vs. Object Type Foundations',
    points: [
      'Overview of inheritance relationships (IS-A).',
      'The reference type is checked at compile time.',
      'The actual object type is determined at runtime.',
      'How reference type and runtime object type work together.',
    ],
  },
  {
    id: 'lecture10-upcasting-members',
    title: '2. Upcasting & Member Access Rules',
    points: [
      'Implicitly converting subclass references to superclass types.',
      'The reference type restricts which methods and fields are available.',
      'Overridden methods are selected using the runtime object type.',
      'How upcasting demonstrates polymorphism.',
    ],
  },
  {
    id: 'lecture10-downcasting-risks',
    title: '3. Downcasting & ClassCastException Risks',
    points: [
      'Explicitly converting superclass references to subclass types.',
      'Accessing subclass-specific members after a valid downcast.',
      'The difference between safe and unsafe downcasting.',
      'How an invalid cast triggers ClassCastException at runtime.',
    ],
  },
  {
    id: 'lecture10-instanceof',
    title: '4. Safe Type Inspection via instanceof',
    points: [
      'Use instanceof to test an object’s actual runtime type.',
      'Check compatibility before performing a downcast.',
      'Prevent application crashes caused by invalid casts.',
      'Understand how instanceof behaves with inheritance relationships.',
    ],
  },
  {
    id: 'lecture10-pattern-scope',
    title: '5. Pattern Matching & Scope Rules (Java 14+)',
    points: [
      'Use modern syntax such as if (animal instanceof Dog d).',
      'Combine type checking and casting in one step.',
      'Track pattern-variable scope with logical AND (&&).',
      'Understand logical OR (||) and negated (!) condition scope rules.',
    ],
  },
];

const lecture12Part1Sections: LectureSection[] = [
  {
    id: 'lecture12-part1-evolution-defaults',
    title: '1. Interface Evolution and Default Methods',
    points: [
      'Add new functionality to existing interfaces without breaking concrete implementers.',
      'Use default method bodies to provide compatible behavior.',
      'Understand when an implementing class may inherit or override a default.',
      'Separate contract evolution from implementation-specific behavior.',
    ],
  },
  {
    id: 'lecture12-part1-conflicts',
    title: '2. Conflict Resolution in Multiple Interfaces',
    points: [
      'Identify diamond-problem collisions between identical default method signatures.',
      'Resolve conflicts explicitly with InterfaceName.super.method().',
      'Understand why the implementing class must choose when defaults disagree.',
      'Keep multiple interface capabilities predictable and intentional.',
    ],
  },
  {
    id: 'lecture12-part1-static-private-constants',
    title: '3. Static, Private, and Constant Interface Features',
    points: [
      'Use static interface methods for related utility operations.',
      'Use private interface methods to share implementation logic internally.',
      'Recognize implicit public static final constants declared in interfaces.',
      'Distinguish interface utilities and constants from instance members.',
    ],
  },
  {
    id: 'lecture12-part1-functional-lambdas',
    title: '4. Functional Interfaces and Lambdas',
    points: [
      'Define a functional interface with exactly one abstract method.',
      'Use the @FunctionalInterface annotation to document and validate the contract.',
      'Connect functional interfaces to lambda expressions.',
      'Read a lambda as an implementation supplied for the single abstract method.',
    ],
  },
  {
    id: 'lecture12-part1-programming-interface',
    title: '5. Programming to an Interface and Abstraction',
    points: [
      'Decouple application engine logic from specific implementation details.',
      'Depend on a contract so components can be swapped safely.',
      'Use abstraction to improve maintainability and testing.',
      'Prefer the narrow interface a client actually needs.',
    ],
  },
];

const lecture12Part2Sections: LectureSection[] = [
  {
    id: 'lecture12-part2-static-init-nested',
    title: '1. Static Initialization Blocks and Static Nested Classes',
    points: [
      'Run static setup logic automatically when a class is first loaded.',
      'Understand the timing and one-time behavior of static initialization blocks.',
      'Organize helper types with static nested classes.',
      'Distinguish static nested classes from inner classes tied to an outer instance.',
    ],
  },
  {
    id: 'lecture12-part2-immutability',
    title: '2. The Immutability Pattern and Defensive Copying',
    points: [
      'Use final classes, private final fields, and no setters to protect object state.',
      'Create safe unmodifiable values with controlled construction.',
      'Use defensive copies when accepting or returning mutable objects.',
      'Explain why immutability improves reasoning and safe sharing.',
    ],
  },
  {
    id: 'lecture12-part2-enums',
    title: '3. Enumerations (enum)',
    points: [
      'Define type-safe, fixed sets of named constant objects.',
      'Add custom state and methods to enum types.',
      'Use enum values inside switch statements.',
      'Prefer enums over loosely related integer or string constants.',
    ],
  },
  {
    id: 'lecture12-part2-records',
    title: '4. Java Records (Java 14+)',
    points: [
      'Use concise record syntax for immutable data-carrier classes.',
      'Recognize generated constructors, field accessors, equals(), hashCode(), and toString().',
      'Understand record components and their accessor naming.',
      'Choose records when the main purpose is transparent data representation.',
    ],
  },
  {
    id: 'lecture12-part2-reference-immutability',
    title: '5. Reference Immutability vs. Object State',
    points: [
      'Understand that final protects reference assignment, not the referenced object’s contents.',
      'Recognize mutable arrays and lists inside otherwise final fields.',
      'Use defensive copying to protect internal mutable state.',
      'Apply the same caution when using records with mutable components.',
    ],
  },
];

const lecture13Sections: LectureSection[] = [
  {
    id: 'lecture13-generic-classes-diamond',
    title: '1. Generic Classes and the Diamond Operator',
    points: [
      'Replace duplicated type-specific classes with generic type parameters such as Printer<T>.',
      'Instantiate generic classes with wrapper types when Java requires reference types.',
      'Use the diamond operator (<>) to infer type arguments cleanly.',
      'Trace how a type parameter keeps a class reusable without losing type information.',
    ],
  },
  {
    id: 'lecture13-compile-time-safety',
    title: '2. Compile-Time Type Safety vs. Raw Object References',
    points: [
      'Use generic collections to catch incompatible types at compile time.',
      'Avoid raw Object references that require manual casting.',
      'Explain how generics prevent runtime ClassCastException bugs.',
      'Compare the safety and readability of parameterized types with raw collections.',
    ],
  },
  {
    id: 'lecture13-bounded-generics',
    title: '3. Bounded Generics and Class/Interface Constraints',
    points: [
      'Restrict a type parameter with a single class or interface bound.',
      'Use multiple bounds to require a class relationship and interface capabilities.',
      'Apply bounds so generic code can safely call required methods.',
      'Read the syntax and ordering rules for bounded type parameters.',
    ],
  },
  {
    id: 'lecture13-generic-methods-erasure',
    title: '4. Generic Methods, Interfaces, and Type Erasure',
    points: [
      'Define generic interfaces and standalone generic methods with <T>.',
      'Manage static generic methods with their own method-level type parameters.',
      'Understand how callers infer or provide generic method type arguments.',
      'Explain how type information is erased at runtime through type erasure.',
    ],
  },
  {
    id: 'lecture13-wildcards',
    title: '5. Wildcards and Bounded Wildcards (?, extends, super)',
    points: [
      'Use unbounded wildcards (<?>) when the exact type is unknown.',
      'Use upper-bounded wildcards (<? extends T>) for flexible read-only producers.',
      'Use lower-bounded wildcards (<? super T>) for flexible collection consumers.',
      'Choose wildcard bounds by the direction data moves: read with extends, write with super.',
    ],
  },
];

const lecture14Sections: LectureSection[] = [
  {
    id: 'lecture14-coupling',
    title: '1. Principles of Coupling',
    points: [
      'Define coupling as the degree of dependency between classes or components.',
      'Contrast tightly coupled designs with loosely coupled designs.',
      'Evaluate when a dependency is necessary and when it becomes harmful.',
      'Recognize how excessive coupling makes changes ripple through a system.',
    ],
  },
  {
    id: 'lecture14-cohesion',
    title: '2. Principles of Cohesion',
    points: [
      'Define cohesion as how closely related a class’s responsibilities are.',
      'Identify single-purpose classes with high cohesion.',
      'Spot mixed-responsibility classes with low cohesion.',
      'Refactor unrelated responsibilities into focused, maintainable components.',
    ],
  },
  {
    id: 'lecture14-oop-design-quality',
    title: '3. Connecting OOP Concepts to Design Quality',
    points: [
      'Connect encapsulation to protected state and reduced dependency exposure.',
      'Connect abstraction and interfaces to smaller, more stable contracts.',
      'Evaluate how inheritance can reuse identity while increasing coupling.',
      'Use composition to organize collaborators and improve design flexibility.',
    ],
  },
  {
    id: 'lecture14-interface-composition',
    title: '4. Interface-Driven Decoupling and Composition',
    points: [
      'Use interface contracts to depend on capabilities rather than concrete classes.',
      'Model has-a relationships with object composition.',
      'Compare composition with is-a inheritance relationships.',
      'Isolate software changes by injecting replaceable collaborators.',
    ],
  },
  {
    id: 'lecture14-architectural-refactoring',
    title: '5. Architectural Refactoring & Case Analysis',
    points: [
      'Evaluate Restaurant, Student, and Order designs for mixed concerns.',
      'Identify classes that combine unrelated data, rules, persistence, or presentation work.',
      'Split responsibilities into maintainable, single-purpose components.',
      'Use coupling and cohesion principles to justify each refactoring decision.',
    ],
  },
];

const lecture11Sections: LectureSection[] = [
  {
    id: 'lecture11-definition-contracts',
    title: '1. Interface Definition and Contract Principles',
    points: [
      'An interface is a formal contract made up of method signatures.',
      'Traditional interfaces do not contain instance fields or constructors.',
      'An interface cannot be directly instantiated with the new keyword.',
      'Understand how a contract separates what a type promises from its implementation.',
    ],
  },
  {
    id: 'lecture11-implementation-subtyping',
    title: '2. Interface Implementation and Cross-Hierarchy Subtyping',
    points: [
      'Unrelated classes implement interfaces with the implements keyword.',
      'Implementing classes fulfill the interface’s promised method signatures.',
      'Interface implementation creates subtypes across otherwise separate class hierarchies.',
      'Use polymorphism based on what an object can do rather than only what it inherits.',
    ],
  },
  {
    id: 'lecture11-multiple-interfaces',
    title: '3. Multiple Interface Implementation and Conflict Safety',
    points: [
      'A Java class may extend only one superclass.',
      'A single class can implement multiple interfaces.',
      'Multiple contracts support several capabilities on one object.',
      'Traditional interfaces avoid the diamond problem because they carry no shared instance state or implementation collisions.',
    ],
  },
  {
    id: 'lecture11-role-polymorphism',
    title: '4. Role-Based Views and Polymorphic Execution',
    points: [
      'An interface reference exposes only the methods promised by that role.',
      'Compile-time checks use the declared interface type.',
      'Runtime dynamic dispatch executes the concrete class implementation.',
      'The same object can be viewed through different interface roles.',
    ],
  },
  {
    id: 'lecture11-interface-abstract-comparison',
    title: '5. Interface vs. Abstract Class Architectural Comparison',
    points: [
      'Abstract classes model shared identity and internal state through single inheritance.',
      'Interfaces model shared capabilities through multiple implementations.',
      'Compare IS-A identity relationships with CAN-DO / ACTS-AS capability relationships.',
      'Choose an abstract class for shared implementation and an interface for a flexible contract.',
    ],
  },
];

const lecture15Sections: LectureSection[] = [
  {
    id: 'lecture15-class-boxes',
    title: '1. UML Class Box Syntax and Member Notation',
    points: [
      'Read the three compartments: class name, attributes, and methods.',
      'Write attributes as visibility name : Type.',
      'Write methods as visibility name(parameters) : ReturnType.',
      'Use UML as a language-neutral blueprint for object-oriented structure.',
    ],
  },
  {
    id: 'lecture15-visibility-members',
    title: '2. Visibility, Static, and Abstract Members',
    points: [
      'Map + to public, - to private, # to protected, and ~ to package-private.',
      'Show static members with an underline.',
      'Show abstract classes and abstract methods in italics.',
      'Remember that an abstract class cannot be instantiated directly.',
    ],
  },
  {
    id: 'lecture15-inheritance-realization',
    title: '3. Inheritance and Interface Realization',
    points: [
      'Model extends with a solid line and hollow triangle.',
      'Model implements with a dashed line and hollow triangle.',
      'Point the hollow triangle toward the more general class or interface.',
      'Translate is-a relationships between Java code and UML consistently.',
    ],
  },
  {
    id: 'lecture15-object-relationships',
    title: '4. Association, Aggregation, and Composition',
    points: [
      'Use a plain line for an independent association.',
      'Use a hollow diamond for aggregation when parts can outlive the whole.',
      'Use a filled diamond for composition when the whole owns the parts’ lifecycle.',
      'Place the diamond beside the whole, not beside the contained part.',
    ],
  },
  {
    id: 'lecture15-multiplicity-translation',
    title: '5. Multiplicity and Code-to-Diagram Translation',
    points: [
      'Read 1, 0..1, 0..*, 1..*, and exact ranges near relationship ends.',
      'Translate fields, constructors, and collections into relationships.',
      'Use lifecycle and ownership evidence to choose aggregation versus composition.',
      'Move in both directions: derive a diagram from Java and Java classes from a diagram.',
    ],
  },
];

type ScheduleTask = { id: string; day: string; time: string; duration: string; practice?: string; title: string; detail: string; topic: string; lecture: string; lectureSections?: LectureSection[] };
const schedule: ScheduleTask[] = [
  { id: 's1', day: 'Tue · Sep 8', time: '10:00', duration: '4h total', practice: '1h practice', title: 'Build the exception map', detail: 'Hierarchy, checked / unchecked, cleanup', topic: 'Week 9', lecture: 'Lecture 09', lectureSections: lecture09Sections },
  { id: 's2', day: 'Tue · Sep 8', time: '14:00', duration: '4h total', practice: '1h practice', title: 'Object typecasting drills', detail: 'Reference types, dynamic checks, safe casts', topic: 'Week 10', lecture: 'Lecture 10', lectureSections: lecture10Sections },
  { id: 's3', day: 'Tue · Sep 8', time: '18:00', duration: '4h total', practice: '1h practice', title: 'Interface contract design', detail: 'Subtyping, roles, multiple interfaces', topic: 'Week 11', lecture: 'Lecture 11', lectureSections: lecture11Sections },
  { id: 's4a', day: 'Wed · Sep 9', time: '10:00', duration: '4h total', practice: '1h practice', title: 'Evolve interface contracts', detail: 'Defaults, conflicts, lambdas, abstraction', topic: 'Week 12 · Part 1', lecture: 'Lecture 12 · Part 1', lectureSections: lecture12Part1Sections },
  { id: 's4b', day: 'Wed · Sep 9', time: '14:00', duration: '4h total', practice: '1h practice', title: 'Build immutable data models', detail: 'Static setup, immutability, enums, records', topic: 'Week 12 · Part 2', lecture: 'Lecture 12 · Part 2', lectureSections: lecture12Part2Sections },
  { id: 's5', day: 'Wed · Sep 9', time: '18:00', duration: '4h total', practice: '1h practice', title: 'Generics deep pass', detail: 'Generic types, bounds, erasure, wildcards', topic: 'Week 13', lecture: 'Lecture 13', lectureSections: lecture13Sections },
  { id: 's6', day: 'Thu · Sep 10', time: '07:30', duration: '4h total', practice: '1h practice', title: 'Refactor the architecture', detail: 'Coupling, cohesion, composition, case analysis', topic: 'Week 14', lecture: 'Lecture 14', lectureSections: lecture14Sections },
  { id: 's7', day: 'Thu · Sep 10', time: '11:45', duration: '2h total', title: 'Map the object model', detail: 'UML notation, relationships, multiplicity, translation', topic: 'Week 15', lecture: 'Lecture 15', lectureSections: lecture15Sections },
];

type Question = { id: string; topic: string; prompt: string; code?: string; options: string[]; answer: number; explanation: string };
const questions: Question[] = [
  { id: 'q1', topic: 'Exceptions', prompt: 'Which statement about a checked exception is true?', options: ['It always extends Error.', 'It must be caught or declared with throws.', 'It can never be thrown manually.', 'It is always caused by a syntax error.'], answer: 1, explanation: 'Checked exceptions are verified by the compiler. The method must handle them or include them in its throws clause.' },
  { id: 'q2', topic: 'Casting', prompt: 'What happens when this code runs?', code: 'Object value = "exam";\\nInteger number = (Integer) value;', options: ['number becomes null.', 'It compiles and prints 0.', 'A ClassCastException is thrown.', 'The cast is silently ignored.'], answer: 2, explanation: 'The reference is an Object, but the runtime object is a String. The downcast to Integer is not valid.' },
  { id: 'q3', topic: 'Interfaces', prompt: 'Why can a class implement multiple interfaces?', options: ['Interfaces can provide multiple constructors.', 'Java allows multiple inheritance of type/contracts.', 'Interfaces always have instance fields.', 'The JVM merges their parent classes.'], answer: 1, explanation: 'A class may implement many capability contracts. This gives multiple inheritance of type without inheriting multiple class states.' },
  { id: 'q4', topic: 'Members', prompt: 'Which access is valid from a static method?', options: ['Reading an instance field directly.', 'Calling an instance method without an object.', 'Reading a static field.', 'Using this to access the outer object.'], answer: 2, explanation: 'A static method has no particular instance, so it can directly access only static members.' },
  { id: 'q5', topic: 'Generics', prompt: 'Which collection can safely receive Integer values?', options: ['List<? extends Number>', 'List<? super Integer>', 'List<?>', 'List<Number> only'], answer: 1, explanation: 'A ? super Integer consumer can be a List<Integer>, List<Number>, or List<Object>; adding an Integer is safe.' },
  { id: 'q6', topic: 'Composition', prompt: 'What is a practical benefit of constructor injection?', options: ['It makes every field static.', 'It lowers coupling and makes collaborators replaceable in tests.', 'It prevents all exceptions.', 'It forces inheritance.'], answer: 1, explanation: 'Passing a collaborator in makes the class depend on an abstraction and lets tests provide a small fake.' },
  { id: 'q7', topic: 'Exceptions', prompt: 'Which block is designed for cleanup that should happen after try?', options: ['throws', 'catch', 'finally', 'throw'], answer: 2, explanation: 'finally runs after the try/catch flow, whether an exception was handled or not in the usual control paths.' },
  { id: 'q8', topic: 'Generics', prompt: 'Why is List<Dog> not a subtype of List<Animal>?', options: ['Dog is not an Animal.', 'Generics are invariant to prevent unsafe writes.', 'Lists cannot contain objects.', 'The JVM erases all classes.'], answer: 1, explanation: 'If it were allowed, code could put a Cat into a List<Dog>. Invariance keeps generic writes type-safe.' },
];

type Scenario = { id: string; title: string; topic: string; prompt: string; code: string; options: string[]; answer?: number; explanation?: string; openEnded?: boolean; acceptance?: string[] };
const lecture13Scenarios: Scenario[] = [
  {
    id: 'lecture13-c1',
    title: 'Replace duplicate printers with one generic class',
    topic: 'Lecture 13 · Generics',
    prompt: 'Which generic design replaces separate IntegerPrinter, DoublePrinter, and StringPrinter classes?',
    code: `class Printer<T> {
  T thingToPrint;
  Printer(T thingToPrint) {
    this.thingToPrint = thingToPrint;
  }
  void print() { /* ... */ }
}

// Choose the valid uses`,
    options: [
      'new Printer<>(23), new Printer<>(33.5), and new Printer<>("Hello")',
      'new Printer<int>(23), new Printer<double>(33.5), and new Printer<string>("Hello")',
      'Printer<Object> for every value is the only valid approach',
      'A generic class can hold only one concrete type for the whole program',
    ],
    answer: 0,
    explanation: 'The diamond operator infers T from each constructor argument. Java uses wrapper types for generic arguments, so Printer<Integer>, Printer<Double>, and Printer<String> are inferred without repeating the type.',
  },
  {
    id: 'lecture13-c2',
    title: 'Swap values without losing type safety',
    topic: 'Lecture 13 · Generics',
    prompt: 'Why can one swap method safely exchange both fields in Pair<T>?',
    code: `class Pair<T> {
  T first;
  T second;

  void swap() {
    T temp = first;
    first = second;
    second = temp;
  }
}`,
    options: [
      'Both fields have the same T, so a temporary T can move either value safely.',
      'The compiler converts every value to Object before swapping.',
      'swap() works only when T is String.',
      'A cast to Integer is required before assigning second to first.',
    ],
    answer: 0,
    explanation: 'Pair<T> guarantees that first and second have the same type parameter. A temporary variable of type T preserves that guarantee for Pair<String>, Pair<Integer>, and every other valid T.',
  },
  {
    id: 'lecture13-c3',
    title: 'Let the collection enforce its contract',
    topic: 'Lecture 13 · Generics',
    prompt: 'What happens in the typed Cat list versus the Object list?',
    code: `ArrayList<Cat> cats = new ArrayList<>();
cats.add(new Cat());
// cats.add(new Dog()); // line to evaluate

ArrayList<Object> rawList = new ArrayList<>();
rawList.add(new Cat());
rawList.add(new Dog());
Cat wrongCat = (Cat) rawList.get(1);`,
    options: [
      'The Cat list rejects Dog at compile time; the Object list accepts it but the cast throws ClassCastException.',
      'Both lists reject Dog at compile time.',
      'Both lists accept Dog and the cast changes Dog into Cat.',
      'The Cat list throws ClassCastException before the program runs.',
    ],
    answer: 0,
    explanation: 'ArrayList<Cat> gives compile-time protection. ArrayList<Object> accepts anything, so the invalid assumption is delayed until retrieving the Dog as Cat, where ClassCastException occurs.',
  },
  {
    id: 'lecture13-c4',
    title: 'Bound a generic class to Animal',
    topic: 'Lecture 13 · Generics',
    prompt: 'Why can Printer<Cat> call eat(), while Printer<Integer> is rejected?',
    code: `abstract class Animal {
  abstract void eat();
}

class Printer<T extends Animal> {
  T thingToPrint;
  void print() {
    thingToPrint.eat();
  }
}

Printer<Cat> cats = new Printer<>();
// Printer<Integer> numbers = new Printer<>();`,
    options: [
      'T extends Animal guarantees every T has eat(); Integer does not satisfy the bound.',
      'All generic types inherit Animal methods automatically.',
      'Integer is accepted but eat() is skipped at runtime.',
      'The bound means T must be exactly Animal, so Cat is rejected too.',
    ],
    answer: 0,
    explanation: 'The upper bound gives the compiler a safe Animal view of every T. Cat extends Animal, but Integer does not, so Printer<Integer> fails at compile time.',
  },
  {
    id: 'lecture13-c5',
    title: 'Apply multiple bounds',
    topic: 'Lecture 13 · Generics',
    prompt: 'What must FlyingCat satisfy for Printer<T extends Animal & Flyable>?',
    code: `class Printer<T extends Animal & Flyable> {
  void print(T thing) {
    thing.eat();
    thing.fly();
  }
}

class FlyingCat extends Animal implements Flyable { /* both methods */ }
Printer<FlyingCat> printer = new Printer<>();`,
    options: [
      'T must extend the class Animal and implement the Flyable interface.',
      'T may be any class because interfaces are ignored in bounds.',
      'T must implement Animal and extend Flyable.',
      'Multiple bounds are valid only when all bounds are classes.',
    ],
    answer: 0,
    explanation: 'A multiple bound combines one class bound first with interface bounds after it. FlyingCat satisfies both contracts, so the generic body can safely call eat() and fly().',
  },
  {
    id: 'lecture13-c6',
    title: 'Implement a generic interface two ways',
    topic: 'Lecture 13 · Generics',
    prompt: 'What is the difference between Box<T> and StringContainer?',
    code: `interface Container<T> {
  T get();
  void set(T value);
}

class Box<T> implements Container<T> { /* generic */ }
class StringContainer implements Container<String> { /* concrete */ }`,
    options: [
      'Box stays generic for any T; StringContainer fixes the contract to String.',
      'Both classes are concrete String containers.',
      'Box cannot implement a generic interface without extending Object.',
      'StringContainer can set any Object because String is only documentation.',
    ],
    answer: 0,
    explanation: 'Box<T> passes its type parameter through to Container<T>. StringContainer chooses String, so its get and set methods are specifically typed as String.',
  },
  {
    id: 'lecture13-c7',
    title: 'Give a method its own type parameter',
    topic: 'Lecture 13 · Generics',
    prompt: 'Why can one shout method accept a String, Integer, and Cat?',
    code: `class Shouter {
  <T> void shout(T thingToShout) {
    System.out.println(thingToShout + "!!!");
  }
}

Shouter s = new Shouter();
s.shout("John");
s.shout(57);
s.shout(new Cat());`,
    options: [
      'The method declares T independently for each call, so no overloads are needed.',
      'T is fixed to String when Shouter is constructed.',
      'Java uses unsafe casts from every argument to String.',
      'Generic methods can accept only primitive values.',
    ],
    answer: 0,
    explanation: 'The method-level <T> is inferred separately at each invocation. It can represent String, Integer, Cat, or another reference type while preserving one reusable method body.',
  },
  {
    id: 'lecture13-c8',
    title: 'Return the exact generic type',
    topic: 'Lecture 13 · Generics',
    prompt: 'What types are inferred by pickFirst("hello", 42) and echo(57)?',
    code: `static <T, V> T pickFirst(T first, V second) {
  return first;
}
static <T> T echo(T item) {
  return item;
}

String text = pickFirst("hello", 42);
int number = echo(57);`,
    options: [
      'T is String for pickFirst and Integer for echo; no cast is needed.',
      'Both methods return Object, so both assignments require casts.',
      'T must be the same type as V, so the first call is invalid.',
      'echo always returns String because it has one type parameter.',
    ],
    answer: 0,
    explanation: 'pickFirst has separate T and V parameters, so T is String and V is Integer. echo infers T as Integer, and Java unboxes the returned Integer to int.',
  },
  {
    id: 'lecture13-c9',
    title: 'Read any parameterized list with ?',
    topic: 'Lecture 13 · Generics',
    prompt: 'Why can printList(List<?> myList) accept both lists, while List<Object> cannot?',
    code: `static void printList(List<?> myList) {
  System.out.println(myList);
}

List<Integer> numbers = new ArrayList<>();
List<Cat> cats = new ArrayList<>();

printList(numbers);
printList(cats);`,
    options: [
      '<?> means an unknown element type, so any parameterized List can be read safely.',
      'List<Integer> is a subtype of List<Object> because Integer extends Object.',
      'The wildcard converts every element to Object permanently.',
      'List<?> allows adding arbitrary objects to every list.',
    ],
    answer: 0,
    explanation: 'List<?> accepts a list of an unknown specific type and is safe for reading as Object. Java generics are invariant, so List<Integer> is not a List<Object>.',
  },
  {
    id: 'lecture13-c10',
    title: 'Choose upper and lower wildcard bounds',
    topic: 'Lecture 13 · Generics',
    prompt: 'Which PECS interpretation correctly describes these methods?',
    code: `static void feedAnimals(List<? extends Animal> animals) {
  for (Animal a : animals) a.eat();
  // animals.add(new Dog()); // unsafe
}

static void addDogs(List<? super Dog> animals) {
  animals.add(new Dog());
  animals.add(new Puppy());
  // animals.add(new Cat()); // unsafe
}`,
    options: [
      '? extends is a producer to read Animals; ? super is a consumer that safely accepts Dogs and Puppies.',
      '? extends is for adding any subtype; ? super is for reading only as Dog.',
      'Both bounds mean the list can contain exactly Animal and no subtype.',
      'The two methods are equivalent because wildcards only affect syntax.',
    ],
    answer: 0,
    explanation: 'With ? extends Animal, values can safely be read as Animal but a new subtype cannot safely be added. With ? super Dog, Dog and Puppy can be added, while reads are only guaranteed as Object.',
  },
];

const lecture14StarterCode = `public class Main {
    public static void main(String[] args) {
        CampusCanteen canteen = new CampusCanteen();

        canteen.placeOrder("Waseef", 120);

        int salary = canteen.calculateSalary(12, 200);
        canteen.printEmployeeReport("Rahim", salary);
    }
}

class MobileWallet {
    public int balance = 500;
}

class CampusDelivery {
    public String zoneCode = "HALL-A";

    public void dispatch(String customerName, String zone) {
        System.out.println(
            "Delivered to " + customerName + " at " + zone
        );
    }
}

class CampusCanteen {
    private MobileWallet wallet = new MobileWallet();
    private CampusDelivery delivery = new CampusDelivery();

    public void placeOrder(String customerName, int total) {
        if (wallet.balance < total) {
            System.out.println("Payment failed");
            return;
        }

        wallet.balance -= total;
        System.out.println("Payment successful: " + total);
        delivery.dispatch(customerName, delivery.zoneCode);
        printReceipt(customerName, total);
    }

    public void printReceipt(String customerName, int total) {
        System.out.println(
            "Receipt: " + customerName + " | Total: " + total
        );
    }

    public int calculateSalary(int hours, int hourlyRate) {
        return hours * hourlyRate;
    }

    public void printEmployeeReport(String name, int salary) {
        System.out.println(
            "Employee: " + name + " | Salary: " + salary
        );
    }
}`;

const lecture14Scenarios: Scenario[] = [
  {
    id: 'lecture14-c1',
    title: 'Q1 · Identify and separate responsibilities',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'Refactor calculateSalary() and printEmployeeReport() into an EmployeeAdministration class. Keep payroll calculation unchanged, then write one sentence explaining why sharing the same university or canteen context does not automatically make methods cohesive.',
    code: `calculateSalary(12, 200)
printEmployeeReport("Rahim", salary)`,
    options: [],
    openEnded: true,
    acceptance: [
      'EmployeeAdministration calculates 12 * 200 = 2400.',
      'CampusCanteen no longer contains payroll or employee-report logic.',
    ],
  },
  {
    id: 'lecture14-c2',
    title: 'Q2 · Separate display from application behavior',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'Move receipt formatting and printing into a ReceiptPrinter class. Decide which order data the printer needs and pass it through parameters or an Order object. It must not calculate payments, dispatch deliveries, or modify order state.',
    code: `printReceipt("Waseef", 120);`,
    options: [],
    openEnded: true,
    acceptance: [
      'Changing "Receipt:" to "Canteen Receipt:" requires editing only ReceiptPrinter.',
    ],
  },
  {
    id: 'lecture14-c3',
    title: 'Q3 · Remove knowledge of payment internals',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'MobileWallet balance is read and modified directly by placeOrder(). Move the balance check and deduction into boolean processPayment(int amount), return true only when payment succeeds, and update placeOrder() to call that behavior. Explain which dependency existed before and how this change reduces coupling.',
    code: `if (wallet.balance < total) {
    System.out.println("Payment failed");
    return;
}
wallet.balance -= total;`,
    options: [],
    openEnded: true,
    acceptance: [
      'A payment of 120 from a balance of 500 leaves 380.',
      'An unaffordable payment returns false and leaves the balance unchanged.',
    ],
  },
  {
    id: 'lecture14-c4',
    title: 'Q4 · Encapsulate related state and behavior',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'Make MobileWallet.balance private. Provide a constructor for its initial balance and a read-only getBalance() method. Do not introduce a public balance setter. Reject non-positive payment amounts without changing the balance, then explain how keeping wallet state and payment behavior together supports cohesion.',
    code: `class MobileWallet {
    public int balance = 500;
}`,
    options: [],
    openEnded: true,
    acceptance: [
      'processPayment(0) and processPayment(-50) both return false.',
      'Other classes cannot directly assign to balance.',
    ],
  },
  {
    id: 'lecture14-c5',
    title: 'Q5 · Depend on a payment contract',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'Introduce interface PaymentService with boolean processPayment(int amount). Make MobileWallet implement it. Change CampusCanteen to receive a PaymentService through its constructor, store it in a field, remove new MobileWallet() from CampusCanteen, and create the concrete wallet in main(). Explain what dependency remains after introducing the interface.',
    code: `interface PaymentService {
    boolean processPayment(int amount);
}`,
    options: [],
    openEnded: true,
    acceptance: [
      'CampusCanteen contains no MobileWallet-specific operations.',
    ],
  },
  {
    id: 'lecture14-c6',
    title: 'Q6 · Replace an implementation without editing the client',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'Create VoucherPayment implementing PaymentService. It starts with a voucher balance, accepts only positive affordable payments, and rejects unaffordable ones. Run the same order workflow once with MobileWallet and once with VoucherPayment by changing object construction in main(). Explain why the method signature alone is insufficient if an implementation returns true without actually recording payment.',
    code: `PaymentService payment = /* choose an implementation */;
CampusCanteen canteen = new CampusCanteen(payment, delivery, printer);`,
    options: [],
    openEnded: true,
    acceptance: [
      'Each implementation, starting with 500, accepts a payment of 120.',
      'No changes are made to CampusCanteen.placeOrder().',
    ],
  },
  {
    id: 'lecture14-c7',
    title: 'Q7 · Remove delivery implementation dependencies',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'placeOrder() currently knows the delivery provider’s zone-code field. Introduce DeliveryService with void deliver(String customerName), make CampusDelivery implement it and hide its zone code internally, then pass a DeliveryService into CampusCanteen’s constructor.',
    code: `delivery.dispatch(customerName, delivery.zoneCode);`,
    options: [],
    openEnded: true,
    acceptance: [
      'CampusCanteen does not read a delivery zone field.',
      'Changing the internal zone representation does not require editing CampusCanteen.',
    ],
  },
  {
    id: 'lecture14-c8',
    title: 'Q8 · Use composition and preserve workflow',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'Introduce Order containing customerName and total with a constructor and read-only getters. Change the workflow to boolean placeOrder(Order order). CampusCanteen should hold PaymentService, DeliveryService, and ReceiptPrinter objects as fields. Preserve this sequence: attempt payment; return false immediately on failure; otherwise deliver and print the receipt; return true. Identify the has-a relationships and explain why several collaborators do not automatically imply bad coupling.',
    code: `boolean placeOrder(Order order) {
    // payment → delivery → receipt
}`,
    options: [],
    openEnded: true,
    acceptance: [
      'A failed payment causes no delivery and no receipt.',
      'An order genuinely connects payment, delivery, and customer data.',
    ],
  },
  {
    id: 'lecture14-c9',
    title: 'Q9 · Repair an inheritance-based dependency',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'A teammate proposes DiscountCanteen extends MobileWallet and reads balance directly. Explain why this fails after Q4 and why making balance protected would still leave a dependency on the parent’s representation. Rewrite DiscountCanteen to hold a PaymentService instead and delegate total - 20, rejecting totals of 20 or below. Explain why a canteen “is a wallet” is a poor model.',
    code: `class DiscountCanteen extends MobileWallet {
    boolean payDiscounted(int total) {
        int payable = total - 20;
        if (balance < payable) return false;
        balance -= payable;
        return true;
    }
}`,
    options: [],
    openEnded: true,
    acceptance: [
      'A total of 120 charges 100.',
      'DiscountCanteen never reads or writes a wallet balance.',
    ],
  },
  {
    id: 'lecture14-c10',
    title: 'Q10 · Verify the design and explain the trade-off',
    topic: 'OOC Week 14 · Scenario-Based Understanding Test',
    prompt: 'Create StubPayment implementing PaymentService with a fixed success/failure result and a recorded requested amount. Create RecordingDelivery implementing DeliveryService with a deliver() call counter. Use them to verify the refactored workflow without real services, then name two necessary remaining dependencies, two cohesive classes and their purposes, one removed concrete implementation dependency, why zero coupling is not the goal, and why an interface for every class is unnecessary.',
    code: `StubPayment payment = new StubPayment(true);
RecordingDelivery delivery = new RecordingDelivery();
// Verify successful and failed placeOrder(Order) paths`,
    options: [],
    openEnded: true,
    acceptance: [
      'Successful payment of 120 returns true, records 120, delivers exactly once, and prints one receipt.',
      'Failed payment returns false, never delivers, and prints no receipt.',
      'Replacing the payment implementation requires no changes to placeOrder().',
    ],
  },
];

const lecture15Scenarios: Scenario[] = [
  {
    id: 'lecture15-c1',
    title: 'Read a UML class box',
    topic: 'Lecture 15 · UML',
    prompt: 'Which statement correctly translates the three UML compartments into Java?',
    code: `Student
-----------------------------
- name : String
- id : int
-----------------------------
+ Student(name : String, id : int)
+ getName() : String
+ registerCourse(courseName : String) : void`,
    options: [
      'The top is the class name, the middle lists attributes, and the bottom lists methods.',
      'The top lists methods, the middle lists constructors, and the bottom lists packages.',
      'The plus and minus signs are Java operators rather than visibility markers.',
      'UML class boxes describe only database tables, not Java classes.',
    ],
    answer: 0,
    explanation: 'A UML class box has three compartments: the class name, attributes, and operations. Attribute and method signatures show visibility, names, types, parameters, and return types.',
  },
  {
    id: 'lecture15-c2',
    title: 'Decode visibility and member style',
    topic: 'Lecture 15 · UML',
    prompt: 'What do the UML symbols and text styles communicate?',
    code: `Employee
-----------------------------
- name : String
# baseSalary : double
_totalEmployees : int_
-----------------------------
+ getName() : String
_+ getTotalEmployees() : int_
_+ calculatePay() : double_`,
    options: [
      '- is private, # is protected, underlining means static, and italics indicate abstract.',
      '- is public, # is private, underlining means final, and italics indicate static.',
      'All fields are package-private because UML has no visibility notation.',
      'Underlining means an instance field and italics mean a constructor.',
    ],
    answer: 0,
    explanation: 'UML maps - to private and # to protected. Static members are underlined, while abstract classes and methods are written in italics.',
  },
  {
    id: 'lecture15-c3',
    title: 'Point inheritance the right way',
    topic: 'Lecture 15 · UML',
    prompt: 'Which UML relationship represents Manager extends Employee?',
    code: `class Employee { }
class Manager extends Employee { }`,
    options: [
      'A solid line with a hollow triangle pointing from Manager to Employee.',
      'A dashed line with a filled diamond pointing from Employee to Manager.',
      'A solid line with a filled triangle pointing from Employee to Manager.',
      'A plain line with no arrow because inheritance has no diagram notation.',
    ],
    answer: 0,
    explanation: 'Inheritance uses a solid line and hollow triangle. The triangle points toward the more general type, so Manager points to Employee.',
  },
  {
    id: 'lecture15-c4',
    title: 'Distinguish realization from inheritance',
    topic: 'Lecture 15 · UML',
    prompt: 'How should this Java relationship be drawn?',
    code: `interface Drawable {
  void draw();
}
class Shape implements Drawable {
  public void draw() { }
}`,
    options: [
      'A dashed line with a hollow triangle from Shape to Drawable.',
      'A solid line with a hollow triangle from Drawable to Shape.',
      'A filled diamond from Shape to Drawable.',
      'A plain association line with multiplicity 1..*.',
    ],
    answer: 0,
    explanation: 'Interface implementation is realization: a dashed line with a hollow triangle pointing to the interface. A solid line is reserved for class inheritance.',
  },
  {
    id: 'lecture15-c5',
    title: 'Choose a plain association',
    topic: 'Lecture 15 · UML',
    prompt: 'Which relationship best models Doctor holding a current Patient reference?',
    code: `class Doctor {
  private Patient currentPatient;
  void diagnose(Patient patient) { }
}
class Patient { }`,
    options: [
      'Association: both Doctor and Patient can exist independently, so use a plain line.',
      'Composition: Doctor creates and owns each Patient’s lifetime.',
      'Aggregation: Patient cannot exist without a Doctor.',
      'Inheritance: Patient is a specialized kind of Doctor.',
    ],
    answer: 0,
    explanation: 'This is an association because Doctor and Patient are related but independent. The code does not show ownership or a lifecycle dependency.',
  },
  {
    id: 'lecture15-c6',
    title: 'Recognize aggregation',
    topic: 'Lecture 15 · UML',
    prompt: 'Why is Team–Player aggregation rather than composition?',
    code: `class Team {
  private List<Player> players;
  void addPlayer(Player player) { players.add(player); }
}
class Player { }`,
    options: [
      'Players are supplied from outside and can outlive or join another Team; use a hollow diamond.',
      'Team creates every Player internally and destroys them with itself; use a filled diamond.',
      'Player extends Team, so use a hollow triangle.',
      'There is no relationship because List fields are ignored in UML.',
    ],
    answer: 0,
    explanation: 'Aggregation is a whole–part relationship with independent part lifetimes. Team contains Players, but Players are added from outside and can survive Team deletion.',
  },
  {
    id: 'lecture15-c7',
    title: 'Recognize composition',
    topic: 'Lecture 15 · UML',
    prompt: 'Which notation matches Car creating and owning its Engine?',
    code: `class Car {
  private Engine engine;
  Car() {
    engine = new Engine();
  }
}
class Engine { }`,
    options: [
      'A filled diamond at Car, because Car owns the Engine lifecycle.',
      'A hollow diamond at Engine, because Engine is a reusable whole.',
      'A dashed hollow triangle from Car to Engine.',
      'A plain line because constructors never affect UML relationships.',
    ],
    answer: 0,
    explanation: 'Composition expresses strong ownership: Car creates the Engine internally and its lifetime is tied to the Car. The filled diamond sits beside the whole, Car.',
  },
  {
    id: 'lecture15-c8',
    title: 'Place multiplicities correctly',
    topic: 'Lecture 15 · UML',
    prompt: 'What multiplicities describe a Playlist that can contain zero or many Songs?',
    code: `class Playlist {
  private List<Song> songs;
}
class Song { }`,
    options: [
      'Playlist–Song is 0..* at the Song end; a Song may be in 0..* Playlists if reuse is allowed.',
      'Playlist–Song is exactly 1 at both ends because every field means one object.',
      'Playlist–Song is 1..* at the Playlist end and 0..1 at the Song end.',
      'Multiplicity is written only for inheritance, not for collection relationships.',
    ],
    answer: 0,
    explanation: 'A List<Song> permits zero or many Songs for each Playlist, so write 0..* near Song. The opposite end depends on the design; reusable Songs may belong to zero or many Playlists.',
  },
  {
    id: 'lecture15-c9',
    title: 'Translate Java into a diagram',
    topic: 'Lecture 15 · UML',
    prompt: 'Which diagram facts follow from this code?',
    code: `interface Payable {
  double calculatePay();
}
abstract class Employee implements Payable {
  private String name;
  protected double baseSalary;
}
class Manager extends Employee {
  private Department department;
}`,
    options: [
      'Payable is an interface, Employee is abstract, Manager inherits Employee, and Manager associates with Department.',
      'Employee is concrete, Manager implements Employee, and Department must be composed.',
      'Manager is the general type and Employee is its implementation interface.',
      'All three types belong in one class box because fields create inheritance.',
    ],
    answer: 0,
    explanation: 'The code yields a dashed realization from Employee to Payable, a solid inheritance arrow from Manager to Employee, and an association from Manager to Department unless ownership evidence says otherwise.',
  },
  {
    id: 'lecture15-c10',
    title: 'Translate a diagram into code',
    topic: 'Lecture 15 · UML',
    prompt: 'What Java structure matches a dashed realization, solid inheritance, and filled-diamond Point relationship?',
    code: `Drawable ..> Shape
Shape <|-- Circle
Shape ◆-- Point`,
    options: [
      'Shape implements Drawable; Circle extends Shape; Shape creates and owns a Point.',
      'Drawable extends Shape; Shape implements Circle; Point extends Shape.',
      'Circle implements Drawable; Point aggregates Shape; Shape extends Circle.',
      'All three connections are plain associations with no Java keywords.',
    ],
    answer: 0,
    explanation: 'A dashed hollow triangle is implements, a solid hollow triangle is extends, and a filled diamond means composition. The diagram therefore maps to Shape implements Drawable, Circle extends Shape, and Shape owning a Point.',
  },
];

const lecture09Scenarios: Scenario[] = [
  {
    id: 'lecture09-c1',
    title: 'Guard the array and divisor',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'What does this method do for the two calls in main, and why does the application keep running?',
    code: `static void divideElement(int[] numbers, int index, int divisor) {
  try {
    int result = numbers[index] / divisor;
    System.out.println("Result: " + result);
  } catch (ArithmeticException e) {
    System.out.println("Error: Cannot divide by zero.");
  } catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Error: Invalid array index accessed.");
  }
}

int[] data = {10, 20, 30};
divideElement(data, 1, 0);
divideElement(data, 5, 2);`,
    options: [
      'The first call reports division by zero; the second reports an invalid index.',
      'The first prints 20; the second stops the whole application.',
      'Both calls are handled by ArithmeticException.',
      'The array-index catch must come before the arithmetic catch.',
    ],
    answer: 0,
    explanation: 'The first call reaches a zero divisor, while the second evaluates an invalid index. Each specific catch handles its own failure, so neither exception escapes the method.',
  },
  {
    id: 'lecture09-c2',
    title: 'Use multi-catch for one recovery path',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'Which pair of inputs is handled by the same multi-catch block in parseAndCompute?',
    code: `static void parseAndCompute(String input) {
  try {
    int number = Integer.parseInt(input);
    int reciprocal = 100 / number;
  } catch (NumberFormatException | ArithmeticException e) {
    System.out.println("Invalid input or calculation error");
  }
}`,
    options: [
      '"abc" and "0"',
      '"12" and "5"',
      'null and "12"',
      '"abc" and null only',
    ],
    answer: 0,
    explanation: 'Parsing "abc" raises NumberFormatException and dividing by zero from input "0" raises ArithmeticException. Both are unrelated exception types, so the pipe syntax is legal.',
  },
  {
    id: 'lecture09-c3',
    title: 'Order catches from specific to general',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'Which change makes this catch hierarchy compile while preserving the specialized null message?',
    code: `try {
  System.out.println(text.length());
  int value = Integer.parseInt(text);
} catch (Exception e) {
  System.out.println("General error");
} catch (NullPointerException e) {
  System.out.println("String reference is null");
}`,
    options: [
      'Move NullPointerException before Exception.',
      'Move Exception into a finally block.',
      'Replace Exception with Error.',
      'Put both types in one multi-catch block.',
    ],
    answer: 0,
    explanation: 'NullPointerException is a subclass of Exception. The specific catch must appear first; otherwise the general catch makes the later branch unreachable.',
  },
  {
    id: 'lecture09-c4',
    title: 'Trust finally to clean up',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'What output order should executeQuery(null) produce?',
    code: `static boolean executeQuery(String query) {
  try {
    System.out.println("Database connection opened.");
    if (query == null) throw new IllegalArgumentException("Query cannot be null.");
    return true;
  } catch (IllegalArgumentException e) {
    System.out.println("Query execution failed");
    return false;
  } finally {
    System.out.println("Database connection closed cleanly.");
  }
}`,
    options: [
      'Only "Query execution failed".',
      '"Query execution failed", then "Database connection closed cleanly."',
      '"Database connection closed cleanly." before the catch message.',
      'The finally block is skipped because catch returns false.',
    ],
    answer: 1,
    explanation: 'finally runs after the try/catch path even when the catch block returns. It is the reliable cleanup point for this method.',
  },
  {
    id: 'lecture09-c5',
    title: 'Trigger a domain rule with throw',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'What happens when the caller invokes registerUser(15) inside the shown try block?',
    code: `static void registerUser(int age) {
  if (age < 18) {
    throw new IllegalArgumentException(
      "User must be at least 18 years old.");
  }
  System.out.println("User registered successfully!");
}`,
    options: [
      'The method silently returns because age is invalid.',
      'It creates and throws IllegalArgumentException, which the caller can catch.',
      'The compiler changes it into a checked IOException.',
      'The success message prints before the exception.',
    ],
    answer: 1,
    explanation: 'throw manually creates an exception event at the validation boundary. The surrounding caller catch can handle the IllegalArgumentException.',
  },
  {
    id: 'lecture09-c6',
    title: 'Declare checked I/O risk with throws',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'What must a caller do when it invokes openFile, because the method declares throws IOException?',
    code: `static void openFile(String path) throws IOException {
  FileReader reader = new FileReader(path);
  reader.read();
}

openFile("non_existent_file.txt");`,
    options: [
      'Nothing; IOException is always unchecked.',
      'Catch IOException or declare it with throws too.',
      'Replace throws with throw at the call site.',
      'Catch only RuntimeException.',
    ],
    answer: 1,
    explanation: 'IOException is checked. Every caller must handle it with catch or pass the responsibility upward by declaring throws.',
  },
  {
    id: 'lecture09-c7',
    title: 'Trace the call stack',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'Where is the ArithmeticException finally handled when level3 divides by zero?',
    code: `static void level3() { int result = 50 / 0; }
static void level2() { level3(); }
static void level1() { level2(); }

try {
  level1();
} catch (ArithmeticException e) {
  System.out.println("Centralized handler");
}`,
    options: [
      'Inside level3 automatically, because it caused the error.',
      'Inside level2, because every caller must catch runtime exceptions.',
      'Inside level1, because propagation stops after one method.',
      'In main, after the exception propagates through level2 and level1.',
    ],
    answer: 3,
    explanation: 'The runtime exception is not caught in the nested methods, so it travels back up the call stack until main’s catch block handles it.',
  },
  {
    id: 'lecture09-c8',
    title: 'Let try-with-resources close the file',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'What resource-management guarantee does this method get from try-with-resources?',
    code: `static void readData(String filename) {
  try (FileReader reader = new FileReader(filename)) {
    System.out.println("Reading file data...");
    reader.read();
  } catch (IOException e) {
    System.out.println("Error reading file");
  }
}`,
    options: [
      'The FileReader is closed automatically when the try block ends.',
      'The FileReader stays open until the JVM exits.',
      'The catch block must manually call reader.close().',
      'try-with-resources only works for unchecked exceptions.',
    ],
    answer: 0,
    explanation: 'FileReader is AutoCloseable. Java inserts the close operation when the try block exits, including when an IOException occurs.',
  },
  {
    id: 'lecture09-c9',
    title: 'Enforce a checked business rule',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'Why must the caller of bookSeat handle SeatNotAvailableException?',
    code: `class SeatNotAvailableException extends Exception { }

void bookSeat() throws SeatNotAvailableException {
  if (seatTaken) {
    throw new SeatNotAvailableException();
  }
}

system.bookSeat();`,
    options: [
      'It extends Exception, so the compiler requires catch or throws.',
      'Every custom exception is automatically unchecked.',
      'Only main methods can throw custom exceptions.',
      'The caller must catch RuntimeException instead.',
    ],
    answer: 0,
    explanation: 'Extending Exception creates a checked exception. The throws declaration makes the handling responsibility visible at compile time.',
  },
  {
    id: 'lecture09-c10',
    title: 'Validate with an unchecked exception',
    topic: 'Lecture 09 · Exceptions',
    prompt: 'What happens when new Student("1001") is evaluated?',
    code: `class InvalidStudentIdException extends RuntimeException { }

Student(String studentId) {
  if (studentId == null || !studentId.startsWith("STU")) {
    throw new InvalidStudentIdException("ID format error");
  }
}

Student s1 = new Student("STU1001");
Student s2 = new Student("1001");`,
    options: [
      's2 is created with a null ID.',
      'The constructor throws InvalidStudentIdException at runtime.',
      'The compiler requires every caller to declare throws.',
      'The invalid ID is silently converted to STU1001.',
    ],
    answer: 1,
    explanation: 'InvalidStudentIdException extends RuntimeException, so the invalid value fails at runtime and callers are not forced to catch or declare it.',
  },
];

const lecture10Scenarios: Scenario[] = [
  {
    id: 'lecture10-c1',
    title: 'Read the reference type',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'What does this print, and which rule explains the result?',
    code: `class Animal {
  String type = "Animal";
}
class Cat extends Animal {
  String type = "Cat";
}

Cat cat = new Cat();
Animal animal = cat;
System.out.println(animal.type);`,
    options: [
      'Cat, because the object was created as a Cat.',
      'Animal, because fields are resolved from the reference type.',
      'A compile-time error, because upcasting is forbidden.',
      'Nothing, because animal is null.',
    ],
    answer: 1,
    explanation: 'The solution prints "Animal". Fields are hidden rather than dynamically overridden, so animal.type uses the declared reference type Animal even though the object is a Cat.',
  },
  {
    id: 'lecture10-c2',
    title: 'Recover a subtype-only method',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'Which fix allows the code to call meow after the Cat has been upcast?',
    code: `Cat cat = new Cat();
Animal animal = cat;

// animal.meow(); // does not compile
// Choose the correct replacement`,
    options: [
      '((Cat) animal).meow();',
      '((Animal) animal).meow();',
      'animal = new Animal(); animal.meow();',
      'Animal.meow(animal);',
    ],
    answer: 0,
    explanation: 'The Animal reference exposes only Animal members. A downcast to Cat is valid here because the actual object originally came from new Cat(), allowing ((Cat) animal).meow().',
  },
  {
    id: 'lecture10-c3',
    title: 'Predict runtime polymorphism',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'What sequence is printed by the loop over this mixed Animal array?',
    code: `class Animal { void display() { System.out.println("Animal"); } }
class Dog extends Animal {
  @Override void display() { System.out.println("Dog"); }
}
class Cat extends Animal {
  @Override void display() { System.out.println("Cat"); }
}

Animal[] animals = { new Dog(), new Cat(), new Animal() };
for (Animal animal : animals) animal.display();`,
    options: [
      'Animal, Animal, Animal',
      'Dog, Cat, Animal',
      'Dog, Dog, Dog',
      'The loop fails because the array type is Animal[].',
    ],
    answer: 1,
    explanation: 'The solution prints Dog, Cat, Animal. Overridden methods use the runtime object type, so one Animal reference array can dispatch to different implementations.',
  },
  {
    id: 'lecture10-c4',
    title: 'Confirm a safe downcast',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'Why is this explicit cast guaranteed to succeed?',
    code: `class Animal {}
class Cat extends Animal {
  void meow() { System.out.println("Meow!"); }
}

Animal animal = new Cat();
Cat cat = (Cat) animal;
cat.meow();`,
    options: [
      'Every Animal can always be cast to Cat.',
      'The reference is Animal, so the cast is never checked.',
      'The runtime object is actually a Cat, only viewed through Animal.',
      'Downcasting never fails for reference types.',
    ],
    answer: 2,
    explanation: 'The cast is safe because the object created by new Cat() really is a Cat. The reference type is broader, but the runtime type matches the target subtype.',
  },
  {
    id: 'lecture10-c5',
    title: 'Catch an invalid downcast',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'What happens when this code tries to cast a Cat object to Dog?',
    code: `Animal animal = new Cat();
try {
  Dog dog = (Dog) animal;
  dog.bark();
} catch (ClassCastException e) {
  System.out.println("Friendly error");
}`,
    options: [
      'The cast succeeds because Dog and Cat both extend Animal.',
      'The code fails at compile time before try can run.',
      'ClassCastException is thrown and the catch prints Friendly error.',
      'The object silently changes from Cat to Dog.',
    ],
    answer: 2,
    explanation: 'The explicit cast is allowed by the compiler because the types are related, but the runtime object is a Cat, not a Dog. Java throws ClassCastException and the catch handles it.',
  },
  {
    id: 'lecture10-c6',
    title: 'Separate compile time from runtime',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'Which statement correctly distinguishes the two invalid assignments?',
    code: `// Snippet A
Dog dogA = new Animal();

// Snippet B
Animal animalB = new Animal();
Dog dogB = (Dog) animalB;`,
    options: [
      'Both fail at compile time.',
      'A fails at compile time; B compiles but throws ClassCastException at runtime.',
      'A compiles but fails at runtime; B fails at compile time.',
      'Both compile and create a Dog.',
    ],
    answer: 1,
    explanation: 'Snippet A has no valid implicit conversion from a superclass object to a Dog reference. Snippet B uses an explicit cast, so it compiles, then fails because the actual object is only an Animal.',
  },
  {
    id: 'lecture10-c7',
    title: 'Use old-style instanceof safely',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'Which implementation safely calls the subtype method for either a Dog or Cat?',
    code: `static void describe(Animal animal) {
  // Dog should bark, Cat should meow,
  // any other Animal should be described as unknown.
}`,
    options: [
      'if (animal instanceof Dog) ((Dog) animal).bark(); else if (animal instanceof Cat) ((Cat) animal).meow(); else System.out.println("Unknown");',
      'if (animal instanceof Dog) ((Cat) animal).meow(); else animal.bark();',
      'if (animal == Dog) animal.bark(); else animal.meow();',
      'Dog dog = (Dog) animal; dog.bark();',
    ],
    answer: 0,
    explanation: 'The old-style solution checks each runtime type before casting: instanceof first, then an explicit cast inside the guarded branch. That prevents an unsafe cast for unknown animals.',
  },
  {
    id: 'lecture10-c8',
    title: 'Refactor with a pattern variable',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'Which modern rewrite removes the separate cast while keeping the same safe behavior?',
    code: `static void describe(Animal animal) {
  // Replace the old instanceof + cast sequence
}`,
    options: [
      'if (animal instanceof Dog d) d.bark(); else if (animal instanceof Cat c) c.meow();',
      'if (animal instanceof Dog) animal.bark();',
      'if (animal instanceof Dog d) ((Cat) animal).meow();',
      'if (animal == Dog d) d.bark();',
    ],
    answer: 0,
    explanation: 'Pattern matching binds the checked object as d or c inside the true branch. It combines the type check and cast into one readable expression.',
  },
  {
    id: 'lecture10-c9',
    title: 'Follow pattern scope through &&',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'What does checkSenior print for new Dog(7), new Dog(2), and new Animal()?',
    code: `static void checkSenior(Animal animal) {
  if (animal instanceof Dog d && d.getAge() > 5) {
    System.out.println("Senior dog");
  } else {
    System.out.println("Not a senior dog");
  }
}`,
    options: [
      'Senior dog, Not a senior dog, Not a senior dog',
      'Senior dog, Senior dog, then a ClassCastException',
      'The pattern variable d is never in scope after &&.',
      'All three print Senior dog.',
    ],
    answer: 0,
    explanation: 'The first check confirms the runtime type before d.getAge() runs. A seven-year-old Dog is senior; a two-year-old Dog is not; an Animal short-circuits safely before accessing getAge().',
  },
  {
    id: 'lecture10-c10',
    title: 'Understand negated pattern scope',
    topic: 'Lecture 10 · Typecasting',
    prompt: 'Why can d.bark() be used after this early-return check?',
    code: `static void examineAnimal(Animal animal) {
  if (!(animal instanceof Dog d)) {
    return;
  }
  d.bark();
}`,
    options: [
      'The compiler assumes every Animal is a Dog.',
      'If execution reaches d.bark(), the negated condition was false, so the instanceof check succeeded.',
      'Pattern variables are always global variables.',
      'The return statement converts Animal into Dog.',
    ],
    answer: 1,
    explanation: 'The early return removes the non-Dog path. Reaching the next line proves the pattern matched, so d is in scope and safely typed there.',
  },
];

const lecture11Scenarios: Scenario[] = [
  {
    id: 'lecture11-c1',
    title: 'Treat an interface as a contract',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'Why does new Payable() fail, and what does the declaration promise?',
    code: `interface Payable {
  long amountOwedThisMonth();
}

Payable payable = new Payable();`,
    options: [
      'It fails because interfaces cannot be constructed; it only declares a contract.',
      'It fails because interface methods cannot return long.',
      'It succeeds and creates an object with a default amount of zero.',
      'It fails because every interface must extend Object explicitly.',
    ],
    answer: 0,
    explanation: 'An interface is a contract, not a concrete class. The method declaration promises that implementers provide amountOwedThisMonth(), but there is no implementation to construct.',
  },
  {
    id: 'lecture11-c2',
    title: 'Implement the promised behavior',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'Which implementation correctly satisfies Payable for an employee?',
    code: `interface Payable {
  long amountOwedThisMonth();
}

class Employee implements Payable {
  String name;
  long monthlySalary;
  // Choose the required method body
}`,
    options: [
      'public long amountOwedThisMonth() { return monthlySalary; }',
      'private void amountOwedThisMonth() { return monthlySalary; }',
      'public int amountOwedThisMonth(String name) { return monthlySalary; }',
      'public long amountOwedThisMonth() { name = monthlySalary; }',
    ],
    answer: 0,
    explanation: 'Employee must implement the exact public method signature from Payable and return its monthlySalary. An interface method is public, so the implementation cannot reduce visibility.',
  },
  {
    id: 'lecture11-c3',
    title: 'Share a capability without a family tree',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'Why can Employee, Contractor, and Vendor all be placed in a Payable[]?',
    code: `class Employee implements Payable { /* salary */ }
class Contractor implements Payable { /* rate × milestones */ }
class Vendor implements Payable { /* invoice */ }

Payable[] payees = {
  new Employee(...),
  new Contractor(...),
  new Vendor(...)
};`,
    options: [
      'They must all extend the same concrete superclass.',
      'Payable creates a shared capability type even though the classes are otherwise unrelated.',
      'Java arrays automatically convert every object to Payable.',
      'Only Vendor can implement Payable because it represents money.',
    ],
    answer: 1,
    explanation: 'Interfaces model a CAN-DO capability. The three classes can have unrelated state and logic, yet each is a Payable because it supplies amountOwedThisMonth().',
  },
  {
    id: 'lecture11-c4',
    title: 'Run payroll polymorphically',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'What total does this interface-based payroll loop calculate?',
    code: `Payable[] toPay = {
  new Employee(50000),
  new Contractor(1000, 5),
  new Vendor(20000)
};

long total = 0;
for (Payable p : toPay) {
  total += p.amountOwedThisMonth();
}`,
    options: [
      '50,000, because only Employee is an Employee.',
      '55,000, because Vendor is not part of the payroll family.',
      '75,000, because each object supplies its own implementation.',
      'A compile error, because arrays cannot hold interface references.',
    ],
    answer: 2,
    explanation: 'The total is 50,000 + (1,000 × 5) + 20,000 = 75,000. The loop depends only on the Payable contract and dynamically dispatches each implementation.',
  },
  {
    id: 'lecture11-c5',
    title: 'Give one class several contracts',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'What must Contractor provide when it implements Payable, Taxable, and Auditable?',
    code: `interface Payable { long amountOwedThisMonth(); }
interface Taxable { long taxWithheld(); }
interface Auditable { String auditTrail(); }

class Contractor implements Payable, Taxable, Auditable {
  // What is required?
}`,
    options: [
      'Only amountOwedThisMonth(); the other interfaces are documentation.',
      'Implement all three required methods with compatible public signatures.',
      'Extend three abstract classes instead.',
      'Implement only the methods that are called from main.',
    ],
    answer: 1,
    explanation: 'A class can implement multiple interfaces, so Contractor must provide all three contracts: amountOwedThisMonth(), taxWithheld(), and auditTrail().',
  },
  {
    id: 'lecture11-c6',
    title: 'Choose the view of one object',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'Which statement about these three references is true?',
    code: `Contractor contractor = new Contractor(1000, 5);
Payable payable = contractor;
Taxable taxable = contractor;
Auditable auditable = contractor;

payable.amountOwedThisMonth();
taxable.taxWithheld();
auditable.auditTrail();`,
    options: [
      'Each reference exposes the methods promised by its own interface.',
      'All three references expose every Contractor method automatically.',
      'Only the first assignment is legal because one object has one type.',
      'The object is copied three times, once for each interface.',
    ],
    answer: 0,
    explanation: 'The object is still one Contractor, but the declared reference type controls what the compiler allows you to call. Each interface reference exposes only its own contract.',
  },
  {
    id: 'lecture11-c7',
    title: 'Program to the interface',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'Why can one printReceipt method accept both Employee and Vendor without overloads?',
    code: `static void printReceipt(Payable p) {
  System.out.println("Amount owed: " + p.amountOwedThisMonth());
}

printReceipt(new Employee(50000));
printReceipt(new Vendor(20000));`,
    options: [
      'Payable is a parameter type shared by every implementer.',
      'Java chooses a different method because printReceipt is overloaded automatically.',
      'Vendor is converted into Employee before the call.',
      'The method can call any private field on either class.',
    ],
    answer: 0,
    explanation: 'The parameter asks only for the Payable contract. Any object that implements Payable can be passed unchanged, keeping the receipt code independent of concrete classes.',
  },
  {
    id: 'lecture11-c8',
    title: 'Decide between extends and implements',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'Which design correctly models a savable Circle and an unrelated UserProfile?',
    code: `abstract class Shape {
  abstract double area();
}
interface Savable {
  void saveToFile(String filename);
}

class Circle extends Shape implements Savable { /* area + save */ }
class UserProfile implements Savable { /* save */ }`,
    options: [
      'Both classes implement Savable because saving is a capability, not shared identity.',
      'UserProfile must extend Shape because Circle does.',
      'Circle must extend Savable because interfaces use extends for classes.',
      'Savable should be a field inside both classes, not a type.',
    ],
    answer: 0,
    explanation: 'Circle extends Shape for shared shape identity and implements Savable for a capability. UserProfile can independently implement the same capability without pretending to be a Shape.',
  },
  {
    id: 'lecture11-c9',
    title: 'Resolve conflicting defaults',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'What must Duck do when both interfaces provide a default move()?',
    code: `interface Flyable {
  default void move() { System.out.println("Flying"); }
}
interface Swimmable {
  default void move() { System.out.println("Swimming"); }
}

class Duck implements Flyable, Swimmable {
  // Choose the required fix
}`,
    options: [
      'Nothing; Java silently chooses the first interface.',
      'Override move() and resolve the conflict, optionally using Flyable.super.move().',
      'Change Duck to extend both interfaces.',
      'Delete one interface from the project.',
    ],
    answer: 1,
    explanation: 'Java refuses to inherit two unrelated defaults with the same signature. Duck must override move() and explicitly choose or combine Flyable.super.move() and Swimmable.super.move().',
  },
  {
    id: 'lecture11-c10',
    title: 'Apply the interface boundary',
    topic: 'Lecture 11 · Interfaces',
    prompt: 'Why is Employee an abstract class while Payable is an interface, and why should Contractor not extend Employee just to reuse pay logic?',
    code: `interface Payable {
  long amountOwedThisMonth();
}

abstract class Employee {
  String name;
  Employee(String name) { this.name = name; }
  abstract long calculatePay();
}

class Contractor /* should use which relationship? */`,
    options: [
      'Contractor should extend Employee because all paid objects are employees.',
      'Employee models shared employee identity/state; Payable models a capability that Contractor can implement.',
      'Both should be interfaces because classes cannot have constructors.',
      'Payable should extend Employee so every payee inherits name.',
    ],
    answer: 1,
    explanation: 'Employee is abstract because employees share identity, state, and possibly partial implementation. Payable is an interface because Employee, Contractor, and Vendor can share the ability to be paid without sharing an identity. Forcing Contractor to extend Employee would be an incorrect IS-A relationship.',
  },
];

const lecture12Part1Scenarios: Scenario[] = [
  {
    id: 'lecture12p1-c1',
    title: 'Evolve an interface safely',
    topic: 'Lecture 12 · Part 1',
    prompt: 'Why can Employee keep compiling after Payable receives the new default method?',
    code: `interface Payable {
  long amountOwedThisMonth();

  default String receiptLine() {
    return "Owed: " + amountOwedThisMonth();
  }
}

class Employee implements Payable {
  public long amountOwedThisMonth() { return 50000; }
}`,
    options: [
      'Default methods supply a body, so existing implementers inherit receiptLine().',
      'Java silently removes the new method from the interface.',
      'Employee becomes abstract automatically.',
      'Every interface method is optional once a default exists.',
    ],
    answer: 0,
    explanation: 'A default method lets an interface evolve without forcing every existing implementation to change. Employee inherits receiptLine() and uses its own amountOwedThisMonth() implementation.',
  },
  {
    id: 'lecture12p1-c2',
    title: 'Override a default intentionally',
    topic: 'Lecture 12 · Part 1',
    prompt: 'Which implementation gives Contractor its detailed receipt instead of the generic default?',
    code: `interface Payable {
  long amountOwedThisMonth();
  default String receiptLine() {
    return "Owed: " + amountOwedThisMonth();
  }
}

class Contractor implements Payable {
  long rate = 1000;
  int milestones = 5;
  // Choose the correct override
}`,
    options: [
      'public String receiptLine() { return "Contractor: " + (rate * milestones); }',
      'private String receiptLine() { return "Contractor"; }',
      'public void receiptLine(String detail) { }',
      'static String receiptLine() { return "Contractor"; }',
    ],
    answer: 0,
    explanation: 'Contractor overrides the inherited default with the same public, no-argument String-returning signature. The custom method can include milestones and the calculated amount.',
  },
  {
    id: 'lecture12p1-c3',
    title: 'Spot a default-method conflict',
    topic: 'Lecture 12 · Part 1',
    prompt: 'What happens if Contractor implements both interfaces without overriding note()?',
    code: `interface Payable {
  default String note() { return "Payable note"; }
}
interface Refundable {
  default String note() { return "Refundable note"; }
}

class Contractor implements Payable, Refundable {
  // no note() override
}`,
    options: [
      'The compiler rejects it because the inherited defaults are unrelated.',
      'Payable.note() always wins because it is listed first.',
      'Refundable.note() wins because it is listed second.',
      'The class compiles and note() returns both strings automatically.',
    ],
    answer: 0,
    explanation: 'Java cannot choose between two unrelated default implementations with the same signature. Contractor must override note() and resolve the conflict explicitly.',
  },
  {
    id: 'lecture12p1-c4',
    title: 'Choose one parent default',
    topic: 'Lecture 12 · Part 1',
    prompt: 'Which body explicitly resolves the Payable/Refundable note conflict by choosing Payable?',
    code: `class Contractor implements Payable, Refundable {
  @Override
  public String note() {
    // choose one interface default
  }
}`,
    options: [
      'return Payable.super.note();',
      'return super.note();',
      'return Payable.note();',
      'return new Payable().note();',
    ],
    answer: 0,
    explanation: 'InterfaceName.super.method() explicitly delegates to a default method inherited from that interface. Payable.super.note() selects the Payable version.',
  },
  {
    id: 'lecture12p1-c5',
    title: 'Combine two defaults',
    topic: 'Lecture 12 · Part 1',
    prompt: 'How can Contractor keep both parent messages in one resolved note?',
    code: `class Contractor implements Payable, Refundable {
  @Override
  public String note() {
    // combine both defaults
  }
}`,
    options: [
      'return Payable.super.note() + " | " + Refundable.super.note();',
      'return super.Payable.note() + super.Refundable.note();',
      'return Payable.note() & Refundable.note();',
      'Do not override; Java combines defaults automatically.',
    ],
    answer: 0,
    explanation: 'The class must still override note(), but it can call each interface default explicitly with Payable.super.note() and Refundable.super.note(), then combine the results.',
  },
  {
    id: 'lecture12p1-c6',
    title: 'Call an interface static utility',
    topic: 'Lecture 12 · Part 1',
    prompt: 'How should mphToKmh be called when it is declared static on Flyable?',
    code: `interface Flyable {
  static int mphToKmh(int mph) {
    return (int) (mph * 1.609);
  }
}

// Convert 60 mph`,
    options: [
      'Flyable.mphToKmh(60)',
      'new Flyable().mphToKmh(60)',
      'Plane.mphToKmh(60) through any implementer',
      'flyable.super.mphToKmh(60)',
    ],
    answer: 0,
    explanation: 'Interface static methods belong to the interface itself. Call them with Flyable.mphToKmh(60); they are not inherited by implementing classes or instances.',
  },
  {
    id: 'lecture12p1-c7',
    title: 'Hide a private interface helper',
    topic: 'Lecture 12 · Part 1',
    prompt: 'Why can takeOff call prepareEngine(), but Plane cannot call it directly?',
    code: `interface Flyable {
  default void takeOff() {
    prepareEngine();
    System.out.println("Taking off!");
  }

  private void prepareEngine() {
    System.out.println("Checking engine");
  }
}

class Plane implements Flyable { }
Plane plane = new Plane();
plane.takeOff();`,
    options: [
      'Private interface methods are helpers accessible only inside the interface.',
      'Plane inherits every private method as public.',
      'prepareEngine is static and must be called on Plane.',
      'The code cannot compile because defaults cannot call private methods.',
    ],
    answer: 0,
    explanation: 'Java permits private interface methods as reusable implementation helpers for default methods. They are not part of the public contract, so external code cannot call plane.prepareEngine().',
  },
  {
    id: 'lecture12p1-c8',
    title: 'Use an interface constant',
    topic: 'Lecture 12 · Part 1',
    prompt: 'What does meetsMinimum return for invoices of 5,000 and 15,000?',
    code: `interface Payable {
  long MIN_PAYOUT_PAISA = 10000;
  long amountOwedThisMonth();
}

static boolean meetsMinimum(Payable p) {
  return p.amountOwedThisMonth() >= Payable.MIN_PAYOUT_PAISA;
}`,
    options: [
      'false, then true',
      'true, then false',
      'true for both because interface constants are ignored',
      'The comparison cannot use an interface constant',
    ],
    answer: 0,
    explanation: 'Interface fields are public static final constants. The 5,000 amount is below Payable.MIN_PAYOUT_PAISA, while 15,000 meets the minimum.',
  },
  {
    id: 'lecture12p1-c9',
    title: 'Recognize a functional interface',
    topic: 'Lecture 12 · Part 1',
    prompt: 'Why can these three rules be written as lambdas?',
    code: `@FunctionalInterface
interface PayRule {
  long compute(long basePaisa);
}

PayRule bonus = base -> base + (base / 10);
PayRule deduction = base -> base - 500;
PayRule doubler = base -> base * 2;`,
    options: [
      'PayRule has exactly one abstract method, so each lambda supplies compute().',
      'Every interface automatically supports lambdas.',
      'The @FunctionalInterface annotation creates the method body.',
      'Lambdas can implement only interfaces with default methods.',
    ],
    answer: 0,
    explanation: 'A functional interface has one abstract method. Each lambda is a compact implementation of compute(long), while any default or static methods would not count toward that single abstract method.',
  },
  {
    id: 'lecture12p1-c10',
    title: 'Compose contracts and swap sinks',
    topic: 'Lecture 12 · Part 1',
    prompt: 'What makes Settlement and settle() flexible in these two designs?',
    code: `interface Settlement extends Payable, Auditable {
  String settlementReference();
}

interface LedgerSink {
  void write(String line);
}

static void settle(Payable[] payees, LedgerSink sink) {
  for (Payable p : payees) sink.write(p.receiptLine());
}`,
    options: [
      'Settlement inherits all parent contracts, and settle() can use ConsoleSink or ListSink without changing its code.',
      'Settlement can extend only one interface, and settle() must know every sink class.',
      'LedgerSink must be an abstract class for swapping to work.',
      'The method must downcast every Payable to a concrete Employee.',
    ],
    answer: 0,
    explanation: 'Settlement combines Payable, Auditable, and its own method, so implementers provide all three contracts. settle() depends only on LedgerSink, allowing console and list implementations to be swapped without changing the engine.',
  },
];

const lecture12Part2Scenarios: Scenario[] = [
  {
    id: 'lecture12p2-c1',
    title: 'Initialize with a static block',
    topic: 'Lecture 12 · Part 2',
    prompt: 'What is printed when Config.sumOfFirstTen is read without calling a calculation method?',
    code: `class Config {
  static int sumOfFirstTen;

  static {
    int sum = 0;
    for (int i = 1; i <= 10; i++) sum += i;
    sumOfFirstTen = sum;
  }
}

System.out.println(Config.sumOfFirstTen);`,
    options: [
      '55, because the static block runs when Config is first initialized.',
      '0, because static blocks cannot assign static fields.',
      '10, because only the loop endpoint is stored.',
      'A compile error, because main must call the static block.',
    ],
    answer: 0,
    explanation: 'The static block executes once when the class is initialized, before the static field is read. The sum from 1 through 10 is 55, so no trigger method is needed.',
  },
  {
    id: 'lecture12p2-c2',
    title: 'Understand one-time class initialization',
    topic: 'Lecture 12 · Part 2',
    prompt: 'What is the output order when two Test objects are constructed?',
    code: `class Test {
  static { System.out.println("Static block"); }
  Test() { System.out.println("Constructor"); }
}

new Test();
new Test();`,
    options: [
      'Static block, Constructor, Constructor',
      'Static block, Static block, Constructor, Constructor',
      'Constructor, Static block, Constructor',
      'Constructor, Constructor, Static block',
    ],
    answer: 0,
    explanation: 'Class initialization happens once before the first object construction, so the static block prints once. The constructor runs for every new Test object and prints twice.',
  },
  {
    id: 'lecture12p2-c3',
    title: 'Use a static nested class',
    topic: 'Lecture 12 · Part 2',
    prompt: 'Why is this construction valid without creating a Car object?',
    code: `class Car {
  static class Engine {
    int horsepower;
  }
}

Car.Engine e = new Car.Engine();
e.horsepower = 450;`,
    options: [
      'A static nested class belongs to Car itself, so no enclosing Car instance is required.',
      'Every nested class automatically creates its outer object.',
      'Engine is actually an interface and can be constructed through Car.',
      'The code is invalid because nested classes must be non-static.',
    ],
    answer: 0,
    explanation: 'A static nested class is associated with the enclosing class, not with an enclosing instance. Car.Engine can therefore be instantiated directly as new Car.Engine().',
  },
  {
    id: 'lecture12p2-c4',
    title: 'Build an immutable value class',
    topic: 'Lecture 12 · Part 2',
    prompt: 'Which combination best protects Point after construction?',
    code: `final class Point {
  private final int x;
  private final int y;

  Point(int x, int y) {
    this.x = x;
    this.y = y;
  }
  int getX() { return x; }
  int getY() { return y; }
}`,
    options: [
      'final class, private final fields, constructor assignment, and getters only',
      'public fields and setters so callers can inspect the state',
      'A non-final class with mutable fields and one getter',
      'Static fields shared by every Point instance',
    ],
    answer: 0,
    explanation: 'final prevents subclassing, private final fields prevent reassignment after construction, and getters expose values without mutation methods. The constructor is the only state-setting point.',
  },
  {
    id: 'lecture12p2-c5',
    title: 'Find the mutable field trap',
    topic: 'Lecture 12 · Part 2',
    prompt: 'Why can this supposedly immutable Team change after construction?',
    code: `final class Team {
  private final List<String> players;
  Team(List<String> players) { this.players = players; }
  List<String> getPlayers() { return players; }
}

team.getPlayers().add("Mallory");`,
    options: [
      'The final reference still points to a mutable List that callers can modify.',
      'final fields are always copied automatically by Java.',
      'The getter returns a new immutable list every time.',
      'The add call changes only a local variable, never Team.',
    ],
    answer: 0,
    explanation: 'final prevents the players reference from pointing to a different list, but it does not make the List object immutable. The constructor and getter both expose the live mutable list.',
  },
  {
    id: 'lecture12p2-c6',
    title: 'Defend an immutable collection',
    topic: 'Lecture 12 · Part 2',
    prompt: 'What does List.copyOf(players) protect in Team6?',
    code: `final class Team6 {
  private final List<String> players;
  Team6(List<String> players) {
    this.players = List.copyOf(players);
  }
  List<String> getPlayers() { return players; }
}

List<String> original = new ArrayList<>();
Team6 team = new Team6(original);
original.add("Eve");`,
    options: [
      'Team6 keeps an immutable snapshot; later changes to original do not change the team.',
      'Team6 keeps the same mutable list, so both references change together.',
      'List.copyOf only copies the first element.',
      'The constructor throws whenever original is later modified.',
    ],
    answer: 0,
    explanation: 'List.copyOf creates an unmodifiable snapshot. It protects against both mutations through the original list and direct add calls through getPlayers(), which throw UnsupportedOperationException.',
  },
  {
    id: 'lecture12p2-c7',
    title: 'Switch over an enum',
    topic: 'Lecture 12 · Part 2',
    prompt: 'What does isWeekday return for MONDAY, SATURDAY, and FRIDAY?',
    code: `enum Day {
  MONDAY, TUESDAY, WEDNESDAY, THURSDAY,
  FRIDAY, SATURDAY, SUNDAY
}

static boolean isWeekday(Day d) {
  return switch (d) {
    case SATURDAY, SUNDAY -> false;
    default -> true;
  };
}`,
    options: [
      'true, false, true',
      'false, true, false',
      'true, true, false',
      'The switch expression cannot return boolean.',
    ],
    answer: 0,
    explanation: 'The switch expression returns false only for SATURDAY and SUNDAY. Monday and Friday use the default branch and return true.',
  },
  {
    id: 'lecture12p2-c8',
    title: 'Give enum constants data',
    topic: 'Lecture 12 · Part 2',
    prompt: 'How does Day know whether each constant is a weekend?',
    code: `enum Day {
  MONDAY(false), SATURDAY(true), SUNDAY(true);

  private final boolean weekend;
  Day(boolean weekend) { this.weekend = weekend; }
  boolean isWeekend() { return weekend; }
}

for (Day d : Day.values()) {
  System.out.println(d.ordinal() + ": " + d.name() + " -> " + d.isWeekend());
}`,
    options: [
      'Each constant passes data to the enum constructor and stores it in a final field.',
      'ordinal() calculates the weekend value automatically.',
      'name() changes the stored boolean at runtime.',
      'Enum constants cannot have constructors or fields.',
    ],
    answer: 0,
    explanation: 'Enum constants can pass arguments to a constructor. Day stores the boolean in a private final field, while values(), name(), and ordinal() provide iteration and metadata.',
  },
  {
    id: 'lecture12p2-c9',
    title: 'Replace a value class with a record',
    topic: 'Lecture 12 · Part 2',
    prompt: 'What does a record provide automatically for two Points with equal coordinates?',
    code: `record Point(int x, int y) {}

Point p1 = new Point(3, 4);
Point p2 = new Point(3, 4);

p1.x();
p1.y();
p1.toString();
p1.equals(p2);`,
    options: [
      'Accessors, readable toString(), and value-based equals() that returns true.',
      'Only public mutable fields; equals() compares object identity.',
      'getX()/getY() methods but no toString() or equals().',
      'A record must be manually extended before these methods work.',
    ],
    answer: 0,
    explanation: 'Records generate accessors named x() and y(), a readable toString(), and equals/hashCode based on component values. Therefore p1.equals(p2) is true.',
  },
  {
    id: 'lecture12p2-c10',
    title: 'Protect a record from mutable contents',
    topic: 'Lecture 12 · Part 2',
    prompt: 'How does the compact constructor fix the mutable List inside a record?',
    code: `record Team(List<String> players) {
  Team {
    players = List.copyOf(players);
  }
}

List<String> original = new ArrayList<>();
Team team = new Team(original);
team.players().add("Eve");`,
    options: [
      'It replaces the incoming list with an unmodifiable defensive copy, so add throws.',
      'Records make every object reachable from a component immutable automatically.',
      'The compact constructor changes players from a List into an array.',
      'It allows add but silently discards the new player.',
    ],
    answer: 0,
    explanation: 'Record components are final references, not automatically immutable objects. Reassigning players to List.copyOf(players) inside the compact constructor prevents outside list mutations and rejects add operations.',
  },
];

const navItems = [
  { href: '/', label: 'Cockpit', icon: LayoutDashboard },
  { href: '/learn', label: 'Learn', icon: Library },
  { href: '/practice', label: 'Practice', icon: ClipboardCheck },
  { href: '/lab', label: 'Coding lab', icon: Code2 },
  { href: '/focus', label: 'Focus timer', icon: Clock3 },
  { href: '/notes', label: 'Notes', icon: FileText },
];

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage can be unavailable */ }
  }, [key, value]);
  return [value, setValue] as const;
}

function getExamTarget() {
  const now = new Date();
  const target = new Date(now.getFullYear(), 8, 10, 14, 30, 0);
  if (now > target) target.setFullYear(target.getFullYear() + 1);
  return target;
}

function useCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const diff = Math.max(0, getExamTarget().getTime() - now.getTime());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function Shell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const countdown = useCountdown();
  const currentLabel = navItems.find((item) => item.href === location)?.label ?? 'Cockpit';
  return (
    <div className="noise min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-3">
          <div className="grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"><GraduationCap size={21} strokeWidth={2.5} /></div>
          <div>
            <div className="display text-[16px] font-bold tracking-tight">Sprintroom</div>
            <div className="mono text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/55">Java OOP · last mile</div>
          </div>
        </div>
        <div className="mt-8 px-3">
          <div className="mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/45">Navigation</div>
        </div>
        <nav className="mt-3 space-y-1" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} /><span>{item.label}</span>{active && <ChevronRight className="ml-auto" size={15} />}
            </Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4">
          <div className="flex items-center gap-2 text-sidebar-foreground/70"><Target size={15} /><span className="mono text-[10px] uppercase tracking-[0.13em]">Exam window</span></div>
          <div className="mt-3 display text-[25px] font-bold tracking-tight">{countdown.days}d {String(countdown.hours).padStart(2, '0')}h</div>
          <p className="mt-1 text-[12px] leading-5 text-sidebar-foreground/55">Sep 10 · 14:30<br />You are still early enough.</p>
          <Link href="/focus" data-testid="link-sidebar-focus" className="mt-4 flex items-center justify-between rounded-lg bg-sidebar-primary px-3 py-2 text-[12px] font-bold text-sidebar-primary-foreground transition-transform hover:-translate-y-0.5">Start a focus block <ArrowRight size={14} /></Link>
        </div>
      </aside>
      {mobileOpen && <button aria-label="Close menu" data-testid="button-close-menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-foreground/25 lg:hidden" />}
      <main className="min-h-[100dvh] lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button className="grid size-9 place-items-center rounded-lg border border-border bg-card lg:hidden" aria-label="Open menu" data-testid="button-open-menu" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
            <div className="lg:hidden display text-[17px] font-bold">{currentLabel}</div>
            <div className="hidden items-center gap-2 text-[12px] text-muted-foreground lg:flex"><span className="mono uppercase tracking-[0.13em]">Sprintroom</span><ChevronRight size={13} /><span>{currentLabel}</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex"><span className="size-2 rounded-full bg-accent animate-[tick_2s_ease-in-out_infinite]" /><span className="mono text-[11px] text-muted-foreground">{countdown.days}d {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m to exam</span></div>
            <button data-testid="button-settings" className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground" aria-label="Settings"><Settings2 size={17} /></button>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{children}</div>
      </main>
      <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-5 rounded-2xl border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur-md lg:hidden">
        {navItems.slice(0, 5).map((item) => { const Icon = item.icon; const active = location === item.href; return <Link key={item.href} href={item.href} data-testid={`mobile-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-semibold ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Icon size={17} /><span>{item.label.split(' ')[0]}</span></Link>; })}
      </nav>
    </div>
  );
}

function SectionIntro({ kicker, title, detail, action }: { kicker: string; title: string; detail: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><div className="mono mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{kicker}</div><h1 className="display max-w-2xl text-[32px] font-bold leading-[1.05] sm:text-[42px]">{title}</h1><p className="mt-3 max-w-xl text-[14px] leading-6 text-muted-foreground">{detail}</p></div>
    {action}
  </div>;
}

function CountdownCard() {
  const countdown = useCountdown();
  const [activeUnit, setActiveUnit] = useState('secs');
  const countdownParts = [
    { value: countdown.days, label: 'days', hint: 'Keep the runway visible.' },
    { value: countdown.hours, label: 'hours', hint: 'Choose the next focused block.' },
    { value: countdown.minutes, label: 'mins', hint: 'Small sessions add up quickly.' },
    { value: countdown.seconds, label: 'secs', hint: 'The clock is moving with you.' },
  ];
  const activePart = countdownParts.find((part) => part.label === activeUnit) ?? countdownParts[3];

  return <section className="group relative overflow-hidden rounded-[24px] bg-primary p-6 text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
    <div className="absolute -right-16 -top-20 size-64 rounded-full border-[22px] border-accent/20 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-105" /><div className="absolute -bottom-24 right-24 size-48 rounded-full border-[14px] border-primary-foreground/5 transition-transform duration-700 group-hover:-translate-y-3" />
    <div className="relative flex min-h-[276px] flex-col items-center text-center">
      <div className="flex items-center justify-center gap-2 text-primary-foreground/65"><Clock3 size={15} /><span className="mono text-[10px] uppercase tracking-[0.18em]">Time until the exam</span></div>
      <div className="mt-6 grid w-full max-w-[720px] grid-cols-2 items-start justify-items-center gap-y-4 sm:flex sm:justify-center sm:gap-5">
        {countdownParts.map(({ value, label, hint }, index) => <Fragment key={label}>
          <button
            type="button"
            onClick={() => setActiveUnit(label)}
            onFocus={() => setActiveUnit(label)}
            aria-label={`${String(value).padStart(2, '0')} ${label}. ${hint}`}
            aria-pressed={activeUnit === label}
            className={`countdown-unit min-w-[106px] rounded-2xl px-3 py-2 transition-all duration-200 ${activeUnit === label ? 'bg-primary-foreground/10 text-primary-foreground shadow-inner' : 'text-primary-foreground/75 hover:bg-primary-foreground/5 hover:text-primary-foreground'}`}
          >
            <span key={`${label}-${value}`} className="countdown-digits display block text-[42px] font-bold leading-none sm:text-[62px]">{String(value).padStart(2, '0')}</span>
            <span className="mono mt-2 block text-[9px] uppercase tracking-[0.16em] text-primary-foreground/55">{label}</span>
          </button>
          {index < countdownParts.length - 1 && <span aria-hidden="true" className="hidden self-center text-2xl text-accent/70 sm:block">:</span>}
        </Fragment>)}
      </div>
      <p aria-live="polite" className="mt-4 min-h-5 text-[12px] text-primary-foreground/60 transition-opacity duration-200">{activePart.hint}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-full bg-accent px-3 py-1.5 mono text-[10px] font-medium uppercase tracking-[0.12em] text-accent-foreground">Sep 10 · 14:30</span>
        <span className="text-[12px] text-primary-foreground/60">One focused block at a time.</span>
        <Link href="/focus" data-testid="link-countdown-focus" className="inline-flex items-center gap-1 rounded-full border border-primary-foreground/20 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground">Open focus timer <ArrowRight size={13} /></Link>
      </div>
    </div>
  </section>;
}

function ProgressRing({ value, onAccent = false }: { value: number; onAccent?: boolean }) {
  const [animatedValue, setAnimatedValue] = useState(value);
  const progress = Math.min(100, Math.max(0, value));
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const trackColor = onAccent ? 'hsl(var(--accent-foreground) / 0.2)' : 'hsl(var(--muted))';
  const progressColor = onAccent ? 'hsl(var(--accent-foreground))' : 'hsl(var(--accent))';

  useEffect(() => {
    const startValue = animatedValue;
    const difference = progress - startValue;
    const duration = 700;
    const startTime = performance.now();
    let frame = 0;

    const animate = (timestamp: number) => {
      const elapsed = Math.min(1, (timestamp - startTime) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setAnimatedValue(Math.round(startValue + difference * eased));
      if (elapsed < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [progress]);

  return <div role="progressbar" aria-label={`Study progress: ${progress}%`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="relative grid size-[122px] place-items-center rounded-full">
    <svg aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
      <circle cx="61" cy="61" r={radius} fill="none" stroke={trackColor} strokeWidth="12" />
      <circle cx="61" cy="61" r={radius} fill="none" stroke={progressColor} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (animatedValue / 100) * circumference} style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)' }} />
    </svg>
    <div className={`relative grid size-[94px] place-items-center rounded-full ${onAccent ? 'bg-accent-foreground/10' : 'bg-card'}`}><div className="text-center"><div className="display text-[27px] font-bold">{animatedValue}%</div><div className={`mono text-[9px] uppercase tracking-[0.12em] ${onAccent ? 'text-accent-foreground/60' : 'text-muted-foreground'}`}>ready</div></div></div>
  </div>;
}

function Dashboard() {
  const [completed, setCompleted] = usePersisted<string[]>('java-sprint-tasks', ['s1', 's2']);
  const [completedLecture09, setCompletedLecture09] = usePersisted<string[]>('java-sprint-lecture09-sections', []);
  const [completedLecture10, setCompletedLecture10] = usePersisted<string[]>('java-sprint-lecture10-sections', []);
  const [completedLecture11, setCompletedLecture11] = usePersisted<string[]>('java-sprint-lecture11-sections', []);
  const [completedLecture12Part1, setCompletedLecture12Part1] = usePersisted<string[]>('java-sprint-lecture12-part1-sections', []);
  const [completedLecture12Part2, setCompletedLecture12Part2] = usePersisted<string[]>('java-sprint-lecture12-part2-sections', []);
  const [completedLecture13, setCompletedLecture13] = usePersisted<string[]>('java-sprint-lecture13-sections', []);
  const [completedLecture14, setCompletedLecture14] = usePersisted<string[]>('java-sprint-lecture14-sections', []);
  const [completedLecture15, setCompletedLecture15] = usePersisted<string[]>('java-sprint-lecture15-sections', []);
  const [expandedLecture, setExpandedLecture] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const lecture09Ready = lecture09Sections.every((section) => completedLecture09.includes(section.id));
  const lecture10Ready = lecture10Sections.every((section) => completedLecture10.includes(section.id));
  const lecture11Ready = lecture11Sections.every((section) => completedLecture11.includes(section.id));
  const lecture12Part1Ready = lecture12Part1Sections.every((section) => completedLecture12Part1.includes(section.id));
  const lecture12Part2Ready = lecture12Part2Sections.every((section) => completedLecture12Part2.includes(section.id));
  const lecture13Ready = lecture13Sections.every((section) => completedLecture13.includes(section.id));
  const lecture14Ready = lecture14Sections.every((section) => completedLecture14.includes(section.id));
  const lecture15Ready = lecture15Sections.every((section) => completedLecture15.includes(section.id));
  const isTaskComplete = (task: ScheduleTask) => task.id === 's1'
    ? completed.includes(task.id) && lecture09Ready
    : task.id === 's2'
      ? completed.includes(task.id) && lecture10Ready
      : task.id === 's3'
        ? completed.includes(task.id) && lecture11Ready
        : task.id === 's4a'
          ? completed.includes(task.id) && lecture12Part1Ready
          : task.id === 's4b'
            ? completed.includes(task.id) && lecture12Part2Ready
            : task.id === 's5'
              ? completed.includes(task.id) && lecture13Ready
              : task.id === 's6'
                ? completed.includes(task.id) && lecture14Ready
                : task.id === 's7'
                  ? completed.includes(task.id) && lecture15Ready
                  : completed.includes(task.id);
  const completedCount = schedule.filter(isTaskComplete).length;
  const sectionProgressPairs = [
    [lecture09Sections, completedLecture09],
    [lecture10Sections, completedLecture10],
    [lecture11Sections, completedLecture11],
    [lecture12Part1Sections, completedLecture12Part1],
    [lecture12Part2Sections, completedLecture12Part2],
    [lecture13Sections, completedLecture13],
    [lecture14Sections, completedLecture14],
    [lecture15Sections, completedLecture15],
  ] as const;
  const completedSectionCount = sectionProgressPairs.reduce((total, [sections, completedSections]) => total + sections.filter((section) => completedSections.includes(section.id)).length, 0);
  const totalSectionCount = sectionProgressPairs.reduce((total, [sections]) => total + sections.length, 0);
  const standaloneBlockCount = schedule.filter((task) => !task.lectureSections).length;
  const completedStandaloneBlockCount = schedule.filter((task) => !task.lectureSections && completed.includes(task.id)).length;
  const progress = Math.round(((completedSectionCount + completedStandaloneBlockCount) / (totalSectionCount + standaloneBlockCount)) * 100);
  const toggleTask = (id: string) => {
    if (
      (id === 's1' && !lecture09Ready) ||
      (id === 's2' && !lecture10Ready) ||
      (id === 's3' && !lecture11Ready) ||
      (id === 's4a' && !lecture12Part1Ready) ||
      (id === 's4b' && !lecture12Part2Ready) ||
      (id === 's5' && !lecture13Ready) ||
      (id === 's6' && !lecture14Ready) ||
      (id === 's7' && !lecture15Ready)
    ) return;
    setCompleted((current) => current.includes(id) ? current.filter((task) => task !== id) : [...current, id]);
  };
  const toggleLecture09Section = (id: string) => setCompletedLecture09((current) => current.includes(id) ? current.filter((section) => section !== id) : [...current, id]);
  const toggleLecture10Section = (id: string) => setCompletedLecture10((current) => current.includes(id) ? current.filter((section) => section !== id) : [...current, id]);
  const toggleLecture11Section = (id: string) => setCompletedLecture11((current) => current.includes(id) ? current.filter((section) => section !== id) : [...current, id]);
  const toggleLecture12Part1Section = (id: string) => setCompletedLecture12Part1((current) => current.includes(id) ? current.filter((section) => section !== id) : [...current, id]);
  const toggleLecture12Part2Section = (id: string) => setCompletedLecture12Part2((current) => current.includes(id) ? current.filter((section) => section !== id) : [...current, id]);
  const toggleLecture13Section = (id: string) => setCompletedLecture13((current) => current.includes(id) ? current.filter((section) => section !== id) : [...current, id]);
  const toggleLecture14Section = (id: string) => setCompletedLecture14((current) => current.includes(id) ? current.filter((section) => section !== id) : [...current, id]);
  const toggleLecture15Section = (id: string) => setCompletedLecture15((current) => current.includes(id) ? current.filter((section) => section !== id) : [...current, id]);
  return <div className="rise">
    <SectionIntro kicker="Tuesday, September 8 · 10:00 start" title="Make the last miles count." detail="Your exam cockpit for OOP. The plan is already here; your job is to keep moving the next small marker." action={<button onClick={() => setLocation('/focus')} data-testid="button-dashboard-start" className="press inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[13px] font-bold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5"><Play size={15} fill="currentColor" /> Start next block</button>} />
    <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
      <CountdownCard />
       <section className="flex flex-col justify-between rounded-[24px] border border-accent/70 bg-accent p-6 text-accent-foreground shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center xl:flex-col xl:items-start">
         <div><div className="flex items-center gap-2 text-accent-foreground/70"><Gauge size={16} /><span className="mono text-[10px] uppercase tracking-[0.16em]">Sprint progress</span></div><h2 className="mt-3 display text-[22px] font-bold">Your runway is visible.</h2><p className="mt-2 max-w-xs text-[13px] leading-5 text-accent-foreground/75">Complete the plan, then use practice to find the fuzzy edges.</p></div>
          <div className="mt-5 flex items-center gap-5 sm:mt-0 xl:mt-5"><ProgressRing value={progress} onAccent /><div><div className="display text-2xl font-bold">{completedCount}<span className="text-accent-foreground/65">/{schedule.length}</span></div><div className="mono text-[10px] uppercase tracking-[0.1em] text-accent-foreground/70">blocks done</div><div className="mt-2 mono text-[9px] uppercase tracking-[0.1em] text-accent-foreground/70">{completedSectionCount}/{totalSectionCount} topic checks</div></div></div>
      </section>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
      <section className="rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-muted-foreground"><CalendarDays size={16} /><span className="mono text-[10px] uppercase tracking-[0.16em]">The three-day runway</span></div><h2 className="mt-2 display text-[23px] font-bold">Your study plan</h2></div><span className="rounded-full bg-secondary px-3 py-1 mono text-[10px] text-secondary-foreground">{completedCount} checked</span></div>
        <div className="mt-5 space-y-2">{schedule.map((task) => {
          const done = isTaskComplete(task);
          const isExpanded = expandedLecture === task.id;
            const isLocked = (task.id === 's1' && !lecture09Ready) || (task.id === 's2' && !lecture10Ready) || (task.id === 's3' && !lecture11Ready) || (task.id === 's4a' && !lecture12Part1Ready) || (task.id === 's4b' && !lecture12Part2Ready) || (task.id === 's5' && !lecture13Ready) || (task.id === 's6' && !lecture14Ready) || (task.id === 's7' && !lecture15Ready);
           const sectionState = task.id === 's1'
             ? { completed: completedLecture09, ready: lecture09Ready, toggle: toggleLecture09Section }
             : task.id === 's2'
               ? { completed: completedLecture10, ready: lecture10Ready, toggle: toggleLecture10Section }
               : task.id === 's3'
                 ? { completed: completedLecture11, ready: lecture11Ready, toggle: toggleLecture11Section }
                  : task.id === 's4a'
                    ? { completed: completedLecture12Part1, ready: lecture12Part1Ready, toggle: toggleLecture12Part1Section }
                    : task.id === 's4b'
                      ? { completed: completedLecture12Part2, ready: lecture12Part2Ready, toggle: toggleLecture12Part2Section }
                      : task.id === 's5'
                        ? { completed: completedLecture13, ready: lecture13Ready, toggle: toggleLecture13Section }
                        : task.id === 's6'
                          ? { completed: completedLecture14, ready: lecture14Ready, toggle: toggleLecture14Section }
                          : task.id === 's7'
                            ? { completed: completedLecture15, ready: lecture15Ready, toggle: toggleLecture15Section }
               : null;
          return <div key={task.id} className={`rounded-xl border transition-all ${done ? 'border-accent/50 bg-accent/10' : 'border-border bg-background/40 hover:border-accent/45'}`}>
             <button onClick={() => toggleTask(task.id)} disabled={isLocked} data-testid={`button-task-${task.id}`} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-full border ${done ? 'border-accent bg-accent text-accent-foreground' : 'border-border text-muted-foreground'}`}>{done ? <Check size={14} strokeWidth={3} /> : <Circle size={13} />}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2"><span className={`text-[13px] font-semibold ${done ? 'text-muted-foreground line-through' : ''}`}>{task.title}</span><span className="rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 mono text-[9px] uppercase tracking-[0.08em] text-accent-foreground">{task.lecture}</span></span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{task.day} · {task.detail}{task.practice ? ` · ${task.practice}` : ''}{sectionState && !sectionState.ready ? ` · ${task.lectureSections!.length - sectionState.completed.length} topics left` : ''}</span>
              </span>
               <span className="hidden shrink-0 rounded-md bg-secondary px-2 py-1 mono text-[9px] text-secondary-foreground sm:inline">{task.time} · {task.duration}</span>
              <ChevronRight className="text-muted-foreground transition-transform group-hover:translate-x-0.5" size={15} />
            </button>
             {task.lectureSections && sectionState && <div className="border-t border-border/70 px-3 pb-3">
               <button type="button" onClick={() => setExpandedLecture(isExpanded ? null : task.id)} aria-expanded={isExpanded} data-testid={`button-expand-${task.id}`} className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground">
                 <span>{isExpanded ? `Hide ${task.lecture} study topics` : `Open ${task.lectureSections.length} ${task.lecture} study topics · ${sectionState.completed.length}/${task.lectureSections.length} complete`}</span>
                <ChevronDown size={15} className={`transition-transform ${isExpanded ? 'rotate-180 text-accent-foreground' : ''}`} />
              </button>
              {isExpanded && <div className="space-y-2 border-t border-border/60 pt-3">
                {task.lectureSections.map((section) => {
                   const sectionDone = sectionState.completed.includes(section.id);
                   return <div key={section.id} className={`rounded-lg border p-3 ${sectionDone ? 'border-accent/45 bg-accent/10' : 'border-border/70 bg-background/35'}`}>
                     <button type="button" onClick={() => sectionState.toggle(section.id)} aria-pressed={sectionDone} data-testid={`button-${task.lecture.toLowerCase().replaceAll(' ', '-')}-section-${section.id}`} className="flex w-full items-start gap-3 text-left">
                      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${sectionDone ? 'border-accent bg-accent text-accent-foreground' : 'border-border text-muted-foreground'}`}>{sectionDone ? <Check size={12} strokeWidth={3} /> : <Circle size={11} />}</span>
                      <span className={`text-[12px] font-semibold leading-5 ${sectionDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{section.title}</span>
                    </button>
                    <ul className="ml-8 mt-2 space-y-1.5">{section.points.map((point) => <li key={point} className="flex gap-2 text-[11px] leading-5 text-muted-foreground"><span className="mt-2 size-1 shrink-0 rounded-full bg-accent/70" /><span>{point}</span></li>)}</ul>
                  </div>;
                })}
                 <div className={`rounded-lg px-3 py-2 text-[11px] font-medium ${sectionState.ready ? 'bg-accent/15 text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                   {sectionState.ready ? `All ${task.lectureSections.length} topics complete. ${task.lecture} can now be marked complete.` : `Complete all ${task.lectureSections.length} topics to unlock ${task.lecture} completion. ${task.lectureSections.length - sectionState.completed.length} remaining.`}
                </div>
              </div>}
            </div>}
          </div>;
        })}</div>
      </section>
      <div className="space-y-5">
        <section className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground"><Zap size={16} /><span className="mono text-[10px] uppercase tracking-[0.16em]">Quick start</span></div><span className="rounded-full bg-[#e66b5d]/15 px-2.5 py-1 mono text-[9px] text-[#b94a40]">25 min</span></div>
          <h2 className="mt-4 display text-[23px] font-bold">Exceptions, first principles</h2><p className="mt-2 text-[13px] leading-5 text-muted-foreground">Map the hierarchy, then predict a try / catch / finally flow.</p>
          <button onClick={() => setLocation('/focus')} data-testid="button-quick-start" className="mt-5 flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3 text-[13px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Open focus room <ArrowRight size={16} /></button>
        </section>
        <section className="rounded-[24px] border border-border bg-[#e3eee5] p-6 dark:bg-card">
          <div className="flex items-center gap-2 text-[#3f7559] dark:text-accent"><Sparkles size={16} /><span className="mono text-[10px] uppercase tracking-[0.16em]">Tutor note</span></div>
          <p className="mt-4 display text-[19px] font-semibold leading-snug text-[#234b38] dark:text-foreground">“When in doubt, ask: what is the reference type, and what is the runtime type?”</p>
          <Link href="/learn/casting" data-testid="link-tutor-casting" className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold text-[#3f7559] dark:text-accent">Review casting <ArrowRight size={14} /></Link>
        </section>
      </div>
    </div>
  </div>;
}

function Learn() {
  const params = useParams<{ topic?: string }>();
  const initialTopic = params.topic && topics.some((topic) => topic.id === params.topic) ? params.topic : 'exceptions';
  const [selected, setSelected] = useState(initialTopic);
  const [query, setQuery] = useState('');
  const active = topics.find((topic) => topic.id === selected) ?? topics[0];
  const filtered = topics.filter((topic) => `${topic.title} ${topic.concepts.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="rise">
    <SectionIntro kicker="Learn · Weeks 9—15" title="A compact map of the syllabus." detail="Seven high-yield rooms. Read the explanation, trace the example, then test the idea in Practice or the Coding Lab." action={<div className="relative"><BookOpen className="absolute left-3 top-3 text-muted-foreground" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} data-testid="input-search-topics" placeholder="Search a concept" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-[13px] shadow-sm outline-none placeholder:text-muted-foreground/70 focus:border-accent sm:w-56" /></div>} />
    <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <div className="space-y-2">{filtered.map((topic, index) => <button onClick={() => setSelected(topic.id)} key={topic.id} data-testid={`button-topic-${topic.id}`} className={`rise-${Math.min(index + 1, 4)} group w-full rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${active.id === topic.id ? 'border-foreground bg-primary text-primary-foreground shadow-md' : 'border-border bg-card shadow-sm hover:border-accent/60'}`}><div className="flex items-start justify-between gap-3"><div><div className={`mono text-[10px] uppercase tracking-[0.14em] ${active.id === topic.id ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{topic.week}</div><h2 className="mt-1 display text-[19px] font-bold">{topic.title}</h2></div><span className="mt-1 size-3 rounded-full" style={{ backgroundColor: topic.accent }} /></div><p className={`mt-2 text-[12px] leading-5 ${active.id === topic.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{topic.blurb}</p><div className="mt-3 flex flex-wrap gap-1.5">{topic.concepts.slice(0, 3).map((concept) => <span key={concept} className={`rounded-md px-2 py-1 mono text-[9px] ${active.id === topic.id ? 'bg-primary-foreground/10 text-primary-foreground/75' : 'bg-secondary text-secondary-foreground'}`}>{concept}</span>)}</div></button>)}</div>
      <article className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
        <div className="h-2" style={{ backgroundColor: active.accent }} />
        <div className="p-6 sm:p-8"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-secondary px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] text-secondary-foreground">{active.week}</span><span className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{active.eyebrow}</span></div><h2 data-testid="text-active-topic" className="mt-4 display text-[32px] font-bold leading-tight">{active.title}</h2><p className="mt-3 text-[15px] leading-7 text-muted-foreground">{active.summary}</p>
          <div className="mt-6 grid gap-5 md:grid-cols-[.8fr_1.2fr]"><div><div className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Key ideas</div><ul className="mt-3 space-y-2">{active.concepts.map((concept) => <li key={concept} className="flex items-center gap-2 text-[13px] font-medium"><CheckCircle2 size={15} className="text-[#4f9c7a]" />{concept}</li>)}</ul></div><div className="rounded-2xl bg-primary p-4 text-primary-foreground"><div className="flex items-center gap-2 text-primary-foreground/60"><Code2 size={15} /><span className="mono text-[10px] uppercase tracking-[0.14em]">Trace this</span></div><pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-[12px] leading-6 text-primary-foreground/90"><code>{active.example}</code></pre></div></div>
          <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-4"><div className="flex items-center gap-2 text-accent-foreground"><Brain size={15} /><span className="mono text-[10px] font-medium uppercase tracking-[0.14em]">Remember this</span></div><p className="mt-2 text-[13px] leading-6">{active.check}</p></div>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/practice" data-testid="link-topic-practice" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-[12px] font-bold text-primary-foreground">Test this idea <ArrowRight size={15} /></Link><Link href="/lab" data-testid="link-topic-lab" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-[12px] font-bold">Open coding lab <Code2 size={15} /></Link></div>
        </div>
      </article>
    </div>
  </div>;
}

function Practice() {
  const [index, setIndex] = usePersisted('java-practice-index', 0);
  const [results, setResults] = usePersisted<Record<string, number>>('java-practice-results', {});
  const [choice, setChoice] = useState<number | null>(null);
  const question = questions[index % questions.length];
  const answered = choice !== null;
  const score = Object.values(results).filter((result) => result === 1).length;
  const selectAnswer = (answer: number) => { if (!answered) { setChoice(answer); setResults((current) => ({ ...current, [question.id]: answer === question.answer ? 1 : 0 })); } };
  const next = () => { setChoice(null); setIndex((index + 1) % questions.length); };
  return <div className="rise">
    <SectionIntro kicker="Practice · retrieval beats rereading" title="Find the fuzzy edges." detail="Answer first. The explanation only arrives after your commitment — just like an exam." action={<div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"><Trophy size={16} className="text-[#d19a39]" /><span data-testid="text-practice-score" className="mono text-[12px] font-medium">{score}/{Object.keys(results).length || 0} correct</span></div>} />
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between"><span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Question {index + 1} of {questions.length}</span><div className="flex gap-1">{questions.map((item, itemIndex) => <span key={item.id} className={`h-1.5 w-5 rounded-full ${itemIndex < index ? 'bg-accent' : itemIndex === index ? 'bg-primary' : 'bg-secondary'}`} />)}</div></div>
      <section className="rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-8"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-secondary px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] text-secondary-foreground">{question.topic}</span><span className="mono text-[10px] text-muted-foreground">{question.id.toUpperCase()}</span></div><h2 data-testid="text-question" className="mt-6 display text-[25px] font-bold leading-tight sm:text-[31px]">{question.prompt}</h2>{question.code && <pre className="mt-5 overflow-x-auto rounded-2xl bg-primary p-4 text-[12px] leading-6 text-primary-foreground"><code>{question.code}</code></pre>}<div className="mt-6 grid gap-2.5">{question.options.map((option, optionIndex) => { const isCorrect = optionIndex === question.answer; const isSelected = optionIndex === choice; return <button key={option} onClick={() => selectAnswer(optionIndex)} disabled={answered} data-testid={`button-answer-${question.id}-${optionIndex}`} className={`flex items-start gap-3 rounded-xl border p-4 text-left text-[13px] transition-all ${answered && isCorrect ? 'border-[#4f9c7a] bg-[#4f9c7a]/10' : answered && isSelected ? 'border-destructive bg-destructive/10' : 'border-border bg-background/40 hover:-translate-y-0.5 hover:border-accent/70'}`}><span className={`grid size-6 shrink-0 place-items-center rounded-full border mono text-[10px] ${answered && isCorrect ? 'border-[#4f9c7a] bg-[#4f9c7a] text-white' : answered && isSelected ? 'border-destructive bg-destructive text-white' : 'border-border text-muted-foreground'}`}>{answered && isCorrect ? <Check size={13} /> : answered && isSelected ? <X size={13} /> : String.fromCharCode(65 + optionIndex)}</span><span className="pt-0.5">{option}</span></button>; })}</div>{answered && <div className={`mt-5 rounded-2xl p-4 ${choice === question.answer ? 'bg-[#4f9c7a]/12' : 'bg-[#e66b5d]/12'}`}><div className="flex items-center gap-2 text-[13px] font-bold">{choice === question.answer ? <CheckCircle2 size={17} className="text-[#4f9c7a]" /> : <X size={17} className="text-destructive" />}{choice === question.answer ? 'That holds.' : 'Not quite — keep the distinction.'}</div><p className="mt-2 text-[13px] leading-6 text-muted-foreground">{question.explanation}</p></div>}<div className="mt-6 flex justify-end">{answered && <button onClick={next} data-testid="button-next-question" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-[12px] font-bold text-primary-foreground">Next question <ArrowRight size={15} /></button>}</div></section>
    </div>
  </div>;
}

function CodingLab() {
  const [index, setIndex] = usePersisted('java-lab-index', 0);
  const [results, setResults] = usePersisted<Record<string, number>>('java-lab-results', {});
  const [solutions, setSolutions] = usePersisted<Record<string, string>>('java-lab-lecture14-solutions', {});
  const [choice, setChoice] = useState<number | null>(null);
  const [labTrack, setLabTrack] = useState<'lecture09' | 'lecture10' | 'lecture11' | 'lecture12p1' | 'lecture12p2' | 'lecture13' | 'lecture14' | 'lecture15'>('lecture09');
  const activeScenarios = labTrack === 'lecture09'
    ? lecture09Scenarios
    : labTrack === 'lecture10'
      ? lecture10Scenarios
      : labTrack === 'lecture11'
        ? lecture11Scenarios
        : labTrack === 'lecture12p1'
          ? lecture12Part1Scenarios
          : labTrack === 'lecture12p2'
            ? lecture12Part2Scenarios
            : labTrack === 'lecture13'
              ? lecture13Scenarios
                : labTrack === 'lecture14'
                  ? lecture14Scenarios
                  : lecture15Scenarios;
  const scenario = activeScenarios[index % activeScenarios.length];
  const isOpenEnded = scenario.openEnded === true;
  const answered = choice !== null;
  const reviewed = isOpenEnded && results[scenario.id] === 1;
  const solution = isOpenEnded ? solutions[scenario.id] ?? '' : '';
  const select = (value: number) => { if (!answered && scenario.answer !== undefined) { setChoice(value); setResults((current) => ({ ...current, [scenario.id]: value === scenario.answer ? 1 : 0 })); } };
  const reviewOpenScenario = () => { setChoice(-1); setResults((current) => ({ ...current, [scenario.id]: 1 })); };
  const updateSolution = (value: string) => setSolutions((current) => ({ ...current, [scenario.id]: value }));
  const next = () => { setChoice(null); setIndex((index + 1) % activeScenarios.length); };
  const selectTrack = (track: 'lecture09' | 'lecture10' | 'lecture11' | 'lecture12p1' | 'lecture12p2' | 'lecture13' | 'lecture14' | 'lecture15') => {
    setLabTrack(track);
    setIndex(0);
    setChoice(null);
  };
  const solvedCount = activeScenarios.filter((item) => results[item.id] === 1).length;
  const trackLabel = labTrack === 'lecture09'
    ? 'Lecture 09 exceptions'
    : labTrack === 'lecture10'
      ? 'Lecture 10 typecasting'
      : labTrack === 'lecture11'
        ? 'Lecture 11 interfaces'
        : labTrack === 'lecture12p1'
          ? 'Lecture 12 Part 1 evolution'
          : labTrack === 'lecture12p2'
            ? 'Lecture 12 Part 2 classes & records'
            : labTrack === 'lecture13'
              ? 'Lecture 13 generics'
              : labTrack === 'lecture14'
                ? 'OOC Week 14 scenario test'
                : 'Lecture 15 UML class diagrams';
  return <div className="rise">
    <SectionIntro kicker={`Coding lab · ${trackLabel}`} title={isOpenEnded ? 'Refactor the canteen, one concern at a time.' : 'Think like the compiler.'} detail={isOpenEnded ? 'The source prompt intentionally leaves the refactoring unsolved. Work through each requirement in plain Java, then mark the prompt reviewed.' : 'Pick the behavior or fix you expect, commit to an answer, then read the explanation. Your progress stays saved on this device.'} action={<div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"><Code2 size={16} className="text-[#3e93a8]" /><span className="mono text-[12px]">{solvedCount}/{activeScenarios.length} {isOpenEnded ? 'reviewed' : 'solved'}</span></div>} />
    <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Coding lab scenario sets">
      <button type="button" role="tab" aria-selected={labTrack === 'lecture09'} onClick={() => selectTrack('lecture09')} data-testid="button-lab-lecture09" className={`rounded-full px-3.5 py-2 mono text-[10px] uppercase tracking-[0.1em] transition-colors ${labTrack === 'lecture09' ? 'bg-accent text-accent-foreground' : 'border border-border bg-card text-muted-foreground hover:border-accent'}`}>Lecture 09 · Exceptions <span className="ml-1 opacity-70">10</span></button>
      <button type="button" role="tab" aria-selected={labTrack === 'lecture10'} onClick={() => selectTrack('lecture10')} data-testid="button-lab-lecture10" className={`rounded-full px-3.5 py-2 mono text-[10px] uppercase tracking-[0.1em] transition-colors ${labTrack === 'lecture10' ? 'bg-accent text-accent-foreground' : 'border border-border bg-card text-muted-foreground hover:border-accent'}`}>Lecture 10 · Typecasting <span className="ml-1 opacity-70">10</span></button>
      <button type="button" role="tab" aria-selected={labTrack === 'lecture11'} onClick={() => selectTrack('lecture11')} data-testid="button-lab-lecture11" className={`rounded-full px-3.5 py-2 mono text-[10px] uppercase tracking-[0.1em] transition-colors ${labTrack === 'lecture11' ? 'bg-accent text-accent-foreground' : 'border border-border bg-card text-muted-foreground hover:border-accent'}`}>Lecture 11 · Interfaces <span className="ml-1 opacity-70">10</span></button>
      <button type="button" role="tab" aria-selected={labTrack === 'lecture12p1'} onClick={() => selectTrack('lecture12p1')} data-testid="button-lab-lecture12p1" className={`rounded-full px-3.5 py-2 mono text-[10px] uppercase tracking-[0.1em] transition-colors ${labTrack === 'lecture12p1' ? 'bg-accent text-accent-foreground' : 'border border-border bg-card text-muted-foreground hover:border-accent'}`}>Lecture 12 · Part 1 <span className="ml-1 opacity-70">10</span></button>
      <button type="button" role="tab" aria-selected={labTrack === 'lecture12p2'} onClick={() => selectTrack('lecture12p2')} data-testid="button-lab-lecture12p2" className={`rounded-full px-3.5 py-2 mono text-[10px] uppercase tracking-[0.1em] transition-colors ${labTrack === 'lecture12p2' ? 'bg-accent text-accent-foreground' : 'border border-border bg-card text-muted-foreground hover:border-accent'}`}>Lecture 12 · Part 2 <span className="ml-1 opacity-70">10</span></button>
      <button type="button" role="tab" aria-selected={labTrack === 'lecture13'} onClick={() => selectTrack('lecture13')} data-testid="button-lab-lecture13" className={`rounded-full px-3.5 py-2 mono text-[10px] uppercase tracking-[0.1em] transition-colors ${labTrack === 'lecture13' ? 'bg-accent text-accent-foreground' : 'border border-border bg-card text-muted-foreground hover:border-accent'}`}>Lecture 13 · Generics <span className="ml-1 opacity-70">10</span></button>
      <button type="button" role="tab" aria-selected={labTrack === 'lecture14'} onClick={() => selectTrack('lecture14')} data-testid="button-lab-lecture14" className={`rounded-full px-3.5 py-2 mono text-[10px] uppercase tracking-[0.1em] transition-colors ${labTrack === 'lecture14' ? 'bg-accent text-accent-foreground' : 'border border-border bg-card text-muted-foreground hover:border-accent'}`}>Week 14 · Canteen <span className="ml-1 opacity-70">10</span></button>
      <button type="button" role="tab" aria-selected={labTrack === 'lecture15'} onClick={() => selectTrack('lecture15')} data-testid="button-lab-lecture15" className={`rounded-full px-3.5 py-2 mono text-[10px] uppercase tracking-[0.1em] transition-colors ${labTrack === 'lecture15' ? 'bg-accent text-accent-foreground' : 'border border-border bg-card text-muted-foreground hover:border-accent'}`}>Lecture 15 · UML <span className="ml-1 opacity-70">10</span></button>
    </div>
    {isOpenEnded && <details className="mb-5 rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-7"><summary className="cursor-pointer list-none"><div className="flex items-center justify-between gap-3"><div><div className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Original starter file</div><h2 className="mt-2 display text-[22px] font-bold">Main.java · intentionally poor design</h2></div><ChevronDown size={18} className="text-muted-foreground" /></div><p className="mt-3 text-[13px] leading-6 text-muted-foreground">Preserve the successful workflow while refactoring incrementally. Plain Java only; no frameworks, database, or real payment service.</p></summary><pre className="mt-5 max-h-[520px] overflow-auto rounded-2xl bg-primary p-4 text-[11px] leading-6 text-primary-foreground"><code>{lecture14StarterCode}</code></pre><p className="mt-4 text-[12px] leading-5 text-muted-foreground">Expected starter success: Payment successful: 120 · Delivered to Waseef at HALL-A · Receipt: Waseef | Total: 120 · Employee: Rahim | Salary: 2400</p></details>}
    <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><section className="rounded-[24px] border border-border bg-primary p-5 text-primary-foreground shadow-sm sm:p-7"><div className="flex items-center justify-between"><span className="rounded-full bg-primary-foreground/10 px-3 py-1 mono text-[10px] uppercase tracking-[0.13em] text-primary-foreground/70">{scenario.topic}</span><span className="mono text-[10px] text-primary-foreground/50">{scenario.id.toUpperCase()}</span></div><h2 className="mt-6 display text-[25px] font-bold leading-tight">{scenario.title}</h2><p className="mt-3 whitespace-pre-line text-[14px] leading-6 text-primary-foreground/70">{scenario.prompt}</p><pre className="mt-6 overflow-x-auto rounded-2xl border border-primary-foreground/10 bg-black/15 p-4 text-[12px] leading-6 text-primary-foreground/90"><code>{scenario.code}</code></pre><div className="mt-6 flex items-center gap-2 text-primary-foreground/50"><Circle size={12} /><span className="mono text-[10px] uppercase tracking-[0.12em]">Read every line</span></div></section><section className="rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-7">{isOpenEnded ? <><div className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Acceptance criteria</div><ul className="mt-4 space-y-3">{scenario.acceptance?.map((item) => <li key={item} className="flex gap-2 text-[13px] leading-6"><CheckCircle2 size={16} className="mt-1 shrink-0 text-[#4f9c7a]" />{item}</li>)}</ul><div className="mt-6"><div className="flex items-center justify-between gap-3"><label htmlFor={`solution-${scenario.id}`} className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Your solution</label><span className="text-[11px] text-muted-foreground">Autosaved locally</span></div><textarea id={`solution-${scenario.id}`} value={solution} onChange={(event) => updateSolution(event.target.value)} data-testid={`textarea-solution-${scenario.id}`} placeholder="Write your classes, interfaces, reasoning, and test results here…" className="mt-3 min-h-[210px] w-full resize-y rounded-2xl border border-border bg-background/50 p-4 text-[13px] leading-6 outline-none placeholder:text-muted-foreground/60 focus:border-accent" /></div><div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-4"><div className="flex items-center gap-2 text-[13px] font-bold"><MessageSquareText size={17} className="text-[#d19a39]" />Open-ended refactoring prompt</div><p className="mt-2 text-[13px] leading-6 text-muted-foreground">Write and test your own refactoring. This exercise intentionally does not reveal a solution.</p></div><div className="mt-6 flex items-center justify-between"><span className="mono text-[10px] text-muted-foreground">Scenario {index + 1} / {activeScenarios.length}</span>{reviewed || answered ? <button onClick={next} data-testid="button-next-scenario" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-[12px] font-bold text-primary-foreground">Next prompt <ArrowRight size={15} /></button> : <button onClick={reviewOpenScenario} data-testid={`button-review-scenario-${scenario.id}`} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-[12px] font-bold text-accent-foreground">Mark prompt reviewed <Check size={15} /></button>}</div></> : <><div className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Your call</div><div className="mt-4 space-y-2.5">{scenario.options.map((option, optionIndex) => <button key={option} onClick={() => select(optionIndex)} disabled={answered} data-testid={`button-lab-option-${scenario.id}-${optionIndex}`} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[13px] transition-all ${answered && optionIndex === scenario.answer ? 'border-[#4f9c7a] bg-[#4f9c7a]/10' : answered && optionIndex === choice ? 'border-destructive bg-destructive/10' : 'border-border hover:-translate-y-0.5 hover:border-accent/70'}`}><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary mono text-[10px] text-secondary-foreground">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div>{answered && <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/10 p-4"><div className="flex items-center gap-2 text-[13px] font-bold">{choice === scenario.answer ? <CheckCircle2 size={17} className="text-[#4f9c7a]" /> : <MessageSquareText size={17} className="text-[#d19a39]" />}{choice === scenario.answer ? 'Good read.' : 'Use the rule, not the guess.'}</div><p className="mt-2 text-[13px] leading-6 text-muted-foreground">{scenario.explanation}</p></div>}<div className="mt-6 flex items-center justify-between"><span className="mono text-[10px] text-muted-foreground">Scenario {index + 1} / {activeScenarios.length}</span>{answered && <button onClick={next} data-testid="button-next-scenario" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-[12px] font-bold text-primary-foreground">Next scenario <ArrowRight size={15} /></button>}</div></>}</section></div>
  </div>;
}

function Focus() {
  const [mode, setMode] = usePersisted<'focus' | 'break'>('java-timer-mode', 'focus');
  const [seconds, setSeconds] = usePersisted('java-timer-seconds', 25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = usePersisted('java-focus-sessions', 0);
  const duration = mode === 'focus' ? 25 * 60 : 5 * 60;
  useEffect(() => { if (!running) return; const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { setRunning(false); setSessions((count) => count + (mode === 'focus' ? 1 : 0)); return duration; } return value - 1; }), 1000); return () => window.clearInterval(timer); }, [running, duration, mode, setSeconds, setSessions]);
  const changeMode = (next: 'focus' | 'break') => { setMode(next); setRunning(false); setSeconds(next === 'focus' ? 25 * 60 : 5 * 60); };
  const progress = 1 - seconds / duration;
  return <div className="rise"><SectionIntro kicker="Focus room · one block" title="Protect your attention." detail="A quiet timer for the work that moves the score. Put the phone face down; keep this room open." action={<div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"><Flame size={16} className="text-[#e66b5d]" /><span className="mono text-[12px]">{sessions} focus blocks logged</span></div>} />
    <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="relative overflow-hidden rounded-[28px] bg-primary p-6 text-primary-foreground shadow-md sm:p-10"><div className="absolute -right-24 -top-28 size-80 rounded-full border-[24px] border-accent/10" /><div className="relative"><div className="flex gap-2"><button onClick={() => changeMode('focus')} data-testid="button-timer-focus-mode" className={`rounded-full px-3 py-1.5 mono text-[10px] uppercase tracking-[0.12em] ${mode === 'focus' ? 'bg-accent text-accent-foreground' : 'bg-primary-foreground/10 text-primary-foreground/60'}`}>Focus · 25</button><button onClick={() => changeMode('break')} data-testid="button-timer-break-mode" className={`rounded-full px-3 py-1.5 mono text-[10px] uppercase tracking-[0.12em] ${mode === 'break' ? 'bg-accent text-accent-foreground' : 'bg-primary-foreground/10 text-primary-foreground/60'}`}>Break · 5</button></div><div className="mx-auto mt-12 grid size-[238px] place-items-center rounded-full sm:size-[290px]" style={{ background: `conic-gradient(hsl(var(--accent)) ${progress * 360}deg, rgba(255,255,255,.11) 0deg)` }}><div className="grid size-[210px] place-items-center rounded-full bg-primary sm:size-[258px]"><div className="text-center"><div data-testid="text-timer" className="display text-[62px] font-bold tracking-tight sm:text-[76px]">{formatTime(seconds)}</div><div className="mono mt-2 text-[10px] uppercase tracking-[0.18em] text-primary-foreground/50">{running ? 'in the zone' : 'ready when you are'}</div></div></div></div><div className="mt-10 flex justify-center gap-3"><button onClick={() => setRunning((value) => !value)} data-testid="button-timer-toggle" className="press inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-[13px] font-bold text-accent-foreground">{running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}{running ? 'Pause timer' : 'Start timer'}</button><button onClick={() => { setRunning(false); setSeconds(duration); }} data-testid="button-timer-reset" className="grid size-11 place-items-center rounded-xl border border-primary-foreground/20 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10" aria-label="Reset timer"><RotateCcw size={16} /></button></div></div></section><div className="space-y-5"><section className="rounded-[24px] border border-border bg-card p-6 shadow-sm"><div className="flex items-center gap-2 text-muted-foreground"><Target size={16} /><span className="mono text-[10px] uppercase tracking-[0.15em]">Block brief</span></div><h2 className="mt-4 display text-[22px] font-bold">Explain exceptions out loud.</h2><p className="mt-2 text-[13px] leading-6 text-muted-foreground">In this block: sketch the hierarchy, write one checked example, and say what finally guarantees.</p><div className="mt-5 space-y-3">{['Throwable → Exception → RuntimeException', 'One try / catch / finally from memory', 'Finish with one practice question'].map((item) => <div key={item} className="flex items-center gap-2 text-[12px]"><CheckCircle2 size={15} className="text-[#4f9c7a]" />{item}</div>)}</div></section><section className="rounded-[24px] border border-border bg-[#f3e9d7] p-6 dark:bg-card"><div className="flex items-center gap-2 text-[#9b6e27] dark:text-accent"><Coffee size={16} /><span className="mono text-[10px] uppercase tracking-[0.15em]">Tiny ritual</span></div><p className="mt-3 text-[14px] leading-6 text-[#654b26] dark:text-muted-foreground">Before you start, write the one thing this block will make easier tomorrow.</p><Link href="/notes" data-testid="link-focus-notes" className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold text-[#9b6e27] dark:text-accent">Open scratchpad <ArrowRight size={14} /></Link></section></div></div>
  </div>;
}

function Notes() {
  const [notes, setNotes] = usePersisted('java-sprint-notes', '');
  const [saved, setSaved] = useState(false);
  const prompts = ['The distinction I keep mixing up is…', 'A code smell I can now spot is…', 'Tomorrow I want to remember…'];
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 1400); };
  return <div className="rise"><SectionIntro kicker="Scratchpad · stays on this device" title="Leave yourself a trail." detail="Capture the edges, rules, and tiny reminders you want to see again before the exam. Notes save locally as you type." action={<div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"><FileText size={16} className="text-[#8472c8]" /><span className="mono text-[12px]">Private by default</span></div>} />
    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between"><div><div className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Free write</div><h2 className="mt-2 display text-[23px] font-bold">What should future-you know?</h2></div><span className="rounded-full bg-accent/20 px-3 py-1 mono text-[10px] text-accent-foreground">{notes.length} chars</span></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} data-testid="textarea-notes" placeholder="Write a rule in your own words…" className="mt-6 min-h-[310px] w-full resize-y rounded-2xl border border-border bg-background/50 p-4 text-[14px] leading-7 outline-none placeholder:text-muted-foreground/60 focus:border-accent" /><div className="mt-4 flex items-center justify-between"><span className="text-[11px] text-muted-foreground">{saved ? 'Saved locally.' : 'Autosaved to this browser.'}</span><button onClick={save} data-testid="button-save-notes" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-bold text-primary-foreground">{saved ? <Check size={14} /> : <FileText size={14} />}{saved ? 'Saved' : 'Mark saved'}</button></div></section><aside className="space-y-5"><section className="rounded-[24px] border border-border bg-card p-6 shadow-sm"><div className="flex items-center gap-2 text-muted-foreground"><Sparkles size={16} /><span className="mono text-[10px] uppercase tracking-[0.15em]">Prompts for a tired brain</span></div><div className="mt-4 space-y-2">{prompts.map((prompt, index) => <button key={prompt} onClick={() => setNotes((current) => current ? `${current}\\n\\n${prompt} ` : `${prompt} `)} data-testid={`button-note-prompt-${index}`} className="w-full rounded-xl border border-border p-3 text-left text-[12px] leading-5 transition-colors hover:border-accent hover:bg-accent/10">{prompt}<ArrowRight className="float-right mt-0.5 text-muted-foreground" size={14} /></button>)}</div></section><section className="rounded-[24px] bg-primary p-6 text-primary-foreground"><div className="flex items-center gap-2 text-primary-foreground/60"><Moon size={16} /><span className="mono text-[10px] uppercase tracking-[0.15em]">Before you sleep</span></div><p className="mt-4 display text-[19px] font-semibold leading-snug">Close on a sentence you can explain, not a page you can reread.</p></section></aside></div>
  </div>;
}

function Router() {
  return <Switch><Route path="/" component={Dashboard} /><Route path="/learn" component={Learn} /><Route path="/learn/:topic" component={Learn} /><Route path="/practice" component={Practice} /><Route path="/lab" component={CodingLab} /><Route path="/focus" component={Focus} /><Route path="/notes" component={Notes} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><div className="min-h-[100dvh]"><WouterRouterWithShell /></div><Toaster /></TooltipProvider></QueryClientProvider>;
}

function WouterRouterWithShell() {
  return <Shell><RoutedErrorBoundary><Router /></RoutedErrorBoundary></Shell>;
}

export default App;