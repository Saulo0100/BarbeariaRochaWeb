import type { AppConfig } from "./types";
import barbeariaRocha from "./barbearia-rocha";
import barbeariaPedro from "./barbearia-pedro";
import clienteB from "./cliente-b";

export type { AppConfig };

const configs: Record<string, AppConfig> = {
  "barbearia-rocha": barbeariaRocha,
  "barbearia-pedro": barbeariaPedro,
  "cliente-b": clienteB,
};

const clientKey = import.meta.env.VITE_CLIENT;

if (!(clientKey in configs)) {
  throw new Error(
    `[config] VITE_CLIENT="${clientKey}" não encontrado no mapa de clientes. ` +
      `Clientes disponíveis: ${Object.keys(configs).join(", ")}`
  );
}

export const appConfig: AppConfig = configs[clientKey];
