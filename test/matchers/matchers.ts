expect.extend({
  toIncludeSamePartialMembers(actual: Array<any>, expected: Array<any>) {
    const pass = ((): boolean => {
      if (
        !Array.isArray(actual) ||
        !Array.isArray(expected) ||
        actual.length !== expected.length
      ) {
        return false;
      }

      return this.equals(actual, expect.arrayContaining(expected));
    })();
    return {
      pass,
      message: () =>
        pass
          ? this.utils.matcherHint('.not.toIncludeSamePartialMembers') +
            '\n\n' +
            'Expected list to not exactly match the members of:\n' +
            `  ${this.utils.printExpected(expected)}\n` +
            'Received:\n' +
            `  ${this.utils.printReceived(actual)}`
          : this.utils.matcherHint('.toIncludeSamePartialMembers') +
            '\n\n' +
            'Expected list to have the following members and no more:\n' +
            `  ${this.utils.printExpected(expected)}\n` +
            'Received:\n' +
            `  ${this.utils.printReceived(actual)}`,
    };
  },

  toIncludeSameSortedPartialMembers(actual: Array<any>, expected: Array<any>) {
    const {
      pass,
      indexes: { right, wrong },
    } = ((): {
      pass: boolean;
      indexes: { right: number[]; wrong: number[] };
    } => {
      let pass = true;
      const right = [] as number[];
      const wrong = [] as number[];

      for (const [i, actu] of actual.entries()) {
        if (this.equals(actu, expected[i])) {
          right.push(i);
        } else {
          pass = false;
          wrong.push(i);
        }
      }

      if (actual.length === expected.length)
        return {
          pass,
          indexes: { right, wrong },
        };

      for (const i of expected.slice(actual.length - 1).keys()) {
        wrong.push(i);
      }
      return { pass, indexes: { right, wrong } };
    })();

    return {
      pass,
      message: () => {
        let message =
          this.utils.matcherHint(
            `${this.isNot ? '.not' : ''}.toIncludeSameSortedPartialMembers`,
          ) +
          '\n\n' +
          `Expected list to${
            this.isNot ? ' not ' : ' '
          }have the following members at the same indexes${
            this.isNot ? ' ' : ' and no more '
          }:`; // Expected list to not have the following members at the same indexes
        for (const i of !this.isNot ? wrong : right) {
          message +=
            '\n' +
            `index ${i} :\n` +
            `\t${this.utils.printExpected(expected[i])}\n` +
            'Received:\n' +
            `\t${this.utils.printReceived(actual[i])}\n`;
        }
        return message;
      },
    };
  },
});
