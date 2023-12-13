import { Binary, UUID } from 'bson';
import { Types } from 'mongoose';
import { isRegExp } from 'util/types';

/**
 * Represents a RankedValue that holds a value with a specified rank.
 * @template T - The type of the value held by RankedValue.
 */
export class RankedValue<T = unknown> {
  /**
   * The rank of the RankedValue.
   */
  readonly rank: number;
  /**
   * The internal value held by the RankedValue.
   * @private
   */
  private readonly _value?: unknown;

  /**
   * Creates a RankedValue instance.
   * @param {T} value - The value to be stored in the RankedValue.
   * @param {1 | -1} direction - The direction of the RankedValue (1 for ascending, -1 for descending).
   */
  constructor(
    public readonly value: T,
    public readonly direction: 1 | -1,
  ) {
    // Initialize properties using setProperties method.
    const { _value, rank } = this.setProperties(value, direction);

    this._value = _value;
    this.rank = rank;
  }

  /**
   * Sets properties like rank and _value based on the provided value and direction.
   * @param {unknown} value - The value to determine properties for.
   * @param {1 | -1} direction - The direction used in determining properties.
   * @returns {{ _value: unknown; rank: number }} - Object containing _value and rank.
   * @throws {Error} - Throws an error if setting properties fails.
   */
  setProperties(
    value: unknown,
    direction: 1 | -1,
  ): { _value: unknown; rank: number } {
    try {
      // Determine and set properties based on the type of value.
      if (value === undefined) {
        // Set rank based on direction when value is undefined.
        return { rank: direction === 1 ? 1 : 0, _value: value };
      } else if (value === null) {
        // Set rank based on direction when value is null.
        return { rank: direction === 1 ? 0 : 1, _value: value };
      } else if (
        typeof value === 'number' ||
        typeof value === 'bigint' ||
        value instanceof Types.Decimal128
      ) {
        // Set rank as 2 for numbers or instances of Types.Decimal128.
        const rank = 2;

        if (value instanceof Types.Decimal128) {
          return { rank, _value: +value.toString() };
        }
        return { rank, _value: value };
      } else if (typeof value === 'string') {
        // Set rank as 3 for strings
        const rank = 3;
        return { rank: 3, _value: value };
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          // Set rank as -1 for empty arrays.
          return { rank: -1, _value: value };
        } else {
          // Create an array of RankedValue instances, sort them,
          // and get the first element's properties.
          const rank = 5;

          const acc: RankedValue[] = [];
          for (const v of value) {
            acc.push(new RankedValue(v, direction));
          }
          const rankedValue = acc.sort(
            (a, b) => a.compare(b, direction) * this.direction,
          );

          return { _value: acc, rank };
        }
      } else if (
        Buffer.isBuffer(value) ||
        value instanceof Binary ||
        value instanceof UUID
      ) {
        // Set rank as 6 for Buffers or instances of Binary.
        const rank = 6;
        if (value instanceof UUID) {
          return { rank, _value: value };
        }
        return { rank, _value: value };
      } else if (value instanceof Types.ObjectId) {
        // Set rank as 7 for instances of Types.ObjectId.
        return { _value: value.toHexString(), rank: 7 };
      } else if (typeof value === 'boolean') {
        // Set rank as 8 for booleans, 8.5 for true, and 8 for false.
        return { _value: value, rank: value === false ? 8 : 8.5 };
      } else if (value instanceof Date) {
        // Set rank as 9 for instances of Date.
        return { _value: value, rank: 9 };
      } else if (isRegExp(value)) {
        // Set rank as 10 for RegExp instances.
        return { _value: value.toString(), rank: 10 };
      } else {
        // For other objects, create a Record of RankedValues based on object properties.
        const _value: Record<string, RankedValue> = {};
        for (const [key, v] of Object.entries(value)) {
          _value[key] = new RankedValue(v, direction);
        }
        return { _value, rank: 4 };
      }
    } catch (error) {
      // Propagate any errors that occur while setting properties.
      throw error;
    }
  }

  /**
   * Compares this RankedValue with another RankedValue instance.
   * @param {RankedValue} b - The RankedValue to compare with.
   * @returns {0 | 1 | -1} - Returns 0 if values are equal, 1 if this > b, -1 if this < b.
   */
  compare(b: RankedValue, direction: 1 | -1): 0 | 1 | -1 {
    // Perform comparison based on rank and value.
    if (this.rank === 5 || b.rank === 5) {
      // For rank 5 (Array)
      const arrayA = this.rank === 5 ? (this._value as RankedValue[]) : [this];
      const arrayB = b.rank === 5 ? (b._value as RankedValue[]) : [b];

      for (let i = 0; i < arrayA.length || i < arrayB.length; i++) {
        const valueA = arrayA[i];
        const valueB = arrayB[i];

        const result = valueA.compare(valueB, direction);

        if (result === 0) {
          if (i !== 0) continue;
          else if (this.rank !== 5 || b.rank !== 5) {
            return this.rank === 5 ? (-direction as 1 | -1) : direction;
          }
        } else return result;
      }
      return 0;
    } else if (this.rank !== b.rank) {
      // If ranks are different, return 1 if this.rank > b.rank, otherwise -1.
      return this.rank > b.rank ? 1 : -1;
    } else {
      // If ranks are equal, proceed to compare values based on specific conditions.

      if (this._value === b._value) return 0; // If values are equal, return 0.
      // Compare values based on the rank of this RankedValue instance.
      else if (this.rank === 3) {
        // For rank 3 (string or symbol), compare using localeCompare.
        if (
          (this._value as string).localeCompare(b._value as string, undefined) >
          0
        ) {
          return 1;
        } else {
          return -1;
        }
      } else if (this.rank === 4) {
        // For rank 4 (object), compare values by iterating through object properties.
        let i = 0;
        const iterableARecord = Object.entries(
          this._value as Record<string, RankedValue>,
        );
        const iterableBRecord = Object.entries(
          b._value as Record<string, RankedValue>,
        );

        while (i < iterableARecord.length || i < iterableBRecord.length) {
          if (iterableARecord.length <= i) return -1;
          else if (iterableBRecord.length <= i) return 1;

          const [keyA, vA] = iterableARecord[i];
          const [keyB, vB] = iterableBRecord[i];

          if (vA === undefined) return -1;
          else if (vB === undefined) return 1;
          else if (vA.rank !== vB.rank) {
            return vA.rank > vB.rank ? 1 : -1;
          } else if (keyA !== keyB) {
            return vA.rank > vB.rank ? 1 : -1;
          }

          // Recursively compare values of object properties using comparison method.
          const result = vA.compare(vB, direction);
          // If properties are not equal, return the comparison result.
          if (result !== 0) return result;
          else i++;
        }
        // If all properties are equal, return 0.
        return 0;
      } else if (this.rank === 6) {
        // Buffer
        if ((this._value as Binary).length > (b._value as Binary).length) {
          return 1;
        } else if (
          (this._value as Binary).length < (b._value as Binary).length
        ) {
          return -1;
        } else {
          for (const [i, v] of (this._value as Binary).buffer.entries()) {
            if (v > (b._value as Binary).buffer[i]) {
              return 1;
            } else if (v < (b._value as Binary).buffer[i]) {
              return -1;
            } else continue;
          }
          return 0;
        }
      } else if (this.rank === 9) {
        if ((this._value as Date).getTime() === (b._value as Date).getTime()) {
          return 0;
        } else if ((this._value as any) > (b._value as any)) {
          return 1;
        } else if ((this._value as any) < (b._value as any)) {
          return -1;
        } else {
          throw new Error('Unable to performe comparison');
        }

        // For other ranks, perform a simple value comparison.
      } else if ((this._value as any) > (b._value as any)) {
        return 1;
      } else if ((this._value as any) < (b._value as any)) {
        return -1;
      } else {
        throw new Error('Unable to performe comparison');
      }
    }
  }
}

/**
 * Compares two values or instances of RankedValue.
 * @param {unknown} a - The first value to compare.
 * @param {unknown} b - The second value to compare.
 * @param {1 | -1} direction - The direction of the comparison (1 for ascending, -1 for descending).
 * @returns {0 | 1 | -1} - Returns 0 if values are equal, 1 if a > b, -1 if a < b.
 * @throws {Error} - Throws an error if comparison fails.
 */
export function compare(a: unknown, b: unknown, direction: 1 | -1): 0 | 1 | -1 {
  try {
    // Convert 'a' and 'b' to RankedValue instances if they are not already.
    const rankedValueA =
      a instanceof RankedValue ? a : new RankedValue(a, direction);
    const rankedValueB =
      b instanceof RankedValue ? b : new RankedValue(b, direction);

    // Perform comparison using RankedValue's comparison method.
    return rankedValueA.compare(rankedValueB, direction);
  } catch (error) {
    // Propagate any errors that occur during comparison.
    throw error;
  }
}
