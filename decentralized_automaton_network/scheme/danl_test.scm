;; DANL Scheme Orchestrator
;; R5RS-compliant reference implementation for the Decentralized Automaton
;; Network Lattice. Provides lattice semantics, homoiconic M/S expression
;; utilities, Y/Z combinators, and a fixpoint simulator with trace output.

;;; ----------------------------------------------------------------------
;;; Lattice definition

(define lattice-level-order
  '((bottom . 0)
    (potential . 1)
    (active . 2)
    (confident . 3)
    (top . 4)))

(define (level-index level)
  (let ((pair (assoc level lattice-level-order)))
    (if pair
        (cdr pair)
        0)))

(define (index->level idx)
  (cond
    ((<= idx 0) 'bottom)
    ((<= idx 1) 'potential)
    ((<= idx 2) 'active)
    ((<= idx 3) 'confident)
    (else 'top)))

(define (level-join a b)
  (if (>= (level-index a) (level-index b)) a b))

(define (level-meet a b)
  (if (<= (level-index a) (level-index b)) a b))

(define (fold-left f init lst)
  (if (null? lst)
      init
      (fold-left f (f init (car lst)) (cdr lst))))

(define (list-join levels)
  (if (null? levels)
      'bottom
      (fold-left level-join (car levels) (cdr levels))))

(define (list-meet levels)
  (if (null? levels)
      'top
      (fold-left level-meet (car levels) (cdr levels))))

;;; ----------------------------------------------------------------------
;;; M/S expression utilities

(define (make-ms meta structural)
  (list 'ms meta structural))

(define (ms-meta ms) (cadr ms))

(define (ms-structural ms) (caddr ms))

(define (ms->description ms)
  (let ((meta (ms-meta ms)))
    (cond
      ((vector? meta) meta)
      ((pair? meta) (list->vector meta))
      (else (vector meta)))))

;;; ----------------------------------------------------------------------
;;; Association helpers

(define (assoc-set key value entries)
  (cond
    ((null? entries) (list (cons key value)))
    ((eq? (caar entries) key)
     (cons (cons key value) (cdr entries)))
    (else
     (cons (car entries) (assoc-set key value (cdr entries))))))

(define (assoc-ref alist key default)
  (let ((pair (assoc key alist)))
    (if pair (cdr pair) default)))

;;; ----------------------------------------------------------------------
;;; Node representation

(define (make-node name initial-state transition neighbors coefficient attributes)
  (list (cons 'name name)
        (cons 'state initial-state)
        (cons 'transition transition)
        (cons 'neighbors neighbors)
        (cons 'tau-coefficient coefficient)
        (cons 'attributes attributes)))

(define (node-name node) (cdr (assoc 'name node)))

(define (node-state node) (cdr (assoc 'state node)))

(define (node-transition node) (cdr (assoc 'transition node)))

(define (node-neighbors node) (cdr (assoc 'neighbors node)))

(define (node-coefficient node) (cdr (assoc 'tau-coefficient node)))

(define (node-attributes node) (cdr (assoc 'attributes node)))

(define (node-observable node)
  (* (node-coefficient node) (level-index (node-state node))))

(define (neighbor-states node network)
  (let ((neighbors (node-neighbors node)))
    (if (null? neighbors)
        '()
        (map (lambda (neighbor-name)
               (node-state (find-node network neighbor-name)))
             neighbors))))

(define (make-node-context node neighbor-values)
  (let* ((attributes (node-attributes node))
         (neighbor-join (list-join neighbor-values))
         (neighbor-meet (list-meet neighbor-values)))
    (list (cons 'tau (node-observable node))
          (cons 'coefficient (node-coefficient node))
          (cons 'neighbor-join neighbor-join)
          (cons 'neighbor-meet neighbor-meet)
          (cons 'neighbor-count (length neighbor-values))
          (cons 'meta (ms-meta (node-transition node)))
          (cons 'ceiling (assoc-ref attributes 'ceiling 'top))
          (cons 'floor (assoc-ref attributes 'floor 'bottom))
          (cons 'attributes attributes))))

(define (find-node nodes target)
  (cond
    ((null? nodes) #f)
    ((eq? (node-name (car nodes)) target) (car nodes))
    (else (find-node (cdr nodes) target))))

(define (apply-transition node network)
  (let* ((neighbors (neighbor-states node network))
         (context (make-node-context node neighbors))
         (transition (ms-structural (node-transition node)))
         (next-state (transition (node-state node) neighbors context)))
    (assoc-set 'state next-state node)))

;;; ----------------------------------------------------------------------
;;; Fixpoint combinators (applicative order)

(define (Y f)
  (letrec ((g (lambda args (apply (f g) args))))
    g))

(define (Z f)
  ((lambda (x)
     (f (lambda args (apply (x x) args))))
   (lambda (x)
     (f (lambda args (apply (x x) args))))))

;;; ----------------------------------------------------------------------
;;; Network iteration utilities

(define (network-states-equal? current next)
  (cond
    ((and (null? current) (null? next)) #t)
    ((or (null? current) (null? next)) #f)
    (else
     (and (eq? (node-name (car current)) (node-name (car next)))
          (eq? (node-state (car current)) (node-state (car next)))
          (network-states-equal? (cdr current) (cdr next))))))

(define (step-network network)
  (map (lambda (node) (apply-transition node network))
       network))

(define (list-last lst)
  (if (null? (cdr lst))
      (car lst)
      (list-last (cdr lst))))

(define (network-snapshot network)
  (map (lambda (node)
         (cons (node-name node) (node-state node)))
       network))

(define (network-observables network)
  (map (lambda (node)
         (cons (node-name node) (node-observable node)))
       network))

(define (render-trace history)
  (let loop ((remaining history)
             (step 0)
             (acc '()))
    (if (null? remaining)
        (reverse acc)
        (let* ((network (car remaining))
               (frame (list (cons 'step step)
                            (cons 'states (network-snapshot network))
                            (cons 'observables (network-observables network)))))
          (loop (cdr remaining)
                (+ step 1)
                (cons frame acc)))))

;;; JSON trace export for cross-language validation
(define (network-to-json node)
  (let ((name (symbol->string (node-name node)))
        (state (symbol->string (node-state node))))
    (string-append "{\"name\":\"" name "\",\"state\":\"" state "\"}")))

(define (network-snapshot-to-json network)
  (if (null? network)
      "[]"
      (let loop ((nodes network)
                 (acc (string-append "[" (network-to-json (car network)))))
        (if (null? (cdr nodes))
            (string-append acc "]")
            (loop (cdr nodes) (string-append acc "," (network-to-json (car nodes))))))))

(define (export-trace-json history)
  (let loop ((remaining history)
             (step 0)
             (acc "[\n"))
    (if (null? remaining)
        (string-append acc "]")
        (let* ((network (car remaining))
               (frame-json (string-append
                            "  {\"step\":" (number->string step)
                            ",\"states\":" (network-snapshot-to-json network)
                            ",\"iterations\":" (number->string step) "}"))
               (separator (if (= step 0) "" ",")))
          (loop (cdr remaining)
                (+ step 1)
                (string-append acc separator "\n" frame-json))))))

(define (export-example-trace-json)
  (export-trace-json (cdr (assoc 'history example-run))))

;;; ----------------------------------------------------------------------
;;; Network simulation
;;; ----------------------------------------------------------------------

(define (simulate-network initial)
  (let* ((iterator
          (Z (lambda (recur)
               (lambda (current history)
                 (let ((next (step-network current)))
                   (if (network-states-equal? current next)
                       (reverse history)
                       (recur next (cons next history))))))))
         (history (iterator initial (list initial)))
         (final-network (list-last history))
         (iterations (max 0 (- (length history) 1)))
         (trace (render-trace history)))
    (list (cons 'history history)
          (cons 'final final-network)
          (cons 'iterations iterations)
          (cons 'trace trace))))

;;; ----------------------------------------------------------------------
;;; Transition helpers and MS definitions

(define (blend-level self neighbor weight)
  (let* ((self-index (level-index self))
         (neighbor-index (level-index neighbor))
         (weighted (/ (+ self-index (* weight neighbor-index))
                      (+ 1 weight))))
    (index->level weighted)))

(define propagate-belief-ms
  (make-ms
   '#(propagate-belief self neighbors -> join self (fold join neighbors))
   (lambda (self neighbors context)
     (let ((neighbor-join (assoc-ref context 'neighbor-join 'bottom)))
       (level-join self neighbor-join)))))

(define interpret-evidence-ms
  (make-ms
   '#(interpret-evidence self neighbors tau -> blend self neighbor-join)
   (lambda (self neighbors context)
     (let* ((neighbor-join (assoc-ref context 'neighbor-join 'bottom))
            (tau (assoc-ref context 'tau 0))
            (neighbor-count (max 1 (assoc-ref context 'neighbor-count 1)))
            (weight (/ (+ tau neighbor-count) neighbor-count)))
       (blend-level self neighbor-join weight)))))

(define safeguard-consensus-ms
  (make-ms
   '#(safeguard-consensus self neighbors -> meet ceiling (join self neighbor-join))
   (lambda (self neighbors context)
     (let* ((neighbor-join (assoc-ref context 'neighbor-join 'bottom))
            (candidate (level-join self neighbor-join))
            (ceiling (assoc-ref context 'ceiling 'confident))
            (floor (assoc-ref context 'floor 'potential)))
       (level-join floor (level-meet candidate ceiling))))))

;;; ----------------------------------------------------------------------
;;; Example network

(define example-network
  (list
   (make-node 'perceptual-array 'potential propagate-belief-ms
              '(inference-engine)
              1.25
              '((ceiling . confident)))
   (make-node 'inference-engine 'active interpret-evidence-ms
              '(perceptual-array consensus-forum)
              1.5
              '((floor . potential)))
   (make-node 'consensus-forum 'potential safeguard-consensus-ms
              '(inference-engine)
              0.9
              '((ceiling . confident) (floor . potential)))))

(define example-run (simulate-network example-network))

;;; Accessors for example output ------------------------------------------------

(define (example-trace)
  (assoc 'trace example-run))

(define (example-final-state)
  (assoc 'final example-run))

(define (example-iterations)
  (cdr (assoc 'iterations example-run)))

(define (export-example-trace-json)
  (export-trace-json (cdr (assoc 'history example-run))))

;;; End of DANL Scheme orchestrator ---------------------------------------------)
