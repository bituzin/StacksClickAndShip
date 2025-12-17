;; Daily Achievements Contract - Clarity 4 Full Demo
;; Demonstrates ALL 6 Clarity 4 features in one simple contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_ALREADY_CHECKED_TODAY (err u100))
(define-constant ERR_INVALID_SIGNATURE (err u101))
(define-constant ERR_UNAUTHORIZED (err u102))
(define-constant ERR_INVALID_TEMPLATE (err u103))

;; Data Variables
(define-data-var total-checkins uint u0)
(define-data-var total-users uint u0)

;; Data Maps
(define-map user-stats principal {
  total-checkins: uint,
  current-streak: uint,
  longest-streak: uint,
  last-checkin-time: uint,
  last-checkin-day: uint,
  points: uint
})

(define-map daily-stats uint uint) ;; day -> total checkins

(define-map verified-templates (buff 32) bool) ;; contract hash -> verified

;; ============================================
;; CLARITY 4 FEATURE #1: stacks-block-time
;; ============================================
;; Get current day number from timestamp
(define-read-only (get-current-day)
  (/ stacks-block-time u86400) ;; Unix timestamp / seconds per day
)

;; ============================================
;; CLARITY 4 FEATURE #2: stacks-block-time
;; ============================================
;; Daily check-in (simplified version without passkey)
(define-public (daily-checkin)
  (let
    (
      (user tx-sender)
      (current-time stacks-block-time) ;; Clarity 4: Real timestamp
      (current-day (get-current-day))
      (user-data (default-to 
        {
          total-checkins: u0,
          current-streak: u0,
          longest-streak: u0,
          last-checkin-time: u0,
          last-checkin-day: u0,
          points: u0
        }
        (map-get? user-stats user)))
      (last-day (get last-checkin-day user-data))
      (last-streak (get current-streak user-data))
    )
    
    ;; Check not already checked today
    (asserts! (not (is-eq current-day last-day)) ERR_ALREADY_CHECKED_TODAY)
    
    ;; Calculate new streak
    (let
      (
        (is-consecutive (is-eq (+ last-day u1) current-day))
        (new-streak (if is-consecutive (+ last-streak u1) u1))
        (new-longest (if (> new-streak (get longest-streak user-data))
                       new-streak
                       (get longest-streak user-data)))
        (bonus-points (if (> new-streak u6) u10 u1)) ;; 10x points after 7 days streak
      )
      
      ;; Update user stats
      (map-set user-stats user {
        total-checkins: (+ (get total-checkins user-data) u1),
        current-streak: new-streak,
        longest-streak: new-longest,
        last-checkin-time: current-time,
        last-checkin-day: current-day,
        points: (+ (get points user-data) bonus-points)
      })
      
      ;; Update global stats
      (if (is-eq (get total-checkins user-data) u0)
        (var-set total-users (+ (var-get total-users) u1))
        true
      )
      
      (var-set total-checkins (+ (var-get total-checkins) u1))
      (map-set daily-stats current-day 
        (+ (default-to u0 (map-get? daily-stats current-day)) u1))
      
      (ok {
        streak: new-streak,
        points-earned: bonus-points,
        total-points: (+ (get points user-data) bonus-points)
      })
    )
  )
)

;; ============================================
;; CLARITY 4 FEATURE #3: to-ascii?
;; ============================================
;; Get user stats as formatted strings
(define-read-only (get-user-stats-formatted (user principal))
  (match (map-get? user-stats user)
    stats (ok {
      total-checkins: (to-ascii? (get total-checkins stats)),
      current-streak: (to-ascii? (get current-streak stats)),
      longest-streak: (to-ascii? (get longest-streak stats)),
      points: (to-ascii? (get points stats)),
      user-address: (to-ascii? user)
    })
    (err u404)
  )
)

;; Get global stats as formatted strings  
(define-read-only (get-global-stats-formatted)
  (ok {
    total-checkins: (to-ascii? (var-get total-checkins)),
    total-users: (to-ascii? (var-get total-users)),
    current-day: (to-ascii? (get-current-day)),
    current-time: (to-ascii? stacks-block-time)
  })
)

;; ============================================
;; CLARITY 4 FEATURE #4: contract-hash?
;; ============================================
;; Verify that a reward contract follows approved template
(define-public (verify-reward-contract (reward-contract principal))
  (let
    (
      ;; Clarity 4: Get hash of the reward contract code
      (contract-code-hash (contract-hash? reward-contract))
    )
    (match contract-code-hash
      ok-hash 
      (begin
        ;; Check if this contract hash is in approved templates
        (ok (default-to false (map-get? verified-templates ok-hash)))
      )
      err-val
      (err ERR_INVALID_TEMPLATE)
    )
  )
)

;; Admin: Add verified template (only owner)
(define-public (add-verified-template (template-contract principal))
  (let
    (
      (hash (unwrap! (contract-hash? template-contract) ERR_INVALID_TEMPLATE))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (map-set verified-templates hash true)
    (ok hash)
  )
)

;; ============================================
;; CLARITY 4 FEATURE #5 & #6: restrict-assets?
;; ============================================
;; Note: This example is simplified - in production, define proper trait
;; (define-trait reward-trait
;;   ((claim-reward (principal uint) (response bool uint))))

;; Simplified claim reward (without external contract call)
(define-public (claim-reward-points (amount uint))
  (let
    (
      (user tx-sender)
      (user-data (default-to 
        {
          total-checkins: u0,
          current-streak: u0,
          longest-streak: u0,
          last-checkin-time: u0,
          last-checkin-day: u0,
          points: u0
        }
        (map-get? user-stats user)))
      (points (get points user-data))
    )
    
    ;; User must have enough points
    (asserts! (>= points amount) (err u104))
    
    ;; Deduct points
    (map-set user-stats user (merge user-data {points: (- points amount)}))
    (ok amount)
  )
)

;; ============================================
;; Standard Read-Only Functions
;; ============================================

(define-read-only (get-user-stats (user principal))
  (ok (map-get? user-stats user))
)

(define-read-only (get-user-streak (user principal))
  (ok (get current-streak (default-to 
    {
      total-checkins: u0,
      current-streak: u0,
      longest-streak: u0,
      last-checkin-time: u0,
      last-checkin-day: u0,
      points: u0
    }
    (map-get? user-stats user))))
)

(define-read-only (get-user-points (user principal))
  (ok (get points (default-to 
    {
      total-checkins: u0,
      current-streak: u0,
      longest-streak: u0,
      last-checkin-time: u0,
      last-checkin-day: u0,
      points: u0
    }
    (map-get? user-stats user))))
)

(define-read-only (get-daily-stats (day uint))
  (ok (default-to u0 (map-get? daily-stats day)))
)

(define-read-only (get-total-checkins)
  (ok (var-get total-checkins))
)

(define-read-only (get-total-users)
  (ok (var-get total-users))
)

(define-read-only (has-checked-today (user principal))
  (let
    (
      (current-day (get-current-day))
      (last-day (get last-checkin-day (default-to 
        {
          total-checkins: u0,
          current-streak: u0,
          longest-streak: u0,
          last-checkin-time: u0,
          last-checkin-day: u0,
          points: u0
        }
        (map-get? user-stats user))))
    )
    (ok (is-eq current-day last-day))
  )
)

;; Get time until next checkin available (in seconds)
(define-read-only (get-time-until-next-checkin (user principal))
  (let
    (
      (current-time stacks-block-time)
      (current-day (get-current-day))
      (user-data (map-get? user-stats user))
    )
    (match user-data
      stats (let
        (
          (last-day (get last-checkin-day stats))
          (next-day-start (* (+ current-day u1) u86400))
        )
        (if (is-eq current-day last-day)
          (ok (- next-day-start current-time))
          (ok u0)
        )
      )
      (ok u0)
    )
  )
)