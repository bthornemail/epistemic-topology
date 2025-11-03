;;; ========================================
;;; DANL Core: Decentralized Automaton Network Lattice
;;; R5RS Scheme Implementation
;;; ========================================
;;; Authors: Brian James Thorne, Claude (Anthropic)
;;; Version: 1.0
;;; License: MIT
;;; ========================================

;;; Required R5RS libraries
(load "srfi-1.scm")   ; List library
(load "srfi-9.scm")   ; Records

;;; ========================================
;;; PART 1: Y/Z-COMBINATORS
;;; ========================================

;; Y-Combinator (lazy evaluation - normal order)
;; Y = λf.(λx.f(x x))(λx.f(x x))
(define Y
  (lambda (f)
    ((lambda (x) (f (lambda (y) ((x x) y))))
     (lambda (x) (f (lambda (y) ((x x) y)))))))

;; Z-Combinator (strict evaluation - applicative order)
;; Z = λf.(λx.f(λv.(x x)v))(λx.f(λv.(x x)v))
(define Z
  (lambda (f)
    ((lambda (x) (f (lambda (v) ((x x) v))))
     (lambda (x) (f (lambda (v) ((x x) v)))))))

;; Example: Factorial via Y-combinator
(define factorial
  (Y (lambda (fact)
       (lambda (n)
         (if (<= n 1)
             1
             (* n (fact (- n 1))))))))

;; Example: Fibonacci via Z-combinator (strict)
(define fibonacci
  (Z (lambda (fib)
       (lambda (n)
         (cond
           [(<= n 0) 0]
           [(= n 1) 1]
           [else (+ (fib (- n 1)) (fib (- n 2)))])))))

;;; ========================================
;;; PART 2: EPISTEMIC STATE RECORDS
;;; ========================================

;; Raw epistemic state (before observable parameterization)
(define-record-type epistemic-state
  (make-epistemic kk ku uk uu)
  epistemic?
  (kk epistemic-kk epistemic-kk-set!)
  (ku epistemic-ku epistemic-ku-set!)
  (uk epistemic-uk epistemic-uk-set!)
  (uu epistemic-uu epistemic-uu-set!))

;; Observable epistemic parameters (for estimation)
(define-record-type observable-epistemic
  (make-observable-epistemic kk ku tau-uk tau-uu phi v)
  observable-epistemic?
  (kk observable-kk)
  (ku observable-ku)
  (tau-uk observable-tau-uk)  ; UK·φ(V) - maintains observability!
  (tau-uu observable-tau-uu)  ; UU·(V/φ(V)) - scaled
  (phi geometric-phi)
  (v geometric-v))

;;; ========================================
;;; PART 3: EULER PHI AND NUMBER THEORY
;;; ========================================

;; Euler's totient function φ(n)
;; Counts integers ≤ n that are coprime to n
(define (euler-phi n)
  (let loop ((n n) (p 2) (result n))
    (cond
      [(> (* p p) n)
       (if (> n 1)
           (- result (quotient result n))
           result)]
      [(= (modulo n p) 0)
       (let inner-loop ((n n))
         (if (= (modulo n p) 0)
             (inner-loop (quotient n p))
             (loop n (+ p 1) (- result (quotient result p)))))]
      [else (loop n (+ p 1) result)])))

;; Inner dimension: V/φ(V)
(define (inner-dimension v)
  (/ v (euler-phi v)))

;; Test Euler phi
(define (test-euler-phi)
  (display "Testing Euler phi:\n")
  (for-each
    (lambda (n)
      (let ((phi (euler-phi n)))
        (display (string-append
                  "φ(" (number->string n) ") = "
                  (number->string phi) "\n"))))
    '(4 8 12 20 120)))

;;; ========================================
;;; PART 4: OBSERVABLE PARAMETERIZATION
;;; ========================================

;; Parameterize epistemic state for observability
;; This maintains sensitivity across all geometric levels!
(define (parameterize-epistemic epistemic vertices)
  (let* ((phi (euler-phi vertices))
         (inner-dim (inner-dimension vertices))
         (kk (epistemic-kk epistemic))
         (ku (epistemic-ku epistemic))
         (uk (epistemic-uk epistemic))
         (uu (epistemic-uu epistemic)))
    (make-observable-epistemic
      kk                    ; Directly observable (like tX)
      ku                    ; Directly observable (like tY)
      (* uk phi)            ; UK·φ(V) product (like tZ·β)
      (* uu inner-dim)      ; UU·(V/φ(V)) scaled
      phi
      vertices)))

;; Recover true epistemic state after estimation
(define (recover-epistemic observable)
  (let ((phi (geometric-phi observable))
        (v (geometric-v observable))
        (kk (observable-kk observable))
        (ku (observable-ku observable))
        (tau-uk (observable-tau-uk observable))
        (tau-uu (observable-tau-uu observable)))
    (make-epistemic
      kk                          ; Direct
      ku                          ; Direct
      (/ tau-uk phi)              ; Recover UK = τ_UK / φ(V)
      (/ tau-uu (inner-dimension v))  ; Recover UU
      )))

;;; ========================================
;;; PART 5: SENSITIVITY ANALYSIS
;;; ========================================

;; Sensitivity to observable product τ_UK
;; ∂C/∂τ_UK = -1/(1 + τ_UK/KK)²
;; This stays BOUNDED regardless of φ(V)!
(define (sensitivity-to-tau-uk kk tau-uk)
  (if (= kk 0)
      0
      (- (/ 1 (expt (+ 1 (/ tau-uk kk)) 2)))))

;; Sensitivity to direct UK (for comparison)
;; ∂C/∂UK = -φ/(1 + τ_UK/KK)²
;; This DEGENERATES as φ → 0
(define (sensitivity-to-direct-uk kk tau-uk phi)
  (if (= kk 0)
      0
      (- (/ phi (expt (+ 1 (/ tau-uk kk)) 2)))))

;; Compute sensitivity ratio (should equal φ)
(define (sensitivity-ratio kk tau-uk phi)
  (let ((sens-uk (sensitivity-to-direct-uk kk tau-uk phi))
        (sens-tau (sensitivity-to-tau-uk kk tau-uk)))
    (if (= sens-tau 0)
        0
        (/ sens-uk sens-tau))))

;; Test observable parameterization
(define (test-observable-parameterization vertices)
  (let* ((epistemic (make-epistemic 100 50 30 20))
         (observable (parameterize-epistemic epistemic vertices))
         (phi (geometric-phi observable))
         (kk (observable-kk observable))
         (tau-uk (observable-tau-uk observable))
         (sens-tau (sensitivity-to-tau-uk kk tau-uk))
         (sens-uk (sensitivity-to-direct-uk kk tau-uk phi))
         (ratio (sensitivity-ratio kk tau-uk phi)))
    (display (string-append
              "V=" (number->string vertices)
              ", φ=" (number->string phi)
              ", Sens(τ_UK)=" (number->string sens-tau)
              ", Sens(UK)=" (number->string sens-uk)
              ", Ratio=" (number->string ratio)
              " (theory: φ=" (number->string phi) ")\n"))))

;;; ========================================
;;; PART 6: M-EXPRESSIONS (Meta-language)
;;; ========================================

;; M-expression record (commands)
(define-record-type m-expr
  (make-m-expr functor args)
  m-expr?
  (functor m-expr-functor)
  (args m-expr-args))

;; Parse M-expression from string
;; Format: "functor[arg1; arg2; arg3]"
(define (parse-m-expr str)
  (let* ((open-bracket (string-index str #\[))
         (close-bracket (string-index str #\]))
         (functor (substring str 0 open-bracket))
         (args-str (substring str (+ open-bracket 1) close-bracket))
         (args (string-split args-str #\;)))
    (make-m-expr (string->symbol functor)
                (map string-trim args))))

;; String utilities (R5RS compatible)
(define (string-index str char)
  (let loop ((i 0))
    (cond
      [(>= i (string-length str)) #f]
      [(char=? (string-ref str i) char) i]
      [else (loop (+ i 1))])))

(define (string-split str delim)
  (let loop ((i 0) (start 0) (result '()))
    (cond
      [(>= i (string-length str))
       (reverse (cons (substring str start i) result))]
      [(char=? (string-ref str i) delim)
       (loop (+ i 1) (+ i 1)
             (cons (substring str start i) result))]
      [else (loop (+ i 1) start result)])))

(define (string-trim str)
  (let* ((len (string-length str))
         (start (let loop ((i 0))
                  (if (or (>= i len)
                          (not (char-whitespace? (string-ref str i))))
                      i
                      (loop (+ i 1)))))
         (end (let loop ((i (- len 1)))
                (if (or (< i 0)
                        (not (char-whitespace? (string-ref str i))))
                    (+ i 1)
                    (loop (- i 1))))))
    (substring str start end)))

;;; ========================================
;;; PART 7: S-EXPRESSIONS (Object-language)
;;; ========================================

;; S-expression record (events)
(define-record-type s-expr
  (make-s-expr type data timestamp vclock)
  s-expr?
  (type s-expr-type)
  (data s-expr-data)
  (timestamp s-expr-timestamp)
  (vclock s-expr-vclock))

;; Vector clock record
(define-record-type vector-clock
  (make-vector-clock clocks)
  vector-clock?
  (clocks vclock-clocks vclock-clocks-set!))

;; Create initial vector clock
(define (make-initial-vclock nodes)
  (make-vector-clock
    (map (lambda (node) (cons node 0)) nodes)))

;; Increment vector clock for node
(define (increment-vclock vclock node)
  (make-vector-clock
    (map (lambda (entry)
           (if (eq? (car entry) node)
               (cons (car entry) (+ (cdr entry) 1))
               entry))
         (vclock-clocks vclock))))

;; Vector clock ordering
(define (vclock-less-equal? vc1 vc2)
  (and (every (lambda (entry1)
                (let ((node (car entry1))
                      (time1 (cdr entry1)))
                  (let ((entry2 (assoc node (vclock-clocks vc2))))
                    (if entry2
                        (<= time1 (cdr entry2))
                        #f))))
              (vclock-clocks vc1))
       (not (vclock-equal? vc1 vc2))))

(define (vclock-equal? vc1 vc2)
  (every (lambda (entry1)
           (let ((node (car entry1))
                 (time1 (cdr entry1)))
             (let ((entry2 (assoc node (vclock-clocks vc2))))
               (if entry2
                   (= time1 (cdr entry2))
                   #f))))
         (vclock-clocks vc1)))

;; Helper: every predicate
(define (every pred lst)
  (or (null? lst)
      (and (pred (car lst))
           (every pred (cdr lst)))))

;;; ========================================
;;; PART 8: M→S COMPILER
;;; ========================================

;; Compilation functor Φ: M-Expr → S-Expr
(define (compile-m-expr m-expr state)
  (case (m-expr-functor m-expr)
    
    ;; createBinding[id; scope] → (binding-created id scope timestamp)
    [(createBinding)
     (let ((id (car (m-expr-args m-expr)))
           (scope (cadr (m-expr-args m-expr))))
       (if (validate-hygienic id scope state)
           (make-s-expr 'binding-created
                       (list id scope)
                       (current-timestamp state)
                       (state-vclock state))
           (error "Hygiene violation")))]
    
    ;; enterScope[sid] → (scope-entered sid parent timestamp)
    [(enterScope)
     (let ((sid (car (m-expr-args m-expr)))
           (parent (current-scope state)))
       (make-s-expr 'scope-entered
                   (list sid parent)
                   (current-timestamp state)
                   (state-vclock state)))]
    
    ;; callRPC[node; method; args] → (rpc-called node method args vclock t)
    [(callRPC)
     (let ((node (string->symbol (car (m-expr-args m-expr))))
           (method (string->symbol (cadr (m-expr-args m-expr))))
           (args (cddr (m-expr-args m-expr))))
       (if (validate-causal node state)
           (make-s-expr 'rpc-called
                       (list node method args)
                       (current-timestamp state)
                       (increment-vclock (state-vclock state) node))
           (error "Causality violation")))]
    
    ;; query[predicate; args] → (query-result predicate result timestamp)
    [(query)
     (let ((predicate (string->symbol (car (m-expr-args m-expr))))
           (args (cdr (m-expr-args m-expr))))
       (make-s-expr 'query-result
                   (list predicate args)
                   (current-timestamp state)
                   (state-vclock state)))]
    
    [else (error "Unknown M-expression")]))

;; State record (for compilation context)
(define-record-type state
  (make-state timestamp vclock scope bindings)
  state?
  (timestamp state-timestamp state-timestamp-set!)
  (vclock state-vclock state-vclock-set!)
  (scope current-scope current-scope-set!)
  (bindings state-bindings state-bindings-set!))

;; Validation predicates
(define (validate-hygienic id scope state)
  ;; Check if binding is hygienic (not shadowing)
  (not (assoc id (state-bindings state))))

(define (validate-causal node state)
  ;; Check if node is reachable in causal graph
  #t)  ; Simplified for now

(define (current-timestamp state)
  (state-timestamp state))

;;; ========================================
;;; PART 9: EVENT STORE (Homoiconic)
;;; ========================================

;; Event store: immutable list of S-expressions
(define-record-type event-store
  (make-event-store events)
  event-store?
  (events store-events store-events-set!))

;; Create empty event store
(define (make-empty-store)
  (make-event-store '()))

;; Append event (immutable)
(define (event-store-append store s-expr)
  (make-event-store
    (append (store-events store) (list s-expr))))

;; Replay events to reconstruct state
;; HOMOICONIC: S-expressions ARE executable!
(define (replay-events store initial-state)
  (fold (lambda (event state)
          (apply-event state event))
        initial-state
        (store-events store)))

;; Apply single event to state
(define (apply-event state s-expr)
  (case (s-expr-type s-expr)
    [(binding-created)
     (let ((id (car (s-expr-data s-expr)))
           (scope (cadr (s-expr-data s-expr))))
       (add-binding state id scope))]
    
    [(scope-entered)
     (let ((sid (car (s-expr-data s-expr)))
           (parent (cadr (s-expr-data s-expr))))
       (enter-scope state sid parent))]
    
    [(rpc-called)
     (let ((node (car (s-expr-data s-expr)))
           (method (cadr (s-expr-data s-expr)))
           (args (caddr (s-expr-data s-expr))))
       (execute-rpc state node method args))]
    
    [(query-result)
     state]  ; Queries don't modify state
    
    [else state]))

;; State manipulation
(define (add-binding state id scope)
  (make-state
    (state-timestamp state)
    (state-vclock state)
    (current-scope state)
    (cons (cons id scope) (state-bindings state))))

(define (enter-scope state sid parent)
  (make-state
    (state-timestamp state)
    (state-vclock state)
    sid
    (state-bindings state)))

(define (execute-rpc state node method args)
  ;; Simplified RPC execution
  state)

;;; ========================================
;;; PART 10: TROPICAL ALGEBRA (Max-Plus)
;;; ========================================

;; Max-Plus addition: a ⊕ b = max(a,b)
(define (max-plus-add a b)
  (max a b))

;; Max-Plus multiplication: a ⊗ b = a + b
(define (max-plus-multiply a b)
  (if (or (= a -inf.0) (= b -inf.0))
      -inf.0
      (+ a b)))

;; Max-Plus matrix-vector multiplication
(define (max-plus-matvec matrix vector)
  (map (lambda (row)
         (fold (lambda (a x result)
                 (max-plus-add result (max-plus-multiply a x)))
               -inf.0
               row vector))
       matrix))

;; Max-Plus matrix-matrix multiplication
(define (max-plus-matmul A B)
  (let ((n (length A))
        (m (length (car A)))
        (p (length (car B))))
    (map (lambda (i)
           (map (lambda (j)
                  (fold (lambda (k result)
                          (max-plus-add result
                            (max-plus-multiply (list-ref (list-ref A i) k)
                                             (list-ref (list-ref B k) j))))
                        -inf.0
                        (iota m)))
                (iota p)))
         (iota n))))

;; Tropical eigenvalue (Karp's algorithm)
(define (tropical-eigenvalue matrix iterations)
  (let* ((n (length matrix))
         (dp (make-vector (+ iterations 1)
                         (make-vector n -inf.0))))
    ;; Base case: dp[0][i] = 0
    (vector-set! dp 0 (make-vector n 0))
    
    ;; Fill DP table
    (do ((k 1 (+ k 1)))
        ((> k iterations))
      (vector-set! dp k
        (max-plus-matvec matrix (vector-ref dp (- k 1)))))
    
    ;; Compute eigenvalue
    (let loop ((i 0) (lambda-max -inf.0))
      (if (>= i n)
          lambda-max
          (let inner ((k 0) (lambda-max lambda-max))
            (if (>= k iterations)
                (loop (+ i 1) lambda-max)
                (let ((dpn (vector-ref (vector-ref dp iterations) i))
                      (dpk (vector-ref (vector-ref dp k) i)))
                  (if (> dpn -inf.0)
                      (inner (+ k 1)
                             (max lambda-max
                                  (/ (- dpn dpk) (- iterations k))))
                      (inner (+ k 1) lambda-max)))))))))

;; Helper: iota
(define (iota n)
  (let loop ((i 0) (result '()))
    (if (>= i n)
        (reverse result)
        (loop (+ i 1) (cons i result)))))

;;; ========================================
;;; PART 11: LATTICE OPERATIONS
;;; ========================================

;; Lattice join (least upper bound)
(define (lattice-join states)
  (if (null? states)
      (make-epistemic 0 0 0 +inf.0)  ; Bottom element
      (fold (lambda (s1 s2)
              (make-epistemic
                (max (epistemic-kk s1) (epistemic-kk s2))
                (max (epistemic-ku s1) (epistemic-ku s2))
                (max (epistemic-uk s1) (epistemic-uk s2))
                (min (epistemic-uu s1) (epistemic-uu s2))))
            (car states)
            (cdr states))))

;; Lattice meet (greatest lower bound)
(define (lattice-meet states)
  (if (null? states)
      (make-epistemic +inf.0 +inf.0 +inf.0 0)  ; Top element
      (fold (lambda (s1 s2)
              (make-epistemic
                (min (epistemic-kk s1) (epistemic-kk s2))
                (min (epistemic-ku s1) (epistemic-ku s2))
                (min (epistemic-uk s1) (epistemic-uk s2))
                (max (epistemic-uu s1) (epistemic-uu s2))))
            (car states)
            (cdr states))))

;; Epistemic ordering: s1 ≤ s2
(define (epistemic-less-equal? s1 s2)
  (and (<= (epistemic-kk s1) (epistemic-kk s2))
       (<= (epistemic-ku s1) (epistemic-ku s2))
       (<= (epistemic-uk s1) (epistemic-uk s2))
       (>= (epistemic-uu s1) (epistemic-uu s2))))

;;; ========================================
;;; PART 12: GEOMETRIC CONSENSUS
;;; ========================================

;; Geometric thresholds from Platonic solids
(define geometric-thresholds
  '((tetrahedron . 0.75)
    (cube . 0.50)
    (octahedron . 0.50)
    (icosahedron . 0.25)
    (dodecahedron . 0.25)
    (600-cell . 0.025)))

(define (geometric-threshold geometry)
  (cdr (assoc geometry geometric-thresholds)))

;; Determine geometric level from certainty and size
(define (determine-geometric-level certainty size)
  (cond
    [(and (> certainty 0.7) (<= size 4)) 'tetrahedron]
    [(and (> certainty 0.4) (<= size 8)) 'cube]
    [(<= size 12) 'icosahedron]
    [(<= size 20) 'dodecahedron]
    [else '600-cell]))

;; Check consensus
(define (consensus-achieved? agreeing total geometry)
  (>= (/ agreeing total) (geometric-threshold geometry)))

;;; ========================================
;;; PART 13: AUTOMATON RECORD
;;; ========================================

(define-record-type automaton
  (make-automaton id epistemic vclock continuations events)
  automaton?
  (id automaton-id)
  (epistemic automaton-epistemic automaton-epistemic-set!)
  (vclock automaton-vclock automaton-vclock-set!)
  (continuations automaton-continuations)
  (events automaton-events automaton-events-set!))

;; Automaton step (Max-Plus transition)
(define (automaton-step automaton hypergraph)
  (let* ((current-clock (vclock-clocks (automaton-vclock automaton)))
         (id (automaton-id automaton))
         (neighbors (hypergraph-neighbors hypergraph id))
         (neighbor-clocks (map (lambda (n)
                                 (vclock-clocks (automaton-vclock n)))
                              neighbors))
         (new-clock (max-plus-synchronize current-clock neighbor-clocks)))
    (automaton-vclock-set! automaton (make-vector-clock new-clock))
    automaton))

;; Max-Plus synchronization
(define (max-plus-synchronize current neighbors)
  (if (null? neighbors)
      current
      (map (lambda (entry)
             (cons (car entry)
                   (fold (lambda (neighbor-clock result)
                           (let ((neighbor-time
                                   (cdr (assoc (car entry) neighbor-clock))))
                             (if neighbor-time
                                 (max result neighbor-time)
                                 result)))
                         (cdr entry)
                         neighbors)))
           current)))

;;; ========================================
;;; PART 14: HYPERGRAPH STRUCTURE
;;; ========================================

(define-record-type hypergraph
  (make-hypergraph vertices edges)
  hypergraph?
  (vertices hypergraph-vertices)
  (edges hypergraph-edges))

(define-record-type hyperedge
  (make-hyperedge id members)
  hyperedge?
  (id hyperedge-id)
  (members hyperedge-members))

;; Get neighbors via hyperedges
(define (hypergraph-neighbors hypergraph node-id)
  (let ((edges (hypergraph-edges hypergraph)))
    (fold (lambda (edge acc)
            (if (member node-id (hyperedge-members edge))
                (append (filter (lambda (m) (not (eq? m node-id)))
                               (hyperedge-members edge))
                       acc)
                acc))
          '()
          edges)))

;;; ========================================
;;; PART 15: EPISTEMIC EXPANSION VIA Y-COMBINATOR
;;; ========================================

;; Epistemic expansion until fixed point
(define epistemic-expand
  (Y (lambda (expand)
       (lambda (state depth)
         (if (<= depth 0)
             state
             (let* ((kk (epistemic-kk state))
                    (ku (epistemic-ku state))
                    (uk (epistemic-uk state))
                    (uu (epistemic-uu state))
                    ;; Simulate transitions
                    (new-kk (+ kk (quotient ku 2)))  ; Half of KU becomes KK
                    (new-ku (quotient ku 2))
                    (new-uk (+ uk (quotient uu 4)))  ; Quarter of UU becomes UK
                    (new-uu (- uu (quotient uu 4))))
               (expand (make-epistemic new-kk new-ku new-uk new-uu)
                      (- depth 1))))))))

;; Fixed point detection
(define epistemic-fixed-point
  (Y (lambda (expand)
       (lambda (state)
         (let ((new-state (epistemic-transition state)))
           (if (epistemic-equal? new-state state)
               state
               (expand new-state)))))))

(define (epistemic-transition state)
  (let* ((kk (epistemic-kk state))
         (ku (epistemic-ku state))
         (uk (epistemic-uk state))
         (uu (epistemic-uu state))
         (new-kk (+ kk (quotient ku 2)))
         (new-ku (quotient ku 2))
         (new-uk (+ uk (quotient uu 4)))
         (new-uu (- uu (quotient uu 4))))
    (make-epistemic new-kk new-ku new-uk new-uu)))

(define (epistemic-equal? s1 s2)
  (and (= (epistemic-kk s1) (epistemic-kk s2))
       (= (epistemic-ku s1) (epistemic-ku s2))
       (= (epistemic-uk s1) (epistemic-uk s2))
       (= (epistemic-uu s1) (epistemic-uu s2))))

;;; ========================================
;;; PART 16: TEST SUITE
;;; ========================================

(define (run-tests)
  (display "=== DANL R5RS Scheme Core Tests ===\n\n")
  
  ;; Test Y-combinator
  (display "Test 1: Y-Combinator Factorial\n")
  (display (string-append "factorial(5) = "
                         (number->string (factorial 5)) "\n"))
  (display (string-append "Expected: 120\n\n"))
  
  ;; Test Z-combinator
  (display "Test 2: Z-Combinator Fibonacci\n")
  (display (string-append "fibonacci(10) = "
                         (number->string (fibonacci 10)) "\n"))
  (display (string-append "Expected: 55\n\n"))
  
  ;; Test Euler phi
  (display "Test 3: Euler Phi Function\n")
  (test-euler-phi)
  (display "\n")
  
  ;; Test observable parameterization
  (display "Test 4: Observable Parameterization\n")
  (for-each test-observable-parameterization '(4 8 12 20 120))
  (display "\n")
  
  ;; Test M-expression parsing
  (display "Test 5: M-Expression Parsing\n")
  (let ((m-expr (parse-m-expr "createBinding[x; global]")))
    (display (string-append "Functor: "
                           (symbol->string (m-expr-functor m-expr)) "\n"))
    (display (string-append "Args: "
                           (car (m-expr-args m-expr)) ", "
                           (cadr (m-expr-args m-expr)) "\n\n")))
  
  ;; Test lattice operations
  (display "Test 6: Lattice Join\n")
  (let* ((s1 (make-epistemic 10 5 3 20))
         (s2 (make-epistemic 8 7 5 15))
         (joined (lattice-join (list s1 s2))))
    (display (string-append "State 1: KK=" (number->string (epistemic-kk s1))
                           " KU=" (number->string (epistemic-ku s1))
                           " UK=" (number->string (epistemic-uk s1))
                           " UU=" (number->string (epistemic-uu s1)) "\n"))
    (display (string-append "State 2: KK=" (number->string (epistemic-kk s2))
                           " KU=" (number->string (epistemic-ku s2))
                           " UK=" (number->string (epistemic-uk s2))
                           " UU=" (number->string (epistemic-uu s2)) "\n"))
    (display (string-append "Join:    KK=" (number->string (epistemic-kk joined))
                           " KU=" (number->string (epistemic-ku joined))
                           " UK=" (number->string (epistemic-uk joined))
                           " UU=" (number->string (epistemic-uu joined)) "\n\n")))
  
  ;; Test consensus
  (display "Test 7: Geometric Consensus\n")
  (for-each
    (lambda (config)
      (let ((agreeing (car config))
            (total (cadr config))
            (geometry (caddr config)))
        (display (string-append
                  (symbol->string geometry) ": "
                  (number->string agreeing) "/" (number->string total)
                  " = " (if (consensus-achieved? agreeing total geometry)
                           "CONSENSUS" "NO CONSENSUS")
                  "\n"))))
    '((3 4 tetrahedron)
      (2 4 tetrahedron)
      (4 12 icosahedron)
      (2 12 icosahedron)))
  
  (display "\n=== All Tests Complete ===\n"))

;;; ========================================
;;; MAIN ENTRY POINT
;;; ========================================

(define (main)
  (display "\n")
  (display "╔════════════════════════════════════════════════════════════╗\n")
  (display "║  DANL: Decentralized Automaton Network Lattice            ║\n")
  (display "║  R5RS Scheme Core Implementation                          ║\n")
  (display "║  Version 1.0                                              ║\n")
  (display "╚════════════════════════════════════════════════════════════╝\n")
  (display "\n")
  
  (run-tests))

;; Run main if loaded directly
(main)

;;; EOF
