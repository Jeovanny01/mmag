const url = "https://apitest.grupocarosa.com/ApiDatos/"
let IMAGEN = null
let IMAGENEDIT = null
let user
let productos = [];
let productosTablaPrec = [];
let inventarioTabla = [];
let pedidoTabla = [];
let pedidoTabla2 = [];
let pedidoTabla3 = [];
let sucursalTabla = []; 
let categoriaTabla = [];
let clientesTabla = [];
let cotizacionesTabla =[];
let empresa ="MMAG";
let bd ="MMAG";
let codCliente1,codCliente2,codCliente3
let ventaTotal=0;

const session = JSON.parse(localStorage.getItem("session") || "{}");
async function exportarAExcel() {
    try {
        const response = await fetch("https://jsonblob.com/api/jsonBlob/1361429202645213184");
        const data = await response.json();

        if (!Array.isArray(data)) {
            alert("El JSON no es un arreglo.");
            return;
        }

        // Crear hoja de Excel desde los datos
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pedido");

        // Descargar archivo
        XLSX.writeFile(workbook, "pedido.xlsx");
    } catch (error) {
        console.error("Error al exportar:", error);
        alert("Error al generar el Excel: " + error.message);
    }
}

const fetchEjecutar = async (funct) => {
    try {
        const response = await fetch(url+funct, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ bd,  empresa })
    });
        if (response.ok) {
            const data = await response.json();
            return data;
            
        } else {
            throw new Error(`Error en la petición. Código de estado:  ${response.status}`);
        }
    } catch (error) {
        //alert('No hay conexion con el servidor, verificar internet',error.mensaje)
        console.error('Error en la petición:', error.message);
        throw error;
    }
};
const fetchEjecutarSelect = async (funct) => {
    try {
        const response = await fetch(url+funct, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ bd,  empresa })
        });
        if (response.ok) {
            const data = await response.json();
            return data;
            
        } else {
            throw new Error(`Error en la petición. Código de estado:  ${response.status}`);
        }
    } catch (error) {
        //alert('No hay conexion con el servidor, verificar internet',error.mensaje)
        console.error('Error en la petición:', error.message);
        throw error;
    }
};

async function cargarCategorias() {
    try {
      
        const selectBranch = document.getElementById('categoria');
        const selectBranch2 = document.getElementById('categoriaEdit');
        if (!selectBranch) return;
         // Verificar si ya hay datos cargados
         if (selectBranch.children.length > 1) {
            console.log('Los Distritos ya están categoria.');
            return;
        }
        const dat = await fetchEjecutar("categoriasProd");
        if (dat && dat.length > 0) {
        categoriaTabla =dat;
        localStorage.setItem('categoriaTabla', JSON.stringify(categoriaTabla));
        }
        categoriaTabla.forEach(data => {
            const option = document.createElement('option');
            option.value = data.CLASIFICACION;
            option.textContent = data.DESCRIPCION;
            selectBranch.appendChild(option);      
        });

        categoriaTabla.forEach(data => {
            const option2 = document.createElement('option');
            option2.value = data.CLASIFICACION;
            option2.textContent = data.DESCRIPCION;
            selectBranch2.appendChild(option2);
            
        });
    } catch (error) {
        console.error('Error al cargar los categoria:', error.message);
        const selectBranch = document.getElementById('categoria');
        const option = document.createElement('option');
        option.value = "error";
        option.textContent = error.message;
        selectBranch.appendChild(option);
    }
};


async function cargarClientes() {
    try {
            
        const dat = await fetchDataClientes();
      
        if (dat && dat.length > 0) {
        clientesTabla =dat;
        localStorage.setItem('clientesTabla', JSON.stringify(clientesTabla));
        }
       
    } catch (error) {
        console.error('Error al cargar los clientes:', error.message);
    
    }
};
async function cargarCotizaciones(fi,ff) {
    try {
        document.getElementById("filtroInputCot").value ="";
        spinnerCot.style.display = "block"; // Mostrar spinner   
        const dat = await fetchDataCotizaciones(fi,ff);
      
        if (dat && dat.length > 0) {
        cotizacionesTabla =dat;
        generarTablaDatos(cotizacionesTabla,"contenedorTablaCot","tablaDatosCot")
        localStorage.setItem('cotizacionesTabla', JSON.stringify(cotizacionesTabla));
        }
       
    } catch (error) {
        console.error('Error al cargar cotizaciones:', error.message);
    
    }
    spinnerCot.style.display = "none"; // Ocultar spinner
};

async function cargarSucursales() {
    try {
        const selectBranch = document.getElementById('sucursal');
        const selectBranch2 = document.getElementById('sucursal3');
        const selectBranch3 = document.getElementById('sucursal4');
        if (!selectBranch) return;
        //if (!selectBranch2) return;
         // Verificar si ya hay datos cargados
        

        const dat = await fetchEjecutarSelect("sucursales",);
        if (dat && dat.length > 0) {
        sucursalTabla =dat;
        localStorage.setItem('sucursalTabla', JSON.stringify(sucursalTabla));
        }
        sucursalTabla.forEach(data => {
            const option = document.createElement('option');
            option.value = data.BODEGA;
            option.textContent = data.NOMBRE;
            selectBranch.appendChild(option);     
            selectBranch.value =  localStorage.getItem("sucursal") || "01";
            
        });
        dat.forEach(data => {
            const option2 = document.createElement('option');
            option2.value = data.BODEGA;
            option2.textContent = data.NOMBRE;
            selectBranch2.appendChild(option2);     
          
            
         });

         dat.filter(data => data.TIPO === "VENTAS").forEach(data => {
            const option2 = document.createElement('option');
            option2.value = data.BODEGA;
            option2.textContent = data.NOMBRE;
            selectBranch3.appendChild(option2);     
            //selectBranch3.value =  localStorage.getItem("sucursal") || "01";
            
         });


    } catch (error) {
        console.error('Error al cargar los categoria:', error.message);
        const selectBranch = document.getElementById('categoria');
        const option = document.createElement('option');
        option.value = "error";
        option.textContent = error.message;
        selectBranch.appendChild(option);
    }
};


function reducirYConvertirImagen(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const maxDimension = 1024; // Tamaño máximo en px
                let width = img.width;
                let height = img.height;

                // Redimensionar la imagen si es demasiado grande
                if (width > height && width > maxDimension) {
                    height = Math.round((height *= maxDimension / width));
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round((width *= maxDimension / height));
                    height = maxDimension;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir el canvas a base64
                canvas.toBlob(
                    blob => {
                        const readerBlob = new FileReader();
                        readerBlob.onload = function (e) {
                            resolve(e.target.result);
                        };
                        readerBlob.onerror = reject;
                        readerBlob.readAsDataURL(blob);
                    },
                    'image/jpeg',
                    0.8 // Calidad (80%)
                );
            };
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(archivo);
    });
}

// Uso:
document.getElementById('archivo').addEventListener('change', function (event) {
    const archivo = event.target.files[0];

    if (!archivo) return;
 
    reducirYConvertirImagen(archivo)
        .then(base64 => {
            IMAGEN = base64.replace(/^data:.+;base64,/, '');
            //console.log("Imagen redimensionada y convertida:", IMAGEN);
           // alert(IMAGEN);
        })
        .catch(error => {
            console.error("Error al redimensionar o convertir la imagen:", error);
        });
});

// Uso:
document.getElementById('archivoEdit').addEventListener('change', function (event) {
    const archivo = event.target.files[0];

    if (!archivo) return;
 
    reducirYConvertirImagen(archivo)
        .then(base64 => {
            IMAGENEDIT = base64.replace(/^data:.+;base64,/, '');
            //console.log("Imagen redimensionada y convertida:", IMAGEN);
           // alert(IMAGEN);
        })
        .catch(error => {
            console.error("Error al redimensionar o convertir la imagen:", error);
        });
});

function buscarProducto(codigo) {

    return productos.find(producto => producto.ARTICULO.toUpperCase() === codigo.trim().toUpperCase());
}

function buscarProductoPreacio(codigo) {

    return productosTablaPrec.find(producto => producto.ARTICULO.toUpperCase() === codigo.trim().toUpperCase());
}

function buscarItems(codigo) {
    return productos.find(producto => producto.ITEM.toUpperCase()  === codigo.trim().toUpperCase() );
}

async function  ActualizaCortes(){
    let dat =[];
    try {
        const bodega = document.getElementById("sucursal4").value;
        const ff = document.getElementById("ff").value;
      
        if (!ff) {
            alert("Seleccione fecha!");
        return
        }
        // Llama al endpoint con las fechas como parámetros
        const response = await fetch(url + "cierreSelect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                empresa,bodega,ff
            })
        });

        if (!response.ok) throw new Error('Error al obtener los datos.');
        const data = await response.json();
        dat =data;
        if (data && data.length > 0) {
       
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }

    const contenedor = document.getElementById("contenedorCierre");
    contenedor.innerHTML = ""; // Limpiar antes de agregar nuevos datos
ventaTotal=0;
    Object.entries(dat[0]).forEach(([key, value]) => {
        if (key !== 'CONTADO_EXTRA') {  // Verificar si la clave no es 'CONTADO_EXTRA'
        const card = document.createElement("div");
        card.style.cssText = "border: 1px solid #ccc; padding: 10px; border-radius: 5px; width: 120px; text-align: center;";
        card.innerHTML = `<strong>${key}:</strong> <br> $${value.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        ventaTotal=ventaTotal+value;
        contenedor.appendChild(card);
        }
    });
}

async function  descargarPdfCot(cot){
  if (empresa ==="MMAG" && session.vend ==="16") {
  return
}


    spinnerCot.style.display = "block"; // Mostrar spinner  
    try {
            // Llama al endpoint con las fechas como parámetros
            const response = await fetch("/api/ApiDatos/reporteCrystalCoti", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bd,empresa,cot
                })
            });

        if (!response.ok)  throw new Error(`Error al obtener los datos: ${response.statusText}`);
        
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/pdf')) {
            const contentType = response.headers.get('Content-Type');

            if (contentType && contentType.includes('application/pdf')) {
                const pdfBlob = await response.blob();
        
                if (pdfBlob.size === 0) {
                    throw new Error('El archivo PDF recibido está vacío.');
                }
                        const pdfUrl = URL.createObjectURL(pdfBlob);
                        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                        const isAndroid = /Android/i.test(navigator.userAgent);
                        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                        const isMobile = isIOS || isAndroid || window.innerWidth < 1024 || isSafari;

                        if (!isMobile) {
                            window.open(pdfUrl, "_blank"); // Solo abre en nueva pestaña si es escritorio
                        } else {
                            setTimeout(() => {
                                const link = document.createElement("a");
                                link.href = pdfUrl;
                                link.download = "Cotizacion-" + cot + ".pdf";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }, 0); // Descarga automática en iOS y Android
                        }
                        
            } else {
                throw new Error(`Se recibió un contenido inesperado: ${contentType}`);
            }
        } else {
            // Si no es un PDF, intenta procesar la respuesta como JSON (o lo que sea apropiado)
            const data = await response.json();
          
            // if (data && data.length > 0) {
            //     button.disabled = false;
            // }
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        //button.disabled = false;
        alert(error);
    }
    spinnerCot.style.display = "none"; // Ocultar spinner

}
async function  descargarPdfCotTicket(cot){
    spinnerCot.style.display = "block"; // Mostrar spinner  
    try {
            // Llama al endpoint con las fechas como parámetros
            const response = await fetch("/api/ApiDatos/reporteCrystalCotiTicket", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bd,empresa,cot
                })
            });
        if (!response.ok)  throw new Error(`Error al obtener los datos: ${response.statusText}`);
        
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/pdf')) {
            const contentType = response.headers.get('Content-Type');

            if (contentType && contentType.includes('application/pdf')) {
                const pdfBlob = await response.blob();
        
                if (pdfBlob.size === 0) {
                    throw new Error('El archivo PDF recibido está vacío.');
                }
                        const pdfUrl = URL.createObjectURL(pdfBlob);
                        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                        const isAndroid = /Android/i.test(navigator.userAgent);
                        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                        const isMobile = isIOS || isAndroid || window.innerWidth < 1024 || isSafari;

                        if (!isMobile) {
                            window.open(pdfUrl, "_blank"); // Solo abre en nueva pestaña si es escritorio
                        } else {

                            if (empresa ==="MMAG") {
                                        setTimeout(() => {
                                const link = document.createElement("a");
                                link.href = pdfUrl;
                                link.download = "Cotizacion-" + cot + ".pdf";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }, 0); // Descarga automática en iOS y Android
                            } else {
                                setTimeout(() => {
                                const link = document.createElement("a");
                                link.href = pdfUrl;
                                link.download = "Cotizacion-" + cot + ".pdf";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }, 0); // Descarga automática en iOS y Android
                            }
                            
                        }
                        
            } else {
                throw new Error(`Se recibió un contenido inesperado: ${contentType}`);
            }
        } else {
            // Si no es un PDF, intenta procesar la respuesta como JSON (o lo que sea apropiado)
            const data = await response.json();
          
            // if (data && data.length > 0) {
            //     button.disabled = false;
            // }
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        //button.disabled = false;
        alert(error);
    }
    spinnerCot.style.display = "none"; // Ocultar spinner

}
async function  hacerCierre(button){
    if (ventaTotal==0) {
        alert("No se puede hacer cierre con valor cero!");
    return
    }
    let confirmacion = confirm("¿Estás seguro de que deseas HACER CIERRE?");
    
    if (!confirmacion) {
        return; // Sale de la función si el usuario cancela
    }


    button.disabled = true;

    try {
        const bodega = document.getElementById("sucursal4").value;
        const ff = document.getElementById("ff").value;
        if (!ff) {
            alert("Seleccione fecha!");
        return
        }
    
        spinner.style.display = "block"; // Mostrar spinner
            // Llama al endpoint con las fechas como parámetros
            const response = await fetch("/api/ApiDatos/reporteCrystal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    empresa,bodega,ff,usuario:session.user
                })
            });

        if (!response.ok)  throw new Error(`Error al obtener los datos: ${response.statusText}`);
        
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/pdf')) {
            const contentType = response.headers.get('Content-Type');

            if (contentType && contentType.includes('application/pdf')) {
                const pdfBlob = await response.blob();
        
                if (pdfBlob.size === 0) {
                    throw new Error('El archivo PDF recibido está vacío.');
                }
                        const pdfUrl = URL.createObjectURL(pdfBlob);
                
                            
                const link = document.createElement("a");
                link.href = pdfUrl;
                link.target = "_blank"; // Abrir en nueva ventana
                link.download = "Reporte_CorteCaja.pdf"; // Nombre del archivo
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error(`Se recibió un contenido inesperado: ${contentType}`);
            }
            
            button.disabled = false;
            ventaTotal=0;
        } else {
            // Si no es un PDF, intenta procesar la respuesta como JSON (o lo que sea apropiado)
            const data = await response.json();
          
            if (data && data.length > 0) {
                button.disabled = false;
            }
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        button.disabled = false;
        alert(error);
    }

    spinner.style.display = "none"; // Ocultar spinner

    const contenedor = document.getElementById("contenedorCierre");
    contenedor.innerHTML = ""; // Limpiar antes de agregar nuevos datos

    
}
// Guardar sucursal (creación o edición)
async function  saveArticulo(event) {

    //event.preventDefault(); // Evitar recarga de la página
    const articulo = document.getElementById("codigo").value;
    const descripcion = document.getElementById("descripcion").value;
    const clasi1 = document.getElementById("categoria").value.charAt(0) || null;;
    const clasi2 = document.getElementById("categoria").value;
    const bulto = document.getElementById("cantidad").value;
    const precio = document.getElementById("precio").value;
    const precioUnit = parseFloat(document.getElementById("precioUnit").value) || 0;
    const precioNomal = document.getElementById("precioNomal").value;
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    const itemInsert = document.getElementById("item").value ;

    const productoEncontrado = buscarProducto(articulo);

    if (productoEncontrado) {
        // Si el producto existe, detén el escáner y muestra un mensaje
        alert(`Producto encontrado: ${productoEncontrado.ARTICULO}, NOMBRE: ${productoEncontrado.DESCRIPCION}`);
          // Limpiar el formulario
          document.getElementById('formRegistrar').reset();  // 'miFormulario' es el ID del formulario
          document.getElementById('btn-quitar').style.display = 'none';  // Ocultar el botón
          IMAGEN=null;
        return; // Sale de la función para que no continúe
    } 
   // const usuario = "sa";
   
        // Envía los datos al backend mediante fetch
        fetch(url+"articulo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accion:"INSERT",  articulo,  descripcion,  clasi1,  clasi2,  bulto,  precio,  precioUnit,  fotografia:IMAGEN,  usuario:session.user,precioNomal,itemInsert })
    }) 
        .then(response => {
            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();  // Leer la respuesta como texto
        })
        .then(text => {
            console.log('Raw response:', text);  // Verifica lo que devuelve el servidor
            try {
                // Intentar convertir el texto a JSON
                const result = JSON.parse(text);
                console.log(result);  // Ver el contenido del objeto JSON
                if (result.success) {
                    //alert('Producto registrado con éxito');
                    alert('Producto registrado con éxito codigo: ' + result.data[0].ARTICULO);
                    // Limpiar el formulario
                    document.getElementById('interno').checked =false;
                    document.getElementById('codigo').required = true; // Activa el atributo 'required'
                    document.getElementById('codigo').disabled = false; // Habilita el campo nuevamente
                    document.getElementById('start-scan').disabled = false;
                    document.getElementById('stop-scan').disabled = false;
                    
                     // Limpiar el formulario
                    document.getElementById('formRegistrar').reset();  // 'miFormulario' es el ID del formulario
                    document.getElementById('btn-quitar').style.display = 'none';  // Ocultar el botón
                    IMAGEN=null;
                        // Regresar al principio de la página
                        window.scrollTo(0, 0);
                        fetchData();
                } else {
                    const errorMessage = result.data[0].ErrorMessage;
                    if (errorMessage.includes("Violation of PRIMARY KEY")) {
                      console.log("El mensaje contiene 'Violation of PRIMARY KEY'.");
                      alert('Producto ya existe!!!');
                      // Limpiar el formulario
                     document.getElementById('formRegistrar').reset();  // 'miFormulario' es el ID del formulario
                     document.getElementById('btn-quitar').style.display = 'none';  // Ocultar el botón
                     IMAGEN=null;
                         // Regresar al principio de la página
                         window.scrollTo(0, 0);
                         
                    } else {
                        console.error('Error:', text);
                    alert('Hubo un error al registrar al PRODUCTO: ' + text);
                    }
                    
                  
                }
            } catch (e) {
                console.error('Error al procesar la respuesta JSON:', e);
                alert('Hubo un error al procesar la respuesta del servidor',e);
            }
        })
        .catch(error => {
            console.error('Error al procesar la solicitud:', error);
            alert('Hubo un error al procesar la solicitud');
        });
};
 

async function  saveInventario(event) {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    //event.preventDefault(); // Evitar recarga de la página
    const articulo = document.getElementById("codigo2").value;
    const cantidad = document.getElementById("cantidad2").value;
    const ubicacion = document.getElementById("ubicacion").value;
    const factor = document.getElementById("unidadCon").value;
    const item = document.getElementById("item2").value;
    const sucursal = document.getElementById("sucursal").value;
    const precio = document.getElementById("precioPublico").value || 0;
    const lote = document.getElementById("lote").value;
    const month = document.getElementById("month").value||"";
    const year = document.getElementById("year").value||"";
    let vence="";
    if (month !=="" && year !=="") { vence ="01/" + month + "/" + year; }
    

    localStorage.setItem("ubicacion", ubicacion);
    localStorage.setItem("sucursal", sucursal);
    const descripcion = document.getElementById("descripcion2").value;
    
    // Verificar si es nulo o está vacío
if (!descripcion || descripcion.trim() === "") {
    alert("Por favor, cree producto, antes de guardar inventario");
    return; // Salir de la función o evitar continuar
  }
   
        // Envía los datos al backend mediante fetch
        fetch(url+"inventario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accion:"INSERT",  articulo,  cantidad, usuario:session.user,ubicacion,factor,descripcion,item,bodega:sucursal,bd,empresa, lote, vence,precio })
    }) 
        .then(response => {
            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();  // Leer la respuesta como texto
        })
        .then(text => {
            console.log('Raw response:', text);  // Verifica lo que devuelve el servidor
            try {
                // Intentar convertir el texto a JSON
                const result = JSON.parse(text);
                console.log(result);  // Ver el contenido del objeto JSON
                if (result.success) {
                    //alert('Producto registrado con éxito');
                    alert('Inventario registrado con éxito codigo: ' + articulo + "  Cantidad: " + cantidad);
                    // Limpiar el formulario
                  
                    document.getElementById('codigo2').required = true; // Activa el atributo 'required'
                    document.getElementById('codigo2').disabled = false; // Habilita el campo nuevamente
                    document.getElementById('start-scan2').disabled = false;
                    document.getElementById('stop-scan2').disabled = false;
                    
                     // Limpiar el formulario
                    document.getElementById('formInventario').reset();  // 'miFormulario' es el ID del formulario
                  document.getElementById("ubicacion").value =  localStorage.getItem("ubicacion")
                  document.getElementById("sucursal").value =  localStorage.getItem("sucursal")
                        // Regresar al principio de la página
                        window.scrollTo(0, 0);
                        fetchData2();
                } else {
                    const errorMessage = result.data[0].ErrorMessage;
                    if (errorMessage.includes("Violation of PRIMARY KEY")) {
                      console.log("El mensaje contiene 'Violation of PRIMARY KEY'.");
                      alert('Producto ya existe!!!');
                      // Limpiar el formulario
                     document.getElementById('formInventario').reset();  // 'miFormulario' es el ID del formulario
                    
                         // Regresar al principio de la página
                         window.scrollTo(0, 0);
                         
                    } else {
                        console.error('Error:', text);
                    alert('Hubo un error al registrar el inventario: ' + text);
                    }
                    
                  
                }
            } catch (e) {
                console.error('Error al procesar la respuesta JSON:', e);
                alert('Hubo un error al procesar la respuesta del servidor',e);
            }
        })
        .catch(error => {
            console.error('Error al procesar la solicitud:', error);
            alert('Hubo un error al procesar la solicitud');
        });
};

async function  deleteArticulo(event) {
    //event.preventDefault(); // Evitar recarga de la página
    const articulo = document.getElementById("articulo").value;
    const descripcion = document.getElementById("descripcionEdit").value;
    const items = document.getElementById("items").value.trim() === "" ? null: document.getElementById("items").value.trim();
    const cat1 = document.getElementById("categoriaEdit").value.charAt(0) || null;;
    const cat2 = document.getElementById("categoriaEdit").value;

    if (document.getElementById("articulo").readOnly) {
            try {
                const response = await articuloEdit("DELETE", articulo,descripcion,items,"FUNNY",cat1,cat2,0,0,0);
                console.log("DELETED ARTICULO:", response); 
                // Lógica para actualizar la fila correspondiente en la tabla
                //updateTableRowVend(id, nombre); // Función para actualizar la fila
                fetchData();
                closeModal();
                
            } catch (error) {
                console.error("Error al actualizar DELETED:", error.message);
                alert("Error al ELIMINAR ");
            }
       
    }

    
};


const procesarPedidoTabla = async (cot) => {
    for (let fila of pedidoTabla) {
        i++; // Incrementa el índice
        try {
            let eje = await cotizacionLinea("INSERT", fila.ARTICULO, fila.DESCRIPCION, fila.CANTIDAD, fila.PRECIO, fila.TOTAL, i, cot);
            console.log("Resultado:", eje);
        } catch (error) {
            console.error("Error procesando fila:", error.message);
        }
    }
};


// Función para leer el archivo como ArrayBuffer
function convertirArchivoABase64(archivo) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        
        lector.onload = function(event) {
          resolve(event.target.result);  // Resuelve la promesa con el resultado base64
        };
        
        lector.onerror = function(error) {
          reject(error);  // Si ocurre un error, rechaza la promesa
        };
        
        lector.readAsDataURL(archivo);  // Lee el archivo como base64
      });
}

function guardar(datos) {

}

function generarTabla(datos) { // Usaremos 'empresaActual' consistentemente para el parámetro

    const contenedorTabla = document.getElementById('contenedorTabla');
    const tablaExistente = document.getElementById('tablaDatos');

    // Elimina la tabla anterior, si existe
    if (tablaExistente) {
        tablaExistente.remove();
    }

    const section = document.getElementById('datos');

    if (!datos.length) {
        if (!document.getElementById('mensajeNoDatos')) {
            const mensaje = document.createElement('p');
            mensaje.textContent = 'No hay datos disponibles.';
            mensaje.id = 'mensajeNoDatos';
            section.appendChild(mensaje);
        }
        return;
    } else {
        const mensajeNoDatos = document.getElementById('mensajeNoDatos');
        if (mensajeNoDatos) mensajeNoDatos.remove();
    }

    const table = document.createElement('table');
    table.id = 'tablaDatos';
    table.border = '1';

    // Genera el encabezado de la tabla dinámicamente
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // === CAMBIO CLAVE AQUÍ PARA FILTRAR EL ENCABEZADO ESPECÍFICAMENTE ===
    // Primero, determinamos qué columnas SE VAN A MOSTRAR en el encabezado.
    const columnasAMostrar = Object.keys(datos[0]).filter(columna => {
        // Si la empresa es 'MMAG' Y la columna es 'COSTO_PROMEDIO', la excluimos (retornamos false)
        if (empresa === 'MMAG' && columna === 'COSTO_PROMEDIO') {
            return false; 
        }
        return true; // Incluir todas las demás columnas
    });

    // Ahora iteramos sobre las columnas que decidimos mostrar para crear los th
    columnasAMostrar.forEach((columna) => {
        const th = document.createElement('th');
        th.textContent = columna;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Genera el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach((fila) => {
        const tr = document.createElement('tr');

        // === CAMBIO CLAVE AQUÍ PARA FILTRAR EL CUERPO IGUAL QUE EL ENCABEZADO ===
        // Iteramos sobre las MISMAS columnas que decidimos mostrar en el encabezado
        columnasAMostrar.forEach((columna) => { 
            const td = document.createElement('td');
            const valor = fila[columna]; // Obtiene el valor de la fila para la columna actual

            // Lógica existente para formato de fecha
            if (typeof valor === 'string' && valor.includes('/Date(') && valor.includes(')/')) {
                const timestamp = valor.match(/\/Date\((\d+)\)\//)[1];
                const fecha = new Date(parseInt(timestamp));
                
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const anio = fecha.getFullYear();
                let horas = fecha.getHours();
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                const ampm = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12;
                td.textContent = `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
            }
            // Lógica existente para la columna 'ARTICULO'
            else if (columna === 'ARTICULO') {
                const enlace = document.createElement('a');
                enlace.href = `editar.html?id=${valor}`;
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                    event.preventDefault();
                    editarRegistro(valor);
                };
                td.appendChild(enlace);
            }
            // Para todas las demás columnas (incluyendo COSTO_PROMEDIO si NO es MMAG)
            else {
                td.textContent = valor;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    contenedorTabla.appendChild(table);
}

function generarTabla2(datos) {
    const contenedorTabla = document.getElementById('contenedorTabla2'); // Obtiene el contenedor de la tabla
    const tablaExistente = document.getElementById('tablaDatos2'); // Identifica la tabla existente

    // Elimina la tabla anterior, si existe
    if (tablaExistente) {
        tablaExistente.remove();
    }

    const section = document.getElementById('registrosInv');

    if (!datos.length) {
        // Verifica si ya existe el mensaje "No hay datos disponibles"
        if (!document.getElementById('mensajeNoDatos')) {
            const mensaje = document.createElement('p');
            mensaje.textContent = 'No hay datos disponibles.';
            mensaje.id = 'mensajeNoDatos';
            section.appendChild(mensaje);
        }
        return;
    } else {
        // Elimina el mensaje si los datos están disponibles
        const mensajeNoDatos = document.getElementById('mensajeNoDatos');
        if (mensajeNoDatos) mensajeNoDatos.remove();
    }
    

    const table = document.createElement('table');
    table.id = 'tablaDatos2'; // Asigna un ID único a la tabla
    table.border = '1';

    // Genera el encabezado de la tabla dinámicamente
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(datos[0]).forEach((columna) => {
        if(empresa != "MMAG") {
        const th = document.createElement('th');
        th.textContent = columna;
        headerRow.appendChild(th);
        }
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Genera el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach((fila) => {
        const tr = document.createElement('tr');
        Object.entries(fila).forEach(([columna, valor]) => {
            
            const td = document.createElement('td');
            // Si la columna es una fecha en formato /Date(...)/, la convertimos
            if (typeof valor === 'string' && valor.includes('/Date(') && valor.includes(')/')) {
                const timestamp = valor.match(/\/Date\((\d+)\)\//)[1];
                const fecha = new Date(parseInt(timestamp)); // Convierte el timestamp a una fecha
                
                // Formatea la fecha y hora en el formato dd/MM/yyyy hh:mm AM/PM
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const anio = fecha.getFullYear();
                let horas = fecha.getHours();
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                const ampm = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12; // Convierte a formato de 12 horas
                td.textContent = `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
            } else if (columna === 'ID') {
                // Convierte el ID en un enlace
                const enlace = document.createElement('a');
                enlace.href = `editar.html?id=${valor}`; // URL para editar
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                    event.preventDefault(); // Evita el comportamiento por defecto
                    editarRegistro2(valor); // Llama a la función de edición
                };
                td.appendChild(enlace);
            } else {
                td.textContent = valor;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Inserta la tabla al final de la sección
    //section.appendChild(table);
    contenedorTabla.appendChild(table);
    document.getElementById("filtroInput2").value="";
}

function generarTablaExist(datos) {
    const contenedorTabla = document.getElementById('contenedorTablaExist'); // Obtiene el contenedor de la tabla
    const tablaExistente = document.getElementById('tablaExist'); // Identifica la tabla existente

    // Elimina la tabla anterior, si existe
    if (tablaExistente) {
        tablaExistente.remove();
    }
    const table = document.createElement('table');
    table.id = 'tablaExist'; // Asigna un ID único a la tabla
    table.border = '1';

    // Genera el encabezado de la tabla dinámicamente
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(datos[0]).forEach((columna) => {
        const th = document.createElement('th');
        th.textContent = columna;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Genera el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach((fila) => {
        const tr = document.createElement('tr');
        Object.entries(fila).forEach(([columna, valor]) => {
            const td = document.createElement('td');
            // Si la columna es una fecha en formato /Date(...)/, la convertimos
            if (typeof valor === 'string' && valor.includes('/Date(') && valor.includes(')/')) {
                const timestamp = valor.match(/\/Date\((\d+)\)\//)[1];
                const fecha = new Date(parseInt(timestamp)); // Convierte el timestamp a una fecha
                
                // Formatea la fecha y hora en el formato dd/MM/yyyy hh:mm AM/PM
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const anio = fecha.getFullYear();
                let horas = fecha.getHours();
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                const ampm = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12; // Convierte a formato de 12 horas
                td.textContent = `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
            } else if (columna === 'ID') {
                // Convierte el ID en un enlace
                const enlace = document.createElement('a');
                enlace.href = `editar.html?id=${valor}`; // URL para editar
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                    event.preventDefault(); // Evita el comportamiento por defecto
                    editarRegistro2(valor); // Llama a la función de edición
                };
                td.appendChild(enlace);
            } else {
                td.textContent = valor;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Inserta la tabla al final de la sección
    //section.appendChild(table);
    contenedorTabla.appendChild(table);
    document.getElementById("filtroInput2").value="";
}

function generarTablaDatos(datos,contenedor,tabla) {
    const contenedorTabla = document.getElementById(contenedor); // Obtiene el contenedor de la tabla
    const tablaExistente = document.getElementById(tabla); // Identifica la tabla existente


     // Elimina la tabla anterior, si existe
     if (tablaExistente) {
        tablaExistente.remove();
    }

    const table = document.createElement('table');
    table.id = tabla; // Asigna un ID único a la tabla
    table.border = '1';

    // Genera el encabezado de la tabla dinámicamente
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(datos[0]).forEach((columna) => {
        const th = document.createElement('th');
        th.textContent = columna;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Genera el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach((fila) => {
        const tr = document.createElement('tr');
        Object.entries(fila).forEach(([columna, valor]) => {
            const td = document.createElement('td');
            // Si la columna es una fecha en formato /Date(...)/, la convertimos
            if (typeof valor === 'string' && valor.includes('/Date(') && valor.includes(')/')) {
                const timestamp = valor.match(/\/Date\((\d+)\)\//)[1];
                const fecha = new Date(parseInt(timestamp)); // Convierte el timestamp a una fecha
                
                // Formatea la fecha y hora en el formato dd/MM/yyyy hh:mm AM/PM
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const anio = fecha.getFullYear();
                let horas = fecha.getHours();
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                const ampm = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12; // Convierte a formato de 12 horas
                td.textContent = `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
            } else if (columna === 'CLIENTE') {
                // Convierte el ID en un enlace
                const enlace = document.createElement('a');
                enlace.href = `editar.html?id=${valor}`; // URL para editar
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                    event.preventDefault(); // Evita el comportamiento por defecto
                    seleccionarRegistro(valor); // Llama a la función de edición
                };
                td.appendChild(enlace);
            } else if (columna === 'COTIZACION') {
                // Convierte el ID en un enlace
                const enlace = document.createElement('a');
                enlace.href = `descargar.html?id=${valor}`; // URL para editar
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                    event.preventDefault(); // Evita el comportamiento por defecto
                    descargarPdfCot(valor); // Llama a la función de edición
                };
                td.appendChild(enlace);
              } else if (columna === 'CODIGO') {
                // Convierte el ID en un enlace
                const cotiza = fila['COTIZACION']; // 🔸 Aquí obtienes el valor de COTIZACION
                const enlace = document.createElement('a');
                enlace.href = `descargarTicket.html?id=${cotiza}`; // URL para editar
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                    event.preventDefault(); // Evita el comportamiento por defecto
                    descargarPdfCotTicket(cotiza); // Llama a la función de edición
                };
                td.appendChild(enlace);
            } else if (columna === "TOTAL") {
                    td.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valor);
                
            } else {
                td.textContent = valor;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Inserta la tabla al final de la sección
    //section.appendChild(table);
    contenedorTabla.appendChild(table);
}

function generarTabla4(datos) {
    const contenedorTabla = document.getElementById('contenedorTabla4'); // Obtiene el contenedor de la tabla
    const tablaExistente = document.getElementById('tablaDatos4'); // Identifica la tabla existente

    // Elimina la tabla anterior, si existe
    if (tablaExistente) {
        tablaExistente.remove();
    }

    const section = document.getElementById('ventas');

    if (!datos.length) {
        // Verifica si ya existe el mensaje "No hay datos disponibles"
        if (!document.getElementById('mensajeNoDatos')) {
            const mensaje = document.createElement('p');
            mensaje.textContent = 'No hay datos disponibles.';
            mensaje.id = 'mensajeNoDatos';
            section.appendChild(mensaje);
        }
        return;
    } else {
        // Elimina el mensaje si los datos están disponibles
        const mensajeNoDatos = document.getElementById('mensajeNoDatos');
        if (mensajeNoDatos) mensajeNoDatos.remove();
    }
    

    const table = document.createElement('table');
    table.id = 'tablaDatos4'; // Asigna un ID único a la tabla
    table.border = '1';

    // Genera el encabezado de la tabla dinámicamente
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(datos[0]).forEach((columna) => {
        const th = document.createElement('th');
        th.textContent = columna;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Genera el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach((fila) => {
        const tr = document.createElement('tr');
        Object.entries(fila).forEach(([columna, valor]) => {
            const td = document.createElement('td');
            // Si la columna es una fecha en formato /Date(...)/, la convertimos
            if (typeof valor === 'string' && valor.includes('/Date(') && valor.includes(')/')) {
                const timestamp = valor.match(/\/Date\((\d+)\)\//)[1];
                const fecha = new Date(parseInt(timestamp)); // Convierte el timestamp a una fecha
                
                // Formatea la fecha y hora en el formato dd/MM/yyyy hh:mm AM/PM
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const anio = fecha.getFullYear();
                let horas = fecha.getHours();
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                const ampm = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12; // Convierte a formato de 12 horas
                td.textContent = `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
            } else if (columna === 'ACCION') {
                 // Convierte el ID en un enlace
                        const enlace = document.createElement('a');
                        enlace.href = `eliminar.html?id=${valor}` ; // URL para eliminar
                        enlace.textContent = valor;
                        enlace.style.color = 'red'; // Cambia el color a rojo
                        enlace.onclick = (event) => {
                            event.preventDefault(); // Evita el comportamiento por defecto
                            eliminarFila(enlace,"tablaDatos4"); // Llama a la función con el elemento enlace
                        };
                        td.appendChild(enlace);
            } else if (columna === 'ARTICULO') {
                 // Convierte el ID en un enlace
                 const enlace = document.createElement('a');
                 enlace.href = `editar.html?id=${valor}`; // URL para editar
                 enlace.textContent = valor;
                 enlace.onclick = (event) => {
                                            event.preventDefault(); // Evita el comportamiento por defecto
                        // Capturar el índice de la fila
                        const fila = event.target.closest('tr'); // Encuentra la fila (<tr>) más cercana al enlace
                        const indice = fila.rowIndex; // Obtén el índice de la fila
                                            console.log("Índice de la fila:", indice); // Muestra el índice en la consola
                        editarRegistroPe(indice); // Llama a la función de edición con el índice                
                };
                 td.appendChild(enlace);
            } else {
                td.textContent = valor;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Inserta la tabla al final de la sección
    //section.appendChild(table);
    contenedorTabla.appendChild(table);
    document.getElementById("filtroInput2").value="";
}

function generarTabla5(datos) {
    const contenedorTabla = document.getElementById('contenedorTabla5'); // Obtiene el contenedor de la tabla
    const tablaExistente = document.getElementById('tablaDatos5'); // Identifica la tabla existente

    // Elimina la tabla anterior, si existe
    if (tablaExistente) {
        tablaExistente.remove();
    }

    // Nota: La sección para el mensaje "No hay datos disponibles" y su eliminación
    // no está presente en tu función original generarTabla5.
    // Si la necesitas, deberías reincorporarla aquí.
    // Asumo que solo quieres la lógica de tabla.


    const table = document.createElement('table');
    table.id = 'tablaDatos5'; // Asigna un ID único a la tabla
    table.border = '1';

    // Genera el encabezado de la tabla dinámicamente
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // === Lógica para el encabezado: Filtrar la columna 'COSTO_PROMEDIO' si empresa es 'MMAG' ===
    // Utiliza la variable global 'empresa' aquí
    const columnasAMostrar = Object.keys(datos[0]).filter(columna => {
        // Si la empresa global es 'MMAG' Y la columna es 'COSTO_PROMEDIO', la saltamos (no la incluimos)
        if (empresa === 'MMAG' && columna === 'COSTO_PROMEDIO') {
            return false; // Excluir esta columna
        }
        return true; // Incluir todas las demás columnas
    });

    columnasAMostrar.forEach((columna) => {
        const th = document.createElement('th');
        th.textContent = columna;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Genera el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach((fila) => {
        const tr = document.createElement('tr');

        // === Lógica para el cuerpo: Iterar solo sobre las columnas que decidimos mostrar ===
        // Utiliza el mismo array de columnas filtradas para asegurar la consistencia con el encabezado
        columnasAMostrar.forEach((columna) => { 
            const td = document.createElement('td');
            const valor = fila[columna]; 

            // Si la columna es una fecha en formato /Date(...)/, la convertimos
            if (typeof valor === 'string' && valor.includes('/Date(') && valor.includes(')/')) {
                const timestamp = valor.match(/\/Date\((\d+)\)\//)[1];
                const fecha = new Date(parseInt(timestamp)); // Convierte el timestamp a una fecha
                
                // Formatea la fecha y hora en el formato dd/MM/yyyy hh:mm AM/PM
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const anio = fecha.getFullYear();
                let horas = fecha.getHours();
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                const ampm = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12; // Convierte a formato de 12 horas
                td.textContent = `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
            } else if (columna === 'ARTICULO') {
                // Convierte el ID en un enlace
                const enlace = document.createElement('a');
                enlace.href = `editar.html?id=${valor}`; // URL para editar
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                    event.preventDefault(); // Evita el comportamiento por defecto
                    selccionarDato4(valor); // Llama a la función de edición (asegúrate de que selccionarDato4 esté definida)
                };
                td.appendChild(enlace);
            } else {
                td.textContent = valor;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Inserta la tabla al final del contenedor específico
    contenedorTabla.appendChild(table);
    // document.getElementById("filtroInput5").value=""; // Línea comentada en tu original
}

function generarTabla6(datos) {
    const contenedorTabla = document.getElementById('contenedorTabla6'); // Obtiene el contenedor de la tabla
    const tablaExistente = document.getElementById('tablaDatos6'); // Identifica la tabla existente

    // Elimina la tabla anterior, si existe
    if (tablaExistente) {
        tablaExistente.remove();
    }

    const section = document.getElementById('ventas');

    if (!datos.length) {
        // Verifica si ya existe el mensaje "No hay datos disponibles"
        if (!document.getElementById('mensajeNoDatos')) {
            const mensaje = document.createElement('p');
            mensaje.textContent = 'No hay datos disponibles.';
            mensaje.id = 'mensajeNoDatos';
            section.appendChild(mensaje);
        }
        return;
    } else {
        // Elimina el mensaje si los datos están disponibles
        const mensajeNoDatos = document.getElementById('mensajeNoDatos');
        if (mensajeNoDatos) mensajeNoDatos.remove();
    }
    

    const table = document.createElement('table');
    table.id = 'tablaDatos6'; // Asigna un ID único a la tabla
    table.border = '1';

    // Genera el encabezado de la tabla dinámicamente
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(datos[0]).forEach((columna) => {
        const th = document.createElement('th');
        th.textContent = columna;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Genera el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach((fila) => {
        const tr = document.createElement('tr');
        Object.entries(fila).forEach(([columna, valor]) => {
            const td = document.createElement('td');
            // Si la columna es una fecha en formato /Date(...)/, la convertimos
            if (typeof valor === 'string' && valor.includes('/Date(') && valor.includes(')/')) {
                const timestamp = valor.match(/\/Date\((\d+)\)\//)[1];
                const fecha = new Date(parseInt(timestamp)); // Convierte el timestamp a una fecha
                
                // Formatea la fecha y hora en el formato dd/MM/yyyy hh:mm AM/PM
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const anio = fecha.getFullYear();
                let horas = fecha.getHours();
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                const ampm = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12; // Convierte a formato de 12 horas
                td.textContent = `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
            } else if (columna === 'ACCION') {
                // Convierte el ID en un enlace
                const enlace = document.createElement('a');
                enlace.href = `eliminar2.html?id=${valor}` ; // URL para eliminar
                enlace.textContent = valor;
                enlace.style.color = 'red'; // Cambia el color a rojo
                enlace.onclick = (event) => {
                    event.preventDefault(); // Evita el comportamiento por defecto
                    eliminarFila2(enlace,"tablaDatos6"); // Llama a la función con el elemento enlace
                };
                td.appendChild(enlace);
            } else if (columna === 'ARTICULO') {
                const enlace = document.createElement('a');
                enlace.href = `editar2.html?id=${valor}`; // URL para editar
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                                           event.preventDefault(); // Evita el comportamiento por defecto
                       // Capturar el índice de la fila
                       const fila = event.target.closest('tr'); // Encuentra la fila (<tr>) más cercana al enlace
                       const indice = fila.rowIndex; // Obtén el índice de la fila
                                           console.log("Índice de la fila:", indice); // Muestra el índice en la consola
                       editarRegistroPe(indice); // Llama a la función de edición con el índice                
                };
            
                td.appendChild(enlace);
            } else {
                td.textContent = valor;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Inserta la tabla al final de la sección
    //section.appendChild(table);
    contenedorTabla.appendChild(table);
    //document.getElementById("filtroInput6").value="";
}

function generarTabla7(datos) {
    const contenedorTabla = document.getElementById('contenedorTabla7'); // Obtiene el contenedor de la tabla
    const tablaExistente = document.getElementById('tablaDatos7'); // Identifica la tabla existente

    // Elimina la tabla anterior, si existe
    if (tablaExistente) {
        tablaExistente.remove();
    }

    const section = document.getElementById('ventas');

    if (!datos.length) {
        // Verifica si ya existe el mensaje "No hay datos disponibles"
        if (!document.getElementById('mensajeNoDatos')) {
            const mensaje = document.createElement('p');
            mensaje.textContent = 'No hay datos disponibles.';
            mensaje.id = 'mensajeNoDatos';
            section.appendChild(mensaje);
        }
        return;
    } else {
        // Elimina el mensaje si los datos están disponibles
        const mensajeNoDatos = document.getElementById('mensajeNoDatos');
        if (mensajeNoDatos) mensajeNoDatos.remove();
    }
    

    const table = document.createElement('table');
    table.id = 'tablaDatos7'; // Asigna un ID único a la tabla
    table.border = '1';

    // Genera el encabezado de la tabla dinámicamente
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(datos[0]).forEach((columna) => {
        const th = document.createElement('th');
        th.textContent = columna;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Genera el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    datos.forEach((fila) => {
        const tr = document.createElement('tr');
        Object.entries(fila).forEach(([columna, valor]) => {
            const td = document.createElement('td');
            // Si la columna es una fecha en formato /Date(...)/, la convertimos
            if (typeof valor === 'string' && valor.includes('/Date(') && valor.includes(')/')) {
                const timestamp = valor.match(/\/Date\((\d+)\)\//)[1];
                const fecha = new Date(parseInt(timestamp)); // Convierte el timestamp a una fecha
                
                // Formatea la fecha y hora en el formato dd/MM/yyyy hh:mm AM/PM
                const dia = fecha.getDate().toString().padStart(2, '0');
                const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
                const anio = fecha.getFullYear();
                let horas = fecha.getHours();
                const minutos = fecha.getMinutes().toString().padStart(2, '0');
                const ampm = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12; // Convierte a formato de 12 horas
                td.textContent = `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
            } else if (columna === 'ACCION') {
             // Convierte el ID en un enlace
             const enlace = document.createElement('a');
             enlace.href = `eliminar3.html?id=${valor}` ; // URL para eliminar
             enlace.textContent = valor;
             enlace.style.color = 'red'; // Cambia el color a rojo
             enlace.onclick = (event) => {
                 event.preventDefault(); // Evita el comportamiento por defecto
                 eliminarFila3(enlace,"tablaDatos7"); // Llama a la función con el elemento enlace
             };
             td.appendChild(enlace);
            } else if (columna === 'ARTICULO') {
                const enlace = document.createElement('a');
                enlace.href = `editar3.html?id=${valor}`; // URL para editar
                enlace.textContent = valor;
                enlace.onclick = (event) => {
                                           event.preventDefault(); // Evita el comportamiento por defecto
                       // Capturar el índice de la fila
                       const fila = event.target.closest('tr'); // Encuentra la fila (<tr>) más cercana al enlace
                       const indice = fila.rowIndex; // Obtén el índice de la fila
                                           console.log("Índice de la fila:", indice); // Muestra el índice en la consola
                       editarRegistroPe(indice); // Llama a la función de edición con el índice                
               };
                td.appendChild(enlace);
            } else {
                td.textContent = valor;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Inserta la tabla al final de la sección
    //section.appendChild(table);
    contenedorTabla.appendChild(table);
    //document.getElementById("filtroInput7").value="";
}

function seleccionarRegistro(id) {
    // const session = JSON.parse(localStorage.getItem("session") || "{}");
    // if (!["1", "3"].includes(session.userRole)) {
    //     return;
    // }

    if (empresa === "MMAG") {fetchDataPrecios(id);}
// Filtrar la tabla de datos para obtener el registro con el ID seleccionado
let registroSeleccionado = clientesTabla.filter(item => item.CLIENTE === id);
// Si encuentras el registro, puedes hacer algo con él, por ejemplo, mostrarlo en un formulario



if (registroSeleccionado.length > 0) {

    console.log("Registro encontrado:", registroSeleccionado[0]); 
    let tab =   localStorage.getItem("ventana") || "venta1" 
    let nombreCliente = registroSeleccionado[0].NOMBRE; // Acceder directamente a NOMBRE
 
    // ACA LLENAR LA TABLA DE PRECIOS SEGUN EL CLIENTE

    if (tab =="venta1") {
   codCliente1=id;
   document.getElementById("nombreCliente4").value = nombreCliente; 
   localStorage.setItem("nombreCliente",nombreCliente);
   localStorage.setItem("codCliente1",  codCliente1);
    }
    if (tab =="venta2") {
        codCliente2=id;
        document.getElementById("nombreCliente6").value= nombreCliente; 
        localStorage.setItem("nombreCliente2",nombreCliente);
        localStorage.setItem("codCliente2",  codCliente2);
    }
    if (tab =="venta3") {
        codCliente3=id;
        document.getElementById("nombreCliente7").value= nombreCliente; 
        localStorage.setItem("nombreCliente3",nombreCliente);
        localStorage.setItem("codCliente3",  codCliente3);
    }

    closeModal();
} else {
    console.log("Registro no encontrado");
}
}

function editarRegistro(id) {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    if (!["1", "3"].includes(session.userRole)) {
        return;
    }
// Filtrar la tabla de datos para obtener el registro con el ID seleccionado
let registroSeleccionado = productos.filter(item => item.ARTICULO === id);
// Si encuentras el registro, puedes hacer algo con él, por ejemplo, mostrarlo en un formulario
if (registroSeleccionado.length > 0) {
    console.log("Registro encontrado:", registroSeleccionado[0]); 
    cargarFormulario(registroSeleccionado[0])
       // Abrir el modal
       const modal = document.getElementById("formulario");
       modal.style.display = "flex"; // Mostrar el modal
} else {
    console.log("Registro no encontrado");
}
}

function editarRegistroPe(id) {
// Filtrar la tabla de datos para obtener el registro con el ID seleccionado

let tab =   localStorage.getItem("ventana") || "venta1" 
    if (tab =="venta1") {
    let filaSeleccionada = pedidoTabla[id-1]
        cargarFormulario4(filaSeleccionada,id-1)
    }
    if (tab =="venta2") {
        let filaSeleccionada = pedidoTabla2[id-1]
            cargarFormulario4(filaSeleccionada,id-1)
    }
    if (tab =="venta3") {
        let filaSeleccionada = pedidoTabla3[id-1]
            cargarFormulario4(filaSeleccionada,id-1)
    }

}

function editarRegistro2(id) {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    if (!["1", "3"].includes(session.userRole)) {
        return;
    }
    
   
// Filtrar la tabla de datos para obtener el registro con el ID seleccionado
let registroSeleccionado = inventarioTabla.filter(item => item.ID === id);
// Si encuentras el registro, puedes hacer algo con él, por ejemplo, mostrarlo en un formulario
if (registroSeleccionado.length > 0) {
    console.log("Registro encontrado:", registroSeleccionado[0]);
    
    cargarFormulario2(registroSeleccionado[0])
       // Abrir el modal
       const modal = document.getElementById("formulario2");
       modal.style.display = "flex"; // Mostrar el modal
} else {
    console.log("Registro no encontrado");
}
}

const articuloEdit = async (accion, articulo, descripcion, items,empresa,cat1,cat2,precio=0,precioNormal=0,precioUnitario=0,artNvo="",fardo=0) => {
    try {
        const response = await fetch(url + "articuloEdit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accion, articulo, descripcion, items,empresa,cat1,cat2,precio,precioNormal,precioUnitario,fotografia:IMAGENEDIT,artNvo,fardo,
            })
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('btn-quitarEdit').style.display = 'none';
            IMAGENEDIT=null;
      
            return data;
           
        } else {
            throw new Error(`Error en la petición. Código de estado: ${response.status}`);
        }
    } catch (error) {
        console.error("Error en la petición:", error.message);
        throw error;
    }
};

const cotizacionLinea = async (accion,  articulo,  descripcion,  cantidad,  precioUnitario,  total,  linea,  cotizacion) => {
    try {
        const response = await fetch(url + "cotizacionesLinea", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accion,  articulo,  descripcion,  cantidad,  precioUnitario,  total,  linea,  cotizacion
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Error en la petición. Código de estado: ${response.status}`);
        }
    } catch (error) {
        console.error("Error en la petición:", error.message);
        throw error;
    }
};

const inventarioEdit = async (accion, id, cantidad,descripcion,item,articulo,bodega) => {
    try {
        const response = await fetch(url + "inventarioEdit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accion, id, cantidad,bd,empresa,descripcion,item,articulo,bodega
            })
        });

        if (response.ok) {
            const data = await response.json();
            alert("Actualizado con exito a :" + cantidad);
            return data;
      
        } else {
            throw new Error(`Error en la petición. Código de estado: ${response.status}`);
        }
    } catch (error) {
        console.error("Error en la petición:", error.message);
        throw error;
    }
};
 // Función para filtrar los datos
 function filtrarDatos() {
    const filtro = document.getElementById("filtroInput").value.toLowerCase();
    const resultados = productos.filter(articulo => {
        const articuloTexto = (articulo.ARTICULO || "").toLowerCase();
        const descripcionTexto = (articulo.DESCRIPCION || "").toLowerCase();
        const itemTexto = (articulo.ITEM || "").toLowerCase();

        return articuloTexto.includes(filtro) ||
               descripcionTexto.includes(filtro) ||
               itemTexto.includes(filtro);
    });
    
    generarTabla(resultados);
    document.getElementById("filtroInput").value="";
}

// Función para filtrar los datos
function filtrarDatos2() {
    const filtro = document.getElementById("filtroInput2").value.toLowerCase();
    const resultados = inventarioTabla.filter(articulo => {
        const articuloTexto = (articulo.ARTICULO || "").toLowerCase();
        const descripcionTexto = (articulo.DESCRIPCION || "").toLowerCase();
        const itemTexto = (articulo.ITEM || "").toLowerCase();

        return articuloTexto.includes(filtro) ||
               descripcionTexto.includes(filtro) ||
               itemTexto.includes(filtro);
    });
    
    generarTabla2(resultados);
}


function filtrarDatos5() {
    const filtro = document.getElementById("filtroInput5").value.toLowerCase();
    const resultados = productos.filter(articulo => {
        const articuloTexto = (articulo.ARTICULO || "").toLowerCase();
        const descripcionTexto = (articulo.DESCRIPCION || "").toLowerCase();
        const itemTexto = (articulo.ITEM || "").toLowerCase();

        return articuloTexto.includes(filtro) ||
               descripcionTexto.includes(filtro) ||
               itemTexto.includes(filtro);
    });
    
    generarTabla5(resultados);
    document.getElementById("filtroInput5").value="";
}
function filtrarDatosClientes() {
    const filtro = document.getElementById("filtroInputCliente").value.toLowerCase();
    const resultados = clientesTabla.filter(dat => {
        const clienteTexto = (dat.CLIENTE || "").toLowerCase();
        const nombreTexto = (dat.NOMBRE || "").toLowerCase();
        const aliasTexto = (dat.ALIAS || "").toLowerCase();
        const direccionTexto = (dat.ALIAS || "").toLowerCase();

        return clienteTexto.includes(filtro) ||
               nombreTexto.includes(filtro) ||
               aliasTexto.includes(filtro)  ||
               direccionTexto.includes(filtro)
               ;
    });
    
    generarTablaDatos(resultados,"contenedorTablaClientes","tablaClientes");
}

function filtrarDatosCot() {
    const filtro = document.getElementById("filtroInputCot").value.toLowerCase();
    const resultados = cotizacionesTabla.filter(dat => {
        const clienteTexto = (dat.CODIGO || "").toLowerCase();
        const nombreTexto = (dat.NOMBRE || "").toLowerCase();
        const cot = (dat.COTIZACION ? String(dat.COTIZACION) : "").toLowerCase();
        const vendedor = (dat["EJECUTIVO DE VENTAS"] || "").toLowerCase();
        const estado = (dat.ESTADO || "").toLowerCase();

        return clienteTexto.includes(filtro) ||
               nombreTexto.includes(filtro) ||
               cot.includes(filtro)  ||
               vendedor.includes(filtro) ||
               estado.includes(filtro)
               ;
    });
    //if (resultados.length > 0) {  
        generarTablaDatos(resultados, "contenedorTablaCot", "tablaDatosCot");  
   // }
    
}
async function  saveRegistro(event) {
    event.preventDefault(); // Evitar recarga de la página
    const articulo = document.getElementById("articulo").value;
    const artNvo = document.getElementById("articuloEdit").value;
    const descripcion = document.getElementById("descripcionEdit").value;
    const items = document.getElementById("items").value.trim() === "" ? null: document.getElementById("items").value.trim();
    const cat1 = document.getElementById("categoriaEdit").value.charAt(0) || null;;
    const cat2 = document.getElementById("categoriaEdit").value;
    const precio = document.getElementById("precioEdit").value;
    const precioNormal = document.getElementById("precioNomalEdit").value;
    const precioUnitario = document.getElementById("precioUnitEdit").value;
    const fardo = document.getElementById("piezaFardoEdit").value || 0;
    const productoEncontrado = buscarProducto(artNvo);

    // if (productoEncontrado) {
    //     // Si el producto existe, detén el escáner y muestra un mensaje
    //     alert(`Producto encontrado en la base de datos, no se puede cambiar: ${artNvo}`);
    //     return; // Sale de la función para que no continúe
    // } 


    if (document.getElementById("articulo").readOnly) {
            try {
                const response = await articuloEdit("UPDATE2", articulo,descripcion,items,"FUNNY",cat1,cat2,precio,precioNormal,precioUnitario,artNvo,fardo);
                console.log("Actualizado:", response); 
                // Lógica para actualizar la fila correspondiente en la tabla
                //updateTableRowVend(id, nombre); // Función para actualizar la fila
                fetchData();
                closeModal();
                
            } catch (error) {
                console.error("Error al actualizar registro:", error.message);
                alert("Error al actualizar ");
            }
       
    }

    
};

async function  saveRegistro3(event) {
    event.preventDefault(); // Evitar recarga de la página
    const id = document.getElementById("id3").value;
    const articulo = document.getElementById("articulo3").value;
   const descripcion = document.getElementById("descripcion3").value;
    const item = document.getElementById("items3").value.trim() === "" ? null: document.getElementById("items3").value.trim();
    //const cantidad = document.getElementById("categoriaEdit").value.charAt(0) || null;;
    const cantidad = document.getElementById("cantidad3").value;
    const sucursal = document.getElementById("sucursal3").value;
    if (document.getElementById("articulo3").readOnly) {
            try {
                const response = await inventarioEdit("UPDATE", id,cantidad,descripcion,item,articulo,sucursal);
                console.log("Actualizado:", response); 
                
                fetchData2();
                closeModal();
                
            } catch (error) {
                console.error("Error al actualizar registro:", error.message);
                alert("Error al actualizar ");
            }
       
    }

    
};
async function  saveRegistroPed(event) {
    event.preventDefault(); // Evitar recarga de la página
    const id = document.getElementById("idPe").value;
    const cantidad = parseFloat(document.getElementById("cantidadPe").value);
    const precio = parseFloat(document.getElementById("precioPe").value);
    const total = parseFloat(document.getElementById("totalPe").value);

let tab =   localStorage.getItem("ventana") || "venta1"

if (tab =="venta1") {
pedidoTabla[id].CANTIDAD=cantidad;
pedidoTabla[id].PRECIO=precio;
pedidoTabla[id].TOTAL=total;
recuperarTabla(pedidoTabla);
localStorage.setItem('pedidoTabla', JSON.stringify(pedidoTabla));

}
if (tab =="venta2") {
    pedidoTabla2[id].CANTIDAD=cantidad;
    pedidoTabla2[id].PRECIO=precio;
    pedidoTabla2[id].TOTAL=total;
    recuperarTabla2(pedidoTabla2);
    localStorage.setItem('pedidoTabla2', JSON.stringify(pedidoTabla2));
}
if (tab =="venta3") {
    pedidoTabla3[id].CANTIDAD=cantidad;
    pedidoTabla3[id].PRECIO=precio;
    pedidoTabla3[id].TOTAL=total;
    recuperarTabla3(pedidoTabla3);
    localStorage.setItem('pedidoTabla3', JSON.stringify(pedidoTabla3));
}



closeModal();

   // const articulo = document.getElementById("articulo2").value;
    //const descripcion = document.getElementById("descripcionEdit").value;
    //const items = document.getElementById("items").value.trim() === "" ? null: document.getElementById("items").value.trim();
    //const cantidad = document.getElementById("categoriaEdit").value.charAt(0) || null;;
    

    
};


function closeModal() {
    const modal= document.getElementById("formulario");
    modal.style.display = "none";
    const modal2= document.getElementById("formulario2");
    modal2.style.display = "none";
    const modal3= document.getElementById("formulario3");
    modal3.style.display = "none";
    const modal4= document.getElementById("formularioPedido");
    modal4.style.display = "none";
    const modal5= document.getElementById("formularioExist");
    modal5.style.display = "none";
    const modal6= document.getElementById("formularioClientes");
    modal6.style.display = "none";
}

function cargarFormulario(registro) {
    // Obtener el registro con el ID correspondiente
        if (registro) {
        // Llenar los campos del formulario con los datos del registro
            document.getElementById("articulo").value = registro.ARTICULO;
            document.getElementById("articuloEdit").value="";
        document.getElementById("descripcionEdit").value = registro.DESCRIPCION;
               // Seleccionar el estado actual del registro
        document.getElementById("items").value = registro.ITEM;
        document.getElementById("categoriaEdit").value = registro.CODIGO;
        document.getElementById("precioEdit").value = registro.PRECIO_MAYOREO;
        document.getElementById("precioNomalEdit").value = registro.PRECIO;
        document.getElementById("precioUnitEdit").value = registro.PRECIO_UNITARIO;
        document.getElementById("piezaFardoEdit").value = registro.UNIDADES_FARDO;

    }
}
function cargarFormulario2(registro) {
    // Obtener el registro con el ID correspondiente
        if (registro) {
        // Llenar los campos del formulario con los datos del registro
        document.getElementById("id3").value = registro.ID;
            document.getElementById("articulo3").value = registro.ARTICULO;
        document.getElementById("descripcion3").value = registro.DESCRIPCION;
               // Seleccionar el estado actual del registro
        document.getElementById("items3").value = registro.ITEM;
        document.getElementById("cantidad3").value = registro.CANTIDAD;
        document.getElementById("sucursal3").value = registro.BODEGA;
    }
}
function cargarFormulario3(registro) {
    const modal = document.getElementById("formulario3");
    modal.style.display = "flex"; // Mostrar el modal
    document.getElementById("filtroInput").value = "";
    
    // IF (empresa ==="MMAG") {


    // } 


    // // Obtener el registro con el ID correspondiente
    //     if (registro) {
    //     // Llenar los campos del formulario con los datos del registro
    //     document.getElementById("id3").value = registro.ID;
    //         document.getElementById("articulo3").value = registro.ARTICULO;
    //     document.getElementById("descripcion3").value = registro.DESCRIPCION;
    //            // Seleccionar el estado actual del registro
    //     document.getElementById("items3").value = registro.ITEM;
    //     document.getElementById("cantidad3").value = registro.CANTIDAD;
    // }
}

function cargarFormularioExist(articulo) {
    const modal = document.getElementById("formularioExist");
    modal.style.display = "flex"; // Mostrar el modal
    fetchDataExist(articulo)//obtener datos endpoint
}
function cargarFormularioClientes(control) {
    const modal = document.getElementById("formularioClientes");
    modal.style.display = "flex"; // Mostrar el modal
    document.getElementById("filtroInputCliente").value =""
    generarTablaDatos(clientesTabla,"contenedorTablaClientes","tablaClientes");

}



function cargarFormulario4(registro,index) {
    const modal = document.getElementById("formularioPedido");
    modal.style.display = "flex"; // Mostrar el modal


    document.getElementById("articuloPe").value = registro.ARTICULO;
    document.getElementById("descripcionPe").value = registro.DESCRIPCION;
    document.getElementById("cantidadPe").value = registro.CANTIDAD;
    document.getElementById("precioPe").value = registro.PRECIO;
    document.getElementById("totalPe").value = registro.TOTAL;
    document.getElementById("idPe").value  = index
}

async function fetchData() {
    try {
        // Llama al endpoint con las fechas como parámetros
        const response = await fetch(url + "selectProductos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
              bd,  empresa
            })
        });

        if (!response.ok) throw new Error('Error al obtener los datos.');
        const data = await response.json();
        if (data && data.length > 0) {
        productos =data
        // Genera la tabla y la inserta en la sección "datos"
      
            generarTabla(data);
            generarTabla5(data);
     

        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}
async function fetchDataPrecios(cliente) {
    try {
        // Llama al endpoint con las fechas como parámetros
        const response = await fetch(url + "selectPrecios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
              bd,  empresa,cliente
            })
        });

        if (!response.ok) throw new Error('Error al obtener los datos.');
        const data = await response.json();
        if (data && data.length > 0) {
         productosTablaPrec =data;
         generarTabla5(productosTablaPrec)
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}


async function fetchData2() {
    try {
        // Llama al endpoint con las fechas como parámetros
        const response = await fetch(url + "selectInventario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
               bd, empresa
            })
        });

        if (!response.ok) throw new Error('Error al obtener los datos.');
        const data = await response.json();
        inventarioTabla =data
        // Genera la tabla y la inserta en la sección "datos"
        generarTabla2(data);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

async function fetchDataExist(articulo) {
    try {
        // Llama al endpoint con las fechas como parámetros
        const response = await fetch(url + "ConsultarExist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bd,empresa,articulo
            })
        });

        if (!response.ok) throw new Error('Error al obtener los datos.');
        const data = await response.json();
     
        if (data.length > 0) generarTablaExist(data); else closeModal();

    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

async function fetchDataClientes() {
    try {
        // Llama al endpoint con las fechas como parámetros
        const response = await fetch(url + "ConsultarClientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bd,empresa
            })
        });

        if (!response.ok) throw new Error('Error al obtener los datos.');
        const data = await response.json();
        return data;
        //clientesTabla = data;
       
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}
async function fetchDataCotizaciones(fi,ff) {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    
    try {
        // Llama al endpoint con las fechas como parámetros
        const response = await fetch(url + "ConsultarCotizaciones", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bd,empresa,fi,ff,vendedor:session.vend || ""
            })
        });

        if (!response.ok) throw new Error('Error al obtener los datos.');
        const data = await response.json();
        return data;
          
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Hacer la función accesible globalmente
window.buscarProducto = buscarProducto;