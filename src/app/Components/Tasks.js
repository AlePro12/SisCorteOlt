import React from "react";
import {
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  FormControl,
  Button,
  Container,
  Card,
  Col,
  Row,
  Table,
  Form,
} from "react-bootstrap";
import {
  DatatableWrapper,
  Filter,
  Pagination,
  PaginationOptions,
  TableBody,
  TableHeader,
} from "react-bs-datatable";
import useTasks from "../hook/getTasks";
export default function Tasks(props) {
  const { TasksData, Load } = useTasks();
  if (!Load) {
    return <div>Cargando...</div>;
  }
  if (TasksData.length === 0) {
    return <h1>No hay tareas</h1>;
  }
  return (
    <div>
      <Container>
        <Row>
          <Col>
            <Card>
              <Card.Header>Tareas Pendientes</Card.Header>
              <Card.Body>
                <DatatableWrapper
                  headers={[
                    {
                      title: "Tarea",
                      prop: "title",
                    },
                    {
                      title: "Descripcion",
                      prop: "description",
                    },
                    {
                      title: "Estado",
                      prop: "status",
                    },
                    {
                      title: "Fecha Inicio",
                      prop: "dateInit",
                    },
                    {
                      title: "Fecha Fin",
                      prop: "dateEnd",
                    },
                    {
                      title: "Completado",
                      prop: "completed",
                    },
                    {
                      title: "Total",
                      prop: "total",
                    },
                    {
                      title: "Errores",
                      prop: "error",
                    },
                    {
                      title: "Descargar Log",
                      prop: "Log",
                      cell: (row) => (
                        //button to download the log
                        <Button
                          variant="primary"
                          onClick={() => {
                            const element = document.createElement("a");
                            const file = new Blob([JSON.stringify(row.Log)], {
                              type: "text/plain",
                            });
                            element.href = URL.createObjectURL(file);
                            element.download = "LogTask.log";
                            document.body.appendChild(element); // Required for this to work in FireFox
                            element.click();
                          }}
                        >
                          Descargar
                        </Button>
                      ),
                    },
                  ]}
                  tableClass="table table-striped table-hover"
                  initialSort={{ prop: "title", isAscending: true }}
                  initialPageLength={10}
                  initialPageNumber={1}
                  body={TasksData}
                  pageLengthOptions={[5, 10, 20, 50, 100]}
                >
                  <Row className="mb-4 p-2">
                    <Col
                      xs={12}
                      lg={4}
                      className="d-flex flex-col justify-content-end align-items-end"
                    >
                      <Filter />
                    </Col>
                    <Col
                      xs={12}
                      sm={6}
                      lg={4}
                      className="d-flex flex-col justify-content-lg-center align-items-center justify-content-sm-start mb-2 mb-sm-0"
                    >
                      <PaginationOptions />
                    </Col>
                    <Col
                      xs={12}
                      sm={6}
                      lg={4}
                      className="d-flex flex-col justify-content-end align-items-end"
                    >
                      <Pagination />
                    </Col>
                  </Row>
                  <Table>
                    <TableHeader />
                    <TableBody
                      onRowClick={(row) => {
                        console.log(row);
                        //go to page /Onu/${row.PON}
                        //props.history.push(`/Onu/${row.PON}`);
                      }}
                    />
                  </Table>
                </DatatableWrapper>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
