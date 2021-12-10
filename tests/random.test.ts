import {
  assert,
  assertEquals,
  assertThrows,
  fail,
} from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { random } from "../src/random.ts";

Deno.test("random 01", () => {
  const size = 10000;
  const r = random({ streamSize: size });
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (const num of r) {
    count++;
    min = Math.min(min, num);
    max = Math.max(max, num);
  }
  assertEquals(count, size);
  // console.log([min.toString(16), max.toString(16)]);
});

Deno.test("random 02 - 1", () => {
  const size = 10000;
  const testmin = -10000;
  const r = random({ streamSize: size, min: testmin });
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (const num of r) {
    count++;
    assert(testmin <= num, `num is ${num}`);
    min = Math.min(min, num);
    max = Math.max(max, num);
  }
  assertEquals(count, size);
  // console.log([min.toString(16), max.toString(16)]);
});

Deno.test("random 02 - 2", () => {
  const size = 10000;
  const testmin = 0x80000000;
  const r = random({ streamSize: size, min: testmin });
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (const num of r) {
    count++;
    assert(testmin <= num, `num is ${num}`);
    min = Math.min(min, num);
    max = Math.max(max, num);
  }
  assertEquals(count, size);
  // console.log([min.toString(16), max.toString(16)]);
});

Deno.test("random 03", () => {
  const size = 10000;
  const testmax = 10000;
  const r = random({ streamSize: size, max: testmax });
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (const num of r) {
    count++;
    assert(num <= testmax, `num is ${num}`);
    min = Math.min(min, num);
    max = Math.max(max, num);
  }
  assertEquals(count, size);
  // console.log([min.toString(16), max.toString(16)]);
});

Deno.test("random 04", () => {
  const size = 10000;
  const testmin = -0x10000;
  const testmax = 0x10000;
  const r = random({ streamSize: size, min: testmin, max: testmax });
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (const num of r) {
    count++;
    assert(testmin <= num, `num is ${num}`);
    assert(num <= testmax, `num is ${num}`);
    min = Math.min(min, num);
    max = Math.max(max, num);
  }
  assertEquals(count, size);
  // console.log([min.toString(16), max.toString(16)]);
});

Deno.test("random 05", () => {
  const size = 10000;
  const r = random({ seed: 72 });
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (const num of r) {
    count++;
    min = Math.min(min, num);
    max = Math.max(max, num);
    if (count === size) {
      break;
    }
  }
  assertEquals(count, size);
  // console.log([min.toString(16), max.toString(16)]);
});

Deno.test("random 06", () => {
  assertThrows(
    () => {
      random({ seed: 0.1 });
    },
    RangeError,
    undefined,
    "seed = 0.1",
  );
  assertThrows(
    () => {
      random({ min: 0.1 });
    },
    RangeError,
    undefined,
    "min = 0.1",
  );
  assertThrows(
    () => {
      random({ max: 0.1 });
    },
    RangeError,
    undefined,
    "max = 0.1",
  );
  assertThrows(
    () => {
      random({ streamSize: 0.1 });
    },
    RangeError,
    undefined,
    "streamSize = 0.1",
  );

  assertThrows(
    () => {
      random({ min: 0x100000000 });
    },
    RangeError,
    undefined,
    "min = 0x100000000",
  );
  assertThrows(
    () => {
      random({ max: 0x100000000 });
    },
    RangeError,
    undefined,
    "max = 0x100000000",
  );

  assertThrows(
    () => {
      random({ min: -0x100000000 });
    },
    RangeError,
    undefined,
    "min = -0x100000000",
  );
  assertThrows(
    () => {
      random({ max: -0x100000000 });
    },
    RangeError,
    undefined,
    "max = -0x100000000",
  );

  assertThrows(
    () => {
      const _r = random({ max: -1 });
    },
    RangeError,
    undefined,
    "max = -1",
  );
  assertThrows(
    () => {
      const _r = random({ min: 0, max: -1 });
    },
    RangeError,
    undefined,
    "min = 0, max = -1",
  );

  assertThrows(
    () => {
      const _r = random({ min: -1, max: 0xffffffff });
    },
    RangeError,
    undefined,
    "min = -1 max = 0xffffffff",
  );
  assertThrows(
    () => {
      const _r = random({ min: -1, max: 0xffffffff });
    },
    RangeError,
    undefined,
    "min = -0xffffffff max = 1",
  );

  assertThrows(
    () => {
      random({ streamSize: -1 });
    },
    RangeError,
    undefined,
    "streamSize = 1",
  );

  assertThrows(
    () => {
      const r = random({
        scalingFunction: (num: number): number => {
          if (num % 2) return num;
          else throw new RangeError();
        },
      });
      for (const num of r) {
        num + 1;
      }
    },
    RangeError,
    undefined,
    "scalingFunction",
  );
});

Deno.test("random 07", () => {
  const size = 10000;
  const r1 = random({ seed: 777 });
  const r2 = random({ seed: 777 });
  let count = 0;
  while (true) {
    assertEquals(r1.next().value, r2.next().value);
    count++;
    if (count === size) {
      break;
    }
  }
  assertEquals(count, size);
  // console.log([min.toString(16), max.toString(16)]);
});

Deno.test("random 08", () => {
  const size = 10000;
  const r = random({
    streamSize: size,
    randomGenerator: (function* () {
      yield 0;
    })(),
  });
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (const num of r) {
    count++;
    min = Math.min(min, num);
    max = Math.max(max, num);
  }
  assertEquals(count, size);
  // console.log([min.toString(16), max.toString(16)]);
});
