export type BagLocation = 'bagroom' | 'player' | 'course';

export interface Member {
  id: string;
  name: string;
  membershipId: string;
  photoUrl?: string;
}

export interface Bag {
  id: string;
  memberId: string;
  bagNumber: string;
  location: BagLocation;
  lastUpdated: string;
  notes?: string;
}