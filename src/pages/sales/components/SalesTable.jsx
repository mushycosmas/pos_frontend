import React from "react";
import { Button, Card, Dropdown, Spinner, Table } from "react-bootstrap";
import StatusBadge from "./StatusBadge";
import {
  formatCurrency,
  formatDate,
  getSaleId,
  getInvoiceNumber,
  getCustomerName,
  getBranchName,
  getSoldBy,
  getStatus,
  getPaymentStatus,
  getPaymentMethod,
  getSubtotal,
  getDiscount,
  getTotal,
  getCreatedDate,
  getItemsCount,
} from "../utils/salesHelpers";

const SalesTable = (props) => {
  const {
    loading,
    filteredSales,
    pagination,
    page,
    totalPages,
    canGoPrevious,
    canGoNext,
    setPage,
    handleView,
    openDeleteModal
  } = props;

  return (
    <Card className="dashboard-card border-0">

            <Card.Body>



              <div className="d-flex justify-content-between align-items-center mb-3">



                <div>

                  <h5 className="mb-1">

                    Sales Transactions

                  </h5>



                  <small className="text-muted">

                    {pagination.count

                      ? `${pagination.count.toLocaleString()} sale(s)`

                      : "No sales"}

                  </small>

                </div>



                {loading && (

                  <Spinner

                    animation="border"

                    size="sm"

                  />

                )}



              </div>



              <Table

                responsive

                hover

                className="align-middle"

              >



                <thead>

                  <tr>

                    <th>INVOICE</th>

                    <th>CUSTOMER</th>

                    <th>BRANCH</th>

                    <th>SOLD BY</th>

                    <th>ITEMS</th>

                    <th>SUBTOTAL</th>

                    <th>DISCOUNT</th>

                    <th>TOTAL</th>

                    <th>PAYMENT</th>

                    <th>STATUS</th>

                    <th>DATE</th>

                    <th></th>

                  </tr>

                </thead>



                <tbody>



                  {loading &&

                  filteredSales.length ===

                    0 ? (



                    <tr>

                      <td

                        colSpan="12"

                        className="text-center py-5"

                      >

                        <Spinner

                          animation="border"

                          className="mb-2"

                        />



                        <div className="text-muted">

                          Loading sales...

                        </div>

                      </td>

                    </tr>



                  ) : filteredSales.length ===

                    0 ? (



                    <tr>

                      <td

                        colSpan="12"

                        className="text-center py-5"

                      >

                        <i

                          className="bi bi-receipt"

                          style={{

                            fontSize:

                              "36px",

                          }}

                        ></i>



                        <div className="mt-2 text-muted">

                          No sales found.

                        </div>

                      </td>

                    </tr>



                  ) : (



                    filteredSales.map(

                      (sale) => {



                        const id =

                          getSaleId(sale);



                        const status =

                          getStatus(sale);



                        const paymentStatus =

                          getPaymentStatus(

                            sale

                          );



                        const subtotal =

                          getSubtotal(

                            sale

                          );



                        const discount =

                          getDiscount(

                            sale

                          );



                        const total =

                          getTotal(

                            sale

                          );



                        return (

                          <tr

                            key={

                              id ||

                              getInvoiceNumber(

                                sale

                              )

                            }

                          >



                            <td>

                              <strong>

                                {

                                  getInvoiceNumber(

                                    sale

                                  )

                                }

                              </strong>

                            </td>



                            <td>

                              {

                                getCustomerName(

                                  sale

                                )

                              }

                            </td>



                            <td>

                              {

                                getBranchName(

                                  sale

                                )

                              }

                            </td>



                            <td>

                              <span className="fw-semibold">

                                {

                                  getSoldBy(

                                    sale

                                  )

                                }

                              </span>

                            </td>



                            <td>

                              {getItemsCount(

                                sale

                              ).toLocaleString()}

                            </td>



                            {/* SUBTOTAL */}



                            <td>

                              {formatCurrency(

                                subtotal

                              )}

                            </td>



                            {/* DISCOUNT */}



                            <td>

                              <span className="text-danger fw-semibold">

                                {discount > 0

                                  ? `-${formatCurrency(

                                      discount

                                    )}`

                                  : formatCurrency(

                                      0

                                    )}

                              </span>

                            </td>



                            {/* TOTAL */}



                            <td>

                              <strong>

                                {formatCurrency(

                                  total

                                )}

                              </strong>

                            </td>



                            {/* PAYMENT */}



                            <td>

                              <div>

                                <strong>

                                  {

                                    getPaymentMethod(

                                      sale

                                    )

                                  }

                                </strong>

                              </div>



                              <small className="text-muted">

                                {

                                  paymentStatus

                                }

                              </small>

                            </td>



                            {/* STATUS */}



                            <td>

                              <StatusBadge

                                status={

                                  status

                                }

                              />

                            </td>



                            {/* DATE */}



                            <td>

                              {formatDate(

                                getCreatedDate(

                                  sale

                                )

                              )}

                            </td>



                            {/* ACTIONS */}



                            <td>

                              <Dropdown align="end">



                                <Dropdown.Toggle

                                  variant="light"

                                  size="sm"

                                  className="border-0"

                                >

                                  <i className="bi bi-three-dots-vertical"></i>

                                </Dropdown.Toggle>



                                <Dropdown.Menu>



                                  <Dropdown.Item

                                    onClick={() =>

                                      handleView(

                                        sale

                                      )

                                    }

                                  >

                                    <i className="bi bi-eye me-2"></i>

                                    View Sale

                                  </Dropdown.Item>



                                  {id && (

                                    <Dropdown.Item

                                      onClick={() =>

                                        openDeleteModal(

                                          sale

                                        )

                                      }

                                      className="text-danger"

                                    >

                                      <i className="bi bi-trash me-2"></i>

                                      Delete

                                    </Dropdown.Item>

                                  )}



                                </Dropdown.Menu>



                              </Dropdown>

                            </td>



                          </tr>

                        );

                      }

                    )



                  )}



                </tbody>



              </Table>



              {/* =================================================

                  PAGINATION

              ================================================= */}



              <div className="d-flex justify-content-between align-items-center mt-3">



                <small className="text-muted">

                  Page{" "}

                  <strong>

                    {page}

                  </strong>{" "}

                  of{" "}

                  <strong>

                    {totalPages}

                  </strong>

                </small>



                <div className="d-flex gap-2">



                  <Button

                    variant="light"

                    size="sm"

                    disabled={

                      loading ||

                      !canGoPrevious

                    }

                    onClick={() =>

                      setPage(

                        (previous) =>

                          Math.max(

                            1,

                            previous - 1

                          )

                      )

                    }

                  >

                    <i className="bi bi-chevron-left me-1"></i>

                    Previous

                  </Button>



                  <Button

                    variant="light"

                    size="sm"

                    disabled={

                      loading ||

                      !canGoNext

                    }

                    onClick={() =>

                      setPage(

                        (previous) =>

                          previous + 1

                      )

                    }

                  >

                    Next

                    <i className="bi bi-chevron-right ms-1"></i>

                  </Button>



                </div>



              </div>



            </Card.Body>

          </Card>



  );
};

export default SalesTable;
