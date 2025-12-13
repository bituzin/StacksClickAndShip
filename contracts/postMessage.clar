;; post-message.clar - Clarity 4

(define-constant MAX_LEN u280)
(define-constant BLOCKS_PER_DAY u144)

(define-data-var total-messages uint u0)
(define-data-var total-messages-today uint u0)
(define-data-var last-message-day uint u0)

(define-map messages uint {
  sender: principal,
  block: uint,
  content: (string-utf8 280)
})

;; Helper: get current day number
(define-read-only (current-day)
  (ok (/ burn-block-height BLOCKS_PER_DAY))
)

;; Public: send a message (no daily limit)
(define-public (post-message (msg (string-utf8 280)))
  (begin
    (asserts! (<= (len msg) MAX_LEN) (err u100))
    ;; Update daily counter
    (let
      (
        (curr-day (/ burn-block-height BLOCKS_PER_DAY))
        (last-day (var-get last-message-day))
      )
      (if (is-eq curr-day last-day)
        (var-set total-messages-today (+ (var-get total-messages-today) u1))
        (begin
          (var-set total-messages-today u1)
          (var-set last-message-day curr-day)
        )
      )
    )
    ;; Save message
    (let ((msg-id (+ (var-get total-messages) u1)))
      (map-set messages msg-id {
        sender: tx-sender,
        block: burn-block-height,
        content: msg
      })
      (var-set total-messages msg-id)
      (ok msg-id)
    )
  )
)

;; Read-only: get message by ID
(define-read-only (get-message (id uint))
  (ok (map-get? messages id))
)

;; Read-only: get total messages
(define-read-only (get-total-messages)
  (ok (var-get total-messages))
)

;; Read-only: get today's messages count
(define-read-only (get-today-messages)
  (ok (var-get total-messages-today))
)
