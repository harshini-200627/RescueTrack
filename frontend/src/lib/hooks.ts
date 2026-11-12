import {useEffect,useState} from 'react';import {api,Incident,Responder} from './mockApi';
export function useData(){const[i,setI]=useState<Incident[]|null>(null);const[r,setR]=useState<Responder[]|null>(null);const load=()=>{api.incidents().then(setI);api.responders().then(setR)};useEffect(load,[]);return{inc:i,res:r,reload:load}}
export const byDay=(inc:Incident[],n=14)=>Array.from({length:n},(_,k)=>{const d=new Date(Date.now()-(n-1-k)*864e5);return{day:d.toLocaleDateString([],{month:'short',day:'numeric'}),count:inc.filter(x=>new Date(x.detectedAt).toDateString()===d.toDateString()).length}});
export const bySev=(inc:Incident[])=>(['Critical','Moderate','Minor'] as const).map(s=>({name:s,value:inc.filter(x=>x.severity===s).length}));
export const avgResp=(inc:Incident[])=>{const v=inc.filter(x=>x.responseMin!=null).map(x=>x.responseMin as number);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10:0};
