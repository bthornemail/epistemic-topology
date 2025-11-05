;; Refined Unified R5RS Implementation: Polynomial Canvas with Evaluation Encoding
;;
;; Incorporates refinements from "Untitled 1.md":
;; 1. Enhanced Evaluation Engine with continuations
;; 2. Dynamic Polynomial Analysis (Church numerals from depth, dynamic access patterns)
;; 3. Enhanced Strategy Compilation (compile m-rules to reduction functions, pattern matching)
;; 4. Canvas Output Enhancement (actual JSON string generation)
;; 5. Complete Example with Enhanced Features (advanced program, multi-strategy)
;; 6. Next-Level: Interactive Evaluation and Strategy Composition
;;
;; Maintains unification of polynomial types, M-expression strategies, S-expression traces
;; Remains R5RS compliant with simple match macro

;; Helper: Pattern matching macro (R5RS compatible version)
(define-syntax match
  (syntax-rules ()
    ((_ expr clause ...) (apply (lambda (e) (cond clause ... (else #f))) (list expr)))))

;; PART 1: Polynomial Type Encoding (enhanced with dynamic analysis)

;; 8-Type Polynomial Basis
(define (type-vector expr)
  (match expr
    ((? boolean?)   '#(1 0 0 0 0 0 0 0))  ; boolean
    ((? pair?)      '#(0 1 0 0 0 0 0 0))  ; pair
    ((? symbol?)    '#(0 0 1 0 0 0 0 0))  ; symbol
    ((? number?)    '#(0 0 0 1 0 0 0 0))  ; number
    ((? char?)      '#(0 0 0 0 1 0 0 0))  ; char
    ((? string?)    '#(0 0 0 0 0 1 0 0))  ; string
    ((? vector?)    '#(0 0 0 0 0 0 1 0))  ; vector
    ((? procedure?) '#(0 0 0 0 0 0 0 1))  ; procedure/port
    (else           '#(0 0 0 0 0 0 0 0)))) ; unknown → zero

;; Polynomial addition
(define (poly-add v1 v2)
  (let ((len (vector-length v1)))
    (let loop ((i 0) (result (make-vector len 0)))
      (if (= i len)
          result
          (begin
            (vector-set! result i (+ (vector-ref v1 i) (vector-ref v2 i)))
            (loop (+ i 1) result))))))

;; AST complexity (recursive count)
(define (ast-complexity expr)
  (cond
    ((pair? expr) (poly-add (type-vector expr)
                            (poly-add (ast-complexity (car expr))
                                      (ast-complexity (cdr expr)))))
    (else (type-vector expr))))

;; Network weights (x3 functor for density)
(define (network-weights expr)
  (let ((functor (ast-complexity expr)))
    (poly-add functor (poly-add functor functor))))

;; Refinement 2: Dynamic expression depth for Church numeral
(define (expression-depth expr)
  (cond
    ((pair? expr) (+ 1 (max (expression-depth (car expr))
                            (expression-depth (cdr expr)))))
    (else 0)))

(define (compute-church-numeral expr)
  (string-append "church-" (number->string (expression-depth expr))))

;; Refinement 2: Dynamic access pattern (even multiples of type counts)
(define (compute-access-pattern expr)
  (let ((counts (type-vector expr)))
    (let loop ((i 0) (patterns '()))
      (if (= i 8)
          (string-join (reverse patterns) "-")
          (loop (+ i 1) (cons (number->string (* 2 (vector-ref counts i))) patterns))))))

;; Combinators (as lists for JSON)
(define (y-combinator expr) '("Y" "(λf.(λx.f(x x))(λx.f(x x)))"))
(define (z-combinator expr) '("Z" "(λf.(λx.f(λv.x x v))(λx.f(λv.x x v)))"))
(define (m-combinator expr) '("M" "(define M (λf.(f f)))"))
(define (s-combinator expr) '("S" "(λx.(λy.(λz.(x z)(y z))))"))

;; PART 2: M-Expression Evaluation Encoding (enhanced compilation)

;; M-Expressions as tagged S-expressions
(define (m-expr? x) (and (pair? x) (eq? (car x) 'm-)))

;; Define evaluation strategy as M-expression data
(define (define-strategy name rules)
  `(m-strategy ,name ,rules))

;; Refinement 3: Pattern matching for M-expressions
(define (pattern-match pattern expr)
  (match (list pattern expr)
    ((('m-var (? symbol? var)) any) `((,var . ,any)))
    ((('m-app p1 p2) (? pair? (e1 . e2)))
     (let ((b1 (pattern-match p1 e1))
           (b2 (pattern-match p2 e2)))
       (and b1 b2 (append b1 b2))))
    ((('m-lambda ('m-var (? symbol? var)) body) ('lambda (? symbol? y) m))
     (if (eq? var y)
         `((,var . ,y) (,body . ,m))
         #f))
    ((('m-if pcond pthen pelse) ('if econd ethen eelse))
     (let ((bcond (pattern-match pcond econd))
           (bthen (pattern-match pthen ethen))
           (belse (pattern-match pelse eelse)))
       (and bcond bthen belse (append bcond (append bthen belse)))))
    (((? list? p) (? list? e))
     (if (= (length p) (length e))
         (apply append (map pattern-match p e))
         #f))
    ((p e) (and (equal? p e) '()))
    (else #f)))

;; Refinement 3: Instantiate replacement with bindings
(define (instantiate template bindings)
  (cond
    ((symbol? template) (or (cdr (assq template bindings #f)) template))
    ((pair? template) (cons (instantiate (car template) bindings)
                            (instantiate (cdr template) bindings)))
    (else template)))

;; Refinement 3: Compile single m-rule to reduction function
(define (compile-rule m-rule)
  (match m-rule
    (('m-rule name pattern replacement)
     (lambda (expr)
       (let ((bindings (pattern-match pattern expr)))
         (if bindings
             (instantiate replacement bindings)
             #f))))))

;; Compile entire strategy to list of reducers
(define (compile-strategy m-strat)
  (match m-strat
    (('m-strategy name rules)
     (map compile-rule rules))))

;; Environment operations (enhanced for multi-extend)
(define (extend-env env var val)
  (cons (cons var val) env))

(define (extend-env-multi env vars vals)
  (if (null? vars)
      env
      (extend-env-multi (extend-env env (car vars) (car vals)) (cdr vars) (cdr vals))))

(define (lookup-env env var)
  (let loop ((e env))
    (if (null? e)
        (error "Unbound variable")
        (if (eq? var (caar e))
            (cdar e)
            (loop (cdr e))))))

;; Substitution
(define (subst expr var val)
  (match expr
    ((? symbol? y) (if (eq? var y) val y))
    (('lambda (? symbol? y) m)
     (if (eq? var y)
         `(lambda (,y) ,m)
         `(lambda (,y) ,(subst m var val))))
    ((? pair?) (cons (subst (car expr) var val) (subst (cdr expr) var val)))
    (else expr)))

;; Refinement 1: Enhanced evaluator with continuations and tracing
(define (evaluate expr env reducers kont trace-kont)
  (trace-kont expr env 'enter)
  (match expr
    ((? number? n) (kont n))
    ((? boolean? b) (kont b))
    ((? symbol? x) (kont (lookup-env env x)))
    (('lambda params body)
     (kont (lambda (args k)
             (evaluate body (extend-env-multi env params args) reducers k trace-kont))))
    (('if cond then else)
     (evaluate cond env reducers
               (lambda (test)
                 (trace-kont cond env 'if-test)
                 (evaluate (if test then else) env reducers kont trace-kont))
               trace-kont))
    ((? pair? (op . args))
     (evaluate op env reducers
               (lambda (proc)
                 (trace-kont op env 'apply-op)
                 (eval-args args env reducers
                            (lambda (evaled-args)
                              ;; Apply reducers if applicable
                              (let loop ((rs reducers))
                                (if (null? rs)
                                    (proc evaled-args kont)  ; Normal apply
                                    (let ((reduced ((car rs) expr)))
                                      (if reduced
                                          (evaluate reduced env reducers kont trace-kont)
                                          (loop (cdr rs))))))))
                            trace-kont))
               trace-kont))
    (else (error "Invalid expression"))))

(define (eval-args exprs env reducers kont trace-kont)
  (if (null? exprs)
      (kont '())
      (evaluate (car exprs) env reducers
                (lambda (first)
                  (trace-kont (car exprs) env 'arg-eval)
                  (eval-args (cdr exprs) env reducers
                             (lambda (rest)
                               (kont (cons first rest)))
                             trace-kont))
                trace-kont)))

;; Compile evaluation with tracing
(define (compile-evaluation m-eval)
  (match m-eval
    (('m-evaluation expr strategy env tracing)
     (let* ((reducers (compile-strategy strategy))
            (trace '())
            (trace-kont (if tracing
                            (lambda (e en desc)
                              (set! trace (cons `(step ,desc ,e ,en) trace)))
                            (lambda (e en desc) #f)))
            (result (evaluate expr env reducers (lambda (v) v) trace-kont)))
       `(trace ,@(reverse trace) result ,result)))))

;; Refinement 6: Interactive step-through evaluator
(define (step-evaluate expr env strategy step-callback)
  (let* ((reducers (compile-strategy strategy))
         (steps '())
         (trace-kont (lambda (e en desc)
                       (set! steps (cons `(step ,desc ,e ,en) steps))))
         (result (evaluate expr env reducers (lambda (v) v) trace-kont)))
    (step-callback (reverse steps))
    result))

;; Refinement 6: Strategy composition
(define (compose-strategies . strategies)
  (define-strategy
    (string-append "composed-" (string-join (map cadr strategies) "-"))
    (apply append (map caddr strategies))))

;; PART 3: Unified Canvas Generation with Evaluation (enhanced JSON output)

;; Expr → Canvas Node
(define (expr->canvas-node expr id x y strategy)
  (let* ((monad (type-vector expr))
         (functor (poly-add monad (ast-complexity expr)))
         (perceptron (poly-add functor (network-weights expr)))
         (eval-m `(m-evaluation ,expr ,strategy global-env full-trace))
         (eval-trace (compile-evaluation eval-m)))
    `((id . ,id)
      (type . "text")
      (x . ,x)
      (y . ,y)
      (width . 200)
      (height . 150)
      (text . ,(format "~s" expr))
      (metadata .
       ((r5rs-poly .
         ((monad . ,(vector->list monad))
          (functor . ,(vector->list functor))
          (perceptron . ,(vector->list perceptron))))
        (z .
         ((access . ,(compute-access-pattern expr))
          (interval . ,(compute-church-numeral expr))
          (top . ,(y-combinator expr))
          (right . ,(z-combinator expr))
          (bottom . ,(m-combinator expr))
          (left . ,(s-combinator expr))))
        (evaluation .
         ((strategy . ,(cadr strategy))
          (trace . ,eval-trace)))))))))

;; Program → Transitions
(define (program->transitions program)
  (let loop ((p program) (i 1) (edges '()))
    (if (null? (cdr p))
        (reverse edges)
        (loop (cdr p) (+ i 1)
              (cons `((id . ,(string-append "edge-" (number->string i)))
                      (fromNode . ,(string-append "node-" (number->string i)))
                      (fromSide . "right")
                      (toNode . ,(string-append "node-" (number->string (+ i 1))))
                      (toSide . "left")
                      (metadata .
                       ((transform .
                         ((type . "perceptron-transition")
                          (input-types . ("symbol" "number" "procedure"))
                          (output-types . ("number" "procedure" "boolean"))
                          (weights .
                           ((symbol→number . "church-1")
                            (number→procedure . "church-2")
                            (procedure→boolean . "church-0")))
                          (evaluation-rule . "β-reduction"))))))
                    edges)))))

;; Program → Unified Canvas
(define (program->unified-canvas program strategy)
  (let ((nodes (let loop ((p program) (i 1) (ns '()))
                 (if (null? p)
                     (reverse ns)
                     (loop (cdr p) (+ i 1)
                           (cons (expr->canvas-node (car p) (string-append "node-" (number->string i))
                                                    (* i 250) 100 strategy)
                                 ns))))))
    `((nodes . ,nodes)
      (edges . ,(program->transitions program)))))

;; Refinement 4: Canvas → JSON string
(define (canvas->json canvas)
  (let ((nodes (cdr (assq 'nodes canvas)))
        (edges (cdr (assq 'edges canvas))))
    (string-append
     "{\n"
     "  \"nodes\": [\n"
     (string-join (map node->json nodes) ",\n" 'suffix)
     "  ],\n"
     "  \"edges\": [\n"
     (string-join (map edge->json edges) ",\n" 'suffix)
     "  ]\n"
     "}")))

(define (node->json node)
  (let ((id (cdr (assq 'id node)))
        (type (cdr (assq 'type node)))
        (x (cdr (assq 'x node)))
        (y (cdr (assq 'y node)))
        (width (cdr (assq 'width node)))
        (height (cdr (assq 'height node)))
        (text (cdr (assq 'text node)))
        (metadata (cdr (assq 'metadata node))))
    (string-append
     "    {"
     "\"id\": \"" id "\", "
     "\"type\": \"" type "\", "
     "\"x\": " (number->string x) ", "
     "\"y\": " (number->string y) ", "
     "\"width\": " (number->string width) ", "
     "\"height\": " (number->string height) ", "
     "\"text\": " (string-append "\"" (string-replace text "\"" "\\\"") "\"") ", "
     "\"metadata\": " (metadata->json metadata)
     "}")))

(define (metadata->json metadata)
  (let ((r5rs-poly (cdr (assq 'r5rs-poly metadata)))
        (z (cdr (assq 'z metadata)))
        (evaluation (cdr (assq 'evaluation metadata))))
    (string-append
     "{"
     "\"r5rs-poly\": {"
     "\"monad\": " (list->json (cdr (assq 'monad r5rs-poly))) ", "
     "\"functor\": " (list->json (cdr (assq 'functor r5rs-poly))) ", "
     "\"perceptron\": " (list->json (cdr (assq 'perceptron r5rs-poly)))
     "}, "
     "\"z\": {"
     "\"access\": \"" (cdr (assq 'access z)) "\", "
     "\"interval\": \"" (cdr (assq 'interval z)) "\", "
     "\"top\": " (list->json (cdr (assq 'top z))) ", "
     "\"right\": " (list->json (cdr (assq 'right z))) ", "
     "\"bottom\": " (list->json (cdr (assq 'bottom z))) ", "
     "\"left\": " (list->json (cdr (assq 'left z)))
     "}, "
     "\"evaluation\": {"
     "\"strategy\": \"" (cdr (assq 'strategy evaluation)) "\", "
     "\"trace\": " (list->json (cdr (assq 'trace evaluation)))
     "}"
     "}")))

(define (edge->json edge)
  (let ((id (cdr (assq 'id edge)))
        (fromNode (cdr (assq 'fromNode edge)))
        (fromSide (cdr (assq 'fromSide edge)))
        (toNode (cdr (assq 'toNode edge)))
        (toSide (cdr (assq 'toSide edge)))
        (metadata (cdr (assq 'metadata edge))))
    (string-append
     "    {"
     "\"id\": \"" id "\", "
     "\"fromNode\": \"" fromNode "\", "
     "\"fromSide\": \"" fromSide "\", "
     "\"toNode\": \"" toNode "\", "
     "\"toSide\": \"" toSide "\", "
     "\"metadata\": " (transform->json (cdr (assq 'transform metadata)))
     "}")))

(define (transform->json transform)
  (string-append
   "{"
   "\"type\": \"" (cdr (assq 'type transform)) "\", "
   "\"input-types\": " (list->json (cdr (assq 'input-types transform))) ", "
   "\"output-types\": " (list->json (cdr (assq 'output-types transform))) ", "
   "\"weights\": {"
   "\"symbol→number\": \"" (cdr (assq 'symbol→number (cdr (assq 'weights transform)))) "\", "
   "\"number→procedure\": \"" (cdr (assq 'number→procedure (cdr (assq 'weights transform)))) "\", "
   "\"procedure→boolean\": \"" (cdr (assq 'procedure→boolean (cdr (assq 'weights transform)))) "\""
   "}, "
   "\"evaluation-rule\": \"" (cdr (assq 'evaluation-rule transform)) "\""
   "}"))

(define (list->json lst)
  (string-append
   "["
   (string-join (map (lambda (x)
                       (cond
                         ((number? x) (number->string x))
                         ((string? x) (string-append "\"" x "\""))
                         ((list? x) (list->json x))
                         (else (format "~s" x))))
                     lst)
                ", ")
   "]"))

(define (string-join lst sep . mode)
  (let ((m (if (null? mode) 'infix (car mode))))
    (let loop ((str "") (l lst))
      (if (null? l)
          str
          (loop (string-append str (if (eq? m 'suffix) sep "") (car l) (if (or (eq? m 'infix) (not (null? (cdr l)))) sep ""))
                (cdr l))))))

(define (string-replace str from to)
  (let loop ((s str) (result ""))
    (let ((pos (string-index s from)))
      (if pos
          (loop (substring s (+ pos (string-length from)))
                (string-append result (substring s 0 pos) to))
          (string-append result s)))))

(define (string-index str sub)
  (let loop ((i 0))
    (if (>= i (- (string-length str) (string-length sub)))
        #f
        (if (string=? (substring str i (+ i (string-length sub))) sub)
            i
            (loop (+ i 1))))))

;; Refinement 5: Complete Example with Enhanced Features

;; Example strategies
(define normal-order
  (define-strategy
   "normal-order"
   '((m-rule "β" (m-app (m-lambda (m-var X) (m-var M)) (m-var N))
             (m-subst (m-var M) (m-var X) (m-var N)))
     (m-rule "if-true" (m-if #t (m-var M) (m-var N)) (m-var M))
     (m-rule "if-false" (m-if #f (m-var M) (m-var N)) (m-var N)))))

(define applicative-order
  (define-strategy
   "applicative-order"
   '((m-rule "β" (m-app (m-lambda (m-var X) (m-var M)) (m-var V))
             (m-subst (m-var M) (m-var X) (m-var V))))))

(define lazy-evaluation
  (define-strategy
   "lazy"
   '((m-rule "β-lazy" (m-app (m-lambda (m-var X) (m-var M)) (m-var N))
             (m-subst (m-var M) (m-var X) (m-var N))))))  ; Simplified

;; Refinement 6: Mixed strategy example
(define mixed-strategy
  (compose-strategies applicative-order lazy-evaluation))

;; Advanced program
(define advanced-program
  '((define factorial
      (lambda (n)
        (let loop ((n n) (acc 1))
          (if (= n 0)
              acc
              (loop (- n 1) (* n acc))))))
    (factorial 5)
    (map factorial '(1 2 3 4))))

;; Multi-strategy canvases
(define multi-strategy-canvas
  (list
   (program->unified-canvas advanced-program normal-order)
   (program->unified-canvas advanced-program applicative-order)
   (program->unified-canvas advanced-program mixed-strategy)))

;; Output JSON for first canvas
(display (canvas->json (car multi-strategy-canvas)))
(newline)

;; Example interactive evaluation
(step-evaluate (cadr advanced-program) '() applicative-order
               (lambda (steps)
                 (display "Evaluation steps: ")
                 (display steps)
                 (newline)))