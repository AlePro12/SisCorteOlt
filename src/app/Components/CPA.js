import * as React from 'react';

function ControlPanel(props) {
    const { onClick} = props;
  return (
    <div className="control-panel">
      <h3>Mapa de Olts </h3>
      <button style={{
            background: 'blue',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            color: 'white',
        }} onClick={ () => onClick() }> Anadir Olt</button>
      </div>
  );
}
export default React.memo(ControlPanel);