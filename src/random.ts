import { errorMsg } from "./i18n/ja/message.ts";

function* xorshift(seed: number) {
  // https://ja.wikipedia.org/wiki/Xorshift
  let x = seed;
  let y = 362436069;
  let z = 21288629;
  let w = 88675123;
  while (true) {
    const t = (x ^ (x << 11)) & 0xffffffff;
    x = y;
    y = z;
    z = w;
    w = (w ^ (w >>> 19)) ^ (t ^ (t >>> 8));
    if (w < 0) {
      yield (-w + (0x80000000 - 1));
    } else {
      yield (w);
    }
  }
}

function range(streamSize?: number) {
  if (typeof streamSize == "number" && !Number.isSafeInteger(streamSize)) {
    throw new RangeError(errorMsg.e001("streamSize"));
  }
  if (Number(streamSize ?? 0) < 0) {
    throw new RangeError(errorMsg.e002("streamSize"));
  }

  if (typeof streamSize == "number") {
    return (function* () {
      for (let i = 0; i < streamSize; i++) {
        yield 0;
      }
    })();
  } else {
    return (function* () {
      while (true) {
        yield 0;
      }
    })();
  }
}

export function random(
  { seed = 123456789, min, max, streamSize, randomGenerator, scalingFunction }: {
    seed?: number;
    min?: number;
    max?: number;
    streamSize?: number;
    randomGenerator?: Generator<number, void, unknown>;
    scalingFunction?: (num: number) => number;
  },
) {
  if (typeof seed == "number" && !Number.isSafeInteger(seed)) {
    throw new RangeError(errorMsg.e001("seed"));
  }

  if (typeof min == "number") {
    if (!Number.isSafeInteger(min)) {
      throw new RangeError(errorMsg.e001("min"));
    }
    if (0x100000000 <= min) {
      throw new RangeError(errorMsg.e004("min"));
    }
    if (min <= -0x100000000) {
      throw new RangeError(errorMsg.e004("min"));
    }
  }

  if (typeof max == "number") {
    if (!Number.isSafeInteger(max)) {
      throw new RangeError(errorMsg.e001("max"));
    }
    if (0x100000000 <= max) {
      throw new RangeError(errorMsg.e004("max"));
    }
    if (max <= -0x100000000) {
      throw new RangeError(errorMsg.e004("max"));
    }
  }

  const rangeiterator = range(streamSize);

  const scaling = scalingFunction ?? (() => {
    if (typeof min == "number" && typeof max != "number") {
      max = (min < 0) ? (0xffffffff + min) : 0xffffffff;
    }
    if (typeof min != "number" && typeof max == "number") {
      if (Number(max) < 0) {
        throw new RangeError(errorMsg.e002("max"));
      }
      min = 0;
    }
    if (typeof min == "number" && typeof max == "number") {
      const length = max - min + 1;
      const _min = min;
      if (length <= 0) {
        throw new RangeError(errorMsg.e002("max - min + 1"));
      }
      if (length <= 0xffffffff) {
        const border = 0xffffffff - (0xffffffff % length);
        return (num: number) => {
          if (border < num) {
            throw "next";
          }

          return (num % length) + _min;
        };
      } else if (0x100000000 < length) {
        throw new RangeError(errorMsg.e003());
      }
    }
    return (num: number) => {
      return num;
    };
  })();

  const randomiterator: Generator<number, void, unknown> = randomGenerator ?? xorshift(seed);

  function* _random() {
    for (const _n of rangeiterator) {
      while (true) {
        const num = randomiterator.next().value ?? 0;
        try {
          yield scaling(num);
          break;
        } catch (error) {
          switch (error) {
            case "next":
              break;
            default:
              throw error;
          }
          continue;
        }
      }
    }
  }

  return _random();
}
