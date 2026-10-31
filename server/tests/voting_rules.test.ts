import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, comparePassword, generateReceiptCode, sha256 } from '../utils/crypto';
import { db } from '../db/database';
import { seedDatabase } from '../db/seed';

test('Password hashing and verification with bcrypt', async () => {
  const plain = 'SecretPassword123!';
  const hashed = await hashPassword(plain);

  assert.notEqual(hashed, plain);
  assert.equal(await comparePassword(plain, hashed), true);
  assert.equal(await comparePassword('WrongPassword', hashed), false);
});

test('Cryptographic receipt code generates matching SHA-256 hash', () => {
  const { code, hash } = generateReceiptCode();

  assert.match(code, /^EVC-2026-[A-F0-9]{4}-[A-F0-9]{4}$/);
  assert.equal(hash.length, 64);
  assert.equal(sha256(code), hash);
});

test('Database transaction rollback on failed ballot operation', async () => {
  await seedDatabase(true);
  const initialBallotCount = db.ballots.countDocuments();

  try {
    await db.withTransaction(async () => {
      db.ballots.insertOne({
        id: 'temp-ballot-test',
        electionId: 'test-election',
        candidateId: 'test-cand',
        position: 'President',
        receiptHash: 'test-hash',
        createdAt: new Date().toISOString(),
      });
      // Simulate mid-transaction error
      throw new Error('Transaction simulated failure');
    });
  } catch (err: any) {
    assert.equal(err.message, 'Transaction simulated failure');
  }

  // After rollback, the temporary ballot must NOT exist
  assert.equal(db.ballots.countDocuments(), initialBallotCount);
  assert.equal(db.ballots.findById('temp-ballot-test'), null);
});

test('Voter Eligibility compound uniqueness constraint prevents duplicate records', () => {
  const electionId = 'test-elec-unique';
  const userId = 'test-user-unique';

  db.voterEligibility.insertOne({
    id: 'elig-test-1',
    electionId,
    userId,
    hasVoted: false,
    votedAt: null,
    createdAt: new Date().toISOString(),
  });

  // Second insert with same electionId + userId must throw
  assert.throws(() => {
    db.voterEligibility.insertOne({
      id: 'elig-test-2',
      electionId,
      userId,
      hasVoted: false,
      votedAt: null,
      createdAt: new Date().toISOString(),
    });
  }, /already exists/);
});

test('Anonymous ballot segregation: ballot contains no voter identification', () => {
  const ballots = db.ballots.find();
  assert.ok(ballots.length > 0, 'Ballots should be present');

  for (const b of ballots) {
    assert.equal((b as any).userId, undefined, 'Ballot must not contain voter userId');
    assert.equal((b as any).email, undefined, 'Ballot must not contain voter email');
    assert.equal((b as any).studentId, undefined, 'Ballot must not contain studentId');
    assert.ok(b.receiptHash, 'Ballot must contain a receiptHash for verification');
  }
});
