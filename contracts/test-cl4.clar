;; clarity-version: 4

(define-public (get-current-timestamp)
    (ok (unwrap-panic (get-block-info? time block-height)))
)
