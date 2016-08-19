/* VR */
var pointLight;
var dae;
var daeTwo;
var textureEquirec;

// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
var renderer = new THREE.WebGLRenderer({antialias: false});
renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

// Append the canvas element created by the renderer to document body element.
document.body.appendChild(renderer.domElement);

// Create a three.js scene.
var scene = new THREE.Scene();
// Create a three.js camera.
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Texture Skybox
var textureEquirec;


// Get the VRDisplay and save it for later.
var vrDisplay = null;
navigator.getVRDisplays().then(function(displays) {
  if (displays.length > 0) {
    vrDisplay = displays[0];
  }
});

/* Collada */
var loaderCollada = new THREE.ColladaLoader();
		loaderCollada.options.convertUpAxis = true;
		loaderCollada.load('./assets/models/soccer.dae',
			function (collada) {
				dae = collada.scene;
				dae.traverse( function ( child ) {
					if (child instanceof THREE.SkinnedMesh) {
						var animation = new THREE.Animation(child, child.geometry.animation);
						animation.play();
					}
				});

			dae.scale.x = dae.scale.y = dae.scale.z = 0.35;
			dae.position.z = -1;

			dae.updateMatrix();

			addDae();

		});

function addDae() {
	scene.add(dae);

	var loaderColladaTwo = new THREE.ColladaLoader();
		loaderColladaTwo.options.convertUpAxis = true;
		loaderColladaTwo.load('./assets/models/test.dae',
			function (collada) {
				daeTwo = collada.scene;
				daeTwo.traverse( function ( child ) {
					if (child instanceof THREE.SkinnedMesh) {
						var animation = new THREE.Animation(child, child.geometry.animation);
						animation.play();
					}
				});

			daeTwo.scale.x = daeTwo.scale.y = daeTwo.scale.z = 0.25;
			daeTwo.position.z = 1;

			daeTwo.updateMatrix();

			init();
			
		});
}

function init() {
		scene.add(daeTwo);
		// Lights
		scene.add(new THREE.AmbientLight(0xFFFFFF));
		pointLight = new THREE.PointLight(0xFF3300, 2.5, 50);
		pointLight.position.set(1, 0.5, 0);
		scene.add(pointLight);

		pointLight = new THREE.PointLight(0xFF5500, 1, 70);
		pointLight.position.set(-1, -0.5, 0);
		scene.add(pointLight);

		// ----------------- TEXTURE SKYBOX
		var textureLoader = new THREE.TextureLoader();
		textureEquirec = textureLoader.load('./assets/img/textures/field_pano_3.jpg');
		textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
		textureEquirec.magFilter = THREE.LinearFilter;
		textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

		var equirectShader = THREE.ShaderLib[ "equirect" ];
		var equirectMaterial = new THREE.ShaderMaterial( {
			fragmentShader: equirectShader.fragmentShader,
			vertexShader: equirectShader.vertexShader,
			uniforms: equirectShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});

		equirectMaterial.uniforms[ "tEquirect" ].value = textureEquirec;

		var geometry = new THREE.SphereGeometry( 400.0, 24, 24 );
		sphereMaterial = new THREE.MeshLambertMaterial( { envMap: textureEquirec } );
		sphereMesh = new THREE.Mesh( geometry, sphereMaterial );
		scene.add( sphereMesh );

		cubeMesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), sphereMaterial );
		scene.add( cubeMesh );

		textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
		cubeMesh.material = equirectMaterial;
		cubeMesh.visible = true;
		sphereMaterial.envMap = textureEquirec;
		sphereMaterial.needsUpdate = true;

		// Set material dae[Collada]
		setMaterial(dae, new THREE.MeshLambertMaterial( { color: 0xFFF8D2, envMap: textureEquirec }));
		setMaterial(daeTwo, new THREE.MeshLambertMaterial( { color: 0xFFF8D2, envMap: textureEquirec }));

		function setMaterial(node, material) {
			node.material = material;
			
			if (node.children) {
				for (var i = 0; i < node.children.length; i++) {
					setMaterial(node.children[i], material);
				}
			}
		}
		// Init animation
		requestAnimationFrame(animate);	
	}

/* VR */
// Request animation frame loop function
var lastRender = 0;
function animate(timestamp) {
  var delta = Math.min(timestamp - lastRender, 500);
  lastRender = timestamp;

  dae.rotation.y += delta * 0.0002;
  daeTwo.rotation.y += delta * 0.0002;

  // Update VR headset position and apply to camera.
  controls.update();

  // Render the scene.
  effect.render(scene, camera);

  // Keep looping.
  requestAnimationFrame(animate);
}

function onResize() {
  console.log('Resizing to %s x %s.', window.innerWidth, window.innerHeight);
  effect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function onVRDisplayPresentChange() {
  console.log('onVRDisplayPresentChange');
  onResize();
}

// Resize the WebGL canvas when we resize and also when we change modes.
window.addEventListener('resize', onResize);
window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);

// Button click handlers.
document.querySelector('button#fullscreen').addEventListener('click', function() {
  enterFullscreen(renderer.domElement);
});
document.querySelector('button#vr').addEventListener('click', function() {
  vrDisplay.requestPresent([{source: renderer.domElement}]);
});
document.querySelector('button#reset').addEventListener('click', function() {
  vrDisplay.resetPose();
});

function enterFullscreen (el) {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}

