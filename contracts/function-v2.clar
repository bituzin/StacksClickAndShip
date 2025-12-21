;; SPDX-License-Identifier: MIT

(define-data-var fn-get uint u0)
(define-data-var fn-push uint u0)
(define-data-var fn-dep uint u0)
(define-data-var fn-mine uint u0)
(define-data-var fn-call uint u0)
(define-data-var fn-set uint u0)
(define-data-var fn-with uint u0)
(define-data-var fn-main uint u0)
(define-data-var fn-pull uint u0)
(define-data-var fn-count uint u0)
(define-data-var fn-pay uint u0)

(define-public (get-counter)
  (ok (var-set fn-get (+ (var-get fn-get) u1))))

(define-public (push-counter)
  (ok (var-set fn-push (+ (var-get fn-push) u1))))

(define-public (dep-counter)
  (ok (var-set fn-dep (+ (var-get fn-dep) u1))))

(define-public (mine-counter)
  (ok (var-set fn-mine (+ (var-get fn-mine) u1))))

(define-public (call-counter)
  (ok (var-set fn-call (+ (var-get fn-call) u1))))

(define-public (set-counter)
  (ok (var-set fn-set (+ (var-get fn-set) u1))))

(define-public (with-counter)
  (ok (var-set fn-with (+ (var-get fn-with) u1))))

(define-public (main-counter)
  (ok (var-set fn-main (+ (var-get fn-main) u1))))

(define-public (pull-counter)
  (ok (var-set fn-pull (+ (var-get fn-pull) u1))))

(define-public (count-counter)
  (ok (var-set fn-count (+ (var-get fn-count) u1))))

(define-public (funct-counter)
  (ok (var-set fn-pay (+ (var-get fn-pay) u1))))

(define-read-only (read-get)
  (ok (var-get fn-get)))

(define-read-only (read-push)
  (ok (var-get fn-push)))

(define-read-only (read-dep)
  (ok (var-get fn-dep)))

(define-read-only (read-mine)
  (ok (var-get fn-mine)))

(define-read-only (read-call)
  (ok (var-get fn-call)))

(define-read-only (read-set)
  (ok (var-get fn-set)))

(define-read-only (read-with)
  (ok (var-get fn-with)))

(define-read-only (read-main)
  (ok (var-get fn-main)))

(define-read-only (read-pull)
  (ok (var-get fn-pull)))

(define-read-only (read-count)
  (ok (var-get fn-count)))

(define-read-only (read-funct)
  (ok (var-get fn-pay)))

(define-read-only (get-all-counters)
  (ok {
    counter-0: (var-get fn-get),
    counter-1: (var-get fn-push),
    counter-2: (var-get fn-dep),
    counter-3: (var-get fn-mine),
    counter-4: (var-get fn-call),
    counter-5: (var-get fn-set),
    counter-6: (var-get fn-with),
    counter-7: (var-get fn-main),
    counter-8: (var-get fn-pull),
    counter-9: (var-get fn-count),
    counter-10: (var-get fn-pay)
  }))