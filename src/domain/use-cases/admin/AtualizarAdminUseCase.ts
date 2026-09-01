import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';
import { Admin } from '../../../domain/entities/Admin';
import bcrypt from 'bcrypt';

interface AtualizarAdminDTO {
  nome?: string;
  email?: string;
  senhaAtual?: string; 
  novaSenha?: string;  
  nivelAcesso?: 'admin' ;
}

export class AtualizarAdminUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(id: number, data: AtualizarAdminDTO): Promise<Admin> {
    const adminExistente = await this.adminRepository.findById(id);
    if (!adminExistente) {
      throw new Error('Administrador não encontrado.');
    }
    console.log("📥 DADOS RECEBIDOS NO USE CASE:", data); // 👈 ADICIONE ESTE LOG

    const dadosAtualizados: Partial<Admin> = {};

    // Atualiza nome e email
    if (data.nome !== undefined) dadosAtualizados.nome = data.nome;
    if (data.email !== undefined && data.email !== adminExistente.email) {
      const emailEmUso = await this.adminRepository.findByEmail(data.email);
      if (emailEmUso) throw new Error('Este e-mail já está em uso.');
      dadosAtualizados.email = data.email;
    }

    // 🛡️ VALIDAÇÃO DE SEGURANÇA: TROCA DE SENHA
    if (data.novaSenha && data.novaSenha.trim() !== '') {
      if (!data.senhaAtual) {
        throw new Error('Para alterar a senha, você precisa informar a senha atual.');
      }

      // Verifica se a senha digitada bate com o hash salvo no banco
      const senhaValida = await bcrypt.compare(data.senhaAtual, adminExistente.senhaHash);
      if (!senhaValida) {
        throw new Error('A senha atual está incorreta.');
      }

      // Se passou pela validação, criptografa a NOVA senha
      const saltRounds = 10;
      dadosAtualizados.senhaHash = await bcrypt.hash(data.novaSenha, saltRounds);
    }

    if (data.nivelAcesso !== undefined) dadosAtualizados.nivelAcesso = data.nivelAcesso;

    return await this.adminRepository.update(id, dadosAtualizados);
  }
}