/* eslint-disable @typescript-eslint/no-empty-interface */
interface CustomMatchers<R> {
  toIncludeSamePartialMembers(a: Array<unknown>): R;
  toIncludeSameSortedPartialMembers(expected: Array<any>): R;
}

export declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}

    interface Expect extends CustomMatchers {}

    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}
