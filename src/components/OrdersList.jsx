// src/components/ProductList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import wsClient from "../config/wsClients";
import ProductItem from "./ProductItem";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState(""); // este me muestra el mensaje en pantalla

    useEffect(() => {
        const getProducts = async () => {
            const resp = await axios.get("http://localhost:8000/api/products");
            console.log(resp);
            setProducts(resp.data.data);
        };
        getProducts();

        wsClient.listenTo("stock-updated", (updatedProduct) => {
            console.log("Inventario actualizado:", updatedProduct.message, updatedProduct.product); // se añade este console log

            if (!updatedProduct.product) {
                console.error("Error: Pedido recibido es undefined");
                return;
            }

            setMessage(` ${updatedProduct.message} - Pedido ID: ${updatedProduct.product.id}`); // guardo el mensaje

          setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product.id === updatedProduct.product.id
                        ? { ...product, stock: updatedProduct.product.stock }
                        : product
                )
            ); // se añade esta actualización para escuchar los eventos del stock

            // Limpiar el mensaje después de 3 segundos
            setTimeout(() => {
                setMessage("");
            }, 3000);
            
        });

// Escuchar advertencia de stock agotado
wsClient.listenTo("stock-warning", (warning) => {
    alert(warning.message);
});

// Manejar errores y se añade el código desde aquí
wsClient.listenTo("error", (error) => {
    setMessage(` ${error.message}`);
    setTimeout(() => setMessage(""), 3000);
});

return () => {
    wsClient.off("stock-updated");
    wsClient.off("stock-warning");
    wsClient.off("error");
};
}, []);

const handleUpdateStock = (productId) => {
console.log(" Reduciendo stock del producto:", productId);
wsClient.dispatchEvent("update-stock", { productId });
};

return (
<div>
    <h2>Lista de Pedidos</h2>

    {/* Muestra mensaje en la pantalla */}
    {message && (
        <div style={{
            background: "#fffae6",
            padding: "10px",
            border: "1px solid #ffcc00",
            color: "#333",
            marginBottom: "10px"
        }}>
            {message}
        </div>
    )}

    {products?.map((product) => (
        <ProductItem
            key={product.id}
            product={product}
            onUpdateStock={handleUpdateStock}
        />
    ))}
</div>
);
};


export default ProductList;
