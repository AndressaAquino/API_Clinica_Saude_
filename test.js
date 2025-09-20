const baseURL = 'http://localhost:3000';

async function fazerRequisicao(endpoint) {
    try {
        const response = await fetch(`${baseURL}${endpoint}`);
        const data = await response.json();
        
        console.log(`\n Testando: ${endpoint}`);
        console.log(`Status: ${response.status}`);
        console.log('Resposta:', JSON.stringify(data, null, 2));
        console.log('─'.repeat(80));
        
        return data;
    } catch (error) {
        console.error(` Erro ao testar ${endpoint}:`, error.message);
    }
}

async function testarAPI() {
    console.log('Iniciando testes da API de Profissionais de Saúde...\n');
    
    await fazerRequisicao('/');
    
    await fazerRequisicao('/profissionais');
    
    await fazerRequisicao('/profissionais?especialidade=cardiologia');
    
    await fazerRequisicao('/profissionais?disponivel=true');
    
    await fazerRequisicao('/profissionais?especialidade=pediatria&disponivel=true');
    
    await fazerRequisicao('/profissionais/1');
    
    await fazerRequisicao('/profissionais/999');
    
    await fazerRequisicao('/especialidades');
    
    await fazerRequisicao('/buscar?q=joão');
    
    await fazerRequisicao('/buscar?q=cardio&tipo=especialidade');
    
    await fazerRequisicao('/buscar?q=maria&tipo=nome');
    
    await fazerRequisicao('/estatisticas');
    
    await fazerRequisicao('/rota-inexistente');
    
    console.log('\n Testes concluídos!');
}

testarAPI().catch(console.error);

console.log(`
 INSTRUÇÕES:

1. Certifique-se de que a API está rodando em ${baseURL}
2. Execute este script com: node test.js
3. Verifique os resultados de cada endpoint

ENDPOINTS TESTADOS:
- GET / (informações da API)
- GET /profissionais (todos os profissionais)
- GET /profissionais?especialidade=... (filtro por especialidade)
- GET /profissionais?disponivel=... (filtro por disponibilidade)
- GET /profissionais/:id (profissional específico)
- GET /especialidades (lista de especialidades)
- GET /buscar?q=... (busca por nome/especialidade)
- GET /estatisticas (estatísticas da clínica)
`);

