// src/services/api.js
const API_URL = "https://6aad398aa2413bf0ec1180a8.mockapi.io/cards";

export const getCards = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Kartlar çekilirken hata oluştu:", error);
    return []; // Hata olursa oyun çökmesin, boş dizi dönsün
  }
};