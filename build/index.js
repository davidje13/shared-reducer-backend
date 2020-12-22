!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("shared-reducer-backend",[],t):"object"==typeof exports?exports["shared-reducer-backend"]=t():e["shared-reducer-backend"]=t()}(global,(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=2)}([function(e,t){e.exports=require("crypto")},function(e,t){e.exports=require("events")},function(e,t,r){e.exports=r(3)},function(e,t,r){"use strict";r.r(t),r.d(t,"Broadcaster",(function(){return b})),r.d(t,"websocketHandler",(function(){return O})),r.d(t,"PING",(function(){return v})),r.d(t,"PONG",(function(){return g})),r.d(t,"InMemoryModel",(function(){return S})),r.d(t,"CollectionStorageModel",(function(){return P})),r.d(t,"PermissionError",(function(){return E})),r.d(t,"ReadOnly",(function(){return q})),r.d(t,"ReadWrite",(function(){return f})),r.d(t,"ReadWriteStruct",(function(){return C})),r.d(t,"AsyncTaskQueue",(function(){return u})),r.d(t,"TaskQueueMap",(function(){return d})),r.d(t,"InMemoryTopic",(function(){return h})),r.d(t,"TrackingTopicMap",(function(){return l})),r.d(t,"UniqueIdProvider",(function(){return s}));var n=r(0),i=r.n(n);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}class s{constructor(){o(this,"shared",i.a.randomBytes(8).toString("hex")),o(this,"unique",0)}get(){const e=this.unique;return this.unique+=1,`${this.shared}-${e}`}}var a=r(1);function c(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}class u extends a.EventEmitter{constructor(...e){super(...e),c(this,"queue",[]),c(this,"running",!1)}push(e){return new Promise((t,r)=>{this.queue.push({task:e,resolve:t,reject:r}),this.running||this.internalConsumeQueue()})}async internalConsumeQueue(){for(this.running=!0;this.queue.length>0;){const{task:e,resolve:t,reject:r}=this.queue.shift();let n=null,i=!1;try{n=await e(),i=!0}catch(e){r(e)}i&&t(n)}this.running=!1,this.emit("drain")}}class d{constructor(e=(()=>new u)){var t,r,n;this.queueFactory=e,t=this,r="queues",n=new Map,r in t?Object.defineProperty(t,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[r]=n}push(e,t){let r=this.queues.get(e);return r||(r=this.queueFactory(),r.on("drain",()=>{this.queues.delete(e)}),this.queues.set(e,r)),r.push(t)}}class l{constructor(e){var t,r,n;this.topicFactory=e,t=this,r="data",n=new Map,r in t?Object.defineProperty(t,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[r]=n}async add(e,t){let r=this.data.get(e);r||(r=this.topicFactory(e),this.data.set(e,r)),await r.add(t)}async remove(e,t){const r=this.data.get(e);if(r){await r.remove(t)||this.data.delete(e)}}async broadcast(e,t){const r=this.data.get(e);r&&await r.broadcast(t)}}class h{constructor(){var e,t,r;e=this,t="subscribers",r=new Set,t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r}add(e){this.subscribers.add(e)}remove(e){return this.subscribers.delete(e),this.subscribers.size>0}broadcast(e){this.subscribers.forEach(t=>t(e))}}var f={validateWrite(){}};class b{constructor(e,t,r,n,i){this.model=e,this.context=t,this.subscribers=r,this.taskQueues=n,this.idProvider=i}static for(e){let t,r,n,i;const o={withReducer:e=>(t=e,o),withSubscribers:e=>(r=e,o),withTaskQueues:e=>(n=e,o),withIdProvider:e=>(i=e,o),build(){if(!t)throw new Error("must set broadcaster context");return new b(e,t,r||new l(()=>new h),n||new d,i||new s)}};return o}async subscribe(e,t,r=f){let n=await this.model.read(e);if(null==n)return null;const i=this.idProvider.get(),o=({message:e,source:r,meta:n})=>{r===i?t(e,n):e.change&&t(e,void 0)};return this.subscribers.add(e,o),{getInitialData:()=>{if(null===n)throw new Error("Already fetched initialData");const e=n;return n=null,e},send:(t,n)=>this.internalQueueChange(e,t,r,i,n),close:async()=>{await this.subscribers.remove(e,o)}}}update(e,t,r=f){return this.internalQueueChange(e,t,r,null,void 0)}async internalApplyChange(e,t,r,n,i){try{var o;const n=await this.model.read(e);if(!n)throw new Error("Deleted");null===(o=r.validateWriteSpec)||void 0===o||o.call(r,t);const i=this.context.update(n,t),s=this.model.validate(i);r.validateWrite(s,n),await this.model.write(e,s,n)}catch(t){return void this.subscribers.broadcast(e,{message:{error:t.message},source:n,meta:i})}this.subscribers.broadcast(e,{message:{change:t},source:n,meta:i})}async internalQueueChange(e,t,r,n,i){return this.taskQueues.push(e,()=>this.internalApplyChange(e,t,r,n,i))}}function p(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function y(e){return function(e){if(!p(e))throw new Error("Must specify change and optional id");const{id:t,change:r}=e;if(!p(r))throw new Error("change must be a dictionary");if(void 0!==t&&"number"!=typeof t)throw new Error("if specified, id must be a number");return{change:r,id:t}}(JSON.parse(e))}function w(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function m(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const v="P",g="p";var O=e=>(t,r)=>async(n,i)=>{const o=await i.accept(),s=await t(n,i),a=await r(n,i),c=await e.subscribe(s,(e,t)=>{const r=void 0!==t?function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?w(Object(r),!0).forEach((function(t){m(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):w(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}({id:t},e):e;o.send(JSON.stringify(r))},a);c?(o.on("close",c.close),o.on("message",e=>{if(e===v)return void o.send(g);const t=y(e);i.beginTransaction(),c.send(t.change,t.id).finally(()=>i.endTransaction())}),o.send(JSON.stringify({init:c.getInitialData()}))):i.sendError(404)};const j=e=>e;class P{constructor(e,t,r,n=j,i=j){var o,s,a;this.collection=e,this.idCol=t,this.readErrorIntercept=n,this.writeErrorIntercept=i,a=void 0,(s="validate")in(o=this)?Object.defineProperty(o,s,{value:a,enumerable:!0,configurable:!0,writable:!0}):o[s]=a,this.validate=r}async read(e){try{return await this.collection.get(this.idCol,e)}catch(e){throw this.readErrorIntercept(e)}}async write(e,t,r){const n={};Object.entries(t).forEach(([e,t])=>{const i=e;t!==(Object.prototype.hasOwnProperty.call(r,i)?r[i]:void 0)&&(n[i]?Object.defineProperty(n,i,{value:t,configurable:!0,enumerable:!0,writable:!0}):n[i]=t)});try{await this.collection.update(this.idCol,e,n)}catch(e){throw this.writeErrorIntercept(e)}}}class E extends Error{}function x(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}class S{constructor(e=(e=>e)){x(this,"read",this.get),x(this,"validate",void 0),x(this,"memory",new Map),this.validate=e}set(e,t){this.memory.set(e,t)}get(e){return this.memory.get(e)}delete(e){this.memory.delete(e)}write(e,t,r){if(r!==this.memory.get(e))throw new Error("Unexpected previous value");this.memory.set(e,t)}}var q={validateWriteSpec(){throw new E("Cannot modify data")},validateWrite(){throw new E("Cannot modify data")}};class C{constructor(e=[]){this.readOnlyFields=e}validateWrite(e,t){Object.keys(t).forEach(t=>{const r=t;if(!Object.prototype.hasOwnProperty.call(e,r)&&this.readOnlyFields.includes(r))throw new E("Cannot remove field "+r)}),Object.keys(e).forEach(r=>{const n=r;if(this.readOnlyFields.includes(n)){if(!Object.prototype.hasOwnProperty.call(t,n))throw new E("Cannot add field "+n);if(e[n]!==t[n])throw new E("Cannot edit field "+n)}})}}}])}));
//# sourceMappingURL=index.js.map