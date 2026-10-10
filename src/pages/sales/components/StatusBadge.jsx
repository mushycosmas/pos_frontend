import React from "react";
import { Badge } from "react-bootstrap";

const StatusBadge = ({ status }) => {

  const normalized = String(

    status || ""

  ).toUpperCase();

  let variant = "secondary";

  if (

    normalized === "COMPLETED" ||

    normalized === "PAID" ||

    normalized === "SUCCESS"

  ) {

    variant = "success";

  } else if (

    normalized === "PENDING" ||

    normalized === "PARTIAL"

  ) {

    variant = "warning";

  } else if (

    normalized === "CANCELLED" ||

    normalized === "CANCELED" ||

    normalized === "FAILED" ||

    normalized === "UNPAID"

  ) {

    variant = "danger";

  } else if (

    normalized === "REFUNDED"

  ) {

    variant = "info";

  }

  return (

    <Badge bg={variant}>

      {String(status || "-")

        .replaceAll("_", " ")}

    </Badge>

  );

};



export default StatusBadge;
