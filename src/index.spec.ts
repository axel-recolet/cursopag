// import { Planet, PlanetDocument } from 'test/planet';
// import { compareObjects, findIndex, normalizeSort, SORT } from './index';

// describe('decodeCursor', () => {

// });

// describe('normalizeSort', () => {
//   it('should return a multidimentional array whith 1 When given a ascending string', async () => {
//     const sort = 'createdAt';

//     const result = normalizeSort(sort);

//     expect(result).toEqual([['createdAt', 1]]);
//   });

//   it('should return a multidimentional array When given a multidimentional array', async () => {
//     const sort = '-createdAt';

//     const result = normalizeSort(sort);

//     expect(result).toEqual([['createdAt', -1]]);
//   });

//   it('should return an object', async () => {
//     const sort = '-createdAt  qsdf';

//     const result = normalizeSort(sort);

//     expect(result).toEqual([
//       ['createdAt', -1],
//       ['qsdf', 1],
//     ]);
//   });

//   it('should return a multidimentional array When given a multidimentional array', async () => {
//     const sort: [keyof PlanetDocument, SORT][] = [
//       ['gravity', 'desc'],
//       ['name', 'ascending'],
//     ];

//     const result = normalizeSort<PlanetDocument>(sort);

//     expect(result).toEqual([
//       ['gravity', -1],
//       ['name', 1],
//     ]);
//   });

//   it('should return a multidimentional array When given an object', async () => {
//     const sort: { [key: string]: SORT } = {
//       createdAt: 'desc',
//       qsdf: 'ascending',
//     };

//     const result = normalizeSort(sort);

//     expect(result).toEqual([
//       ['createdAt', -1],
//       ['qsdf', 1],
//     ]);
//   });
// });

// describe('compareObjects', () => {
//   it('should return 1', async () => {
//     const objA = {
//       createdAt: new Date('2023-11-12'),
//       name: 'B',
//       count: '1',
//     };

//     const objB = {
//       createdAt: new Date('2023-11-12'),
//       name: 'B',
//       count: '0',
//     };

//     const sortCriteria: [string, 1 | -1][] = [
//       ['createdAt', -1],
//       ['name', 1],
//       ['count', -1],
//     ];

//     const result = compareObjects(objA, objB, sortCriteria);

//     expect(result).toEqual(1);
//   });

//   it('should return 1', async () => {
//     const objA = {
//       createdAt: new Date('2023-11-12'),
//       name: 'B',
//       count: '1',
//     };

//     const objB = {
//       createdAt: new Date('2023-11-12'),
//       name: 'A',
//       count: '0',
//     };

//     const sortCriteria: [string, 1 | -1][] = [
//       ['createdAt', -1],
//       ['name', 1],
//       ['count', -1],
//     ];

//     const result = compareObjects(objA, objB, sortCriteria);

//     expect(result).toEqual(-1);
//   });

//   it('should return 1', async () => {
//     const objA = {
//       createdAt: new Date('2023-11-12'),
//       name: 'B',
//       count: '1',
//     };

//     const objB = {
//       createdAt: new Date('2023-11-12'),
//       name: 'B',
//       count: '3',
//     };

//     const sortCriteria: [string, 1 | -1][] = [
//       ['createdAt', -1],
//       ['name', 1],
//       ['count', -1],
//     ];

//     const result = compareObjects(objA, objB, sortCriteria);

//     expect(result).toEqual(-1);
//   });
// });

// describe('findIndex', () => {
//   it('should ', async () => {
//     const sortCriteria: [string, 1 | -1][] = [
//       ['createdAt', -1],
//       ['name', 1],
//       ['count', -1],
//     ];

//     const ref = {
//       createdAt: new Date('2023-11-12'),
//       name: 'B',
//       count: '0',
//     };

//     const list = [
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'A',
//         count: '2',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'B',
//         count: '3',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'B',
//         count: '2',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'B',
//         count: '1',
//       },
//       ref,
//       ref,
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'D',
//         count: '0',
//       },
//     ];

//     const result = findIndex(ref, list, sortCriteria, 1);
//     expect(result).toEqual(6);
//   });

//   it('should ', async () => {
//     const sortCriteria: [string, 1 | -1][] = [
//       ['createdAt', -1],
//       ['name', 1],
//       ['count', -1],
//     ];

//     const ref = {
//       createdAt: new Date('2023-11-12'),
//       name: 'B',
//       count: '0',
//     };

//     const list = [
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'A',
//         count: '2',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'B',
//         count: '3',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'B',
//         count: '2',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'B',
//         count: '1',
//       },
//       ref,
//       ref,
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'D',
//         count: '0',
//       },
//     ];

//     const result = findIndex(ref, list, sortCriteria, -1);
//     expect(result).toEqual(4);
//   });

//   it('should ', async () => {
//     const sortCriteria: [string, 1 | -1][] = [
//       ['createdAt', -1],
//       ['name', -1],
//       ['count', 1],
//     ];

//     const ref = {
//       createdAt: new Date('2023-11-12'),
//       name: 'A',
//       count: '2',
//     };

//     const list = [
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'D',
//         count: '3',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'B',
//         count: '2',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'A',
//         count: '1',
//       },
//       ref,
//       ref,
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'A',
//         count: '3',
//       },
//     ];

//     const result = findIndex(ref, list, sortCriteria, 1);
//     expect(result).toEqual(5);
//   });

//   it('should ', async () => {
//     const sortCriteria: [string, 1 | -1][] = [
//       ['createdAt', -1],
//       ['name', -1],
//       ['count', 1],
//     ];

//     const ref = {
//       createdAt: new Date('2023-11-12'),
//       name: 'A',
//       count: '2',
//     };

//     const list = [
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'D',
//         count: '3',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'B',
//         count: '2',
//       },
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'A',
//         count: '1',
//       },
//       ref,
//       ref,
//       {
//         createdAt: new Date('2023-11-12'),
//         name: 'A',
//         count: '3',
//       },
//     ];

//     const result = findIndex(ref, list, sortCriteria, -1);
//     expect(result).toEqual(3);
//   });
// });
