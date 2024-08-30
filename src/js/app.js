import Swal from 'sweetalert2';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

(function () {
    if (document.querySelector(".alertas")) {
        const alertasContainer = document.querySelector(".alertas");
        const alertas = document.querySelectorAll(".alerta");

        alertasContainer.style.height = `${alertasContainer.scrollHeight}px`; // Altura que tiene el contenedor con las alertas visibles

        alertas.forEach(alerta => {
            alerta.classList.add("translate-y-0");

            setTimeout(() => {
                alerta.classList.remove("-translate-y-20");

                setTimeout(() => {
                    alerta.classList.add("-translate-y-20");
                    alerta.classList.add("opacity-0");

                    setTimeout(() => {
                        alerta.classList.remove("opacity-100");
                        alerta.classList.remove("translate-y-0");


                        setTimeout(() => {
                            alerta.style.display = 'none';

                            alertasContainer.style.height = '0px'; // Regreso el contenedor a su altura original
                        }, 500);
                    }, 10);
                }, 2000);
            }, 10);
        });
    }

    if (document.querySelector("#deleteButton")) {
        const deleteButtons = document.querySelectorAll("#deleteButton");

        deleteButtons.forEach(deleteButton => {
            deleteButton.addEventListener("click", (e) => {
                e.preventDefault();

                Swal.fire({
                    title: "¿Estás seguro?",
                    text: "Esta acción no se puede deshacer",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar",
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Obtener el grupoId del atributo href del elemento
                        const grupoId = deleteButton.dataset.grupoid;

                        console.log(grupoId);
        
                        // Hacer la petición POST a la ruta /editar-grupo/:grupoId
                        fetch(`/eliminar-grupo/${grupoId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ _method: 'DELETE' }) // Enviar un cuerpo si es necesario
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                Swal.fire('Eliminado!', 'El grupo ha sido eliminado.', 'success')
                                .then(() => {
                                    // Redirigir o actualizar la página
                                    window.location.reload();
                                });
                            } else {
                                Swal.fire('Error!', 'Hubo un problema al eliminar el grupo.', 'error');
                            }
                        })
                        .catch(error => {
                            Swal.fire('Error!', 'Hubo un problema al eliminar el grupo.', 'error');
                        });
                    }
                })
            });
        });
    }

    if (document.querySelector(".mapa")) {
        const lat = -34.599553;
        const long = -58.503610;
        const map = L.map('mapa').setView([lat, long], 15);
        let markers = new L.FeatureGroup().addTo(map); // Para agrupar los markers
        let marker; 


        document.addEventListener("DOMContentLoaded", (e) => {
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Buscar la direccion
            const buscador = document.querySelector("#formbuscador");
            buscador.addEventListener("input", buscarDireccion);
            
        })

        function buscarDireccion(e) {
            if (e.target.value.length > 8) {
                // Si existe un pin anterior, limpiarlo
                markers.clearLayers(); // Limpiar los markers

                // Utilizar el provider (tiene los metodos de busqueda en la API de openstreetmap) y geocoder
                const geocodeServide = L.esri.Geocoding.geocodeService();
                const provider = new OpenStreetMapProvider();
                provider.search({
                    query: e.target.value
                })
                .then((resultado) => {

                    // Si hay resultados mostrar el mapa y el pin, sino mostrar el mapa en la ubicacion inicial
                    if (resultado.length !== 0) {
                        geocodeServide.reverse().latlng(resultado[0].bounds[0], 15).run(function (error, result) {
                            llenarInputs(result);

                            // Mostrar el mapa
                            console.log(result);
                            map.setView(resultado[0].bounds[0], 15);

                            // Agregar el pin
                            marker = new L.marker(resultado[0].bounds[0], {
                                draggable: true, // Permitir mover el pin
                                autoPan: true // Mover el mapa para que el pin quede visible
                            }).addTo(map).bindPopup(resultado[0].label).openPopup();

                            // Asignar el contenedor de markers
                            markers.addLayer(marker);

                            // Detectar movimiento del pin
                            marker.on("moveend", (e) => {
                                marker = e.target;
                                const posicion = marker.getLatLng();

                                map.panTo(new L.LatLng(posicion.lat, posicion.lng)); // Centrar la vista del mapa en la nueva posicion

                                // Reverse geocoding, cuando el usuario reubica el pin
                                geocodeServide.reverse().latlng(posicion, 15).run(function (error, result) {
                                    console.log(result);
                                    llenarInputs(result);

                                    console.log(result);

                                    // Asigna los valores del popup al marker
                                    marker.bindPopup(result.address.LongLabel);
                                });
                            });
                        })
                    }

                    map.panTo(new L.LatLng(lat, long)); 
                    return;
                })
            }
        }
    }

    function llenarInputs(resultado) {
        document.querySelector("#direccion").value = resultado.address.LongLabel || "";
        document.querySelector("#ciudad").value = resultado.address.City || "";
        document.querySelector("#estado").value = resultado.address.Region || "";
        document.querySelector("#pais").value = resultado.address.CntryName || "";
        document.querySelector("#lat").value = resultado.latlng.lat || "";
        document.querySelector("#lng").value = resultado.latlng.lng || "";
    }
})();