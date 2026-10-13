-- ==============================================================================
-- BRASA BURGERS — SEED DATA (IDEMPOTENTE)
-- Dados oficiais de demonstração e produção inicial
-- ==============================================================================

-- 1. LOJA: BRASA BURGERS
INSERT INTO public.stores (id, name, slug, cnpj, phone, whatsapp, email, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'BRASA BURGERS',
    'brasa-burgers',
    '00.000.000/0001-99',
    '(11) 99999-9999',
    '5511999999999',
    'contato@brasaburgers.com.br',
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    whatsapp = EXCLUDED.whatsapp;

-- 2. CONFIGURAÇÕES DA LOJA (STORE_SETTINGS)
INSERT INTO public.store_settings (
    store_id,
    slogan,
    description,
    currency,
    locale,
    delivery_fee_cents,
    min_order_cents,
    free_delivery_threshold_cents,
    estimated_delivery_time_min,
    estimated_delivery_time_max,
    allow_delivery,
    allow_pickup,
    allow_advance_orders,
    address_street,
    address_number,
    address_neighborhood,
    address_city,
    address_state,
    address_zip,
    social_links,
    brand_colors,
    accepted_payment_methods,
    opening_hours
)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Sabor que une pessoas.',
    'Hambúrgueres artesanais na brasa viva, ingredientes selecionados e molhos especiais.',
    'BRL',
    'pt-BR',
    690,
    2000,
    10000,
    35,
    50,
    true,
    true,
    false,
    'Av. Principal dos Burgers',
    '1234',
    'Centro Gastronômico',
    'São Paulo',
    'SP',
    '01000-000',
    '{"instagram": "https://instagram.com/brasaburgers", "whatsapp": "https://wa.me/5511999999999"}'::jsonb,
    '{"background": "#080808", "surface": "#1C1C1C", "primary": "#FF6A00", "secondary": "#E6391F", "cream": "#F3E3C7"}'::jsonb,
    ARRAY['pix', 'dinheiro', 'cartao_entrega'],
    '[
        {"dayOfWeek": "Segunda-feira", "open": "18:00", "close": "23:00", "isOpenToday": true},
        {"dayOfWeek": "Terça-feira", "open": "18:00", "close": "23:00", "isOpenToday": true},
        {"dayOfWeek": "Quarta-feira", "open": "18:00", "close": "23:00", "isOpenToday": true},
        {"dayOfWeek": "Quinta-feira", "open": "18:00", "close": "23:30", "isOpenToday": true},
        {"dayOfWeek": "Sexta-feira", "open": "18:00", "close": "00:00", "isOpenToday": true},
        {"dayOfWeek": "Sábado", "open": "18:00", "close": "00:00", "isOpenToday": true},
        {"dayOfWeek": "Domingo", "open": "18:00", "close": "23:00", "isOpenToday": true}
    ]'::jsonb
)
ON CONFLICT (store_id) DO UPDATE SET
    slogan = EXCLUDED.slogan,
    delivery_fee_cents = EXCLUDED.delivery_fee_cents,
    min_order_cents = EXCLUDED.min_order_cents,
    free_delivery_threshold_cents = EXCLUDED.free_delivery_threshold_cents;

-- 3. ZONAS DE ENTREGA (DELIVERY_ZONES)
INSERT INTO public.delivery_zones (id, store_id, name, fee_cents, estimated_minutes, is_active)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Centro Gastronômico', 500, 30, true),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Centro', 500, 30, true),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Bela Vista', 700, 35, true),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Jardins', 800, 40, true),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Vila Mariana', 850, 45, true),
    ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Pinheiros', 900, 45, true),
    ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Moema', 1000, 50, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    fee_cents = EXCLUDED.fee_cents;

-- 4. CATEGORIAS (CATEGORIES)
INSERT INTO public.categories (id, store_id, name, slug, description, sort_order, is_active)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Hambúrgueres', 'hamburgueres', 'Burgers artesanais grelhados na brasa viva', 1, true),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Combos', 'combos', 'Combos completos com batata e refrigerante', 2, true),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Acompanhamentos', 'acompanhamentos', 'Batatas rústicas, onion rings e porções', 3, true),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Bebidas', 'bebidas', 'Refrigerantes, sucos e águas bem geladas', 4, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;

-- 5. PRODUTOS (PRODUCTS)
INSERT INTO public.products (
    id, store_id, category_id, name, slug, description, base_price_cents, promo_price_cents,
    image_url, badge, is_active, is_featured, sort_order, prep_time_min, serves
)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Brasa Clássico', 'brasa-classico', 'Blend artesanal na brasa, queijo cheddar derretido, alface fresca, tomate e molho especial da casa.',
     3290, NULL, '/images/products/brasa-classico.webp', 'Clássico', true, true, 1, 20, 1),

    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Brasa Bacon', 'brasa-bacon', 'Blend artesanal, queijo cheddar duplo, tiras generosas de bacon crocante e cebola caramelizada.',
     3690, NULL, '/images/products/brasa-bacon.webp', 'Mais pedido', true, true, 2, 20, 1),

    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Brasa BBQ', 'brasa-bbq', 'Blend artesanal, queijo cheddar, bacon, crispy onion super crocante e barbecue defumado.',
     3490, NULL, '/images/products/brasa-bbq.webp', NULL, true, false, 3, 20, 1),

    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002',
     'Combo Brasa Clássico', 'combo-classico', 'Brasa Clássico suculento, porção individual de batata rústica crocante e refrigerante gelado.',
     4990, NULL, '/images/combos/combo-classico.webp', 'Mais pedido', true, true, 4, 25, 1),

    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002',
     'Combo Brasa Bacon', 'combo-bacon', 'Brasa Bacon no ponto perfeito, batata rústica dourada e refrigerante gelado.',
     5390, NULL, '/images/combos/combo-bacon.webp', NULL, true, true, 5, 25, 1),

    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Brasa Onion', 'brasa-onion', 'Blend 180g, queijo cheddar derretido, onion rings super crocantes, alface e molho especial.',
     3590, NULL, '/images/products/brasa-onion.webp', 'Crocante', true, false, 6, 20, 1),

    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Brasa Cheese Duplo', 'brasa-cheese-duplo', 'Dois blends de 180g na brasa viva, duplo queijo cheddar derretido, tiras de bacon crocante e molho especial.',
     4290, NULL, '/images/products/brasa-cheese-duplo.webp', 'Duplo', true, true, 7, 25, 1),

    ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Brasa Fire', 'brasa-fire', 'Blend artesanal 180g, queijo cheddar, bacon crocante, cebola caramelizada e molho barbecue defumado.',
     3690, NULL, '/images/products/brasa-fire.webp', 'Novo', true, false, 8, 20, 1),

    ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
     'Brasa Veggie', 'brasa-veggie', 'Burger 100% vegetal artesanal, queijo derretido, alface americana fresca, tomate selecionado e molho especial.',
     3290, NULL, '/images/products/brasa-veggie.webp', 'Veggie', true, false, 9, 20, 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    base_price_cents = EXCLUDED.base_price_cents,
    image_url = EXCLUDED.image_url;

-- 6. INGREDIENTES DOS PRODUTOS (PRODUCT_INGREDIENTS)
INSERT INTO public.product_ingredients (product_id, name, is_removable, sort_order)
VALUES
    -- Brasa Clássico
    ('b0000000-0000-0000-0000-000000000001', 'Blend artesanal 180g', false, 1),
    ('b0000000-0000-0000-0000-000000000001', 'Queijo cheddar derretido', true, 2),
    ('b0000000-0000-0000-0000-000000000001', 'Alface americana', true, 3),
    ('b0000000-0000-0000-0000-000000000001', 'Tomate fresco', true, 4),
    ('b0000000-0000-0000-0000-000000000001', 'Molho especial da casa', true, 5),

    -- Brasa Bacon
    ('b0000000-0000-0000-0000-000000000002', 'Blend artesanal 180g', false, 1),
    ('b0000000-0000-0000-0000-000000000002', 'Queijo cheddar fatiado', true, 2),
    ('b0000000-0000-0000-0000-000000000002', 'Bacon crocante em tiras', true, 3),
    ('b0000000-0000-0000-0000-000000000002', 'Cebola caramelizada', true, 4),
    ('b0000000-0000-0000-0000-000000000002', 'Molho especial da casa', true, 5),

    -- Brasa BBQ
    ('b0000000-0000-0000-0000-000000000003', 'Blend artesanal 180g', false, 1),
    ('b0000000-0000-0000-0000-000000000003', 'Queijo cheddar', true, 2),
    ('b0000000-0000-0000-0000-000000000003', 'Bacon crocante', true, 3),
    ('b0000000-0000-0000-0000-000000000003', 'Crispy onion', true, 4),
    ('b0000000-0000-0000-0000-000000000003', 'Molho barbecue defumado', true, 5)
ON CONFLICT DO NOTHING;

-- 7. GRUPOS DE CUSTOMIZAÇÃO (CUSTOMIZATION_GROUPS)
INSERT INTO public.customization_groups (id, store_id, name, description, type, min_selections, max_selections, is_required, sort_order)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Adicione mais sabor', 'Escolha até 4 adicionais especiais', 'addition', 0, 4, false, 1),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Retirar ingredientes', 'Selecione o que deseja remover do lanche', 'removal', 0, 4, false, 2),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Escolha sua bebida', 'Item obrigatório incluso no combo', 'choice', 1, 1, true, 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type;

-- 8. OPÇÕES DE CUSTOMIZAÇÃO (CUSTOMIZATION_OPTIONS)
INSERT INTO public.customization_options (id, group_id, name, description, price_cents, is_default, is_available, max_quantity, sort_order)
VALUES
    -- Grupo 1: Adicionais
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Bacon extra', 'Fatias generosas crocantes', 400, false, true, 2, 1),
    ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Cheddar extra', 'Cheddar derretido cremoso', 300, false, true, 2, 2),
    ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'Carne extra (blend 180g)', 'Hambúrguer adicional na brasa', 900, false, true, 1, 3),
    ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'Molho especial da casa', 'Pote extra 50ml', 200, false, true, 2, 4),

    -- Grupo 2: Remoções
    ('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 'Sem alface', NULL, 0, false, true, 1, 1),
    ('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000002', 'Sem tomate', NULL, 0, false, true, 1, 2),
    ('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000002', 'Sem molho', NULL, 0, false, true, 1, 3),
    ('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000002', 'Sem queijo cheddar', NULL, 0, false, true, 1, 4),
    ('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000002', 'Sem cebola', NULL, 0, false, true, 1, 5),
    ('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000002', 'Sem bacon', NULL, 0, false, true, 1, 6),

    -- Grupo 3: Bebidas do Combo
    ('f0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000003', 'Coca-Cola Original 350ml', 'Lata gelada', 0, true, true, 1, 1),
    ('f0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000003', 'Coca-Cola Sem Açúcar 350ml', 'Lata gelada', 0, false, true, 1, 2),
    ('f0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000003', 'Guaraná Antarctica 350ml', 'Lata gelada', 0, false, true, 1, 3),
    ('f0000000-0000-0000-0000-000000000014', 'e0000000-0000-0000-0000-000000000003', 'Água Mineral 500ml', 'Garrafa gelada', 0, false, true, 1, 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_cents = EXCLUDED.price_cents;

-- 9. VINCULAÇÃO PRODUTO X GRUPOS DE CUSTOMIZAÇÃO
INSERT INTO public.product_customization_groups (product_id, group_id, sort_order)
VALUES
    -- Brasa Clássico
    ('b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 1),
    ('b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 2),

    -- Brasa Bacon
    ('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 1),
    ('b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 2),

    -- Brasa BBQ
    ('b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 1),
    ('b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 2),

    -- Combo Clássico
    ('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000003', 1),
    ('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 2),
    ('b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 3),

    -- Combo Bacon
    ('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 1),
    ('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 2),
    ('b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 3)
ON CONFLICT (product_id, group_id) DO NOTHING;
