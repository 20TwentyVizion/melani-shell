# Melani OS - MVP Workplan

## Introduction

This document outlines the focused plan for delivering a Minimum Viable Product (MVP) version of Melani OS. The MVP will prioritize core functionality, stability, and user experience while deferring more advanced features to future releases.

## Objectives

- Create a streamlined version of Melani OS with essential features only
- Ensure high stability and performance across supported platforms
- Deliver a compelling demonstration of Melani's core value proposition
- Establish a solid foundation for future feature expansion

## Implementation Timeline

The MVP development is organized into two primary stages:
1. **Pre-MVP Setup** - Technical foundation and preparation
2. **MVP Carve-Out** - Feature refinement and deployment

Each task is assigned a priority level (High, Medium, Optional) to guide implementation sequence.

---

## Stage 1: Pre-MVP Setup

### 1.1 Create MVP Dev Branch from Main
- **Priority:** High
- **Description:** Branch off from main to preserve full-featured build while carving out MVP.
- **Implementation Details:**
  - Create `mvp-release` branch from main ✓
  - Document branch purpose and management workflow
  - Establish merge strategy for fixes between branches
- **Acceptance Criteria:**
  - Working branch exists with main codebase intact
  - Clear documentation for branch management

### 1.2 Implement Session Restore & White Screen Fallback
- **Priority:** High
- **Description:** Add fallback UI component, Zustand persistence, and tab visibility rehydration logic.
- **Implementation Details:**
  - Create FallbackUI component that displays when main UI fails to load
  - Implement session persistence using Zustand middleware
  - Add visibility state detection to handle tab switches/refreshes
  - Implement automatic rehydration of application state
- **Acceptance Criteria:**
  - Application recovers gracefully from page refresh
  - User state/data persists between sessions
  - White screen errors are eliminated
  - Visual feedback is provided during loading/error states

### 1.3 Refactor Zustand Stores for Core Apps
- **Priority:** Medium
- **Description:** Ensure local state for Notes, Tasks, Assistant is properly persisted and restored.
- **Implementation Details:**
  - Review and optimize store architecture for core apps
  - Implement proper persistence middleware for each store
  - Add data migration capability for future schema changes
  - Improve type safety across store interactions
- **Acceptance Criteria:**
  - All core app data persists across sessions
  - Store architecture follows consistent patterns
  - Type safety is enforced throughout state management
  - Console is free of state-related errors/warnings

### 1.4 Optimize UI for Mobile and Desktop
- **Priority:** Medium
- **Description:** Audit spacing, tap areas, overlapping modals, and icon layout for responsiveness.
- **Implementation Details:**
  - Implement responsive design for core components
  - Adjust tap/click areas for improved accessibility
  - Fix z-index and modal stacking issues
  - Ensure proper spacing and layout across viewports
  - Test across multiple screen sizes
- **Acceptance Criteria:**
  - UI renders properly on mobile devices (>= 320px width)
  - Desktop experience remains polished (>= 1024px width)
  - No overlapping UI elements or inaccessible controls
  - Touch targets meet accessibility guidelines (≥44px)

### 1.5 Add Service Worker for Offline Fallback
- **Priority:** Optional
- **Description:** Integrate basic PWA support using vite-plugin-pwa for improved refresh handling.
- **Implementation Details:**
  - Install and configure vite-plugin-pwa
  - Implement basic caching strategy for core assets
  - Add service worker registration and lifecycle management
  - Create offline experience fallback
- **Acceptance Criteria:**
  - Service worker properly registers and updates
  - Core app resources are cached for offline use
  - Graceful handling of offline state with user feedback
  - PWA can be installed on supported devices

---

## Stage 2: MVP Carve-Out

### 2.1 Disable Non-Essential Apps
- **Priority:** High
- **Description:** Comment out or disable incomplete or unpolished features not needed in MVP.
- **Implementation Details:**
  - Review all applications/features in the system
  - Create inventory of essential vs. non-essential features
  - Implement feature flags or conditionally disable non-MVP features
  - Ensure UI gracefully handles disabled features
- **Acceptance Criteria:**
  - Non-essential apps are hidden from UI
  - No broken links or references to disabled features
  - System performance improves with reduced complexity
  - Clean UI with only MVP features visible

### 2.2 Polish Core Apps: Assistant, Notes, Tasks
- **Priority:** High
- **Description:** Ensure LLM chat works cleanly; notes and tasks use Zustand with local persistence.
- **Implementation Details:**
  - Fix any remaining bugs in MelaniAssistant component
  - Optimize LLM interaction flow and error handling
  - Refine Notes app UI/UX and persistence
  - Enhance Tasks app with proper state management
  - Implement consistent styling across core apps
- **Acceptance Criteria:**
  - Assistant supports clean chat interactions with LLM (no memory or background agent tasks)
  - Notes app saves and restores user content reliably
  - Tasks app properly manages task state and persistence
  - All core apps follow consistent design language
  - No console errors during normal operation

### 2.3 Add Static Smart Suggestions
- **Priority:** Medium
- **Description:** Rotate 2–3 suggestions based on time-of-day or first load to simulate intelligence.
- **Implementation Details:**
  - Implement time-based suggestion selection
  - Create library of contextual suggestions
  - Add rotation logic for variety
  - Design and implement suggestion UI component
- **Acceptance Criteria:**
  - Suggestions appear relevant to user context
  - UI smoothly presents suggestions
  - Current implementation rotates static suggestions, but structure supports future LLM-based contextual generation
  - Clicking suggestions performs expected actions

### 2.4 Optional (MVP+): Enable Voice Input for Assistant
- **Priority:** Medium
- **Description:** Allow speech-to-text input via Web Speech API if stable; mark as MVP+ if needed.
- **Implementation Details:**
  - Implement Web Speech API integration
  - Add voice input toggle to Assistant UI
  - Provide visual feedback during voice recording
  - Handle browser compatibility gracefully
- **Acceptance Criteria:**
  - Voice input works in supported browsers
  - Clear feedback when recording/processing speech
  - Graceful fallback when not supported
  - Speech recognition results feed into Assistant properly

### 2.5 Deploy MVP Branch to Netlify
- **Priority:** High
- **Description:** Use a separate preview domain for MVP-only version to test and pitch cleanly.
- **Implementation Details:**
  - Configure separate Netlify site for MVP branch
  - Set up proper environment variables
  - Configure build settings for optimal performance
  - Implement preview links for stakeholder review
- **Acceptance Criteria:**
  - MVP version deploys successfully to dedicated URL
  - Build process completes without errors
  - Site loads and functions correctly in production environment
  - Performance metrics meet acceptable thresholds

---

## Progress Tracking

| Task | Status | Notes |
|------|--------|-------|
| 1.1 Create MVP Dev Branch | ✅ | Completed |
| 1.2 Session Restore & Fallback | ⏳ | Not started |
| 1.3 Refactor Zustand Stores | ⏳ | Not started |
| 1.4 Optimize UI | ⏳ | Not started |
| 1.5 Service Worker | ⏳ | Optional |
| 2.1 Disable Non-Essential Apps | ⏳ | Not started |
| 2.2 Polish Core Apps | ⏳ | Not started |
| 2.3 Static Smart Suggestions | ⏳ | Not started |
| 2.4 Voice Input | ⏳ | Optional (MVP+) |
| 2.5 Deploy MVP Branch | ⏳ | Not started |

## Next Steps

1. Begin with high-priority tasks in the Pre-MVP Setup stage
2. Review progress regularly and adjust priorities as needed
3. Maintain detailed documentation of changes for future reference
4. Consider creating issue/task tracking for each workplan item
