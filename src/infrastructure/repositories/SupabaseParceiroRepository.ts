// infrastructure/repositories/SupabaseParceiroRepository.ts
import { Parceiro } from '../../domain/entities/Parceiro';
import { IParceiroRepository } from '../../domain/repositories/IParceiroRepository';
import { supabase } from '../../shared/config/supabase';

export class SupabaseParceiroRepository implements IParceiroRepository {
  async create(data: any): Promise<Parceiro> { // 'any' usado aqui temporariamente se o DTO divergir da Entidade
    const { data: result, error } = await supabase
      .from('parceiros')
      .insert({
        tipo_pessoa: data.tipoPessoa,
        tipo_parceiro: data.tipoParceiro, // Adicionado conforme o banco
        nome_razao_social: data.nomeRazaoSocial,
        nome_social: data.nomeSocial, // Descomentado
        email: data.email,
        senha_hash: data.senhaHash,
        documento: data.documento,
        telefone: data.telefone,
        responsavel_legal_nome: data.responsavelLegalNome,
        responsavel_legal_cpf: data.responsavelLegalCpf,
        aceite_marketing: data.aceiteMarketing,
        parceiro_indicador_id: data.parceiroIndicadorId,
        status_aprovacao_parceiro: data.statusAprovacaoParceiro || 'PENDENTE',
        redes_sociais: data.redesSociais,
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

  async findById(id: string | number): Promise<Parceiro | null> {
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

  async update(id: string | number, data: Partial<any>): Promise<Parceiro> {
    const updateData: any = {};
    if (data.nomeRazaoSocial !== undefined) updateData.nome_razao_social = data.nomeRazaoSocial;
    if (data.nomeSocial !== undefined) updateData.nome_social = data.nomeSocial;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.statusAprovacaoParceiro !== undefined) updateData.status_aprovacao_parceiro = data.statusAprovacaoParceiro;
    if (data.parceiroIndicadorId !== undefined) updateData.parceiro_indicador_id = data.parceiroIndicadorId;
    if (data.aceiteMarketing !== undefined) updateData.aceite_marketing = data.aceiteMarketing;
    if (data.responsavelLegalNome !== undefined) updateData.responsavel_legal_nome = data.responsavelLegalNome;
    if (data.responsavelLegalCpf !== undefined) updateData.responsavel_legal_cpf = data.responsavelLegalCpf;
    if (data.redesSociais !== undefined) updateData.redes_sociais = data.redesSociais;
    if (data.tipoParceiro !== undefined) updateData.tipo_parceiro = data.tipoParceiro;

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
    id: number, 
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE', 
    observacao: string | null
  ): Promise<Parceiro> {
    const { data: result, error } = await supabase
      .from('parceiros')
      .update({
        status_aprovacao_parceiro: status,
        // observacao: observacao, // Comentado, pois 'observacao' não existe na sua tabela SQL de parceiros!
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
      tipoParceiro: data.tipo_parceiro, 
      nomeRazaoSocial: data.nome_razao_social,
      nomeSocial: data.nome_social,
      email: data.email,
      senhaHash: data.senha_hash,
      documento: data.documento,
      telefone: data.telefone,
      responsavelLegalNome: data.responsavel_legal_nome,
      responsavelLegalCpf: data.responsavel_legal_cpf,
      redesSociais: data.redes_sociais,
      aceiteMarketing: data.aceite_marketing,
      parceiroIndicadorId: data.parceiro_indicador_id,
      statusAprovacaoParceiro: data.status_aprovacao_parceiro,
      criadoEm: data.criado_em,
    } as Parceiro;
  }
}