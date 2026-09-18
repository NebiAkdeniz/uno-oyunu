import { useEffect, useState } from 'react';
import { getCards } from './services/api';
import Card from './components/Card';

function App() {
  const [deck, setDeck] = useState([]);

  useEffect(() => {
    const fetchDeck = async () => {
      const cards = await getCards();
      setDeck(cards);
    };
    fetchDeck();
  }, []);

  // BURAYA EKLEDİK: Deste verisini tarayıcının konsoluna yazdır
  console.log("MockAPI'den Gelen Deste:", deck);

  return (
    // <main> sayfanın ana içeriğini temsil eder
    <main style={{ 
      display: 'grid', 
      gridTemplateRows: '1fr 2fr 1fr', 
      height: '100vh', 
      backgroundColor: '#2e7d32', 
      fontFamily: 'sans-serif'
    }}>
      
      {/* <header> üst bilgi veya rakip alanı için semantik bir tercihtir */}
      <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20px' }}>
        <h2 style={{ color: 'white', margin: 0, opacity: 0.5 }}>Rakip Bekleniyor...</h2>
      </header>

      {/* <section> bağımsız bir bölümü (oyun tahtasını) belirtir */}
      <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <article style={{ width: '100px', height: '150px', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
          Deste
        </article>
        <article style={{ width: '100px', height: '150px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}></article>
      </section>

      {/* <footer> sayfanın veya oyunun alt kısmını (senin elini) temsil eder */}
      <footer style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '20px', gap: '10px' }}>
        {deck.length > 0 ? (
          deck.map((card) => (
            <Card key={card.id} color={card.color} value={card.value} />
          ))
        ) : (
          <p style={{ color: 'white' }}>Kartlar yükleniyor...</p>
        )}
      </footer>

    </main>
  );
}

export default App;