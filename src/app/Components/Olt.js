import React from "react";
import axios from "axios";
import ReactExport from "react-data-export";
import swal from "sweetalert";
import BootstrapTable from "react-bootstrap-table-next";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Table,
  Modal,
  Spinner,
} from "react-bootstrap";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import TableInfoClients from "./TableInfoClients";

//http://localhost:3000/Lista
export default function Olt(props) {
  //#062346
  const { Oltid } = props;
  const [Onus, setOnus] = React.useState([]);
  //filter
  const [filter, setFilter] = React.useState("");
  const [OnusEx, setOnusEx] = React.useState([]);

  const [ResExc, setResExc] = React.useState({
    ListaDeCorte: [],
    ListaDeActivacion: [],
  });
  const [Fetcher, setFetcher] = React.useState(false);
  const [Excel, setExcel] = React.useState({
    file: [],
  });
  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleInputChange = (event) => {
    setExcel({
      ...Excel,
      file: event.target.files[0],
    });
  };
  const [isLoading, setLoading] = React.useState(false);
  const [isSucces, setSuccess] = React.useState(false);
  const [Onusloads, setOnusloads] = React.useState(false);
  const handleLoadingButton = () => {
    setLoading(true);
    SendList();
  }; //Franginer Katherin Guillen Griman
  const EditName = (onu) => {
    swal({
      text: "Cambiar nombre onu",
      content: "input",
      button: {
        text: "Guardar",
        closeModal: false,
      },
    })
      .then((onuName) => {
        if (!onu) throw null;

        return axios.put(`/api/onu/edit/${onu}`, {
          name: onuName,
        });
      })
      .then((json) => {
        if (json.data.status == true) {
          var newOnus = Onus.map(function (onup) {
            if (onu == onup.PON) {
              onup.LocalInfo.Nombre = onuName;
              console.log(onup.LocalInfo.Nombre);
            }
            return onup;
          });
          setOnus(newOnus);
          return swal("Nombre de ONU Actualizado");
        }
      });
  };

  const SendList = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ListaDeActivacion: ResExc.ListaDeActivacion,
        ListaDeCorte: ResExc.ListaDeCorte,
      }),
    };
    fetch("/api/Olt/SendMassCut/" + Oltid, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.status == true) {
          // alert("Proceso completado con exito \n"+JSON.stringify(data));
          setShow(false);
          handleClose();
          setLoading(false);
          //downloadLogFile(data.Log)

          swal({
            title: "Lista Ejecutada!",
            showDenyButton: true,
            text: `Cortes Completados: ${data.CortesCompletados}\nCortes Fallidos: ${data.CortesFallidos}\nActivaciones Completadas: ${data.ActivacionesCompletadas}\n Activaciones Fallidas: ${data.ActivacionesFallidas}\n`,
            icon: "success",

            buttons: {
              cancel: "Listo",
              catch: {
                text: "Descargar Log",
                value: "Log",
              },
            },
          }).then((value) => {
            switch (value) {
              case "Log":
                downloadLogFile(data.Log);
                // swal("PRITNTLOG");
                break;
            }
          });

          //handleClose(true);
        }
      })
      .catch((error) => console.log(error));
  };
  const submit = async () => {
    console.log("Subiendo...");
    const formdata = new FormData();
    formdata.append("uploaded_file", Excel.file);

    axios
      .post("/api/Olt/Upload/" + Oltid, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        // then print response status
        console.warn(res);
        setSuccess(true);
        setResExc(res.data);
        handleShow();
        if (res.data.success === 1) {
        }
      });
  };
  React.useEffect(() => {
    console.log(Oltid);
    FetchOnus();
    // Actualiza el título del documento usando la API del navegador
  });
  const downloadLogFile = (Log) => {
    var cadena = "";
    for (var i = 0; i < Log.length; i++) {
      console.log(Log[i]);
      cadena = cadena + Log[i] + "\n";
    }
    const element = document.createElement("a");
    const file = new Blob([cadena], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    //log file name withh date and time
    element.download = "Log_Corte_" + new Date().toLocaleString() + ".log";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };
  const RenderExcel = () => {
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
          {ResExc.ListaDeActivacion.map((listValue2, index) => {
            return (
              <tr key={index}>
                <td>{index}</td>
                <td>{listValue2}</td>
                <td>Conexion</td>
              </tr>
            );
          })}
          {ResExc.ListaDeCorte.map((listValue2, index) => {
            return (
              <tr key={index}>
                <td>{index}</td>
                <td>{listValue2}</td>
                <td>Desconectar</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };
  const FetchOnus = () => {
    if (Fetcher == false) {
      console.log("Fetching...");
      setFetcher(true);
      fetch("/api/Olt/Lista/" + Oltid)
        .then((response) => response.text())
        .then((data) => {
          if (data == "[]") {
            //setNotEmps(true);
          } else {
            console.log(JSON.parse(data).onu);
            setOnus(JSON.parse(data).onu);
            setOnusloads(true);
            NotificationManager.success(
              "Lista descargada",
              "Se recibio la lista del Servidor",
              3000
            );
          }
        })
        .catch((error) =>
          NotificationManager.error("Fatal error al ejecutar", error, 3000)
        );
    }
  };
  const setActiveClient = (sn, acti) => {
    var urld = "api/Olt/" + Oltid;
    console.log(acti);
    if (acti == true) {
      console.log("disable");
      urld = "/api/Olt/DisableOnu/" + sn + "/" + Oltid;
    } else {
      urld = "/api/Olt/EnableOnu/" + sn + "/" + Oltid;
    }
    fetch(urld)
      .then((response) => response.json())
      .then((data) => {
        if (data.ok == true) {
          //setNotEmps(true);
          //search the onu in the list and change the status
          var newOnus = Onus.map(function (onu) {
            if (onu.PON == sn) {
              if (acti == true) {
                onu.LocalInfo.AdminState = false;
              } else {
                onu.LocalInfo.AdminState = true;
              }
            }
            return onu;
          });
          setOnus(newOnus);
          NotificationManager.success(
            "Onu " + sn + " " + acti,
            "Cliente Actualizado",
            3000
          );
        } else {
          //console.log(JSON.parse(data));
        }
      })
      .catch((error) => console.log(error));
  };
  const SwitchMode = ({ acti, sn }) => {
    console.log(acti);
    if (acti == true) {
      return (
        <Form>
          <Form.Check
            type="switch"
            id="custom-switch"
            label=""
            onChange={() => setActiveClient(sn, acti)}
            checked
          />
        </Form>
      );
    } else {
      return (
        <Form>
          <Form.Check
            type="switch"
            id="custom-switch"
            label=""
            onChange={() => setActiveClient(sn, acti)}
          />
        </Form>
      );
    }
  };
  //Onusloads
  var DownloadExcel;
  if (Onusloads) {
    DownloadExcel = (
      <ExcelFile>
        <ExcelSheet
          data={Onus}
          element={
            <Button variant="info" style={{ color: "#fff" }}>
              Descargar Excel
            </Button>
          }
          name="Ont"
        >
          <ExcelColumn label="Nombre" value="name" />
          <ExcelColumn label="PON SN" value="LocalInfo.Nombre" />
          <ExcelColumn label="Estado" value="LocalInfo.AdminState" />
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
    RenderTabEx = <RenderExcel />;
  } else {
    RenderTabEx = <h5>-</h5>;
  }

  return (
    <div>
      <br></br>
      <Container>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Desea Continuar?</Modal.Title>
          </Modal.Header>
          <Modal.Body>{RenderTabEx}</Modal.Body>
          <Modal.Footer>
            <Button variant="error" onClick={handleClose}>
              Cancelar
            </Button>

            {isLoading ? (
              <Button
                variant="primary"
                disabled={isLoading}
                onClick={!isLoading ? handleLoadingButton : null}
              >
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                Cargando...
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={isLoading}
                onClick={!isLoading ? handleLoadingButton : null}
              >
                Continuar
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        <Card>
          <Card.Header>
            Subir Excel para Desconexion/Conexion masiva
          </Card.Header>
          <Card.Body>
            <Card.Title>Desconexion/Conexion</Card.Title>
            <Card.Text>
              Subir el archivo excel para empezar. En caso de no tenerlo
              descargarlo para moduficarlo al gusto
            </Card.Text>
            <form action="/Upload" method="post" encType="multipart/form-data">
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Default file input example</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleInputChange}
                  name="uploaded_file"
                />
              </Form.Group>
            </form>
            <Container>
              <Row>
                <Col xs={3}> {DownloadExcel}</Col>

                <Col xs={3}>
                  <Button variant="primary" onClick={() => submit()}>
                    Enviar
                  </Button>
                </Col>
              </Row>
            </Container>
          </Card.Body>
        </Card>

        <br></br>

        <Card>
          <Card.Header>Lista de Clientes </Card.Header>
          <Card.Body>
            <Card.Title>Desconexion/Conexion Manual</Card.Title>
            <Card.Text></Card.Text>

            {Onusloads ? (
              <>
                <TableInfoClients
                  SwitchMode={SwitchMode}
                  data={Onus.map(function (onu) {
                    return {
                      name: onu.LocalInfo.Nombre,
                      PON: onu.PON,
                      AdminState: onu.LocalInfo.AdminState,
                      Zone: onu.OltInfo.zone_name,
                      port: onu.OltInfo.port,
                    };
                  })}
                />
              </>
            ) : (
              <Container>
                <Row className="justify-content-md-center">
                  <Col xs lg="2"></Col>
                  <Col md="auto">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </Col>
                  <Col xs lg="2"></Col>
                </Row>
              </Container>
            )}
          </Card.Body>
        </Card>
      </Container>
      <NotificationContainer />
    </div>
  );

  const styles = StyleSheet.create({
    width: "100%",
    textAlign: "center",
    color: "white",
  });
}
