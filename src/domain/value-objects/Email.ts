export class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('E-mail inválido');
    }

    this.value = value.trim().toLowerCase();
  }

  getValue(): string {
    return this.value;
  }

  private isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  }
}
