
export type StoredImage = {
  name: string;
  type: string;
  size: number;
  data: string;
};

export type StoredActivity = {
  title: string;
  description: string;
  beforeImages: StoredImage[];
  afterImages: StoredImage[];
};

export type InformativeBoard = {
  topos: string;
  hmerominia: string;
  skopos: string;
  activities: StoredActivity[];
  createdAt: Date;
  updatedAt: Date;
};