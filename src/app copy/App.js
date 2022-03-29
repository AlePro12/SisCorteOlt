import React from 'react'
import axios from 'axios';
import Navb from './Components/Navbar'
import ReactExport from "react-data-export";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
import { Container,Card,Button,Form,Row,Col,Table,Modal } from 'react-bootstrap'



//http://localhost:3000/Lista
export default function App() {//#062346
    const [Onus, setOnus] = React.useState([]);
    const [OnusEx, setOnusEx] = React.useState([]);

    const [ResExc, setResExc] = React.useState({ListaDeCorte:[],ListaDeActivacion:[] });
    const [Fetcher, setFetcher] = React.useState(false);
    const [Excel, setExcel] = React.useState({
        file:[]
    });
    const [show, setShow] = React.useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleInputChange = (event) => {
        setExcel({
          ...Excel,
          file:event.target.files[0]
        });
      }
      const [isLoading, setLoading] = React.useState(false);
      const [isSucces, setSuccess] = React.useState(false);
      const [Onusloads, setOnusloads] = React.useState(false);

      const handleLoadingButton = () => {
          setLoading(true)
        SendList()
        };
        
      const SendList = () =>{
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ListaDeActivacion: ResExc.ListaDeActivacion,ListaDeCorte:ResExc.ListaDeCorte })
        };
        fetch('/SendMassCut',requestOptions)
        .then(response => response.json())
        .then(data => {
          if (data.status == true){
              alert("Proceso completado con exito");
              setShow(false)
              handleClose()
            //handleClose(true);
          }
        })
        .catch(error => console.log(error));
      }
       const submit = async () =>{
          console.log("Subiendo...")
        const formdata = new FormData(); 
        formdata.append('uploaded_file', Excel.file);
    
        axios.post("/Upload", formdata,{   
                headers: { "Content-Type": "multipart/form-data" } 
        })
        .then(res => { // then print response status
          console.warn(res);
          setSuccess(true);
          setResExc(res.data)
          handleShow()
          if(res.data.success === 1){
          }
        })
      }
    React.useEffect(() => {
        FetchOnus();
        // Actualiza el título del documento usando la API del navegador
      });
      const RenderExcel = () =>{


          return (
            <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>PON SN</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
            {
              ResExc.ListaDeActivacion.map(( listValue2, index ) => {
         
          return(
            <tr key={index}>
              <td>{index}</td>
              <td>{listValue2}</td>
              <td>
                Conexion
              </td>
            </tr>
          );
               
            })
              }
                  {
              ResExc.ListaDeCorte.map(( listValue2, index ) => {
         
          return(
            <tr key={index}>
              <td>{index}</td>
              <td>{listValue2}</td>
              <td>
                Desconectar
              </td>
            </tr>
          );
            })
              }
            </tbody>
          </Table>
          )
      }
    const FetchOnus = () => {
        if(Fetcher == false){
            console.log("Fetching...")
            setFetcher(true);
            fetch('/Lista')
            .then(response => response.text())
            .then(data => {
              if (data == "[]"){
                //setNotEmps(true);
              }else{
                setOnus(JSON.parse(data));
                setOnusloads(true)
                console.log(JSON.parse(data));
              }
            })
            .catch(error => console.log(error));
        }

    };
    const setActiveClient = (sn,acti) =>{
        var urld = ""
        if (acti == true) {
            console.log("disable");

            urld = '/DisableOnu/'+sn
        }else{
            urld = '/EnabledOnu/'+sn
        }
        fetch(urld)
        .then(response => response.text())
        .then(data => {
          if (data == "[]"){
            //setNotEmps(true);
          }else{
            console.log(JSON.parse(data));
          }
        })
        .catch(error => console.log(error));
    }
    const SwitchMode = ({acti,sn}) =>{
        if (acti == true) {
            return (
            <Form >
            <Form.Check 
              type="switch"
              id="custom-switch"
              label=""
              onChange={() => setActiveClient(sn,acti)}
              checked
              />
          </Form>
        )
    }else{
    return (
        <Form >
        <Form.Check 
          type="switch"
          id="custom-switch"
          label=""
          onChange={() => setActiveClient(sn,acti)}
          
          />
      </Form>
    )

    }
    }
    //Onusloads
    var DownloadExcel;
    if (Onusloads) {
    DownloadExcel = (
        <ExcelFile>
        <ExcelSheet data={Onus} element={<Button variant="info"  style={{color:'#fff'}}>Descargar Excel</Button>} name="Colnetwork">
            <ExcelColumn label="Nombre" value="name"/>
            <ExcelColumn label="ONU SN" value="json.sn"/>
            <ExcelColumn label="Estado" value="json.administrative_status"/>
        </ExcelSheet>
    </ExcelFile>
        );
} else {
    DownloadExcel = <br></br>;
}




    var RenderTabEx;
    if (isSucces) {
        console.log("Okk");
        console.log(ResExc);
        console.log("arr");
        console.log(ResExc.ListaDeCorte);
        console.log("end");
        RenderTabEx = (
              <RenderExcel/>
            );
    } else {
        RenderTabEx = <h5>-</h5>;
    }

    return (
        <div>
             <Navb/>
             <br></br>
        <Container >

        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Desea Continuar?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {RenderTabEx}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="error" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary"   disabled={isLoading}
      onClick={!isLoading ? handleLoadingButton : null}
>
            Continuar
          </Button>
        </Modal.Footer>
      </Modal>

        <Card>
        <Card.Header>Subir Excel para Desconexion/Conexion masiva</Card.Header>
  <Card.Body>
    <Card.Title>Desconexion/Conexion</Card.Title>
    <Card.Text>
      Subir el archivo excel para empezar. En caso de no tenerlo descargarlo para moduficarlo al gusto
    </Card.Text>
    <form action="/Upload" method="post" encType="multipart/form-data">

    <Form.Group controlId="formFile" className="mb-3">
    <Form.Label>Default file input example</Form.Label>
    <Form.Control type="file" onChange={handleInputChange} name="uploaded_file" />
    </Form.Group>
    </form>
<Container >
  <Row>
    <Col xs={3}>  {DownloadExcel}</Col>
  
    <Col xs={3}><Button variant="primary" onClick={()=>submit()} >Enviar</Button></Col>
  </Row>
</Container>
  </Card.Body>
        </Card>



<br></br>

        <Card>
        <Card.Header>Lista de Clientes </Card.Header>
  <Card.Body>
    <Card.Title>Desconexion/Conexion Manual</Card.Title>
    <Card.Text>
    </Card.Text>
    

    <Table striped bordered hover>
  <thead>
    <tr>
      <th>#</th>
      <th>ONU SN</th>
      <th>Nombre</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody>
      
  {Onus.map(( listValue, index ) => {
      var ActiveClient = false
      if(listValue.json.administrative_status == "Enabled"){
        ActiveClient = true
      }else{
        ActiveClient = false
      }
          return (
            <tr key={index}>
              <td>{index}</td>
              <td>{listValue.sn}</td>
              <td>{listValue.json.name}</td>
              <td>
                 <SwitchMode acti={ActiveClient} sn={listValue.sn} />
              </td>
            </tr>
          );
        })}

  </tbody>
</Table>
  </Card.Body>
        </Card>

        
        </Container>
        
        </div>
    )

    const styles = StyleSheet.create({
        width:'100%',
        textAlign:'center',
        color:'white'
    })
    
}
