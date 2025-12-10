;; GM Contract - Clarity 4
;; Say Good Morning on-chain and track your streak

;; Data maps and variables
(define-map gm-streaks principal {
  count: uint,
  last-gm-block: uint,
  total-gms: uint
})

(define-data-var total-gms-today uint u0)

;; Constants
(define-constant BLOCKS_PER_DAY u144) ;; ~10 min blocks
(define-constant err-already-gm-today (err u100))

;; Say GM function
(define-public (say-gm)
  (let
    (
      (sender tx-sender)
      (current-block burn-block-height)
      (user-data (default-to 
        {count: u0, last-gm-block: u0, total-gms: u0}
        (map-get? gm-streaks sender)))
      (last-block (get last-gm-block user-data))
      (blocks-since-last (- current-block last-block))
    )
    ;; Check if already said GM today
    (asserts! (or (is-eq last-block u0) (>= blocks-since-last BLOCKS_PER_DAY)) err-already-gm-today)
    
    ;; Update streak
    (map-set gm-streaks sender {
      count: (if (and (> last-block u0) (< blocks-since-last (* BLOCKS_PER_DAY u2)))
               (+ (get count user-data) u1) ;; Continue streak
               u1), ;; Reset streak
      last-gm-block: current-block,
      total-gms: (+ (get total-gms user-data) u1)
    })
    
    ;; Increment daily total
    (var-set total-gms-today (+ (var-get total-gms-today) u1))
    
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-user-streak (user principal))
  (ok (default-to 
    {count: u0, last-gm-block: u0, total-gms: u0}
    (map-get? gm-streaks user)))
)

(define-read-only (get-gm-count (user principal))
  (get total-gms (default-to 
    {count: u0, last-gm-block: u0, total-gms: u0}
    (map-get? gm-streaks user)))
)

(define-read-only (get-total-gms-today)
  (ok (var-get total-gms-today))
)

(define-read-only (get-current-streak (user principal))
  (get count (default-to 
    {count: u0, last-gm-block: u0, total-gms: u0}
    (map-get? gm-streaks user)))
)
