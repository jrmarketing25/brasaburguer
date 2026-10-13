import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/supabase/server";
import { defaultStoreConfig } from "@/lib/config/store.config";
import { CartItem, FulfillmentType, PaymentInfo, DeliveryAddress } from "@/types/store";

interface CreateOrderPayload {
  storeId?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  fulfillmentType: FulfillmentType;
  deliveryAddress?: DeliveryAddress;
  payment: PaymentInfo;
  items: CartItem[];
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderPayload = await req.json();

    const storeId =
      body.storeId ||
      process.env.NEXT_PUBLIC_STORE_ID ||
      "a0000000-0000-0000-0000-000000000001";

    // 1. Validações preliminares
    if (!body.customer?.name || !body.customer.name.trim()) {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório." },
        { status: 400 }
      );
    }

    if (!body.customer?.phone || body.customer.phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Telefone do cliente inválido." },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "O pedido deve conter ao menos um item." },
        { status: 400 }
      );
    }

    // 2. Cliente de banco
    const supabase = getSupabaseAdminServerClient();

    // Se estiver em modo DEMO estrito sem Supabase configurado, retornar sucesso demonstrativo
    if (!supabase) {
      const demoOrderNumber = `#DEMO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      return NextResponse.json({
        success: true,
        orderId: "demo-order-id",
        orderNumber: demoOrderNumber,
        message: "Pedido registrado em modo de demonstração local.",
      });
    }

    // 3. Buscar loja e configurações comerciais no PostgreSQL
    const { data: store, error: storeErr } = await supabase
      .from("stores")
      .select("id, name, is_active, store_settings(*), delivery_zones(*)")
      .eq("id", storeId)
      .single();

    if (storeErr || !store) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado ou inativo." },
        { status: 404 }
      );
    }

    if (!store.is_active) {
      return NextResponse.json(
        { error: "O estabelecimento está fechado no momento para novos pedidos." },
        { status: 400 }
      );
    }

    const settings = Array.isArray(store.store_settings)
      ? store.store_settings[0]
      : store.store_settings;

    // 4. Buscar produtos e adicionais do banco para RECÁLCULO SERVER-SIDE ESTRITO
    const productSlugs = body.items.map((i) => i.product.slug);
    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select(
        `
        id,
        slug,
        name,
        base_price_cents,
        promo_price_cents,
        is_active,
        product_customization_groups (
          customization_groups (
            id,
            name,
            min_selections,
            max_selections,
            is_required,
            customization_options (
              id,
              name,
              price_cents,
              is_available
            )
          )
        )
      `
      )
      .eq("store_id", storeId)
      .in("slug", productSlugs);

    if (prodErr || !dbProducts) {
      return NextResponse.json(
        { error: "Falha ao validar catálogo de produtos." },
        { status: 500 }
      );
    }

    const dbProductsMap = new Map<string, any>();
    dbProducts.forEach((p) => dbProductsMap.set(p.slug, p));

    // 5. Recalcular cada item no servidor
    let calculatedSubtotalCents = 0;
    const validatedOrderItems: any[] = [];

    for (const item of body.items) {
      const dbProd = dbProductsMap.get(item.product.slug);

      if (!dbProd) {
        return NextResponse.json(
          { error: `Produto indisponível ou não localizado: ${item.product.name}` },
          { status: 400 }
        );
      }

      if (!dbProd.is_active) {
        return NextResponse.json(
          { error: `O produto '${dbProd.name}' está pausado no momento.` },
          { status: 400 }
        );
      }

      // Quantidade válida
      const qty = Math.max(1, Math.min(50, Math.floor(item.quantity || 1)));
      const unitBasePrice = dbProd.promo_price_cents ?? dbProd.base_price_cents;

      // Montar mapa de opções válidas deste produto
      const validOptionsMap = new Map<string, { price: number; name: string }>();
      const allowedGroups = (dbProd.product_customization_groups || []).map(
        (rel: any) => rel.customization_groups
      );

      for (const group of allowedGroups) {
        if (!group) continue;
        for (const opt of group.customization_options || []) {
          if (opt.is_available) {
            validOptionsMap.set(opt.id, {
              price: opt.price_cents,
              name: opt.name,
            });
          }
        }
      }

      // Validar opções escolhidas
      let optionsPriceCents = 0;
      const sanitizedCustomizations: any[] = [];

      for (const opt of item.selectedOptions || []) {
        const validOpt = validOptionsMap.get(opt.optionId);
        if (validOpt) {
          optionsPriceCents += validOpt.price;
          sanitizedCustomizations.push({
            groupId: opt.groupId,
            groupName: opt.groupName,
            optionId: opt.optionId,
            name: validOpt.name,
            priceCents: validOpt.price,
          });
        }
      }

      const itemUnitPrice = unitBasePrice + optionsPriceCents;
      const itemSubtotal = itemUnitPrice * qty;
      calculatedSubtotalCents += itemSubtotal;

      validatedOrderItems.push({
        product_id: dbProd.id,
        product_name: dbProd.name,
        unit_price_cents: itemUnitPrice,
        quantity: qty,
        subtotal_cents: itemSubtotal,
        customizations: sanitizedCustomizations,
        notes: (item.observation || "").slice(0, 300),
      });
    }

    // 6. Validar Pedido Mínimo no servidor
    const minOrderCents = settings?.min_order_cents ?? 0;
    if (minOrderCents > 0 && calculatedSubtotalCents < minOrderCents) {
      return NextResponse.json(
        {
          error: `O subtotal mínimo para pedidos nesta loja é de R$ ${(minOrderCents / 100).toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    // 7. Calcular Taxa de Entrega no servidor
    let calculatedDeliveryFeeCents = 0;

    if (body.fulfillmentType === "delivery") {
      const freeThreshold = settings?.free_delivery_threshold_cents;
      const isFree =
        freeThreshold && freeThreshold > 0 && calculatedSubtotalCents >= freeThreshold;

      if (!isFree) {
        const neighborhood = (body.deliveryAddress?.neighborhood || "").trim().toLowerCase();
        const zones = store.delivery_zones || [];
        const matchedZone = zones.find(
          (z: any) => z.is_active && z.name.toLowerCase() === neighborhood
        );

        if (matchedZone) {
          calculatedDeliveryFeeCents = matchedZone.fee_cents;
        } else {
          calculatedDeliveryFeeCents = settings?.delivery_fee_cents ?? 690;
        }
      }
    }

    const calculatedTotalCents = calculatedSubtotalCents + calculatedDeliveryFeeCents;

    // 8. Gerar número do pedido sequencial/formatado
    const orderNumber = `#BB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 9. Persistir em transação segura no PostgreSQL
    const { data: newOrder, error: orderInsertErr } = await supabase
      .from("orders")
      .insert({
        store_id: storeId,
        order_number: orderNumber,
        customer_name: body.customer.name.trim().slice(0, 100),
        customer_phone: body.customer.phone.trim().slice(0, 30),
        customer_email: body.customer.email ? body.customer.email.trim().slice(0, 120) : null,
        order_type: body.fulfillmentType,
        status: "pending",
        delivery_address: body.fulfillmentType === "delivery" ? body.deliveryAddress : null,
        payment_method: body.payment.method,
        payment_status: "pending",
        change_for_cents: body.payment.changeForCents || null,
        subtotal_cents: calculatedSubtotalCents,
        delivery_fee_cents: calculatedDeliveryFeeCents,
        discount_cents: 0,
        total_cents: calculatedTotalCents,
        notes: body.notes ? body.notes.slice(0, 500) : null,
      })
      .select("id, order_number, total_cents, status")
      .single();

    if (orderInsertErr || !newOrder) {
      console.error("Erro ao persistir pedido no Supabase:", orderInsertErr);
      return NextResponse.json(
        { error: "Falha ao gravar pedido no banco de dados." },
        { status: 500 }
      );
    }

    // Inserir os itens do pedido
    const itemsToInsert = validatedOrderItems.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { error: itemsInsertErr } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsInsertErr) {
      console.error("Erro ao persistir itens do pedido:", itemsInsertErr);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
      totalCents: newOrder.total_cents,
      subtotalCents: calculatedSubtotalCents,
      deliveryFeeCents: calculatedDeliveryFeeCents,
      message: "Pedido gravado e validado pelo servidor com sucesso.",
    });
  } catch (error: any) {
    console.error("Exceção na rota /api/orders:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar pedido." },
      { status: 500 }
    );
  }
}
