var productImage; // Declarar la variable productImage aquí para que esté disponible globalmente

function showProductDetails(productId) {
    console.log("Mostrando detalles del producto:", productId);
    var productDetailsContainer = document.getElementById("product-details-container");
    productDetailsContainer.classList.remove("hidden");
    productDetailsContainer.style.display = "block"; // Cambia el estilo display a block para mostrar el contenedor
    productDetailsContainer.scrollIntoView({ behavior: "smooth" }); // Enfocar el contenedor con desplazamiento suave
    
    
    
    var productName = document.getElementById("product-name");
    productImage = document.getElementById("product-image"); // Asignar el valor de productImage aquí
    var sizeSelect = document.getElementById("size");
    
    if (productId === 'COCACOLA' ) {
      productName.textContent = "Acompaña tu deliciosa comida con los siguientes productos de Cocacola";
      productImage.src = "../assestment/cocacola.jfif";
      // Configurar opciones de tamaño específicas para la lechona
      sizeSelect.innerHTML = `
      <option value="COCACOLA 350ml"  data-price="3500">Cocacola 350ml</option>
      <option value="COCACOLA 600ml" data-price="4500">Cocacola 600ml</option>
      <option value="SPRITE 350ml" data-price="3000">Sprite 350ml</option>
      <option value="QUATRO 350ml" data-price="3000">Quatro 350ml</option>
      `;
    } else if (productId === 'POSTOBON') {
      productName.textContent = "Acompaña tu deliciosa comida con los siguientes productos de Pepsi";
      productImage.src = "../assestment/postobon.png";
      sizeSelect.innerHTML = `
      <option value="COLOMBIANA 350ml" data-price="3000">Colombiana 350ml</option>
      <option value="PEPSI 350ml" data-price="3000">Pepsi 350ml</option>
      <option value="UVA 350ml" data-price="3000">Uva 350ml</option>
      <option value="Naranja 350ml" data-price="3000">Naranja 350ml</option>
      `;
    } else if (productId === 'JUGOS') {
      productName.textContent = "Acompaña tu deliciosa comida con los siguientes Jugos Naturales";
      productImage.src = "../assestment/jugo.jpg";
      sizeSelect.innerHTML = `
      <option value="JUGO NATURAL DE MORA 12 Onz" data-price="7500">Jugo de Mora 12 Onz</option>
      <option value="JUGO NATURAL DE MARACUYA 12 Onz" data-price="7500">Jugo de Maracuya 12 Onz</option>
      <option value="JUGO NATURAL DE LULO 12 Onz" data-price="7500">Jugo de Lulo 12 Onz</option>
      `;
    } else if (productId === 'AGUAS') {
      productName.textContent = "BEBIDAS DE AGUA CON GAS Y SIN GAS";
      productImage.src = "../assestment/agua.jpg";
      sizeSelect.innerHTML = `
      <option value="AGUA CON GAS" data-price="2500">Agua con gas</option>
      <option value="AGUA SIN GAS" data-price="2000">Agua sin gas</option>
      `;
    
    } else {
      // Restablecer opciones de tamaño genéricas para otros productos
      sizeSelect.innerHTML = `
      <option value="cojin 15 platos"  data-price="170000">cojín 15 platos</option>
      <option value="cojin 25 platos" data-price="280000">cojín 25 platos</option>
      <option value="cojin 30 platos" data-price="330000">Cojín 30 platos</option>
      <option value="cojin 45 platos" data-price="370000">cojín 45 platos</option>
      <option value="cojin 50 platos" data-price="410000">cojín 50 platos</option>
      <option value="cojin 60 platos" data-price="450000">Cojín 60 platos</option>
      <option value="cojin 80 platos" data-price="520000">cojín 80 platos</option>
      <option value="cojin 100 platos" data-price="720000">cojín 100 platos</option>
      `;
    }
  }

  function cancelProduct() {
    console.log("Pedido cancelado");
  
    // Ocultar los detalles del producto
    var productDetailsContainer = document.getElementById("product-details-container");
    productDetailsContainer.classList.add("hidden");
  
    // Restablecer el formulario de detalles del producto
    var productName = document.getElementById("product-name");
    productName.textContent = "";
    productImage.src = "";
    var sizeSelect = document.getElementById("size");
    sizeSelect.innerHTML = "";
  
    // Enfocar el inicio de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Función para obtener todos los pedidos almacenados del localStorage
function obtenerPedidos() {
    // Obtener todos los pedidos almacenados (si existen)
    var pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    return pedidos;
}

function removeItem(button) {
    console.log("Producto eliminado");
    
    // Obtener la fila que contiene el botón
    var row = button.parentNode.parentNode;
    
    // Eliminar la fila de la tabla
    row.parentNode.removeChild(row);
  
    // Actualizar el precio total
    updateTotalPrice();
}

function acceptProduct() {
    console.log("Producto aceptado");
  
    // Obtener los detalles del producto
    var productName = document.getElementById("product-name").textContent;
    var selectedOption = document.querySelector("#size option:checked").textContent;
    var productPrice = document.querySelector("#size option:checked").dataset.price;
   
    // Crear una nueva fila en la tabla
    var summaryTableBody = document.getElementById("summary-table-body");
    var newRow = summaryTableBody.insertRow();
    newRow.innerHTML = `
        <td><button onclick="removeItem(this)">Eliminar</button></td>
    `;
    
    // Insertar celdas con los detalles del producto en la nueva fila
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
  
    cell1.innerHTML = `<img src="${productImage.src}" alt="${productName}" style="max-width: 50px;"> ${productName}`;
    cell2.textContent = selectedOption;
    cell3.textContent = "$" + parseFloat(productPrice).toFixed(2);
  
    // Botones de añadir y cancelar
    var addButton = document.createElement("button");
    addButton.textContent = "Seleccionar";
    addButton.onclick = function() {
      saveToDatabase({
          name: productName,
          option: selectedOption,
          price: parseFloat(productPrice)
      });
    };
    cell4.appendChild(addButton);

    var productDetails = {
        name: productName,
        option: selectedOption,
        price: parseFloat(productPrice) // Convertir el precio a un número flotante
    };

  
    // Mostrar la tabla de resumen o carrito de compras (si estaba oculta)
    var summaryTable = document.getElementById("summary-table");
    summaryTable.classList.remove("hidden");
    summaryTable.scrollIntoView({ behavior: "smooth" }); // Enfocar la tabla con desplazamiento suave

    // Opcional: Actualizar el precio total del pedido
    updateTotalPrice();
}
function saveToDatabase(productDetails) {
  fetch('http://localhost:3001/saveProduct', { // Cambia la URL al endpoint de tu servidor
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(productDetails)
  })
  .then(response => response.json())
  .then(data => {
      console.log('Producto guardado en la base de datos:', data);
      // Redirigir a la factura si es necesario
      window.location.href = "../infraest/facturados.html";
  })
  .catch(error => {
      console.error('Error al guardar el producto:', error);
  });
}

function redirectToAdd() {
    window.location.href = "../infraest/facturados.html";
}

function updateTotalPrice() {
    // Calcular el precio total de todos los productos en la tabla
    var totalPrice = 0;
    var rows = document.querySelectorAll("#summary-table-body tr");
    rows.forEach(row => {
        var priceCell = row.cells[2].textContent;
        var price = parseFloat(priceCell.replace('$', '').replace(',', ''));
        totalPrice += price;
    });

    // Actualizar el precio total en la página de la factura
    var totalPriceInvoiceElement = document.getElementById("total-price-invoice");
    totalPriceInvoiceElement.textContent = "$" + totalPrice.toFixed(2).toLocaleString();
}

window.onload = function() {
    // Función para guardar un nuevo pedido en el localStorage
    function guardarPedido(nuevoPedido) {
        // Obtener todos los pedidos almacenados (si existen)
        var pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        
        // Agregar el nuevo pedido al array de pedidos
        pedidos.push(nuevoPedido);
        
        // Guardar el array de pedidos actualizado en el localStorage
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
    }

    // Obtener los detalles del último pedido almacenados en localStorage
    var productDetails = JSON.parse(localStorage.getItem('lastProductDetails'));

    // Verificar si hay detalles de pedido almacenados
    if (productDetails) {
        // Mostrar los detalles del pedido en la página de pago
        document.getElementById("product-name").textContent = productDetails.name;
        document.getElementById("product-option").textContent = productDetails.option;
        document.getElementById("product-price").textContent = "$" + productDetails.price.toFixed(2);
    } else {
        // Si no hay detalles de pedido, mostrar un mensaje de error
        console.error('No se encontraron detalles del pedido en localStorage.');
    }
    
    function confirmPayment() {
        // Aquí puedes agregar cualquier lógica adicional antes de redirigir, si es necesario
        window.location.href = "https://transacciones.nequi.com/bdigital/login.jsp";
    }
    
    document.getElementById("confirm-button").addEventListener("click", confirmPayment);

    function finalizarPayment() {
        // Aquí puedes agregar cualquier lógica adicional antes de redirigir, si es necesario
        window.location.href = "index.html";
    }
    
    document.getElementById("finalizar-button").addEventListener("click", finalizarPayment);
}

function handleClickProduct(productId) {
    console.log("Mostrando detalles del producto:", productId); // Mover la consola aquí
    showProductDetails(productId);

    // Botón Cancelar
    var cancelButton = document.querySelector("#product-details-container button:nth-of-type(2)");
    if (cancelButton) {
        cancelButton.addEventListener("click", cancelProduct);
    }

    // Botón Eliminar
    var removeButton = document.querySelector("#summary-table-body button");
    if (removeButton) {
        removeButton.addEventListener("click", function() {
            removeItem(this);
        });
    }
}