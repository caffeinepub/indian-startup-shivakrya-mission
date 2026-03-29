# INDIAN STARTUP - Shivakrya Mission

## Current State
BMI Wellness Tracker app with BMI calculator, wellness progress tracking, daily tips, and a wellness hub. Backend is empty (no stored data). Frontend is purely local-storage based.

## Requested Changes (Diff)

### Add
- CRM (Customer Relationship Management) module with:
  - Contact management: add, view, edit, delete contacts (name, email, phone, company, status)
  - Lead pipeline: stages (New, Contacted, Qualified, Proposal, Closed Won, Closed Lost)
  - Notes per contact
  - Dashboard stats: total contacts, leads by stage, recent activity
- Navigation tab for "CRM" in the navbar
- Backend Motoko actor to store contacts and leads persistently

### Modify
- Navbar: add CRM tab alongside existing Dashboard, BMI Calculator, Wellness Hub tabs
- App: add CRM section as a tabbed/routed view alongside wellness content

### Remove
- Nothing removed

## Implementation Plan
1. Generate Motoko backend with Contact and Lead CRUD operations
2. Build CRM frontend section: contact list, add/edit contact modal, lead pipeline board, CRM dashboard stats
3. Wire CRM section into the main App with navigation
