// domain/entities/PontoColeta.ts

export type CategoriaPontoColeta = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const CategoriaPontoColetaMap: Record<CategoriaPontoColeta, string> = {
  1: 'Cozinha Industrial',
  2: 'Empresa / Industria',
  3: 'Escola / Universidade',
  4: 'Hotel / Pousada',
  5: 'Restaurante / Bar',
  6: 'Condomínio',
  7: 'Feira Livre / Eventos',
  8: 'Doador Avulso'
};

export const CategoriaPontoColetaOptions = Object.entries(CategoriaPontoColetaMap).map(
  ([value, label]) => ({
    value: Number(value) as CategoriaPontoColeta,
    label,
  })
);

const normalizeCategoriaText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const CategoriaPontoColetaSearchMap = Object.entries(CategoriaPontoColetaMap).reduce<
  Record<string, CategoriaPontoColeta>
>((acc, [value, label]) => {
  acc[normalizeCategoriaText(label)] = Number(value) as CategoriaPontoColeta;
  return acc;
}, {});

export const normalizeCategoriaPontoColeta = (
  value: string | number | undefined,
): CategoriaPontoColeta | undefined => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value as CategoriaPontoColeta;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    const numericValue = Number(trimmed);
    if (Number.isInteger(numericValue)) {
      return numericValue as CategoriaPontoColeta;
    }

    const normalized = normalizeCategoriaText(trimmed);
    return CategoriaPontoColetaSearchMap[normalized];
  }

  return undefined;
};

export const getCategoriaPontoColetaLabel = (
  value: CategoriaPontoColeta | number | undefined,
): string | undefined => {
  const normalizedValue = normalizeCategoriaPontoColeta(value);

  if (!normalizedValue) {
    return undefined;
  }

  return CategoriaPontoColetaMap[normalizedValue];
};

export interface PontoColeta {
  id: number;
  parceiroId: number;
  nomePontoColeta?: string;
  categoria: CategoriaPontoColeta;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado?: string;
  complemento?: string;
  capacidadeBombona: number;
  expectativaGeracao?: number;
  nivelAtualPct?: number;
  statusBombona?: string;
  statusAprovacaoPontoColeta?: string;
  atualizadoEm?: Date;
  longitude: string;
  latitude: string;
}