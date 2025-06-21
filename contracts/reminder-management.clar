;; Reminder Management Contract
;; Manages appointment reminders and notifications

;; Constants
(define-constant ERR_UNAUTHORIZED (err u400))
(define-constant ERR_REMINDER_NOT_FOUND (err u401))
(define-constant ERR_INVALID_REMINDER_TIME (err u402))

;; Data Variables
(define-data-var next-reminder-id uint u1)
(define-data-var reminder-enabled bool true)

;; Data Maps
(define-map reminders
  { reminder-id: uint }
  {
    appointment-id: uint,
    patient-address: principal,
    provider-id: uint,
    reminder-type: (string-ascii 20),
    reminder-time: uint,
    message: (string-ascii 200),
    sent: bool,
    created-block: uint
  }
)

(define-map reminder-preferences
  { patient-address: principal }
  {
    email-enabled: bool,
    sms-enabled: bool,
    advance-hours: uint,
    reminder-frequency: uint
  }
)

(define-map reminder-templates
  { template-type: (string-ascii 20) }
  {
    subject: (string-ascii 100),
    message: (string-ascii 500),
    active: bool
  }
)

;; Public Functions

;; Create a reminder
(define-public (create-reminder
  (appointment-id uint)
  (patient-address principal)
  (provider-id uint)
  (reminder-type (string-ascii 20))
  (reminder-time uint)
  (message (string-ascii 200)))
  (let
    (
      (reminder-id (var-get next-reminder-id))
    )
    ;; Validate reminder time is in the future
    (asserts! (> reminder-time block-height) ERR_INVALID_REMINDER_TIME)

    ;; Create reminder
    (map-set reminders
      { reminder-id: reminder-id }
      {
        appointment-id: appointment-id,
        patient-address: patient-address,
        provider-id: provider-id,
        reminder-type: reminder-type,
        reminder-time: reminder-time,
        message: message,
        sent: false,
        created-block: block-height
      }
    )

    ;; Increment reminder ID
    (var-set next-reminder-id (+ reminder-id u1))

    (ok reminder-id)
  )
)

;; Set reminder preferences
(define-public (set-reminder-preferences
  (email-enabled bool)
  (sms-enabled bool)
  (advance-hours uint)
  (reminder-frequency uint))
  (begin
    (map-set reminder-preferences
      { patient-address: tx-sender }
      {
        email-enabled: email-enabled,
        sms-enabled: sms-enabled,
        advance-hours: advance-hours,
        reminder-frequency: reminder-frequency
      }
    )
    (ok true)
  )
)

;; Mark reminder as sent
(define-public (mark-reminder-sent (reminder-id uint))
  (match (map-get? reminders { reminder-id: reminder-id })
    reminder-data
    (begin
      (map-set reminders
        { reminder-id: reminder-id }
        (merge reminder-data { sent: true })
      )
      (ok true)
    )
    ERR_REMINDER_NOT_FOUND
  )
)

;; Create reminder template
(define-public (create-reminder-template
  (template-type (string-ascii 20))
  (subject (string-ascii 100))
  (message (string-ascii 500)))
  (begin
    (map-set reminder-templates
      { template-type: template-type }
      {
        subject: subject,
        message: message,
        active: true
      }
    )
    (ok true)
  )
)

;; Auto-create reminders for appointment
(define-public (auto-create-reminders (appointment-id uint) (patient-address principal) (provider-id uint) (appointment-time uint))
  (let
    (
      (preferences (default-to
        { email-enabled: true, sms-enabled: false, advance-hours: u24, reminder-frequency: u1 }
        (map-get? reminder-preferences { patient-address: patient-address })))
      (reminder-time (- appointment-time (* (get advance-hours preferences) u144))) ;; Assuming blocks per hour
    )
    ;; Create 24-hour reminder
    (try! (create-reminder
      appointment-id
      patient-address
      provider-id
      "24-hour"
      reminder-time
      "Your appointment is tomorrow"))

    ;; Create 2-hour reminder
    (try! (create-reminder
      appointment-id
      patient-address
      provider-id
      "2-hour"
      (- appointment-time u288)
      "Your appointment is in 2 hours"))

    (ok true)
  )
)

;; Read-only Functions

;; Get reminder details
(define-read-only (get-reminder (reminder-id uint))
  (map-get? reminders { reminder-id: reminder-id })
)

;; Get reminder preferences
(define-read-only (get-reminder-preferences (patient-address principal))
  (map-get? reminder-preferences { patient-address: patient-address })
)

;; Get reminder template
(define-read-only (get-reminder-template (template-type (string-ascii 20)))
  (map-get? reminder-templates { template-type: template-type })
)

;; Check if reminders are enabled
(define-read-only (are-reminders-enabled)
  (var-get reminder-enabled)
)

;; Get total reminders
(define-read-only (get-total-reminders)
  (- (var-get next-reminder-id) u1)
)
