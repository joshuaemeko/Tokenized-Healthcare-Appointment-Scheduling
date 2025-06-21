import { describe, it, expect, beforeEach } from "vitest"

describe("Reminder Management Contract", () => {
  let contractState
  
  beforeEach(() => {
    contractState = {
      reminders: new Map(),
      reminderPreferences: new Map(),
      reminderTemplates: new Map(),
      nextReminderId: 1,
      reminderEnabled: true,
    }
  })
  
  describe("Reminder Creation", () => {
    it("should create reminder successfully", () => {
      const reminderData = {
        appointmentId: 1,
        patientAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        providerId: 1,
        reminderType: "24-hour",
        reminderTime: Date.now() + 86400000, // 24 hours from now
        message: "Your appointment is tomorrow",
      }
      
      const result = createReminder(contractState, reminderData)
      
      expect(result.success).toBe(true)
      expect(result.reminderId).toBe(1)
      expect(contractState.reminders.size).toBe(1)
    })
    
    it("should reject reminders with past times", () => {
      const reminderData = {
        appointmentId: 1,
        patientAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        providerId: 1,
        reminderType: "24-hour",
        reminderTime: Date.now() - 3600000, // 1 hour ago
        message: "Past reminder",
      }
      
      const result = createReminder(contractState, reminderData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR_INVALID_REMINDER_TIME")
    })
    
    it("should store reminder data correctly", () => {
      const reminderData = {
        appointmentId: 1,
        patientAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        providerId: 1,
        reminderType: "2-hour",
        reminderTime: Date.now() + 7200000,
        message: "Your appointment is in 2 hours",
      }
      
      createReminder(contractState, reminderData)
      
      const reminder = contractState.reminders.get(1)
      expect(reminder.appointmentId).toBe(reminderData.appointmentId)
      expect(reminder.reminderType).toBe(reminderData.reminderType)
      expect(reminder.sent).toBe(false)
    })
  })
  
  describe("Reminder Preferences", () => {
    it("should set reminder preferences successfully", () => {
      const preferences = {
        emailEnabled: true,
        smsEnabled: false,
        advanceHours: 24,
        reminderFrequency: 2,
      }
      
      const result = setReminderPreferences(contractState, preferences)
      
      expect(result.success).toBe(true)
      
      const patientAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
      const stored = contractState.reminderPreferences.get(patientAddress)
      
      expect(stored.emailEnabled).toBe(preferences.emailEnabled)
      expect(stored.advanceHours).toBe(preferences.advanceHours)
    })
    
    it("should retrieve reminder preferences", () => {
      const preferences = {
        emailEnabled: true,
        smsEnabled: true,
        advanceHours: 48,
        reminderFrequency: 1,
      }
      
      setReminderPreferences(contractState, preferences)
      
      const patientAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
      const retrieved = getReminderPreferences(contractState, patientAddress)
      
      expect(retrieved.emailEnabled).toBe(true)
      expect(retrieved.smsEnabled).toBe(true)
      expect(retrieved.advanceHours).toBe(48)
    })
  })
  
  describe("Reminder Templates", () => {
    it("should create reminder template successfully", () => {
      const templateData = {
        templateType: "appointment-reminder",
        subject: "Upcoming Appointment",
        message: "You have an appointment scheduled for {date} at {time}",
      }
      
      const result = createReminderTemplate(contractState, templateData)
      
      expect(result.success).toBe(true)
      
      const template = contractState.reminderTemplates.get(templateData.templateType)
      expect(template.subject).toBe(templateData.subject)
      expect(template.active).toBe(true)
    })
    
    it("should retrieve reminder template", () => {
      const templateData = {
        templateType: "cancellation-notice",
        subject: "Appointment Cancelled",
        message: "Your appointment has been cancelled",
      }
      
      createReminderTemplate(contractState, templateData)
      
      const template = getReminderTemplate(contractState, templateData.templateType)
      
      expect(template.subject).toBe(templateData.subject)
      expect(template.message).toBe(templateData.message)
    })
  })
  
  describe("Auto-Create Reminders", () => {
    it("should auto-create multiple reminders", () => {
      const appointmentData = {
        appointmentId: 1,
        patientAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        providerId: 1,
        appointmentTime: Date.now() + 172800000, // 48 hours from now
      }
      
      const result = autoCreateReminders(contractState, appointmentData)
      
      expect(result.success).toBe(true)
      expect(contractState.reminders.size).toBe(2) // 24-hour and 2-hour reminders
    })
    
    it("should use patient preferences for auto-creation", () => {
      // Set patient preferences first
      setReminderPreferences(contractState, {
        emailEnabled: true,
        smsEnabled: false,
        advanceHours: 48,
        reminderFrequency: 1,
      })
      
      const appointmentData = {
        appointmentId: 1,
        patientAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        providerId: 1,
        appointmentTime: Date.now() + 259200000, // 72 hours from now
      }
      
      const result = autoCreateReminders(contractState, appointmentData)
      
      expect(result.success).toBe(true)
      expect(contractState.reminders.size).toBeGreaterThan(0)
    })
  })
  
  describe("Reminder Status Management", () => {
    beforeEach(() => {
      createReminder(contractState, {
        appointmentId: 1,
        patientAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        providerId: 1,
        reminderType: "24-hour",
        reminderTime: Date.now() + 86400000,
        message: "Test reminder",
      })
    })
    
    it("should mark reminder as sent", () => {
      const result = markReminderSent(contractState, 1)
      
      expect(result.success).toBe(true)
      expect(contractState.reminders.get(1).sent).toBe(true)
    })
    
    it("should reject marking non-existent reminder as sent", () => {
      const result = markReminderSent(contractState, 999)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR_REMINDER_NOT_FOUND")
    })
  })
  
  describe("Query Functions", () => {
    beforeEach(() => {
      createReminder(contractState, {
        appointmentId: 1,
        patientAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        providerId: 1,
        reminderType: "24-hour",
        reminderTime: Date.now() + 86400000,
        message: "Test reminder",
      })
    })
    
    it("should retrieve reminder details", () => {
      const reminder = getReminder(contractState, 1)
      
      expect(reminder).toBeDefined()
      expect(reminder.appointmentId).toBe(1)
      expect(reminder.reminderType).toBe("24-hour")
    })
    
    it("should return null for non-existent reminder", () => {
      const reminder = getReminder(contractState, 999)
      
      expect(reminder).toBeNull()
    })
    
    it("should check if reminders are enabled", () => {
      const enabled = areRemindersEnabled(contractState)
      
      expect(enabled).toBe(true)
    })
    
    it("should return correct total reminders count", () => {
      // Create additional reminder
      createReminder(contractState, {
        appointmentId: 2,
        patientAddress: "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        providerId: 1,
        reminderType: "2-hour",
        reminderTime: Date.now() + 7200000,
        message: "Second reminder",
      })
      
      const total = getTotalReminders(contractState)
      
      expect(total).toBe(2)
    })
  })
})

// Helper functions
function createReminder(state, data) {
  // Validate reminder time is in the future
  if (data.reminderTime <= Date.now()) {
    return { success: false, error: "ERR_INVALID_REMINDER_TIME" }
  }
  
  const reminderId = state.nextReminderId
  
  state.reminders.set(reminderId, {
    appointmentId: data.appointmentId,
    patientAddress: data.patientAddress,
    providerId: data.providerId,
    reminderType: data.reminderType,
    reminderTime: data.reminderTime,
    message: data.message,
    sent: false,
    createdBlock: Date.now(),
  })
  
  state.nextReminderId += 1
  
  return { success: true, reminderId }
}

function setReminderPreferences(state, preferences) {
  const patientAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" // Simulated
  
  state.reminderPreferences.set(patientAddress, {
    emailEnabled: preferences.emailEnabled,
    smsEnabled: preferences.smsEnabled,
    advanceHours: preferences.advanceHours,
    reminderFrequency: preferences.reminderFrequency,
  })
  
  return { success: true }
}

function createReminderTemplate(state, templateData) {
  state.reminderTemplates.set(templateData.templateType, {
    subject: templateData.subject,
    message: templateData.message,
    active: true,
  })
  
  return { success: true }
}

function autoCreateReminders(state, appointmentData) {
  const patientAddress = appointmentData.patientAddress
  const preferences = state.reminderPreferences.get(patientAddress) || {
    emailEnabled: true,
    smsEnabled: false,
    advanceHours: 24,
    reminderFrequency: 1,
  }
  
  // Create 24-hour reminder
  createReminder(state, {
    appointmentId: appointmentData.appointmentId,
    patientAddress: appointmentData.patientAddress,
    providerId: appointmentData.providerId,
    reminderType: "24-hour",
    reminderTime: appointmentData.appointmentTime - preferences.advanceHours * 3600000,
    message: "Your appointment is tomorrow",
  })
  
  // Create 2-hour reminder
  createReminder(state, {
    appointmentId: appointmentData.appointmentId,
    patientAddress: appointmentData.patientAddress,
    providerId: appointmentData.providerId,
    reminderType: "2-hour",
    reminderTime: appointmentData.appointmentTime - 7200000,
    message: "Your appointment is in 2 hours",
  })
  
  return { success: true }
}

function markReminderSent(state, reminderId) {
  const reminder = state.reminders.get(reminderId)
  if (!reminder) {
    return { success: false, error: "ERR_REMINDER_NOT_FOUND" }
  }
  
  reminder.sent = true
  state.reminders.set(reminderId, reminder)
  
  return { success: true }
}

function getReminder(state, reminderId) {
  return state.reminders.get(reminderId) || null
}

function getReminderPreferences(state, patientAddress) {
  return state.reminderPreferences.get(patientAddress) || null
}

function getReminderTemplate(state, templateType) {
  return state.reminderTemplates.get(templateType) || null
}

function areRemindersEnabled(state) {
  return state.reminderEnabled
}

function getTotalReminders(state) {
  return state.nextReminderId - 1
}
