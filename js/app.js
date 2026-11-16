/* ===== Interacciones del mockup. Cada bloque solo actúa si el elemento existe en la página ===== */

/* ---------- Utilidades ---------- */
function pesos(n){ return '$' + n.toLocaleString('es-CL'); }
function el(id){ return document.getElementById(id); }

/* El carrito se guarda en el navegador (localStorage), así sigue ahí al cambiar de página.
   En el sistema real esto vivirá en la base de datos. */
var CLAVE = 'somos-carrito';
function leerCarrito(){
  try { return JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { return null; }
}
function guardarCarrito(item){
  try { localStorage.setItem(CLAVE, JSON.stringify(item)); } catch (e) {}
}
function borrarCarrito(){
  try { localStorage.removeItem(CLAVE); } catch (e) {}
}
function actualizarContador(){
  var n = el('n-carrito');
  if (n) n.textContent = leerCarrito() ? 1 : 0;
}

/* Marca un solo botón del grupo como activo (días y horas) */
function activarUno(botones, elegido){
  botones.forEach(function(b){ b.classList.remove('activo'); });
  elegido.classList.add('activo');
}

/* ---------- index.html: filtros ---------- */
var btnAplicar = el('aplicar');
if (btnAplicar) {
  var rango = el('precio');
  var textoPrecio = el('precio-valor');

  // El número del precio máximo cambia mientras mueves la barra
  rango.addEventListener('input', function(){ textoPrecio.textContent = pesos(+rango.value); });

  function marcados(clase){
    return Array.prototype.map.call(document.querySelectorAll(clase + ':checked'), function(c){ return c.value; });
  }

  function aplicarFiltros(){
    var texto = el('buscar').value.trim().toLowerCase();
    var region = el('region').value;
    var tipos = marcados('.f-tipo');
    var mods = marcados('.f-mod');
    var max = +rango.value;
    var visibles = 0;

    document.querySelectorAll('.profesional').forEach(function(t){
      var d = t.dataset;
      var okTexto = (d.nombre + ' ' + d.esp).toLowerCase().indexOf(texto) > -1;
      var okRegion = region === 'Todas' || d.region === region;
      var okTipo = tipos.length === 0 || tipos.indexOf(d.esp) > -1;
      var okMod = mods.length === 0 || d.mod.split(',').some(function(m){ return mods.indexOf(m) > -1; });
      var okPrecio = +d.precio <= max;
      var ok = okTexto && okRegion && okTipo && okMod && okPrecio;
      t.classList.toggle('d-none', !ok);
      if (ok) visibles++;
    });

    el('contador').textContent = visibles + (visibles === 1 ? ' profesional' : ' profesionales');
    el('sin-resultados').classList.toggle('d-none', visibles !== 0);
  }

  btnAplicar.addEventListener('click', aplicarFiltros);
  el('buscar').addEventListener('keydown', function(e){ if (e.key === 'Enter') aplicarFiltros(); });
  el('limpiar').addEventListener('click', function(){
    el('buscar').value = '';
    el('region').value = 'Todas';
    document.querySelectorAll('.f-tipo, .f-mod').forEach(function(c){ c.checked = false; });
    rango.value = rango.max;
    textoPrecio.textContent = pesos(+rango.max);
    aplicarFiltros();
  });
}

/* ---------- perfil.html: elegir servicio, día y hora, y agregar al carrito ---------- */
var servicios = document.querySelectorAll('.servicio');
var servicioElegido = servicios.length ? servicios[0] : null;
servicios.forEach(function(b){
  b.addEventListener('click', function(){
    servicioElegido = b;
    servicios.forEach(function(x){
      var activo = (x === b);
      x.className = (activo ? 'btn btn-somos' : 'btn btn-somos-borde') + ' btn-sm servicio';
      x.textContent = activo ? 'Elegido' : 'Elegir';
    });
    el('resumen-servicio').textContent = b.dataset.nombre + ' · ' + pesos(+b.dataset.precio);
  });
});

var dias = document.querySelectorAll('.dia');
var horas = document.querySelectorAll('.hora');
dias.forEach(function(b){ b.addEventListener('click', function(){ activarUno(dias, b); }); });
horas.forEach(function(b){ b.addEventListener('click', function(){ activarUno(horas, b); }); });

var agregar = el('agregar');
if (agregar) {
  agregar.addEventListener('click', function(){
    var dia = document.querySelector('.dia.activo');
    var hora = document.querySelector('.hora.activo');
    if (!dia || !hora) { el('aviso').classList.add('visible'); return; }
    var pagina = document.querySelector('main');
    guardarCarrito({
      servicio: servicioElegido.dataset.nombre,
      precio: +servicioElegido.dataset.precio,
      modalidad: servicioElegido.dataset.modalidad,
      profesional: pagina.dataset.profesional,
      especialidad: pagina.dataset.especialidad,
      fecha: dia.textContent + ' de noviembre, ' + hora.textContent + ' hrs'
    });
    window.location.href = 'carrito.html';
  });
}

/* ---------- carrito.html: mostrar lo guardado, quitarlo y exigir los términos ---------- */
if (el('carrito-lleno')) {
  function dibujarCarrito(){
    var item = leerCarrito();
    el('carrito-vacio').classList.toggle('d-none', !!item);
    el('carrito-lleno').classList.toggle('d-none', !item);
    if (!item) return;
    el('c-servicio').textContent = item.servicio;
    el('c-detalle').textContent = item.profesional + ' · ' + item.especialidad;
    el('c-fecha').textContent = item.fecha;
    el('c-modalidad').textContent = item.modalidad;
    el('c-precio').textContent = pesos(item.precio);
    el('r-valor').textContent = pesos(item.precio);
    el('r-total').textContent = pesos(item.precio) + ' + $X';
  }
  dibujarCarrito();

  el('quitar').addEventListener('click', function(){
    borrarCarrito();
    dibujarCarrito();
    actualizarContador();
  });
  el('ir-pagar').addEventListener('click', function(){
    if (!el('terminos').checked) { el('aviso').classList.add('visible'); return; }
    window.location.href = 'pago.html';
  });
}

/* ---------- pago.html: resumen del carrito y datos según el tipo de cliente ---------- */
if (el('pagar')) {
  var itemPago = leerCarrito();
  if (!itemPago) {
    window.location.href = 'carrito.html';   // sin carrito no hay nada que pagar
  } else {
    el('p-detalle').innerHTML = itemPago.servicio + '<br>' + itemPago.profesional + '<br>' + itemPago.fecha;
    el('p-total').textContent = pesos(itemPago.precio);
    el('p-boton').textContent = pesos(itemPago.precio);
  }

  var tipo = el('tipo-cliente');
  tipo.addEventListener('change', function(){
    var v = tipo.value;
    el('etiqueta-rut').textContent =
      v === 'empresa' ? 'RUT de la empresa' : v === 'institucion' ? 'RUT institucional (para rendir fondos)' : 'RUT (RUN) de la persona';
    el('documento').textContent = v === 'persona' ? 'Documento: Boleta' : 'Documento: Factura';
  });
  el('pagar').addEventListener('click', function(){
    if (!el('rut').value.trim() || !el('nombre').value.trim()) { el('aviso').classList.add('visible'); return; }
    window.location.href = 'confirmado.html';
  });
}

/* ---------- confirmado.html: el pago se hizo, así que el carrito se vacía ---------- */
if (el('pago-confirmado')) { borrarCarrito(); }

/* ---------- calificar.html: estrellas y envío ---------- */
var estrellas = document.querySelectorAll('.estrella');
var nota = 0;
estrellas.forEach(function(e, i){
  e.addEventListener('click', function(){
    nota = i + 1;
    estrellas.forEach(function(x, j){ x.classList.toggle('activo', j < nota); });
  });
});
var enviar = el('enviar');
if (enviar) {
  enviar.addEventListener('click', function(){
    var texto = el('comentario').value.trim();
    if (!nota || !texto) { el('aviso').classList.add('visible'); el('gracias').classList.remove('visible'); return; }
    el('aviso').classList.remove('visible'); el('gracias').classList.add('visible');
  });
}

actualizarContador();
