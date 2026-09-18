import { useEffect, useState } from 'react';
import { getCards } from './services/api'; // apiyeKartlariYukle silindi!
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
      showMessage("⏳ Süresi içinde UNO demeyi unuttun! Ceza olarak 2 kart çektin.");
      setPlayerHand(prev => [...prev, ...kartUret(2)]);
    }, 2000);
    setUnoTimer(timer);
  };

  const handleUnoClick = () => {
    clearTimeout(unoTimer); 
    setShowUnoButton(false); 
    showMessage("🎉 UNO! Harika, son kartın kaldı.");
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
        showMessage("🛑 Sıra atlandı! Tekrar sen oynuyorsun.");
      } else if (oynananKart.value === '+2') {
        setComputerHand(prev => [...prev, ...kartUret(2)]);
        showMessage("💥 Bilgisayar 2 kart çekti ve sırasını kaybetti!");
      } else {
        setIsPlayerTurn(false); 
      }
    } else {
      showMessage("❌ Bu kartı oynayamazsın! Renk veya değer eşleşmeli.");
    }
  };

  const renkSec = (secilenRenk) => {
    setMiddleCard({ ...pendingWildCard, color: secilenRenk });
    setShowColorPicker(false);
    if (pendingWildCard.value === '+4') {
      setComputerHand(prev => [...prev, ...kartUret(4)]);
      showMessage(`🎨 Renk değişti. Bilgisayar 4 kart çekti, tekrar oynuyorsun!`);
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
      showMessage("✨ Desteden uyumlu kart geldi! Hemen atabilirsin.");
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
            kart.color === middleCard.color || 
            kart.value === middleCard.value || 
            kart.value === 'wild' || kart.value === '+4' || kart.type === 'wild' ||
            isFirstCardBlackWild
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
              showMessage(`😱 Bilgisayar +4 attı! Renk ${rastgeleRenk.ad}. 4 kart çektin.`);
            } else {
              showMessage(`🤖 Bilgisayar Joker attı, renk: ${rastgeleRenk.ad}`);
              setIsPlayerTurn(true);
            }
          } 
          else if (playableCard.value === '+2') {
            setMiddleCard(playableCard);
            setPlayerHand(prev => [...prev, ...kartUret(2)]);
            showMessage("💥 Bilgisayar +2 attı! 2 kart çektin.");
          }
          else if (playableCard.value === 'skip' || playableCard.value === 'reverse') {
            setMiddleCard(playableCard);
            showMessage("🛑 Bilgisayar seni atladı! Tekrar oynuyor.");
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

  return (
    // 1. DAHA DERİN VE GERÇEKÇİ MASA ARKA PLANI
    <main style={{ position: 'relative', display: 'grid', gridTemplateRows: '1fr 2fr 1fr', height: '100vh', background: 'radial-gradient(circle at 50% 50%, #2e7d32 0%, #1b431c 60%, #0d210e 100%)', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', overflow: 'hidden' }}>
      
      {showUnoButton && (
        <button 
          onClick={handleUnoClick}
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 2000, backgroundColor: '#d32f2f', color: 'white', border: '8px solid white', 
            borderRadius: '50%', width: '160px', height: '160px', fontSize: '40px', fontWeight: '900', 
            fontFamily: '"Arial Black", sans-serif', cursor: 'pointer', 
            boxShadow: '0 0 40px rgba(211, 47, 47, 0.8), 0 10px 25px rgba(0,0,0,0.6)', 
            textShadow: '2px 2px 0 #000'
          }}
        >
          UNO!
        </button>
      )}

      {showColorPicker && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
          <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '32px', textShadow: '2px 2px 4px #000', fontWeight: '600' }}>Rengini Seç</h2>
          <div style={{ display: 'flex', gap: '25px' }}>
            <div onClick={() => renkSec('red')} style={{ width: '90px', height: '90px', backgroundColor: '#e53935', borderRadius: '50%', cursor: 'pointer', border: '5px solid white', boxShadow: '0 0 20px rgba(229,57,53,0.8)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}></div>
            <div onClick={() => renkSec('blue')} style={{ width: '90px', height: '90px', backgroundColor: '#1e88e5', borderRadius: '50%', cursor: 'pointer', border: '5px solid white', boxShadow: '0 0 20px rgba(30,136,229,0.8)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}></div>
            <div onClick={() => renkSec('green')} style={{ width: '90px', height: '90px', backgroundColor: '#43a047', borderRadius: '50%', cursor: 'pointer', border: '5px solid white', boxShadow: '0 0 20px rgba(67,160,71,0.8)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}></div>
            <div onClick={() => renkSec('yellow')} style={{ width: '90px', height: '90px', backgroundColor: '#fdd835', borderRadius: '50%', cursor: 'pointer', border: '5px solid white', boxShadow: '0 0 20px rgba(253,216,53,0.8)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}></div>
          </div>
        </div>
      )}

      {/* RAKİP BÖLGESİ */}
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          {computerHand.length > 0 ? (
            computerHand.map((card, index) => (
              <div key={card.id} style={{ 
                width: '60px', height: '90px', backgroundColor: '#212121', 
                border: '3px solid #e0e0e0', borderRadius: '8px', marginLeft: index !== 0 ? '-30px' : '0', 
                boxShadow: '-3px 0 8px rgba(0,0,0,0.4)', backgroundImage: 'radial-gradient(#d32f2f 15%, transparent 16%), radial-gradient(#d32f2f 15%, transparent 16%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
              }}></div>
            ))
          ) : (
            <h2 style={{ color: '#fbc02d', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontSize: '28px' }}>🤖 BİLGİSAYAR KAZANDI!</h2>
          )}
        </div>
      </header>

      {/* MASA ORTASI */}
      <section style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '25px' }}>
        
        {/* ŞIK BİLDİRİM BALONU (Toast) */}
        <div style={{ height: '35px', display: 'flex', alignItems: 'center' }}>
          {gameMessage && (
            <div style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.65)', color: 'white', padding: '8px 20px', 
              borderRadius: '25px', fontSize: '15px', fontWeight: '500', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.3s ease-out'
            }}>
              {gameMessage}
            </div>
          )}
        </div>

        {/* 2. GLASSMORPHISM SIRA GÖSTERGESİ */}
        <div style={{ 
          backgroundColor: isPlayerTurn ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
          border: `1px solid ${isPlayerTurn ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)'}`,
          padding: '10px 30px', borderRadius: '30px', color: 'white', fontSize: '18px', fontWeight: '600',
          backdropFilter: 'blur(8px)', boxShadow: `0 0 20px ${isPlayerTurn ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
          transition: 'all 0.4s ease'
        }}>
          {isPlayerTurn ? "🧑 Sıra Sende" : "🤖 Bilgisayar Düşünüyor..."}
        </div>

        <div style={{ display: 'flex', gap: '50px', alignItems: 'center', marginTop: '10px' }}>
          {/* DESTE */}
          <article 
            onClick={destedenKartCek}
            style={{ 
              width: '95px', height: '142px', backgroundColor: '#212121', border: '4px solid white', 
              borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
              cursor: isPlayerTurn && !showColorPicker ? 'pointer' : 'not-allowed', userSelect: 'none',
              boxShadow: isPlayerTurn ? '2px 2px 0 #eee, 4px 4px 0 #ccc, 6px 6px 0 #999, 8px 8px 15px rgba(0,0,0,0.6)' : '2px 2px 0 #555, 4px 4px 0 #444, 6px 6px 0 #333, 8px 8px 10px rgba(0,0,0,0.5)',
              transform: isPlayerTurn ? 'translateY(-4px)' : 'none', transition: 'all 0.3s ease', 
              backgroundImage: 'repeating-linear-gradient(45deg, #d32f2f, #d32f2f 10px, #b71c1c 10px, #b71c1c 20px)'
            }}
          >
            <span style={{ backgroundColor: 'white', color: '#d32f2f', padding: '6px 12px', borderRadius: '25px', fontSize: '20px', fontWeight: '900', transform: 'rotate(-20deg)', boxShadow: '0 3px 6px rgba(0,0,0,0.4)', fontFamily: '"Arial Black", sans-serif' }}>UNO</span>
          </article>
          
          {/* ORTADAKİ KART */}
          {middleCard ? (
            <div style={{ transform: 'rotate(4deg) scale(1.15)', boxShadow: '8px 8px 25px rgba(0,0,0,0.5)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
              <Card color={middleCard.color} value={middleCard.value} />
            </div>
          ) : (
            <article style={{ width: '90px', height: '135px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '2px dashed rgba(255,255,255,0.4)' }}></article>
          )}
        </div>
      </section>

      {/* OYUNCU BÖLGESİ */}
      <footer style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '40px' }}>
        {playerHand.length > 0 ? (
          playerHand.map((card, index) => (
            <div 
              key={card.id} 
              onClick={() => kartOyna(card)} 
              style={{ 
                cursor: isPlayerTurn && !showColorPicker ? 'pointer' : 'not-allowed', 
                opacity: isPlayerTurn && !showColorPicker ? 1 : 0.7, 
                transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), margin 0.25s, z-index 0s', 
                marginLeft: index !== 0 ? '-40px' : '0', position: 'relative', zIndex: index 
              }} 
              onMouseOver={(e) => { 
                if (isPlayerTurn && !showColorPicker) { e.currentTarget.style.transform = 'translateY(-25px) scale(1.1)'; e.currentTarget.style.zIndex = 100; e.currentTarget.style.marginRight = '15px'; }
              }} 
              onMouseOut={(e) => { 
                if (isPlayerTurn && !showColorPicker) { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.zIndex = index; e.currentTarget.style.marginRight = '0'; }
              }}
            >
              <Card color={card.color} value={card.value} />
            </div>
          ))
        ) : (
          <h2 style={{ color: '#4caf50', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', fontSize: '32px' }}>🎉 TEBRİKLER, KAZANDIN!</h2>
        )}
      </footer>
    </main>
  );
}

export default App;