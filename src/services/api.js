const API_URL = 'https://6aad398aa2413bf0ec1180a8.mockapi.io/cards';

export const getCards = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("API Hatası:", error);
    return [];
  }
};

export const apiyeKartlariYukle = async () => {
  const tamDeste = [];
  const renkler = ['red', 'blue', 'green', 'yellow'];
  
  // 1'den 9'a kadar normal sayılar (Her renkten 9 adet = Toplam 36 sayı kartı)
  renkler.forEach(renk => {
    for (let i = 1; i <= 9; i++) {
      tamDeste.push({ color: renk, value: String(i), type: "number" });
    }
    // Her renkten 1'er adet özel kart (Toplam 12 renkli özel kart)
    tamDeste.push({ color: renk, value: "skip", type: "action" });
    tamDeste.push({ color: renk, value: "reverse", type: "action" });
    tamDeste.push({ color: renk, value: "+2", type: "action" });
  });

  // 4 adet siyah kart
  tamDeste.push({ color: "black", value: "wild", type: "wild" });
  tamDeste.push({ color: "black", value: "wild", type: "wild" });
  tamDeste.push({ color: "black", value: "+4", type: "wild" });
  tamDeste.push({ color: "black", value: "+4", type: "wild" });

  console.log("52 kartlık gerçekçi deste yükleniyor...");
  
  for (let kart of tamDeste) {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kart)
    });
  }
  
  alert("Gerçekçi oranlara sahip 52 kart başarıyla yüklendi! Lütfen sayfayı yenileyin.");
};