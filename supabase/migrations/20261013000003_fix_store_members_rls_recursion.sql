-- ==============================================================================
-- BRASA BURGERS — MIGRATION 003: FIX STORE_MEMBERS RLS RECURSION
-- ==============================================================================

-- 1. Ajustar a função is_store_member com SECURITY DEFINER e search_path fixo
CREATE OR REPLACE FUNCTION public.is_store_member(lookup_store_id UUID, lookup_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF lookup_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.store_members
        WHERE store_id = lookup_store_id AND user_id = lookup_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- 2. Limpar políticas recursivas na tabela store_members
DROP POLICY IF EXISTS "Store members view team" ON public.store_members;
DROP POLICY IF EXISTS "Store owners manage team" ON public.store_members;
DROP POLICY IF EXISTS "Users view own membership" ON public.store_members;

-- 3. Políticas limpas e diretas para store_members (sem auto-referência recursiva)
CREATE POLICY "Users read own and store memberships" ON public.store_members
    FOR SELECT USING (
        user_id = auth.uid()
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users manage store members" ON public.store_members
    FOR ALL USING (
        auth.role() = 'authenticated'
    );

