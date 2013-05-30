var canvas, nodosCanvas;

$(document).ready(function () {
    //crear dos DFA y dos NFA que sirvan de ejemplos
    var nombre1 = "Acepta 3 a";
    var estados1 = ["q0", "q1", "q2", "q3"];
    var simbolos1 = ["a", "b"];
    var transiciones1 = [
		["q0", "a", "q1"],
		["q0", "b", "q0"],
		["q1", "a", "q2"],
		["q1", "b", "q1"],
		["q2", "a", "q3"],
		["q2", "b", "q2"],
		["q3", "a", "q3"],
		["q3", "b", "q3"]
    ];
    var estadoInicial1 = "q0";
    var estadosFinales1 = ["q3"];

    listaDeDFA[nombre1] = new DFA(nombre1, estados1, simbolos1, transiciones1, estadoInicial1, estadosFinales1);

    var nombre2 = "Acepta por lo menos 2 b";
    var estados2 = ["p0", "p1", "p2"];
    var simbolos2 = ["a", "b"];
    var transiciones2 = [
		["p0", "a", "p0"],
		["p0", "b", "p1"],
		["p1", "a", "p1"],
		["p1", "b", "p2"],
		["p2", "a", "p2"],
		["p2", "b", "p2"]
    ];
    var estadoInicial2 = "p0";
    var estadosFinales2 = ["p2"];
    listaDeDFA[nombre2] = new DFA(nombre2, estados2, simbolos2, transiciones2, estadoInicial2, estadosFinales2);

    var nombre3 = "Acepta a*b*c*"
    var estados3 = ["q0", "q1", "q2"];
    var simbolos3 = ["a", "b", "c"];
    var transiciones3 = [
		["q0", "a", ["q0"]],
		["q0", null, ["q1"]],
		["q1", "b", ["q1"]],
		["q1", null, ["q2"]],
		["q2", "c", ["q2"]]
    ];
    var estadoInicial3 = "q0";
    var estadosFinales3 = ["q2"];

    listaDeNFA[nombre3] = new NFA(nombre3, estados3, simbolos3, transiciones3, estadoInicial3, estadosFinales3);

    var nombre4 = "Que terminan en ab,bc o ca";
    var estados4 = ["q0", "p1", "p2", "p3", "p4", "p5", "p6"];
    var simbolos4 = ["a", "b", "c"];
    var transiciones4 = [
		["q0", "a", ["q0", "p3"]],
		["q0", "b", ["q0"]],
		["q0", "b", ["p1"]],
		["q0", "c", ["q0", "p5"]],
		["p1", "c", ["p2"]],
		["p3", "b", ["p4"]],
		["p5", "a", ["p6"]]
    ];
    var estadoInicial4 = "q0";
    var estadosFinales4 = ["p2", "p4", "p6"];

    listaDeNFA[nombre4] = new NFA(nombre4, estados4, simbolos4, transiciones4, estadoInicial4, estadosFinales4);

    var nombre5 = "Contiene la subcadena 001";
    var estados5 = ["q0", "q1", "q2", "q3"];
    var simbolos5 = ["0", "1"];
    var transiciones5 = [
		["q0", "0", "q1"],
		["q0", "1", "q0"],
		["q1", "0", "q2"],
		["q1", "1", "q0"],
		["q2", "0", "q2"],
		["q2", "1", "q3"],
        ["q3", "0", "q3"],
        ["q3", "1", "q3"]
    ];
    var estadoInicial5 = "q0";
    var estadosFinales5 = ["q3"];
    listaDeDFA[nombre5] = new DFA(nombre5, estados5, simbolos5, transiciones5, estadoInicial5, estadosFinales5);

    actualizarMenuDeDFA();
    actualizarMenuDeNFA();

    var widthCanvas = $("#canvas").width() < 500 ? 500 : $("#canvas").width(),
        heightCanvas = $("#canvas").height() > 500 ? 500 : $("#canvas").height();

    canvas = Raphael(document.getElementById("canvas"), widthCanvas, heightCanvas);

    $(window).resize(function () {
        canvas.clear();
        widthCanvas = $("#canvas").width() < 500 ? 500 : $("#canvas").width();
        heightCanvas = $("#canvas").height() > 500 ? 500 : $("#canvas").height();

        canvas = Raphael(document.getElementById("canvas"), widthCanvas, heightCanvas);
        graficarAtomata();
    });
});

function guardarAutomata() {
    try {
        var entrada = $('#EntradaDeDefinicion').val().trim();
        var nuevoAutomata = crearAutomata(entrada);

        if (automataYaExiste(nuevoAutomata)) {
            var overwrite = confirm("Ya existe un " + nuevoAutomata.tipo + " llamado '" + nuevoAutomata.nombre + "'. Desea reemplazarlo?");

            if (overwrite === false) {
                return;
            }
        }

        if (nuevoAutomata.tipo === "DFA") {
            listaDeDFA[nuevoAutomata.nombre] = nuevoAutomata;
            mostrarExitoDeConstruccion("DFA guardado exitosamente");
            actualizarMenuDeDFA();
        } else if (nuevoAutomata.tipo === "NFA") {
            listaDeNFA[nuevoAutomata.nombre] = nuevoAutomata;
            mostrarExitoDeConstruccion("NFA guardado exitosamente");
            actualizarMenuDeNFA();
        }
    } catch (e) {
        mostrarErrorDeConstruccion(e.toString());
    }
}

function graficarAtomata() {
    $('#MensajeDeConstruccion').html("");

    try {
        var entrada = $('#EntradaDeDefinicion').val().trim();
        var automata = crearAutomata(entrada);

        Graficar(automata);
    }
    catch (e) {
        mostrarErrorDeConstruccion(e.toString());
    }
}

function computarCadena() {
    if (!nodosCanvas)
        return;

    $("#btnComputar").attr("disabled", true);
    $('#MensajeDeAnimacion').html("");
    
    var entrada = $('#EntradaDeDefinicion').val().trim();
    var automata = crearAutomata(entrada);
    var cadena = $("#CadenaDeEntrada").val();
    Graficar(automata);

    //var resultado = new Object();
    //resultado.transicionesTomadas = new Array();
    //resultado.acepta = false;
    var resultado = {
        transicionesTomadas: [],
        acepta: false
    }

    var estadoActual = automata.estadoInicial;
    var colorOriginal = nodosCanvas[estadoActual.nombre].circulo.attr("fill");
    nodosCanvas[estadoActual.nombre].circulo.attr({ "fill": "#f00", "stroke-width": "5" })
    var i = 0;

    var id = setInterval(function () {

        if (automata.alfabeto.hasOwnProperty(cadena[i])) {
            resultado.transicionesTomadas.push("De '" + estadoActual.nombre + "' con '" + cadena[i] + "' -> '" + estadoActual.transiciones[cadena[i]].nombre + "'");

            nodosCanvas[estadoActual.nombre].circulo.attr({ "fill": colorOriginal, "stroke-width": "0" });
            estadoActual = estadoActual.transiciones[cadena[i]];
            colorOriginal = nodosCanvas[estadoActual.nombre].circulo.attr("fill");
            
            if (automata.estadosFinales.hasOwnProperty(estadoActual.nombre)) {
                nodosCanvas[estadoActual.nombre].circulo.attr({ "fill": "#ff0", "stroke-width": "5" }).stop(true, true).animate({ fill: "#0f0" }, 1000);
            } else {
                nodosCanvas[estadoActual.nombre].circulo.attr({ "fill": "#ff0", "stroke-width": "5" }).stop(true, true).animate({ fill: "#f00" }, 1000);
            }
        }
        else {
            nodosCanvas[estadoActual.nombre].circulo.attr({ "fill": colorOriginal, "stroke-width": "0" });
            mostrarErrorDeAnimacion("El simbolo " + cadena[i] + " no es parte del alfabeto.");
            i = cadena.length;
            $("#btnComputar").attr("disabled", false);
            clearInterval(id);
            return;
        }

        if (++i == cadena.length) {
            if (automata.estadosFinales.hasOwnProperty(estadoActual.nombre)) {
                mostrarExitoDeAnimacion("Acepta la cadena.");
                nodosCanvas[estadoActual.nombre].circulo.attr({ "fill": "#0f0"});
            }
            else
                mostrarErrorDeAnimacion("Rechaza la cadena.");

            $("#btnComputar").attr("disabled", false);
            clearInterval(id);
        }

    }, 1100);
}

function Graficar(automata) {
    canvas.clear();
    var titulo = automata.tipo + ": " + automata.nombre;
    canvas.text(8, 15, titulo).attr({ "font-size": "18px", "font-family": "Consolas", "fill": "#000", "text-anchor": "start" });;

    var TAM_NODO = 20;
    var cantidadEstados = 0;

    for (e in automata.estados)
        cantidadEstados++;

    var centro = {
        X: canvas.width / 2,
        Y: canvas.height / 2
    },
        radio = canvas.height / 2 - TAM_NODO * 3;

    var nodos = {};
    var incAngulo = 360 / cantidadEstados;
    var angulo = 180;
    var i = 0;
    var transiciones = []
    var colores = ["#B4009E", "#0090D5", "#FF8C00", "#A5CE00", "#F35C78"];

    //Dibuja los nodos de los estados
    for (e in automata.estados) {
        var anguloRad = angulo * Math.PI / 180;

        var x = centro.X + radio * Math.cos(anguloRad);
        var y = centro.Y + radio * Math.sin(anguloRad);

        var circuloEstado = canvas.circle(x, y, TAM_NODO);
        circuloEstado.attr({ "fill": colores[i % colores.length], "stroke-width": "0" });
        circuloEstado.glow({ "width": 3, "opacity": 0.3, "offsety": 1 });
        i++;

        var nombreEstado = canvas.text(x, y, automata.estados[e].nombre).attr({ "fill": "#fff", "font-size": "14px", "font-weight": "bold", "font-family": "consolas" });

        var einicial = false;
        if (automata.estados[e].nombre == automata.estadoInicial.nombre) {
            einicial = true;
            var ini = canvas.text(x - TAM_NODO - 16, y, "→");
            ini.attr({ "font-size": "35px", "fill": "#444" });
        }

        var nodo = {
            id: automata.estados[e].nombre,
            circulo: circuloEstado,
            texto: nombreEstado,
            esInicial: einicial,
            esFinal: false,
            txtTransicion: "",
            grapTransicion: {
                linea: null,
                txtSimbolo: null,
                boxSimbolo: null
            }
        };

        nodos[automata.estados[e].nombre] = nodo;
        angulo += incAngulo;
    }

    //Marca los estados finales
    for (f in automata.estadosFinales) {
        nodos[f].circulo.attr({ "stroke-width": "6", "stroke": "#000", "stroke-opacity": 0.4 });
        nodos[f].esFinal = true;
    }

    //Dibuja las transiciones
    for (e in automata.estados) {
        for (simbolo in automata.alfabeto) {

            var nodo1 = nodos[automata.estados[e].nombre],
                nodo2 = nodos[automata.estados[e].transicionar(simbolo).nombre],
                idTransicion = nodo1.id + nodo2.id;

            if ($.inArray(idTransicion, transiciones) == -1) {
                transiciones.push(idTransicion);

                var x1 = nodo1.circulo.getBBox().x + TAM_NODO,
                    y1 = nodo1.circulo.getBBox().y + TAM_NODO,
                    x2 = nodo2.circulo.getBBox().x + TAM_NODO,
                    y2 = nodo2.circulo.getBBox().y + TAM_NODO;

                //Si es una transicion al mismo nodo:
                if (nodo1 == nodo2) {
                    var posicionYSimbolo = 0;
                    if (y1 > centro.Y) {
                        y1 += TAM_NODO * 1.3;
                        posicionYSimbolo = TAM_NODO;
                    }
                    else {
                        y1 -= TAM_NODO * 1.3;
                        posicionYSimbolo = -TAM_NODO;
                    }

                    nodo1.txtTransicion += simbolo;
                    nodo1.grapTransicion.linea = canvas.circle(x1, y1, TAM_NODO);
                    nodo1.grapTransicion.txtSimbolo = canvas.text(x1, (y1 + posicionYSimbolo), simbolo).attr({ "font-size": "14px", "font-family": "consolas" });

                    var box = nodo1.grapTransicion.txtSimbolo.getBBox();
                    nodo1.grapTransicion.boxSimbolo = canvas.rect(box.x - 5, box.y, box.width + 10, box.height).attr('fill', '#fff');
                    nodo1.grapTransicion.txtSimbolo.toFront();

                    var flecha = canvas.text(x1 + TAM_NODO - 1, y1, "►").attr({ "font-size": "14px" });
                    if (y1 < centro.Y)
                        flecha.rotate(25, x1, y1).rotate(95);
                    else
                        flecha.rotate(-25, x1, y1).rotate(-95);
                }
                else {
                    var distancia = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    var curvaX = 0, curvaY = 0, angFlecha = 0;

                    if (x2 > x1) {
                        if (y2 > y1) {
                            curvaX = distancia * 0.6;
                            curvaY = distancia * 0.1;
                        }
                        else {
                            curvaX = distancia * 0.1;
                            curvaY = -distancia * 0.6;
                        }
                    }
                    else {
                        if (y2 > y1) {
                            curvaX = -distancia * 0.1;
                            curvaY = distancia * 0.6;
                        }
                        else {
                            curvaX = -distancia * 0.6;
                            curvaY = -distancia * 0.1;
                        }
                    }

                    nodo1.txtTransicion += simbolo;
                    nodo1.grapTransicion.linea = canvas.path("M " + x1 + " " + y1 + " q " + " " + curvaX + " " + curvaY + " " + (x2 - x1) + " " + (y2 - y1));
                    var medioLinea = nodo1.grapTransicion.linea.getPointAtLength(nodo1.grapTransicion.linea.getTotalLength() / 2);

                    nodo1.grapTransicion.txtSimbolo = canvas.text(medioLinea.x, medioLinea.y, simbolo).attr({ "font-size": "16px", "font-family": "consolas" });
                    var box = nodo1.grapTransicion.txtSimbolo.getBBox();
                    nodo1.grapTransicion.boxSimbolo = canvas.rect(box.x - 5, box.y, box.width + 10, box.height).attr('fill', '#fff');
                    nodo1.grapTransicion.txtSimbolo.toFront();

                    var posFlecha = nodo1.grapTransicion.linea.getPointAtLength(nodo1.grapTransicion.linea.getTotalLength() - TAM_NODO - 5);

                    var deltaX = x2 - posFlecha.x;
                    var deltaY = y2 - posFlecha.y;
                    angFlecha = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

                    canvas.text(posFlecha.x, posFlecha.y, "►").attr({ "font-size": "14px" }).rotate(angFlecha);
                }
            }
            else { //Si hay mas de una transicion al mismo nodo pero con distinto simbolo, solo se agrega el simbolo a la etiqueta existente
                nodo1.txtTransicion += "," + simbolo;
                var box = nodo1.grapTransicion.txtSimbolo.getBBox();
                nodo1.grapTransicion.txtSimbolo.remove();
                nodo1.grapTransicion.txtSimbolo = canvas.text(box.x + 5, box.y + 5, nodo1.txtTransicion).attr({ "font-size": "14px", "font-family": "consolas" });

                box = nodo1.grapTransicion.txtSimbolo.getBBox();
                nodo1.grapTransicion.boxSimbolo.remove();
                nodo1.grapTransicion.boxSimbolo = canvas.rect(box.x - 5, box.y, box.width + 10, box.height).attr('fill', '#fff');

                nodo1.grapTransicion.txtSimbolo.toFront();
            }

            nodo1.circulo.toFront();
            nodo1.texto.toFront();
            nodo2.circulo.toFront();
            nodo2.texto.toFront();
        }
    }

    nodosCanvas = nodos;
}

function limpiarDefinicion() {
    $('#EntradaDeDefinicion').val("").focus();
    canvas.clear();
    esconderMensajeDeConstruccion();
}

function unirDosDFA(dfa1, dfa2) {
    listaDeDFA[dfa1 + " *UNION* " + dfa2] = listaDeDFA[dfa1].union(listaDeDFA[dfa2]);
    actualizarMenuDeDFA();
}


function interseccionDosDFA(dfa1, dfa2) {
    listaDeDFA[dfa1 + " *INTERSECCIÓN* " + dfa2] = listaDeDFA[dfa1].interseccion(listaDeDFA[dfa2]);
    actualizarMenuDeDFA();
}


function concatenarDosDFA(dfa1, dfa2) {
    listaDeDFA[dfa1 + " *CONCATENAR* " + dfa2] = listaDeDFA[dfa1].concatenacion(listaDeDFA[dfa2]);
    actualizarMenuDeDFA();
}


function complementoDFA(dfa1) {
    listaDeDFA[dfa1 + " *COMPLEMENTO* "] = listaDeDFA[dfa1].complemento();
    actualizarMenuDeDFA();
}


function estrellaDFA(dfa1) {
    listaDeDFA[dfa1 + " *ESTRELLA* "] = listaDeDFA[dfa1].estrella();
    //actualizarMenuDeDFA();
}


function verDFA(dfa) {
    limpiarDefinicion();
    $('#EntradaDeDefinicion').val(listaDeDFA[dfa].generarDefinicion());
    graficarAtomata();
}

function eliminarDFA(dfa) {
    delete (listaDeDFA[dfa]);
    actualizarMenuDeDFA();
}