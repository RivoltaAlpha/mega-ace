import React from 'react';
import './styles.css';

const PayTable = ({ onClose }) => {
    const symbolPayouts = {
        GOLD: { name: 'Gold', payouts: { 3: 100, 4: 200, 5: 500, 6: 1000 } },
        DIAMOND: { name: 'Diamond', payouts: { 3: 80, 4: 160, 5: 400, 6: 800 } },
        CLUB: { name: 'Club', payouts: { 3: 60, 4: 120, 5: 300, 6: 600 } },
        HEART: { name: 'Heart', payouts: { 3: 50, 4: 100, 5: 250, 6: 500 } },
        SPADE: { name: 'Spade', payouts: { 3: 40, 4: 80, 5: 200, 6: 400 } }
    };

    const specialSymbols = {
        SMALL_JOKER: {
            name: 'Small Joker',
            description: 'Transforms into any regular symbol to create winning combinations'
        },
        BIG_JOKER: {
            name: 'Big Joker',
            description: 'Expands to cover multiple positions and transforms into matching symbols'
        }
    };

    return (
        <div className="paytable-overlay">
            <div className="paytable-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Mega Ace Paytable</h2>
                
                <div className="paytable-grid">
                    {Object.entries(symbolPayouts).map(([symbol, data]) => (
                        <div key={symbol} className="symbol-row">
                            <div className="symbol-info">
                                <img src={`/assets/symbols/${symbol.toLowerCase()}.png`} alt={data.name} />
                                <span>{data.name}</span>
                            </div>
                            <div className="payouts">
                                {Object.entries(data.payouts).map(([count, value]) => (
                                    <div key={count}>{count}: {value}x</div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="special-symbols">
                    <h3>Special Symbols</h3>
                    {Object.entries(specialSymbols).map(([symbol, data]) => (
                        <div key={symbol} className="special-symbol">
                            <img src={`/assets/symbols/${symbol.toLowerCase()}.png`} alt={data.name} />
                            <div>
                                <h4>{data.name}</h4>
                                <p>{data.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PayTable;