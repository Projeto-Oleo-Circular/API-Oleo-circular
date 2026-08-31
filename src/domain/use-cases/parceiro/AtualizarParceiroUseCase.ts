// domain/use-cases/parceiro/AtualizarParceiroUseCase.ts
import { IParceiroRepository } from '../../repositories/IParceiroRepository';
import { AtualizarParceiroDTO } from '../../../shared/dtos/parceiro/AtualizarParceiroDTO';
import { Parceiro } from '../../entities/Parceiro';

export class AtualizarParceiroUseCase {
  constructor(private parceiroRepository: IParceiroRepository) {}

  async execute(parceiroId: number, dados: AtualizarParceiroDTO): Promise<Parceiro> {
    // 1. Buscar parceiro existente
    const parceiroExistente = await this.parceiroRepository.findById(parceiroId);
    if (!parceiroExistente) {
      throw new Error('Parceiro não encontrado.');
    }

    // 2. Verificar se email está sendo alterado e se já existe
    if (dados.email && dados.email !== parceiroExistente.email) {
      const emailExistente = await this.parceiroRepository.findByEmail(dados.email);
      if (emailExistente) {
        throw new Error('E-mail já está em uso por outro parceiro.');
      }
    }

    // 3. Verificar se documento está sendo alterado e se já existe
    if (dados.documento && dados.documento !== parceiroExistente.documento) {
      const docExistente = await this.parceiroRepository.findByDocumento(dados.documento);
      if (docExistente) {
        throw new Error('Documento já está em uso por outro parceiro.');
      }
    }

    // 4. Montar objeto de atualização (apenas campos permitidos)
    const updateData: any = {};
    if (dados.nome !== undefined) updateData.nome = dados.nome;
    if (dados.razaoSocial !== undefined) updateData.razaoSocial = dados.razaoSocial;
    if (dados.email !== undefined) updateData.email = dados.email;
    if (dados.telefone !== undefined) updateData.telefone = dados.telefone;
    if (dados.documento !== undefined) updateData.documento = dados.documento;
    if (dados.responsavelLegal !== undefined) updateData.responsavelLegal = dados.responsavelLegal;
    if (dados.redesSociais !== undefined) updateData.redesSociais = dados.redesSociais;
    if (dados.aceiteMarketing !== undefined) updateData.aceiteMarketing = dados.aceiteMarketing;
    if (dados.tipoParceiro !== undefined) updateData.tipoParceiro = dados.tipoParceiro;
    if (dados.tipoPorte !== undefined) updateData.tipoPorte = dados.tipoPorte;
    if (dados.expectativaGeracao !== undefined) updateData.expectativaGeracao = dados.expectativaGeracao;
    if (dados.observacao !== undefined) updateData.observacao = dados.observacao;
    // Endereço
    if (dados.cep !== undefined) updateData.cep = dados.cep;
    if (dados.logradouro !== undefined) updateData.logradouro = dados.logradouro;
    if (dados.numero !== undefined) updateData.numero = dados.numero;
    if (dados.bairro !== undefined) updateData.bairro = dados.bairro;
    if (dados.cidade !== undefined) updateData.cidade = dados.cidade;
    if (dados.estado !== undefined) updateData.estado = dados.estado;
    if (dados.complemento !== undefined) updateData.complemento = dados.complemento;
    if (dados.latitude !== undefined) updateData.latitude = dados.latitude;
    if (dados.longitude !== undefined) updateData.longitude = dados.longitude;

    // 5. Atualizar no repositório
    const parceiroAtualizado = await this.parceiroRepository.update(parceiroId, updateData);
    return parceiroAtualizado;
  }
}