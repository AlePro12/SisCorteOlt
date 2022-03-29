import React, { Component,useState,useEffect } from "react";
import {  Nav, NavItem, NavDropdown, MenuItem, Form, FormControl, Button,Container, Card,Row,Col } from 'react-bootstrap';
//import navbar.js
import Navb from './Navbar'; 
//import axios
import axios from 'axios';
//import jwt_decode
import jwt_decode from 'jwt-decode';
import OltInfo from "./OltInfo";
import ControlPanel from './CPA';
import MapGL, {
    Popup,
    NavigationControl,
    FullscreenControl,
    ScaleControl,
    GeolocateControl
  } from 'react-map-gl';
  


  import Pins from './pin';
  const TOKEN = 'pk.eyJ1IjoiYXB3aXMiLCJhIjoiY2t4NTl4dDliMXExcDJvcG5lNmRiY21vaSJ9.MHT310U-MOYEeK7H2elPhQ'; // Set your mapbox token here


export default function home (props) {
    const { history } = props;

  //useeffect
  useEffect(() => {
    const token = localStorage.getItem('usertoken');
    const decoded = jwt_decode(token);
    setUser(decoded);
    getOlt();

  }, []);
  const [user, setUser] = useState('');

    
const geolocateStyle = {
    top: 0,
    left: 0,
    padding: '10px'
  };
  
  const fullscreenControlStyle = {
    top: 36,
    left: 0,
    padding: '10px'
  };
  
  const navStyle = {
    top: 72,
    left: 0,
    padding: '10px'
  };
  
  const scaleControlStyle = {
    bottom: 36,
    left: 0,
    padding: '10px'
  };

  const onAdd = () => {
      props.history.push('/CreateOlt');
  }
  const ConnectOlt = (data) => {
      console.log(data);
     history.push('/Olt/'+data._id);
}
    const [viewport, setViewport] = useState({
        latitude: 10.364139,
        longitude: -71.400743,
        zoom: 11.7,
        bearing: 0,
        pitch: 0
      });
      const [popupInfo, setPopupInfo] = useState(null);
      //get the cities from api
      const [cities, setCities] = useState([]);


      const [olt, setOlt] = useState([]);

      const getOlt = async () => {
        const res = await axios.get('/api/Olt');
        setOlt(res.data);
        console.log(res.data);
      };


       const CITIES = [
        {"Olt_id":"61b58776d95f640dc0f0b194","city":"Cabimas","image":"/Olt.png","state":"Zulia","latitude":10.403520,"longitude":-71.451926},
        {"Olt_id":"61b58741d95f640dc0f0b17b","city":"Punta Gorda","image":"/Olt.png","state":"Zulia","latitude":10.318264,"longitude":-71.402965},
       ]
        return (
<>
<MapGL
        {...viewport}
        width="100vw"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={setViewport}
        mapboxApiAccessToken={TOKEN}
      >
        <Pins data={olt} onClick={setPopupInfo} />
        {popupInfo && (
          <Popup
            tipSize={5}
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeOnClick={false}
            onClose={setPopupInfo}
          >
            <OltInfo info={popupInfo} onClick={ConnectOlt} />
          </Popup>
        )}
        <GeolocateControl style={geolocateStyle} />
        <FullscreenControl style={fullscreenControlStyle} />
        <NavigationControl style={navStyle} />
        <ScaleControl style={scaleControlStyle} />
      </MapGL>

      <ControlPanel onClick={onAdd} />
</>
        );
        
    }
