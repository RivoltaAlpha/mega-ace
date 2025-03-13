import React from 'react';
import { SYMBOL_PAYOUTS, SPECIAL_SYMBOLS } from '../config/paytable';

const PayTable = ({ onClose }) => {
    return (
        <div className="paytable-overlay">
            <div className="paytable-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Mega Ace Paytable</h2>
                
                <div className="paytable-grid">
                    {Object.entries(SYMBOL_PAYOUTS).map(([symbol, data]) => (
                        <div key={symbol} className="symbol-row">
                            <div className="symbol-info">
                                <img src={`/assets/symbols/${symbol}.png`} alt={data.name} />
                                <span>{data.name}</span>
                            </div>
                            <div className="payouts">
                                <div>3: {data[3]}x</div>
                                <div>4: {data[4]}x</div>
                                <div>5: {data[5]}x</div>
                                <div>6: {data[6]}x</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="special-symbols">
                    <h3>Special Symbols</h3>
                    {Object.entries(SPECIAL_SYMBOLS).map(([symbol, data]) => (
                        <div key={symbol} className="special-symbol">
                            <img src={`/assets/symbols/${symbol}.jpg`} alt={data.name} />
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