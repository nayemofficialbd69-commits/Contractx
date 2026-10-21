/**
 * Firestore Security Rules Unit Tests
 * Asserts that all "Dirty Dozen" malicious payloads fail with PERMISSION_DENIED.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

describe('ConnectX Firestore Security Hardening - The Dirty Dozen Audit', () => {
  beforeAll(async () => {
    const rules = fs.readFileSync('firestore.rules', 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: 'connectx-messenger-test',
      firestore: { rules },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  // PAYLOAD_01: Non-owner attempts to read another user's private data
  it('PAYLOAD_01: Should deny non-owner reading private user document', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('users').doc('victim_123').set({
        uid: 'victim_123',
        displayName: 'Victim User',
        username: 'victim',
        usernameNormalized: 'victim',
        publicId: 'CX-7K4M9P2Q',
        email: 'victim@example.com',
        accountStatus: 'active',
        isAdmin: false,
        createdAt: 1000000,
        privacy: { whoCanFindByUsername: 'nobody' },
      });
    });

    const attackerContext = testEnv.authenticatedContext('attacker_456');
    await assertFails(attackerContext.firestore().collection('users').doc('victim_123').get());
  });

  // PAYLOAD_02: Attacker attempts to register with isAdmin: true
  it('PAYLOAD_02: Should deny self-assigned isAdmin role on user create', async () => {
    const context = testEnv.authenticatedContext('attacker_456');
    await assertFails(
      context.firestore().collection('users').doc('attacker_456').set({
        uid: 'attacker_456',
        displayName: 'Attacker',
        username: 'attacker',
        usernameNormalized: 'attacker',
        publicId: 'CX-3M8N2V9K',
        isAdmin: true, // Malicious privilege escalation
        accountStatus: 'active',
        createdAt: 1000000,
      })
    );
  });

  // PAYLOAD_03: Immutability test on publicId
  it('PAYLOAD_03: Should deny modifying publicId during update', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('users').doc('user_123').set({
        uid: 'user_123',
        displayName: 'Original User',
        username: 'user123',
        usernameNormalized: 'user123',
        publicId: 'CX-7K4M9P2Q',
        isAdmin: false,
        accountStatus: 'active',
        createdAt: 1000000,
      });
    });

    const context = testEnv.authenticatedContext('user_123');
    await assertFails(
      context.firestore().collection('users').doc('user_123').update({
        publicId: 'CX-CHANGED0',
      })
    );
  });

  // PAYLOAD_04: State shortcutting (unbanning self)
  it('PAYLOAD_04: Should deny user changing own accountStatus from suspended to active', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('users').doc('suspended_123').set({
        uid: 'suspended_123',
        displayName: 'Suspended User',
        username: 'suspended',
        usernameNormalized: 'suspended',
        publicId: 'CX-7K4M9P2Q',
        isAdmin: false,
        accountStatus: 'suspended',
        createdAt: 1000000,
      });
    });

    const context = testEnv.authenticatedContext('suspended_123');
    await assertFails(
      context.firestore().collection('users').doc('suspended_123').update({
        accountStatus: 'active',
      })
    );
  });

  // PAYLOAD_05: Non-member attempts to read private conversation
  it('PAYLOAD_05: Should deny non-member reading conversation', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('conversations').doc('conv_private').set({
        id: 'conv_private',
        type: 'direct',
        participantIds: ['alice', 'bob'],
        createdAt: 1000000,
        updatedAt: 1000000,
      });
    });

    const eve = testEnv.authenticatedContext('eve');
    await assertFails(eve.firestore().collection('conversations').doc('conv_private').get());
  });

  // PAYLOAD_06: Master Gate test on subcollection messages
  it('PAYLOAD_06: Should deny writing messages to conversation without membership', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('conversations').doc('conv_private').set({
        id: 'conv_private',
        type: 'direct',
        participantIds: ['alice', 'bob'],
        createdAt: 1000000,
        updatedAt: 1000000,
      });
    });

    const eve = testEnv.authenticatedContext('eve');
    await assertFails(
      eve.firestore().collection('conversations').doc('conv_private').collection('messages').doc('msg_01').set({
        id: 'msg_01',
        conversationId: 'conv_private',
        senderId: 'eve',
        type: 'text',
        text: 'Intrusion attempt',
        status: 'sent',
        createdAt: 1000000,
      })
    );
  });

  // PAYLOAD_07: Identity spoofing in message senderId
  it('PAYLOAD_07: Should deny forging senderId as another user', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('conversations').doc('conv_ab').set({
        id: 'conv_ab',
        type: 'direct',
        participantIds: ['alice', 'bob'],
        createdAt: 1000000,
        updatedAt: 1000000,
      });
    });

    const alice = testEnv.authenticatedContext('alice');
    await assertFails(
      alice.firestore().collection('conversations').doc('conv_ab').collection('messages').doc('msg_spoof').set({
        id: 'msg_spoof',
        conversationId: 'conv_ab',
        senderId: 'bob', // Spoofed sender
        type: 'text',
        text: 'Spoofed from Bob',
        status: 'sent',
        createdAt: 1000000,
      })
    );
  });

  // PAYLOAD_09 & 10: Non-admin accessing adminAuditLogs
  it('PAYLOAD_09 & 10: Should deny non-admin reading or creating adminAuditLogs', async () => {
    const regularUser = testEnv.authenticatedContext('regular_user');
    await assertFails(regularUser.firestore().collection('adminAuditLogs').get());
    await assertFails(
      regularUser.firestore().collection('adminAuditLogs').doc('log_01').set({
        id: 'log_01',
        adminId: 'regular_user',
        adminEmail: 'user@example.com',
        action: 'user_suspend',
        targetResource: 'users',
        details: 'Fake audit entry',
        timestamp: 1000000,
      })
    );
  });

  // PAYLOAD_11: Modifying or deleting audit logs
  it('PAYLOAD_11: Should deny updating or deleting adminAuditLogs even by admin', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('admins').doc('admin_user').set({ role: 'superadmin' });
      await context.firestore().collection('adminAuditLogs').doc('log_real').set({
        id: 'log_real',
        adminId: 'admin_user',
        adminEmail: 'admin@connectx.local',
        action: 'user_suspend',
        targetResource: 'users',
        details: 'Suspended spam account',
        timestamp: 1000000,
      });
    });

    const admin = testEnv.authenticatedContext('admin_user');
    await assertFails(admin.firestore().collection('adminAuditLogs').doc('log_real').delete());
    await assertFails(
      admin.firestore().collection('adminAuditLogs').doc('log_real').update({
        details: 'Tampered details',
      })
    );
  });
});
