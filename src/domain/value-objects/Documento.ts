export class Documento {
  private readonly value: string;
  private readonly tipo: 'CPF' | 'CNPJ';

  constructor(value: string) {
    const normalizedValue = value.replace(/[^0-9]/g, '');

    if (normalizedValue.length === 11) {
      this.value = normalizedValue;
      this.tipo = 'CPF';
      return;
    }

    if (normalizedValue.length === 14) {
      this.value = normalizedValue;
      this.tipo = 'CNPJ';
      return;
    }

    throw new Error('Documento inválido. Informe um CPF (11 dígitos) ou CNPJ (14 dígitos)');
  }

  getValue(): string {
    return this.value;
  }

  getTipo(): 'CPF' | 'CNPJ' {
    return this.tipo;
  }
}
