const API_URL = 'https://6aad398aa2413bf0ec1180a8.mockapi.io/cards';

// 1. OYUN İÇİN KARTLARI API'DEN ÇEKME FONKSİYONU
export const getCards = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    // Güvenlik: Eğer gelen veri bir liste (array) değilse (örneğin tablo yoksa) boş döndür
    if (!Array.isArray(data)) {
      console.error("HATA: API'den veriler dizi olarak gelmedi. Tablo ismi yanlış veya tablo boş olabilir.");
      return [];
    }
    
    // Gelen desteyi karıştırarak (shuffle) döndürüyoruz
    return data.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("API'den veri çekilemedi:", error);
    return [];
  }
};

// 2. KARTLARI API'YE TEK SEFERLİK YÜKLEME FONKSİYONU
export const apiyeKartlariYukle = async () => {
  const tamDeste = [
    { color: "red", value: "1", type: "number" }, { color: "red", value: "5", type: "number" },
    { color: "red", value: "skip", type: "action" }, { color: "red", value: "reverse", type: "action" }, { color: "red", value: "+2", type: "action" },
    
    { color: "blue", value: "2", type: "number" }, { color: "blue", value: "7", type: "number" },
    { color: "blue", value: "skip", type: "action" }, { color: "blue", value: "reverse", type: "action" }, { color: "blue", value: "+2", type: "action" },
    
    { color: "green", value: "4", type: "number" }, { color: "green", value: "8", type: "number" },
    { color: "green", value: "skip", type: "action" }, { color: "green", value: "reverse", type: "action" }, { color: "green", value: "+2", type: "action" },
    
    { color: "yellow", value: "3", type: "number" }, { color: "yellow", value: "9", type: "number" },
    { color: "yellow", value: "skip", type: "action" }, { color: "yellow", value: "reverse", type: "action" }, { color: "yellow", value: "+2", type: "action" },
    
    { color: "black", value: "wild", type: "wild" }, { color: "black", value: "wild", type: "wild" },
    { color: "black", value: "+4", type: "wild" }, { color: "black", value: "+4", type: "wild" }
  ];

  console.log("Yükleme başladı, lütfen bekleyin...");
  
  // Döngü ile tüm kartları tek tek MockAPI'ye POST ediyoruz
  for (let kart of tamDeste) {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kart)
    });
  }
  
  alert("Tebrikler! Tüm kartlar MockAPI veritabanına başarıyla yüklendi. Artık bu butonu silebilirsin.");
};