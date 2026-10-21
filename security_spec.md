# Security Specification & Threat Model - Kicks Online

## 1. Data Invariants & Zero-Trust Architecture
1. **PII Zero-Tolerance**: No Personally Identifiable Information (name, email, phone, Instagram handle) is ever stored in `events` or received from clients.
2. **Campaign Immutability**: Campaign configurations (`/campaigns/{campaignId}`) are strictly READ-ONLY for public users. Only server/admins may create or update campaigns.
3. **Event Write-Only**: Unauthenticated visitors can create anonymous events (`/events/{eventId}`) matching the exact schema and size constraints. Reading, updating, or deleting existing events is denied to public visitors to prevent telemetry tampering or data harvesting.
4. **ID Sanitization**: Document IDs and path variables must adhere to `^[a-zA-Z0-9_\-]+$` and size <= 128 characters.
5. **Session Constraints**: The anonymous `sessionId` must be alphanumeric, max 64 chars.
6. **Domain Lockout**: Only destination domains `https://kicksvenezuela.com` and `https://wa.me/584242523184` are permitted. All others are blocked.

---

## 2. The "Dirty Dozen" Attack Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1 - Public Campaign Overwrite**:
   Attempt by public user to modify or set a promotional price in `/campaigns/retro-drops`.
   `{ "etiqueta_precio": "$1 (antes $99)" }` -> DENIED (write forbidden).

2. **Payload 2 - Public Event Snooping / List**:
   Attempt to query/list the `/events` collection to harvest session activity.
   `GET /events` -> DENIED (list forbidden).

3. **Payload 3 - PII Injection Attack**:
   Attempt to inject a phone or Instagram handle into an event doc.
   `{ "sessionId": "s1", "campaign": "c1", "zone": "ccs", "eventType": "page_view", "phone": "+584120000000", "instagram": "@hacker" }` -> DENIED (strict keys violation).

4. **Payload 4 - Huge String Denial-of-Wallet**:
   Attempt to write a 1MB payload into `details`.
   `{ "sessionId": "s1", "campaign": "c1", "zone": "ccs", "eventType": "page_view", "details": { "blob": "...1MB..." } }` -> DENIED (size constraints).

5. **Payload 5 - Malformed Path / ID Poisoning**:
   Attempt to create an event at path `/events/../../../etc/passwd` or oversized ID.
   `POST /events/{1000_char_string}` -> DENIED (isValidId violation).

6. **Payload 6 - State History Tampering (Update Event)**:
   Attempt to update an existing event to alter conversion metrics.
   `PATCH /events/ev_123 { "eventType": "whatsapp_click" }` -> DENIED (update forbidden).

7. **Payload 7 - Event Deletion (Erase Evidence)**:
   Attempt to delete events.
   `DELETE /events/ev_123` -> DENIED (delete forbidden).

8. **Payload 8 - Invalid Event Type Injection**:
   Attempt to inject arbitrary invalid event type.
   `{ "sessionId": "s1", "campaign": "c1", "zone": "ccs", "eventType": "user_admin_escalate" }` -> DENIED (enum validation).

9. **Payload 9 - Spoofed Creation Time**:
   Attempt to backdate an event by injecting an old timestamp.
   `{ "sessionId": "s1", "campaign": "c1", "zone": "ccs", "eventType": "page_view", "createdAt": "2020-01-01T00:00:00Z" }` -> Server validates timestamp integrity.

10. **Payload 10 - Arbitrary Shopify Redirect Injection**:
    Attempt to pass an external phishing URL into the Shopify redirect helper.
    `redirectUrl="https://evil-phishing.com"` -> DENIED by domain whitelist guard.

11. **Payload 11 - Arbitrary WhatsApp Number Injection**:
    Attempt to redirect WhatsApp to a fraudulent number.
    `phone="584149999999"` -> DENIED, hard-locked to official store line `584242523184`.

12. **Payload 12 - Campaign Deletion Attempt**:
    Attempt to delete a active campaign document.
    `DELETE /campaigns/default` -> DENIED.
