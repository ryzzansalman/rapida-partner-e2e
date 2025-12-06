import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
// Use a unique name for each test run to avoid data conflicts
const MOVIE_NAME = `Filme de teste E2E ${Date.now()}`;
const MOVIE_DESCRIPTION = `Descrição para o filme ${MOVIE_NAME}`;

test.describe('Movie CRUD E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('1.0 - Acessar a página de login', async () => {
      await page.goto(`${BASE_URL}/auth/login`);
    });

    await test.step('1.1 a 1.4 - Preencher credenciais', async () => {
      // 1.1 - Localizar os campos
      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');

      // 1.2 - Localizar o botão de login
      const loginButton = page.locator('#login-button');

      // 1.3 - Esperar os campos ficarem visíveis
      await emailInput.waitFor({ state: 'visible' });
      await passwordInput.waitFor({ state: 'visible' });

      // 1.4 - Preencher os campos
      await emailInput.fill('rabbadesalman@gmail.com');
      await passwordInput.fill('Cdafctntlrefo@1980');
    });

    await test.step('1.5 - Clicar no botão de login', async () => {
      const loginButton = page.locator('#login-button');
      await loginButton.click({ timeout: 40000 });
    });

    await test.step('1.6 - Esperar o redirecionamento para o dashboard', async () => {
      await page.waitForURL(`${BASE_URL}/dashboard`);
    });
  });

  test('should create, verify, and delete a movie entry', async ({ page }) => {
    // Aumenta o timeout específico deste teste
    test.setTimeout(60000);

    await test.step('2.0 - Abrir menu lateral (se necessário)', async () => {
      const menuButton = page.locator(
        'button[title="Mostrar menu"], button[title="Show menu"]',
      );
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }
    });

    await test.step('2.1 e 2.2 - Navegar para Lista de Filmes', async () => {
      const filmMenuItem = page.locator('#menu-id-movieModule');
      await filmMenuItem.click({ timeout: 15000 });

      const moviesLink = page.locator('#submenu-id-movies');
      await moviesLink.click({ timeout: 30000 });
    });

    await test.step('2.3 - Esperar página da lista carregar', async () => {
      await page.waitForURL(`${BASE_URL}/movies`);
      await page.waitForSelector('h2:has-text("Lista de filmes")');
    });

    await test.step('3.0 - Clicar em "Novo" e esperar formulário', async () => {
      const newButton = page.locator('#header-action-0');
      await newButton.click();
      await page.waitForURL(`${BASE_URL}/movies/new`);
      await page.waitForSelector('h1:has-text("Gerenciar filme")');
    });

    await test.step('4.0 - Preencher formulário (Aba Principal)', async () => {
      // 4.1 - Input "Nome"
      await page.fill('#name', MOVIE_NAME);

      // 4.2 - WYSIWYG "Descrição"
      await page
        .locator('#field-description__editor .ql-editor')
        .fill(MOVIE_DESCRIPTION);

      // 4.3 - Input "Data de lançamento"
      await page.fill('#releaseDate', '2021-01-31');

      // 4.4 - Input "Pontuação do IMDb"
      await page.fill('#imdbRating', '8.5');

      // 4.5 - Autocomplete "Gêneros" (movieGenresId)
      await page.fill('#movieGenresId', 'terr');
      const genreOption = page.locator(
        '#field-movieGenresId ul li:has-text("Terror")',
      );
      await genreOption.waitFor({ state: 'visible', timeout: 10000 });
      await genreOption.click({ timeout: 40000 });

      // 4.6 - Input "Link 1"
      await page.fill('#link1', 'http://link1.com');
    });

    await test.step('4.7 - Mudar para a aba "Elenco"', async () => {
      await page.locator('#tab-castTab').click();
    });

    await test.step('4.8 - Adicionar Ator/Personagem 1', async () => {
      const addActorButton = page.locator('#array-actors > div > button > span');
      await addActorButton.click();
      await page.waitForTimeout(500); // Wait for form array to render

      // 4.8.1 - Autocomplete "Ator" (actorId)
      await page.fill('#field-actorId-0 #actorId', 'barbosa');
      const actorOption0 = page.locator(
        '#field-actorId-0 ul li:has-text("Roberto Barbosa")',
      );
      await actorOption0.waitFor({ state: 'visible', timeout: 10000 });
      await actorOption0.click();

      // 4.8.2 - Autocomplete "Personagem" (charactersId)
      await page.fill('#field-charactersId-0 #charactersId', 'mand');
      const charOption0 = page.locator(
        '#field-charactersId-0 ul li:has-text("Mandy")',
      );
      await charOption0.waitFor({ state: 'visible', timeout: 10000 });
      await charOption0.click();
    });

    await test.step('4.9 - Adicionar Ator/Personagem 2', async () => {
      const addActorButton = page.locator('#array-actors > div > button > span');
      await addActorButton.click();
      await page.waitForTimeout(500); // Wait for form array to render

      // 4.9.1 - Autocomplete "Ator" (actorId)
      await page.fill('#field-actorId-1 #actorId', 'alex');
      const actorOption1 = page.locator(
        '#field-actorId-1 ul li:has-text("Alexis Barros")',
      );
      await actorOption1.waitFor({ state: 'visible', timeout: 10000 });
      await actorOption1.click();

      // 4.9.2 - Autocomplete "Personagem" (charactersId)
      await page.fill('#field-charactersId-1 #charactersId', 'bill');
      const charOption1 = page.locator(
        '#field-charactersId-1 ul li:has-text("Billy")',
      );
      await charOption1.waitFor({ state: 'visible', timeout: 10000 });
      await charOption1.click();
    });

    await test.step('5.0 - Salvar o formulário', async () => {
      await page.click('#save-button');
    });

    await test.step('6.0 - Esperar redirecionamento para lista', async () => {
      await page.waitForURL(`${BASE_URL}/movies`);
      await page.waitForSelector('h2:has-text("Lista de filmes")');
    });

    const movieRow = page.locator(`table tr:has-text("${MOVIE_NAME}")`);

    await test.step('6.1 - Verificar se o filme foi criado', async () => {
      await expect(movieRow).toBeVisible();
    });

    // 7.0 - Localizar o botão "Excluir" na linha do filme
    const deleteButton = movieRow.locator('button[id$="-actions-menu"]');

    await test.step('7.0 - Excluir o filme', async () => {
      const movieRow = page.locator(`table tr:has-text("${MOVIE_NAME}")`);

      // Método 1: Tente localizar o botão de menu pelo ID padrão
      const menuButton = movieRow.locator('button[id*="actions-menu"]');

      // Método 2: Se não encontrar, use o botão com ícone
      if (await menuButton.count() === 0) {
        const iconButton = movieRow.locator('button:has(svg)');
        await iconButton.first().click();
      } else {
        await menuButton.click();
      }

      // Aguarde o dropdown
      await page.waitForSelector('[role="menu"]', { timeout: 10000 });

      // Clique em "Excluir"
      const deleteOption = page.locator('[role="menuitem"]:has-text("Excluir"), [role="menuitem"]:has-text("Delete")');
      await deleteOption.click();
    });

    await test.step('7.1 - Verificar modal de exclusão', async () => {
      // Aguarde o modal aparecer com timeout maior
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });

      // Verifique se há texto de confirmação
      await expect(page.locator('[role="dialog"]')).toContainText(/Tem certeza|Confirma|Confirmar/i);
    });

    await test.step('7.2 - Confirmar exclusão', async () => {
      const confirmButton = page.locator('[role="dialog"] button:has-text("Excluir"), [role="dialog"] button:has-text("Confirmar")');
      await confirmButton.click();
    });

    await test.step('7.3 - Verificar se o filme foi removido', async () => {
      await expect(
        page.locator(`table tr:has-text("${MOVIE_NAME}")`),
      ).not.toBeVisible();
    });
  });
});