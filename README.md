# Tokenized Healthcare Appointment Scheduling

A comprehensive blockchain-based healthcare appointment scheduling system built on the Stacks blockchain using Clarity smart contracts.

## Overview

This system provides a decentralized solution for healthcare appointment management, featuring provider verification, appointment booking, schedule optimization, reminder management, and no-show tracking.

## Features

### 🏥 Provider Verification
- Healthcare provider registration and verification
- License validation and credential management
- Verified provider directory

### 📅 Appointment Booking
- Secure appointment scheduling
- Real-time availability checking
- Patient and provider appointment management
- Cancellation and rescheduling capabilities

### ⚡ Schedule Optimization
- Intelligent schedule management
- Utilization rate tracking
- Optimization suggestions for providers
- Peak hour analysis

### 🔔 Reminder Management
- Automated appointment reminders
- Customizable reminder preferences
- Multiple reminder types (24-hour, 2-hour)
- Template-based messaging

### 📊 No-Show Tracking
- Comprehensive no-show monitoring
- Penalty system for repeated no-shows
- Provider statistics and analytics
- Patient restriction management

## Smart Contracts

### 1. Provider Verification Contract (\`provider-verification.clar\`)
Manages healthcare provider registration, verification, and credential validation.

**Key Functions:**
- \`register-provider\`: Register a new healthcare provider
- \`verify-provider\`: Verify provider credentials (admin only)
- \`get-provider\`: Retrieve provider information
- \`is-provider-verified\`: Check verification status

### 2. Appointment Booking Contract (\`appointment-booking.clar\`)
Handles appointment creation, scheduling, and management.

**Key Functions:**
- \`book-appointment\`: Schedule a new appointment
- \`cancel-appointment\`: Cancel existing appointment
- \`complete-appointment\`: Mark appointment as completed
- \`is-time-slot-available\`: Check slot availability

### 3. Schedule Optimization Contract (\`schedule-optimization.clar\`)
Optimizes provider schedules and manages availability.

**Key Functions:**
- \`set-provider-availability\`: Set working hours and availability
- \`calculate-schedule-metrics\`: Calculate utilization metrics
- \`generate-optimization-suggestions\`: Provide schedule optimization tips

### 4. Reminder Management Contract (\`reminder-management.clar\`)
Manages appointment reminders and notifications.

**Key Functions:**
- \`create-reminder\`: Create appointment reminders
- \`set-reminder-preferences\`: Configure reminder settings
- \`auto-create-reminders\`: Automatically generate reminders
- \`mark-reminder-sent\`: Track sent reminders

### 5. No-Show Tracking Contract (\`no-show-tracking.clar\`)
Tracks appointment no-shows and manages penalties.

**Key Functions:**
- \`record-no-show\`: Record missed appointments
- \`record-successful-appointment\`: Reset consecutive no-shows
- \`pay-penalty\`: Process penalty payments
- \`is-patient-restricted\`: Check patient restrictions

## Getting Started

### Prerequisites
- Stacks blockchain node
- Clarity CLI tools
- Node.js and npm (for testing)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd tokenized-healthcare-scheduling
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

### Deployment

Deploy contracts to Stacks blockchain:

\`\`\`bash
# Deploy provider verification contract
clarinet deploy contracts/provider-verification.clar

# Deploy appointment booking contract
clarinet deploy contracts/appointment-booking.clar

# Deploy schedule optimization contract
clarinet deploy contracts/schedule-optimization.clar

# Deploy reminder management contract
clarinet deploy contracts/reminder-management.clar

# Deploy no-show tracking contract
clarinet deploy contracts/no-show-tracking.clar
\`\`\`

## Usage Examples

### Register a Healthcare Provider

\`\`\`clarity
(contract-call? .provider-verification register-provider
"Dr. John Smith"
"Cardiology"
"MD123456")
\`\`\`

### Book an Appointment

\`\`\`clarity
(contract-call? .appointment-booking book-appointment
u1                    ;; provider-id
u20240620            ;; appointment-date
u900                 ;; appointment-time (9:00 AM)
u60                  ;; duration (60 minutes)
"Regular checkup")   ;; notes
\`\`\`

### Set Provider Availability

\`\`\`clarity
(contract-call? .schedule-optimization set-provider-availability
u1    ;; provider-id
u1    ;; Monday
u800  ;; 8:00 AM start
u1700 ;; 5:00 PM end
u1200 ;; 12:00 PM break start
u1300 ;; 1:00 PM break end
u30)  ;; 30-minute slots
\`\`\`

## Testing

The project includes comprehensive tests using Vitest:

\`\`\`bash
# Run all tests
npm test

# Run specific test file
npm test provider-verification.test.js

# Run tests in watch mode
npm run test:watch
\`\`\`

## Architecture

### Data Flow
1. **Provider Registration**: Healthcare providers register and get verified
2. **Appointment Booking**: Patients book appointments with verified providers
3. **Schedule Management**: System optimizes schedules and manages availability
4. **Reminder System**: Automated reminders are sent to patients
5. **No-Show Tracking**: System tracks and manages appointment no-shows

### Security Features
- Provider verification system
- Access control for sensitive operations
- Penalty system for no-shows
- Secure appointment management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] Integration with external healthcare systems
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Insurance integration
- [ ] Telemedicine features
