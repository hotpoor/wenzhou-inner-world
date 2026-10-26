import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
const models={door:{name:'门',path:'models/门.glb',type:'GLB'},access:{name:'门禁',path:'models/门禁.fbx',type:'FBX'}};
const stage=document.querySelector('#stage'),status=document.querySelector('#status');
try{
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x1f1f1f);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;stage.append(renderer.domElement);
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(40,1,.01,1000);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.autoRotateSpeed=1;
scene.add(new THREE.HemisphereLight(0xffffff,0x85858f,3));for(const [x,y,z,power] of [[4,6,5,4],[-4,2,-3,2]]){const light=new THREE.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light)}
const grid=new THREE.GridHelper(12,24,0x666666,0x363636);grid.position.y=-1.55;scene.add(grid);let current,token=0;
function reset(){camera.position.set(4,2.5,5);controls.target.set(0,0,0);controls.update()}
function dispose(root){root.traverse(n=>{n.geometry?.dispose();for(const m of Array.isArray(n.material)?n.material:n.material?[n.material]:[]){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose()}})}
async function load(key){const id=++token,m=models[key];status.textContent='正在加载'+m.name+'…';document.querySelector('#info').textContent='';for(const b of document.querySelectorAll('[data-model]'))b.setAttribute('aria-pressed',String(b.dataset.model===key));document.querySelector('#download').href=m.path;if(current){scene.remove(current);dispose(current);current=null}try{const loaded=await (m.type==='GLB'?new GLTFLoader():new FBXLoader()).loadAsync(m.path);const object=loaded.scene||loaded;if(id!==token){dispose(object);return}const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());if(box.isEmpty())throw Error('模型没有可见几何体');const scale=3/Math.max(size.x,size.y,size.z);const wrapper=new THREE.Group();wrapper.add(object);object.position.sub(center);wrapper.scale.setScalar(scale);scene.add(wrapper);current=wrapper;reset();status.textContent='';let meshes=0;object.traverse(n=>{if(n.isMesh)meshes++});document.querySelector('#info').textContent=m.name+' · '+m.type+' · '+meshes+' 个网格';window.viewerState={loaded:key,meshes};}catch(error){if(id===token){status.textContent='模型加载失败：'+error.message+'。可下载原文件后重试。';window.viewerState={error:error.message}}}}
for(const button of document.querySelectorAll('[data-model]'))button.onclick=()=>load(button.dataset.model);document.querySelector('#reset').onclick=reset;document.querySelector('#rotate').onchange=e=>controls.autoRotate=e.target.checked;
new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}).observe(stage);
renderer.setAnimationLoop(()=>{if(document.hidden)return;controls.update();renderer.render(scene,camera)});load('door');
}catch(error){status.textContent='三维预览无法启动：'+error.message+'。请使用支持 WebGL 的浏览器，或下载原始模型。'}
