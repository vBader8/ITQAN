export interface Chapter {
  id: number;
  nameArabic: string;
  nameSimple: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: "makkah" | "madinah";
}

export interface Verse {
  id: number;
  verseKey: string;
  verseNumber: number;
  textUthmani: string;
  translation: string;
}

export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
}
