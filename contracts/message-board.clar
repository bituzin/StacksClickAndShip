;; Message Board Contract
;; Post immutable messages on the blockchain

(define-map messages 
  uint 
  {
    author: principal,
    content: (string-utf8 280),
    timestamp: uint,
    likes: uint
  }
)

(define-data-var message-counter uint u0)

(define-public (post-message (content (string-utf8 280)))
  (let
    (
      (message-id (var-get message-counter))
    )
    (map-set messages message-id {
      author: tx-sender,
      content: content,
      timestamp: block-height,
      likes: u0
    })
    (var-set message-counter (+ message-id u1))
    (ok message-id)
  )
)

(define-public (like-message (message-id uint))
  (match (map-get? messages message-id)
    message
      (begin
        (map-set messages message-id 
          (merge message { likes: (+ (get likes message) u1) })
        )
        (ok true)
      )
    (err u404)
  )
)

(define-read-only (get-message (message-id uint))
  (map-get? messages message-id)
)

(define-read-only (get-total-messages)
  (ok (var-get message-counter))
)
