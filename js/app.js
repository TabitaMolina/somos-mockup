/* ===== Interacciones del mockup - VERSIÓN FINAL COMPLETA ===== */

function activarUno(botones, elegido){
  botones.forEach(function(b){ b.classList.remove('activo'); });
  elegido.classList.add('activo');
}

var servicioElegido = "Servicio Principal";
var precioElegido = "18000";

// 1. PERFIL: Selección de Servicio, Día y Hora
var botonesServicio = document.querySelectorAll('.servicio');
if (botonesServicio.length > 0) {
    botonesServicio.forEach(function(btn) {
        btn.addEventListener('click', function() {
            botonesServicio.forEach(function(b) {
                b.classList.remove('btn-somos');
                b.classList.add('btn-somos-borde');
                b.innerText = 'Elegir';
            });
            this.classList.remove('btn-somos-borde');
            this.classList.add('btn-somos');
            this.innerText = 'Elegido';

            servicioElegido = this.getAttribute('data-nombre');
            precioElegido = this.getAttribute('data-precio');
            document.getElementById('resumen-servicio').innerText = servicioElegido + ' · $' + parseInt(precioElegido).toLocaleString('es-CL');
        });
    });
}

var dias = document.querySelectorAll('.dia');
var horas = document.querySelectorAll('.hora');
dias.forEach(function(b){ b.addEventListener('click', function(){ activarUno(dias, b); }); });
horas.forEach(function(b){ b.addEventListener('click', function(){ activarUno(horas, b); }); });

var agregar = document.getElementById('agregar');
if (agregar) {
  agregar.addEventListener('click', function(){
    var hayDia = document.querySelector('.dia.activo');
    var hayHora = document.querySelector('.hora.activo');
    
    if (!hayDia || !hayHora) { 
        document.getElementById('aviso').classList.add('visible'); 
        return; 
    }
    
    var proNombre = document.getElementById('pro-nombre').innerText;
    // Leemos el texto del resumen para obtener el servicio y precio exacto
    var resumenTxt = document.getElementById('resumen-servicio').innerText;
    var partes = resumenTxt.split(' · ');
    var nombreServicio = partes[0];
    
    // Limpiamos el texto del precio (quitamos el $ y los puntos)
    var precioTexto = partes[1].replace('$', '').replace(/\./g, '');
    
    window.location.href = 'carrito.html?pro=' + encodeURIComponent(proNombre) + 
                           '&servicio=' + encodeURIComponent(nombreServicio) + 
                           '&precio=' + precioTexto + 
                           '&dia=' + encodeURIComponent(hayDia.innerText) + 
                           '&hora=' + encodeURIComponent(hayHora.innerText);
  });
}

// 2. CARRITO: Leer datos y pasar a pago
var carritoLleno = document.getElementById('carrito-lleno');
if (carritoLleno) {
    var urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('servicio')) {
        document.getElementById('carrito-vacio').classList.add('d-none');
        document.getElementById('carrito-lleno').classList.remove('d-none');
        document.getElementById('n-carrito').innerText = '1';
        
        var precioNum = parseInt(urlParams.get('precio'));
        var precioFormateado = '$' + precioNum.toLocaleString('es-CL');
        
        document.getElementById('c-servicio').innerText = urlParams.get('servicio');
        document.getElementById('c-detalle').innerText = urlParams.get('pro');
        document.getElementById('c-fecha').innerText = urlParams.get('dia') + ' a las ' + urlParams.get('hora') + ' hrs';
        document.getElementById('c-precio').innerText = precioFormateado;
        document.getElementById('r-valor').innerText = precioFormateado;
        document.getElementById('r-total').innerText = precioFormateado + ' + $X';
    } else {
        document.getElementById('carrito-vacio').classList.remove('d-none');
        document.getElementById('carrito-lleno').classList.add('d-none');
    }

    var btnPagar = document.getElementById('ir-pagar-btn');
    if (btnPagar) {
        btnPagar.addEventListener('click', function(){
            if (!document.getElementById('terminos').checked) {
                document.getElementById('aviso').classList.add('visible');
                return;
            }
            window.location.href = 'pago.html?' + urlParams.toString();
        });
    }
}

// 3. PAGO: Cambio de cliente y pasar a confirmación
var tipo = document.getElementById('tipo-cliente');
if (tipo) {
  tipo.dispatchEvent(new Event('change')); 
  tipo.addEventListener('change', function(){
    var v = tipo.value;
    document.getElementById('etiqueta-rut').textContent =
      v === 'empresa' ? 'RUT de la empresa' : v === 'institucion' ? 'RUT institucional (para rendir fondos)' : 'RUT (RUN) de la persona';
    document.getElementById('documento').textContent = v === 'persona' ? 'Documento: Boleta' : 'Documento: Factura';
  });
}

var pagar = document.getElementById('pagar');
if (pagar) {
  pagar.addEventListener('click', function(){
    var rut = document.getElementById('rut').value.trim();
    var nombre = document.getElementById('nombre').value.trim();
    if (!rut || !nombre) { 
        document.getElementById('aviso').classList.add('visible'); 
        return; 
    }
    var currentParams = new URLSearchParams(window.location.search);
    currentParams.set('reserva', 'true');
    window.location.href = 'confirmado.html?' + currentParams.toString();
  });
}

// 4. CALIFICAR
var estrellas = document.querySelectorAll('.estrella');
var nota = 0;
estrellas.forEach(function(e, i){
  e.addEventListener('click', function(){
    nota = i + 1;
    estrellas.forEach(function(x, j){ 
        x.classList.toggle('activo', j < nota); 
    });
  });
});

var enviar = document.getElementById('enviar');
if (enviar) {
  enviar.addEventListener('click', function(){
    var texto = document.getElementById('comentario').value.trim();
    var error = document.getElementById('aviso');
    var gracias = document.getElementById('gracias');
    
    if (!nota || !texto) { 
        error.classList.add('visible'); 
        gracias.classList.remove('visible'); 
        return; 
    }
    error.classList.remove('visible'); 
    gracias.classList.add('visible'); 
  });
}

// 5. INDEX: SISTEMA DE FILTROS (¡NUEVO!)
var contenedorPro = document.getElementById('contenedor-profesionales');
if (contenedorPro) {
    var aplicarBtn = document.getElementById('aplicar');
    var limpiarBtn = document.getElementById('limpiar');
    var precioRange = document.getElementById('precio');
    var precioValor = document.getElementById('precio-valor');

    // Actualizar el texto del precio cuando se mueve el slider
    precioRange.addEventListener('input', function(){
        precioValor.innerText = '$' + parseInt(this.value).toLocaleString('es-CL');
    });

    aplicarBtn.addEventListener('click', function(){
        var buscarTxt = document.getElementById('buscar').value.toLowerCase();
        var regionSel = document.getElementById('region').value;
        var maxPrecio = parseInt(precioRange.value);
        
        // Obtener checkboxes marcados
        var tiposMarcados = Array.from(document.querySelectorAll('.f-tipo:checked')).map(cb => cb.value);
        var modsMarcadas = Array.from(document.querySelectorAll('.f-mod:checked')).map(cb => cb.value);

        var tarjetas = document.querySelectorAll('.profesional');
        var visibles = 0;

        tarjetas.forEach(function(tarjeta) {
            var nombre = tarjeta.getAttribute('data-nombre').toLowerCase();
            var region = tarjeta.getAttribute('data-region');
            var tipo = tarjeta.getAttribute('data-tipo');
            var mod = tarjeta.getAttribute('data-mod');
            var precio = parseInt(tarjeta.getAttribute('data-precio'));

            // Lógica de filtrado (deben cumplirse TODAS las condiciones)
            var cumpleBusqueda = nombre.includes(buscarTxt) || tipo.toLowerCase().includes(buscarTxt);
            var cumpleRegion = (regionSel === 'Todas') || (region === regionSel);
            var cumplePrecio = (precio <= maxPrecio);
            
            // Si no hay checkboxes marcados, pasa. Si hay, debe coincidir con al menos uno.
            var cumpleTipo = (tiposMarcados.length === 0) || tiposMarcados.some(t => tipo.includes(t));
            var cumpleMod = (modsMarcadas.length === 0) || modsMarcadas.some(m => mod.includes(m));

            if (cumpleBusqueda && cumpleRegion && cumplePrecio && cumpleTipo && cumpleMod) {
                tarjeta.classList.remove('d-none');
                visibles++;
            } else {
                tarjeta.classList.add('d-none');
            }
        });

        // Actualizar contador y mensaje vacío
        document.getElementById('contador').innerText = visibles + (visibles === 1 ? ' profesional' : ' profesionales');
        if (visibles === 0) {
            document.getElementById('sin-resultados').classList.remove('d-none');
        } else {
            document.getElementById('sin-resultados').classList.add('d-none');
        }
    });

    limpiarBtn.addEventListener('click', function(){
        document.getElementById('buscar').value = '';
        document.getElementById('region').value = 'Todas';
        document.querySelectorAll('.f-tipo, .f-mod').forEach(cb => cb.checked = false);
        precioRange.value = 90000;
        precioValor.innerText = '$90.000';
        
        // Mostrar todas las tarjetas de nuevo
        document.querySelectorAll('.profesional').forEach(t => t.classList.remove('d-none'));
        document.getElementById('contador').innerText = '6 profesionales';
        document.getElementById('sin-resultados').classList.add('d-none');
    });
}