;; Username Registry Smart Contract
;; Simple username registration system on Stacks

;; Constants
(define-constant ERR_USERNAME_TAKEN (err u101))
(define-constant ERR_USERNAME_TOO_SHORT (err u102))
(define-constant ERR_USERNAME_TOO_LONG (err u103))
(define-constant ERR_ALREADY_HAS_USERNAME (err u109))
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_OWNER (err u107))
(define-constant ERR_USERNAME_NOT_FOUND (err u106))
(define-constant ERR_CANNOT_TRANSFER_TO_SELF (err u110))

(define-constant MIN_USERNAME_LENGTH u3)
(define-constant MAX_USERNAME_LENGTH u30)

;; Data Variables
(define-data-var registration-fee uint u100000)
(define-data-var total-fees-collected uint u0)
(define-data-var total-usernames uint u0)
(define-data-var contract-owner (optional principal) none)

;; Data Maps
(define-map usernames
    { username: (string-ascii 30) }
    { 
        owner: principal,
        registered-at: uint
    }
)

(define-map address-to-username
    { owner: principal }
    { username: (string-ascii 30) }
)

(define-private (validate-username (username (string-ascii 30)))
    (let
        (
            (username-length (len username))
        )
        (if (< username-length MIN_USERNAME_LENGTH)
            ERR_USERNAME_TOO_SHORT
            (if (> username-length MAX_USERNAME_LENGTH)
                ERR_USERNAME_TOO_LONG
                (ok true)
            )
        )
    )
)

;; Read-Only Functions (order changed)
(define-read-only (get-total-usernames)
    (var-get total-usernames)
)

(define-read-only (get-username-owner (username (string-ascii 30)))
    (match (map-get? usernames { username: username })
        entry (some (get owner entry))
        none
    )
)

(define-read-only (get-contract-owner)
    (var-get contract-owner)
)

(define-read-only (get-address-username (owner principal))
    (match (map-get? address-to-username { owner: owner })
        entry (some (get username entry))
        none
    )
)

(define-read-only (get-registration-fee)
    (var-get registration-fee)
)

(define-read-only (get-total-fees-collected)
    (var-get total-fees-collected)
)

(define-read-only (is-username-available (username (string-ascii 30)))
    (is-none (map-get? usernames { username: username }))
)

(define-read-only (has-username (owner principal))
    (is-some (map-get? address-to-username { owner: owner }))
)

;; Clarity 4: Get username registration timestamp
(define-read-only (get-username-registered-at (username (string-ascii 30)))
    (match (map-get? usernames { username: username })
        entry (some (get registered-at entry))
        none
    )
)

;; Clarity 4: Format registration fee as ASCII string
(define-read-only (get-registration-fee-as-string)
    (to-ascii? (var-get registration-fee))
)

;; Clarity 4: Format principal as ASCII string using to-ascii?
(define-read-only (get-owner-as-string (owner principal))
    (to-ascii? owner)
)


;; Public Functions (order changed)
(define-public (release-username (username (string-ascii 30)))
    (let
        (
            (caller tx-sender)
            (username-entry (unwrap! (map-get? usernames { username: username }) ERR_USERNAME_NOT_FOUND))
        )
        ;; Check caller is the owner
        (asserts! (is-eq caller (get owner username-entry)) ERR_NOT_OWNER)
        
        ;; Delete username
        (map-delete usernames { username: username })
        
        ;; Delete reverse lookup
        (map-delete address-to-username { owner: caller })
        
        ;; Update stats
        (var-set total-usernames (- (var-get total-usernames) u1))
        
        (ok true)
    )
)

(define-public (register-username (username (string-ascii 30)))
    (let
        (
            (caller tx-sender)
            ;; Clarity 4: Get current block timestamp
            (current-time stacks-block-time)
        )
        ;; Validate username format
        (try! (validate-username username))
        
        ;; Check if username is available
        (asserts! (is-username-available username) ERR_USERNAME_TAKEN)
        
        ;; Check if caller already has a username
        (asserts! (not (has-username caller)) ERR_ALREADY_HAS_USERNAME)
        
        ;; Register the username with timestamp (Clarity 4: stacks-block-time)
        (map-set usernames
            { username: username }
            { 
                owner: caller,
                registered-at: current-time
            }
        )
        
        ;; Set reverse lookup
        (map-set address-to-username
            { owner: caller }
            { username: username }
        )
        
        ;; Update stats
        (var-set total-usernames (+ (var-get total-usernames) u1))
        
        (ok username)
    )
)

(define-public (transfer-username (username (string-ascii 30)) (new-owner principal))
    (let
        (
            (caller tx-sender)
            (username-entry (unwrap! (map-get? usernames { username: username }) ERR_USERNAME_NOT_FOUND))
            (current-owner (get owner username-entry))
            (registered-at-time (get registered-at username-entry))
        )
        ;; Check caller is the owner
        (asserts! (is-eq caller current-owner) ERR_NOT_OWNER)
        
        ;; Cannot transfer to self
        (asserts! (not (is-eq caller new-owner)) ERR_CANNOT_TRANSFER_TO_SELF)
        
        ;; Check new owner doesn't already have a username
        (asserts! (not (has-username new-owner)) ERR_ALREADY_HAS_USERNAME)
        
        ;; Update username ownership (preserve registration timestamp)
        (map-set usernames
            { username: username }
            { 
                owner: new-owner,
                registered-at: registered-at-time
            }
        )
        
        ;; Update reverse lookups
        (map-delete address-to-username { owner: caller })
        (map-set address-to-username
            { owner: new-owner }
            { username: username }
        )
        
        (ok true)
    )
)

;; Admin Functions (order changed)
(define-public (set-registration-fee (new-fee uint))
    (let
        (
            (owner-opt (var-get contract-owner))
        )
        (if (is-none owner-opt)
            ERR_UNAUTHORIZED
            (let
                (
                    (owner (unwrap-panic owner-opt))
                )
                (begin
                    (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
                    (var-set registration-fee new-fee)
                    (ok new-fee)
                )
            )
        )
    )
)

;; Initialize contract owner (can only be called once)
(define-public (set-contract-owner (owner principal))
    (if (is-none (var-get contract-owner))
        (begin
            (var-set contract-owner (some owner))
            (ok owner)
        )
        ERR_UNAUTHORIZED
    )
)
