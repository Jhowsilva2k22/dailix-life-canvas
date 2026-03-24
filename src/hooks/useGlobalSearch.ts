import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SearchResultType = "task" | "goal" | "habit" | "insight";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  route: string;
  matchedText?: string;
}

interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

const LIMIT_PER_GROUP = 5;
const DEBOUNCE_MS = 300;

export function useGlobalSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ results: [], loading: false, error: null });
  const abortRef = useRef(0);

  const search = useCallback(async (q: string, searchId: number) => {
    if (!user) return;
    const term = `%${q}%`;

    try {
      const [tasksRes, goalsRes, habitsRes, insightsRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, titulo, descricao, concluida, prioridade")
          .eq("user_id", user.id)
          .or(`titulo.ilike.${term},descricao.ilike.${term}`)
          .limit(LIMIT_PER_GROUP),
        supabase
          .from("goals")
          .select("id, titulo, descricao, status")
          .eq("user_id", user.id)
          .or(`titulo.ilike.${term},descricao.ilike.${term}`)
          .limit(LIMIT_PER_GROUP),
        supabase
          .from("habits")
          .select("id, titulo, descricao, categoria")
          .eq("user_id", user.id)
          .or(`titulo.ilike.${term},descricao.ilike.${term}`)
          .limit(LIMIT_PER_GROUP),
        supabase
          .from("insights")
          .select("id, titulo, texto_curto, categoria")
          .eq("ativo", true)
          .or(`titulo.ilike.${term},texto_curto.ilike.${term},categoria.ilike.${term}`)
          .limit(LIMIT_PER_GROUP),
      ]);

      if (searchId !== abortRef.current) return;

      const results: SearchResult[] = [];

      if (tasksRes.data) {
        for (const t of tasksRes.data) {
          results.push({
            id: t.id,
            type: "task",
            title: t.titulo,
            subtitle: t.concluida ? "Concluída" : t.prioridade,
            route: "foco",
            matchedText: t.descricao ?? undefined,
          });
        }
      }

      if (goalsRes.data) {
        for (const g of goalsRes.data) {
          results.push({
            id: g.id,
            type: "goal",
            title: g.titulo,
            subtitle: g.status,
            route: "foco",
            matchedText: g.descricao ?? undefined,
          });
        }
      }

      if (habitsRes.data) {
        for (const h of habitsRes.data) {
          results.push({
            id: h.id,
            type: "habit",
            title: h.titulo,
            subtitle: h.categoria,
            route: "bem-estar",
            matchedText: h.descricao ?? undefined,
          });
        }
      }

      if (insightsRes.data) {
        for (const i of insightsRes.data) {
          results.push({
            id: i.id,
            type: "insight",
            title: i.titulo,
            subtitle: i.categoria,
            route: "inicio",
            matchedText: i.texto_curto ?? undefined,
          });
        }
      }

      const anyError = tasksRes.error || goalsRes.error || habitsRes.error || insightsRes.error;
      setState({
        results,
        loading: false,
        error: anyError ? "Erro ao buscar alguns resultados" : null,
      });
    } catch {
      if (searchId !== abortRef.current) return;
      setState({ results: [], loading: false, error: "Erro ao realizar a busca" });
    }
  }, [user]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setState({ results: [], loading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    const searchId = ++abortRef.current;

    const timer = setTimeout(() => {
      search(trimmed, searchId);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, search]);

  return { query, setQuery, ...state };
}
