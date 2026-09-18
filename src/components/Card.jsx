import './Card.css';

export default function Card({ color, value }) {
  const cardColor = 
    color === 'black' ? '#2c3e50' : 
    color === 'red' ? '#e74c3c' :
    color === 'blue' ? '#3498db' :
    color === 'green' ? '#2ecc71' :
    color === 'yellow' ? '#f1c40f' : '#bdc3c7';

  let displayValue = value;
  let miniValue = value;
  
  if (value === 'skip') { displayValue = '⊘'; miniValue = '⊘'; }
  if (value === 'reverse') { displayValue = '⇄'; miniValue = '⇄'; }
  if (value === 'wild') { displayValue = '🌈'; miniValue = 'W'; }
  if (value === '+4') { displayValue = '+4'; miniValue = '+4'; }
  if (value === '+2') { displayValue = '+2'; miniValue = '+2'; }

  return (
    <div className="uno-card">
      <div className="uno-card-inner" style={{ backgroundColor: cardColor }}>
        
        {/* Sol Üst Mini Rakam */}
        <span className="uno-card-mini mini-top-left">{miniValue}</span>

        {/* Beyaz Oval Arka Plan */}
        <div className="uno-card-oval"></div>
        
        {/* Ortadaki Büyük Rakam */}
        <span className="uno-card-center-value">{displayValue}</span>

        {/* Sağ Alt Mini Rakam (Ters Dönmüş) */}
        <span className="uno-card-mini mini-bottom-right">{miniValue}</span>
        
      </div>
    </div>
  );
}