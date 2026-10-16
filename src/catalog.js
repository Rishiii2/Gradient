/* Gradient — canonical course catalog (synthetic university).
   Format:  @CODE|Name|semester|branches|style|dept   (style letters: n=numerical, d=derivation, t=theory; first letter dominates)
            #Unit name
            Concept name = one-line gist
   Courses shared by several branches are ONE node (e.g. MA201 is taken by CSE, ECE and ME). */
var G = (typeof G !== "undefined") ? G : {};
G.CATALOG_TEXT = `
@MA101|Engineering Mathematics-I|1|CSE,ECE,ME|nd|MA
#Differential Calculus
Successive Differentiation = nth derivative of a product is found with Leibniz theorem
Taylor and Maclaurin Series = expand a function as a power series about a point (Maclaurin about zero)
Partial Derivatives = derivative with respect to one variable while holding the others constant
Euler's Theorem on Homogeneous Functions = for f homogeneous of degree n, x·fx + y·fy = n·f
#Multivariable Calculus
Jacobians = determinant of partial derivatives that measures area scaling under a change of variables
Maxima and Minima of Two Variables = solve fx = fy = 0 and classify with the rt − s² test
Lagrange Multipliers = optimise f subject to g = 0 by solving ∇f = λ∇g
Errors and Approximations = estimate small errors in a quantity using the total differential df
#Integral Calculus
Beta and Gamma Functions = Γ(n) = ∫ e^(−x) x^(n−1) dx from 0 to ∞ and B(m,n) = Γ(m)Γ(n)/Γ(m+n)
Double Integrals = integrate over a plane region; changing the order of integration simplifies limits
Triple Integrals = volume integrals over a solid, often in cylindrical or spherical coordinates
Area and Volume by Integration = use double and triple integrals to find areas and volumes of solids
#Matrices
Rank of a Matrix = number of linearly independent rows, found by reducing to echelon form
Systems of Linear Equations = consistent when rank of coefficient matrix equals rank of augmented matrix
Eigenvalues and Eigenvectors = solve det(A − λI) = 0, then (A − λI)x = 0 for each eigenvalue
Cayley-Hamilton Theorem = every square matrix satisfies its own characteristic equation, which gives A inverse
#Ordinary Differential Equations
Exact Differential Equations = M dx + N dy = 0 is exact when ∂M/∂y = ∂N/∂x
Linear First-Order ODEs = solve dy/dx + Py = Q with the integrating factor e^(∫P dx)
Higher-Order Linear ODEs with Constant Coefficients = complementary function from the auxiliary equation plus a particular integral
Variation of Parameters = particular integral built from the complementary solutions and their Wronskian

@PH101|Engineering Physics|1|CSE,ECE,ME|dtn|PH
#Interference
Young's Double Slit Experiment = fringe width β = λD/d for two coherent slits
Newton's Rings = radius of the nth dark ring satisfies rn² = nλR
Thin Film Interference = path difference 2μt cos r produces colours in thin films
Michelson Interferometer = wavelength found from fringe count as the mirror moves by λ/2 per fringe
#Diffraction and Polarisation
Single Slit Diffraction = minima occur where a sinθ = nλ
Diffraction Grating = grating equation (a + b) sinθ = nλ with resolving power nN
Malus's Law = intensity through a polariser is I = I0 cos²θ
Brewster's Law = tan θp = μ, and reflected light at the polarising angle is fully polarised
#Quantum Mechanics
de Broglie Hypothesis = matter has a wavelength λ = h/p
Heisenberg Uncertainty Principle = Δx·Δp ≥ ħ/2 limits simultaneous measurement of position and momentum
Schrödinger Wave Equation = the time-independent form governs stationary states ψ
Particle in a One-Dimensional Box = energy levels En = n²h²/8mL² are quantised
#Lasers and Fibre Optics
Einstein Coefficients = relate the rates of spontaneous and stimulated emission (A and B coefficients)
Population Inversion = more atoms in the excited state than the ground state, needed for lasing
Ruby and He-Ne Lasers = three-level solid-state laser versus four-level gas laser
Numerical Aperture of Optical Fibre = NA = √(n1² − n2²), the sine of the acceptance angle
#Solid State Physics
Crystal Structures and Miller Indices = lattice planes labelled (hkl) by reciprocals of their intercepts
Bragg's Law = 2d sinθ = nλ for X-ray diffraction from crystal planes
Band Theory of Solids = conductors, semiconductors and insulators differ by their band gap
Hall Effect = transverse voltage in a magnetic field reveals carrier type and density

@CS101|Programming Fundamentals|1|CSE,ECE,ME|nt|CS
#Basics of C
Data Types and Operators = int, float and char types with operator precedence and associativity rules
Control Statements = if-else, switch and the for, while and do-while loops
Type Conversion and Casting = implicit promotion versus an explicit cast such as (float)a/b
Input and Output Functions = printf and scanf with format specifiers like %d, %f and %s
#Functions and Recursion
Function Call Mechanism = call by value copies arguments into a new activation record on the stack
Recursion = a function calls itself until a base case, as in factorial or Fibonacci
Storage Classes = auto, static, extern and register set a variable's scope and lifetime
Scope and Lifetime of Variables = local variables live inside a block, globals for the whole program
#Arrays and Strings
One-Dimensional Arrays = contiguous memory indexed from 0, used for traversal and searching
Two-Dimensional Arrays = stored in row-major order, used for matrix addition and multiplication
String Handling Functions = strlen, strcpy, strcmp and strcat from string.h
Searching and Sorting = linear and binary search; bubble and selection sort
#Pointers
Pointer Basics and Arithmetic = & takes an address, * dereferences, and increments move by element size
Pointers and Arrays = an array name decays to a pointer to its first element
Call by Reference = passing addresses lets a function modify the caller's variables
Dynamic Memory Allocation = malloc, calloc, realloc and free manage memory on the heap
#Structures and Files
Structures and Unions = a struct groups members while a union shares one memory location
Array of Structures = store records such as student details and process them in a loop
File Handling = fopen, fprintf, fscanf and fclose with modes r, w and a
Preprocessor Directives = #define macros, #include and conditional compilation

@EE101|Basic Electrical Engineering|1|CSE,ECE,ME|n|EE
#DC Circuits
Kirchhoff's Laws = KCL: currents at a node sum to zero; KVL: voltages around a loop sum to zero
Mesh and Nodal Analysis = write systematic equations for loop currents or node voltages
Thevenin's Theorem = replace a network by Vth in series with Rth seen from the load
Superposition Theorem = the response is the sum of responses to each source acting alone
#AC Circuits
RMS and Average Values = Vrms = Vm/√2 and Vavg = 2Vm/π for a sinusoid
Phasor Representation = a sinusoid drawn as a rotating vector with magnitude and phase
RLC Series Circuit = impedance Z = R + j(XL − XC), with resonance when XL = XC
Power Factor and AC Power = P = VI cosφ, with reactive power Q and apparent power S
#Three-Phase Systems
Star and Delta Connections = line and phase quantities differ by a factor of √3
Two-Wattmeter Method = total three-phase power is W1 + W2 for balanced or unbalanced loads
Balanced Three-Phase Loads = equal impedance per phase allows per-phase analysis
Power Factor Improvement = capacitor banks reduce the reactive power drawn from supply
#Transformers
Transformer EMF Equation = E = 4.44 f N Φm
Equivalent Circuit of Transformer = referred winding resistances and reactances plus a magnetising branch
Losses and Efficiency = core and copper losses; efficiency is maximum when they are equal
Open and Short Circuit Tests = give core loss and copper loss parameters of a transformer
#Electrical Machines
DC Motor Principle = torque on current-carrying conductors in a magnetic field, opposed by back EMF
Three-Phase Induction Motor = rotating magnetic field with slip s = (Ns − N)/Ns
Single-Phase Induction Motor = not self-starting; uses split-phase or capacitor-start windings
Synchronous Generator = alternator EMF at synchronous speed Ns = 120f/P

@HS101|Communication Skills|1|CSE,ECE,ME|t|HS
#Communication Fundamentals
Process of Communication = sender, message, channel, receiver and feedback
Barriers to Communication = physical, semantic and psychological barriers and how to remove them
Verbal and Non-Verbal Communication = body language, tone and gestures support the spoken word
Listening Skills = active listening versus hearing, and techniques to improve it
#Grammar and Vocabulary
Tenses and Subject-Verb Agreement = the verb form must match the number of the subject
Common Errors in English = misplaced modifiers, wrong prepositions and redundancy
Vocabulary Building = synonyms, antonyms, one-word substitutes and idioms
Sentence Transformation = active to passive voice and direct to indirect speech
#Reading and Writing
Reading Comprehension = skim for the main idea and scan for details
Paragraph Writing = a topic sentence followed by coherent supporting sentences
Precis Writing = condense a passage to about one-third while keeping its meaning
Essay Writing = introduction, body and conclusion built around an argument
#Professional Writing
Formal Letter Writing = block format for enquiry, complaint and cover letters
Email Etiquette = clear subject line, concise body and a professional tone
Report Writing = title, summary, findings and recommendations
Resume Writing = reverse chronological format that highlights skills and achievements
#Oral Communication
Presentation Skills = structure, visual aids, delivery and handling questions
Group Discussion = initiating, contributing, summarising and taking turns
Interview Skills = preparation, STAR-format answers and confident body language
Public Speaking = overcoming stage fear with voice modulation and pauses

@MA201|Mathematics-III (Transforms and PDE)|3|CSE,ECE,ME|nd|MA
#Fourier Series
Euler's Formulae for Fourier Coefficients = a0, an and bn are found by integrating over one period
Half-Range Series = sine or cosine series of a function defined on (0, L)
Dirichlet Conditions = sufficient conditions for a Fourier series to converge
Parseval's Identity = the sum of squared coefficients equals the mean square value of the function
#Laplace Transform
Laplace Transform of Standard Functions = L{e^(at)} = 1/(s − a) and L{t^n} = n!/s^(n+1)
Shifting Theorems = the first shift multiplies by e^(at); the second handles the unit step
Inverse Laplace by Partial Fractions = split F(s) into standard forms before inverting
Solving ODEs using Laplace Transform = transform the equation, solve algebraically, then invert
#Fourier Transform
Fourier Integral Theorem = represents a non-periodic function as an integral over frequencies
Fourier Sine and Cosine Transforms = transforms of the odd or even extension of a function
Convolution Theorem = the transform of a convolution is the product of the transforms
Properties of Fourier Transform = linearity, shifting, scaling and modulation
#Partial Differential Equations
Formation of PDEs = eliminate arbitrary constants or arbitrary functions
Lagrange's Linear Equation = solve Pp + Qq = R with auxiliary equations dx/P = dy/Q = dz/R
Separation of Variables = assume u = X(x)T(t) to split a PDE into ODEs
Classification of Second-Order PDEs = elliptic, parabolic or hyperbolic by the sign of B² − 4AC
#Applications of PDE
One-Dimensional Wave Equation = vibrating string utt = c²uxx with boundary conditions
One-Dimensional Heat Equation = ut = c²uxx for heat conduction in a rod
Two-Dimensional Laplace Equation = steady-state temperature distribution in a plate
Z-Transform Basics = discrete counterpart of the Laplace transform with a region of convergence

@CS201|Data Structures|3|CSE|nt|CS
#Arrays and Complexity
Asymptotic Notation = Big-O, Omega and Theta describe how running time grows
Array Operations = cost of insertion, deletion and traversal in arrays
Sparse Matrices = store only the non-zero elements as triplets
Recurrence Relations for Algorithms = express the running time of recursive algorithms
#Stacks and Queues
Stack Operations = LIFO push and pop with overflow and underflow checks
Infix to Postfix Conversion = use a stack and operator precedence to convert expressions
Circular Queue = rear wraps to the front to reuse space; full when (rear + 1) % n == front
Priority Queue = always dequeues the highest-priority element, usually built with a heap
#Linked Lists
Singly Linked List = nodes hold data and a next pointer; insertion and deletion by relinking
Doubly Linked List = prev and next pointers allow traversal in both directions
Circular Linked List = the last node points back to the first
Polynomial Representation using Linked List = each term is a node with coefficient and exponent
#Trees
Binary Tree Traversals = inorder, preorder, postorder and level-order traversal
Binary Search Tree = left < root < right, giving search, insert and delete in O(h)
AVL Trees = height-balanced BSTs restored with LL, RR, LR and RL rotations
Heaps and Heap Sort = complete binary tree with the heap property, sorting in O(n log n)
#Graphs and Hashing
Graph Representation = adjacency matrix versus adjacency list
BFS and DFS = breadth-first search uses a queue, depth-first search uses a stack or recursion
Minimum Spanning Tree = Prim's and Kruskal's greedy algorithms
Hashing and Collision Resolution = hash functions with chaining or open addressing

@DE201|Digital Electronics|3|CSE,ECE|nt|EC
#Number Systems and Codes
Number System Conversion = convert between binary, octal, decimal and hexadecimal
Complements and Signed Arithmetic = subtraction using 1's and 2's complement
Binary Codes = BCD, Gray code and excess-3 code
Error Detecting Codes = parity bits and Hamming code detect and correct errors
#Boolean Algebra
De Morgan's Theorems = the complement of a sum is the product of the complements
Karnaugh Maps = group adjacent 1s to minimise sum-of-products expressions
Quine-McCluskey Method = tabular minimisation for functions with many variables
Universal Gates = any logic function can be built from only NAND or only NOR gates
#Combinational Circuits
Adders and Subtractors = half adder, full adder and ripple-carry adder
Multiplexers and Demultiplexers = data selectors with select lines, also used to implement functions
Decoders and Encoders = n-to-2^n decoders and priority encoders
Magnitude Comparator = compares two binary numbers for greater, equal or less
#Sequential Circuits
Latches and Flip-Flops = characteristic tables of SR, JK, D and T flip-flops
Flip-Flop Conversion = use excitation tables to convert one flip-flop type to another
Shift Registers = SISO, SIPO, PISO and PIPO data movement
Race-Around Condition = a JK flip-flop toggles repeatedly; solved by the master-slave design
#Counters and Logic Families
Asynchronous Counters = ripple counters and mod-N counters using reset
Synchronous Counters = all flip-flops share one clock; designed from a state table
Mealy and Moore Machines = outputs depend on state and input (Mealy) or state only (Moore)
Logic Families = TTL and CMOS compared on fan-out, noise margin and power

@CS205|Discrete Mathematics|3|CSE|dn|CS
#Logic
Propositional Logic = connectives, truth tables and tautologies
Predicate Logic and Quantifiers = universal and existential quantifiers and their negation rules
Rules of Inference = modus ponens, modus tollens and resolution
Proof Techniques = direct proof, proof by contradiction and mathematical induction
#Sets, Relations and Functions
Set Operations = union, intersection and complements shown with Venn diagrams
Equivalence Relations = reflexive, symmetric and transitive relations partition a set into classes
Partial Orders and Hasse Diagrams = posets, lattices and maximal and minimal elements
Pigeonhole Principle = placing n + 1 objects in n boxes puts two in one box
#Combinatorics
Permutations and Combinations = nPr counts arrangements and nCr counts selections
Solving Recurrence Relations = linear homogeneous recurrences solved with characteristic roots
Generating Functions = power series that encode a sequence and solve recurrences
Inclusion-Exclusion Principle = count a union by alternating sums of intersections
#Algebraic Structures
Groups and Subgroups = closure, associativity, identity and inverse
Lagrange's Theorem on Groups = the order of a subgroup divides the order of the group
Rings and Fields = two operations linked by distributive laws
Homomorphism and Isomorphism = structure-preserving maps between groups
#Graph Theory
Handshaking Lemma = the sum of vertex degrees equals twice the number of edges
Euler and Hamiltonian Paths = Euler uses every edge once, Hamiltonian visits every vertex once
Planar Graphs and Euler's Formula = v − e + f = 2 for a connected planar graph
Graph Colouring = chromatic number, and four colours suffice for planar graphs

@CS207|Computer Organization|3|CSE|tn|CS
#Basic Structure
Functional Units of a Computer = input, memory, ALU, control and output units
Addressing Modes = immediate, direct, indirect, register and indexed addressing
Instruction Cycle = fetch, decode, execute and store steps
RISC vs CISC = simple fixed-length instructions versus complex variable-length ones
#Computer Arithmetic
Booth's Multiplication Algorithm = signed multiplication by recoding pairs of multiplier bits
Restoring and Non-Restoring Division = iterative binary division methods
IEEE 754 Floating Point = sign bit, biased exponent and mantissa
Carry Lookahead Adder = generate and propagate signals compute all carries in parallel
#Control Unit and Pipelining
Hardwired Control = control signals generated by fixed logic circuits
Microprogrammed Control = control words stored in a control memory
Pipelining = overlapping instruction stages to raise throughput
Pipeline Hazards = structural, data and control hazards handled by forwarding and stalls
#Memory Organization
Memory Hierarchy = registers, cache, main memory and disk trade speed for size and cost
Cache Mapping Techniques = direct, fully associative and set-associative mapping
Cache Replacement and Write Policies = LRU and FIFO; write-through versus write-back
Virtual Memory and Paging = page tables and the TLB translate virtual addresses to physical
#Input Output Organization
Programmed I/O = the CPU polls the device status
Interrupts = a device signals the CPU, which runs an interrupt service routine
Direct Memory Access = a DMA controller moves blocks without the CPU
Bus Arbitration = centralised and distributed control of the shared bus

@EC201|Network Analysis|3|ECE|n|EC
#Network Theorems
Thevenin and Norton Theorems = equivalent source with series or parallel resistance
Maximum Power Transfer Theorem = maximum power when load resistance equals source resistance
Reciprocity Theorem = swapping source and response leaves the transfer ratio unchanged
Millman's Theorem = combines parallel voltage sources into a single equivalent source
#Transient Analysis
RL Circuit Transients = current rises with time constant L/R
RC Circuit Transients = capacitor voltage charges with time constant τ = RC
RLC Transient Response = overdamped, critically damped and underdamped cases
Initial and Final Conditions = inductor current and capacitor voltage cannot change instantly
#Two-Port Networks
Z and Y Parameters = open-circuit impedance and short-circuit admittance parameters
h Parameters = hybrid parameters used in transistor models
ABCD Parameters = transmission parameters for cascaded networks
Interconnection of Two-Port Networks = series, parallel and cascade combinations
#Network Functions and Synthesis
Driving Point and Transfer Functions = ratios of Laplace-domain responses
Poles and Zeros = roots of the denominator and numerator of a network function
Foster Form Synthesis = realise LC impedances by partial fraction expansion
Cauer Form Synthesis = continued fraction realisation as a ladder network
#Resonance and Filters
Series Resonance = minimum impedance at f0 = 1/(2π√LC)
Parallel Resonance = maximum impedance in a tank circuit
Quality Factor and Bandwidth = Q = f0/BW measures selectivity
Passive Filters = low-pass, high-pass and band-pass filters built from RLC

@EC203|Electronic Devices and Circuits|3|ECE|tn|EC
#Semiconductor Physics
Intrinsic and Extrinsic Semiconductors = doping with donors or acceptors creates n-type and p-type
Drift and Diffusion Currents = current due to an electric field and due to a concentration gradient
Fermi Level = energy level where the occupation probability is one half
Mass Action Law = n·p = ni² at thermal equilibrium
#PN Junction Diode
Depletion Region = a barrier potential forms as carriers diffuse across the junction
Diode V-I Characteristics = forward conduction and reverse saturation current
Zener Diode as Voltage Regulator = reverse breakdown holds the output voltage constant
Rectifiers = half-wave, full-wave and bridge rectifiers with ripple factor and efficiency
#Bipolar Junction Transistor
BJT Configurations = common base, common emitter and common collector
Transistor Biasing = fixed bias and voltage divider bias with stability factor
BJT h-Parameter Model = small-signal equivalent with hie, hfe, hre and hoe
Thermal Runaway = positive feedback between temperature and collector current
#Field Effect Transistors
JFET Characteristics = pinch-off voltage and drain characteristics
MOSFET Types = enhancement and depletion MOSFETs and threshold voltage
FET Biasing = self bias and voltage divider bias
FET Small-Signal Model = transconductance gm and drain resistance rd
#Amplifiers and Oscillators
Frequency Response of Amplifiers = bandwidth between the lower and upper cutoff frequencies
Negative Feedback Amplifiers = feedback lowers gain but improves stability and bandwidth
Barkhausen Criterion = loop gain of magnitude 1 and phase 0° sustains oscillation
RC and LC Oscillators = RC phase shift, Wien bridge, Colpitts and Hartley oscillators

@EC205|Signals and Systems|3|ECE|nd|EC
#Signal Classification
Continuous and Discrete Signals = defined for all time t versus integer samples n
Energy and Power Signals = finite total energy versus finite average power
Even and Odd Signals = x(t) = x(−t) or x(t) = −x(−t), and every signal splits into both parts
Elementary Signals = unit step, impulse, ramp and exponential signals
#System Properties
Linearity and Time Invariance = superposition holds and a shifted input gives a shifted output
Causality and Stability = output depends only on past inputs; BIBO stability
Convolution Integral = y(t) = x(t) * h(t) for an LTI system
Impulse Response = completely characterises an LTI system
#Fourier Analysis
Continuous-Time Fourier Series = a periodic signal as a sum of harmonics
Continuous-Time Fourier Transform = spectrum of an aperiodic signal
Discrete-Time Fourier Transform = frequency content of a sequence, periodic in ω
Sampling Theorem = sample at fs ≥ 2fmax to avoid aliasing
#Laplace and Z Transform
Region of Convergence = values of s or z for which the transform converges
Transfer Function of LTI Systems = H(s) = Y(s)/X(s)
Inverse Z-Transform = partial fractions, power series or residue method
Z-Transform Properties = linearity, time shifting and convolution
#Random Signals
Random Variables = CDF, PDF and moments of a random variable
Random Processes = an ensemble of time functions and stationarity
Power Spectral Density = by Wiener-Khinchin, the Fourier transform of the autocorrelation
Ergodicity = time averages equal ensemble averages

@ME201|Engineering Thermodynamics|3|ME|nd|ME
#Basic Concepts
Thermodynamic Systems and Properties = closed, open and isolated systems; intensive and extensive properties
Zeroth Law and Temperature = thermal equilibrium defines temperature
Work and Heat Transfer = path functions, with displacement work ∫p dV
Quasi-Static Process = an infinitely slow process passing through equilibrium states
#First Law
First Law for Closed Systems = Q − W = ΔU
Steady Flow Energy Equation = energy balance applied to nozzles, turbines and compressors
Internal Energy and Enthalpy = h = u + pv
Perpetual Motion Machine of First Kind = an impossible machine that creates energy
#Second Law and Entropy
Kelvin-Planck and Clausius Statements = no engine is 100% efficient; heat flows hot to cold unaided
Carnot Cycle = maximum possible efficiency 1 − TL/TH
Clausius Inequality and Entropy = ∮dQ/T ≤ 0, which defines entropy as a property
Entropy Change in Processes = Δs for ideal gas and irreversible processes
#Properties of Pure Substances
Phase Diagrams of Water = p-v and T-s diagrams of a pure substance
Dryness Fraction = the quality x of wet steam
Steam Tables and Mollier Chart = find h, s and v for steam states
Measurement of Dryness Fraction = throttling and separating calorimeters
#Power Cycles
Rankine Cycle = steam power cycle with pump, boiler, turbine and condenser
Otto Cycle = constant-volume heat addition with η = 1 − 1/r^(γ−1)
Diesel Cycle = constant-pressure heat addition with a cut-off ratio
Brayton Cycle = gas turbine cycle with isentropic compression and expansion

@ME203|Strength of Materials|3|ME|nd|ME
#Simple Stresses and Strains
Hooke's Law and Elastic Constants = relations between E, G, K and Poisson's ratio
Stress-Strain Diagram = elastic limit, yield point and ultimate stress
Thermal Stresses = restrained expansion produces stress α ΔT E
Compound Bars = load sharing between bars of different materials
#Shear Force and Bending Moment
SFD and BMD for Cantilevers = shear and moment diagrams under point loads and UDL
SFD and BMD for Simply Supported Beams = maximum moment wL²/8 under a UDL
Point of Contraflexure = where the bending moment changes sign
Load-Shear-Moment Relations = dM/dx = V and dV/dx = −w
#Bending and Shear Stresses
Theory of Simple Bending = M/I = σ/y = E/R
Section Modulus = Z = I/ymax measures bending strength
Shear Stress Distribution = τ = VAȳ/Ib across a beam section
Composite Beams = equivalent section method for flitched beams
#Torsion and Springs
Torsion of Circular Shafts = T/J = τ/r = Gθ/L
Power Transmitted by Shafts = P = 2πNT/60
Closely Coiled Helical Springs = deflection δ = 64WR³n/Gd⁴
Leaf Springs = laminated springs used in vehicle suspension
#Deflection and Columns
Double Integration Method = integrate EI y'' = M for slope and deflection
Macaulay's Method = bracket notation handles several loads in one equation
Euler's Column Theory = critical load π²EI/Le²
Rankine's Formula = empirical crippling load for short and long columns

@ME205|Manufacturing Processes|3|ME|t|ME
#Casting
Sand Casting Process = pattern, mould, core and pouring
Pattern Allowances = shrinkage, draft and machining allowances
Gating System Design = sprue, runner and gates control the flow of molten metal
Casting Defects = blowholes, shrinkage cavities and cold shuts, with remedies
#Metal Forming
Rolling = reduce thickness between compressive rolls, hot or cold
Forging = shaping by compressive blows in open or closed dies
Extrusion and Drawing = push or pull metal through a die
Sheet Metal Operations = blanking, punching, bending and deep drawing
#Welding
Arc Welding = an electric arc melts the electrode and base metal
Gas Welding = oxy-acetylene neutral, oxidising and carburising flames
Resistance Welding = spot and seam welding by I²R heating
Welding Defects = porosity, cracks and incomplete fusion
#Machining
Lathe Operations = turning, facing, threading and taper turning
Merchant's Circle = relates cutting forces to the shear angle in metal cutting
Tool Life = Taylor's equation VT^n = C
Milling and Drilling = multi-point cutting operations
#Advanced Manufacturing
Non-Traditional Machining = EDM, ECM, laser and ultrasonic machining
CNC Machines = computer numerical control programmed with G and M codes
Additive Manufacturing = 3D printing layer by layer with FDM, SLA and SLS
Powder Metallurgy = compacting and sintering metal powders

@ME207|Fluid Mechanics|3|ME|nd|ME
#Fluid Properties and Statics
Viscosity and Newton's Law = shear stress τ = μ du/dy
Hydrostatic Pressure = Pascal's law and p = ρgh
Manometers = U-tube and differential manometers measure pressure differences
Buoyancy and Metacentre = stability of floating bodies from metacentric height
#Fluid Kinematics
Types of Flow = steady, uniform, laminar and turbulent flow
Continuity Equation = A1V1 = A2V2 for incompressible flow
Stream Function and Velocity Potential = describe two-dimensional flow fields
Flow Net = orthogonal grid of streamlines and equipotential lines
#Fluid Dynamics
Euler's Equation of Motion = momentum balance along a streamline
Bernoulli's Equation = p/ρg + V²/2g + z is constant along a streamline
Venturimeter and Orificemeter = measure flow from a pressure drop
Momentum Equation = forces on pipe bends and jets
#Flow through Pipes
Darcy-Weisbach Equation = head loss hf = fLV²/2gD
Minor Losses = losses at bends, sudden expansion and sudden contraction
Pipes in Series and Parallel = equivalent pipe and flow distribution
Hagen-Poiseuille Flow = laminar pipe flow with a parabolic velocity profile
#Dimensional Analysis and Boundary Layer
Buckingham Pi Theorem = form dimensionless groups from the variables
Similitude and Model Studies = Reynolds and Froude model laws
Boundary Layer Concept = thin viscous layer near a surface with thickness δ
Drag and Lift = forces on immersed bodies and the drag coefficient

@HS301|Engineering Economics|5|CSE,ECE,ME|nt|HS
#Economic Basics
Demand and Supply = the law of demand and price elasticity of demand
Cost Concepts = fixed, variable, marginal and opportunity cost
Break-Even Analysis = BEP = fixed cost / (price − variable cost per unit)
Market Structures = perfect competition, monopoly and oligopoly
#Time Value of Money
Compound Interest = F = P(1 + i)^n
Present Worth Method = compare alternatives by discounting their cash flows
Annual Equivalent Method = convert cash flows into a uniform annual series
Rate of Return Method = find the IRR at which NPV = 0
#Depreciation and Replacement
Straight Line Depreciation = equal annual depreciation (P − S)/n
Declining Balance Method = a fixed percentage of book value each year
Replacement Analysis = economic life that minimises equivalent annual cost
Sinking Fund Method = accumulate a fund to replace an asset
#Financial Management
Financial Statements = balance sheet and profit and loss account
Ratio Analysis = liquidity, profitability and turnover ratios
Capital Budgeting = payback period, NPV and IRR for investment decisions
Sources of Finance = equity, debt and venture capital
#Macroeconomics
National Income = GDP, GNP and NNP and how they are measured
Inflation = causes, effects and control of rising prices
Monetary and Fiscal Policy = RBI tools and the government budget
Banking System = functions of commercial banks and the central bank

@CS301|Operating Systems|5|CSE|tn|CS
#Process Management
Process States and PCB = new, ready, running, waiting and terminated, tracked in a process control block
CPU Scheduling Algorithms = FCFS, SJF, Priority and Round Robin with waiting and turnaround time
Threads and Multithreading = lightweight processes sharing one address space
Context Switching = saving and restoring process state on the CPU
#Process Synchronization
Critical Section Problem = needs mutual exclusion, progress and bounded waiting
Semaphores = wait and signal operations on counting and binary semaphores
Classical Synchronization Problems = producer-consumer, readers-writers and dining philosophers
Monitors = high-level synchronization construct with condition variables
#Deadlocks
Deadlock Conditions = mutual exclusion, hold and wait, no preemption and circular wait
Banker's Algorithm = checks for a safe state to avoid deadlock
Deadlock Detection and Recovery = resource allocation graph and wait-for graph
Deadlock Prevention = break one of the four necessary conditions
#Memory Management
Paging = fixed-size frames with page table translation
Segmentation = variable-size logical segments
Page Replacement Algorithms = FIFO, LRU and Optimal, and Belady's anomaly
Thrashing = excessive paging from too few frames; the working set model prevents it
#Storage and File Systems
Disk Scheduling Algorithms = FCFS, SSTF, SCAN, C-SCAN and LOOK reduce seek time
File Allocation Methods = contiguous, linked and indexed allocation
Directory Structures = single-level, two-level, tree and acyclic graph directories
RAID Levels = striping and mirroring for performance and reliability

@CS303|Database Management Systems|5|CSE|tn|CS
#Data Models
ER Model = entities, attributes, relationships and cardinality
Relational Model and Keys = super, candidate, primary and foreign keys
Three-Schema Architecture = internal, conceptual and external levels give data independence
Mapping ER to Relational Schema = convert entities and relationships into tables
#Query Languages
Relational Algebra = select, project, join, union and division operators
SQL Queries = SELECT with WHERE, GROUP BY, HAVING and ORDER BY
Joins and Subqueries = inner and outer joins, nested and correlated queries
Views and Triggers = virtual tables and event-driven procedures
#Normalization
Functional Dependencies and Armstrong's Axioms = reflexivity, augmentation and transitivity
Normal Forms 1NF 2NF 3NF = remove repeating groups, partial and transitive dependencies
BCNF = every determinant is a candidate key
Lossless Join Decomposition = decomposition that preserves data and dependencies
#Transactions and Concurrency
ACID Properties = atomicity, consistency, isolation and durability
Serializability = conflict and view serializability tested with a precedence graph
Two-Phase Locking = growing and shrinking phases guarantee serializability
Timestamp Ordering Protocol = orders conflicting operations by transaction timestamps
#Storage and Recovery
Indexing and B+ Trees = balanced multi-level index that supports range queries
Hashing in Databases = static and extendible hashing
Log-Based Recovery = undo and redo using a write-ahead log
Checkpoints = limit how much of the log is scanned during recovery

@CS305|Design and Analysis of Algorithms|5|CSE|nd|CS
#Analysis Basics
Asymptotic Analysis = best, average and worst case bounds
Master Theorem = solves T(n) = aT(n/b) + f(n)
Recursion Tree Method = sum the cost level by level
Amortized Analysis = aggregate, accounting and potential methods
#Divide and Conquer
Merge Sort = split, sort the halves and merge in O(n log n)
Quick Sort = partition around a pivot; average O(n log n), worst O(n²)
Strassen's Matrix Multiplication = seven multiplications giving O(n^2.81)
Binary Search Analysis = halving the search space gives O(log n)
#Greedy Algorithms
Fractional Knapsack = pick items by value-to-weight ratio
Huffman Coding = optimal prefix codes built by merging the least frequent symbols
Activity Selection Problem = choose the compatible activity that finishes earliest
Dijkstra's Shortest Path = greedy single-source shortest paths for non-negative weights
#Dynamic Programming
0/1 Knapsack using DP = table of best value for each capacity and item count
Longest Common Subsequence = LCS table filled in O(mn) time
Matrix Chain Multiplication = optimal parenthesisation that minimises scalar multiplications
Floyd-Warshall Algorithm = all-pairs shortest paths in O(n³)
#Backtracking and Complexity
N-Queens Problem = place queens with backtracking on conflicts
Branch and Bound = prune the search with bounds, as in the travelling salesman problem
P NP and NP-Complete = verifiable in polynomial time; NP-complete problems are the hardest in NP
Polynomial-Time Reductions = prove NP-hardness by reducing a known hard problem

@CN301|Computer Networks|5|CSE,ECE|tn|CS
#Network Models
OSI Reference Model = seven layers from physical to application
TCP/IP Model = four-layer Internet architecture
Network Topologies = bus, star, ring and mesh trade-offs
Transmission Media = twisted pair, coaxial cable, optical fibre and wireless
#Data Link Layer
CRC and Error Detection = cyclic redundancy check and checksum detect transmission errors
Sliding Window Protocols = stop-and-wait, go-back-N and selective repeat
Medium Access Control = ALOHA, CSMA/CD and CSMA/CA
Ethernet and Switching = MAC addresses and learning switches
#Network Layer
IPv4 Addressing and Subnetting = classful addressing, CIDR notation and subnet masks
Routing Algorithms = distance vector and link state routing
IPv6 = 128-bit addresses and a simplified header
ARP and ICMP = address resolution and error reporting
#Transport Layer
TCP Connection Management = three-way handshake and connection termination
TCP Congestion Control = slow start, congestion avoidance and fast retransmit
UDP = connectionless, low-overhead transport
Socket Programming = client-server communication through sockets
#Application Layer and Security
DNS = hierarchical resolution of names to IP addresses
HTTP and the Web = request-response with methods and status codes
Email Protocols = SMTP, POP3 and IMAP
Network Security Basics = firewalls, symmetric and public-key encryption

@EC301|Analog Communication|5|ECE|nd|EC
#Amplitude Modulation
AM Modulation Index and Power = total power Pt = Pc(1 + m²/2)
DSB-SC and SSB Modulation = suppress the carrier or one sideband to save power and bandwidth
AM Generation = square-law and switching modulators
AM Demodulation = envelope detector and coherent detection
#Angle Modulation
Frequency Modulation = instantaneous frequency follows the message, with modulation index β
Carson's Rule = FM bandwidth ≈ 2(Δf + fm)
FM Generation = direct method and Armstrong indirect method
FM Demodulation = slope detector, Foster-Seeley discriminator and PLL
#Radio Receivers
Superheterodyne Receiver = mixes the signal down to a fixed intermediate frequency
Image Frequency = image at fs + 2fIF and the image rejection ratio
Sensitivity and Selectivity = figures of merit of a receiver
Automatic Gain Control = keeps the output level steady
#Noise
Sources of Noise = thermal, shot and flicker noise
Noise Figure and Noise Temperature = how much a stage degrades the SNR
Friis Formula for Noise = cascaded noise figure dominated by the first stage
Figure of Merit of AM and FM = FM gives better noise performance than AM
#Pulse Modulation
PAM PWM and PPM = pulse amplitude, width and position modulation
Pulse Code Modulation = sampling, quantisation and encoding
Quantization Noise = SQNR improves by about 6 dB per bit
Delta Modulation = one-bit tracking with slope overload and granular noise

@EC303|Microprocessors and Microcontrollers|5|ECE|tn|EC
#8085 Architecture
8085 Architecture = 8-bit CPU with a 16-bit address bus
8085 Registers and Flags = accumulator, general purpose registers and the flag register
Timing Diagrams = opcode fetch, memory read and memory write machine cycles
8085 Interrupts = TRAP, RST 7.5, 6.5, 5.5 and INTR in priority order
#8085 Assembly Programming
8085 Instruction Set = data transfer, arithmetic, logical and branch instructions
8085 Addressing Modes = immediate, direct, register, indirect and implied
Stack and Subroutines = PUSH, POP, CALL and RET
8085 Assembly Programs = addition, block transfer and sorting programs
#8086 Microprocessor
8086 Architecture = BIU and EU with an instruction queue
Memory Segmentation in 8086 = code, data, stack and extra segments; physical address = segment × 16 + offset
8086 Addressing Modes = based, indexed and based-indexed modes
Minimum and Maximum Modes = single-processor versus multiprocessor configuration
#Peripheral Interfacing
8255 PPI = programmable parallel ports and mode selection
8253 Timer = programmable counters and their modes
8259 Interrupt Controller = priority interrupt management
ADC and DAC Interfacing = converting between analog and digital signals
#8051 Microcontroller
8051 Architecture = on-chip RAM, ROM, timers and serial port
8051 Timers and Counters = TMOD and TCON registers with modes 0 to 3
8051 Serial Communication = SCON register and baud rate generation
8051 Interrupts = IE and IP registers set enable and priority

@CT301|Control Systems|5|ECE,ME|nd|EE
#System Modelling
Transfer Function = ratio of Laplace output to input with zero initial conditions
Block Diagram Reduction = combine blocks in series, parallel and feedback
Mason's Gain Formula = overall gain of a signal flow graph from forward paths and loops
Mechanical and Electrical Analogies = force-voltage and force-current analogies
#Time Response
Standard Test Signals = step, ramp, parabolic and impulse inputs
Second-Order System Response = damping ratio ζ and natural frequency ωn
Time Domain Specifications = rise time, peak time, maximum overshoot and settling time
Steady-State Error and Error Constants = Kp, Kv and Ka depend on the system type
#Stability
Routh-Hurwitz Criterion = sign changes in the first column count unstable roots
Root Locus Technique = paths of closed-loop poles as the gain K varies
Gain and Phase Margins = measures of relative stability
BIBO Stability = every bounded input gives a bounded output
#Frequency Response
Bode Plot = magnitude and phase against log frequency using asymptotes
Polar Plot = frequency response drawn in the complex plane
Nyquist Stability Criterion = encirclements of the −1 point determine stability
Frequency Domain Specifications = resonant peak, resonant frequency and bandwidth
#Controllers and State Space
PID Controllers = proportional, integral and derivative actions
Lead and Lag Compensators = improve transient or steady-state response
State Space Representation = ẋ = Ax + Bu and y = Cx + Du
Controllability and Observability = Kalman rank tests

@ME301|Heat Transfer|5|ME|nd|ME
#Conduction
Fourier's Law of Conduction = q = −kA dT/dx
Conduction through Composite Walls = thermal resistances add in series
Conduction through Cylinders = resistance ln(r2/r1)/2πkL
Critical Radius of Insulation = rc = k/h for a cylinder
#Fins and Transient Conduction
Heat Transfer from Fins = fin efficiency and fin effectiveness
Infinitely Long Fin = q = √(hPkA)·θ0
Lumped System Analysis = valid when the Biot number is below 0.1
Heisler Charts = transient conduction charts for slabs and cylinders
#Convection
Newton's Law of Cooling = q = hAΔT
Dimensionless Numbers in Convection = Nusselt, Reynolds, Prandtl and Grashof numbers
Forced Convection Correlations = Dittus-Boelter equation for turbulent pipe flow
Natural Convection = buoyancy-driven flow characterised by the Rayleigh number
#Radiation
Stefan-Boltzmann Law = E = σT⁴ for a black body
Kirchhoff's Law of Radiation = emissivity equals absorptivity at equilibrium
View Factor = fraction of radiation leaving one surface that reaches another
Radiation Shields = reduce net radiation exchange between surfaces
#Heat Exchangers and Phase Change
LMTD Method = Q = UA·ΔTlm for heat exchangers
Effectiveness-NTU Method = effectiveness as a function of NTU and capacity ratio
Boiling Heat Transfer = pool boiling curve and critical heat flux
Condensation = film and dropwise condensation

@ME303|Theory of Machines|5|ME|nd|ME
#Mechanisms
Kinematic Links and Pairs = lower and higher pairs forming kinematic chains
Grübler's Criterion = degrees of freedom F = 3(n − 1) − 2j − h
Four-Bar Chain Inversions = crank-rocker, double crank and double rocker
Slider-Crank Mechanism = converts rotary motion to reciprocating motion
#Velocity and Acceleration Analysis
Instantaneous Centre Method = uses Kennedy's theorem of three centres
Relative Velocity Method = velocity polygons for links
Acceleration Diagrams = centripetal and tangential components
Coriolis Acceleration Component = 2ωv for sliding along a rotating link
#Cams and Gears
Cam Profiles and Follower Motions = uniform velocity, SHM and cycloidal motion
Law of Gearing = the common normal must pass through the pitch point
Involute Gear Terminology = pitch circle, module, addendum and pressure angle
Gear Trains = simple, compound and epicyclic gear train speed ratios
#Dynamics of Machines
Flywheels = turning moment diagrams, fluctuation of energy and speed
Governors = Watt, Porter and Proell governors; sensitivity and stability
Gyroscopic Couple = C = Iωωp acting on ships and vehicles
Belt Friction = tension ratio T1/T2 = e^(μθ)
#Balancing and Vibrations
Balancing of Rotating Masses = single and multiple plane balancing
Balancing of Reciprocating Masses = primary and secondary unbalanced forces
Free Vibrations = natural frequency ωn = √(k/m)
Damped and Forced Vibrations = damping ratio, resonance and magnification factor

@ME305|Machine Design|5|ME|n|ME
#Design Fundamentals
Factor of Safety = allowable stress = strength / factor of safety
Theories of Failure = maximum principal stress, maximum shear stress and distortion energy
Stress Concentration = notches raise local stress by a factor Kt
Material Selection = strength, ductility and cost considerations
#Fatigue Design
S-N Curve and Endurance Limit = stress amplitude against cycles to failure
Goodman and Soderberg Lines = combine mean and alternating stresses
Fatigue Stress Concentration = notch sensitivity q and fatigue factor Kf
Miner's Rule = cumulative damage Σ n/N = 1 at failure
#Joints
Riveted Joints = lap and butt joints and the efficiency of a joint
Welded Joints = strength of fillet and butt welds
Bolted Joints = bolt preload and stresses in bolts
Cotter and Knuckle Joints = joints designed for axial loads
#Shafts and Couplings
Shaft Design for Combined Loading = equivalent torque √(M² + T²)
Keys and Keyways = sunk keys checked for shear and crushing
Rigid and Flexible Couplings = flange coupling and bushed-pin coupling
Critical Speed of Shafts = whirling speed caused by shaft deflection
#Power Transmission Elements
Spur Gear Design = Lewis equation for beam strength of gear teeth
Rolling Contact Bearings = dynamic load rating and bearing life L10
Journal Bearings = hydrodynamic lubrication and the Sommerfeld number
Belt and Chain Drives = selection and power rating

@HS401|Project Management|7|CSE,ECE,ME|tn|HS
#Project Fundamentals
Project Life Cycle = initiation, planning, execution and closure
Project Selection Methods = NPV, payback and scoring models
Work Breakdown Structure = decompose a project into deliverables and tasks
Stakeholder Management = identify and engage project stakeholders
#Project Scheduling
Critical Path Method = the longest path sets the project duration
PERT = three time estimates with te = (a + 4m + b)/6
Gantt Charts = bar chart schedule of activities
Float and Slack = total float and free float of activities
#Resource and Cost
Project Crashing = shorten duration at minimum extra cost
Resource Levelling = smooth resource usage over time
Earned Value Management = PV, EV and AC with CPI and SPI
Cost Estimation = bottom-up and parametric estimating
#Risk and Quality
Risk Analysis = probability-impact matrix for identified risks
Risk Response Strategies = avoid, transfer, mitigate or accept
Quality Management = plan, assure and control quality; TQM
Six Sigma = DMAIC cycle to reduce process variation
#Agile and Teams
Agile Principles = iterative delivery and customer collaboration
Scrum Framework = sprints, product backlog and daily stand-ups
Tuckman's Team Stages = forming, storming, norming and performing
Project Closure = formal acceptance and lessons learned

@CS401|Machine Learning|7|CSE,ECE|nt|CS
#Foundations
Types of Machine Learning = supervised, unsupervised and reinforcement learning
Bias-Variance Tradeoff = balance between underfitting and overfitting
Cross-Validation = k-fold estimate of generalisation error
Evaluation Metrics = accuracy, precision, recall, F1 and ROC-AUC
#Regression
Linear Regression = minimise squared error, solved by the normal equation
Gradient Descent = update weights step by step along the negative gradient
Logistic Regression = sigmoid output trained with cross-entropy loss
Regularization = L1 lasso and L2 ridge penalties reduce overfitting
#Classification
Decision Trees = split nodes by information gain or Gini index
Naive Bayes Classifier = Bayes' theorem with independent features
Support Vector Machines = maximum-margin hyperplane and the kernel trick
k-Nearest Neighbours = classify by majority vote of the nearest points
#Unsupervised Learning
K-Means Clustering = assign points to the nearest centroid, then update centroids
Hierarchical Clustering = agglomerative merging shown as a dendrogram
Principal Component Analysis = project data onto directions of maximum variance
Gaussian Mixture Models = soft clustering fitted by expectation-maximisation
#Neural Networks
Perceptron = linear threshold unit trained by the perceptron learning rule
Backpropagation = the chain rule computes gradients layer by layer
Activation Functions = sigmoid, tanh, ReLU and softmax
Convolutional Neural Networks = convolution and pooling layers for images

@CS403|Compiler Design|7|CSE|tn|CS
#Lexical Analysis
Phases of a Compiler = lexical, syntax and semantic analysis, IR, optimisation and code generation
Regular Expression to NFA = Thompson's construction
NFA to DFA Conversion = subset construction
Lex Tool = tokens, patterns and actions in a lexical analyser generator
#Syntax Analysis
Context-Free Grammars = productions, derivations, parse trees and ambiguity
Left Recursion and Left Factoring = transform a grammar for top-down parsing
LL(1) Parsing = FIRST and FOLLOW sets build the predictive parsing table
Recursive Descent Parsing = one procedure per non-terminal
#Bottom-Up Parsing
Shift-Reduce Parsing = find handles and reduce them on a stack
SLR Parsing = LR(0) items, closure and goto with a table built from FOLLOW
CLR and LALR Parsing = lookahead items, with merged states in LALR
YACC = parser generator with grammar rules and semantic actions
#Semantic Analysis and Intermediate Code
Syntax Directed Definitions = synthesized and inherited attributes
Type Checking = type expressions and type equivalence
Three-Address Code = quadruples, triples and indirect triples
Symbol Table = stores identifiers with their scope and type
#Optimization and Code Generation
Basic Blocks and Flow Graphs = partition code for optimisation
Code Optimization Techniques = constant folding, dead code elimination and loop-invariant motion
DAG of a Basic Block = eliminates common subexpressions
Register Allocation = graph colouring assigns variables to registers

@CS405|Cryptography and Network Security|7|CSE|tn|CS
#Classical Cryptography
Security Goals and Attacks = confidentiality, integrity and availability; passive and active attacks
Substitution Ciphers = Caesar, Playfair and Vigenère ciphers
Transposition Ciphers = rail fence and columnar permutation
Cryptanalysis Basics = brute force and frequency analysis
#Symmetric Ciphers
Data Encryption Standard = 16-round Feistel cipher with a 56-bit key
Advanced Encryption Standard = SubBytes, ShiftRows, MixColumns and AddRoundKey rounds
Block Cipher Modes = ECB, CBC, CFB, OFB and CTR
Stream Ciphers = a keystream XORed with the plaintext, as in RC4
#Public Key Cryptography
Number Theory for Cryptography = modular arithmetic, Euler's totient and Fermat's theorem
RSA Algorithm = keys from n = pq with e·d ≡ 1 mod φ(n)
Diffie-Hellman Key Exchange = agree on a shared secret over an insecure channel
Elliptic Curve Cryptography = security from the elliptic curve discrete logarithm
#Integrity and Authentication
Cryptographic Hash Functions = SHA family with collision resistance
Message Authentication Codes = HMAC combines a secret key with a hash
Digital Signatures = sign with the private key; RSA and DSA signatures
Public Key Infrastructure = certificates issued by certificate authorities
#Network Security
SSL/TLS = the handshake establishes secure session keys
IPSec = AH and ESP protocols in tunnel and transport modes
Firewalls and IDS = packet filtering and intrusion detection systems
Kerberos = ticket-based authentication with a key distribution centre

@CS407|Cloud Computing|7|CSE|t|CS
#Cloud Fundamentals
Cloud Service Models = IaaS, PaaS and SaaS and who manages what
Cloud Deployment Models = public, private, hybrid and community clouds
Characteristics of Cloud = on-demand self-service, elasticity and measured service
Cloud Economics = pay-as-you-go pricing and total cost of ownership
#Virtualization
Hypervisors = type 1 bare-metal versus type 2 hosted hypervisors
Full and Para-Virtualization = unmodified versus modified guest operating systems
Containers and Docker = OS-level virtualization that shares the host kernel
Live Migration = move running virtual machines between hosts
#Cloud Architecture
Service-Oriented Architecture = loosely coupled services with standard interfaces
Microservices = small independently deployable services
Load Balancing and Auto-Scaling = spread traffic and add capacity on demand
Kubernetes = container orchestration with pods, deployments and services
#Cloud Storage and Data
Distributed File Systems = GFS and HDFS replicate large blocks across nodes
MapReduce = map and reduce phases for parallel batch processing
NoSQL Databases = key-value, document and column-family stores
CAP Theorem = consistency, availability and partition tolerance cannot all be guaranteed
#Cloud Security and Management
Shared Responsibility Model = the provider secures the cloud, the customer secures what is in it
Identity and Access Management = users, roles and policies with least privilege
Service Level Agreements = uptime commitments and penalties
Serverless Computing = event-triggered functions as a service

@EC401|VLSI Design|7|ECE|tn|EC
#MOS Transistor Theory
MOSFET I-V Characteristics = cutoff, linear and saturation regions
Second-Order MOS Effects = channel length modulation, body effect and velocity saturation
CMOS Inverter DC Characteristics = voltage transfer curve and noise margins
Scaling of MOS Devices = constant-field and constant-voltage scaling
#CMOS Logic Design
Static CMOS Logic Gates = complementary pull-up and pull-down networks
Stick Diagrams and Layout = λ-based design rules
Transmission Gates = switches built from paired nMOS and pMOS transistors
Dynamic Logic = precharge and evaluate phases and domino logic
#Circuit Characterization
Propagation Delay Estimation = RC delay models and logical effort
Power Dissipation in CMOS = dynamic power CV²f plus leakage
Interconnect Effects = wire resistance, capacitance and crosstalk
Transistor Sizing = size transistors to balance rise and fall times
#Sequential and Memory Design
CMOS Latches and Registers = static and dynamic storage elements
SRAM Cell Design = read and write stability of the 6T cell
DRAM Cell = 1T1C storage that needs refresh
Clocking Strategies = clock skew, jitter and clock distribution
#Design Methodology
VLSI Design Flow = specification, RTL, synthesis, place and route
Verilog HDL Modelling = behavioural, dataflow and structural modelling
FPGA Architecture = configurable logic blocks and programmable routing
Design for Testability = scan chains and built-in self-test

@EC403|Digital Signal Processing|7|ECE|nd|EC
#DFT and FFT
Discrete Fourier Transform = N frequency samples of a finite sequence
Properties of DFT = circular convolution, periodicity and symmetry
Radix-2 DIT FFT = decimation-in-time butterfly computation
Radix-2 DIF FFT = decimation-in-frequency algorithm
#IIR Filter Design
Butterworth Filter = maximally flat magnitude response
Chebyshev Filter = equiripple passband with a sharper cutoff
Impulse Invariance Method = sample the analog impulse response
Bilinear Transformation = s = (2/T)(1 − z⁻¹)/(1 + z⁻¹) with frequency warping
#FIR Filter Design
Linear Phase FIR Filters = a symmetric impulse response gives linear phase
Window Method = rectangular, Hamming, Hanning and Blackman windows
Frequency Sampling Method = specify the desired response at DFT points
Gibbs Phenomenon = ripples caused by truncating the ideal response
#Filter Structures and Finite Word Length
Direct Form Realizations = direct form I and direct form II structures
Cascade and Parallel Forms = second-order sections for robustness
Quantization Effects in Filters = coefficient quantisation and rounding noise
Limit Cycle Oscillations = oscillations caused by rounding in IIR filters
#Multirate Signal Processing
Decimation = downsampling preceded by an anti-aliasing filter
Interpolation = upsampling followed by an anti-imaging filter
Polyphase Decomposition = efficient implementation of multirate filters
DSP Processor Architecture = Harvard architecture, MAC unit and pipelining

@EC405|Wireless Communication|7|ECE|tn|EC
#Cellular Concepts
Frequency Reuse = the same frequencies are reused in distant cells with cluster size N
Handoff Strategies = hard and soft handoff between cells
Co-Channel Interference = signal-to-interference ratio depends on the reuse distance
Cell Splitting and Sectoring = increase capacity in busy areas
#Mobile Radio Propagation
Free Space Path Loss = Friis equation; loss grows with distance squared
Two-Ray Ground Reflection Model = path loss proportional to d⁴ at large distances
Okumura and Hata Models = empirical prediction of urban path loss
Small-Scale Fading = multipath fading with Rayleigh and Rician distributions
#Fading and Diversity
Doppler Shift and Coherence Time = fd = (v/λ) cos θ
Delay Spread and Coherence Bandwidth = flat versus frequency-selective fading
Diversity Techniques = space, frequency and time diversity
Diversity Combining = selection, equal gain and maximal ratio combining
#Multiple Access
FDMA and TDMA = divide the spectrum by frequency or by time slots
CDMA and Spread Spectrum = codes separate users, with DSSS and FHSS
OFDM = orthogonal subcarriers with a cyclic prefix combat multipath
MIMO Systems = multiple antennas increase capacity
#Wireless Standards
GSM Architecture = mobile station, base station subsystem and network switching subsystem
4G LTE = OFDMA downlink and SC-FDMA uplink
5G NR Features = mmWave bands, massive MIMO and network slicing
Wi-Fi Standards = IEEE 802.11 a/b/g/n/ac/ax

@ME401|Finite Element Methods|7|ME|nd|ME
#FEM Fundamentals
Weighted Residual Methods = the Galerkin method makes the residual orthogonal to the weights
Rayleigh-Ritz Method = approximate solution that minimises potential energy
Minimum Potential Energy Principle = equilibrium occurs at stationary potential energy
Steps in FEM = discretise, form element equations, assemble and solve
#One-Dimensional Elements
Bar Element Stiffness Matrix = k = (AE/L)[1 −1; −1 1]
Linear Shape Functions = N1 = 1 − x/L and N2 = x/L
Global Stiffness Assembly = add element matrices at shared nodes
Boundary Conditions in FEM = elimination and penalty methods
#Trusses and Beams
Plane Truss Analysis = transform the local stiffness with direction cosines
Beam Element = Hermite shape functions for deflection and slope
Thermal Load in Bars = temperature change produces a thermal load vector
Quadratic Bar Elements = three-node elements for better accuracy
#Two-Dimensional Elements
Constant Strain Triangle = three-node triangle with constant strain
Plane Stress and Plane Strain = two-dimensional elasticity assumptions
Isoparametric Formulation = the same shape functions describe geometry and displacement
Gauss Quadrature = numerical integration with Gauss points and weights
#Dynamic and Thermal Analysis
Mass Matrix = consistent and lumped mass formulations
Natural Frequencies by FEM = solve det(K − ω²M) = 0
1D Heat Conduction Elements = conductance matrix for fins and walls
Mesh Convergence = h and p refinement improve accuracy

@ME403|Refrigeration and Air Conditioning|7|ME|n|ME
#Refrigeration Basics
Coefficient of Performance = COP = refrigerating effect / work input
Reversed Carnot Cycle = ideal refrigerator with COP = TL/(TH − TL)
Bell-Coleman Cycle = air refrigeration cycle used for aircraft cooling
Ton of Refrigeration = 1 TR = 3.5 kW
#Vapour Compression
Vapour Compression Cycle = compressor, condenser, expansion valve and evaporator
Subcooling and Superheating = their effect on COP and refrigerating effect
p-h Chart Analysis = plot the cycle on a pressure-enthalpy chart
Multi-Stage Compression = intercooling reduces compressor work
#Vapour Absorption and Refrigerants
Vapour Absorption System = ammonia-water and lithium bromide-water systems
Electrolux Refrigerator = three-fluid system with no moving parts
Refrigerant Designation = naming such as R-134a and R-410A
Environmental Impact of Refrigerants = ODP and GWP and the phase-out of CFCs
#Psychrometry
Psychrometric Properties = dry bulb, wet bulb, dew point and relative humidity
Psychrometric Chart = graphical properties of moist air
Psychrometric Processes = sensible heating and cooling, humidification and dehumidification
Bypass Factor = fraction of air that does not contact the coil
#Air Conditioning Systems
Comfort Conditions = effective temperature and the comfort chart
Cooling Load Calculation = sensible and latent heat gains
Air Conditioning System Types = window, split, central and VRF systems
Duct Design = equal friction method

@ME405|Automobile Engineering|7|ME|t|ME
#Vehicle Structure and Engines
Chassis and Body Construction = separate frame versus unibody construction
Engine Components = cylinder block, piston, crankshaft and valve train
Fuel Injection Systems = MPFI and common rail direct injection
Engine Cooling and Lubrication = radiator, thermostat and oil pump
#Transmission
Clutch Types = single plate, multi-plate and centrifugal clutches
Gearbox Types = sliding mesh, constant mesh and synchromesh
Automatic Transmission = torque converter and planetary gear sets
Differential = lets the driven wheels turn at different speeds on a curve
#Steering and Suspension
Steering Geometry = camber, caster, king-pin inclination and toe-in
Ackermann Steering Mechanism = the inner wheel turns more for true rolling
Suspension Systems = leaf spring, coil spring and MacPherson strut
Shock Absorbers = hydraulic dampers control spring oscillations
#Brakes and Wheels
Hydraulic Brakes = Pascal's law transmits the pedal force
Disc and Drum Brakes = calipers versus brake shoes
Anti-Lock Braking System = prevents wheel lock-up under hard braking
Tyres and Wheel Alignment = tyre designation and alignment angles
#Electrical and Modern Systems
Battery and Starting System = lead-acid battery and starter motor
Ignition Systems = battery, magneto and electronic ignition
Electric and Hybrid Vehicles = series and parallel hybrid layouts and battery packs
Emission Control = catalytic converter, EGR and Bharat Stage norms

@ME407|Mechatronics|7|ME|tn|ME
#Sensors
Mechatronic System Elements = sensors, actuators, controllers and interfaces
Displacement Sensors = LVDT, potentiometer and encoders
Strain Gauges and Load Cells = resistance changes with strain, read with a Wheatstone bridge
Temperature Sensors = thermocouples, RTDs and thermistors
#Actuators
Pneumatic and Hydraulic Actuators = cylinders and directional control valves
DC Motor Drives = speed control through PWM and an H-bridge
Stepper Motors = positioning in discrete step angles
Servo Motors = closed-loop position control
#Signal Conditioning
Operational Amplifiers = inverting, non-inverting and differential amplifiers
Filtering and Amplification = remove noise from sensor signals
Analog to Digital Conversion = resolution, sampling and quantisation
Data Acquisition Systems = multiplexing and sample-and-hold
#Programmable Logic Controllers
PLC Architecture = CPU, input and output modules and power supply
Ladder Logic Programming = contacts, coils and rungs
PLC Timers and Counters = TON, TOF and counting functions
PLC Applications = traffic light and conveyor control
#Mechatronic System Design
Microcontroller Interfacing = GPIO, interrupts and timers for control
Modelling Mechatronic Systems = mechanical, electrical and fluid building blocks
Closed-Loop Control in Mechatronics = feedback with PID controllers
Mechatronics Case Studies = robot arm, washing machine and engine management
`;

/* Cross-course prerequisite edges: "COURSE:Concept < COURSE:Prerequisite concept" */
G.CROSS_PREREQS = `
MA201:Solving ODEs using Laplace Transform < MA101:Higher-Order Linear ODEs with Constant Coefficients
MA201:Euler's Formulae for Fourier Coefficients < MA101:Double Integrals
CS201:Singly Linked List < CS101:Pointer Basics and Arithmetic
CS201:Stack Operations < CS101:One-Dimensional Arrays
CS201:Recurrence Relations for Algorithms < CS101:Recursion
CS207:Carry Lookahead Adder < DE201:Adders and Subtractors
CS207:Memory Hierarchy < DE201:Shift Registers
EC201:Thevenin and Norton Theorems < EE101:Thevenin's Theorem
EC201:RLC Transient Response < MA101:Higher-Order Linear ODEs with Constant Coefficients
EC205:Continuous-Time Fourier Series < MA201:Euler's Formulae for Fourier Coefficients
EC205:Transfer Function of LTI Systems < MA201:Laplace Transform of Standard Functions
CS301:Paging < CS207:Virtual Memory and Paging
CS305:Merge Sort < CS201:Asymptotic Notation
CS305:Dijkstra's Shortest Path < CS201:Graph Representation
CS303:Indexing and B+ Trees < CS201:Binary Search Tree
CT301:Transfer Function < MA201:Laplace Transform of Standard Functions
EC301:Frequency Modulation < EC205:Continuous-Time Fourier Transform
ME301:Fourier's Law of Conduction < ME201:Work and Heat Transfer
ME305:Theories of Failure < ME203:Hooke's Law and Elastic Constants
ME305:Shaft Design for Combined Loading < ME203:Torsion of Circular Shafts
CS401:Principal Component Analysis < MA101:Eigenvalues and Eigenvectors
CS401:Gradient Descent < MA101:Partial Derivatives
CS403:Regular Expression to NFA < CS205:Propositional Logic
CS405:RSA Algorithm < CS205:Groups and Subgroups
EC403:Discrete Fourier Transform < EC205:Discrete-Time Fourier Transform
EC405:OFDM < CN301:Medium Access Control
ME401:Bar Element Stiffness Matrix < ME203:Hooke's Law and Elastic Constants
ME403:Vapour Compression Cycle < ME201:Carnot Cycle
ME407:DC Motor Drives < EE101:DC Motor Principle
`;
