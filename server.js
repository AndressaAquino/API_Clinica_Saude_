const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let profissionais = [];

function carregarDados() {
    try {
        const dados = fs.readFileSync(path.join(__dirname, 'data', 'profissionais.json'), 'utf8');
        profissionais = JSON.parse(dados);
        console.log('Dados dos profissionais carregados com sucesso!');
    } catch (error) {
        console.error(' Erro ao carregar dados:', error.message);
        profissionais = [];
    }
}

carregarDados();

function normalizarString(str) {
    return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

app.get('/', (req, res) => {
    res.json({
        nome: 'API de Profissionais de Saúde',
        versao: '1.0.0',
        descricao: 'API para consulta da disponibilidade dos profissionais da clínica',
        endpoints: {
            'GET /profissionais': 'Lista todos os profissionais',
            'GET /profissionais/:id': 'Busca profissional por ID',
            'GET /especialidades': 'Lista todas as especialidades',
            'GET /buscar': 'Busca profissionais por nome ou especialidade'
        }
    });
});

app.get('/profissionais', (req, res) => {
    try {
        const { especialidade, disponivel } = req.query;
        
        let resultado = [...profissionais];
        
        if (especialidade) {
            const especialidadeNormalizada = normalizarString(especialidade);
            resultado = resultado.filter(prof => 
                normalizarString(prof.especialidade).includes(especialidadeNormalizada)
            );
        }
        
        if (disponivel !== undefined) {
            const isDisponivel = disponivel === 'true';
            resultado = resultado.filter(prof => prof.disponivel === isDisponivel);
        }
        
        res.json({
            total: resultado.length,
            profissionais: resultado
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
    }
});

app.get('/profissionais/:id', (req, res) => {
    try {
        const { id } = req.params;
        const profissional = profissionais.find(p => p.id === parseInt(id));
        
        if (!profissional) {
            return res.status(404).json({ erro: 'Profissional não encontrado' });
        }
        
        res.json(profissional);
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
    }
});

app.get('/especialidades', (req, res) => {
    try {
        const especialidades = [...new Set(profissionais.map(p => p.especialidade))];
        
        const especialidadesComContagem = especialidades.map(esp => ({
            nome: esp,
            totalProfissionais: profissionais.filter(p => p.especialidade === esp).length,
            profissionaisDisponiveis: profissionais.filter(p => p.especialidade === esp && p.disponivel).length
        }));
        
        res.json({
            total: especialidades.length,
            especialidades: especialidadesComContagem
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
    }
});

app.get('/buscar', (req, res) => {
    try {
        const { q, tipo } = req.query;
        
        if (!q) {
            return res.status(400).json({ erro: 'Parâmetro de busca "q" é obrigatório' });
        }
        
        const termoBusca = normalizarString(q);
        let resultado = [];
        
        if (!tipo || tipo === 'nome') {
            const porNome = profissionais.filter(prof => 
                normalizarString(prof.nome).includes(termoBusca)
            );
            resultado = [...resultado, ...porNome];
        }
        
        if (!tipo || tipo === 'especialidade') {
            const porEspecialidade = profissionais.filter(prof => 
                normalizarString(prof.especialidade).includes(termoBusca)
            );
            resultado = [...resultado, ...porEspecialidade];
        }
        
        resultado = resultado.filter((prof, index, self) => 
            index === self.findIndex(p => p.id === prof.id)
        );
        
        res.json({
            termo: q,
            total: resultado.length,
            profissionais: resultado
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
    }
});

app.get('/estatisticas', (req, res) => {
    try {
        const totalProfissionais = profissionais.length;
        const profissionaisDisponiveis = profissionais.filter(p => p.disponivel).length;
        const especialidades = [...new Set(profissionais.map(p => p.especialidade))];
        
        const especialidadeMaisComum = especialidades
            .map(esp => ({
                nome: esp,
                quantidade: profissionais.filter(p => p.especialidade === esp).length
            }))
            .sort((a, b) => b.quantidade - a.quantidade)[0];
        
        res.json({
            totalProfissionais,
            profissionaisDisponiveis,
            profissionaisIndisponiveis: totalProfissionais - profissionaisDisponiveis,
            totalEspecialidades: especialidades.length,
            especialidadeMaisComum: especialidadeMaisComum || null,
            taxaDisponibilidade: `${((profissionaisDisponiveis / totalProfissionais) * 100).toFixed(1)}%`
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
    }
});

app.use('*', (req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
    console.log(` Servidor rodando na porta ${PORT}`);
    console.log(` API disponível em: http://localhost:${PORT}`);
    console.log(` Total de profissionais carregados: ${profissionais.length}`);
});
