/* ===== Interacciones del mockup. Cada bloque solo actúa si el elemento existe en la página ===== */

// Marca un solo botón del grupo como activo (días y horas)
function activarUno(botones, elegido){
  botones.forEach(function(b){ b.classList.remove('activo'); });
  elegido.classList.add('activo');
}

// --- perfil.html: elegir día y hora, y agregar al carrito ---
var dias = document.querySelectorAll('.dia');
var horas = document.querySelectorAll('.hora');
dias.forEach(function(b){ b.addEventListener('click', function(){ activarUno(dias, b); }); });
horas.forEach(function(b){ b.addEventListener('click', function(){ activarUno(horas, b); }); });
var agregar = document.getElementById('agregar');
if (agregar) {
  agregar.addEventListener('click', function(){
    var hayDia = document.querySelector('.dia.activo');
    var hayHora = document.querySelector('.hora.activo');
    if (!hayDia || !hayHora) { document.getElementById('aviso').classList.add('visible'); return; }
    window.location.href = 'carrito.html';
  });
}

// --- carrito.html: exigir la casilla de términos antes de pagar ---
var irPagar = document.getElementById('ir-pagar');
if (irPagar) {
  irPagar.addEventListener('click', function(){
    if (!document.getElementById('terminos').checked) { document.getElementById('aviso').classList.add('visible'); return; }
    window.location.href = 'pago.html';
  });
}

// --- pago.html: cambiar los datos pedidos según el tipo de cliente ---
var tipo = document.getElementById('tipo-cliente');
if (tipo) {
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
    if (!rut || !nombre) { document.getElementById('aviso').classList.add('visible'); return; }
    window.location.href = 'confirmado.html';
  });
}

// --- calificar.html: estrellas y envío ---
var estrellas = document.querySelectorAll('.estrella');
var nota = 0;
estrellas.forEach(function(e, i){
  e.addEventListener('click', function(){
    nota = i + 1;
    estrellas.forEach(function(x, j){ x.classList.toggle('activo', j < nota); });
  });
});
var enviar = document.getElementById('enviar');
if (enviar) {
  enviar.addEventListener('click', function(){
    var texto = document.getElementById('comentario').value.trim();
    var error = document.getElementById('aviso');
    var gracias = document.getElementById('gracias');
    if (!nota || !texto) { error.classList.add('visible'); gracias.classList.remove('visible'); return; }
    error.classList.remove('visible'); gracias.classList.add('visible');
  });
}
