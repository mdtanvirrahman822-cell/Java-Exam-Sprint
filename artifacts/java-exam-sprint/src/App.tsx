import { useEffect, useState, type ReactNode } from 'react';
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
    title: 'Casting with a safety net',
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
    title: 'Interfaces as promises',
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
    id: 'members',
    week: 'Week 12 · Part 2',
    title: 'Static, final & nested',
    eyebrow: 'Class architecture',
    blurb: 'Know which things belong to the class, which cannot change, and which belong inside another type.',
    accent: '#d19a39',
    concepts: ['static', 'final', 'Static nested class', 'Inner class'],
    summary: 'static members belong to the class, not an instance. final variables are assigned once; final methods cannot be overridden; final classes cannot be extended. A static nested class needs no outer instance, while an inner class can access one.',
    example: `class Receipt {
  static int issued;
  final String id;
  class Stamp { // inner: tied to a Receipt
    String text() { return id; }
  }
}`,
    check: 'Do not use an instance field from a static context. Nested types are a tool for keeping a helper close to the type it serves and controlling visibility.',
  },
  {
    id: 'generics',
    week: 'Week 13',
    title: 'Generics, made useful',
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
    title: 'Composition over tight coupling',
    eyebrow: 'Design choices',
    blurb: 'Build small objects that work together instead of making one class know everything.',
    accent: '#d56e9a',
    concepts: ['Composition', 'Coupling', 'Delegation', 'Dependency injection'],
    summary: 'Composition means a class owns or receives collaborators and delegates work to them. Low coupling makes code easier to change, test, and reason about than a deep inheritance tree.',
    example: `final class StudyPlan {
  private final Clock clock;
  StudyPlan(Clock clock) { this.clock = clock; }
  boolean isDue() { return clock.now().isAfter(deadline); }
}`,
    check: 'If a class creates and controls every collaborator internally, it is tightly coupled. Pass dependencies in through a constructor when you want easy substitution in tests.',
  },
];

type ScheduleTask = { id: string; day: string; time: string; title: string; detail: string; topic: string; lecture: string };
const schedule: ScheduleTask[] = [
  { id: 's1', day: 'Tonight · Sep 7', time: '23:00', title: 'Build the exception map', detail: 'Hierarchy, checked / unchecked, cleanup', topic: 'Week 9', lecture: 'Lecture 09' },
  { id: 's2', day: 'Tonight · Sep 7', time: '23:50', title: 'Casting drills', detail: 'Upcast, downcast, instanceof', topic: 'Week 10', lecture: 'Lecture 10' },
  { id: 's3', day: 'Mon · Sep 8', time: '09:00', title: 'Interfaces & class design', detail: 'Contracts, capabilities, abstract classes', topic: 'Week 11', lecture: 'Lecture 11' },
  { id: 's4', day: 'Mon · Sep 8', time: '11:00', title: 'Static, final, nested', detail: 'Predict what belongs where', topic: 'Week 12', lecture: 'Lecture 12' },
  { id: 's5', day: 'Tue · Sep 9', time: '09:30', title: 'Generics deep pass', detail: 'Bounds, wildcards, PECS', topic: 'Week 13', lecture: 'Lecture 13' },
  { id: 's6', day: 'Tue · Sep 9', time: '13:00', title: 'Composition case study', detail: 'Coupling and collaborator design', topic: 'Week 14', lecture: 'Lecture 14' },
  { id: 's7', day: 'Tue · Sep 9', time: '19:30', title: 'Mixed exam rehearsal', detail: 'Practice + two coding scenarios', topic: 'All weeks', lecture: 'Lectures 09–14' },
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

type Scenario = { id: string; title: string; topic: string; prompt: string; code: string; options: string[]; answer: number; explanation: string };
const scenarios: Scenario[] = [
  { id: 'c1', title: 'Catch the right branch', topic: 'Exceptions', prompt: 'Which edit lets this program compile and preserve the specific recovery?', code: `void load() {\n  try {\n    read();\n  } catch (Exception e) {\n    useBackup();\n  } catch (IOException e) {\n    retry();\n  }\n}`, options: ['Swap the catch blocks: IOException first.', 'Replace IOException with RuntimeException.', 'Move retry into finally.', 'Remove both catches.'], answer: 0, explanation: 'Catch clauses go from specific to general. Exception first makes the IOException branch unreachable.' },
  { id: 'c2', title: 'Read the runtime type', topic: 'Casting', prompt: 'Which line is the safe, modern way to call fetch?', code: `Animal animal = getAnimal();\n// call Dog.fetch() only when possible`, options: ['Dog dog = (Dog) animal; dog.fetch();', 'if (animal instanceof Dog dog) dog.fetch();', 'Animal.fetch(animal);', 'if (animal == Dog) animal.fetch();'], answer: 1, explanation: 'Pattern matching checks the runtime type and introduces a correctly typed variable inside the guarded branch.' },
  { id: 'c3', title: 'Choose the boundary', topic: 'Composition', prompt: 'Which constructor best keeps Report independent from a concrete database?', code: `final class Report {\n  // collaborator needed to load data\n}`, options: ['Report() { db = new MySqlDatabase(); }', 'Report(MySqlDatabase db) { this.db = db; }', 'Report(Database db) { this.db = db; }', 'static Database db = new Database();'], answer: 2, explanation: 'Accept the narrow abstraction the class needs. A Database interface lets production and test implementations slot in.' },
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
  return <section className="relative overflow-hidden rounded-[24px] bg-primary p-6 text-primary-foreground shadow-md sm:p-8">
    <div className="absolute -right-16 -top-20 size-64 rounded-full border-[22px] border-accent/20" /><div className="absolute -bottom-24 right-24 size-48 rounded-full border-[14px] border-primary-foreground/5" />
    <div className="relative">
      <div className="flex items-center gap-2 text-primary-foreground/65"><Clock3 size={15} /><span className="mono text-[10px] uppercase tracking-[0.18em]">Time until the exam</span></div>
      <div className="mt-6 flex items-end gap-3 sm:gap-5">
        {[[countdown.days, 'days'], [countdown.hours, 'hours'], [countdown.minutes, 'mins'], [countdown.seconds, 'secs']].map(([value, label], index) => <div className="flex items-end gap-3 sm:gap-5" key={label}><div><div className="display text-[42px] font-bold leading-none sm:text-[62px]">{String(value).padStart(2, '0')}</div><div className="mono mt-2 text-[9px] uppercase tracking-[0.16em] text-primary-foreground/55">{label}</div></div>{index < 3 && <span className="mb-6 text-2xl text-accent/70">:</span>}</div>)}
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3"><span className="rounded-full bg-accent px-3 py-1.5 mono text-[10px] font-medium uppercase tracking-[0.12em] text-accent-foreground">Sep 10 · 14:30</span><span className="text-[12px] text-primary-foreground/60">One focused block at a time.</span></div>
    </div>
  </section>;
}

function ProgressRing({ value }: { value: number }) {
  return <div className="relative grid size-[122px] place-items-center rounded-full" style={{ background: `conic-gradient(hsl(var(--accent)) ${value * 3.6}deg, hsl(var(--muted)) 0deg)` }}><div className="grid size-[94px] place-items-center rounded-full bg-card"><div className="text-center"><div className="display text-[27px] font-bold">{value}%</div><div className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">ready</div></div></div></div>;
}

function Dashboard() {
  const [completed, setCompleted] = usePersisted<string[]>('java-sprint-tasks', ['s1', 's2']);
  const [, setLocation] = useLocation();
  const progress = Math.round((completed.length / schedule.length) * 100);
  const toggleTask = (id: string) => setCompleted((current) => current.includes(id) ? current.filter((task) => task !== id) : [...current, id]);
  return <div className="rise">
    <SectionIntro kicker="Tuesday, September 7 · 23:00 start" title="Make the last miles count." detail="Your exam cockpit for OOP. The plan is already here; your job is to keep moving the next small marker." action={<button onClick={() => setLocation('/focus')} data-testid="button-dashboard-start" className="press inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[13px] font-bold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5"><Play size={15} fill="currentColor" /> Start next block</button>} />
    <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
      <CountdownCard />
      <section className="flex flex-col justify-between rounded-[24px] border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center xl:flex-col xl:items-start">
        <div><div className="flex items-center gap-2 text-muted-foreground"><Gauge size={16} /><span className="mono text-[10px] uppercase tracking-[0.16em]">Sprint progress</span></div><h2 className="mt-3 display text-[22px] font-bold">Your runway is visible.</h2><p className="mt-2 max-w-xs text-[13px] leading-5 text-muted-foreground">Complete the plan, then use practice to find the fuzzy edges.</p></div>
        <div className="mt-5 flex items-center gap-5 sm:mt-0 xl:mt-5"><ProgressRing value={progress} /><div><div className="display text-2xl font-bold">{completed.length}<span className="text-muted-foreground">/{schedule.length}</span></div><div className="mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">blocks done</div></div></div>
      </section>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
      <section className="rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-muted-foreground"><CalendarDays size={16} /><span className="mono text-[10px] uppercase tracking-[0.16em]">The three-day runway</span></div><h2 className="mt-2 display text-[23px] font-bold">Your study plan</h2></div><span className="rounded-full bg-secondary px-3 py-1 mono text-[10px] text-secondary-foreground">{completed.length} checked</span></div>
        <div className="mt-5 space-y-2">{schedule.map((task) => { const done = completed.includes(task.id); return <button key={task.id} onClick={() => toggleTask(task.id)} data-testid={`button-task-${task.id}`} className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all hover:-translate-y-0.5 ${done ? 'border-accent/50 bg-accent/10' : 'border-border bg-background/40 hover:border-accent/45'}`}><span className={`grid size-7 shrink-0 place-items-center rounded-full border ${done ? 'border-accent bg-accent text-accent-foreground' : 'border-border text-muted-foreground'}`}>{done ? <Check size={14} strokeWidth={3} /> : <Circle size={13} />}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className={`text-[13px] font-semibold ${done ? 'text-muted-foreground line-through' : ''}`}>{task.title}</span><span className="rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 mono text-[9px] uppercase tracking-[0.08em] text-accent-foreground">{task.lecture}</span></span><span className="mt-0.5 block text-[11px] text-muted-foreground">{task.day} · {task.detail}</span></span><span className="hidden shrink-0 rounded-md bg-secondary px-2 py-1 mono text-[9px] text-secondary-foreground sm:inline">{task.time}</span><ChevronRight className="text-muted-foreground transition-transform group-hover:translate-x-0.5" size={15} /></button>; })}</div>
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
    <SectionIntro kicker="Learn · Weeks 9—14" title="A compact map of the syllabus." detail="Six high-yield rooms. Read the explanation, trace the example, then test the idea in Practice or the Coding Lab." action={<div className="relative"><BookOpen className="absolute left-3 top-3 text-muted-foreground" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} data-testid="input-search-topics" placeholder="Search a concept" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-[13px] shadow-sm outline-none placeholder:text-muted-foreground/70 focus:border-accent sm:w-56" /></div>} />
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
  const [choice, setChoice] = useState<number | null>(null);
  const scenario = scenarios[index % scenarios.length];
  const answered = choice !== null;
  const select = (value: number) => { if (!answered) { setChoice(value); setResults((current) => ({ ...current, [scenario.id]: value === scenario.answer ? 1 : 0 })); } };
  const next = () => { setChoice(null); setIndex((index + 1) % scenarios.length); };
  return <div className="rise">
    <SectionIntro kicker="Coding lab · predict before you run" title="Think like the compiler." detail="Small Java situations, high signal. Pick the fix or behavior you expect, then read the why." action={<div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2"><Code2 size={16} className="text-[#3e93a8]" /><span className="mono text-[12px]">{Object.values(results).filter((item) => item === 1).length}/{Object.keys(results).length || 0} solved</span></div>} />
    <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><section className="rounded-[24px] border border-border bg-primary p-5 text-primary-foreground shadow-sm sm:p-7"><div className="flex items-center justify-between"><span className="rounded-full bg-primary-foreground/10 px-3 py-1 mono text-[10px] uppercase tracking-[0.13em] text-primary-foreground/70">{scenario.topic}</span><span className="mono text-[10px] text-primary-foreground/50">{scenario.id.toUpperCase()}</span></div><h2 className="mt-6 display text-[25px] font-bold leading-tight">{scenario.title}</h2><p className="mt-3 text-[14px] leading-6 text-primary-foreground/70">{scenario.prompt}</p><pre className="mt-6 overflow-x-auto rounded-2xl border border-primary-foreground/10 bg-black/15 p-4 text-[12px] leading-6 text-primary-foreground/90"><code>{scenario.code}</code></pre><div className="mt-6 flex items-center gap-2 text-primary-foreground/50"><Circle size={12} /><span className="mono text-[10px] uppercase tracking-[0.12em]">Read every line</span></div></section><section className="rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-7"><div className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Your call</div><div className="mt-4 space-y-2.5">{scenario.options.map((option, optionIndex) => <button key={option} onClick={() => select(optionIndex)} disabled={answered} data-testid={`button-lab-option-${scenario.id}-${optionIndex}`} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[13px] transition-all ${answered && optionIndex === scenario.answer ? 'border-[#4f9c7a] bg-[#4f9c7a]/10' : answered && optionIndex === choice ? 'border-destructive bg-destructive/10' : 'border-border hover:-translate-y-0.5 hover:border-accent/70'}`}><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary mono text-[10px] text-secondary-foreground">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div>{answered && <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/10 p-4"><div className="flex items-center gap-2 text-[13px] font-bold">{choice === scenario.answer ? <CheckCircle2 size={17} className="text-[#4f9c7a]" /> : <MessageSquareText size={17} className="text-[#d19a39]" />}{choice === scenario.answer ? 'Good read.' : 'Use the rule, not the guess.'}</div><p className="mt-2 text-[13px] leading-6 text-muted-foreground">{scenario.explanation}</p></div>}<div className="mt-6 flex items-center justify-between"><span className="mono text-[10px] text-muted-foreground">Scenario {index + 1} / {scenarios.length}</span>{answered && <button onClick={next} data-testid="button-next-scenario" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-[12px] font-bold text-primary-foreground">Next scenario <ArrowRight size={15} /></button>}</div></section></div>
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