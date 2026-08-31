import { Parceiro } from '../../domain/entities/Parceiro';
import { IParceiroRepository } from '../../domain/repositories/IParceiroRepository';
import { supabase, supabaseAdmin } from '../../shared/config/supabase';

export class SupabaseParceiroRepository implements IParceiroRepository {
  private async obterOuCriarParceiroIndicador(nomeOutroParceiro: string): Promise<number> {
    const nomeFormatado = nomeOutroParceiro.trim();

    const { data: existente } = await supabase
      .from('parceiros_indicadores')
      .select('id')
      .ilike('nome', nomeFormatado)
      .maybeSingle();

    if (existente) {
      return existente.id;
    }

    const { data: novoIndicador, error } = await supabase
      .from('parceiros_indicadores')
      .insert({
        nome: nomeFormatado,
        tipo: 'OUTRO',
        ativo: true,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Erro ao cadastrar novo parceiro indicador: ${error.message}`);
    }

    return novoIndicador.id;
  }

  async create(data: any): Promise<Parceiro> {
    let parceiroIndicadorIdFinal = data.parceiroIndicadorId ?? null;

    if (!parceiroIndicadorIdFinal && data.outroParceiro && data.outroParceiro.trim()) {
      parceiroIndicadorIdFinal = await this.obterOuCriarParceiroIndicador(data.outroParceiro);
    }

    const { data: result, error } = await supabase
      .from('parceiros')
      .insert({
        tipo_pessoa: data.tipoPessoa,
        tipo_parceiro: data.tipoParceiro,
        razao_social: data.razaoSocial,
        nome: data.nome,
        email: data.email,
        senha_hash: data.senhaHash,
        documento: data.documento,
        telefone: data.telefone,
        responsavel_legal: data.responsavelLegal,
        aceite_marketing: data.aceiteMarketing,
        parceiro_indicador_id: parceiroIndicadorIdFinal,
        como_conheceu: data.comoConheceu ?? null,
        observacao: data.observacao ?? null,
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

    if (error) throw new Error(`Erro ao buscar parceiro por email: ${error.message}`);

    return data ? this.mapToEntity(data) : null;
  }

  async findById(id: string | number): Promise<Parceiro | null> {
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Erro ao buscar parceiro por ID: ${error.message}`);

    return data ? this.mapToEntity(data) : null;
  }

  async findByDocumento(documento: string): Promise<Parceiro | null> {
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('documento', documento)
      .maybeSingle();

    if (error) throw new Error(`Erro ao buscar parceiro por documento: ${error.message}`);

    return data ? this.mapToEntity(data) : null;
  }

  async update(id: string | number, data: Partial<any>): Promise<Parceiro> {
    const updateData: any = {};
    if (data.razaoSocial !== undefined) updateData.razao_social = data.razaoSocial;
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.statusAprovacaoParceiro !== undefined) updateData.status_aprovacao_parceiro = data.statusAprovacaoParceiro;
    if (data.parceiroIndicadorId !== undefined) updateData.parceiro_indicador_id = data.parceiroIndicadorId;
    if (data.aceiteMarketing !== undefined) updateData.aceite_marketing = data.aceiteMarketing;
    if (data.responsavelLegal !== undefined) updateData.responsavel_legal = data.responsavelLegal;
    if (data.redesSociais !== undefined) updateData.redes_sociais = data.redesSociais;
    if (data.tipoParceiro !== undefined) updateData.tipo_parceiro = data.tipoParceiro;
    if (data.comoConheceu !== undefined) updateData.como_conheceu = data.comoConheceu;
    if (data.observacao !== undefined) updateData.observacao = data.observacao;
    if (data.expectativaGeracao !== undefined) updateData.expectativa_geracao = data.expectativaGeracao;
    if (data.tipoPorte !== undefined) updateData.tipo_porte = data.tipoPorte;
    if (data.senhaHash !== undefined) updateData.senha_hash = data.senhaHash;

    const { data: result, error } = await supabaseAdmin 
      .from('parceiros')
      .update(updateData)
      .eq('id', id)
      .select(); 

    if (error) throw new Error(`Erro ao atualizar parceiro: ${error.message}`);

    if (!result || result.length === 0) {
      throw new Error('Parceiro não encontrado para atualização.');
    }

    return this.mapToEntity(result[0]);
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('parceiros')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao excluir parceiro: ${error.message}`);
  }

  async updateStatusComObservacao(
    id: number,
    status: 'APROVADO' | 'REJEITADO' | 'PENDENTE',
    observacao: string | null
  ): Promise<Parceiro> {
    const updatePayload: any = {
      status_aprovacao_parceiro: status,
    };

    if (observacao !== undefined) {
      updatePayload.observacao = observacao;
    }

    const { data: result, error } = await supabase
      .from('parceiros')
      .update(updatePayload)
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

    if (error) throw new Error(`Erro ao buscar parceiros por status: ${error.message}`);

    return data ? data.map(this.mapToEntity) : [];
  }

  async findAll(): Promise<Parceiro[]> {
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw new Error(`Erro ao buscar todos os parceiros: ${error.message}`);

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
async updatePasswordByEmail(email: string, senhaHash: string): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from('parceiros')
      .update({ senha_hash: senhaHash }) 
      .eq('email', email)
      .select();

    if (error) {
      throw new Error(`Erro ao atualizar senha: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Parceiro não encontrado para este e-mail.');
    }
  }
  private mapToEntity(data: any): Parceiro {
    return {
      id: data.id,
      tipoPessoa: data.tipo_pessoa,
      tipoParceiro: data.tipo_parceiro,
      razaoSocial: data.razao_social,
      nome: data.nome,
      email: data.email,
      senhaHash: data.senha_hash,
      documento: data.documento,
      telefone: data.telefone,
      responsavelLegal: data.responsavel_legal,
      redesSociais: data.redes_sociais,
      aceiteMarketing: data.aceite_marketing,
      parceiroIndicadorId: data.parceiro_indicador_id,
      comoConheceu: data.como_conheceu,
      observacao: data.observacao,
      statusAprovacaoParceiro: data.status_aprovacao_parceiro,
      expectativaGeracao: data.expectativa_geracao ?? null,
      tipoPorte: data.tipo_porte ?? null,
      criadoEm: data.criado_em,
      updatedEm: data.updated_at,
    } as Parceiro;
  }
}