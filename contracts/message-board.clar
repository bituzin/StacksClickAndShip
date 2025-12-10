;; Message Board Contract - Clarity 4
;; Post immutable messages on the blockchain

;; Data maps and variables
(define-map messages 
  uint 
  {
    author: principal,
    content: (string-utf8 280),
    timestamp: uint,
    likes: uint,
    comments: uint
  }
)

(define-map user-likes 
  {message-id: uint, user: principal}
  bool
)

(define-data-var message-counter uint u0)

;; Constants
(define-constant err-message-not-found (err u404))
(define-constant err-already-liked (err u405))
(define-constant err-empty-message (err u406))

;; Post a new message
(define-public (post-message (content (string-utf8 280)))
  (let
    (
      (message-id (var-get message-counter))
      (content-length (len content))
    )
    ;; Validate message is not empty
    (asserts! (> content-length u0) err-empty-message)
    
    (map-set messages message-id {
      author: tx-sender,
      content: content,
      timestamp: block-height,
      likes: u0,
      comments: u0
    })
    (var-set message-counter (+ message-id u1))
    (ok message-id)
  )
)

;; Like a message (one like per user per message)
(define-public (like-message (message-id uint))
  (let
    (
      (message (unwrap! (map-get? messages message-id) err-message-not-found))
      (like-key {message-id: message-id, user: tx-sender})
    )
    ;; Check if user already liked
    (asserts! (is-none (map-get? user-likes like-key)) err-already-liked)
    
    ;; Record like
    (map-set user-likes like-key true)
    
    ;; Increment like count
    (map-set messages message-id 
      (merge message { likes: (+ (get likes message) u1) })
    )
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-message (message-id uint))
  (ok (map-get? messages message-id))
)

(define-read-only (get-total-messages)
  (ok (var-get message-counter))
)

(define-read-only (has-user-liked (message-id uint) (user principal))
  (ok (is-some (map-get? user-likes {message-id: message-id, user: user})))
)

(define-read-only (get-messages-by-author (author principal) (limit uint))
  (ok true) ;; Placeholder - would need iterator in real implementation
)
