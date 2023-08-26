import React, { useState, useEffect } from "react";
import "./body.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Body() {
    const [products, setProducts] = useState([]);
    const [reloadData, setReloadData] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editedProduct, setEditedProduct] = useState({
        id: "",
        name: "",
        description: "",
        currentStockLevel: "",
        reorderPoint: "",
    });
    // To fetch All prodicts from DB and populate the table list.
    useEffect(() => {
      async function fetchData() {
        try {
          const response = await fetch("http://localhost:8081/product/GetAllProduct");
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setProducts(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      fetchData();
      if (reloadData) {
        fetchData();
        showStockLowNotification();
        setReloadData(false); // Reset the flag to prevent continuous reloading
      }
    }, [reloadData]);

    // Open the Add pop up screen for the user to add new products.
    const openAddModal = () => {
        setEditedProduct({
            id: "",
            name: "",
            description: "",
            currentStockLevel: "",
            reorderPoint: "",
          });
        setIsEditModalOpen(true);
      };
      // Notification for Products that have stock quantity lower than the minimum amount
      const showStockLowNotification = () => {
        const notificationMessages = [];
        // Filters out all products that have current stock lower than reorder point
        const lowStockProducts = products.filter(product => product.currentStockLevel <= product.reorderPoint);
        lowStockProducts.forEach(product => {
            const amendedName = `Amended Name - ${product.name}`;
            const amendedId = `Amended ID - ${product.id}`;
            notificationMessages.push(`${amendedName}, ${amendedId}`);
          });
          
          const notificationMessage = notificationMessages.join('\n');
          console.log("notificationMessage");
          console.log(notificationMessage);
          // Send a notification    
          toast.success("WARNING! Your stock is below reorder point for this items "+notificationMessage);
      };
    // Open the edit pop up screen for the user to add new products.
    const openEditModal = (product) => {
        setEditedProduct(product);
        setIsEditModalOpen(true);
      };
      // Closes the edit pop up screen.
      const closeEditModal = () => {
        setIsEditModalOpen(false);
        handleReloadData();
        
      };
      // Opens the pop up for the user to delete products. Warnign screen.
      const openDeleteModal = (product) => {
        setEditedProduct(product);
        setIsDeleteModalOpen(true);
      };
    // Closes the pop up for the user to delete products.
      const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        handleReloadData();
        
      };
      // Reload data after products have been edited, saved or deleted to fetch updated data from the DB.
      const handleReloadData = () => {
        setReloadData(true); // Set this flag to true to trigger a reload
      };
    
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct({ ...editedProduct, [name]: value });
      };
    // Save new and update product details
      const saveChanges = async () => {
        try {
          // Create a request body with the updated product data
          const requestBody = {
            id: editedProduct.id,
            name: editedProduct.name,
            description: editedProduct.description,
            currentStockLevel: editedProduct.currentStockLevel,
            reorderPoint: editedProduct.reorderPoint,
          };
          let response;
          if(editedProduct.id){
                // Make the API call to update the product
          response = await fetch("http://localhost:8081/product/UpdateProduct", {
            method: "PUT", 
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody), 
          });
          }else{
                // Make the API call to update the product
            response = await fetch("http://localhost:8081/product/createProduct", {
                method: "POST", 
                headers: {
                "Content-Type": "application/json", 
                },
                body: JSON.stringify(requestBody), 
            });
          }
            
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
      
          // Close the modal
          closeEditModal();
        } catch (error) {
          console.error("Error updating product:", error);
        }
      };
    // Calls the delete API endpoint
      const deleteChanges = async () => {
        try {
          const requestBody = {
            id: editedProduct.id,
            name: editedProduct.name,
            description: editedProduct.description,
            currentStockLevel: editedProduct.currentStockLevel,
            reorderPoint: editedProduct.reorderPoint,
          };
      
          const response = await fetch("http://localhost:8081/product/deleteProduct", {
            method: "DELETE", 
            headers: {
              "Content-Type": "application/json", 
            },
            body: JSON.stringify(requestBody), 
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          // Close the modal
          closeDeleteModal();
        } catch (error) {
          console.error("Error updating product:", error);
          
        }
      };

      
      
  
  return (
    <div className="App">
      <h1 className="titleSection"><div className="titleSectionTXT">IMS | Inventory Management System</div></h1>
      

        <div class="container">
            <div class="row">
                <div class="col-12 mb-3 mb-lg-5">
                    <div class="overflow-hidden card table-nowrap table-card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Product Inventory List</h5>
                            <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-toggle="modal"
                                        data-target="#deleteModel"
                                        onClick={() => openAddModal()}
                                    >
                                        Add
                                    </button>
                        </div>
                        <div class="table table-striped">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                <th scope="col">Product Name</th>
                                <th scope="col">Description</th>
                                <th scope="col">Current Stock</th>
                                <th scope="col">Reorder Limit</th>
                                <th scope="col">Total sale</th>
                                <th scope="col" class="text-end">Action</th>
                                
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>{product.currentStockLevel}</td>
                                    <td>
                                    <div>
                                        {product.reorderPoint} <br/>
                                        {product.currentStockLevel < product.reorderPoint && (
                                        <span className="text-danger">(Cur.Stock lower than Reorder Limit!)</span>
                                        )}
                                    </div>
                                    </td>
                                    <td>{product.totalUnitsSold}</td>
                                    <td className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-toggle="modal"
                                        data-target="#editModal"
                                        onClick={() => openEditModal(product)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        data-toggle="modal"
                                        data-target="#deleteModel"
                                        onClick={() => openDeleteModal(product)}
                                    >
                                        Delete
                                    </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                            <div
                                className={`modal fade ${isEditModalOpen ? "show" : ""}`}
                                id="editModal"
                                tabIndex="-1"
                                role="dialog"
                                aria-labelledby="editModalLabel"
                                style={isEditModalOpen ? { display: "block" } : { display: "none" }}
                                >
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="editModalLabel">
                                        Edit Inventory
                                        </h5>
                                        <button
                                        type="button"
                                        className="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        onClick={closeEditModal}
                                        >
                                        <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <form>
                                        <div className="form-group">
                                            <label htmlFor="name">Product Name</label>
                                            <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            name="name"
                                            placeholder="Product Name"
                                            value={editedProduct.name}
                                            onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="description">Description</label>
                                            <input
                                            type="text"
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            placeholder="Description"
                                            value={editedProduct.description}
                                            onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="currentStockLevel">Current Stock Level</label>
                                            <input
                                            type="text"
                                            className="form-control"
                                            id="currentStockLevel"
                                            name="currentStockLevel"
                                            placeholder="Current Stock Level"
                                            value={editedProduct.currentStockLevel}
                                            onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="reorderPoint">Reorder Point</label>
                                            <input
                                            type="text"
                                            className="form-control"
                                            id="reorderPoint"
                                            name="reorderPoint"
                                            placeholder="Reorder Point"
                                            value={editedProduct.reorderPoint}
                                            onChange={handleInputChange}
                                            />
                                        </div>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-dismiss="modal"
                                        onClick={closeEditModal}
                                        >
                                        Close
                                        </button>
                                        <button type="button" className="btn btn-primary" onClick={saveChanges}>
                                        Save Changes
                                        </button>
                                    </div>
                                    </div>
                                </div>
                                </div>




                            <div
                            className={`modal fade ${isDeleteModalOpen ? "show" : ""}`}
                            id="deleteModel"
                            tabIndex="-1"
                            role="dialog"
                            aria-labelledby="editModalLabel"
                            style={isDeleteModalOpen ? { display: "block" } : { display: "none" }}
                            >
                            <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                            <h5 className="modal-title" id="editModalLabel">
                                Delete Product
                            </h5>
                            
                            
                        </div>
                            <div className="modal-body">
                            <p>Are you sure you want to delete the product?</p>
                            </div>
                            <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-dismiss="modal"
                                onClick={closeDeleteModal}
                            >
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={deleteChanges}>
                                Delete
                            </button>
                            </div>
                        </div>
                        </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      
    </div>
  );
}

export default Body;
