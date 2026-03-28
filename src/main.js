// --- State & Constants ---
const defaultRecipes = [
  {
    id: "seed-1",
    name: "Tarta de Arándanos Silvestres",
    category: "Postres & Dulces",
    prepTime: "45",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1470&auto=format&fit=crop",
    ingredients: ["250g de arándanos frescos", "200g de harina integral", "100g de azúcar de coco", "2 huevos orgánicos", "Esencia de vainilla"],
    steps: ["Precalentar el horno a 180°C.", "Mezclar los ingredientes secos en un bol grande.", "Batir los huevos con la vainilla e incorporar a la mezcla.", "Añadir los arándanos con cuidado.", "Hornear durante 35-40 minutos."]
  },
  {
    id: "seed-2",
    name: "Bowl de Quinoa y Aguacate",
    category: "Ensaladas & Bowls",
    prepTime: "20",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop",
    ingredients: ["1 taza de quinoa cocida", "1 aguacate maduro", "Tomates cherry", "Espinacas baby", "Aceite de oliva virgen extra", "Limón"],
    steps: ["Lavar y preparar las verduras.", "Colocar la quinoa como base en el bowl.", "Añadir el aguacate en láminas y los tomates.", "Aliñar con limón, aceite de oliva y una pizca de sal."]
  }
];

let recipes = JSON.parse(localStorage.getItem('gourmet_recipes')) || defaultRecipes;
const categories = [
  "Postres & Dulces",
  "Platos Principales",
  "Ensaladas & Bowls",
  "Desayunos & Brunch",
  "Aperitivos & Snacks",
  "Bebidas & Smoothies"
];

// --- DOM Elements ---
const recipeGrid = document.getElementById('recipe-grid');
const emptyState = document.getElementById('empty-state');
const categoryTabs = document.getElementById('category-tabs');
const searchInput = document.getElementById('search-input');
const addRecipeBtn = document.getElementById('add-recipe-btn');
const recipeModal = document.getElementById('recipe-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// --- Initialization ---
function init() {
  renderCategories();
  renderRecipes();
  setupEventListeners();
}

// --- Rendering Functions ---

function renderCategories() {
  const tabsHTML = `
    <button class="category-tab active" data-category="all">Todas</button>
    ${categories.map(cat => `<button class="category-tab" data-category="${cat}">${cat}</button>`).join('')}
  `;
  categoryTabs.innerHTML = tabsHTML;
}

function renderRecipes(filter = 'all', searchQuery = '') {
  let filtered = recipes;

  if (filter !== 'all') {
    filtered = filtered.filter(r => r.category === filter);
  }

  if (searchQuery) {
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  if (filtered.length === 0) {
    recipeGrid.innerHTML = '';
    recipeGrid.appendChild(emptyState);
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    recipeGrid.innerHTML = filtered.map(recipe => `
      <div class="recipe-card" onclick="viewRecipe('${recipe.id}')">
        <div class="recipe-card-image">
          <img src="${recipe.image || '/hero.png'}" alt="${recipe.name}">
          <span class="recipe-card-badge">${recipe.category}</span>
        </div>
        <div class="recipe-card-content">
          <h3>${recipe.name}</h3>
          <p>${recipe.steps[0] ? recipe.steps[0].substring(0, 100) + '...' : 'Sin descripción'}</p>
          <div class="recipe-meta">
            <span>⏱️ ${recipe.prepTime || '30'} mins</span>
            <span>🥣 ${recipe.ingredients.length} ingredientes</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// --- Action Handlers ---

function setupEventListeners() {
  // Add Recipe Button
  addRecipeBtn.addEventListener('click', openAddRecipeForm);
  document.querySelectorAll('.open-add-modal').forEach(btn => btn.addEventListener('click', openAddRecipeForm));
  document.getElementById('scroll-to-add').addEventListener('click', openAddRecipeForm);

  // Close Modal
  closeModal.addEventListener('click', () => recipeModal.close());
  recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) recipeModal.close();
  });

  // Filters
  categoryTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.category-tab');
    if (tab) {
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderRecipes(tab.dataset.category, searchInput.value);
    }
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    const activeTab = document.querySelector('.category-tab.active');
    renderRecipes(activeTab.dataset.category, e.target.value);
  });
}

function openAddRecipeForm() {
  modalBody.innerHTML = `
    <div class="form-header">
      <h2>Nueva Creación Culinaria</h2>
      <p>Cuéntanos los secretos de tu receta estrella.</p>
    </div>
    <form id="add-recipe-form">
      <div class="form-group">
        <label for="recipe-name">Nombre de la Receta</label>
        <input type="text" id="recipe-name" placeholder="Ej: Pastel de Arándanos de la Abuela" required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="recipe-category">Categoría</label>
          <select id="recipe-category" required>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="recipe-time">Tiempo de Prep. (mins)</label>
          <input type="number" id="recipe-time" placeholder="30" required>
        </div>
      </div>

      <div class="form-group">
        <label>Ingredientes</label>
        <div id="ingredients-container">
          <div class="list-item">
            <input type="text" class="ingredient-input" placeholder="2 tazas de harina" required>
            <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
          </div>
        </div>
        <button type="button" class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: 0.8rem; margin-top: 0.5rem;" onclick="addIngredientInput()">+ Añadir ingrediente</button>
      </div>

      <div class="form-group">
        <label>Pasos a Seguir</label>
        <div id="steps-container">
          <div class="list-item">
            <textarea class="step-input" placeholder="Paso 1: Precalentar el horno..." required></textarea>
            <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
          </div>
        </div>
        <button type="button" class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: 0.8rem; margin-top: 0.5rem;" onclick="addStepInput()">+ Añadir paso</button>
      </div>

      <div class="form-group">
        <label for="recipe-image">URL de Imagen (opcional)</label>
        <input type="url" id="recipe-image" placeholder="https://ejemplo.com/imagen.jpg">
      </div>

      <div style="text-align: right; margin-top: 2rem;">
        <button type="submit" class="btn btn-primary btn-lg">Guardar Receta ✨</button>
      </div>
    </form>
  `;

  document.getElementById('add-recipe-form').onsubmit = (e) => {
    e.preventDefault();
    handleFormSubmit();
  };

  recipeModal.showModal();
}

window.addIngredientInput = () => {
  const container = document.getElementById('ingredients-container');
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `
    <input type="text" class="ingredient-input" placeholder="Nuevo ingrediente" required>
    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(div);
};

window.addStepInput = () => {
  const container = document.getElementById('steps-container');
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `
    <textarea class="step-input" placeholder="Siguiente paso..." required></textarea>
    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(div);
};

function handleFormSubmit() {
  const name = document.getElementById('recipe-name').value;
  const category = document.getElementById('recipe-category').value;
  const prepTime = document.getElementById('recipe-time').value;
  const image = document.getElementById('recipe-image').value || '/hero.png';
  
  const ingredients = Array.from(document.querySelectorAll('.ingredient-input')).map(input => input.value);
  const steps = Array.from(document.querySelectorAll('.step-input')).map(input => input.value);

  const newRecipe = {
    id: Date.now().toString(),
    name,
    category,
    prepTime,
    image,
    ingredients,
    steps,
    createdAt: new Date().toISOString()
  };

  recipes.push(newRecipe);
  localStorage.setItem('gourmet_recipes', JSON.stringify(recipes));
  
  recipeModal.close();
  renderRecipes();
}

window.viewRecipe = (id) => {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  modalBody.innerHTML = `
    <div class="recipe-detail">
      <div class="recipe-detail-img">
        <img src="${recipe.image}" alt="${recipe.name}">
      </div>
      <div class="recipe-detail-info">
        <span class="badge">${recipe.category}</span>
        <h2>${recipe.name}</h2>
        
        <div class="recipe-meta" style="margin-bottom: 2rem; border: none; padding: 0;">
           <span>⏱️ ${recipe.prepTime} mins</span>
           <span>🥣 ${recipe.ingredients.length} ingredientes</span>
        </div>

        <div class="recipe-detail-section">
          <h4>Ingredientes</h4>
          <ul style="padding-left: 1.2rem;">
            ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
        </div>

        <div class="recipe-detail-section">
          <h4>Preparación</h4>
          <ol style="padding-left: 1.2rem;">
            ${recipe.steps.map(step => `<li style="margin-bottom: 0.8rem;">${step}</li>`).join('')}
          </ol>
        </div>

        <div style="text-align: right; margin-top: 2rem;">
          <button class="btn btn-outline btn-remove-full" onclick="deleteRecipe('${recipe.id}')" style="background: rgba(231, 76, 60, 0.1); border-color: #e74c3c; color: #e74c3c;">Eliminar Receta</button>
        </div>
      </div>
    </div>
  `;
  recipeModal.showModal();
};

window.deleteRecipe = (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
    recipes = recipes.filter(r => r.id !== id);
    localStorage.setItem('gourmet_recipes', JSON.stringify(recipes));
    recipeModal.close();
    renderRecipes();
  }
};

// --- Start App ---
init();
