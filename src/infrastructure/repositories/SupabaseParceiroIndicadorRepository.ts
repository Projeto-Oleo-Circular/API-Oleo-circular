import { ParceiroIndicador } from '../../domain/entities/ParceiroIndicador';
import { supabase } from '../../shared/config/supabase';

interface ParceiroIndicadorRow {
  id: number;
  nome: string;
  tipo: 'ASSOCIACAO' | 'COOPERATIVA' | 'ONG';
  cnpj: string;
  email: string | null;
  telefone: string | null;
  site: string | null;
  ativo: boolean;
  criado_em: string;
}
export class SupabaseParceiroIndicadorRepository {
async findAllAtivos(): Promise<ParceiroIndicador[]> {
  const { data, error } = await supabase
    .from('parceiros_indicadores')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar parceiros ativos: ${error.message}`);
  }

  const rows = (data ?? []) as ParceiroIndicadorRow[];

  return rows.map((row) => ({
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    cnpj: row.cnpj,
    email: row.email,
    telefone: row.telefone,
    site: row.site,
    ativo: row.ativo,
    criadoEm: new Date(row.criado_em),
  }));
}}