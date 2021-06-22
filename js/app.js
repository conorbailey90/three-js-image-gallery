import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import composerVertex from './shaders/composerVertex.glsl';
import composerFragment from './shaders/composerFragment.glsl';

import images from './images';

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

  let isMobile = window.mobileCheck()
  alert(isMobile)


const grid = document.querySelector('.grid');
grid.style.transform = `translate3d(0px, 0px, 0)`;
const gridItems = [...document.querySelectorAll('.grid-item')];

// set background on all images
// gridItems.forEach((item, idx) => {
//     let image = document.createElement('img');
//     image.src = images[idx]
//     item.appendChild(image);
// })

gridItems.forEach((item, idx) => {
   item.style.backgroundImage = images[idx]
})


function lerp(start, end, t){
    return start * ( 1 - t ) + end * t;
}

// Mouse coordinates set by mousemove.

const mouse = {
    x: null,
    y: null
}

const touch = {
    translateX: 0,
    translateY:0,
    startX: null,
    startY: null,
    gridStartX: 0,
    gridStartY: 0,

    endX: 0,
    endY: 0,
    gridX: 0,
    gridY: 0
}

if(isMobile){
    window.addEventListener('touchstart', (e) =>{
        touch.translateY = 0;
        touch.translateX =0;
        touch.startX = e.touches[0].clientX;
        touch.startY = e.touches[0].clientY;
        touch.gridStartX = parseInt(grid.style.transform.split('(')[1].split(',')[0].slice(0,- 2));
        touch.gridStartY = parseInt(grid.style.transform.split('(')[1].split(',')[1].slice(0,- 2));
    })
    
    window.addEventListener('touchmove', (e)=>{
        touch.translateX =  (touch.startX - e.touches[0].clientX) * 2.5 ;
        touch.translateY =  (touch.startY - e.touches[0].clientY ) * 2.5;
    })
    
}else{
    window.addEventListener('mousemove', (e) => {
        // subtracting height and width / 2 so we can translate grid dive negatively
        mouse.x = e.clientX - (window.innerWidth / 2);
        mouse.y = e.clientY - (window.innerHeight / 2)
    })
}

function touchTranslateGrid(){
   
     grid.style.transform = `translate3d(${touch.gridX}px, ${touch.gridY}px, 0)`;
    let currentX = parseInt(grid.style.transform.split('(')[1].split(',')[0].slice(0,- 2));
    let currentY = parseInt(grid.style.transform.split('(')[1].split(',')[1].slice(0,- 2))
    touch.gridX = lerp(currentX, touch.gridStartX - touch.translateX, 0.045);
    touch.gridY = lerp(currentY, touch.gridStartY - touch.translateY, 0.045);

    // Stop grid from being translated out of bounds
    if(touch.gridX > window.innerWidth * 1.2) touch.gridX = window.innerWidth * 1.2
    if(touch.gridX < -(window.innerWidth * 1.2)) touch.gridX = -(window.innerWidth * 1.2)
    if(touch.gridY > window.innerHeight * 1.6) touch.gridY = window.innerHeight * 1.6
    if(touch.gridY < -(window.innerHeight * 1.6)) touch.gridY = -(window.innerHeight * 1.6)
  
}

let currentX = 0;
let currentY = 0;

// This function is repeatidly called by the webGL class render method.
function translateGrid(){
    
    currentX = lerp(currentX, mouse.x, 0.015);
    currentY = lerp(currentY, mouse.y, 0.015);
    grid.style.transform = `translate3d(${-currentX * 3}px, ${-currentY *3}px, 0)`;
}



class WebGL{
    constructor(){
        this.container = document.querySelector('main');
        // this.gridItems = [...document.querySelectorAll('.grid-item > img')];
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
        if(isMobile){
            touchTranslateGrid()
        }else{
            translateGrid();
        }
        // translateGrid();
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