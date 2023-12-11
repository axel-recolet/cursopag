import { Binary, UUID } from 'bson';
import mongoose, { Schema, SchemaType, isObjectIdOrHexString } from 'mongoose';

export function isRecordStringUnknown(
  obj: unknown,
): obj is Record<string, unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !Array.isArray(obj) &&
    !Object.entries(obj).some(([key, value]) => typeof key !== 'string')
  );
}

export type SchemaPath = string;

export function isSchemaPath(path: string, schema: Schema): path is SchemaPath {
  return !!schema.path(path);
}

export function validateObjectAgainstSchema<T>(
  obj: Record<string, unknown>,
  schema: Schema<T>,
): boolean {
  // Vérifie que chaque clé de l'objet est présente dans le schéma
  for (const [key, value] of Object.entries(obj)) {
    // Vérifie que le type de la valeur correspond au schéma
    // La clé n'est pas présente dans le schéma, objet non valide
    if (!schema.path(key) || !validatePathType(key, value, schema)) {
      return false;
    }
  }

  return true; // Toutes les clés de l'objet correspondent au schéma et ont les bons types
}

// Fonction utilitaire pour valider le type
export function validatePathType(
  path: string,
  value: unknown,
  schema: Schema,
): boolean {
  const schemaType = schema.path(path);

  if (schemaType.isRequired && !value) {
    return false;
  } else if (!schemaType.options.isRequired && !value) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.String &&
    typeof value === 'string'
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.UUID &&
    value instanceof UUID
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.Number &&
    typeof value === 'number'
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.BigInt &&
    (typeof value === 'bigint' || typeof value === 'number')
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.Decimal128 &&
    value instanceof mongoose.Types.Decimal128
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.Boolean &&
    typeof value === 'boolean'
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.Date &&
    (value instanceof Date ||
      ((typeof value === 'string' || typeof value === 'number') &&
        new Date(value).toString() !== 'Invalid Date'))
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.Buffer &&
    value instanceof Binary &&
    value.sub_type === 5
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.ObjectId &&
    (value instanceof mongoose.Types.ObjectId || isObjectIdOrHexString(value))
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.Subdocument &&
    isRecordStringUnknown(value)
  ) {
    // Si c'est un schéma Mongoose, on vérifie la correspondance du sous-schéma
    return validateObjectAgainstSchema(value, schemaType.schema);
  } else if (
    schemaType instanceof mongoose.Schema.Types.Map &&
    isRecordStringUnknown(value)
  ) {
    if (!schemaType.options?.of) {
      return true;
    } else {
      for (const [key, val] of Object.entries(value)) {
        const result = validatePathType(`${path}.${key}`, val, schema);
        if (!result) return false;
      }
      return true;
    }
  } else if (schemaType instanceof mongoose.Schema.Types.Mixed) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.Array &&
    Array.isArray(value)
  ) {
    return true;
  } else if (
    schemaType instanceof mongoose.Schema.Types.DocumentArray &&
    Array.isArray(value)
  ) {
    for (const val of value) {
      const result =
        isRecordStringUnknown(val) &&
        validateObjectAgainstSchema(val, schemaType.schema);
      if (!result) return false;
    }
    return true;
  }

  return false;
}
