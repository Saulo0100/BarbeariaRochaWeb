export interface AppConfig {
  nome: string;
  logo: string;
  tema: {
    /** Cor primária usada no gradiente (início). Ex: "oklch(0.76 0.14 75)" */
    primaryColor: string;
    /** Cor secundária usada no gradiente (fim). Ex: "oklch(0.62 0.13 70)" */
    secondaryColor: string;
  };
}
