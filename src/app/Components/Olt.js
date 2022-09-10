import React from "react";
import axios from "axios";
import ReactExport from "react-data-export";
import swal from "sweetalert";
import BootstrapTable from "react-bootstrap-table-next";
import usePlan from "../hook/getPlanes";
import usePort from "../hook/getPorts";
import useBoards from "../hook/getBoards";

import SelectPlan from "./SelectPlan";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { toast } from "react-toastify";
import Loading from "./Loading";
//import link
import { Link } from "react-router-dom";
import useOlt from "../hook/getOlts";

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

import TableInfoClients from "./TableInfoClients";
import useMgr from "../hook/useMgr";
import AlphaApi_Fetch from "../api/httpservice";
//http://localhost:3000/Lista
export default function Olt(props) {
  //#062346

  const { history } = props;
  const { Oltid } = props;
  const [Onus, setOnus] = React.useState([]);
  //filter
  const [filter, setFilter] = React.useState("");
  const [OnusEx, setOnusEx] = React.useState([]);

  const [ResExc, setResExc] = React.useState({
    ListaDeCorte: [],
    ListaDeActivacion: [],
  });
  const [Cambiodeplanes, setCambPlanes] = React.useState([]);
  const [moveList, setMoveList] = React.useState([]);
  const [ReSyncList, setReSyncList] = React.useState([]);

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
  const [CambPlans, setCambPlans] = React.useState(false);
  const [move, setMove] = React.useState(false);
  const [ReSync, setReSync] = React.useState(false);

  const [PortSelect, setPortSelect] = React.useState("");
  const [BoardsSelect, setBoardsSelect] = React.useState("");

  const [PortDestino, setPortDestino] = React.useState("");
  const [BoardDestino, setBoardDestino] = React.useState("");
  const [OltSelect, setOltSelect] = React.useState("");

  const handlePlanButton = () => {
    setLoading(true);
    SendListPlanes();
  };
  const handleMoveButton = () => {
    setLoading(true);
    SendListMove();
  };
  const handleReSyncButton = () => {
    setLoading(true);
    SendListReSync();
  };
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
  const SetPlanSelect = (onu, plan) => {
    //ChangePlan/:Plan/:PON/:OLT
    toast.promise(
      AlphaApi_Fetch(
        `/api/onu/ChangePlan/${plan}/${onu}/${Oltid}`,
        "GET",
        {},
        true
      ),
      {
        error: "No se pudo cambiar el plan",
        pending: "Cambiando plan",
        success:
          "Plan cambiado de la ONU: " +
          onu +
          " al plan " +
          plan +
          " correctamente",
      }
    );
  };
  //Cambiodeplanes
  const SendListPlanes = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Lista: Cambiodeplanes }),
    };
    fetch("/api/Olt/SendMassPlans/" + Oltid, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.status == true) {
          // alert("Proceso completado con exito \n"+JSON.stringify(data));
          setShow(false);
          handleClose();
          setLoading(false);
          //downloadLogFile(data.Log)

          toast.success("Tarea enviada con exito");

          //handleClose(true);
        }
      })
      .catch((error) => console.log(error));
  };

  const SendListMove = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Lista: moveList }),
    };
    fetch("/api/Olt/SendMassMove/" + Oltid, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.status == true) {
          // alert("Proceso completado con exito \n"+JSON.stringify(data));
          setShow(false);
          handleClose();
          setLoading(false);
          //downloadLogFile(data.Log)
          toast.success("Tarea enviada con exito");
          //handleClose(true);
        }
      })
      .catch((error) => console.log(error));
  };
  const SendListReSync = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Lista: ReSyncList }),
    };
    fetch("/api/Olt/SendMassReSync/" + Oltid, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.status == true) {
          // alert("Proceso completado con exito \n"+JSON.stringify(data));
          setShow(false);
          handleClose();
          setLoading(false);
          //downloadLogFile(data.Log)
          toast.success("Tarea enviada con exito");
          //handleClose(true);
        }
      })
      .catch((error) => console.log(error));
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
                text: "Descargar Log resumido",
                value: "Log",
              },
              confirm: {
                text: "Descargar Log Completo",
                value: "LogCompleto",
              },
            },
          }).then((value) => {
            switch (value) {
              case "Log":
                downloadLogFile(data.Log);
                // swal("PRITNTLOG");
                break;
              case "LogCompleto":
                downloadLogFile(data.LogAll);
                // swal("PRITNTLOG");
                break;
            }
          });

          //handleClose(true);
        }
      })
      .catch((error) => console.log(error));
  };
  const submitPlans = async () => {
    console.log("Subiendo...");
    const formdata = new FormData();
    formdata.append("uploaded_file", Excel.file);

    axios
      .post("/api/Olt/UploadPlans/" + Oltid, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        // then print response status
        console.warn(res);
        setCambPlans(true);
        setCambPlanes(res.data);
        handleShow("Planes");
        if (res.data.success === 1) {
        }
      });
  };
  const submitResync = async () => {
    console.log("Subiendo...");
    const formdata = new FormData();
    formdata.append("uploaded_file", Excel.file);

    axios
      .post("/api/Olt/UploadReSync/" + Oltid, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        // then print response status
        console.warn(res);
        setReSync(true);
        setReSyncList(res.data);
        handleShow("Move");
        if (res.data.success === 1) {
        }
      });
  };
  const submitMove = async () => {
    console.log("Subiendo...");
    const formdata = new FormData();
    formdata.append("uploaded_file", Excel.file);

    axios
      .post("/api/Olt/UploadMove/" + Oltid, formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        // then print response status
        console.warn(res);
        setMove(true);
        setMoveList(res.data);
        handleShow("Move");
        if (res.data.success === 1) {
        }
      });
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

  const RenderExcelReSync = () => {
    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>PON SN</th>
            <th>Port</th>
            <th>Board</th>
          </tr>
        </thead>
        <tbody>
          {ReSyncList.map((listValue2, index) => {
            return (
              <tr key={index}>
                <td>{index}</td>
                <td>{listValue2.onuId}</td>
                <td>{listValue2.portId}</td>
                <td>{listValue2.boardId}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };
  const RenderExcelMove = () => {
    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>PON SN</th>
            <th>Olt destino</th>
            <th>Port</th>
            <th>Board</th>
          </tr>
        </thead>
        <tbody>
          {moveList.map((listValue2, index) => {
            return (
              <tr key={index}>
                <td>{index}</td>
                <td>{listValue2.onuId}</td>
                <td>{listValue2.oltId}</td>
                <td>{listValue2.portId}</td>
                <td>{listValue2.boardId}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };
  const RenderExcelPlans = () => {
    return (
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>#</th>
            <th>PON SN</th>
            <th>Plan</th>
          </tr>
        </thead>
        <tbody>
          {Cambiodeplanes.map((listValue2, index) => {
            return (
              <tr key={index}>
                <td>{index}</td>
                <td>{listValue2.PON}</td>
                <td>{listValue2.Plan}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
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

            toast.success("Se recibio la lista del Servidor", {
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        })
        .catch((error) =>
          toast.error("Fatal error al ejecutar", {
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        );
    }
  };
  const setActiveClient = (e, sn, acti, setstate) => {
    console.log(e);
    console.log(e.target.checked);
    console.log(setstate);

    var action = "Activar";

    acti = e.target.checked;
    var urld = "api/Olt/" + Oltid;
    console.log(acti);
    if (acti == true) {
      urld = "/api/Olt/EnableOnu/" + sn + "/" + Oltid;
    } else {
      action = "Desactivar";
      console.log("disable");
      urld = "/api/Olt/DisableOnu/" + sn + "/" + Oltid;
    }
    toast
      .promise(AlphaApi_Fetch(urld, "GET", {}, false), {
        error: "Error al " + action,
        success: "Se ejecuto correctamente Accion: " + action,
        pending: "Ejecutando...",
      })
      .then((res) => {
        //modificar el estado de la lista
        /*setOnus(
          Onus.map((onu) => {
            if (onu.PON == sn) {
              onu.LocalInfo.AdminState = acti;
            }
            return onu;
          })
        );*/
      });
  };
  const SwitchMode = ({ acti, sn }) => {
    console.log(sn + ": " + acti);
    //is acti bool

    if (acti) {
      if (ExistAcciones("Desactivar")) {
        console.log("Checked");
        return (
          <>
            <label
              className="switch"
              style={{
                fontSize: 2,
                color: "green",
              }}
            >
              on
            </label>
            <Form>
              <Form.Check
                type="switch"
                id="custom-switch"
                label=""
                onChange={(e) => setActiveClient(e, sn, acti)}
                checked
              />
            </Form>
          </>
        );
      } else {
        return <label>Activado</label>;
      }
    } else {
      if (ExistAcciones("Activar")) {
        return (
          <>
            <label
              className="switch"
              style={{
                fontSize: "5",
                color: "red",
              }}
            >
              off
            </label>
            <Form>
              <Form.Check
                type="switch"
                id="custom-switch"
                label=""
                onChange={(e, test) => setActiveClient(e, sn, acti, test)}
              />
            </Form>
          </>
        );
      } else {
        return <label>Desactivado</label>;
      }
    }
  };
  //Onusloads
  var DownloadExcel;
  if (Onusloads) {
    DownloadExcel = (
      <ExcelFile
        element={
          <Button variant="info" style={{ color: "#fff" }}>
            Descargar Excel
          </Button>
        }
      >
        <ExcelSheet data={Onus} name="Ont">
          <ExcelColumn label="Nombre" value="LocalInfo.Nombre" />
          <ExcelColumn label="PON SN" value="PON" />
          <ExcelColumn label="Estado" value="LocalInfo.AdminState" />
        </ExcelSheet>
      </ExcelFile>
    );
  } else {
    DownloadExcel = <br></br>;
  }
  const { User, ExistOltid, ExistAcciones } = useMgr();
  const { PlansData, Load } = usePlan(Oltid);
  const { PortsData, LoadPort } = usePort(Oltid);
  const { BoardsData, Load: LoadBoards } = useBoards(Oltid);
  const { OltsData, Load: LoadOlt } = useOlt(Oltid);

  React.useEffect(() => {
    if (LoadPort) {
      setPortSelect(PortsData[0]);
    }
  }, [PortsData]);
  React.useEffect(() => {
    if (LoadBoards) {
      setBoardsSelect(PortsData[0]);
    }
  }, [BoardsData]);
  if (!LoadBoards) {
    return <Loading title="Tarjetas" />;
  }
  if (!LoadOlt) {
    return <Loading title="Olts" />;
  }
  if (!User.olts.includes(Oltid)) {
    return <h1> No Tiene acceso a esta OLT</h1>;
  }
  if (!Load) {
    return <Loading title="Planes" />;
  }
  if (!LoadPort) {
    return <Loading title="Puertos" />;
  }
  return (
    <div>
      <br></br>
      <Container>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              Desea Continuar? con {CambPlans == true ? "Cambio de plan" : ""}
              {isSucces == true ? "Corte/Activacion" : ""}
              {move == true ? "Mover olts" : ""}
              {ReSync == true ? "Resync Onus" : ""}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <>
              {CambPlans == true ? <RenderExcelPlans /> : ""}
              {isSucces == true ? <RenderExcel /> : ""}
              {move == true ? <RenderExcelMove /> : ""}
              {ReSync == true ? <RenderExcelReSync /> : ""}
            </>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="error" onClick={handleClose}>
              Cancelar
            </Button>

            {isLoading ? (
              <Button
                variant="primary"
                disabled={isLoading}
                onClick={() => {
                  switch (true) {
                    case CambPlans == true:
                      handlePlanButton();
                      break;
                    case isSucces == true:
                      handleLoadingButton();
                      break;
                    case move == true:
                      handleMoveButton();
                      break;
                    case ReSync == true:
                      handleReSyncButton();
                      break;
                    default:
                      break;
                  }
                }}
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
                onClick={() => {
                  switch (true) {
                    case CambPlans == true:
                      handlePlanButton();
                      break;
                    case isSucces == true:
                      handleLoadingButton();
                      break;
                    case move == true:
                      handleMoveButton();
                      break;
                    case ReSync == true:
                      handleReSyncButton();
                      break;
                    default:
                      break;
                  }
                }}
              >
                Continuar
              </Button>
            )}
          </Modal.Footer>
        </Modal>
        <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
          <Tab eventKey="Corte" title="Desconexion/Conexion masiva">
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
                <form
                  action="/Upload"
                  method="post"
                  encType="multipart/form-data"
                >
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
                      <Button
                        variant="primary"
                        disabled={!ExistAcciones("Excel")}
                        onClick={() => submit()}
                      >
                        Enviar
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="profile" title="Cambio de plan">
            <Card>
              <Card.Header>
                Subir Excel para Cambiar de planes masiva
              </Card.Header>
              <Card.Body>
                <Card.Title>Cambiar Plan</Card.Title>
                <Card.Text>
                  Subir el archivo excel para empezar. En caso de no tenerlo
                  descargarlo para modificarlo al gusto
                </Card.Text>
                <form
                  action="/Upload"
                  method="post"
                  encType="multipart/form-data"
                >
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
                      <Button
                        variant="primary"
                        disabled={!ExistAcciones("Excel")}
                        onClick={() => submitPlans()}
                      >
                        Enviar
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="rsync" title="ReSyncAll">
            <Card>
              <Card.Header>
                Resincronizar todos las onus de un puerto
              </Card.Header>
              <Card.Body>
                <Card.Title>Resync port</Card.Title>
                <Card.Text>
                  Resincroniza todas las ONUS de un puerto de esta Olt
                </Card.Text>
                <form>
                  <Form.Group controlId="formSelect">
                    <Form.Label>Puerto</Form.Label>
                    <Form.Control
                      as="select"
                      value={PortSelect}
                      onChange={(e) => {
                        setPortSelect(e.target.value);
                      }}
                      onLoad={(e) => {
                        setPortSelect(e.target.value);
                      }}
                    >
                      {PortsData.map((port, index) => (
                        <option key={index} value={port}>
                          Puerto {port}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Control
                      as="select"
                      value={BoardsSelect}
                      onChange={(e) => {
                        setBoardsSelect(e.target.value);
                      }}
                      onLoad={(e) => {
                        setBoardsSelect(e.target.value);
                      }}
                    >
                      {BoardsData.map((port, index) => (
                        <option key={index} value={port}>
                          Board {port}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Button
                    variant="primary"
                    disabled={!ExistAcciones("ResyncAll")}
                    onClick={() => {
                      if (PortSelect != "") {
                        ///ResyncAll/:Port/:OLT
                        console.log("ResyncAll");
                        AlphaApi_Fetch(
                          `/api/onu/ResyncAll/${PortSelect}/${BoardsSelect}/${Oltid}`,
                          "GET",
                          null,
                          false
                        ).then((res) => {
                          alert(res.data.message);
                        });
                      } else {
                        alert("Seleccione un puerto");
                      }
                    }}
                  >
                    Enviar
                  </Button>
                </form>
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="ReSyncList" title="ReSync Lista">
            <Card>
              <Card.Header>Subir Excel para Resync masivo</Card.Header>
              <Card.Body>
                <Card.Title>ReSync Onu</Card.Title>
                <Card.Text>
                  Subir el archivo excel para empezar. En caso de no tenerlo
                  descargarlo para modificarlo al gusto
                </Card.Text>
                <form
                  action="/Upload"
                  method="post"
                  encType="multipart/form-data"
                >
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Archivo</Form.Label>
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
                      <Button
                        variant="primary"
                        disabled={!ExistAcciones("Excel")}
                        onClick={() => submitResync()}
                      >
                        Enviar
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="move" title="Mover Onu a Otra Olt">
            <Card>
              <Card.Header>
                Subir Excel para Cambiar de planes masiva
              </Card.Header>
              <Card.Body>
                <Card.Title>Mover Onu</Card.Title>
                <Card.Text>
                  Subir el archivo excel para empezar. En caso de no tenerlo
                  descargarlo para modificarlo al gusto
                </Card.Text>
                <form
                  action="/Upload"
                  method="post"
                  encType="multipart/form-data"
                >
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Archivo</Form.Label>
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
                      <Button
                        variant="primary"
                        disabled={!ExistAcciones("Excel")}
                        onClick={() => submitMove()}
                      >
                        Enviar
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        <br />

        <Card>
          <Card.Header>Lista de Clientes </Card.Header>
          <Card.Body>
            <Card.Title>Desconexion/Conexion Manual</Card.Title>
            <Card.Text></Card.Text>

            {Onusloads ? (
              <>
                <TableInfoClients
                  SwitchMode={SwitchMode}
                  history={history}
                  data={Onus.map(function (onu, index) {
                    //si es undefined onu.OltInfo.service_ports[0].upload_speed y onu.OltInfo.service_ports[0].download_speed
                    try {
                      if (onu.OltInfo.service_ports[0] == undefined) {
                        onu.OltInfo.service_ports[0] = {
                          upload_speed: null,
                          download_speed: null,
                        };
                      } else {
                        //si no tiene servicio
                        if (
                          onu.OltInfo.service_ports[0].upload_speed == undefined
                        ) {
                          onu.OltInfo.service_ports[0].upload_speed = null;
                        }
                        if (
                          onu.OltInfo.service_ports[0].download_speed ==
                          undefined
                        ) {
                          onu.OltInfo.service_ports[0].download_speed = null;
                        }
                      }
                    } catch (e) {
                      console.log(e);
                      //add onu.OltInfo.service_ports[0]
                      try {
                        if (onu.OltInfo.service_ports == undefined) {
                          onu.OltInfo.service_ports = [];
                        }
                        onu.OltInfo.service_ports[0] = {
                          upload_speed: null,
                          download_speed: null,
                        };
                      } catch (e) {
                        console.log(e);
                      }
                    }

                    return {
                      name: (
                        <Link to={`/Onu/${onu.PON}`}>
                          {onu.LocalInfo.Nombre}
                        </Link>
                      ),
                      PON: onu.PON,
                      Address: onu.OltInfo.address,
                      AdminState: onu.LocalInfo.AdminState,
                      Zone: onu.OltInfo.zone_name,
                      port: onu.OltInfo.port,
                      Rs: (
                        <img
                          src={
                            "https://img.icons8.com/color/48/000000/synchronize.png"
                          }
                          alt="sync"
                          width={"27px"}
                          onClick={() => {
                            if (ExistAcciones("Resync")) {
                              const response = toast.promise(
                                axios.get(
                                  `/api/onu/Resync/${onu.PON}/${Oltid}`
                                ),
                                {
                                  pending: "Resincronizando... Onu:" + onu.PON,
                                  success:
                                    "Resincronizacion exitosa Onu:" + onu.PON,
                                  error:
                                    "Error al resincronizar Onu: " + onu.PON,
                                }
                              );
                            } else {
                              toast.error(
                                "No tienes permisos para esta accion"
                              );
                            }
                          }}
                        />
                      ),
                      Plan:
                        //if  onu.OltInfo.service_ports[0].download_speed === null
                        !onu.OltInfo.service_ports[0].download_speed ||
                        !onu.OltInfo.service_ports[0].upload_speed ? (
                          <></>
                        ) : (
                          <SelectPlan
                            key={index}
                            setPlanSelect={SetPlanSelect}
                            ExistAcciones={ExistAcciones}
                            PON={onu.PON}
                            planUpSelect={
                              onu.OltInfo.service_ports[0].upload_speed
                            }
                            planDownSelect={
                              onu.OltInfo.service_ports[0].download_speed
                            }
                            planes={PlansData}
                          />
                        ),
                      Estado: (
                        <SwitchMode
                          key={index}
                          acti={onu.LocalInfo.AdminState}
                          sn={onu.PON}
                        />
                      ),
                      name2: onu.LocalInfo.Nombre,
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
    </div>
  );

  const styles = StyleSheet.create({
    width: "100%",
    textAlign: "center",
    color: "white",
  });
}
//BTPTDD2CF1A9
//HWTC29D59985
