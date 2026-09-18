import { useEffect, useState } from 'react';
import { getCards } from './services/api';
import Card from './components/Card';

const kartUret = (adet) => {
  return Array.from({ length: adet }, (_, i) => ({
    id: Date.now() + i + Math.random(),
    color: ["red", "blue", "green", "yellow"][Math.floor(Math.random() * 4)],
    value: String(Math.floor(Math.random() * 10)),
    type: "number" 
  }));
};

function App() {
  const [playerHand, setPlayerHand] = useState([]); 
  const [computerHand, setComputerHand] = useState([]); 
  const [middleCard, setMiddleCard] = useState(null); 
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); 
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);

  const [showUnoButton, setShowUnoButton] = useState(false);
  const [unoTimer, setUnoTimer] = useState(null);
  const [gameMessage, setGameMessage] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showMessage = (msg) => {
    setGameMessage(msg);
    setTimeout(() => setGameMessage(""), 2500); 
  };

  useEffect(() => {
    const fetchDeck = async () => {
      const cards = await getCards();
      
      if (cards.length > 0) {
        for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        setMiddleCard(cards[0]); 
        const remainingCards = cards.slice(1);
        
        const newPlayerHand = [];
        const newComputerHand = [];
        const kartSayisi = Math.min(remainingCards.length, 14); 
        
        for (let i = 0; i < kartSayisi; i++) {
          if (i % 2 === 0) newPlayerHand.push(remainingCards[i]);
          else newComputerHand.push(remainingCards[i]);
        }
        setPlayerHand(newPlayerHand);
        setComputerHand(newComputerHand);
      }
    };
    fetchDeck();
  }, []);

  const tetikleUno = () => {
    setShowUnoButton(true);
    const timer = setTimeout(() => {
      setShowUnoButton(false);
      showMessage("⏱️ UNO demeyi unuttun! +2 Kart");
      setPlayerHand(prev => [...prev, ...kartUret(2)]);
    }, 2000);
    setUnoTimer(timer);
  };

  const handleUnoClick = () => {
    clearTimeout(unoTimer); 
    setShowUnoButton(false); 
    showMessage("🔥 UNO! Son kart.");
  };

  const kartOyna = (oynananKart) => {
    if (!isPlayerTurn || showColorPicker) return;

    const isFirstCardBlackWild = middleCard.color === 'black'; 
    const isColorMatch = oynananKart.color === middleCard.color;
    const isValueMatch = oynananKart.value === middleCard.value;
    const isWildCard = oynananKart.type === 'wild' || oynananKart.value === 'wild' || oynananKart.value === '+4';

    if (isColorMatch || isValueMatch || isWildCard || isFirstCardBlackWild) {
      const kalanKartlar = playerHand.filter((kart) => kart.id !== oynananKart.id);
      
      if (isWildCard) {
        setPendingWildCard(oynananKart);
        setPlayerHand(kalanKartlar);
        setShowColorPicker(true);
        if (kalanKartlar.length === 1) tetikleUno();
        return; 
      }

      setMiddleCard(oynananKart);
      setPlayerHand(kalanKartlar);
      if (kalanKartlar.length === 1) tetikleUno();

      if (oynananKart.value === 'skip' || oynananKart.value === 'reverse') {
        showMessage("🔄 Sıra atlandı! Tekrar oyna.");
      } else if (oynananKart.value === '+2') {
        setComputerHand(prev => [...prev, ...kartUret(2)]);
        showMessage("💥 Rakip 2 kart çekti! Tekrar oyna.");
      } else {
        setIsPlayerTurn(false); 
      }
    } else {
      showMessage("❌ Uyumsuz Kart!");
    }
  };

  const renkSec = (secilenRenk) => {
    setMiddleCard({ ...pendingWildCard, color: secilenRenk });
    setShowColorPicker(false);
    if (pendingWildCard.value === '+4') {
      setComputerHand(prev => [...prev, ...kartUret(4)]);
      showMessage(`🎨 Renk değişti. Rakip 4 kart çekti!`);
    } else {
      setIsPlayerTurn(false); 
    }
    setPendingWildCard(null);
  };

  const destedenKartCek = () => {
    if (!isPlayerTurn || showColorPicker) return;
    const yeniKart = kartUret(1)[0];
    setPlayerHand([...playerHand, yeniKart]);

    const isFirstCardBlackWild = middleCard.color === 'black';
    const isColorMatch = yeniKart.color === middleCard.color;
    const isValueMatch = yeniKart.value === middleCard.value;
    const isWildCard = yeniKart.type === 'wild' || yeniKart.value === 'wild' || yeniKart.value === '+4';

    if (isColorMatch || isValueMatch || isWildCard || isFirstCardBlackWild) {
      showMessage("✨ Uyumlu kart geldi!");
    } else {
      setIsPlayerTurn(false); 
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && computerHand.length > 0 && playerHand.length > 0) {
      const timer = setTimeout(() => {
        const isFirstCardBlackWild = middleCard.color === 'black';
        const playableCard = computerHand.find(
          (kart) => 
            kart.color === middleCard.color || kart.value === middleCard.value || 
            kart.value === 'wild' || kart.value === '+4' || kart.type === 'wild' || isFirstCardBlackWild
        );

        if (playableCard) {
          const kalanBotKartlari = computerHand.filter((kart) => kart.id !== playableCard.id);
          setComputerHand(kalanBotKartlari);
          const isWild = playableCard.type === 'wild' || playableCard.value === 'wild' || playableCard.value === '+4';
          
          if (isWild) {
            const renkler = [{ id: 'red', ad: 'Kırmızı' }, { id: 'blue', ad: 'Mavi' }, { id: 'green', ad: 'Yeşil' }, { id: 'yellow', ad: 'Sarı' }];
            const rastgeleRenk = renkler[Math.floor(Math.random() * 4)];
            setMiddleCard({ ...playableCard, color: rastgeleRenk.id });
            
            if (playableCard.value === '+4') {
              setPlayerHand(prev => [...prev, ...kartUret(4)]);
              showMessage(`😱 Rakip +4 attı! Renk ${rastgeleRenk.ad}.`);
            } else {
              showMessage(`🤖 Rakip Joker attı, renk: ${rastgeleRenk.ad}`);
              setIsPlayerTurn(true);
            }
          } 
          else if (playableCard.value === '+2') {
            setMiddleCard(playableCard);
            setPlayerHand(prev => [...prev, ...kartUret(2)]);
            showMessage("💥 Rakip +2 attı! 2 kart çektin.");
          }
          else if (playableCard.value === 'skip' || playableCard.value === 'reverse') {
            setMiddleCard(playableCard);
            showMessage("🛑 Atlandın! Rakip tekrar oynuyor.");
          } else {
            setMiddleCard(playableCard);
            setIsPlayerTurn(true);
          }
        } else {
          setComputerHand([...computerHand, kartUret(1)[0]]);
          setIsPlayerTurn(true);
        }
      }, 1500);
      return () => clearTimeout(timer); 
    }
  }, [isPlayerTurn, computerHand, middleCard, playerHand]);

  // YENİ: Kartları sağa ve sola yayan translateX eksen hesaplaması (xOffset) eklendi
  const getFanStyle = (index, total) => {
    const middle = (total - 1) / 2;
    const offset = index - middle;
    const xOffset = offset * (isMobile ? 25 : 40); 
    const rotateAngle = offset * (isMobile ? 3 : 5); 
    const yOffset = Math.abs(offset) * (isMobile ? 2 : 4); 
    
    return {
      xOffset, 
      transform: `translateX(${xOffset}px) rotate(${rotateAngle}deg) translateY(${yOffset}px)`,
      zIndex: index
    };
  };

  return (
    <div className="game-table">
      
      {gameMessage && (
        <div className="toast-notification">
          <span>{gameMessage}</span>
        </div>
      )}

      {showUnoButton && (
        <button 
          onClick={handleUnoClick}
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 3000, backgroundColor: '#e74c3c', color: 'white', border: '6px solid white', 
            borderRadius: '50%', width: isMobile ? '110px' : '150px', height: isMobile ? '110px' : '150px', 
            fontSize: isMobile ? '26px' : '36px', fontWeight: '900', cursor: 'pointer', 
            boxShadow: '0 0 50px rgba(231, 76, 60, 0.9), 0 10px 25px rgba(0,0,0,0.6)', 
            textShadow: '3px 3px 0 #000', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          UNO!
        </button>
      )}

      {showColorPicker && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(15px)', zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ color: 'white', marginBottom: '40px', fontSize: isMobile ? '28px' : '36px', textShadow: '0 5px 15px rgba(0,0,0,0.5)', fontWeight: '900', letterSpacing: '2px' }}>RENGİNİ SEÇ</h2>
          <div style={{ display: 'flex', gap: isMobile ? '15px' : '30px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
            {[{id: 'red', hex: '#e74c3c'}, {id: 'blue', hex: '#3498db'}, {id: 'green', hex: '#2ecc71'}, {id: 'yellow', hex: '#f1c40f'}].map(color => (
              <div 
                key={color.id} onClick={() => renkSec(color.id)} 
                style={{ 
                  width: isMobile ? '70px' : '100px', height: isMobile ? '70px' : '100px', 
                  backgroundColor: color.hex, borderRadius: '25px', cursor: 'pointer', 
                  border: '6px solid rgba(255,255,255,0.9)', boxShadow: `0 15px 35px rgba(0,0,0,0.4), 0 0 30px ${color.hex}`, 
                  transition: 'all 0.2s' 
                }}
                onMouseOver={e => !isMobile && (e.currentTarget.style.transform = 'translateY(-15px) scale(1.1)')} 
                onMouseOut={e => !isMobile && (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* RAKİP BÖLGESİ */}
      <header style={{ display: 'flex', justifyContent: 'center', paddingTop: isMobile ? '15px' : '30px', transform: 'rotateX(15deg)' }}>
        {computerHand.length > 0 ? (
          computerHand.map((card, index) => (
            <div key={card.id} style={{ 
              width: isMobile ? '45px' : '70px', height: isMobile ? '70px' : '105px', backgroundColor: '#1a1a1a', 
              border: isMobile ? '2px solid #f8f9fa' : '4px solid #f8f9fa', borderRadius: '8px', 
              marginLeft: index !== 0 ? (isMobile ? '-25px' : '-35px') : '0', 
              boxShadow: '-5px 5px 15px rgba(0,0,0,0.5)', backgroundImage: 'repeating-linear-gradient(45deg, #e74c3c, #e74c3c 10px, #c0392b 10px, #c0392b 20px)'
            }}></div>
          ))
        ) : (
          <h2 style={{ color: '#f1c40f', fontSize: isMobile ? '24px' : '32px' }}>🤖 RAKİP KAZANDI</h2>
        )}
      </header>

      {/* MASA ORTASI */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '20px' : '30px', transform: `rotateX(20deg) scale(${isMobile ? 0.75 : 0.95})` }}>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '10px',
          background: isPlayerTurn ? 'linear-gradient(135deg, rgba(46,204,113,0.2), rgba(39,174,96,0.5))' : 'linear-gradient(135deg, rgba(231,76,60,0.2), rgba(192,57,43,0.5))',
          border: `1px solid ${isPlayerTurn ? 'rgba(46,204,113,0.6)' : 'rgba(231,76,60,0.6)'}`,
          padding: isMobile ? '8px 20px' : '12px 35px', borderRadius: '40px', color: 'white', 
          fontSize: isMobile ? '16px' : '20px', fontWeight: '800',
          boxShadow: `0 10px 30px ${isPlayerTurn ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)'}`,
          backdropFilter: 'blur(10px)', transition: 'all 0.5s'
        }}>
          {isPlayerTurn ? "✨ SENİN SIRAN" : "⏳ RAKİP OYNUYOR"}
        </div>

        <div style={{ display: 'flex', gap: isMobile ? '30px' : '60px', alignItems: 'center' }}>
          
          <article 
            onClick={destedenKartCek}
            style={{ 
              width: isMobile ? '95px' : '120px', height: isMobile ? '142px' : '175px', 
              backgroundColor: '#1a1a1a', border: '5px solid #f8f9fa', borderRadius: '16px', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              cursor: isPlayerTurn && !showColorPicker ? 'pointer' : 'not-allowed', 
              boxShadow: isPlayerTurn ? '2px 2px 0 #fff, 4px 4px 0 #ddd, 6px 6px 0 #bbb, 15px 15px 30px rgba(0,0,0,0.7)' : '1px 1px 0 #555, 2px 2px 0 #444, 3px 3px 0 #333, 10px 10px 20px rgba(0,0,0,0.6)',
              transform: isPlayerTurn ? 'translateY(-10px) translateX(-5px)' : 'none', 
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
              backgroundImage: 'repeating-linear-gradient(45deg, #e74c3c, #e74c3c 15px, #c0392b 15px, #c0392b 30px)'
            }}
          >
            <span style={{ backgroundColor: '#f8f9fa', color: '#e74c3c', padding: '8px 18px', borderRadius: '30px', fontSize: isMobile ? '20px' : '24px', fontWeight: '900', transform: 'rotate(-25deg)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.5)' }}>UNO</span>
          </article>
          
          {middleCard ? (
            <div style={{ transform: 'rotate(8deg) scale(1.15)', boxShadow: '15px 25px 40px rgba(0,0,0,0.6)', borderRadius: '14px', transition: 'all 0.4s' }}>
              <Card color={middleCard.color} value={middleCard.value} />
            </div>
          ) : (
            <article style={{ width: isMobile ? '75px' : '110px', height: isMobile ? '110px' : '160px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '3px dashed rgba(255,255,255,0.3)' }}></article>
          )}
        </div>
      </section>

      {/* YELPAZE OYUNCU BÖLGESİ (Düzeltildi) */}
      <footer style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: isMobile ? '10px' : '20px', perspective: '1000px' }}>
        <div style={{ display: 'flex', position: 'relative', width: '0', height: isMobile ? '110px' : '160px', justifyContent: 'center' }}>
          {playerHand.length > 0 ? (
            playerHand.map((card, index) => {
              const fanStyle = getFanStyle(index, playerHand.length);
              
              return (
                <div 
                  key={card.id} 
                  onClick={() => kartOyna(card)} 
                  style={{ 
                    position: 'absolute',
                    cursor: isPlayerTurn && !showColorPicker ? 'pointer' : 'not-allowed', 
                    opacity: isPlayerTurn && !showColorPicker ? 1 : 0.6, 
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
                    transformOrigin: 'bottom center', 
                    transform: fanStyle.transform,
                    zIndex: fanStyle.zIndex
                  }} 
                  onMouseOver={(e) => { 
                    if (isPlayerTurn && !showColorPicker && !isMobile) { 
                      e.currentTarget.style.transform = `translateX(${fanStyle.xOffset}px) rotate(0deg) translateY(-30px) scale(1.15)`; 
                      e.currentTarget.style.zIndex = 1000; 
                    }
                  }} 
                  onMouseOut={(e) => { 
                    if (isPlayerTurn && !showColorPicker && !isMobile) { 
                      e.currentTarget.style.transform = fanStyle.transform; 
                      e.currentTarget.style.zIndex = fanStyle.zIndex; 
                    }
                  }}
                >
                  <Card color={card.color} value={card.value} />
                </div>
              );
            })
          ) : (
            <h2 style={{ color: '#2ecc71', fontSize: isMobile ? '28px' : '40px', textShadow: '0 10px 20px rgba(0,0,0,0.8)', zIndex: 100 }}>🎉 KAZANDIN!</h2>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;