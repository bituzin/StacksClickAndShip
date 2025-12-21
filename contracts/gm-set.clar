;; GM Contract with Configurable Fees - Clarity 2
;; Say Good Morning on-chain with optional fees

;; ===========================================
;; CONSTANTS
;; ===========================================

(define-constant BLOCKS_PER_DAY u144)

;; Error codes
(define-constant err-not-owner (err u401))
(define-constant err-insufficient-balance (err u402))
(define-constant err-no-fees-to-withdraw (err u403))

;; ===========================================
;; DATA VARIABLES
;; ===========================================

(define-data-var contract-owner principal tx-sender)
(define-data-var gm-fee uint u0) ;; Start with FREE (0 STX)
(define-data-var accumulated-fees uint u0)
(define-data-var next-gm-id uint u0)
(define-data-var total-gms-alltime uint u0)

;; ===========================================
;; DATA MAPS
;; ===========================================

(define-map user-gm-stats principal {
  total-gms: uint,
  last-gm-block: uint
})

(define-map daily-gm-count uint uint)

(define-map recent-gms uint {
  user: principal,
  block-height: uint
})

;; ===========================================
;; ADMIN FUNCTIONS (Only Owner)
;; ===========================================

;; Set GM fee (owner only)
(define-public (set-gm-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-owner)
    (var-set gm-fee new-fee)
    (print {event: "fee-updated", new-fee: new-fee})
    (ok true)
  )
)

;; Change owner (owner only)
(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-owner)
    (var-set contract-owner new-owner)
    (print {event: "owner-changed", new-owner: new-owner})
    (ok true)
  )
)

;; Withdraw accumulated fees (owner only)
(define-public (withdraw-fees)
  (let
    (
      (amount (var-get accumulated-fees))
      (owner (var-get contract-owner))
    )
    ;; Only owner can withdraw
    (asserts! (is-eq tx-sender owner) err-not-owner)
    
    ;; Check if there are fees to withdraw
    (asserts! (> amount u0) err-no-fees-to-withdraw)
    
    ;; Transfer fees from contract to owner
    (try! (as-contract (stx-transfer? amount tx-sender owner)))
    
    ;; Reset accumulated fees
    (var-set accumulated-fees u0)
    
    (print {event: "fees-withdrawn", amount: amount, recipient: owner})
    (ok amount)
  )
)

;; Withdraw specific amount (owner only)
(define-public (withdraw-partial (amount uint))
  (let
    (
      (available (var-get accumulated-fees))
      (owner (var-get contract-owner))
    )
    ;; Only owner can withdraw
    (asserts! (is-eq tx-sender owner) err-not-owner)
    
    ;; Check if enough fees available
    (asserts! (<= amount available) err-insufficient-balance)
    (asserts! (> amount u0) err-no-fees-to-withdraw)
    
    ;; Transfer fees from contract to owner
    (try! (as-contract (stx-transfer? amount tx-sender owner)))
    
    ;; Decrease accumulated fees
    (var-set accumulated-fees (- available amount))
    
    (print {event: "partial-withdrawal", amount: amount, remaining: (- available amount)})
    (ok amount)
  )
)

;; ===========================================
;; PUBLIC FUNCTIONS
;; ===========================================

;; Say GM function - with optional fee
(define-public (say-gm)
  (let
    (
      (sender tx-sender)
      (current-block burn-block-height)
      (gm-id (var-get next-gm-id))
      (day-number (/ current-block BLOCKS_PER_DAY))
      (user-stats (default-to 
        {total-gms: u0, last-gm-block: u0}
        (map-get? user-gm-stats sender)))
      (daily-count (default-to u0 (map-get? daily-gm-count day-number)))
      (fee (var-get gm-fee))
    )
    
    ;; Collect fee if set (fee goes to contract, not directly to owner)
    (if (> fee u0)
      (begin
        (try! (stx-transfer? fee tx-sender (as-contract tx-sender)))
        (var-set accumulated-fees (+ (var-get accumulated-fees) fee))
      )
      true
    )
    
    ;; Update user stats
    (map-set user-gm-stats sender {
      total-gms: (+ (get total-gms user-stats) u1),
      last-gm-block: current-block
    })
    
    ;; Update daily count
    (map-set daily-gm-count day-number (+ daily-count u1))
    
    ;; Store recent GM
    (map-set recent-gms gm-id {
      user: sender,
      block-height: current-block
    })
    
    ;; Increment counters
    (var-set next-gm-id (+ gm-id u1))
    (var-set total-gms-alltime (+ (var-get total-gms-alltime) u1))
    
    (print {
      event: "gm-said",
      user: sender,
      gm-id: gm-id,
      fee-paid: fee,
      total-user-gms: (+ (get total-gms user-stats) u1)
    })
    
    (ok gm-id)
  )
)

;; Free GM for special occasions (owner can call for users)
(define-public (gift-gm (recipient principal))
  (let
    (
      (current-block burn-block-height)
      (gm-id (var-get next-gm-id))
      (day-number (/ current-block BLOCKS_PER_DAY))
      (user-stats (default-to 
        {total-gms: u0, last-gm-block: u0}
        (map-get? user-gm-stats recipient)))
      (daily-count (default-to u0 (map-get? daily-gm-count day-number)))
    )
    ;; Only owner can gift GMs
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-not-owner)
    
    ;; Update user stats
    (map-set user-gm-stats recipient {
      total-gms: (+ (get total-gms user-stats) u1),
      last-gm-block: current-block
    })
    
    ;; Update daily count
    (map-set daily-gm-count day-number (+ daily-count u1))
    
    ;; Store recent GM
    (map-set recent-gms gm-id {
      user: recipient,
      block-height: current-block
    })
    
    ;; Increment counters
    (var-set next-gm-id (+ gm-id u1))
    (var-set total-gms-alltime (+ (var-get total-gms-alltime) u1))
    
    (print {event: "gm-gifted", recipient: recipient, gm-id: gm-id})
    (ok gm-id)
  )
)

;; ===========================================
;; READ-ONLY FUNCTIONS
;; ===========================================

;; Get current GM fee
(define-read-only (get-gm-fee)
  (ok (var-get gm-fee))
)

;; Get contract owner
(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

;; Get accumulated fees (pending withdrawal)
(define-read-only (get-accumulated-fees)
  (ok (var-get accumulated-fees))
)

;; Get contract balance (should match accumulated-fees)
(define-read-only (get-contract-balance)
  (ok (stx-get-balance (as-contract tx-sender)))
)

;; Get user stats
(define-read-only (get-user-stats (user principal))
  (ok (default-to 
    {total-gms: u0, last-gm-block: u0}
    (map-get? user-gm-stats user)))
)

;; Get user total GMs
(define-read-only (get-user-total-gms (user principal))
  (ok (get total-gms (default-to 
    {total-gms: u0, last-gm-block: u0}
    (map-get? user-gm-stats user))))
)

;; Get daily GM count (for current day)
(define-read-only (get-daily-gm-count)
  (let ((day-number (/ burn-block-height BLOCKS_PER_DAY)))
    (ok (default-to u0 (map-get? daily-gm-count day-number))))
)

;; Get daily GM count for specific day
(define-read-only (get-daily-gm-count-for-day (day uint))
  (ok (default-to u0 (map-get? daily-gm-count day)))
)

;; Get total GMs alltime
(define-read-only (get-total-gms-alltime)
  (ok (var-get total-gms-alltime))
)

;; Get last 5 GMs
(define-read-only (get-last-five-gms)
  (let
    (
      (total (var-get next-gm-id))
      (id-1 (if (> total u0) (- total u1) u0))
      (id-2 (if (> total u1) (- total u2) u0))
      (id-3 (if (> total u2) (- total u3) u0))
      (id-4 (if (> total u3) (- total u4) u0))
      (id-5 (if (> total u4) (- total u5) u0))
    )
    (ok {
      first: (map-get? recent-gms id-1),
      second: (map-get? recent-gms id-2),
      third: (map-get? recent-gms id-3),
      fourth: (map-get? recent-gms id-4),
      fifth: (map-get? recent-gms id-5)
    })
  )
)

;; Get specific GM by ID
(define-read-only (get-gm-by-id (gm-id uint))
  (ok (map-get? recent-gms gm-id))
)

;; Get current day number
(define-read-only (get-current-day)
  (ok (/ burn-block-height BLOCKS_PER_DAY))
)

;; Get full contract info
(define-read-only (get-contract-info)
  (ok {
    owner: (var-get contract-owner),
    gm-fee: (var-get gm-fee),
    accumulated-fees: (var-get accumulated-fees),
    contract-balance: (stx-get-balance (as-contract tx-sender)),
    total-gms: (var-get total-gms-alltime),
    next-gm-id: (var-get next-gm-id)
  })
)

;; Check if user can afford GM
(define-read-only (can-user-afford-gm (user principal))
  (let
    (
      (fee (var-get gm-fee))
      (balance (stx-get-balance user))
    )
    (ok {
      can-afford: (>= balance fee),
      user-balance: balance,
      required-fee: fee
    })
  )
)

;; Get revenue stats
(define-read-only (get-revenue-stats)
  (let
    (
      (total-gms (var-get total-gms-alltime))
      (current-fee (var-get gm-fee))
      (accumulated (var-get accumulated-fees))
    )
    (ok {
      total-gms: total-gms,
      current-fee: current-fee,
      accumulated-fees: accumulated,
      potential-revenue-if-all-paid: (* total-gms current-fee)
    })
  )
)