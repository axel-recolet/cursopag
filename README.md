# Cursopag

Cursopag is an npm package designed to simplify cursor-based pagination with GraphQL using Mongoose. It offers support for both forward and backward pagination.

## Installation

You can install cursopag via npm:

```bash
npm install cursopag
```

## Usage

### Function

```typescript
import { cursopag } from 'cursopag';
import mongoose, { HydratedDocument, Types, Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

type PlanetDocument = HydratedDocument<Planet>;

@Schema()
class Planet {
  _id: Types.ObjectId;

  @Prop({ unique: true })
  name: string;

  @Prop()
  equatorialRadius: number;

  @Prop()
  gravity: number;

  @Prop({ unique: true })
  solarPosition: number;

  @Prop({ type: [MoonSchema], default: [] })
  moons: Moon[];

  @Prop({ select: false })
  isTerrestrial: boolean;
}

const PlanetSchema = SchemaFactory.createForClass(Planet);

const planetModel = mongoose.model<Planet>(Planet.name, PlanetSchema);

const result = await cursopag({
  model: planetModel,
  filter: {},
  sort: `-isTerrestrial name`,
  first: 4,
  after: cursorEncoder(
    EJSON.stringify(
      {
        _id: neptune._id,
        name: neptune.name,
        isTerrestrial: neptune.isTerrestrial,
      },
      { relaxed: false },
    ),
  ),
});

console.log(result);

/*
{
  totalCount: 8,
  edges: [
    {
      node: {
        _id: '6564bd5862bd3f3c3084ed98',
        name: 'Saturn',
        equatorialRadius: 60268,
        gravity: 8.96,
        solarPosition: 5,
        moons: [...],
      },
      cursor: 'eyJfaWQiOnsiJG9pZCI6IjY1NjRiZDU4NjJiZDNmM2MzMDg0ZWQ5OCJ9LCJuYW1lIjoiU2F0dXJuIiwiaXNUZXJyZXN0cmlhbCI6ZmFsc2V9'
    },
    {
      node: {
        _id: '6564bd602d3c1271c6bde575',
        name: 'Uranus',
        equatorialRadius: 25559,
        gravity: 8.69,
        solarPosition: 6,
        moons: [...],
        
      },
      cursor: 'eyJfaWQiOnsiJG9pZCI6IjY1NjRiZDYwMmQzYzEyNzFjNmJkZTU3NSJ9LCJuYW1lIjoiVXJhbnVzIiwiaXNUZXJyZXN0cmlhbCI6ZmFsc2V9'
    }
  ],
  pageInfo: {
    hasPreviousPage: true,
    hasNextPage: false,
    startCursor: 'eyJfaWQiOnsiJG9pZCI6IjY1NjRiZDU4NjJiZDNmM2MzMDg0ZWQ5OCJ9LCJuYW1lIjoiU2F0dXJuIiwiaXNUZXJyZXN0cmlhbCI6ZmFsc2V9',
    endCursor: 'eyJfaWQiOnsiJG9pZCI6IjY1NjRiZDYwMmQzYzEyNzFjNmJkZTU3NSJ9LCJuYW1lIjoiVXJhbnVzIiwiaXNUZXJyZXN0cmlhbCI6ZmFsc2V9'
  }
}
*/
```

### Parameters

- model: The Mongoose model.
- filter: The filter query used for pagination.
- after: Cursor indicating the starting point for forward pagination.
- before: Cursor indicating the starting point for backward pagination.
- first: The number of items to fetch in forward pagination.
- last: The number of items to fetch in backward pagination.
- sort: The sorting criteria.
- projection: The projection fields.
- queryOptions: Additional query options.
- cursorDecoder: The cursor decoder function.
- cursorEncoder: The cursor encoder function.

### Response Structure

The cursopag function returns a CursopagResponse object with the following structure:

```typescript
interface Edge<T> {
  node: Document<T>;
  cursor: string;
}

interface PageInfo {
  startCursor?: string;
  hasPreviousPage: boolean;
  endCursor?: string;
  hasNextPage: boolean;
}

interface CursopagResponse<T> {
  totalCount: number;
  edges: Edge<T>[];
  pageInfo: PageInfo;
}
```

#### ref :

- [graphql.org](https://graphql.org/learn/pagination/#complete-connection-model)
- [relay.dev](https://relay.dev/graphql/connections.htm)

## Options

### Sorting Flexibility

One of the key features of cursopag is its ability to handle multiple levels of sorting across all Mongoose types. This functionality allows for versatile and intricate sorting criteria, enabling users to define complex sorting orders based on various fields and their types within a Mongoose schema.

### Sorting Unselected Fields

cursopag empowers users to sort results based on fields that are not selected by default. This functionality allows for sorting based on fields that might not be included in the selected projection of queried documents. Even though these fields are used for sorting, they remain unselected in the returned results.

This feature is particularly advantageous in scenarios where sorting criteria involve sensitive or unnecessary fields that should not be exposed in the final result set. Users can seamlessly apply sorting logic to these unselected fields without revealing their values in the retrieved data, ensuring a balance between sorting flexibility and data confidentiality.

### Customizable Cursor Encoding

Cursors in cursopag are crucial identifiers that mark specific positions in paginated data. They are constructed through a series of steps to ensure efficiency and usability in handling pagination.

1. **Lean Document**: Initially, a cursor represents a lean document, minimized to its essential components for efficient processing. It consists of the \_id (as an ObjectId) and sorted fields, offering a lightweight identifier of a specific record in the dataset.

2. **EJSON Stringification**: The cursor is then converted into a string format using EJSON (Extended JSON) stringification. This step captures the cursor's state in a readable JSON-like format, preserving the essential information required to resume pagination from a specific point.

3. **Base64 Encoding**: Following the EJSON stringification, the cursor is encoded into a Base64 format. This encoding process serves as a secure and compact representation of the cursor, suitable for transmission and storage while maintaining its integrity.

While this encoding process provides a default mechanism for cursor creation, cursopag offers the flexibility to substitute these steps with custom **_cursorEncoder_** and **_cursorDecoder_** functions. This customization enables users to replace the default encoding and decoding process with their implementation, facilitating scenarios where sorting might involve fields not visible to end-users. For instance, by encoding the cursor with a private key, users can securely manage and encode the cursor's sensitive information, enhancing data privacy and control.

## License

This package is released under the MIT License.
