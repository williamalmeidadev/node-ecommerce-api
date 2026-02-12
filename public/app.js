const state = {
  baseUrl: window.location.origin,
  activeTab: "users",
  users: [],
  products: [],
  orders: [],
  selected: null,
};

const el = (selector) => document.querySelector(selector);
const listContent = el("#listContent");
const listTitle = el("#listTitle");
const detailTitle = el("#detailTitle");
const detailContent = el("#detailContent");
const toast = el("#toast");
const baseUrlInput = el("#baseUrl");
const healthStatus = el("#healthStatus");

const endpoints = [
  { method: "GET", path: "/health", desc: "Status da API" },
  { method: "POST", path: "/users", desc: "Criar usuário" },
  { method: "GET", path: "/users", desc: "Listar usuários" },
  { method: "GET", path: "/users/:id", desc: "Obter usuário" },
  { method: "PUT", path: "/users/:id", desc: "Atualizar usuário" },
  { method: "PATCH", path: "/users/:id/password", desc: "Atualizar senha" },
  { method: "DELETE", path: "/users/:id", desc: "Remover usuário" },
  { method: "POST", path: "/products", desc: "Criar produto" },
  { method: "GET", path: "/products", desc: "Listar produtos" },
  { method: "GET", path: "/products/:id", desc: "Obter produto" },
  { method: "PUT", path: "/products/:id", desc: "Atualizar produto" },
  { method: "DELETE", path: "/products/:id", desc: "Remover produto" },
  { method: "POST", path: "/orders", desc: "Criar pedido" },
  { method: "GET", path: "/orders", desc: "Listar pedidos" },
  { method: "GET", path: "/orders/:id", desc: "Obter pedido" },
  { method: "PUT", path: "/orders/:id", desc: "Atualizar pedido" },
  { method: "DELETE", path: "/orders/:id", desc: "Remover pedido" },
  { method: "GET", path: "/orders/:id/detail", desc: "Detalhes do pedido" },
];

function showToast(message, type = "info") {
  toast.textContent = message;
  toast.classList.add("show");
  toast.style.borderColor =
    type === "error" ? "rgba(249, 115, 22, 0.7)" : "rgba(45, 212, 191, 0.6)";
  window.setTimeout(() => toast.classList.remove("show"), 3200);
}

async function apiFetch(path, options = {}) {
  const url = `${state.baseUrl}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || `Erro ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function setActiveTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  const titles = {
    users: "Usuários",
    products: "Produtos",
    orders: "Pedidos",
    endpoints: "Endpoints",
  };

  listTitle.textContent = titles[tab];
  detailTitle.textContent = tab === "endpoints" ? "Guia rápido" : "Detalhes";
  el("#newBtn").style.display = tab === "endpoints" ? "none" : "inline-flex";
  el("#refreshBtn").style.display = tab === "endpoints" ? "none" : "inline-flex";

  if (tab === "endpoints") {
    renderEndpoints();
    renderIntro();
    return;
  }

  try {
    await refreshActive();
    renderCreateForm();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function renderEndpoints() {
  listContent.innerHTML = endpoints
    .map(
      (endpoint) => `
        <article class="card">
          <div class="card-header">
            <span class="card-title">${endpoint.method} ${endpoint.path}</span>
            <span class="badge">API</span>
          </div>
          <div class="meta">${endpoint.desc}</div>
        </article>
      `,
    )
    .join("");
}

function renderIntro() {
  detailContent.innerHTML = `
    <div class="meta">
      <p>Use esta console para criar, editar e remover registros sem ferramentas externas.</p>
      <p>Os formulários são gerados com base nos contratos reais da API.</p>
    </div>
    <div class="divider"></div>
    <div class="meta">
      <p>Base URL atual: <strong>${state.baseUrl}</strong></p>
      <p>Health: clique em "Health Check" para validar a conexão.</p>
    </div>
  `;
}

async function loadUsers() {
  state.users = await apiFetch("/users");
}

async function loadProducts() {
  state.products = await apiFetch("/products");
}

async function loadOrders() {
  state.orders = await apiFetch("/orders");
}

function renderList() {
  if (state.activeTab === "users") {
    if (state.users.length === 0) {
      listContent.innerHTML = `<div class="meta">Nenhum usuário encontrado.</div>`;
      return;
    }

    listContent.innerHTML = state.users
      .map(
        (user) => `
        <article class="card">
          <div class="card-header">
            <span class="card-title">${user.name}</span>
            <span class="badge">${user.id}</span>
          </div>
          <div class="meta">
            <span>${user.email}</span>
            <span>Criado: ${formatDate(user.created_at)}</span>
          </div>
          <div class="card-actions">
            <button class="btn ghost small" data-action="detail" data-id="${user.id}">Detalhes</button>
            <button class="btn ghost small" data-action="edit" data-id="${user.id}">Editar</button>
            <button class="btn danger small" data-action="delete" data-id="${user.id}">Excluir</button>
          </div>
        </article>
      `,
      )
      .join("");
  }

  if (state.activeTab === "products") {
    if (state.products.length === 0) {
      listContent.innerHTML = `<div class="meta">Nenhum produto encontrado.</div>`;
      return;
    }

    listContent.innerHTML = state.products
      .map(
        (product) => `
        <article class="card">
          <div class="card-header">
            <span class="card-title">${product.name}</span>
            <span class="badge">${product.id}</span>
          </div>
          <div class="meta">
            <span>Preço: ${formatMoney(product.price_cents)}</span>
            <span>Estoque: ${product.stock}</span>
            <span>Criado: ${formatDate(product.created_at)}</span>
          </div>
          <div class="card-actions">
            <button class="btn ghost small" data-action="detail" data-id="${product.id}">Detalhes</button>
            <button class="btn ghost small" data-action="edit" data-id="${product.id}">Editar</button>
            <button class="btn danger small" data-action="delete" data-id="${product.id}">Excluir</button>
          </div>
        </article>
      `,
      )
      .join("");
  }

  if (state.activeTab === "orders") {
    if (state.orders.length === 0) {
      listContent.innerHTML = `<div class="meta">Nenhum pedido encontrado.</div>`;
      return;
    }

    listContent.innerHTML = state.orders
      .map(
        (order) => `
        <article class="card">
          <div class="card-header">
            <span class="card-title">Pedido ${order.id}</span>
            <span class="badge">${order.status}</span>
          </div>
          <div class="meta">
            <span>Usuário: ${order.user_id}</span>
            <span>Criado: ${formatDate(order.created_at)}</span>
          </div>
          <div class="card-actions">
            <button class="btn ghost small" data-action="detail" data-id="${order.id}">Detalhes</button>
            <button class="btn ghost small" data-action="edit" data-id="${order.id}">Editar</button>
            <button class="btn danger small" data-action="delete" data-id="${order.id}">Excluir</button>
          </div>
        </article>
      `,
      )
      .join("");
  }
}

function renderCreateForm() {
  if (state.activeTab === "users") {
    detailContent.innerHTML = `
      <form id="userForm" class="detail">
        <div class="field">
          <label>Nome</label>
          <input name="name" required placeholder="Nome completo" />
        </div>
        <div class="field">
          <label>Email</label>
          <input name="email" type="email" required placeholder="email@exemplo.com" />
        </div>
        <div class="field">
          <label>Senha</label>
          <input name="password" type="password" required placeholder="Senha segura" />
        </div>
        <button class="btn primary">Criar usuário</button>
      </form>
    `;
  }

  if (state.activeTab === "products") {
    detailContent.innerHTML = `
      <form id="productForm" class="detail">
        <div class="field">
          <label>Nome</label>
          <input name="name" required placeholder="Nome do produto" />
        </div>
        <div class="field">
          <label>Preço (centavos)</label>
          <input name="price_cents" type="number" min="0" step="1" required />
        </div>
        <div class="field">
          <label>Estoque</label>
          <input name="stock" type="number" min="0" step="1" required />
        </div>
        <button class="btn primary">Criar produto</button>
      </form>
    `;
  }

  if (state.activeTab === "orders") {
    detailContent.innerHTML = `
      <form id="orderForm" class="detail">
        <div class="field">
          <label>ID do usuário</label>
          <input name="user_id" required placeholder="UUID do usuário" />
        </div>
        <div class="field">
          <label>Status</label>
          <select name="status" required>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="canceled">canceled</option>
          </select>
        </div>
        <div class="divider"></div>
        <div>
          <div class="inline" style="justify-content: space-between; align-items: center;">
            <span class="badge">Itens do pedido</span>
            <button type="button" class="btn ghost small" id="addItem">Adicionar item</button>
          </div>
          <div id="itemsContainer" class="detail" style="margin-top: 12px;"></div>
        </div>
        <button class="btn primary">Criar pedido</button>
      </form>
    `;
    prepareOrderItems([]);
  }
}

function renderUserDetail(user) {
  detailContent.innerHTML = `
    <div class="detail">
      <div class="meta">
        <strong>${user.name}</strong>
        <span>${user.email}</span>
        <span>ID: ${user.id}</span>
        <span>Criado: ${formatDate(user.created_at)}</span>
      </div>
      <div class="divider"></div>
      <div class="inline">
        <button class="btn ghost" id="editUser">Editar</button>
        <button class="btn ghost" id="passwordUser">Alterar senha</button>
      </div>
    </div>
  `;

  el("#editUser").addEventListener("click", () => renderUserEdit(user));
  el("#passwordUser").addEventListener("click", () => renderPasswordForm(user));
}

function renderPasswordForm(user) {
  detailContent.innerHTML = `
    <form id="passwordForm" class="detail">
      <div class="meta">Atualizar senha para <strong>${user.name}</strong></div>
      <div class="field">
        <label>Nova senha</label>
        <input name="password" type="password" required />
      </div>
      <div class="inline">
        <button class="btn primary">Salvar</button>
        <button type="button" class="btn ghost" id="cancelPassword">Cancelar</button>
      </div>
    </form>
  `;

  el("#cancelPassword").addEventListener("click", renderCreateForm);
  el("#passwordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = event.target.password.value;
    try {
      await apiFetch(`/users/${user.id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password }),
      });
      showToast("Senha atualizada com sucesso");
      renderUserDetail(user);
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

function renderUserEdit(user) {
  detailContent.innerHTML = `
    <form id="userEditForm" class="detail">
      <div class="field">
        <label>Nome</label>
        <input name="name" required value="${user.name}" />
      </div>
      <div class="field">
        <label>Email</label>
        <input name="email" type="email" required value="${user.email}" />
      </div>
      <div class="inline">
        <button class="btn primary">Salvar alterações</button>
        <button type="button" class="btn ghost" id="cancelEdit">Cancelar</button>
      </div>
    </form>
  `;

  el("#cancelEdit").addEventListener("click", renderCreateForm);
  el("#userEditForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: event.target.name.value,
      email: event.target.email.value,
    };

    try {
      const updated = await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Usuário atualizado");
      await refreshActive();
      renderUserDetail(updated);
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

function renderProductDetail(product) {
  detailContent.innerHTML = `
    <div class="detail">
      <div class="meta">
        <strong>${product.name}</strong>
        <span>Preço: ${formatMoney(product.price_cents)}</span>
        <span>Estoque: ${product.stock}</span>
        <span>ID: ${product.id}</span>
        <span>Criado: ${formatDate(product.created_at)}</span>
      </div>
      <div class="divider"></div>
      <button class="btn ghost" id="editProduct">Editar</button>
    </div>
  `;

  el("#editProduct").addEventListener("click", () => renderProductEdit(product));
}

function renderProductEdit(product) {
  detailContent.innerHTML = `
    <form id="productEditForm" class="detail">
      <div class="field">
        <label>Nome</label>
        <input name="name" required value="${product.name}" />
      </div>
      <div class="field">
        <label>Preço (centavos)</label>
        <input name="price_cents" type="number" min="0" step="1" required value="${product.price_cents}" />
      </div>
      <div class="field">
        <label>Estoque</label>
        <input name="stock" type="number" min="0" step="1" required value="${product.stock}" />
      </div>
      <div class="inline">
        <button class="btn primary">Salvar alterações</button>
        <button type="button" class="btn ghost" id="cancelProductEdit">Cancelar</button>
      </div>
    </form>
  `;

  el("#cancelProductEdit").addEventListener("click", renderCreateForm);
  el("#productEditForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: event.target.name.value,
      price_cents: Number(event.target.price_cents.value),
      stock: Number(event.target.stock.value),
    };

    try {
      const updated = await apiFetch(`/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Produto atualizado");
      await refreshActive();
      renderProductDetail(updated);
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

function renderOrderDetail(order) {
  const items = order.items || [];
  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.price_cents_snapshot,
    0,
  );

  detailContent.innerHTML = `
    <div class="detail">
      <div class="meta">
        <strong>Pedido ${order.id}</strong>
        <span>Status: ${order.status}</span>
        <span>Usuário: ${order.user_id}</span>
        <span>Criado: ${formatDate(order.created_at)}</span>
      </div>
      <div class="divider"></div>
      <div class="meta">
        <strong>Itens</strong>
        ${items
          .map(
            (item) => `
            <span>${item.product_name} · ${item.quantity}x · ${formatMoney(
              item.price_cents_snapshot,
            )}</span>
          `,
          )
          .join("")}
        <span>Total: ${formatMoney(total)}</span>
      </div>
      <div class="divider"></div>
      <button class="btn ghost" id="editOrder">Editar</button>
    </div>
  `;

  el("#editOrder").addEventListener("click", () => renderOrderEdit(order));
}

function renderOrderEdit(order) {
  detailContent.innerHTML = `
    <form id="orderEditForm" class="detail">
      <div class="field">
        <label>Status</label>
        <select name="status">
          <option value="pending" ${order.status === "pending" ? "selected" : ""}>pending</option>
          <option value="paid" ${order.status === "paid" ? "selected" : ""}>paid</option>
          <option value="canceled" ${order.status === "canceled" ? "selected" : ""}>canceled</option>
        </select>
      </div>
      <div class="divider"></div>
      <div>
        <div class="inline" style="justify-content: space-between; align-items: center;">
          <span class="badge">Itens do pedido</span>
          <button type="button" class="btn ghost small" id="addItem">Adicionar item</button>
        </div>
        <div id="itemsContainer" class="detail" style="margin-top: 12px;"></div>
      </div>
      <div class="inline">
        <button class="btn primary">Salvar alterações</button>
        <button type="button" class="btn ghost" id="cancelOrderEdit">Cancelar</button>
      </div>
    </form>
  `;

  prepareOrderItems(order.items || []);

  el("#cancelOrderEdit").addEventListener("click", renderCreateForm);
  el("#orderEditForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const items = collectOrderItems();
    const payload = {
      status: event.target.status.value,
      items,
    };

    try {
      const updated = await apiFetch(`/orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Pedido atualizado");
      await refreshActive();
      renderOrderDetail(updated);
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

function prepareOrderItems(items) {
  const container = el("#itemsContainer");
  container.innerHTML = "";
  const list = items.length ? items : [{ product_id: "", quantity: 1 }];

  if (state.products.length === 0) {
    container.innerHTML = `<div class="meta">Cadastre produtos antes de adicionar itens.</div>`;
    return;
  }

  list.forEach((item) => addItemRow(container, item));

  const addButton = el("#addItem");
  if (addButton) {
    addButton.onclick = () => addItemRow(container, { product_id: "", quantity: 1 });
  }
}

function addItemRow(container, item) {
  const row = document.createElement("div");
  row.className = "item-row";
  const options = state.products
    .map(
      (product) =>
        `<option value="${product.id}" ${
          product.id === item.product_id ? "selected" : ""
        }>${product.name}</option>`,
    )
    .join("");

  row.innerHTML = `
    <select name="product_id">
      <option value="">Selecione um produto</option>
      ${options}
    </select>
    <input name="quantity" type="number" min="1" step="1" value="${item.quantity || 1}" />
    <button type="button" class="btn danger small">Remover</button>
  `;

  row.querySelector("button").addEventListener("click", () => row.remove());
  container.appendChild(row);
}

function collectOrderItems() {
  const rows = Array.from(document.querySelectorAll("#itemsContainer .item-row"));
  return rows.map((row) => {
    const productId = row.querySelector("select").value;
    const quantity = Number(row.querySelector("input").value);
    return { product_id: productId, quantity };
  });
}

function formatMoney(cents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((cents || 0) / 100);
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("pt-BR");
}

async function refreshActive() {
  if (state.activeTab === "users") {
    await loadUsers();
  }
  if (state.activeTab === "products") {
    await loadProducts();
  }
  if (state.activeTab === "orders") {
    await Promise.all([loadOrders(), loadProducts()]);
  }
  renderList();
}

async function init() {
  baseUrlInput.value = state.baseUrl;

  baseUrlInput.addEventListener("change", () => {
    state.baseUrl = baseUrlInput.value || window.location.origin;
    showToast(`Base URL atualizada para ${state.baseUrl}`);
    if (state.activeTab !== "endpoints") {
      refreshActive().catch((error) => showToast(error.message, "error"));
    }
  });

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  el("#refreshBtn").addEventListener("click", refreshActive);
  el("#newBtn").addEventListener("click", renderCreateForm);

  el("#healthBtn").addEventListener("click", async () => {
    try {
      const response = await apiFetch("/health");
      healthStatus.textContent = `Status: ${response.status}`;
      healthStatus.style.color = "var(--success)";
    } catch (error) {
      healthStatus.textContent = `Status: erro (${error.message})`;
      healthStatus.style.color = "var(--danger)";
    }
  });

  listContent.addEventListener("click", async (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    if (!action || !id) return;

    try {
      if (state.activeTab === "users") {
        const user = state.users.find((item) => item.id === id);
        if (action === "detail") return renderUserDetail(user);
        if (action === "edit") return renderUserEdit(user);
        if (action === "delete") {
          await apiFetch(`/users/${id}`, { method: "DELETE" });
          showToast("Usuário removido");
          await refreshActive();
          renderCreateForm();
        }
      }

      if (state.activeTab === "products") {
        const product = state.products.find((item) => item.id === id);
        if (action === "detail") return renderProductDetail(product);
        if (action === "edit") return renderProductEdit(product);
        if (action === "delete") {
          await apiFetch(`/products/${id}`, { method: "DELETE" });
          showToast("Produto removido");
          await refreshActive();
          renderCreateForm();
        }
      }

      if (state.activeTab === "orders") {
        if (action === "detail") {
          const order = await apiFetch(`/orders/${id}/detail`);
          return renderOrderDetail(order);
        }
        if (action === "edit") {
          const order = await apiFetch(`/orders/${id}`);
          return renderOrderEdit(order);
        }
        if (action === "delete") {
          await apiFetch(`/orders/${id}`, { method: "DELETE" });
          showToast("Pedido removido");
          await refreshActive();
          renderCreateForm();
        }
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  detailContent.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      if (event.target.id === "userForm") {
        const payload = {
          name: event.target.name.value,
          email: event.target.email.value,
          password: event.target.password.value,
        };
        await apiFetch("/users", { method: "POST", body: JSON.stringify(payload) });
        showToast("Usuário criado");
        await refreshActive();
        event.target.reset();
      }

      if (event.target.id === "productForm") {
        const payload = {
          name: event.target.name.value,
          price_cents: Number(event.target.price_cents.value),
          stock: Number(event.target.stock.value),
        };
        await apiFetch("/products", { method: "POST", body: JSON.stringify(payload) });
        showToast("Produto criado");
        await refreshActive();
        event.target.reset();
      }

      if (event.target.id === "orderForm") {
        const items = collectOrderItems();
        const payload = {
          user_id: event.target.user_id.value,
          status: event.target.status.value,
          items,
        };
        await apiFetch("/orders", { method: "POST", body: JSON.stringify(payload) });
        showToast("Pedido criado");
        await refreshActive();
        renderCreateForm();
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  await Promise.all([loadUsers(), loadProducts(), loadOrders()]);
  renderList();
  renderCreateForm();
}

init().catch((error) => showToast(error.message, "error"));
