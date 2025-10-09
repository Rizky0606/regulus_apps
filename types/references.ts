// types/references.ts
export interface Regulation {
  id: string;
  title: string;
  year: string;
  number: string;
  text: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Definition {
  id: string;
  term: string;
  meaning: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedReferences {
  regulations: Regulation[];
  definitions: Definition[];
}

export interface ReferencesData {
  allRegulations: Regulation[];
  allDefinitions: Definition[];
  selected: SelectedReferences;
}
