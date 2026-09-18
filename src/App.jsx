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

  useEffect(() => {
    const fetchDeck = async () => {
      const cards = await getCards();
      if (cards.length > 0) {
        setMiddleCard(cards[0]); 
        const remainingCards = cards.slice(1);
        const half = Math.floor(remainingCards.length / 2);
        setPlayerHand(remainingCards.slice(0, half));
        setComputerHand(remainingCards.slice(half));
      }
    };
    fetchDeck();
  }, []);

  const tetikleUno = () => {
    setShowUnoButton(true);
    const timer = setTimeout(() => {
      setShowUnoButton(false);
      setTimeout(() => alert("Süresi içinde UNO demeyi unuttun! Ceza olarak 2 kart çektin."), 10);
      setPlayerHand(prev => [...prev, ...kartUret(2)]);
    }, 2000);
    setUnoTimer(timer);
  };

  const handleUnoClick = () => {
    clearTimeout(unoTimer); 
    setShowUnoButton(false); 
    setTimeout(() => alert("UNO! Harika, son kartın kaldı."), 10);
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
        setTimeout(() => alert("Sıra atlandı! Tekrar sen oynuyorsun."), 10);
      } else if (oynananKart.value === '+2') {
        setComputerHand(prev => [...prev, ...kartUret(2)]);
        setTimeout(() => alert("Bilgisayar 2 kart çekti ve sırasını kaybetti! Tekrar sen oynuyorsun."), 10);
      } else {
        setIsPlayerTurn(false); 
      }
    } else {
      alert("Bu kartı oynayamazsın! Renk veya değer eşleşmeli.");
    }
  };

  const renkSec = (secilenRenk) => {
    setMiddleCard({ ...pendingWildCard, color: secilenRenk });
    setShowColorPicker(false);
    
    if (pendingWildCard.value === '+4') {
      setComputerHand(prev => [...prev, ...kartUret(4)]);
      setTimeout(() => alert(`Renk ${secilenRenk} oldu. Bilgisayar 4 kart çekti ve sırasını kaybetti! Tekrar oynuyorsun.`), 10);
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
      setTimeout(() => alert(`Desteden uyumlu kart geldi! İstersen hemen atabilirsin.`), 10);
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
            kart.value === 'wild' || 
            kart.value === '+4' || 
            kart.type === 'wild' ||
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
              setTimeout(() => alert(`Bilgisayar +4 attı, renk ${rastgeleRenk.ad}! 4 kart çektin ve sıra atlandı. Tekrar bilgisayar oynuyor.`), 10);
            } else {
              setTimeout(() => alert(`Bilgisayar Joker attı ve rengi ${rastgeleRenk.ad} yaptı!`), 10);
              setIsPlayerTurn(true);
            }
          } 
          else if (playableCard.value === '+2') {
            setMiddleCard(playableCard);
            setPlayerHand(prev => [...prev, ...kartUret(2)]);
            setTimeout(() => alert("Bilgisayar +2 attı! 2 kart çektin ve sıra atlandı. Tekrar bilgisayar oynuyor."), 10);
          }
          else if (playableCard.value === 'skip' || playableCard.value === 'reverse') {
            setMiddleCard(playableCard);
            setTimeout(() => alert("Bilgisayar sıra atlatma kartı kullandı! Tekrar bilgisayar oynuyor."), 10);
          } 
          else {
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
    <main style={{ position: 'relative', display: 'grid', gridTemplateRows: '1fr 2fr 1fr', height: '100vh', background: 'radial-gradient(circle, #2e7d32 0%, #173e19 100%)', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {showUnoButton && (
        <button 
          onClick={handleUnoClick}
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 2000, backgroundColor: '#d32f2f', color: 'white',
            border: '8px solid white', borderRadius: '50%', width: '160px', height: '160px',
            fontSize: '40px', fontWeight: '900', fontFamily: '"Arial Black", sans-serif',
            cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.6)', textShadow: '2px 2px 0 #000'
          }}
        >
          UNO!
        </button>
      )}

      {showColorPicker && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '32px', textShadow: '2px 2px 4px #000' }}>Bir Renk Seç</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div onClick={() => renkSec('red')} style={{ width: '80px', height: '80px', backgroundColor: '#d32f2f', borderRadius: '50%', cursor: 'pointer', border: '4px solid white', boxShadow: '0 0 15px rgba(211,47,47,0.8)' }}></div>
            <div onClick={() => renkSec('blue')} style={{ width: '80px', height: '80px', backgroundColor: '#1976d2', borderRadius: '50%', cursor: 'pointer', border: '4px solid white', boxShadow: '0 0 15px rgba(25,118,210,0.8)' }}></div>
            <div onClick={() => renkSec('green')} style={{ width: '80px', height: '80px', backgroundColor: '#388e3c', borderRadius: '50%', cursor: 'pointer', border: '4px solid white', boxShadow: '0 0 15px rgba(56,142,60,0.8)' }}></div>
            <div onClick={() => renkSec('yellow')} style={{ width: '80px', height: '80px', backgroundColor: '#fbc02d', borderRadius: '50%', cursor: 'pointer', border: '4px solid white', boxShadow: '0 0 15px rgba(251,192,45,0.8)' }}></div>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20px' }}>
        {computerHand.length > 0 ? (
          computerHand.map((card, index) => (
            <div key={card.id} style={{ 
              width: '60px', height: '90px', backgroundColor: '#212121', 
              border: '3px solid white', borderRadius: '8px', marginLeft: index !== 0 ? '-25px' : '0', 
              boxShadow: '-2px 0 5px rgba(0,0,0,0.3)', backgroundImage: 'radial-gradient(#d32f2f 15%, transparent 16%), radial-gradient(#d32f2f 15%, transparent 16%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px'
            }}></div>
          ))
        ) : (
          <h2 style={{ color: 'gold', textShadow: '2px 2px 4px #000' }}>BİLGİSAYAR KAZANDI!</h2>
        )}
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', opacity: 0.9 }}>
          {isPlayerTurn ? "Sıra Sende" : "Bilgisayar Düşünüyor..."}
        </div>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <article 
            onClick={destedenKartCek}
            style={{ 
              width: '90px', height: '135px', backgroundColor: '#212121', border: '4px solid white', 
              borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
              color: 'white', cursor: isPlayerTurn && !showColorPicker ? 'pointer' : 'not-allowed', fontWeight: 'bold', userSelect: 'none',
              boxShadow: isPlayerTurn ? '2px 2px 0 #eee, 4px 4px 0 #ccc, 6px 6px 0 #999, 8px 8px 10px rgba(0,0,0,0.5)' : '2px 2px 0 #555, 4px 4px 0 #444, 6px 6px 0 #333, 8px 8px 10px rgba(0,0,0,0.5)',
              transform: isPlayerTurn ? 'translateY(-2px)' : 'none', transition: 'all 0.2s', backgroundImage: 'repeating-linear-gradient(45deg, #d32f2f, #d32f2f 10px, #b71c1c 10px, #b71c1c 20px)'
            }}
          >
            <span style={{ backgroundColor: 'white', color: '#d32f2f', padding: '5px 10px', borderRadius: '20px', fontSize: '18px', transform: 'rotate(-20deg)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>UNO</span>
          </article>
          
          {middleCard ? (
            <div style={{ transform: 'rotate(5deg) scale(1.1)', boxShadow: '5px 5px 15px rgba(0,0,0,0.4)', borderRadius: '12px' }}>
              <Card color={middleCard.color} value={middleCard.value} />
            </div>
          ) : (
            <article style={{ width: '90px', height: '135px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '2px dashed rgba(255,255,255,0.3)' }}></article>
          )}
        </div>
      </section>

      <footer style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '30px' }}>
        {playerHand.length > 0 ? (
          playerHand.map((card, index) => (
            <div 
              key={card.id} 
              onClick={() => kartOyna(card)} 
              style={{ 
                cursor: isPlayerTurn && !showColorPicker ? 'pointer' : 'not-allowed', 
                opacity: isPlayerTurn && !showColorPicker ? 1 : 0.6, 
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), z-index 0s', 
                marginLeft: index !== 0 ? '-35px' : '0', position: 'relative', zIndex: index 
              }} 
              onMouseOver={(e) => { 
                if (isPlayerTurn && !showColorPicker) { e.currentTarget.style.transform = 'translateY(-20px) scale(1.05)'; e.currentTarget.style.zIndex = 100; }
              }} 
              onMouseOut={(e) => { 
                if (isPlayerTurn && !showColorPicker) { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.zIndex = index; }
              }}
            >
              <Card color={card.color} value={card.value} />
            </div>
          ))
        ) : (
          <h2 style={{ color: 'gold', textShadow: '2px 2px 4px #000' }}>TEBRİKLER, KAZANDIN!</h2>
        )}
      </footer>
    </main>
  );
}

export default App;