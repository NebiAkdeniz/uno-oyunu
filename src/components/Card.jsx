// src/components/Card.jsx
import './Card.css';

export default function Card({ color, value }) {
  // Gelen renklere göre daha canlı ve doygun hex kodları belirliyoruz
  const cardColor = 
    color === 'black' ? '#212121' : 
    color === 'red' ? '#d32f2f' :
    color === 'blue' ? '#1976d2' :
    color === 'green' ? '#388e3c' :
    color === 'yellow' ? '#fbc02d' : '#e0e0e0';

  // Uzun yazıları (reverse, skip, wild) kısaltıp ikonlaştırıyoruz
  let displayValue = value;
  if (value === 'skip') displayValue = '⊘';
  if (value === 'reverse') displayValue = '⇄';
  if (value === 'wild') displayValue = 'W';

  return (
    <div className="uno-card">
      <div className="uno-card-inner" style={{ backgroundColor: cardColor }}>
        {displayValue}
      </div>
    </div>
  );
}