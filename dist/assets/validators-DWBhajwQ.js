import{d as n}from"./index-Cj28tsjO.js";/**
 * @license lucide-react v0.354.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=n("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.354.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=n("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),u=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()),o=e=>{const t=e.trim();return t?t.length<3?"Full name must be at least 3 characters.":t.length>100?"Full name must be at most 100 characters.":/^[A-Za-z ]+$/.test(t)?"":"Full name can only contain letters and spaces.":"Full name is required."},m=e=>e?e.length<8?"Password must be at least 8 characters.":e.length>50?"Password must be at most 50 characters.":/[A-Z]/.test(e)?/[a-z]/.test(e)?/[0-9]/.test(e)?/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(e)?"":"Password must contain at least one special character.":"Password must contain at least one number.":"Password must contain at least one lowercase letter.":"Password must contain at least one uppercase letter.":"Password is required.",f=e=>{const t={length:e.length>=8,uppercase:/[A-Z]/.test(e),lowercase:/[a-z]/.test(e),number:/[0-9]/.test(e),special:/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(e)},r=Object.values(t).filter(Boolean).length;let a="Weak",s="bg-cyber-danger";return r===5?(a="Master Security",s="bg-cyber-success"):r>=4?(a="Strong",s="bg-cyber-secondary"):r>=3&&(a="Medium",s="bg-cyber-warning"),{reqs:t,score:r,label:a,color:s}};export{l as E,i as a,m as b,f as c,u as i,o as v};
