function DFA(nombre, estados, simbolos, transiciones, estadoInicial, estadosFinales){
	this.tipo = "DFA";
	this.nombre = nombre;
	this.estados = {};
	this.alfabeto = {};
	this.estadoInicial = {};
	this.estadosFinales = {};

	if (estados && estados.length > 0){
		estados = estados.sort();
		var anterior = "";
		
		for (var i = 0; i < estados.length; i++){
			if (estados[i] !== anterior){
				this.estados[estados[i]] = new Estado(estados[i], {});
			}else{
				throw "Los estados deben ser unicos ('" + estados[i] + "' esta repetido)";
			}
		}
	}else{
		throw "Se requiere por lo menos 1 estado";
	}

	if (simbolos && simbolos.length > 0){
		for (var i = 0; i < simbolos.length; i++){
			this.alfabeto[simbolos[i]] = new Simbolo(simbolos[i]);
		}
	}else{
		throw "Se requier por lo menos 1 simbolo en el alfabeto de entrada";
	}
	

	if (transiciones && (transiciones.length === (estados.length * simbolos.length))){
		for (var i = 0; i < transiciones.length; i++){
			if (transiciones[i].length === 3){
				if (this.estados.hasOwnProperty(transiciones[i][0])){
					if (this.alfabeto.hasOwnProperty(transiciones[i][1])){
						if (this.estados.hasOwnProperty(transiciones[i][2])){
							this.estados[transiciones[i][0]].transiciones[transiciones[i][1]] = this.estados[transiciones[i][2]];
						}else{
							throw "Transicion invalida (" + transiciones[i].join(",") + "): El estado '" + transiciones[i][2] + "' no pertenece al conjunto de estados";
						}
					}else{
						throw "Transicion invalida (" + transiciones[i].join(",") + "): El simbolo '" + transiciones[i][1] + "' no pertenece al alfabeto de simbolos de entrada";
					}
				}else{
					throw "Transicion invalida (" + transiciones[i].join(",") + "): El estado '" + transiciones[i][0] + "' no pertenece al conjunto de estados";
				}
			}else{
				throw "Transicion invalida (" + transiciones[i].join(",") + "): El formato es \"estado, simbolo, estado\"";
			}
		}

		for (e in this.estados){	
			for (s in this.alfabeto){
				if (this.estados[e].transiciones.hasOwnProperty(this.alfabeto[s].nombre) === false){
					throw "Hace falta la transicion desde el estado '" + this.estados[e].nombre + "' con el simbolo '" + this.alfabeto[s].nombre + "'";
				}
			}
		}
	}else{
		throw "Deben haber exactamente " + (estados.length * simbolos.length) + " transiciones. Hay " + transiciones.length;
	}

	if (estadoInicial && estadoInicial.length > 0){
		if (this.estados.hasOwnProperty(estadoInicial)){
			this.estadoInicial = this.estados[estadoInicial];
		}else{
			throw "El estado inicial especificado (" + estadoInicial + ") no existe en el conjunto de estados";
		}
	}else{
		throw "El estado inicial es requerido";
	}

	if (estadosFinales && estadosFinales.length > 0){
		for (var i = 0; i < estadosFinales.length; i++){
			if (this.estados.hasOwnProperty(estadosFinales[i])){
				this.estadosFinales[estadosFinales[i]] = this.estados[estadosFinales[i]];
			}else{
				throw "El estado final '" + estadosFinales[i] + "' no existe en el conjunto de estados";
			}
		}
	}else{
		throw "El conjunto de estados finales es requerido";
	}

	this.union = function(dfa){
		//fucion que retorna una DFA que es la union de este dfa con el que viene de parametro
		//Primero vamos a armar los 5 componentes distintos del dfa (conjunto de estados, alfabeto, transiciones, estado inicia y estados finales)
		//el nombre es extra. no es parte de la definicion formal de un dfa.
		var nombre = this.nombre + " *UNION* " + dfa.nombre;

		var estados = [];
		var alfabeto = [];
		var transiciones = [];
		var estadoInicial = ""; //todos son arreglos menos este, ya que solo puede haber un estado inicial
		var estadosFinales = [];

		//Para obtener los estados de la maquina grande, los estados de las dos maquinas pequenas se deben combinar de todas las posibles maneras.
		/*for (e1 in this.estados){ //para cada estado en esta maquina
			for (e2 in dfa.estados){ //para cada estado en la maquina que se me envio
				estados.push(this.estados[e1].nombre + "_" + dfa.estados[e2].nombre); 
			}
		}*/


		//Estoy asumiendo que el alfabeto es el mismo para las dos maquinas pequenas. Si no lo es, levantar una exception
		for (s in this.alfabeto){
			if (!dfa.alfabeto.hasOwnProperty(s)){
				throw "El alfabeto de entrada de ambos DFA deben ser iguales";
			}
		}

		//Se tiene que recorrer de nuevo, esta vez con los simbolos del otro DFA, porque puede ser que tengan los mismos simbolos solo que este tenga uno mas.
		for (s in dfa.alfabeto){
			if (!this.alfabeto.hasOwnProperty(s)){
				throw "El alfabeto de entrada de ambos DFA deben ser iguales";
			}
			alfabeto.push(s); //puede ser que el codigo tire exception despues de llenar algunos elementos del arreglo, pero no importa porque se termina la ejecucion. Llenamos el arreglo aqui mismo.
		}


		for (e1 in this.estados){ //para cada estado en esta maquina
			for (e2 in dfa.estados){ //para cada estado en la maquina que se me envio
				estados.push(this.estados[e1].nombre + "_" + dfa.estados[e2].nombre);	//metemos en el arreglo la combinacion de sus nombres, separados por un guion bajo
				
				//Si e1 es parte del conjunto de estados finales del df1, OORRRR e2 es parte del conjunto de estados finales del dfa2, se convierte en un estado final de este nuevo dfa 
				if (this.estadosFinales.hasOwnProperty(e1) || dfa.estadosFinales.hasOwnProperty(e2)){
					estadosFinales.push(e1 + "_" + e2);
				}

				for (var j = 0; j < alfabeto.length; j++){
					//transiciones es un arreglo de arreglos: cada elemento es un arreglo de 3 elementos, el primero es el estado actual, despues el simbolo de entrada, y por ultimo el estado destino
					//entonces metemos esos tres valores de un solo al arreglo:
					transiciones.push([e1 + "_" + e2, alfabeto[j], this.estados[e1].transiciones[alfabeto[j]].nombre + "_" + dfa.estados[e2].transiciones[alfabeto[j]].nombre]);
					//Todo el argumento de push() va dentro de llaves cuadradas [], porque eso significa que es un arreglo.
					//el objeto "transiciones" de cada estado es un "arreglo associativo", que cuando se le envia de parametro un simbolo (en este caso, el j-esimo simbolo del alfabeto), retorna un objeto
					//que es el estado al que se deberia de ir la maquina. por eso esta el ".nombre", porque ocupamos el nombre de ese estado, y lo que se retorna es un objeto entero.
				}		
			}
		}

		/*
		//Para las transiciones: Hay que recorrer todos los estados que llevamos hasta ahorita:
		for (var i = 0; i < estados.length; i++){
			//Agarramos el nombre de cada estado, hacemos split en el guion bajo (por eso lo hicimos ahyi arribita), y guardamos los pedazos en dos variables distintas.
			var e1 = estados[i].split("_")[0];  //este estado pertenece a esta maquina (this)
			var e2 = estados[i].split("_")[1];	//este estado es de la maquina que vino de parametro (dfa)

			//Ahora hay que recorrer todos los simbolos del alfabeto. Esto es un DFA y necesariamente debe de existir una transicion por cada simbolo para cada estado
			for (var j = 0; j < alfabeto.length; j++){
				//transiciones es un arreglo de arreglos: cada elemento es un arreglo de 3 elementos, el primero es el estado actual, despues el simbolo de entrada, y por ultimo el estado destino
				//entonces metemos esos tres valores de un solo al arreglo:
				transiciones.push([estados[i], alfabeto[j], this.estados[e1].transiciones[alfabeto[j]].nombre + "_" + dfa.estados[e2].transiciones[alfabeto[j]].nombre]);
				//Todo el argumento de push() va dentro de llaves cuadradas [], porque eso significa que es un arreglo.
				//el objeto "transiciones" de cada estado es un "arreglo associativo", que cuando se le envia de parametro un simbolo (en este caso, el j-esimo simbolo del alfabeto), retorna un objeto
				//que es el estado al que se deberia de ir la maquina. por eso esta el ".nombre", porque ocupamos el nombre de ese estado, y lo que se retorna es un objeto entero.
			}
		}
		*/


		//El estado inicial de la maquina grande debe de ser el estado que resulto de la combinacion de los estados iniciales de las 2 maquinas pequenas
		estadoInicial = this.estadoInicial.nombre + "_" + dfa.estadoInicial.nombre;



		//Los estados finales son todos los estados que tienen un estado final de CUALQUIERA de las dos maquinas pequenas.
		//en la interseccion, solamente los estados que tengan un estado final de CADA maquina serian validos.
		//Entonces, recorremos los estados que tenemos hasta ahorita:
		/*for (var i = 0; i < estados.length; i++){
			//nuevamente separamos su nombre en dos partes, una para cada estado de cada dfa
			var e1 = estados[i].split("_")[0];  //este estado pertenece a esta maquina (this)
			var e2 = estados[i].split("_")[1];	//este estado pertenece a la maquina que vino de parametro(dfa)

			//Si e1 es parte del conjunto de estados finales del df1, OORRRR e2 es parte del conjunto de estados finales del dfa2, se convierte en un estado final de este nuevo dfa 
			if (this.estadosFinales.hasOwnProperty(e1) || dfa.estadosFinales.hasOwnProperty(e2)){
				estadosFinales.push(estados[i]);
			}
		}*/

		//una vez llenos los componentes del dfa, solo llamamos al constructor y retornamos el objeto resultante:
		return new DFA(nombre, estados, alfabeto, transiciones, estadoInicial, estadosFinales);
	};

	this.interseccion = function(dfa){
		var nombre = this.nombre + " *INTERSECCION* " + dfa.nombre;

		var estados = [];
		var alfabeto = [];
		var transiciones = [];
		var estadoInicial = "";
		var estadosFinales = [];

		for (s in this.alfabeto){
			if (!dfa.alfabeto.hasOwnProperty(s)){
				throw "El alfabeto de entrada de ambos DFA deben ser iguales";
			}
		}

		for (s in dfa.alfabeto){
			if (!this.alfabeto.hasOwnProperty(s)){
				throw "El alfabeto de entrada de ambos DFA deben ser iguales";
			}
			alfabeto.push(s);
		}


		for (e1 in this.estados){
			for (e2 in dfa.estados){
				estados.push(this.estados[e1].nombre + "_" + dfa.estados[e2].nombre);
				
				//Si e1 es parte del conjunto de estados finales del df1, AND e2 es parte del conjunto de estados finales del dfa2, se convierte en un estado final de este nuevo dfa 
				if (this.estadosFinales.hasOwnProperty(e1) && dfa.estadosFinales.hasOwnProperty(e2)){
					estadosFinales.push(e1 + "_" + e2);
				}

				for (var j = 0; j < alfabeto.length; j++){
					transiciones.push([e1 + "_" + e2, alfabeto[j], this.estados[e1].transiciones[alfabeto[j]].nombre + "_" + dfa.estados[e2].transiciones[alfabeto[j]].nombre]);
				}		
			}
		}

		estadoInicial = this.estadoInicial.nombre + "_" + dfa.estadoInicial.nombre;

		return new DFA(nombre, estados, alfabeto, transiciones, estadoInicial, estadosFinales);
	};

	this.concatenacion = function(dfa){
		throw "Esta funcion todavia no esta implementada";
	};

	this.complemento = function(){
		var nombre = this.nombre + " *COMPLEMENTO*";

		var estados = [];
		var alfabeto = [];
		var transiciones = [];
		var estadoInicial = ""; //todos son arreglos menos este, ya que solo puede haber un estado inicial
		var estadosFinales = [];

		for (e1 in this.estados){
			estados.push(e1);
		}

		for (s in this.alfabeto){
			alfabeto.push(s); 
		}

		for (e1 in this.estados){
			for (t1 in this.estados[e1].transiciones){
				transiciones.push([e1, t1, this.estados[e1].transiciones[t1].nombre]);
			}
		}

		estadoInicial = this.estadoInicial.nombre;

		//hasta ahorita, todo fue copy/paste de este nfa. la unica diferencia es que los estados finales ahora no son estados finales...y los que no eran ahora si lo son
		for (e1 in this.estados){
			if (this.estadosFinales.hasOwnProperty(e1) === false){ //si no es estado final de esta maquina
				estadosFinales.push(e1); //lo ponemos como estado final de la nueva maquina
			}
		}

		return new DFA(nombre, estados, alfabeto, transiciones, estadoInicial, estadosFinales);
	};

	this.estrella = function(){
		throw "Esta funcion todavia no esta implementada";
	};

	this.probar = function(cadena){
		var resultado = new Object();
		resultado.transicionesTomadas = new Array();
		resultado.acepta = false;

		var estadoActual = this.estadoInicial;
	
		for (var i = 0; i < cadena.length; i++){
			//alert("estadoActual.nombre = " + estadoActual.nombre + "\ncadena[i] = " + cadena[i] + "\nestadoActual.transiciones[cadenai[i]].nombre = " + estadoActual.transiciones[cadena[i]].nombre);
			if (this.alfabeto.hasOwnProperty(cadena[i])){
				resultado.transicionesTomadas.push("De '" + estadoActual.nombre + "' con '" + cadena[i] + "' -> '" + estadoActual.transiciones[cadena[i]].nombre + "'");
				estadoActual = estadoActual.transiciones[cadena[i]];
			}else{
				throw "El simbolo " + cadena[i] + " no es parte del alfabeto";
			}
		}

		//console.log(this.estadosFinales);
		//alert("\nestado final de computacion: " + estadoActual.nombre);

		if (this.estadosFinales.hasOwnProperty(estadoActual.nombre)){
			resultado.acepta = true;
		}else{
			resultado.acepta = false;
		}

		return resultado;
	};

	this.generarDefinicion = function(){
		var definicion = "";

		var tipo = "DFA";
		var nombre = this.nombre;
		var estados = [];
		var simbolos = [];
		var transiciones = [];
		var estadoInicial = this.estadoInicial.nombre;
		var estadosFinales = [];

		for (e in this.estados){
			estados.push(e);
			for (t in this.estados[e].transiciones){
				transiciones.push("(" + e + "," + t + "," + this.estados[e].transiciones[t].nombre + ")");
			}
		}

		for (s in this.alfabeto){
			simbolos.push(s);
		}

		for (e in this.estadosFinales){
			estadosFinales.push(e);
		}

		var definicion = tipo + "\n";
		definicion += nombre + "\n";
		definicion += estados.join(",") + "\n";
		definicion += simbolos.join(",") + "\n";
		definicion += transiciones.join(",") + "\n";
		definicion += estadoInicial + "\n";
		definicion += estadosFinales.join(",");

		return definicion;
	};
}

function NFA(nombre, estados, simbolos, transiciones, estadoInicial, estadosFinales){
	this.tipo = "NFA";
	this.nombre = nombre;
	this.estados = {};
	this.alfabeto = {};
	this.estadoInicial = {};
	this.estadosFinales = {};

	if (estados && estados.length > 0){
		estados = estados.sort();
		var anterior = "";
		
		for (var i = 0; i < estados.length; i++){
			if (estados[i] !== anterior){
				this.estados[estados[i]] = new Estado(estados[i], {});
			}else{
				throw "Los estados deben ser unicos ('" + estados[i] + "' esta repetido)";
			}
		}
	}else{
		throw "Se requiere por lo menos 1 estado";
	}

	if (simbolos && simbolos.length > 0){
		for (var i = 0; i < simbolos.length; i++){
			this.alfabeto[simbolos[i]] = new Simbolo(simbolos[i]);
		}
	}else{
		throw "Se requiere por lo menos 1 simbolo en el alfabeto de entrada";
	}

	if ((transiciones) && (transiciones instanceof Array) && (transiciones.length > 0)){
		for (var i = 0; i < transiciones.length; i++){
			if (transiciones[i].length === 3){
				if (this.estados.hasOwnProperty(transiciones[i][0])){
					if (this.alfabeto.hasOwnProperty(transiciones[i][1]) || (transiciones[i][1] === null)){
						if ((transiciones[i][2] instanceof Array) && (transiciones[i][2].length > 0)){
							for (var j = 0; j < transiciones[i][2].length; j++){
								if (this.estados.hasOwnProperty(transiciones[i][2][j])){
									var temp = this.estados[transiciones[i][0]].transiciones;

									if (!temp.hasOwnProperty(transiciones[i][1])){
										temp[transiciones[i][1]] = {};
									}

									if (!temp[transiciones[i][1]].hasOwnProperty(transiciones[i][2][j])){
										temp[transiciones[i][1]][transiciones[i][2][j]] = this.estados[transiciones[i][2][j]];
									}else{
										throw "Transicion invalida (" + transiciones[i][0] + "," + transiciones[i][1] + ",[" + transiciones[i][2].join(",") + "]): El estado '" + transiciones[i][2][j] + "' esta mas de una vez en la lista de estados destino";
									}
								}else{
									throw "Transicion invalida (" + transiciones[i][0] + "," + transiciones[i][1] + ",[" + transiciones[i][2].join(",") + "]): El estado '" + transiciones[i][2][j] + "' no pertenece al conjunto de estados";
								}
							}
						}else{
							throw "Transicion invalida (" + transiciones[i].join(",") + "): El formato es \"estado, simbolo, [arreglo de por lo menos 1 estado]\"";
						}
					}else{
						throw "Transicion invalida (" + transiciones[i].join(",") + "): El simbolo '" + transiciones[i][1] + "' no pertenece al alfabeto de simbolos de entrada";
					}
				}else{
					throw "Transicion invalida (" + transiciones[i].join(",") + "): El estado '" + transiciones[i][0] + "' no pertenece al conjunto de estados";
				}
			}else{
				throw "Transicion invalida (" + transiciones[i].join(",") + "): El formato es \"estado, simbolo, estado\"";
			}
		}
	}else{
		throw "El arreglo de transiciones debe contener al menos un elemento";
	}

	if (estadoInicial && estadoInicial.length > 0){
		if (this.estados.hasOwnProperty(estadoInicial)){
			this.estadoInicial = this.estados[estadoInicial];
		}else{
			throw "El estado inicial especificado (" + estadoInicial + ") no existe en el conjunto de estados";
		}
	}else{
		throw "El estado inicial es requerido";
	}

	if (estadosFinales && estadosFinales.length > 0){
		for (var i = 0; i < estadosFinales.length; i++){
			if (this.estados.hasOwnProperty(estadosFinales[i])){
				this.estadosFinales[estadosFinales[i]] = this.estados[estadosFinales[i]];
			}else{
				throw "El estado final '" + estadosFinales[i] + "' no existe en el conjunto de estados";
			}
		}
	}else{
		throw "El conjunto de estados finales es requerido";
	}

	console.log(this);

	this.union = function(nfa){
		var nombre = this.nombre + " *UNION* " + nfa.nombre;

		var estados = [];
		var alfabeto = [];
		var transiciones = [];
		var estadoInicial = ""; //todos son arreglos menos este, ya que solo puede haber un estado inicial
		var estadosFinales = [];

		for (e1 in this.estados){
			estados.push(e1 + "-1");
		}
		//alert(estados);
		for (e2 in nfa.estados){
			estados.push(e2 + "-2");
		}

		estadoInicial = this.estadoInicial.nombre + "_" + nfa.estadoInicial.nombre;
		estados.push(estadoInicial);

		for (s in this.alfabeto){
			if (!nfa.alfabeto.hasOwnProperty(s)){
				throw "El alfabeto de entrada de ambos NFA deben ser iguales";
			}
		}

		//Se tiene que recorrer de nuevo, esta vez con los simbolos del otro DFA, porque puede ser que tengan los mismos simbolos solo que este tenga uno mas.
		for (s in nfa.alfabeto){
			if (!this.alfabeto.hasOwnProperty(s)){
				throw "El alfabeto de entrada de ambos NFA deben ser iguales";
			}
			alfabeto.push(s); //puede ser que el codigo tire exception despues de llenar algunos elementos del arreglo, pero no importa porque se termina la ejecucion. Llenamos el arreglo aqui mismo.
		}

		//transiciones se copian asi como estan.
		for (e1 in this.estados){
			for (t1 in this.estados[e1].transiciones){
				var estadosDestino = new Array();

				for (ef1 in this.estados[e1].transiciones[t1]){
					estadosDestino.push(this.estados[e1].transiciones[t1][ef1].nombre + "-1");
				}

				transiciones.push([e1 + "-1", (t1 === "null" ? null:t1), estadosDestino]);
			}
		}

		//alert(transiciones);

		for (e2 in nfa.estados){
			for (t2 in nfa.estados[e2].transiciones){
				var estadosDestino = new Array();

				for (ef2 in nfa.estados[e2].transiciones[t2]){
					estadosDestino.push(nfa.estados[e2].transiciones[t2][ef2].nombre + "-2");
				}

				transiciones.push([e2 + "-2", (t2 === "null" ? null:t2), estadosDestino]);
			}
		}

		//alert(transiciones);

		//crear 2 transiciones epsilon, desde el nuevo estado inicial a los estados iniciales de cada automata individual
		transiciones.push([estadoInicial, null, [this.estadoInicial.nombre + "-1", nfa.estadoInicial.nombre + "-2"]]);

		//los estados finales son los mismos;
		for (e1 in this.estadosFinales){
			estadosFinales.push(e1 + "-1");
		}

		for (e2 in nfa.estadosFinales){
			estadosFinales.push(e2 + "-2");
		}

		//alert(estadoInicial);
		//alert(estadosFinales);

		//console.log(estados);
		//console.log(transiciones);
		//console.log(estadoInicial);
		//console.log(estadosFinales);
		return new NFA(nombre, estados, alfabeto, transiciones, estadoInicial, estadosFinales);
	};

	this.interseccion = function(nfa){
		throw "Esta funcion todavia no esta implementada";
	};

	this.concatenacion = function(nfa){
		var nombre = this.nombre + " *CONCAT* " + nfa.nombre;

		var estados = [];
		var alfabeto = [];
		var transiciones = [];
		var estadoInicial = ""; //todos son arreglos menos este, ya que solo puede haber un estado inicial
		var estadosFinales = [];

		for (e1 in this.estados){
			estados.push(e1 + "-1");
			if (this.estadoInicial.nombre == e1){ //este se convierte en el estado inicial del nfa resultante
				estadoInicial = e1 + "-1";
			}
		}
		
		for (e2 in nfa.estados){
			estados.push(e2 + "-2");
			if (nfa.estadosFinales.hasOwnProperty(e2)){ //estos se convierten en los estados finales del nfa resultante
				estadosFinales.push(e2 + "-2");
			}
		}

		for (s in this.alfabeto){
			if (!nfa.alfabeto.hasOwnProperty(s)){
				throw "El alfabeto de entrada de ambos NFA deben ser iguales";
			}
		}

		//Se tiene que recorrer de nuevo, esta vez con los simbolos del otro DFA, porque puede ser que tengan los mismos simbolos solo que este tenga uno mas.
		for (s in nfa.alfabeto){
			if (!this.alfabeto.hasOwnProperty(s)){
				throw "El alfabeto de entrada de ambos NFA deben ser iguales";
			}
			alfabeto.push(s); //puede ser que el codigo tire exception despues de llenar algunos elementos del arreglo, pero no importa porque se termina la ejecucion. Llenamos el arreglo aqui mismo.
		}

		for (e1 in this.estados){
			for (t1 in this.estados[e1].transiciones){
				var estadosDestino = new Array();

				for (ef1 in this.estados[e1].transiciones[t1]){
					estadosDestino.push(this.estados[e1].transiciones[t1][ef1].nombre + "-1");
				}

				//aqui se crean las transiciones desde los estados finales del nfa1 al estado inicial del nfa2
				if (this.estadosFinales.hasOwnProperty(e1)){//si este estado es estado final del nfa1
					transiciones.push([e1 + "-1", null, [nfa.estadoInicial.nombre + "-2"]]); //metemos una transicion epsilon desde el hacia el estado inicial del nfa2
				}
				//podria ser que t1 sea null, entonces lo mas correcto seria meter esa nueva transicion en el arreglo estadosDestino, pero el constructor de NFA funciona aunque las transiciones esten separadas en varias lineas

				transiciones.push([e1 + "-1", (t1 === "null" ? null:t1), estadosDestino]);
			}
		}

		for (e2 in nfa.estados){
			for (t2 in nfa.estados[e2].transiciones){
				var estadosDestino = new Array();

				for (ef2 in nfa.estados[e2].transiciones[t2]){
					estadosDestino.push(nfa.estados[e2].transiciones[t2][ef2].nombre + "-2");
				}

				transiciones.push([e2 + "-2", (t2 === "null" ? null:t2), estadosDestino]);
			}
		}

		return new NFA(nombre, estados, alfabeto, transiciones, estadoInicial, estadosFinales);
	};

	this.complemento = function(){
		//este es cagado de risa. primero se convierte en DFA y luego se invierten los estados finales.
		//TODAVIA FALTA CONVERTIRLO A DFA. NO FUNCIONA TODAVIA
		var nombre = this.nombre + " *COMPLEMENTO*";

		var estados = [];
		var alfabeto = [];
		var transiciones = [];
		var estadoInicial = ""; //todos son arreglos menos este, ya que solo puede haber un estado inicial
		var estadosFinales = [];

		for (e1 in this.estados){
			estados.push(e1);
		}

		for (s in this.alfabeto){
			alfabeto.push(s); 
		}

		for (e1 in this.estados){
			for (t1 in this.estados[e1].transiciones){
				var estadosDestino = new Array();

				for (ef1 in this.estados[e1].transiciones[t1]){
					estadosDestino.push(this.estados[e1].transiciones[t1][ef1].nombre);
				}

				transiciones.push([e1, (t1 === "null" ? null:t1), estadosDestino]);
			}
		}

		estadoInicial = this.estadoInicial.nombre;

		//hasta ahorita, todo fue copy/paste de este nfa. la unica diferencia es que los estados finales ahora no son estados finales...y los que no eran ahora si lo son
		for (e1 in this.estados){
			if (this.estadosFinales.hasOwnProperty(e1) === false){ //si no es estado final de esta maquina
				estadosFinales.push(e1); //lo ponemos como estado final de la nueva maquina
			}
		}

		return new NFA(nombre, estados, alfabeto, transiciones, estadoInicial, estadosFinales);
	};

	this.estrella = function(){
		//se crea un nuevo estado inicial que se transiciona al viejo estado inicial con epsilon. luego, se agregan transiciones epsilon desde todos los estados finales al vijeo estado
		var nombre = this.nombre + " *ESTRELLA*";

		var estados = [];
		var alfabeto = [];
		var transiciones = [];
		var estadoInicial = ""; //todos son arreglos menos este, ya que solo puede haber un estado inicial
		var estadosFinales = [];

		for (e1 in this.estados){
			estados.push(e1);
		}

		estadoInicial = this.estadoInicial.nombre + "_0"; //el nuevo estado inicial
		estados.push(estadoInicial);

		for (s in this.alfabeto){ //alfabeto es igual
			alfabeto.push(s); 
		}

		for (e1 in this.estados){ //transiciones son iguales
			for (t1 in this.estados[e1].transiciones){
				var estadosDestino = new Array();

				for (ef1 in this.estados[e1].transiciones[t1]){
					estadosDestino.push(this.estados[e1].transiciones[t1][ef1].nombre);
				}

				transiciones.push([e1, (t1 === "null" ? null:t1), estadosDestino]);
			}
		}

		transiciones.push([estadoInicial, null, [this.estadoInicial.nombre]]); //transicion del nuevo q0 al viejo q0

		for (e1 in this.estados){
			if (this.estadosFinales.hasOwnProperty(e1)){
				estadosFinales.push(e1);
				transiciones.push([e1, null, [this.estadoInicial.nombre]]); //transiciones de los estados finales al viejo q0
			}
		}

		return new NFA(nombre, estados, alfabeto, transiciones, estadoInicial, estadosFinales);
	};

	this.convertirEnDFA = function(){
		throw "Esta funcion todavia no esta implementada";
	};

	this.probar = function(cadena){
		//funcion recursiva que pureba todas los posibles caminos hasta encontrar uno que acepta la cadena
		if (cadena instanceof Array){
			var resultado = {
				"acepta" : false,
				"transicionesTomadas" : []
			};

			recursar(cadena, this.estadoInicial, this.estadosFinales);
			return resultado;
		}else{
			throw "La cadena de entrada debe ser un arreglo de simbolos de entrada";
		}

		function recursar(cadena, estadoActual, estadosFinales){
			if ((cadena.length === 0) && (estadosFinales.hasOwnProperty(estadoActual.nombre))){
				resultado.acepta = true;
				return true;
			}else{
				if (cadena.length > 0){
					var siguienteSimbolo = cadena.splice(0,1)[0];

					for (e in estadoActual.transiciones[siguienteSimbolo]){
						resultado.transicionesTomadas.push("De '" + estadoActual.nombre + "' con '" + siguienteSimbolo + "' -> '" + estadoActual.transiciones[siguienteSimbolo][e].nombre + "'");
						if (recursar(cadena, estadoActual.transiciones[siguienteSimbolo][e], estadosFinales) === true){
							resultado.acepta = true;
							return true;
						}else{
							resultado.transicionesTomadas.pop();
						}
					}
					cadena.splice(0,0,siguienteSimbolo);
				}
				//ya probamos movernos desde el estado actual a todos los posibles estados con un simbolo del alfabeto.
				//no se logro encontrar una solcuion, entonces retornamos ese simbolo a la cadena y ahora
				//probamos con transiciones epsilon.

				siguienteSimbolo = null;

				for (e in estadoActual.transiciones[siguienteSimbolo]){
					resultado.transicionesTomadas.push("De '" + estadoActual.nombre + "' con '" + siguienteSimbolo + "' -> '" + estadoActual.transiciones[siguienteSimbolo][e].nombre + "'");
					if (recursar(cadena, estadoActual.transiciones[siguienteSimbolo][e], estadosFinales) === true){
						resultado.acepta = true;
						return true;
					}else{
						resultado.transicionesTomadas.pop();
					}
				}

				return false;
			}			
		}
	};

	this.generarDefinicion = function(){
		var definicion = "";

		var tipo = "NFA";
		var nombre = this.nombre;
		var estados = [];
		var simbolos = [];
		var transiciones = [];
		var estadoInicial = this.estadoInicial.nombre;
		var estadosFinales = [];

		for (e in this.estados){
			estados.push(e);

			for (t in this.estados[e].transiciones){
				var estadosDestino = [];
				for (ed in this.estados[e].transiciones[t]){
					estadosDestino.push(this.estados[e].transiciones[t][ed].nombre);
				}

				transiciones.push("(" + e + "," + (t === "null" ? "#":t) + ",(" + estadosDestino.join(",") + "))");
			}
		}

		for (s in this.alfabeto){
			simbolos.push(s);
		}

		for (e in this.estadosFinales){
			estadosFinales.push(e);
		}

		var definicion = tipo + "\n";
		definicion += nombre + "\n";
		definicion += estados.join(",") + "\n";
		definicion += simbolos.join(",") + "\n";
		definicion += transiciones.join(",") + "\n";
		definicion += estadoInicial + "\n";
		definicion += estadosFinales.join(",");

		return definicion;
	};
}

function Estado(nombre, transiciones){
	this.nombre = nombre;
	this.transiciones = transiciones;

	this.transicionar = function(simbolo){
		return this.transiciones[simbolo];
	};
}

function Simbolo(nombre){
	this.nombre = nombre;
}