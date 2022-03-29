import * as React from 'react';

function OltInfo(props) {
  const {info , onClick} = props;
  const displayName = `${info.City}, ${info.State}`;

  return (
    <div>
      <div>
        {displayName} | { info.Descrip}
       
      </div>
      <img width={240} src={info.image} /><br></br>
      <button style={{
            background: 'blue',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            color: 'white',
        }}
        onClick={() => onClick(info)}
        >Conectar</button>
    </div>
  );
}

export default React.memo(OltInfo);