# Arquitetura White Label & Customização de Marca

O sistema foi arquitetado como uma plataforma **White Label Multi-Tenant**, permitindo personalizar completamente a identidade comercial, fotografias, canais de atendimento e regras de negócio para qualquer hamburgueria ou restaurante.

---

## 1. Classificação de Configurações

O sistema divide as configurações entre **Dinâmicas (em tempo de execução no banco)** e **Estáticas (código e tema)**:

| Tipo | Onde é Editado | Exige Novo Deploy? | Exemplos |
|---|---|---|---|
| **Comercial Dinâmico** | Painel `/admin/configuracoes` | **Não** (tempo real) | Nome comercial, Slogan, Descrição, Telefone, WhatsApp, Endereço, Horários, Métodos de pagamento |
| **Identidade Visual** | Painel `/admin/configuracoes` | **Não** (tempo real) | Upload de Logotipo, Banner Hero, Favicon |
| **Logística e Taxas** | Painel `/admin/entregas` | **Não** (tempo real) | Taxa padrão, frete grátis, bairros atendidos, raio de entrega |
| **Produtos e Menu** | Painel `/admin/produtos` | **Não** (tempo real) | Itens, fotos, preços em centavos, adicionais e grupos |
| **Tema Base CSS** | `tailwind.config.ts` | **Sim** | Paleta Dark Premium `#080808`, `#1C1C1C`, `#FF6A00` |
| **Fontes Oficiais** | `app/layout.tsx` | **Sim** | Famílias Bebas Neue e Inter |

---

## 2. Loja Demonstração Oficial: BRASA BURGERS

Para manter a consistência e fornecer um exemplo oficial completo, a loja padrão utiliza:
- **Store ID:** `a0000000-0000-0000-0000-000000000001`
- **Slug:** `brasa-burgers`
- **Nome:** `BRASA BURGERS`
- **WhatsApp:** `5511999999999`
- **Slogan:** `Sabor que une pessoas.`

Ao cadastrar uma nova loja comercial, um novo `store_id` UUID é gerado, e todas as tabelas comerciais (`categories`, `products`, `orders`, `delivery_zones`, `store_settings`) mantêm estrito isolamento por tenant.

---

## 3. Como Customizar para Outro Cliente

1. Acesse o painel administrativo em **[http://localhost:3000/admin](http://localhost:3000/admin)**.
2. Vá até a aba **Configurações**:
   - Altere o **Nome Comercial**, **Slogan** e **Descrição**.
   - Faça upload do **Logotipo** e do **Banner de Destaque**.
   - Defina o **WhatsApp Oficial** com DDD (ex: `5511999998888`) para onde os pedidos serão direcionados.
   - Configure o **Endereço Físico**, **Horários de Funcionamento** e **Formas de Pagamento Aceitas**.
3. Vá até a aba **Entregas**:
   - Defina a taxa de entrega e bairros atendidos.
4. Clique em **Salvar**. As alterações são refletidas instantaneamente na interface do cardápio público (`/`).
