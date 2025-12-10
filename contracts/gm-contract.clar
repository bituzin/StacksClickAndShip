;; Simple GM Contract
;; Allows users to say "Good Morning" on-chain

(define-map gm-count principal uint)
(define-data-var total-gms uint u0)

(define-public (say-gm (message (string-utf8 280)))
  (let
    (
      (current-count (default-to u0 (map-get? gm-count tx-sender)))
    )
    (map-set gm-count tx-sender (+ current-count u1))
    (var-set total-gms (+ (var-get total-gms) u1))
    (ok true)
  )
)

(define-read-only (get-gm-count (user principal))
  (default-to u0 (map-get? gm-count user))
)

(define-read-only (get-total-gms)
  (ok (var-get total-gms))
)
