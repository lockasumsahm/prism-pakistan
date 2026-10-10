import test from 'node:test';
import assert from 'node:assert/strict';
import {withTimeout} from '../web/request-timeout.js';

test('location JSON loads without the newer AbortSignal.timeout browser API', async () => {
  const original = AbortSignal.timeout;
  try {
    AbortSignal.timeout = undefined as any;
    const locations = await withTimeout(100, async signal => {
      const response = await fetch('data:application/json,{"locations":["sukkur"]}', {signal});
      return response.json();
    });
    assert.deepEqual(locations, {locations:['sukkur']});
  } finally { AbortSignal.timeout = original; }
});

test('deadline cancels a stalled body operation', async () => {
  await assert.rejects(withTimeout(10, signal => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')), {once:true});
  })), /aborted/);
});

test('completed and failed operations release their deadline', async () => {
  let successSignal, failureSignal;
  assert.equal(await withTimeout(10, async signal => { successSignal=signal; return 7; }),7);
  await assert.rejects(withTimeout(10, async signal => { failureSignal=signal; throw new Error('HTTP 503'); }), /HTTP 503/);
  await new Promise(resolve => setTimeout(resolve,25));
  assert.equal(successSignal.aborted,false);
  assert.equal(failureSignal.aborted,false);
});
