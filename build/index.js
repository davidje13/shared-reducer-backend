!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("shared-reducer-backend",[],t):"object"==typeof exports?exports["shared-reducer-backend"]=t():e["shared-reducer-backend"]=t()}(global,(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=3)}([function(e,t){e.exports=require("json-immutability-helper")},function(e,t){e.exports=require("crypto")},function(e,t){e.exports=require("events")},function(e,t,r){e.exports=r(4)},function(e,t,r){"use strict";r.r(t),r.d(t,"Broadcaster",(function(){return p})),r.d(t,"websocketHandler",(function(){return j})),r.d(t,"PING",(function(){return g})),r.d(t,"PONG",(function(){return O})),r.d(t,"InMemoryModel",(function(){return S})),r.d(t,"CollectionStorageModel",(function(){return E})),r.d(t,"PermissionError",(function(){return q})),r.d(t,"ReadOnly",(function(){return C})),r.d(t,"ReadWrite",(function(){return b})),r.d(t,"ReadWriteStruct",(function(){return k})),r.d(t,"AsyncTaskQueue",(function(){return d})),r.d(t,"TaskQueueMap",(function(){return l})),r.d(t,"InMemoryTopic",(function(){return f})),r.d(t,"TrackingTopicMap",(function(){return h})),r.d(t,"UniqueIdProvider",(function(){return s}));var n=r(0),i=r(1),a=r.n(i);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}class s{constructor(){o(this,"shared",a.a.randomBytes(8).toString("hex")),o(this,"unique",0)}get(){const e=this.unique;return this.unique+=1,`${this.shared}-${e}`}}var c=r(2);function u(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}class d extends c.EventEmitter{constructor(...e){super(...e),u(this,"queue",[]),u(this,"running",!1)}push(e){return new Promise((t,r)=>{this.queue.push({task:e,resolve:t,reject:r}),this.running||this.internalConsumeQueue()})}async internalConsumeQueue(){for(this.running=!0;this.queue.length>0;){const{task:e,resolve:t,reject:r}=this.queue.shift();let n=null,i=!1;try{n=await e(),i=!0}catch(e){r(e)}i&&t(n)}this.running=!1,this.emit("drain")}}class l{constructor(e=(()=>new d)){var t,r,n;this.queueFactory=e,t=this,r="queues",n=new Map,r in t?Object.defineProperty(t,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[r]=n}push(e,t){let r=this.queues.get(e);return r||(r=this.queueFactory(),r.on("drain",()=>{this.queues.delete(e)}),this.queues.set(e,r)),r.push(t)}}class h{constructor(e){var t,r,n;this.topicFactory=e,t=this,r="data",n=new Map,r in t?Object.defineProperty(t,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[r]=n}async add(e,t){let r=this.data.get(e);r||(r=this.topicFactory(e),this.data.set(e,r)),await r.add(t)}async remove(e,t){const r=this.data.get(e);if(r){await r.remove(t)||this.data.delete(e)}}async broadcast(e,t){const r=this.data.get(e);r&&await r.broadcast(t)}}class f{constructor(){var e,t,r;e=this,t="subscribers",r=new Set,t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r}add(e){this.subscribers.add(e)}remove(e){return this.subscribers.delete(e),this.subscribers.size>0}broadcast(e){this.subscribers.forEach(t=>t(e))}}var b={validateWrite(){}};class p{constructor(e,t=new h(()=>new f),r=new l,n=new s){this.model=e,this.subscribers=t,this.taskQueues=r,this.idProvider=n}async subscribe(e,t,r=b){let n=await this.model.read(e);if(!n)return null;const i=this.idProvider.get(),a=({message:e,source:r,meta:n})=>{r===i?t(e,n):e.change&&t(e,void 0)};return this.subscribers.add(e,a),{getInitialData:()=>{if(!n)throw new Error("Already fetched initialData");const e=n;return n=null,e},send:(t,n)=>this.internalQueueChange(e,t,r,i,n),close:async()=>{await this.subscribers.remove(e,a)}}}update(e,t,r=b){return this.internalQueueChange(e,t,r,null,void 0)}async internalApplyChange(e,t,r,i,a){try{const i=await this.model.read(e);if(!i)throw new Error("Deleted");r.validateWriteSpec&&r.validateWriteSpec(t);const a=Object(n.update)(i,t),o=this.model.validate(a);r.validateWrite(o,i),await this.model.write(e,o,i)}catch(t){return void this.subscribers.broadcast(e,{message:{error:t.message},source:i,meta:a})}this.subscribers.broadcast(e,{message:{change:t},source:i,meta:a})}async internalQueueChange(e,t,r,n,i){return this.taskQueues.push(e,()=>this.internalApplyChange(e,t,r,n,i))}}function y(e){return"object"==typeof e&&Boolean(e)}function w(e){return function(e){if(!y(e))throw new Error("Must specify change and optional id");const{id:t,change:r}=e;if(!y(r)||Array.isArray(r))throw new Error("change must be a dictionary");if(void 0!==t&&"number"!=typeof t)throw new Error("if specified, id must be a number");return{change:r,id:t}}(JSON.parse(e))}function m(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function v(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const g="P",O="p";var j=e=>(t,r)=>async(n,i)=>{const a=await i.accept(),o=await t(n,i),s=await r(n,i),c=await e.subscribe(o,(e,t)=>{const r=void 0!==t?function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?m(Object(r),!0).forEach((function(t){v(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):m(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}({id:t},e):e;a.send(JSON.stringify(r))},s);c?(a.on("close",c.close),a.on("message",e=>{if(e===g)return void a.send(O);const t=w(e);i.beginTransaction(),c.send(t.change,t.id).finally(()=>i.endTransaction())}),a.send(JSON.stringify({change:["=",c.getInitialData()]}))):i.sendError(404)};const P=e=>e;class E{constructor(e,t,r,n=P,i=P){var a,o,s;this.collection=e,this.idCol=t,this.readErrorIntercept=n,this.writeErrorIntercept=i,s=void 0,(o="validate")in(a=this)?Object.defineProperty(a,o,{value:s,enumerable:!0,configurable:!0,writable:!0}):a[o]=s,this.validate=r}async read(e){try{return await this.collection.get(this.idCol,e)}catch(e){throw this.readErrorIntercept(e)}}async write(e,t,r){const n={};Object.keys(t).forEach(e=>{const i=e;t[i]!==r[i]&&(n[i]=t[i])});try{await this.collection.update(this.idCol,e,n)}catch(e){throw this.writeErrorIntercept(e)}}}class q extends Error{}function x(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}class S{constructor(e=(e=>e)){x(this,"validate",void 0),x(this,"memory",new Map),this.validate=e}set(e,t){this.memory.set(e,t)}get(e){return this.memory.get(e)}delete(e){this.memory.delete(e)}read(e){var t;return null!==(t=this.memory.get(e))&&void 0!==t?t:null}write(e,t,r){if(r!==this.memory.get(e))throw new Error("Unexpected previous value");this.memory.set(e,t)}}var C={validateWriteSpec(){throw new q("Cannot modify data")},validateWrite(){throw new q("Cannot modify data")}};class k{constructor(e=[]){this.readOnlyFields=e}validateWrite(e,t){Object.keys(t).forEach(t=>{const r=t;if(!Object.prototype.hasOwnProperty.call(e,r)&&this.readOnlyFields.includes(r))throw new q("Cannot remove field "+r)}),Object.keys(e).forEach(r=>{const n=r;if(this.readOnlyFields.includes(n)){if(!Object.prototype.hasOwnProperty.call(t,n))throw new q("Cannot add field "+n);if(e[n]!==t[n])throw new q("Cannot edit field "+n)}})}}}])}));
//# sourceMappingURL=index.js.map