var canvas;

$(document).ready(function () {
    //crear un dos DFA y dos NFA que sirvan de ejemplos
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
    var estadosFinales1 = ["q2"];

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

    actualizarMenuDeDFA();
    actualizarMenuDeNFA();

    canvas = Raphael(document.getElementById("canvas"), 600, 400);
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
    var entrada = $('#EntradaDeDefinicion').val().trim();
    var automata = crearAutomata(entrada);

    Graficar(automata.estados, automata.estadoInicial, automata.estadosFinales, automata.transiciones);
}


function computarCadena () {
	//listaDeDFA['Acepta por lo menos 2 b'].probar("ab").acepta
	var entrada = $('#EntradaDeDefinicion').val().trim();
    var automata = crearAutomata(entrada);
	
     var cadena =  document.getElementById("CadenaDeEntrada").value;
	//if (automata.probar(cadena).acepta)
	alert(automata.probar(cadena).acepta);	
}

function Graficar(estados, estadoInicial, estadosFinales, transiciones) {

    canvas.clear();

    var TAM_NODO = 20;
    var cantidadEstados = 0;

    for (e in estados)
        cantidadEstados++;

    var centro = {
            X: canvas.width / 2,
            Y: canvas.height / 2
        },
        radio = canvas.width / 4;

    var nodos = {};
    var incAngulo = 360 / cantidadEstados;
    var angulo = 180;
    var i = 0;
    var colores = ["#B4009E", "#0090D5", "#442359", "#FF8C00", "#A5CE00"];

    for (e in estados) {

        var anguloRad = angulo * Math.PI / 180;

        var x = centro.X + radio * Math.cos(anguloRad);
        var y = centro.Y + radio * Math.sin(anguloRad);

        var c = canvas.circle(x, y, TAM_NODO);
        c.attr("fill", colores[i % 4]);
        i++;

        var t = canvas.text(x, y, estados[e].nombre).attr({ "fill": "#fff", "font-size": "14px", "font-weight": "bold", "font-family": "consolas" });

        var einicial = false;
        if (estados[e].nombre == estadoInicial.nombre) {
            einicial = true;
            var ini = canvas.text(x - TAM_NODO - 16, y, "→");
            ini.attr({ "font-size": "35px" });
        }


        var nodo = {
            id: estados[e].nombre,
            circulo: c,
            texto: t,
            esInicial: einicial
        };

        nodos[estados[e].nombre] = nodo;
        angulo += incAngulo;
    }

    for (f in estadosFinales) {
        nodos[f].circulo.attr({ "stroke-width": "3" });
    }

    //$.each(transiciones, function (i, v) {
    //    var nodo1 = nodos[v[0]],
    //        nodo2 = nodos[v[2]],
    //        simbolo = v[1];

    //    var x1 = nodo1.circulo.getBBox().x,
    //        y1 = nodo1.circulo.getBBox().y,
    //        x2 = nodo2.circulo.getBBox().x,
    //        y2 = nodo2.circulo.getBBox().y;

    //    var iniX = 0, iniY = 0, finX = 0, finY = 0;
    //    var arcIniX = 0, arcIniY = 0, arcFinX = 0, arcFinY = 0;

    //    if (x1 < x2) {
    //        iniX = TAM_NODO * 1.5;
    //        finX = TAM_NODO * 0.1;
    //        arcIniX = 20;
    //        arcFinX = -50;
    //    }
    //    else {
    //        iniX = TAM_NODO * 0.5;
    //        finX = TAM_NODO * 2;
    //        arcIniX = 20;
    //        arcFinX = 50;
    //    }

    //    if (y1 > y2) {
    //        iniY = TAM_NODO * 0.1;
    //        finY = TAM_NODO * 0.8;
    //        arcIniY = -50;
    //        arcFinY = 0;
    //    }
    //    else {
    //        iniY = TAM_NODO * 1.9;
    //        finY = TAM_NODO * 1.2;
    //        arcIniY = 70;
    //        arcFinY = 20;
    //    }

    //    var coordenadas = "M" + (x1 + iniX) + ", " + (y1 + iniY) + " L" + (x2 + finX) + ", " + (y2 + finY);

    //    var linea = canvas.path(coordenadas);

    //    var flecha = canvas.text(x2 + finX, y2 + finY, "►");
    //    flecha.attr("font-size", "16px");


    //    var s = canvas.text((x1 + x2 + finX + finX) / 2, (y1 + y2 + finY + finY) / 2, simbolo);
    //    s.attr({
    //        "font-size": "14px",
    //    });

    //    var box = s.getBBox();
    //    var rect = canvas.rect(box.x - 5, box.y, box.width + 10, box.height).attr('fill', '#fff');
    //    s.toFront();

    //});
}

function limpiarDefinicion() {
    $('#EntradaDeDefinicion').val("").focus();
    esconderMensajeDeConstruccion();
}

function unirDosDFA(dfa1, dfa2) {
    listaDeDFA[dfa1 + " *UNION* " + dfa2] = listaDeDFA[dfa1].union(listaDeDFA[dfa2]);
    actualizarMenuDeDFA();
}

function verDFA(dfa) {
    limpiarDefinicion();
    $('#EntradaDeDefinicion').val(listaDeDFA[dfa].generarDefinicion());
}

function eliminarDFA(dfa) {
    delete (listaDeDFA[dfa]);
    actualizarMenuDeDFA();
}