// infrastructure/repositories/SupabaseParceiroRepository.ts
import { Parceiro } from '../../domain/entities/Parceiro';
import { IParceiroRepository } from '../../domain/repositories/IParceiroRepository';
import { supabase } from '../../shared/config/supabase';

export class SupabaseParceiroRepository implements IParceiroRepository {
  async create(data: Omit<Parceiro, 'id' | 'criadoEm'>): Promise<Parceiro> {
    const { data: result, error } = await supabase
      .from('parceiros')
      .insert({
        tipo_pessoa: data.tipoPessoa,
        nome_razao_social: data.nomeRazaoSocial,
        email: data.email,
        senha_hash: data.senhaHash,
        documento: data.documento,
        telefone: data.telefone,
        responsavel_legal_nome: data.responsavelLegalNome,
        responsavel_legal_cpf: data.responsavelLegalCpf,
        porte: data.porte,
        aceite_marketing: data.aceiteMarketing,
        parceiro_indicador_id: data.parceiroIndicadorId,
        // meio_conhecimento_id: data.meioConhecimentoId,
        expectativa_geracao: data.expectativaGeracao,
        status_aprovacao_parceiro: data.statusAprovacaoParceiro || 'PENDENTE',
        // observacao: data.observacao,
        redes_sociais: data.redesSociais,
        // nome_social: data.nomeSocial,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar parceiro: ${error.message}`);
    
    return this.mapToEntity(result);
  }

  async findByEmail(email: string): Promise<Parceiro | null> {
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw new Error(`Erro ao buscar parceiro: ${error.message}`);
    
    return data ? this.mapToEntity(data) : null;
  }

  async findById(id: string): Promise<Parceiro | null> {
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Erro ao buscar parceiro: ${error.message}`);
    
    return data ? this.mapToEntity(data) : null;
  }

  async findByDocumento(documento: string): Promise<Parceiro | null> {
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('documento', documento)
      .maybeSingle();

    if (error) throw new Error(`Erro ao buscar parceiro: ${error.message}`);
    
    return data ? this.mapToEntity(data) : null;
  }

  async update(id: string, data: Partial<Parceiro>): Promise<Parceiro> {
    const updateData: any = {};
    if (data.nomeRazaoSocial !== undefined) updateData.nome_razao_social = data.nomeRazaoSocial;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.statusAprovacaoParceiro !== undefined) updateData.status_aprovacao_parceiro = data.statusAprovacaoParceiro;
    // if (data.observacao !== undefined) updateData.observacao = data.observacao;
    if (data.parceiroIndicadorId !== undefined) updateData.parceiro_indicador_id = data.parceiroIndicadorId;
    // if (data.meioConhecimentoId !== undefined) updateData.meio_conhecimento_id = data.meioConhecimentoId;
    if (data.expectativaGeracao !== undefined) updateData.expectativa_geracao = data.expectativaGeracao;
    if (data.aceiteMarketing !== undefined) updateData.aceite_marketing = data.aceiteMarketing;
    if (data.porte !== undefined) updateData.porte = data.porte;
    if (data.responsavelLegalNome !== undefined) updateData.responsavel_legal_nome = data.responsavelLegalNome;
    if (data.responsavelLegalCpf !== undefined) updateData.responsavel_legal_cpf = data.responsavelLegalCpf;
    if (data.nomeSocial !== undefined) updateData.nome_social = data.nomeSocial;
    if (data.redesSociais !== undefined) updateData.redes_sociais = data.redesSociais;

    const { data: result, error } = await supabase
      .from('parceiros')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar parceiro: ${error.message}`);
    
    return this.mapToEntity(result);
  }

  async updateStatusComObservacao(
    id: string, 
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', 
    observacao: string | null
  ): Promise<Parceiro> {
    const { data: result, error } = await supabase
      .from('parceiros')
      .update({
        status_aprovacao_parceiro: status,
        observacao: observacao,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
    
    return this.mapToEntity(result);
  }

  async findByStatus(status: string): Promise<Parceiro[]> {
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('status_aprovacao_parceiro', status);

    if (error) throw new Error(`Erro ao buscar parceiros: ${error.message}`);
    
    return data ? data.map(this.mapToEntity) : [];
  }

  async findAll(): Promise<Parceiro[]> {
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw new Error(`Erro ao buscar parceiros: ${error.message}`);
    
    return data ? data.map(this.mapToEntity) : [];
  }

  async getParceirosIndicadores(): Promise<any[]> {
    const { data, error } = await supabase
      .from('parceiros_indicadores')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw new Error(`Erro ao buscar parceiros indicadores: ${error.message}`);
    
    return data || [];
  }

  private mapToEntity(data: any): Parceiro {
    return {
      id: data.id,
      tipoPessoa: data.tipo_pessoa,
      nomeRazaoSocial: data.nome_razao_social,
      nomeSocial: data.nome_social,
      email: data.email,
      senhaHash: data.senha_hash,
      documento: data.documento,
      telefone: data.telefone,
      responsavelLegalNome: data.responsavel_legal_nome,
      responsavelLegalCpf: data.responsavel_legal_cpf,
      porte: data.porte,
      redesSociais: data.redes_sociais,
      aceiteMarketing: data.aceite_marketing,
      parceiroIndicadorId: data.parceiro_indicador_id,
    //   meioConhecimentoId: data.meio_conhecimento_id,
      expectativaGeracao: data.expectativa_geracao,
      statusAprovacaoParceiro: data.status_aprovacao_parceiro,
    //   observacao: data.observacao,
      criadoEm: data.criado_em,
    };
  }
}