-- ==============================================================================
-- BRASA BURGERS — MIGRATION 004: AUDITORIA DE SEGURANÇA, HARDENING DE RLS E STORAGE
-- ==============================================================================

-- 1. Função auxiliar segura para verificação de administração da loja
CREATE OR REPLACE FUNCTION public.is_store_admin(lookup_store_id UUID, lookup_user_id UUID DEFAULT auth.uid())
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
        WHERE store_id = lookup_store_id
          AND user_id = lookup_user_id
          AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.is_store_admin(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_store_admin(UUID, UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_store_member(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_store_member(UUID, UUID) TO authenticated, service_role;

-- 2. Hardening na tabela store_members
-- Previne que qualquer usuário autenticado gerencie ou eleve privilégios em store_members
DROP POLICY IF EXISTS "Authenticated users manage store members" ON public.store_members;
DROP POLICY IF EXISTS "Users read own and store memberships" ON public.store_members;

-- Consulta de equipe: apenas membros da própria loja ou o próprio usuário
CREATE POLICY "Users read own and store memberships" ON public.store_members
    FOR SELECT USING (
        user_id = auth.uid()
        OR public.is_store_member(store_id)
    );

-- Gestão de equipe: apenas admins/owners já confirmados daquela loja específica
CREATE POLICY "Store admins manage team" ON public.store_members
    FOR ALL USING (
        public.is_store_admin(store_id)
    )
    WITH CHECK (
        public.is_store_admin(store_id)
    );

-- 3. Hardening nas tabelas de Catálogo (Customization Groups)
DROP POLICY IF EXISTS "Public read customization groups" ON public.customization_groups;
CREATE POLICY "Public read customization groups" ON public.customization_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stores s
            WHERE s.id = customization_groups.store_id
              AND s.is_active = true
        )
    );

-- 4. Hardening na tabela de Pedidos (Proteção estrita de dados de clientes)
-- Anônimos podem apenas INSERIR durante checkout público
-- Apenas membros da loja podem CONSULTAR, ATUALIZAR ou EXCLUIR pedidos
DROP POLICY IF EXISTS "Store members manage orders" ON public.orders;
CREATE POLICY "Store members manage orders" ON public.orders
    FOR ALL USING (
        public.is_store_member(store_id)
    );

DROP POLICY IF EXISTS "Store members manage order items" ON public.order_items;
CREATE POLICY "Store members manage order items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
              AND public.is_store_member(o.store_id)
        )
    );

-- 5. Hardening no Supabase Storage: Validação estrita por store_id e isolamento de tenant
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        DROP POLICY IF EXISTS "Authenticated users upload catalog assets" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated users update catalog assets" ON storage.objects;
        DROP POLICY IF EXISTS "Authenticated users delete catalog assets" ON storage.objects;

        -- Upload: exige que o primeiro segmento do caminho seja o UUID da loja e que o usuário seja membro
        CREATE POLICY "Store members upload catalog assets" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id IN ('logos', 'products', 'banners')
                AND auth.role() = 'authenticated'
                AND (
                    (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                    AND public.is_store_member(((storage.foldername(name))[1])::uuid)
                )
            );

        -- Atualização: exige que o usuário seja membro da loja dona do caminho
        CREATE POLICY "Store members update catalog assets" ON storage.objects
            FOR UPDATE USING (
                bucket_id IN ('logos', 'products', 'banners')
                AND auth.role() = 'authenticated'
                AND (
                    (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                    AND public.is_store_member(((storage.foldername(name))[1])::uuid)
                )
            );

        -- Exclusão: exige que o usuário seja membro da loja dona do caminho
        CREATE POLICY "Store members delete catalog assets" ON storage.objects
            FOR DELETE USING (
                bucket_id IN ('logos', 'products', 'banners')
                AND auth.role() = 'authenticated'
                AND (
                    (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                    AND public.is_store_member(((storage.foldername(name))[1])::uuid)
                )
            );
    END IF;
END $$;

