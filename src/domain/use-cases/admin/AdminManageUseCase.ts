import { Admin } from '../../entities/Admin';
import { Parceiro } from '../../entities/Parceiro';
import { ParceiroIndicador } from '../../entities/ParceiroIndicador';
import { IAdminRepository } from '../../repositories/IAdminRepository';
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { IParceiroIndicadorRepository } from '../../repositories/IParceiroIndicadorRepository';
import * as bcrypt from 'bcrypt';

export class AdminManageUseCase {
  constructor(
    private adminRepo: IAdminRepository,
    private parceiroRepo: IParceiroRepository,
    private indicadorRepo: IParceiroIndicadorRepository,
  ) {}

  // ==================== ADMIN ====================

  async criarAdmin(dados: {
    nome: string;
    email: string;
    senha: string;
    nivelAcesso: 'admin';
  }): Promise<Admin> {
    // Validações básicas
    if (!dados.email || !dados.senha || !dados.nome) {
      throw new Error('Dados incompletos para criar admin');
    }
    const existing = await this.adminRepo.findByEmail(dados.email);
    if (existing) throw new Error('Email já cadastrado');

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const admin = await this.adminRepo.create({
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      nivelAcesso: dados.nivelAcesso      
    });
    return admin;
  }

  async atualizarAdmin(id: number, dados: { nome?: string; email?: string }): Promise<Admin> {
    if (!id) throw new Error('ID do admin é obrigatório');
    // Pode-se validar se o email novo já existe, etc.
    const updated = await this.adminRepo.update(id, dados);
    if (!updated) throw new Error('Admin não encontrado');
    return updated;
  }

  async alterarSenhaAdmin(adminId: number, senhaAtual: string, novaSenha: string): Promise<void> {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) throw new Error('Admin não encontrado');

    const senhaCorreta = await bcrypt.compare(senhaAtual, admin.senhaHash);
    if (!senhaCorreta) throw new Error('Senha atual incorreta');

    const novaHash = await bcrypt.hash(novaSenha, 10);
    await this.adminRepo.update(adminId, { senhaHash: novaHash });
  }

  // ==================== PARCEIRO ====================

  async criarParceiro(dados: Omit<Parceiro, 'id' | 'criadoEm'>): Promise<Parceiro> {
    // Validações comuns
    if (!dados.email || !dados.documento) {
      throw new Error('Email e documento são obrigatórios');
    }
    const existingEmail = await this.parceiroRepo.findByEmail(dados.email);
    if (existingEmail) throw new Error('Email já cadastrado');

    const existingDoc = await this.parceiroRepo.findByDocumento(dados.documento);
    if (existingDoc) throw new Error('Documento já cadastrado');

    // Se houver senha, deve ser hasheada (a depender de como o repositório espera)
    if (dados.senhaHash) {
      dados.senhaHash = await bcrypt.hash(dados.senhaHash, 10);
    }

    return await this.parceiroRepo.create(dados);
  }

  async atualizarParceiro(id: number, dados: Partial<Parceiro>): Promise<Parceiro> {
    if (!id) throw new Error('ID do parceiro é obrigatório');
    // Não permitir alterar documento ou email? Pode ser permitido, mas com validação
    if (dados.email) {
      const existing = await this.parceiroRepo.findByEmail(dados.email);
      if (existing && existing.id !== id) throw new Error('Email já está em uso');
    }
    if (dados.documento) {
      const existing = await this.parceiroRepo.findByDocumento(dados.documento);
      if (existing && existing.id !== id) throw new Error('Documento já está em uso');
    }
    return await this.parceiroRepo.update(id, dados);
  }

  async excluirParceiro(id: number): Promise<void> {
    if (!id) throw new Error('ID do parceiro é obrigatório');
    await this.parceiroRepo.delete(id);
  }

  async listarParceiros(): Promise<Parceiro[]> {
    return await this.parceiroRepo.findAll();
  }

  async buscarParceiroPorId(id: number): Promise<Parceiro | null> {
    return await this.parceiroRepo.findById(id);
  }

  // ==================== PARCEIRO INDICADOR ====================

  async criarIndicador(dados: Omit<ParceiroIndicador, 'id' | 'criadoEm'>): Promise<ParceiroIndicador> {
    if (!dados.nome || !dados.cnpj) {
      throw new Error('Nome e CNPJ são obrigatórios');
    }
    // Validação de CNPJ duplicado? (pode ser feita no repositório)
    return await this.indicadorRepo.create(dados);
  }

  async atualizarIndicador(id: number, dados: Partial<ParceiroIndicador>): Promise<ParceiroIndicador> {
    if (!id) throw new Error('ID do indicador é obrigatório');
    return await this.indicadorRepo.update(id, dados);
  }

  async excluirIndicador(id: number): Promise<void> {
    if (!id) throw new Error('ID do indicador é obrigatório');
    await this.indicadorRepo.delete(id);
  }

//   async listarIndicadores(): Promise<ParceiroIndicador[]> {
//     return await this.indicadorRepo.findAll();
//   }

  async listarIndicadoresAtivos(): Promise<ParceiroIndicador[]> {
    return await this.indicadorRepo.findAllAtivos();
  }

  async buscarIndicadorPorId(id: number): Promise<ParceiroIndicador | null> {
    return await this.indicadorRepo.findById(id);
  }
}