import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { faker } from '@faker-js/faker';

export interface IPlanet {
  name: string;
  equatorialRadius: number;
  gravity: number;
  solarPosition: number;
  moons: Moon[];
  isTerrestrial: boolean;
}

export const mercury: IPlanet & { _id: string } = {
  _id: '6564bcc98df21fac2c0f3b14',
  name: 'Mercury',
  equatorialRadius: 2439.7,
  gravity: 3.7,
  solarPosition: 0,
  isTerrestrial: true,
  moons: [],
};

export const venus: IPlanet & { _id: string } = {
  _id: '6564bd1eed8c90833285a6e6',
  name: 'Venus',
  equatorialRadius: 6051.8,
  gravity: 8.87,
  solarPosition: 1,
  isTerrestrial: true,
  moons: [],
};

export const earth: IPlanet & { _id: string } = {
  _id: '6564bd26476652b7852f3f04',
  name: 'Earth',
  equatorialRadius: 6378.137,
  gravity: 9.78,
  solarPosition: 2,
  isTerrestrial: true,
  moons: [],
};

export const mars: IPlanet & { _id: string } = {
  _id: '6564bd445c21bda5569ff55b',
  name: 'Mars',
  equatorialRadius: 3396.2,
  gravity: 3.69,
  solarPosition: 3,
  isTerrestrial: true,
  moons: [],
};

export const jupiter: IPlanet & { _id: string } = {
  _id: '6564bd4eabdfab9ff8f69051',
  name: 'Jupiter',
  equatorialRadius: 71492,
  gravity: 23.12,
  solarPosition: 4,
  isTerrestrial: false,
  moons: [],
};

export const saturn: IPlanet & { _id: string } = {
  _id: '6564bd5862bd3f3c3084ed98',
  name: 'Saturn',
  equatorialRadius: 60268,
  gravity: 8.96,
  solarPosition: 5,
  isTerrestrial: false,
  moons: [],
};

export const uranus: IPlanet & { _id: string } = {
  _id: '6564bd602d3c1271c6bde575',
  name: 'Uranus',
  equatorialRadius: 25559,
  gravity: 8.69,
  solarPosition: 6,
  isTerrestrial: false,
  moons: [],
};

export const neptune: IPlanet & { _id: string } = {
  _id: '6564bd68b6e827eff839d4b6',
  name: 'Neptune',
  equatorialRadius: 24764,
  gravity: 11,
  solarPosition: 7,
  isTerrestrial: false,
  moons: [],
};

export const planets = [
  mercury,
  venus,
  earth,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
];

export interface IMoon {
  name: string;
}

@Schema()
export class Moon implements IMoon {
  @Prop()
  name: string;
}

export const MoonSchema = SchemaFactory.createForClass(Moon);

function fakeMoon(moon?: Partial<Moon>): IMoon {
  const { name = faker.company.name() } = moon ?? {};
  return {
    name,
  };
}

export type PlanetDocument = HydratedDocument<IPlanet>;

@Schema({
  id: true,
  minimize: false,
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id;
    },
  },
})
export class Planet implements IPlanet {
  id: string;

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

export const PlanetSchema = SchemaFactory.createForClass(Planet);

export function fakePlanet(planet?: Partial<Planet>): Planet {
  try {
    const {
      id = faker.database.mongodbObjectId(),
      name = faker.company.name(),
      gravity = faker.number.float(),
      equatorialRadius = faker.number.int(),
      solarPosition = faker.number.int(),
      moons = faker.helpers.multiple(() => fakeMoon(), {
        count: { min: 0, max: 3 },
      }),
      isTerrestrial = faker.datatype.boolean(),
    } = planet ?? {};

    return {
      id,
      name,
      gravity,
      equatorialRadius,
      solarPosition,
      moons,
      isTerrestrial,
    };
  } catch (error) {
    throw error;
  }
}

export function fakePlanetDocument(
  planet?: Partial<Planet>,
): IPlanet & { _id: Types.ObjectId } {
  const { id, ...rest } = fakePlanet(planet);

  return {
    _id: new Types.ObjectId(id),
    ...rest,
  };
}
