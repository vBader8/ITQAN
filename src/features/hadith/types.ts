export interface Collection {
  slug: string;
  name: string;
  nameArabic: string;
}

export interface Section {
  number: number;
  name: string;
}

export interface Grade {
  scholar: string;
  grade: string;
}

export interface Hadith {
  hadithNumber: number;
  arabicNumber: number;
  textArabic: string;
  textEnglish: string;
  grades: Grade[];
}
