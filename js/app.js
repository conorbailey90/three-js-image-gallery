import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import composerVertex from './shaders/composerVertex.glsl';
import composerFragment from './shaders/composerFragment.glsl';

import images from './images';

const grid = document.querySelector('.grid');
const gridItems = [...document.querySelectorAll('.grid-item')];

// set background on all images
gridItems.forEach((item, idx) => {
    item.style.backgroundImage = `url(./${images[idx]})`
})

function lerp(start, end, t){
    return start * ( 1 - t ) + end * t;
}

// Mouse coordinates set by mousemove.

const mouse = {
    x: null,
    y: null
}

window.addEventListener('mousemove', (e) => {
    // subtracting height and width / 2 so we can translate grid dive negatively
    mouse.x = e.clientX - (window.innerWidth / 2);
    mouse.y = e.clientY - (window.innerHeight / 2)
})

let currentX = 0;
let currentY = 0;

// This function is repeatidly called by the webGL class render method.
function translateGrid(){
    currentX = lerp(currentX, mouse.x, 0.055);
    currentY = lerp(currentY, mouse.y, 0.055);
    grid.style.transform = `translate3d(${-currentX}px, ${-currentY}px, 0)`;
}



class WebGL{
    constructor(){
        this.container = document.querySelector('main');
        this.gridItems = [...document.querySelectorAll('.grid-item')];
        this.meshItems = [];
        this.scene = new THREE.Scene();
        this.perspective = 1000;
        
        this.setupCamera();
        this.createMeshItems();
        this.composerPass();
        this.render()
    }

    get viewport(){
        let width = window.innerWidth;
        let height = window.innerHeight;
        let aspectRatio = width / height;

        return{
            width, 
            height, 
            aspectRatio
        }
    }

    setupCamera(){
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    
        // Create new scene
        this.scene = new THREE.Scene();
    
        // Initialize perspective camera
        const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / this.perspective))) / Math.PI; // see fov image for a picture breakdown of this fov setting.
        this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspectRatio, 1, 1000)
        this.camera.position.set(0, 0, this.perspective); // set the camera position on the z axis.
        
        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.viewport.width, this.viewport.height); // uses the getter viewport function above to set size of canvas / renderer
        this.renderer.setPixelRatio(window.devicePixelRatio); // Importamt to ensure image textures do not appear blurred.
        this.container.appendChild(this.renderer.domElement); // append the canvas to the main element
    }

    onWindowResize(){
        // Reset camera fov and aspect ratio on window resize.
        this.camera.aspect = this.viewport.aspectRatio;
        this.camera.fov = (180 * (2 * Math.atan(this.viewport.height / 2 / this.perspective))) / Math.PI;
        this.renderer.setSize(this.viewport.width, this.viewport.height);   
        this.camera.updateProjectionMatrix();
    }

    createMeshItems(){
        // Loop through all images and create new MeshItem instances. Push these instances to the meshItems array.
        this.gridItems.forEach((item, idx) => {
            let meshItem = new MeshItem(item, idx, this.scene);
            this.meshItems.push(meshItem);
        })
    }

    composerPass(){
        // Use for post processing effetcs to the viewport
        this.composer = new EffectComposer(this.renderer);
        // RenderPass is normally placed at the beginning of the chain in order to provide the rendered scene as an input for the next post-processing step. In this case the custom shaderpass
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        this.myEffect = {
            uniforms: {
                tDiffuse: {value: null},
            },
            vertexShader: composerVertex,
            fragmentShader: composerFragment
        }
        this.customPass = new ShaderPass(this.myEffect);
        this.customPass.renderToScreen = true;
        this.composer.addPass(this.customPass);
    }

      // Animate smoothscroll and meshes. Repeatedly called using requestanimationdrame
      render(){
      
        for(let i = 0; i < this.meshItems.length; i++){
            this.meshItems[i].render();
        }
        translateGrid();
        // this.renderer.render(this.scene, this.camera)
        this.composer.render()
        requestAnimationFrame(this.render.bind(this));
    } 

}

class MeshItem{
    // Pass in the scene as we will be adding meshes to this scene.
    constructor(element, index, scene){
        this.element = element;
        this.index = index;
        this.scene = scene;
        this.offset = new THREE.Vector2(0,0); // Positions of mesh on screen. Will be updated below.
        this.sizes = new THREE.Vector2(0,0); //Size of mesh on screen. Will be updated below.
        this.createMesh();
    }

    getDimensions(){
        const {width, height, top, left} = this.element.getBoundingClientRect();
        this.sizes.set(width, height);
        // Adjust mesh positions to align three js coordinates with normal coordinates.
        this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2); 
    }

    createMesh(){
        this.geometry = new THREE.PlaneBufferGeometry(1,1,10,10);
        this.imageTexture = new THREE.TextureLoader().load(images[this.index]);
        this.uniforms = {
            uTexture: {
                //texture data
                value: this.imageTexture
              },
              uOffset: {
                //distortion strength
                value: new THREE.Vector2(0.0, 0.0)
              },
              uAlpha: {
                //opacity
                value: 1.
              }
        };
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            // wireframe: true,
            side: THREE.DoubleSide,
        })
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.getDimensions(); // set offsetand sizes for placement on the scene
        this.mesh.position.set(this.offset.x, this.offset.y, 0);
		this.mesh.scale.set(this.sizes.x, this.sizes.y, 0);
        this.scene.add( this.mesh );
    }

    render(){
        // this function is repeatidly called for each instance in the aboce 
        this.getDimensions();
        this.mesh.position.set(this.offset.x, this.offset.y, 0)
		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)
        this.uniforms.uOffset.value.set(-(mouse.x- currentX) * 0.0003, (mouse.y- currentY) * 0.0003 )
    }
}

new WebGL()