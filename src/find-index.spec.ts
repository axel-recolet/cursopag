import { findIndex } from './find-index';

describe('findIndex function', () => {
  let testList: { _id: number; name: string }[];

  beforeEach(() => {
    testList = [
      { _id: 1, name: 'Alice' },
      { _id: 2, name: 'Bob' },
      { _id: 3, name: 'Charlie' },
      { _id: 4, name: 'David' },
    ];
  });

  describe('Descending', () => {
    it('should return the correct index when cursor matches an element and skipEqual', () => {
      const cursor = { _id: 5, name: 'Daa' };
      testList.push(cursor);

      testList.sort((a, b) => {
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        } else return a._id - b._id;
      });

      const index = findIndex({
        direction: -1,
        cursor,
        list: testList,
        sort: [
          ['name', 1],
          ['_id', 1],
        ],
        skipCursor: true,
      });
      expect(index).toBe(3);
    });

    it("should return the correct index when cursor matches an element and don't skipEqual", () => {
      const cursor = { _id: 5, name: 'Daa' };
      testList.push(cursor);

      testList.sort((a, b) => {
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        } else return a._id - b._id;
      });

      const index = findIndex({
        direction: -1,
        cursor,
        list: testList,
        sort: [
          ['name', 1],
          ['_id', 1],
        ],
        skipCursor: false,
      });
      expect(index).toBe(4);
    });

    it("should return the correct index when cursor does not match any element and don't skipEqual", () => {
      const cursor = { _id: 5, name: 'Daa' };

      testList.sort((a, b) => {
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        } else return a._id - b._id;
      });

      const index = findIndex({
        direction: -1,
        cursor,
        list: testList,
        sort: [
          ['name', 1],
          ['_id', 1],
        ],
        skipCursor: false,
      });
      expect(index).toBe(3);
    });

    it('should return the correct index when cursor does not match any element and skipEqual', () => {
      const cursor = { _id: 5, name: 'Daa' };

      testList.sort((a, b) => {
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        } else return a._id - b._id;
      });

      const index = findIndex({
        direction: -1,
        cursor,
        list: testList,
        sort: [
          ['name', 1],
          ['_id', 1],
        ],
        skipCursor: true,
      });
      expect(index).toBe(3);
    });

    describe('Descending sort', () => {
      it('should return the correct index when cursor matches an element and skipEqual', () => {
        const cursor = { _id: 5, name: 'Daa' };
        testList.push(cursor);

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: -1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: true,
        });
        expect(index).toBe(1);
      });

      it("should return the correct index when cursor matches an element and don't skipEqual", () => {
        const cursor = { _id: 5, name: 'Daa' };
        testList.push(cursor);

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: -1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: false,
        });
        expect(index).toBe(2);
      });

      it("should return the correct index when cursor does not match any element and don't skipEqual", () => {
        const cursor = { _id: 5, name: 'Daa' };

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: -1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: false,
        });
        expect(index).toBe(1);
      });

      it('should return the correct index when cursor does not match any element and skipEqual', () => {
        const cursor = { _id: 5, name: 'Daa' };

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: -1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: true,
        });
        expect(index).toBe(1);
      });

      it('should return the correct index when cursor does not match any element and skipEqual (Zaa)', () => {
        const cursor = { _id: 5, name: 'Zaa' };

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: -1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: true,
        });
        expect(index).toBe(0);
      });

      it("should return the correct index when cursor does not match any element and don't skipEqual (Zaa)", () => {
        const cursor = { _id: 5, name: 'Zaa' };

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: -1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: false,
        });
        expect(index).toBe(0);
      });
    });
  });

  describe('Ascending', () => {
    it('should return the correct index when cursor matches an element and skipEqual', () => {
      const cursor = { _id: 5, name: 'Daa' };
      testList.push(cursor);

      testList.sort((a, b) => {
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        } else return a._id - b._id;
      });

      const index = findIndex({
        direction: 1,
        cursor,
        list: testList,
        sort: [
          ['name', 1],
          ['_id', 1],
        ],
        skipCursor: true,
      });
      expect(index).toBe(4);
    });

    it("should return the correct index when cursor matches an element and don't skipEqual", () => {
      const cursor = { _id: 5, name: 'Daa' };
      testList.push(cursor);

      testList.sort((a, b) => {
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        } else return a._id - b._id;
      });

      const index = findIndex({
        direction: 1,
        cursor,
        list: testList,
        sort: [
          ['name', 1],
          ['_id', 1],
        ],
        skipCursor: false,
      });
      expect(index).toBe(3);
    });

    it("should return the correct index when cursor does not match any element and don't skipEqual", () => {
      const cursor = { _id: 5, name: 'Daa' };

      testList.sort((a, b) => {
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        } else return a._id - b._id;
      });

      const index = findIndex({
        direction: 1,
        cursor,
        list: testList,
        sort: [
          ['name', 1],
          ['_id', 1],
        ],
        skipCursor: false,
      });
      expect(index).toBe(3);
    });

    it('should return the correct index when cursor does not match any element and skipEqual', () => {
      const cursor = { _id: 5, name: 'Daa' };

      testList.sort((a, b) => {
        if (a.name !== b.name) {
          return a.name.localeCompare(b.name);
        } else return a._id - b._id;
      });

      const index = findIndex({
        direction: 1,
        cursor,
        list: testList,
        sort: [
          ['name', 1],
          ['_id', 1],
        ],
        skipCursor: true,
      });
      expect(index).toBe(3);
    });

    describe('Descending sort', () => {
      it('should return the correct index when cursor matches an element and skipEqual', () => {
        const cursor = { _id: 5, name: 'Daa' };
        testList.push(cursor);

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: 1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: true,
        });
        expect(index).toBe(2);
      });

      it("should return the correct index when cursor matches an element and don't skipEqual", () => {
        const cursor = { _id: 5, name: 'Daa' };
        testList.push(cursor);

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: 1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: false,
        });
        expect(index).toBe(1);
      });

      it("should return the correct index when cursor does not match any element and don't skipEqual", () => {
        const cursor = { _id: 5, name: 'Daa' };

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: 1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: false,
        });
        expect(index).toBe(1);
      });

      it('should return the correct index when cursor does not match any element and skipEqual', () => {
        const cursor = { _id: 5, name: 'Daa' };

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return b.name.localeCompare(a.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: 1,
          cursor,
          list: testList,
          sort: [
            ['name', -1],
            ['_id', 1],
          ],
          skipCursor: true,
        });
        expect(index).toBe(1);
      });

      it('should return the correct index when cursor does not match any element and skipEqual (Zaa)', () => {
        const cursor = { _id: 5, name: 'Zaa' };

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return a.name.localeCompare(b.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: 1,
          cursor,
          list: testList,
          sort: [
            ['name', 1],
            ['_id', 1],
          ],
          skipCursor: true,
        });
        expect(index).toBe(4);
      });

      it("should return the correct index when cursor does not match any element and don't skipEqual (Zaa)", () => {
        const cursor = { _id: 5, name: 'Zaa' };

        testList.sort((a, b) => {
          if (a.name !== b.name) {
            return a.name.localeCompare(b.name);
          } else return a._id - b._id;
        });

        const index = findIndex({
          direction: 1,
          cursor,
          list: testList,
          sort: [
            ['name', 1],
            ['_id', 1],
          ],
          skipCursor: false,
        });
        expect(index).toBe(4);
      });
    });
  });
});
