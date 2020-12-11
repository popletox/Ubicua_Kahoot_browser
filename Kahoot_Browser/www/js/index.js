document.addEventListener('deviceready', function(){
	let user = null;
	let db = null;
	let tareaToModif = null;
	let nameToModif = null;

	getRedirectResult();
	document.querySelector('#btn_google_login').addEventListener('click', function(){
		const provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithRedirect(provider).then(()=>{
			getRedirectResult();
		});
	});

	function getRedirectResult(){
		firebase.auth().getRedirectResult().then((result)=>{
			if(result.credential){
				document.querySelector('#page_login').style.display = 'none';
				document.querySelector('#page_main').style.display = 'block';
				user = result.user;
				db = firebase.database();
				let root_ref = db.ref();

				const page_main = document.querySelector('#page_main');
				root_ref.child('/Tareas').on('child_added', function(child_snapshot, prev_child_key){
					let data = child_snapshot.val();
					//Solo mostramos las tareas que ha creado el usuario
					if(data.userMail == user.email){
						let el = document.createElement('p');
						el.innerHTML = data.name;
						el.innerHTML = el.innerHTML + "<button class='botonModif'> modificar tarea </button>" + "<button class='botonBorrar'> borrar tarea </button>";
						//Modificar una tarea
						el.childNodes[1].addEventListener('click', function(){
							tareaToModif = child_snapshot.ref;
							nameToModif = child_snapshot.val().name;
							document.querySelector('#page_main').style.display = 'none';
							document.querySelector('#page_modif_task').style.display = 'block';
						});
						//Borrar una tarea
						el.childNodes[2].addEventListener('click', function(){
							child_snapshot.ref.remove();
							el.remove();
						});
						page_main.appendChild(el);
					}
				});
				
				root_ref.child('/Tareas').on('child_changed', function(child_snapshot, prev_child_key){
					let data = child_snapshot.val();
					paragrafs = document.querySelector('#page_main').getElementsByTagName('p');
					p = null;
					//console.log(nameToModif);
					for(let i = 0; i < paragrafs.length; i++){
						if(paragrafs[i].innerHTML.includes(nameToModif)){
							paragrafs[i].innerHTML = paragrafs[i].innerHTML.replace(nameToModif, child_snapshot.val().name);
						}
					}
				})
			}
		}).catch((error)=>{
			console.log(error);
		});
	}


	document.querySelector('#btn_add_task').addEventListener('click',function(){
		document.querySelector('#page_add_task').style.display = "block";
		document.querySelector('#page_main').style.display = "none";
	});

	document.querySelector('#btn_done_add').addEventListener('click',function(){
		var root_ref = db.ref();
		var task_name = document.querySelector("#task_name").value;
		//Comprobamos que haya algo escrito
		if(task_name != ""){
			root_ref.child('/Tareas').push().set({name:task_name, userMail: user.email});
			document.querySelector("#task_name").value = "";
			document.querySelector('#text_error_add').style.display = "none";
			document.querySelector('#page_add_task').style.display = "none";
			document.querySelector('#page_main').style.display = "block";
		}else{
			document.querySelector('#text_error_add').style.display = "block";
		}
	});
	
	//Boton para cancelar la creacion de una tarea
	document.querySelector('#btn_cancel_add').addEventListener('click', function(){
		document.querySelector("#task_name").value = "";
		document.querySelector('#text_error_add').style.display = "none";
		document.querySelector('#page_add_task').style.display = "none";
		document.querySelector('#page_main').style.display = "block";
	});
	
	document.querySelector('#btn_done_modif').addEventListener('click', function(){
		var ref = db.ref(tareaToModif);
		var task_name = document.querySelector("#new_task_name").value;
		//console.log(task_name);
		if(task_name != ""){
			ref.update({name:task_name});
			document.querySelector("#new_task_name").value = "";
			document.querySelector('#text_error_modif').style.display = "none";
			document.querySelector('#page_modif_task').style.display = "none";
			document.querySelector('#page_main').style.display = "block";
		}else{
			document.querySelector('#text_error_modif').style.display = "block";
		}
	});
	
	//Boton para cancelar la modificacion de una tarea
	document.querySelector('#btn_cancel_modif').addEventListener('click', function(){
		document.querySelector("#new_task_name").value = "";
		document.querySelector('#text_error_modif').style.display = "none";
		document.querySelector('#page_modif_task').style.display = "none";
		document.querySelector('#page_main').style.display = "block";
	});
	

});