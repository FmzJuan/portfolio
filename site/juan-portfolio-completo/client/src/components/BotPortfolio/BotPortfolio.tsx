import React, { useRef } from 'react'; // 1. Importe o useRef
import './BotPortfolio.css';

const passo1_path = '/images/assets/passo1.jpeg';
const passo2_path = '/images/assets/passo2.jpeg';
const passo3_path = '/images/assets/passo3.jpeg';
const passo4_path = '/images/assets/passo4.jpeg';
const passo5_path = '/images/assets/passo5.jpeg';

const BotPortfolio: React.FC = () => {
  // 2. Crie a referência para o carrossel
  const carouselRef = useRef<HTMLDivElement>(null);

  // 3. Função para rolar o carrossel quando clicar na seta
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      // 345 é aproximadamente a largura do card (320px) + o gap (25px)
      const scrollAmount = direction === 'left' ? -345 : 345;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bot-section" id="bot-wpp">
      <div className="container">

        <div className="bot-hero">
          <h1>Transforme seu WhatsApp em uma Máquina de Vendas</h1>
          <p className="subtitle">
            Fluxo de atendimento 100% automatizado. Deslize para ver como seu cliente compra em menos de 2 minutos.
          </p>
        </div>

        <div className="bot-demo">
          
          {/* 4. NOVO: Wrapper para posicionar as setas corretamente */}
          <div className="carousel-wrapper">
            
            {/* Botão Esquerda */}
            <button className="carousel-arrow left" onClick={() => scroll('left')} aria-label="Rolar para a esquerda">
              ❮
            </button>

            {/* CARROSSEL CONTAINER (Agora com o ref) */}
            <div className="carousel-container" ref={carouselRef}>
              
              <div className="carousel-card">
                <div className="card-header">
                  <span className="step-badge">Passo 1</span>
                  <h3>Boas-vindas</h3>
                </div>
                <div className="phone-mockup">
                  <img src={passo1_path} alt="Passo 1" className="step-image" />
                </div>
                <div className="spec-tags">
                  <span className="tag">⚡ Resposta em 1s</span>
                  <span className="tag">👋 Saudação Personalizada</span>
                </div>
                <p>O cliente é atendido instantaneamente com um menu claro, evitando a perda de interesse pela demora.</p>
              </div>
              
              <div className="carousel-card">
                <div className="card-header">
                  <span className="step-badge">Passo 2</span>
                  <h3>Cardápio Digital</h3>
                </div>
                <div className="phone-mockup">
                  <img src={passo2_path} alt="Passo 2" className="step-image" />
                </div>
                <div className="spec-tags">
                  <span className="tag">🍔 Menu Dinâmico</span>
                  <span className="tag">🔢 Seleção Numérica</span>
                </div>
                <p>Apresentação limpa dos produtos. O cliente navega e escolhe apenas digitando números, sem fricção.</p>
              </div>

              <div className="carousel-card">
                <div className="card-header">
                  <span className="step-badge">Passo 3</span>
                  <h3>Carrinho Inteligente</h3>
                </div>
                <div className="phone-mockup">
                  <img src={passo3_path} alt="Passo 3" className="step-image" />
                </div>
                <div className="spec-tags">
                  <span className="tag">🛒 Upsell Integrado</span>
                  <span className="tag">🔄 Edição de Pedido</span>
                </div>
                <p>O bot confirma itens e oferece a opção de continuar comprando, aumentando o ticket médio da venda.</p>
              </div>

              <div className="carousel-card">
                <div className="card-header">
                  <span className="step-badge">Passo 4</span>
                  <h3>Prevenção de Erros</h3>
                </div>
                <div className="phone-mockup">
                  <img src={passo4_path} alt="Passo 4" className="step-image" />
                </div>
                <div className="spec-tags">
                  <span className="tag">🛡️ Anti-falhas</span>
                  <span className="tag">🤖 IA de Contexto</span>
                </div>
                <p>Se o cliente digitar algo inválido, o bot corrige a rota gentilmente, garantindo que a venda não seja abandonada.</p>
              </div>

              <div className="carousel-card">
                <div className="card-header">
                  <span className="step-badge">Passo 5</span>
                  <h3>Checkout Automático</h3>
                </div>
                <div className="phone-mockup">
                  <img src={passo5_path} alt="Passo 5" className="step-image" />
                </div>
                <div className="spec-tags">
                  <span className="tag">💸 Integração PIX</span>
                  <span className="tag">🧾 Resumo Detalhado</span>
                </div>
                <p>Fechamento com cálculo de total, envio de chave PIX e orientações finais sem nenhuma intervenção humana.</p>
              </div>

            </div>

            {/* Botão Direita */}
            <button className="carousel-arrow right" onClick={() => scroll('right')} aria-label="Rolar para a direita">
              ❯
            </button>

          </div>
          
          {/* Indicador apenas para mobile (escondido no desktop via CSS) */}
          <div className="swipe-indicator mobile-only">
            <p>← Deslize para ver o fluxo completo →</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BotPortfolio;