var listaDeDFA = {};	//lista global de todos los dfa
var listaDeNFA = {};	//lista global de todos los nfa

function mostrarErrorDeConstruccion(mensaje){
	var html = "";
	html += '<div class="alert alert-error">';
	html += '<button type="button" class="close" data-dismiss="alert">&times;</button>';
	html += mensaje;
	html += '</div>';

	$('#MensajeDeConstruccion').html(html);
}

function mostrarErrorDeAnimacion(mensaje) {
    var html = "";
    html += '<div class="alert alert-error">';
    html += '<button type="button" class="close" data-dismiss="alert">&times;</button>';
    html += mensaje;
    html += '</div>';

    $('#MensajeDeAnimacion').html(html);
}

function mostrarExitoDeConstruccion(mensaje){
	var html = "";
	html += '<div class="alert alert-success">';
	html += '<button type="button" class="close" data-dismiss="alert">&times;</button>';
	html += mensaje;
	html += '</div>';
	
	$('#MensajeDeConstruccion').html(html);
}

function mostrarExitoDeAnimacion(mensaje) {
    var html = "";
    html += '<div class="alert alert-success">';
    html += '<button type="button" class="close" data-dismiss="alert">&times;</button>';
    html += mensaje;
    html += '</div>';

    $('#MensajeDeAnimacion').html(html);
}

function esconderMensajeDeConstruccion(){
	$('#MensajeDeConstruccion').html("");
}

function validarSintaxis(partes){
	var tipoRegex = /^(DFA|NFA)$/;
	var nombreRegex = /^[a-zA-Z0-9 ,'\(\)\*\+]+$/;
	var estadosRegex = /^[a-zA-Z0-9\-_]+(,[a-zA-Z0-9\-_]+)*$/;
	var alfabetoRegex = /^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/;
	var transicionesDfaRegex = /^\([a-zA-Z0-9\-_]+,[a-zA-Z0-9]+,[a-zA-Z0-9\-_]+\)(,\([a-zA-Z0-9\-_]+,[a-zA-Z0-9]+,[a-zA-Z0-9\-_]+\))*$/;
	var transicionesNfaRegex = /^\([a-zA-Z0-9\-_]+,([a-zA-Z0-9]+|#),\([a-zA-Z0-9\-_]+(,[a-zA-Z0-9\-_]+)*\)\)(,\([a-zA-Z0-9\-_]+,([a-zA-Z0-9]+|#),\([a-zA-Z0-9\-_]+(,[a-zA-Z0-9\-_]+)*\)\))*$/;
	var estadoInicialRegex = /^[a-zA-Z0-9\-_]+$/
	var estadosFinalesRegex = /^[a-zA-Z0-9\-_]+(,[a-zA-Z0-9\-_]+)*$/;

	if (partes.length === 7){
		if (tipoRegex.test(partes[0])){
			if (nombreRegex.test(partes[1])){
				if (estadosRegex.test(partes[2])){
					if (alfabetoRegex.test(partes[3])){
						if (transicionesDfaRegex.test(partes[4])){
							if (partes[0] === "DFA"){
								if (estadoInicialRegex.test(partes[5])){
									if (estadosFinalesRegex.test(partes[6])){
										return true;
									}else{
										throw "Error de sintaxis en la linea 7: El formato de los estados finales debe ser una lista CSV de estados";
									}
								}else{
									throw "Error de sintaxis en la linea 6: El estado inicial debe ser un unico estado";
								}
							}else{
								throw "Error de sintaxis en la linea 5: El formato de las transiciones no concuerda con el tipo del automata (" + partes[0] + ")";
							}
						}else if (transicionesNfaRegex.test(partes[4])){
							if (partes[0] === "NFA"){
								if (estadoInicialRegex.test(partes[5])){
									if (estadosFinalesRegex.test(partes[6])){
										return true;
									}else{
										throw "Error de sintaxis en la linea 7: El formato de los estados finales debe ser una lista CSV de estados";
									}
								}else{
									throw "Error de sintaxis en la linea 6: El estado inicial debe ser uno de los estados existente";
								}
							}else{
								throw "Error de sintaxis en la linea 5: El formato de las transiciones no concuerda con el tipo del automata (" + partes[0] + ")";	
							}
						}else{
							throw "Error de sintaxis en la linea 5: El formato de las transiciones es una lista CSV de transiciones de la forma (q1,s,q2) o (q1,s,(q2,q3,q4)) para DFA's o NFA's, respectivamente";
						}
					}else{
						throw "Error de sintaxis en la linea 4: El formato del alfabeto debe ser una lista CSV de simbolos que tengan solamente caracteres alfanumericos";
					}
				}else{
					throw "Error de sintaxis en la linea 3: El formato de los estados debe ser una lista CSV de estados que tengan solamente caracteres alfanumericos, guiones y guiones bajos";
				}
			}else{
				throw "Error de sintaxis en la linea 2: El nombre del automata solo debe contener caracteres alfanumericos, espacios, comas y: + * ( )";
			}
		}else{
			throw "Error de sintaxis en linea 1: El tipo de automata debe ser \"DFA\" o \"NFA\". Se encontro \"" + partes[0] + "\"";
		}
	}else{
		throw "Error de sintaxis: Deben haber exactamente 7 lineas de entrada";
	}
}

function crearAutomata(entrada){
	var partes = entrada.split(/[\r\n|\r|\n]+/);
	for (var i = 0; i < partes.length; i++){
		partes[i] = partes[i].trim();
	}

	validarSintaxis(partes);

	var tipo = partes[0];
	var nombre = partes[1];
	var estados = partes[2].split(",");
	var simbolos = partes[3].split(",");
	var transiciones = partes[4].split(/\),/g);
	var estadoInicial = partes[5];
	var estadosFinales = partes[6].split(",");

	if (tipo === "DFA"){
		for (var i = 0; i < transiciones.length; i++){
			transiciones[i] = transiciones[i].replace(/[\(\)]/g,"");
			transiciones[i] = transiciones[i].split(",");
		}

		return new DFA(nombre,estados,simbolos,transiciones,estadoInicial,estadosFinales);
	}else if (tipo === "NFA"){
		for (var i = 0; i < transiciones.length; i++){
			transiciones[i] = transiciones[i].replace(/[\(\)]/g,"");
			transiciones[i] = transiciones[i].split(",");
			transiciones[i] = [transiciones[i][0], (transiciones[i][1] == "#" ? null:transiciones[i][1]), transiciones[i].slice(2)];
		}

		console.log(transiciones);
		return new NFA(nombre,estados,simbolos,transiciones,estadoInicial,estadosFinales);

	}
}

function automataYaExiste(automata){
	if (automata.tipo === "DFA"){
		return listaDeDFA.hasOwnProperty(automata.nombre);
	}else if (automata.tipo === "NFA"){
		return listaDeNFA.hasOwnProperty(automata.nombre);
	}
}

function actualizarMenuDeDFA(){
	$('#ListaDeDFA').slideUp("fast", function(){
		$("#ListaDeDFA").html("");
		var html = "";

		for (dfa in listaDeDFA){
			var otros = [];
			for (otro in listaDeDFA){
				if (otro !== dfa){
					otros.push(listaDeDFA[otro]);
				}
			}

			html += '<li class="dropdown">';
			html += '<a data-toggle="dropdown" class="dropdown-toggle" href="#">' + listaDeDFA[dfa].nombre + '<b class="caret"></b></a>';
			html += '<ul class="dropdown-menu">';
			html += '<li class="nav-header">Acciones</li>';
			html += '<li onclick="verDFA(\'' + dfa + '\');"><a href="#">Ver</a></li>';
			html += '<li onclick="eliminarDFA(\'' + dfa + '\');"><a href="#">Eliminar</a></li>';
			html += '<li class="nav-header">Operaciones</li>';
			html += '<li class="dropdown-submenu">';
			html += '<a href="#">Union</a>';
			html += '<ul class="dropdown-menu">';
			
			for (var i = 0; i < otros.length; i++){
				html += '<li onclick="unirDFA(\'' + dfa + '\',\'' + otros[i].nombre + '\');"><a href="#">' + otros[i].nombre + '</a></li>';
			}

			html += '</ul>';
			html += '</li>';
			html += '<li class="dropdown-submenu">';
			html += '<a href="#">Interseccion</a>';
			html += '<ul class="dropdown-menu">';
			
			for (var i = 0; i < otros.length; i++){
				html += '<li onclick="intersectarDFA(\'' + dfa + '\',\'' + otros[i].nombre + '\');"><a href="#">' + otros[i].nombre + '</a></li>';
			}

			html += '</ul>';
			html += '</li>';
			html += '<li class="dropdown-submenu">';
			html += '<a href="#">Concatenacion</a>';
			html += '<ul class="dropdown-menu">';
			
			for (var i = 0; i < otros.length; i++){
				html += '<li onclick="concatenarDFA(\'' + dfa + '\',\'' + otros[i].nombre + '\');"><a href="#">' + otros[i].nombre + '</a></li>';
			}
		    
		    html += '</ul>';
			html += '</li>';
		                
			html += '<li onclick="complementarDFA(\'' + dfa + '\');"><a href="#">Complemento</a></li>';
			html += '<li onclick="estrellarDFA(\'' + dfa + '\');"><a href="#">Estrella</a></li>';
			html += '</ul>';
			html += '</li>';
		}

		$("#ListaDeDFA").html(html);
		$("#ListaDeDFA").slideDown("fast");
	});
}

function actualizarMenuDeNFA(){
	$('#ListaDeNFA').slideUp("fast", function(){
		$("#ListaDeNFA").html("");
		var html = "";

		for (nfa in listaDeNFA){
			var otros = [];
			for (otro in listaDeNFA){
				if (otro !== nfa){
					otros.push(listaDeNFA[otro]);
				}
			}

			html += '<li class="dropdown">';
			html += '<a data-toggle="dropdown" class="dropdown-toggle" href="#">' + listaDeNFA[nfa].nombre + '<b class="caret"></b></a>';
			html += '<ul class="dropdown-menu">';
			html += '<li class="nav-header">Acciones</li>';
			html += '<li onclick="verNFA(\'' + nfa + '\');"><a href="#">Ver</a></li>';
			html += '<li onclick="eliminarNFA(\'' + nfa + '\');"><a href="#">Eliminar</a></li>';
			html += '<li class="nav-header">Operaciones</li>';
			html += '<li class="dropdown-submenu">';
			html += '<a href="#">Union</a>';
			html += '<ul class="dropdown-menu">';
			
			for (var i = 0; i < otros.length; i++){
				html += '<li onclick="unirNFA(\'' + nfa + '\',\'' + otros[i].nombre + '\');"><a href="#">' + otros[i].nombre + '</a></li>';
			}

			html += '</ul>';
			html += '</li>';
			html += '<li class="dropdown-submenu">';
			html += '<a href="#">Interseccion</a>';
			html += '<ul class="dropdown-menu">';
			
			for (var i = 0; i < otros.length; i++){
				html += '<li onclick="intersectarNFA(\'' + nfa + '\',\'' + otros[i].nombre + '\');"><a href="#">' + otros[i].nombre + '</a></li>';
			}

			html += '</ul>';
			html += '</li>';
			html += '<li class="dropdown-submenu">';
			html += '<a href="#">Concatenacion</a>';
			html += '<ul class="dropdown-menu">';
			
			for (var i = 0; i < otros.length; i++){
				html += '<li onclick="concatenarNFA(\'' + nfa + '\',\'' + otros[i].nombre + '\');"><a href="#">' + otros[i].nombre + '</a></li>';
			}
		    
		    html += '</ul>';
			html += '</li>';
		                
			html += '<li onclick="complementarNFA(\'' + nfa + '\');"><a href="#">Complemento</a></li>';
			html += '<li onclick="estrellarNFA(\'' + nfa + '\');"><a href="#">Estrella</a></li>';
			html += '</ul>';
			html += '</li>';
		}

		$("#ListaDeNFA").html(html);
		$("#ListaDeNFA").slideDown("fast");
	});
}