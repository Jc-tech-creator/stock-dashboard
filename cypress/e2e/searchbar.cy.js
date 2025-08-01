// cypress/e2e/searchbar.cy.js
describe('SearchBar E2E', () => {
    beforeEach(() => {
      cy.visit(process.env.REACT_APP_API_BASE || 'http://localhost:3001'); // 前端地址
    });
  
    it('输入 AAPL 出现结果，清空后结果消失', () => {
      // 1️⃣ 输入
      cy.get('input[placeholder="Search stocks..."]').type('AAPL');
  
      // 2️⃣ 断言结果区域出现且包含 AAPL
      cy.get('.search-results').should('exist');
      cy.get('.search-results .stock-item').its('length').should('be.gte', 1);
      cy.contains('.stock-symbol', 'AAPL').should('be.visible');
  
      // 3️⃣ 点击 ✕ 清空输入框
      cy.get('.clear-button').click();
  
      // 4️⃣ 断言整个结果区域被移除
      cy.get('.search-results').should('not.exist');
    });
  });