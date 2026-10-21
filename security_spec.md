# Security Specification: ConnectX Messenger RBAC & ABAC Security Architecture

## 1. Data Invariants & Access Control Boundary

1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created by an authenticated user where `request.auth.uid == userId` and `incoming().uid == request.auth.uid`. No user can grant themselves admin privileges (`isAdmin == true`) or alter their `accountStatus` upon creation.
2. **Public ID Immutability**: The `publicId` (format: `^CX-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$`) and `uid` are immutable once written; update operations cannot modify them.
3. **Conversation Isolation**: Access to a conversation (`/conversations/{conversationId}`) is restricted strictly to accounts listed in `resource.data.participantIds` or verified administrators.
4. **Master Gate for Messages**: Subcollection messages (`/conversations/{conversationId}/messages/{messageId}`) cannot be created or read unless the requesting user is a verified member in the parent conversation's `participantIds` list, fetched via `get()`.
5. **Message Authorship Integrity**: Messages can only be created with `senderId == request.auth.uid`. A user can only edit their own message text (`existing().senderId == request.auth.uid`).
6. **Audit Log Fortress**: The `/adminAuditLogs/{logId}` collection is accessible exclusively to administrators verified via database entry or the verified system admin token (`nayemofficial.bd69@gmail.com`). Audit logs are immutable and append-only (no updates, no deletions).

---

## 2. The "Dirty Dozen" Threat Payloads

| ID | Description | Targeted Vector | Expected Result |
|---|---|---|---|
| **PAYLOAD_01** | Non-owner attempts to read another user's private document (`get /users/victim_123` as `attacker_456`) | Unauthorized PII Read | `PERMISSION_DENIED` |
| **PAYLOAD_02** | Attacker attempts to register a user document with `isAdmin: true` | Privilege Escalation on Create | `PERMISSION_DENIED` |
| **PAYLOAD_03** | User attempts an update modifying their `publicId` or `uid` | Immutability Violation | `PERMISSION_DENIED` |
| **PAYLOAD_04** | User attempts an update setting their own `accountStatus: "active"` after being suspended | State Shortcutting | `PERMISSION_DENIED` |
| **PAYLOAD_05** | Attacker attempts to read conversation `/conversations/conv_private` where they are not in `participantIds` | Conversation Snooping | `PERMISSION_DENIED` |
| **PAYLOAD_06** | Attacker attempts to write a message into `/conversations/conv_private/messages/m1` without membership | Master Gate Bypass | `PERMISSION_DENIED` |
| **PAYLOAD_07** | Member attempts to forge `senderId: "victim_123"` when sending a message | Identity Spoofing | `PERMISSION_DENIED` |
| **PAYLOAD_08** | Member attempts to delete another member's message | Message Tampering | `PERMISSION_DENIED` |
| **PAYLOAD_09** | Non-admin user attempts to query `/adminAuditLogs` | Admin Resource Scraping | `PERMISSION_DENIED` |
| **PAYLOAD_10** | Non-admin user attempts to create an entry in `/adminAuditLogs` | Audit Injection Attack | `PERMISSION_DENIED` |
| **PAYLOAD_11** | Admin or user attempts to update or delete an existing audit log in `/adminAuditLogs/log_123` | Tamper-Proof Audit Violation | `PERMISSION_DENIED` |
| **PAYLOAD_12** | Client sends a 500KB text payload into `displayName` or `text` exceeding bounds | Denial of Wallet / Resource Exhaustion | `PERMISSION_DENIED` |

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

See `firestore.rules.test.ts` for automated unit tests asserting `PERMISSION_DENIED` against all 12 threat vectors using the `@firebase/rules-unit-testing` framework.
