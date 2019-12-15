export interface TestT {
  foo: string;
}

export function validateTestT(x: unknown): TestT {
  const test = x as TestT;
  if (test.foo === 'denied') {
    throw new Error('Test rejection');
  }
  return test;
}
