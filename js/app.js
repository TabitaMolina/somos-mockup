/* ===== Interacciones del mockup (versión con sessionStorage) =====
   sessionStorage guarda datos en el navegador mientras la pestaña está abierta:
   - somos-carrito : lo que el cliente va a comprar
   - somos-reserva : la reserva ya pagada (y su reclamo, si lo hay)
   En el sistema real esto vivirá en la base de datos. */
(function () {
  function el(id) { return document.getElementById(id); }
  function pesos(n) { return '$' + parseInt(n, 10).toLocaleString('es-CL'); }

  var K_CARRITO = 'somos-carrito';
  var K_RESERVA = 'somos-reserva';

  // Lectura y escritura seguras (si el navegador bloquea el almacenamiento, no se rompe la página)
  function leer(clave) {
    try { return JSON.parse(sessionStorage.getItem(clave)); } catch (e) { return null; }
  }
  function guardar(clave, valor) {
    try { sessionStorage.setItem(clave, JSON.stringify(valor)); } catch (e) {}
  }
  function borrar(clave) {
    try { sessionStorage.removeItem(clave); } catch (e) {}
  }
  function fechaTexto(x) { return x.dia + ' a las ' + x.hora + ' hrs'; }
  function actualizarContador() {
    var n = el('n-carrito');
    if (n) n.textContent = leer(K_CARRITO) ? '1' : '0';
  }

  /* ---------- 1. PERFIL: guardar la selección en el carrito ---------- */
  if (el('agregar')) {
    el('agregar').addEventListener('click', function () {
      var dia = document.querySelector('.dia.activo');
      var hora = document.querySelector('.hora.activo');
      var partes = el('resumen-servicio').textContent.split(' · ');   // "Corte y peinado · $18.000"

      if (!dia || !hora || partes.length < 2) {                       // falta servicio, día u hora
        el('aviso').classList.add('visible');
        return;
      }
      guardar(K_CARRITO, {
        profesional: el('pro-nombre').textContent,
        servicio: partes[0],
        precio: parseInt(partes[1].replace('$', '').replace(/\./g, ''), 10),
        dia: dia.textContent,
        hora: hora.textContent
      });
      window.location.href = 'carrito.html';
    });
  }

  /* ---------- 2. CARRITO: mostrar, quitar y pasar a pago ---------- */
  if (el('carrito-lleno')) {
    function dibujarCarrito() {
      var c = leer(K_CARRITO);
      el('carrito-vacio').classList.toggle('d-none', !!c);
      el('carrito-lleno').classList.toggle('d-none', !c);
      if (!c) return;
      el('c-servicio').textContent = c.servicio;
      el('c-detalle').textContent = c.profesional;
      el('c-fecha').textContent = fechaTexto(c);
      el('c-precio').textContent = pesos(c.precio);
      el('r-valor').textContent = pesos(c.precio);
      el('r-total').textContent = pesos(c.precio) + ' + $X';
    }
    dibujarCarrito();

    el('quitar').addEventListener('click', function () {
      borrar(K_CARRITO);
      dibujarCarrito();
      actualizarContador();
    });
    el('ir-pagar-btn').addEventListener('click', function () {
      if (!el('terminos').checked) { el('aviso').classList.add('visible'); return; }
      window.location.href = 'pago.html';
    });
  }

  /* ---------- 3. PAGO: resumen, tipo de cliente y creación de la reserva ---------- */
  if (el('pagar')) {
    var carrito = leer(K_CARRITO);
    if (!carrito) {
      window.location.href = 'carrito.html';        // sin carrito no hay nada que pagar
    } else {
      el('p-detalle').textContent = carrito.servicio + ' · ' + carrito.profesional + ' · ' + fechaTexto(carrito);
      el('p-total').textContent = pesos(carrito.precio) + ' + $X';
      el('pagar').textContent = 'Pagar ' + pesos(carrito.precio) + ' + $X';
    }

    var tipo = el('tipo-cliente');
    function actualizarTipo() {
      var v = tipo.value;
      el('etiqueta-rut').textContent =
        v === 'empresa' ? 'RUT de la empresa' :
        v === 'institucion' ? 'RUT institucional (para rendir fondos)' : 'RUT (RUN) de la persona';
      el('documento').textContent = v === 'persona' ? 'Documento: Boleta' : 'Documento: Factura';
    }
    tipo.addEventListener('change', actualizarTipo);
    actualizarTipo();

    el('pagar').addEventListener('click', function () {
      if (!carrito) return;
      if (!el('rut').value.trim() || !el('nombre').value.trim()) {
        el('aviso').classList.add('visible');
        return;
      }
      // El pago crea la reserva y vacía el carrito. El RUT no se guarda en ningún lado.
      guardar(K_RESERVA, {
        profesional: carrito.profesional, servicio: carrito.servicio, precio: carrito.precio,
        dia: carrito.dia, hora: carrito.hora, tipoCliente: tipo.value, reclamo: null
      });
      borrar(K_CARRITO);
      window.location.href = 'confirmado.html';
    });
  }

  /* ---------- 4. MI RESERVA: estado, simulación y reclamo ---------- */
  if (el('estado-vacio')) {
    function dibujarEstado() {
      var r = leer(K_RESERVA);
      el('estado-vacio').classList.toggle('d-none', !!r);
      el('reserva-activa').classList.toggle('d-none', !r);
      if (!r) return;
      el('r-servicio').textContent = r.servicio;
      el('r-pro').textContent = r.profesional;
      el('r-fecha').textContent = fechaTexto(r);

      var info = el('info-reclamo');
      var form = el('form-reclamo');
      form.classList.toggle('d-none', !!r.reclamo);
      info.classList.toggle('d-none', !r.reclamo);
      if (r.reclamo) {
        info.textContent = r.reclamo.estado === 'reembolsado'
          ? 'Reclamo resuelto: Administración reembolsó ' + pesos(r.precio) + '. El dinero vuelve a tu medio de pago.'
          : 'Reclamo en revisión: Administración está revisando tu caso. El pago sigue retenido.';
      }
    }
    dibujarEstado();

    el('btn-simular').addEventListener('click', function () {
      guardar(K_RESERVA, { profesional: 'Camila Rojas', servicio: 'Corte y peinado', precio: 18000,
                           dia: 'Mié 18', hora: '15:00', tipoCliente: 'persona', reclamo: null });
      dibujarEstado();
    });

    el('btn-reclamo').addEventListener('click', function () {
      var motivo = el('motivo').value.trim();
      if (!motivo) { alert('Por favor, cuéntanos qué pasó antes de enviar el reclamo.'); return; }
      var r = leer(K_RESERVA);
      if (!r) return;
      r.reclamo = { motivo: motivo, estado: 'revision' };
      guardar(K_RESERVA, r);
      alert('Reclamo enviado con éxito.');
      window.location.href = 'admin.html';
    });
  }

  /* ---------- 5. ADMINISTRACIÓN: reclamos, fondos en garantía y validación ---------- */
  if (el('tabla-reclamos')) {
    var filaVacia = el('fila-vacia');
    var textoEscrowOriginal = el('texto-escrow').textContent;

    function celda(texto, clase) {
      var td = document.createElement('td');
      td.textContent = texto;                         // textContent: nunca innerHTML con datos del usuario
      if (clase) td.className = clase;
      return td;
    }

    function dibujarAdmin() {
      var r = leer(K_RESERVA);
      var rec = r && r.reclamo;
      var abierto = !!(rec && rec.estado === 'revision');
      el('contador-reclamos').textContent = abierto ? '1' : '0';

      if (rec) {
        var estado = document.createElement('span');
        estado.className = abierto ? 'badge bg-warning text-dark' : 'badge bg-success';
        estado.textContent = abierto ? 'En revisión' : 'Reembolsado';
        var tdEstado = document.createElement('td');
        tdEstado.appendChild(estado);

        var tdAccion = document.createElement('td');
        if (abierto) {
          var boton = document.createElement('button');
          boton.className = 'btn btn-somos btn-sm';
          boton.type = 'button';
          boton.textContent = 'Reembolsar';
          boton.addEventListener('click', function () {
            r.reclamo.estado = 'reembolsado';
            guardar(K_RESERVA, r);
            dibujarAdmin();
          });
          tdAccion.appendChild(boton);
        }

        var fila = document.createElement('tr');
        fila.appendChild(celda('#00001'));
        fila.appendChild(celda('"' + rec.motivo + '"', 'text-danger fw-bold'));
        fila.appendChild(celda(r.profesional));
        fila.appendChild(celda(pesos(r.precio)));
        fila.appendChild(tdEstado);
        fila.appendChild(tdAccion);
        el('tabla-reclamos').replaceChildren(fila);
      } else {
        el('tabla-reclamos').replaceChildren(filaVacia);
      }

      var escrow = el('texto-escrow');
      if (!r) escrow.textContent = textoEscrowOriginal;
      else if (!rec) escrow.textContent = 'Retenido: ' + pesos(r.precio) + ' (' + r.servicio + ' · ' + r.profesional + '). Se libera al profesional cuando el servicio se finalice.';
      else if (abierto) escrow.textContent = 'En disputa: ' + pesos(r.precio) + ' retenido mientras se resuelve el reclamo.';
      else escrow.textContent = 'Reembolso de ' + pesos(r.precio) + ' procesado: el dinero retenido volvió al cliente.';
    }
    dibujarAdmin();

    // Validación de profesionales
    document.querySelectorAll('.pro-fila').forEach(function (fila) {
      function resolver(texto) {
        fila.querySelector('.pro-estado').textContent = texto;
        fila.querySelector('.btn-aprobar').remove();
        fila.querySelector('.btn-rechazar').remove();
      }
      fila.querySelector('.btn-aprobar').addEventListener('click', function () { resolver('Aprobado'); });
      fila.querySelector('.btn-rechazar').addEventListener('click', function () { resolver('Rechazado'); });
    });
  }

  /* ---------- 6. CALIFICAR: estrellas y envío ---------- */
  var estrellas = document.querySelectorAll('.estrella');
  var nota = 0;
  estrellas.forEach(function (e, i) {
    e.addEventListener('click', function () {
      nota = i + 1;
      estrellas.forEach(function (x, j) { x.classList.toggle('activo', j < nota); });
    });
  });
  if (el('enviar')) {
    el('enviar').addEventListener('click', function () {
      if (!nota || !el('comentario').value.trim()) {
        el('aviso').classList.add('visible');
        el('gracias').classList.remove('visible');
        return;
      }
      el('aviso').classList.remove('visible');
      el('gracias').classList.add('visible');
    });
  }

  /* ---------- 7. BUSCADOR: filtros con botón ---------- */
  if (el('contenedor-profesionales')) {
    var rango = el('precio');
    rango.addEventListener('input', function () { el('precio-valor').textContent = pesos(rango.value); });

    function marcados(clase) {
      return Array.from(document.querySelectorAll(clase + ':checked')).map(function (c) { return c.value; });
    }
    function aplicarFiltros() {
      var texto = el('buscar').value.trim().toLowerCase();
      var region = el('region').value;
      var tipos = marcados('.f-tipo');
      var mods = marcados('.f-mod');
      var max = parseInt(rango.value, 10);
      var visibles = 0;

      document.querySelectorAll('.profesional').forEach(function (t) {
        var d = t.dataset;
        var ok =
          (d.nombre + ' ' + d.tipo).toLowerCase().indexOf(texto) > -1 &&
          (region === 'Todas' || d.region === region) &&
          parseInt(d.precio, 10) <= max &&
          (tipos.length === 0 || tipos.indexOf(d.tipo) > -1) &&
          (mods.length === 0 || mods.some(function (m) { return d.mod.indexOf(m) > -1; }));
        t.classList.toggle('d-none', !ok);
        if (ok) visibles++;
      });
      el('contador').textContent = visibles + (visibles === 1 ? ' profesional' : ' profesionales');
      el('sin-resultados').classList.toggle('d-none', visibles !== 0);
    }
    el('aplicar').addEventListener('click', aplicarFiltros);
    el('buscar').addEventListener('keydown', function (e) { if (e.key === 'Enter') aplicarFiltros(); });
    el('limpiar').addEventListener('click', function () {
      el('buscar').value = '';
      el('region').value = 'Todas';
      document.querySelectorAll('.f-tipo, .f-mod').forEach(function (c) { c.checked = false; });
      rango.value = 90000;
      el('precio-valor').textContent = '$90.000';
      aplicarFiltros();
    });
  }

  actualizarContador();
})();
