$(document).ready(function () {
	//crear un dos DFA y dos NFA que sirvan de ejemplos
	var nombre1 = "Acepta 3 a";
	var estados1 = ["q0", "q1", "q2", "q3"];
	var simbolos1 = ["a","b"];
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
	var simbolos2 = ["a","b"];
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
	var simbolos3 = ["a","b","c"];
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
	var simbolos4 = ["a","b","c"];
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
});

function guardarAutomata(){
	try{
		var entrada = $('#EntradaDeDefinicion').val().trim();
		var nuevoAutomata = crearAutomata(entrada);

		if (automataYaExiste(nuevoAutomata)){
			var overwrite = confirm("Ya existe un " + nuevoAutomata.tipo + " llamado '" + nuevoAutomata.nombre + "'. Desea reemplazarlo?");

			if (overwrite === false){
				return;
			}
		}

		if (nuevoAutomata.tipo === "DFA"){
			listaDeDFA[nuevoAutomata.nombre] = nuevoAutomata;
			mostrarExitoDeConstruccion("DFA guardado exitosamente");
			actualizarMenuDeDFA();
		}else if (nuevoAutomata.tipo === "NFA"){
			listaDeNFA[nuevoAutomata.nombre] = nuevoAutomata;
			mostrarExitoDeConstruccion("NFA guardado exitosamente");
			actualizarMenuDeNFA();
		}
	}catch(e){
		mostrarErrorDeConstruccion(e.toString());
	}
}

function limpiarDefinicion(){
	$('#EntradaDeDefinicion').val("");
	esconderMensajeDeConstruccion();
}

function unirDosDFA(dfa1, dfa2){
	listaDeDFA[dfa1 + " *UNION* " + dfa2] = listaDeDFA[dfa1].union(listaDeDFA[dfa2]);
	actualizarMenuDeDFA();
}

function verDFA(dfa){
	limpiarDefinicion();
	$('#EntradaDeDefinicion').val(listaDeDFA[dfa].generarDefinicion());
}

function eliminarDFA(dfa){
	delete(listaDeDFA[dfa]);
	actualizarMenuDeDFA();
}