import React from "react";

import { Col, Row, Table } from "react-bootstrap";
import {
  DatatableWrapper,
  Filter,
  Pagination,
  PaginationOptions,
  TableBody,
  TableHeader,
} from "react-bs-datatable";

// Create table headers consisting of 4 columns.
// Then, use it in a component.
export default function TableInfoClients(props) {
  const [newdat, setNewdat] = React.useState([]);
  const Datahead = [
    {
      prop: "PON",
      title: "ONU SN",
      isSortable: true,
      isFilterable: true,
    },
    //LocalInfo.nombre
    {
      prop: "name",
      title: "Cliente",
      isFilterable: true,
      isSortable: true,
    },

    {
      title: "Puerto",
      prop: "port",
      isFilterable: true,
      isSortable: true,
    },
    {
      title: "Zona",
      prop: "Zone",
      isFilterable: true,
      isSortable: true,
    },

    {
      title: "Estado",
      prop: "Estado",
      cell: (row) => <props.SwitchMode acti={row.AdminState} sn={row.PON} />,
    },
  ];

  React.useEffect(() => {
    //parse data
  }, [props.data]);

  return (
    <DatatableWrapper
      body={props.data}
      headers={Datahead}
      paginationOptionsProps={{
        initialState: {
          rowsPerPage: 100,
          options: [100, 200, 500, 1000, 2000, 4000],
        },
      }}
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
        <TableBody />
      </Table>
    </DatatableWrapper>
  );
}
